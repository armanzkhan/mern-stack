/**
 * Check user/customer by email (login debugging).
 *
 * Run:
 *   cd Ressichem/backend/backend
 *   node scripts/check-email-login.js "velcommoditiessingaporepteltd@gmail.com"
 */
const mongoose = require("mongoose");
const User = require("../models/User");
const Customer = require("../models/Customer");

const emailArg = process.argv[2];
if (!emailArg) {
  console.error("❌ Please provide an email address.");
  process.exit(1);
}

const uri =
  process.env.CONNECTION_STRING ||
  process.env.MONGODB_URI ||
  "mongodb+srv://armanzaman4_db_user:1JJORz7jP2VFgTaP@cluster0.qn1babq.mongodb.net/Ressichem?retryWrites=true&w=majority";

async function run() {
  await mongoose.connect(uri, { dbName: "Ressichem" });
  const email = String(emailArg).toLowerCase();

  const users = await User.find(
    { email },
    { email: 1, phone: 1, isCustomer: 1, user_id: 1 }
  ).lean();

  const customers = await Customer.find(
    { email },
    { companyName: 1, contactName: 1, phone: 1, email: 1, user_id: 1 }
  ).lean();

  console.log("Email:", email);
  console.log("Users:", users);
  console.log("Customers:", customers);

  await mongoose.disconnect();
}

run().catch((err) => {
  console.error("❌ Error:", err);
  process.exit(1);
});
