/**
 * Update customer + linked user email by company/contact name.
 *
 * Run:
 *   cd Ressichem/backend/backend
 *   node scripts/update-customer-email.js "VEL COMMODITIES SINGAPORE PTE LTD" "velcommoditiessingaporepteltd@gmail.com"
 */
const mongoose = require("mongoose");
const Customer = require("../models/Customer");
const User = require("../models/User");

const nameArg = process.argv[2];
const emailArg = process.argv[3];

if (!nameArg || !emailArg) {
  console.error("❌ Provide name and email.");
  process.exit(1);
}

const uri =
  process.env.CONNECTION_STRING ||
  process.env.MONGODB_URI ||
  "mongodb+srv://armanzaman4_db_user:1JJORz7jP2VFgTaP@cluster0.qn1babq.mongodb.net/Ressichem?retryWrites=true&w=majority";

async function run() {
  await mongoose.connect(uri, { dbName: "Ressichem" });
  const email = String(emailArg).toLowerCase();
  const name = String(nameArg).trim();

  const customer = await Customer.findOne({
    $or: [
      { companyName: { $regex: new RegExp(`^${name}$`, "i") } },
      { contactName: { $regex: new RegExp(`^${name}$`, "i") } },
    ],
  });

  if (!customer) {
    console.log("❌ Customer not found for name:", name);
    await mongoose.disconnect();
    process.exit(1);
  }

  // Ensure email not already used by another customer
  const existingCustomer = await Customer.findOne({
    email,
    _id: { $ne: customer._id },
  });
  if (existingCustomer) {
    console.log("❌ Email already used by another customer:", existingCustomer._id);
    await mongoose.disconnect();
    process.exit(1);
  }

  // Update customer email
  customer.email = email;
  await customer.save();

  // Update linked user email if exists
  let userUpdated = false;
  if (customer.user_id) {
    const existingUser = await User.findOne({
      email,
      _id: { $ne: customer.user_id },
    });
    if (existingUser) {
      console.log("❌ Email already used by another user:", existingUser._id);
      await mongoose.disconnect();
      process.exit(1);
    }
    await User.updateOne({ _id: customer.user_id }, { $set: { email } });
    userUpdated = true;
  }

  console.log("✅ Customer updated:", customer._id);
  console.log("✅ Email set to:", email);
  console.log("User updated:", userUpdated);

  await mongoose.disconnect();
}

run().catch((err) => {
  console.error("❌ Error:", err);
  process.exit(1);
});
