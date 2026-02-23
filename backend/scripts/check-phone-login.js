/**
 * Check user/customer by phone (login debugging).
 *
 * Run:
 *   cd Ressichem/backend/backend
 *   node scripts/check-phone-login.js "0301-5481922"
 */
const mongoose = require("mongoose");
const User = require("../models/User");
const Customer = require("../models/Customer");

const phoneArg = process.argv[2];
if (!phoneArg) {
  console.error("❌ Please provide a phone number.");
  process.exit(1);
}

const uri =
  process.env.CONNECTION_STRING ||
  process.env.MONGODB_URI ||
  "mongodb+srv://armanzaman4_db_user:1JJORz7jP2VFgTaP@cluster0.qn1babq.mongodb.net/Ressichem?retryWrites=true&w=majority";

async function run() {
  await mongoose.connect(uri, { dbName: "Ressichem" });
  const normalized = phoneArg.replace(/[^\d+]/g, "");

  const users = await User.find(
    { $or: [{ phone: phoneArg }, { phone: normalized }] },
    { email: 1, phone: 1, isCustomer: 1, user_id: 1 }
  ).lean();

  const customers = await Customer.find(
    { $or: [{ phone: phoneArg }, { phone: normalized }] },
    { companyName: 1, contactName: 1, phone: 1, email: 1, user_id: 1 }
  ).lean();

  console.log("Phone input:", phoneArg);
  console.log("Normalized:", normalized);
  console.log("Users:", users);
  console.log("Customers:", customers);

  await mongoose.disconnect();
}

run().catch((err) => {
  console.error("❌ Error:", err);
  process.exit(1);
});
