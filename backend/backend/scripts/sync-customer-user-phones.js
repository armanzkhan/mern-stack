/**
 * Sync User.phone from Customer.phone for customers with linked user_id.
 *
 * Run:
 *   cd Ressichem/backend/backend
 *   node scripts/sync-customer-user-phones.js
 */
const mongoose = require("mongoose");
const Customer = require("../models/Customer");
const User = require("../models/User");

const uri =
  process.env.CONNECTION_STRING ||
  process.env.MONGODB_URI ||
  "mongodb+srv://armanzaman4_db_user:1JJORz7jP2VFgTaP@cluster0.qn1babq.mongodb.net/Ressichem?retryWrites=true&w=majority";

async function run() {
  await mongoose.connect(uri, { dbName: "Ressichem" });

  const customers = await Customer.find({ user_id: { $exists: true, $ne: null } })
    .select("user_id phone")
    .lean();

  const userIds = customers.map((c) => c.user_id);
  const users = await User.find({ _id: { $in: userIds } })
    .select("_id phone")
    .lean();
  const userMap = new Map(users.map((u) => [String(u._id), u]));

  const ops = [];
  let updated = 0;
  let unchanged = 0;
  let missingUser = 0;

  for (const customer of customers) {
    const user = userMap.get(String(customer.user_id));
    if (!user) {
      missingUser++;
      continue;
    }
    const customerPhone = customer.phone || "";
    const userPhone = user.phone || "";
    if (customerPhone && customerPhone !== userPhone) {
      ops.push({
        updateOne: {
          filter: { _id: user._id },
          update: { $set: { phone: customerPhone } },
        },
      });
      updated++;
    } else {
      unchanged++;
    }
  }

  if (ops.length > 0) {
    const result = await User.bulkWrite(ops);
    console.log(`✅ Updated ${result.modifiedCount} users`);
  }

  console.log("\n📊 SUMMARY");
  console.log("==========");
  console.log(`Customers with user_id:     ${customers.length}`);
  console.log(`Updated user phones:        ${updated}`);
  console.log(`Unchanged:                  ${unchanged}`);
  console.log(`Missing user records:       ${missingUser}`);

  await mongoose.disconnect();
}

run().catch((err) => {
  console.error("❌ Sync failed:", err);
  process.exit(1);
});
