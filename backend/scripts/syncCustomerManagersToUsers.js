require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/User");
const Customer = require("../models/Customer");

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);

  const users = await User.find({ isCustomer: true })
    .select("_id email customerProfile")
    .lean();

  const customerUsers = users.filter((u) => Boolean(u?.customerProfile?.customer_id));
  const customerIds = customerUsers.map((u) => String(u.customerProfile.customer_id));
  const customers = await Customer.find({ _id: { $in: customerIds } })
    .select("_id assignedManager assignedManagers")
    .lean();
  const customerById = new Map(customers.map((c) => [String(c._id), c]));

  let missingBefore = 0;
  let syncable = 0;
  let updated = 0;

  for (const user of customerUsers) {
    const hasUserManager = Boolean(user?.customerProfile?.assignedManager?.manager_id);
    if (!hasUserManager) missingBefore += 1;

    const customer = customerById.get(String(user.customerProfile.customer_id));
    if (!customer) continue;

    const fallback =
      customer?.assignedManager?.manager_id
        ? customer.assignedManager
        : Array.isArray(customer?.assignedManagers)
        ? customer.assignedManagers.find(
            (am) => am?.manager_id && am?.isActive !== false
          )
        : null;

    if (!fallback?.manager_id || hasUserManager) continue;
    syncable += 1;

    await User.updateOne(
      { _id: user._id },
      {
        $set: {
          "customerProfile.assignedManager.manager_id": fallback.manager_id,
          "customerProfile.assignedManager.assignedBy": fallback.assignedBy || null,
          "customerProfile.assignedManager.assignedAt":
            fallback.assignedAt || new Date(),
          "customerProfile.assignedManager.isActive":
            fallback.isActive !== false,
        },
      }
    );
    updated += 1;
  }

  const usersAfter = await User.find({ isCustomer: true })
    .select("customerProfile")
    .lean();
  const missingAfter = usersAfter.filter(
    (u) =>
      Boolean(u?.customerProfile?.customer_id) &&
      !u?.customerProfile?.assignedManager?.manager_id
  ).length;

  console.log(
    JSON.stringify(
      {
        customerUsers: customerUsers.length,
        missingBefore,
        syncable,
        updated,
        missingAfter,
      },
      null,
      2
    )
  );

  await mongoose.disconnect();
}

run().catch(async (error) => {
  console.error(error);
  try {
    await mongoose.disconnect();
  } catch (_) {}
  process.exit(1);
});
