require("dotenv").config();
const mongoose = require("mongoose");

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  const col = mongoose.connection.db.collection("orders");

  // Force persisted keys on each line item even in legacy docs.
  await col.updateMany(
    {},
    [
      {
        $set: {
          items: {
            $map: {
              input: { $ifNull: ["$items", []] },
              as: "it",
              in: {
                $mergeObjects: [
                  "$$it",
                  {
                    deliveryCharges: { $ifNull: ["$$it.deliveryCharges", 0] },
                    biltyCharges: { $ifNull: ["$$it.biltyCharges", 0] },
                  },
                ],
              },
            },
          },
        },
      },
    ]
  );

  const cursor = col.find(
    {},
    {
      projection: {
        items: 1,
        tax: 1,
        totalDiscount: 1,
        subtotal: 1,
        deliveryCharges: 1,
        biltyCharges: 1,
        total: 1,
        finalTotal: 1,
        logisticsRemarks: 1,
      },
    }
  );

  let ordersTouched = 0;
  let itemsPatched = 0;
  let remarksPatched = 0;
  let totalFieldsPatched = 0;

  while (await cursor.hasNext()) {
    const order = await cursor.next();
    let changed = false;
    let subtotal = 0;
    let delivery = 0;
    let bilty = 0;
    const items = Array.isArray(order.items) ? order.items : [];

    for (const item of items) {
      const hasDelivery = Object.prototype.hasOwnProperty.call(
        item,
        "deliveryCharges"
      );
      const hasBilty = Object.prototype.hasOwnProperty.call(item, "biltyCharges");
      const itemDelivery = hasDelivery ? Number(item.deliveryCharges || 0) : 0;
      const itemBilty = hasBilty ? Number(item.biltyCharges || 0) : 0;

      if (!hasDelivery) {
        item.deliveryCharges = 0;
        changed = true;
        itemsPatched += 1;
      }
      if (!hasBilty) {
        item.biltyCharges = 0;
        changed = true;
        itemsPatched += 1;
      }

      const qty = Number(item.quantity || 0);
      const unit = Number(item.unitPrice || 0);
      const computed = qty * unit + itemDelivery + itemBilty;
      if (Number(item.total) !== computed) {
        item.total = computed;
        changed = true;
      }

      subtotal += computed;
      delivery += itemDelivery;
      bilty += itemBilty;
    }

    const tax = Number(order.tax || 0);
    const totalDiscount = Number(order.totalDiscount || 0);
    const total = subtotal + tax;
    const finalTotal = total - totalDiscount;

    if (Number(order.subtotal) !== subtotal) {
      changed = true;
      totalFieldsPatched += 1;
    }
    if (Number(order.deliveryCharges) !== delivery) {
      changed = true;
      totalFieldsPatched += 1;
    }
    if (Number(order.biltyCharges) !== bilty) {
      changed = true;
      totalFieldsPatched += 1;
    }
    if (Number(order.total) !== total) {
      changed = true;
      totalFieldsPatched += 1;
    }
    if (Number(order.finalTotal) !== finalTotal) {
      changed = true;
      totalFieldsPatched += 1;
    }

    const remarks = Array.isArray(order.logisticsRemarks) ? order.logisticsRemarks : [];
    for (const remark of remarks) {
      if (
        remark &&
        remark.status === "partial_shipment" &&
        (!Array.isArray(remark.partialShipmentItems) ||
          remark.partialShipmentItems.length === 0)
      ) {
        remark.partialShipmentItems = items.map((it) => ({
          productId: it.product || null,
          productName: it.productName || it.name || "Item",
          orderedQuantity: Number(it.quantity || 0),
          shippedQuantity: 0,
          remainingQuantity: Number(it.quantity || 0),
        }));
        changed = true;
        remarksPatched += 1;
      }
    }

    if (changed) {
      await col.updateOne(
        { _id: order._id },
        {
          $set: {
            items,
            subtotal,
            deliveryCharges: delivery,
            biltyCharges: bilty,
            total,
            finalTotal,
            logisticsRemarks: remarks,
          },
        }
      );
      ordersTouched += 1;
    }
  }

  console.log(
    JSON.stringify({ ordersTouched, itemsPatched, remarksPatched, totalFieldsPatched })
  );
  await mongoose.disconnect();
}

run().catch(async (err) => {
  console.error(err);
  try {
    await mongoose.disconnect();
  } catch (e) {}
  process.exit(1);
});
