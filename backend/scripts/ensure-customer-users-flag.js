/**
 * Set isCustomer: true for all users that have role "Customer" (string).
 * Run this so customer users get isCustomer in the JWT and can create orders.
 *
 * Run from backend:
 *   node scripts/ensure-customer-users-flag.js
 */
require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });
const mongoose = require("mongoose");
const User = require("../models/User");

const uri = process.env.CONNECTION_STRING?.trim() || process.env.MONGODB_URI || "";
const dbName = process.env.MONGODB_DB_NAME || "Testing";

async function run() {
  if (!uri) {
    console.error("Set CONNECTION_STRING or MONGODB_URI in backend/.env");
    process.exit(1);
  }
  await mongoose.connect(uri, { dbName });
  const result = await User.updateMany(
    { role: /^Customer$/i },
    { $set: { isCustomer: true } }
  );
  console.log("Updated isCustomer=true for", result.modifiedCount, "users with role 'Customer'.");
  await mongoose.disconnect();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
