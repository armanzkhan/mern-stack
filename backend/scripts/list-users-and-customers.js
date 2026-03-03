/**
 * List Users and Customers: phone, email (and note about passwords).
 * Run from backend: node scripts/list-users-and-customers.js
 *
 * Requires .env with CONNECTION_STRING or MONGODB_URI.
 * Passwords are stored as one-way hashes and CANNOT be retrieved or displayed.
 */

require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });
const mongoose = require("mongoose");

const User = require("../models/User");
const Customer = require("../models/Customer");

const uri =
  process.env.CONNECTION_STRING?.trim() ||
  process.env.MONGODB_URI ||
  "";
const dbName = process.env.MONGODB_DB_NAME || "Testing";

async function run() {
  if (!uri) {
    console.error("Set CONNECTION_STRING or MONGODB_URI in backend/.env");
    process.exit(1);
  }

  await mongoose.connect(uri, { dbName });
  console.log("Connected to DB:", dbName);
  console.log("");

  try {
    // --- Users (login accounts: email, phone; password is hashed) ---
    const users = await User.find({})
      .select("email phone firstName lastName isActive isCustomer isManager company_id")
      .lean();
    console.log("=== USERS (login accounts) ===");
    console.log("(Passwords are stored as one-way hashes and cannot be displayed.)\n");
    if (!users.length) {
      console.log("  (none)");
    } else {
      users.forEach((u, i) => {
        console.log(`  ${i + 1}. ${u.firstName || ""} ${u.lastName || ""}`.trim() || "  (no name)");
        console.log(`     email: ${u.email || "(none)"}`);
        console.log(`     phone: ${u.phone || "(none)"}`);
        console.log(`     password: (hashed - cannot be retrieved)`);
        console.log(`     company_id: ${u.company_id || "(none)"} | active: ${u.isActive}`);
        console.log("");
      });
    }

    // --- Customers (company contacts: no login password on this model) ---
    const customers = await Customer.find({})
      .select("contactName companyName email phone status company_id")
      .lean();
    console.log("=== CUSTOMERS (company contacts) ===");
    console.log("(Customer records do not store a login password; login is via linked User account.)\n");
    if (!customers.length) {
      console.log("  (none)");
    } else {
      customers.forEach((c, i) => {
        console.log(`  ${i + 1}. ${c.contactName || "(no name)"} @ ${c.companyName || "(no company)"}`);
        console.log(`     email: ${c.email || "(none)"}`);
        console.log(`     phone: ${c.phone || "(none)"}`);
        console.log(`     status: ${c.status || "—"} | company_id: ${c.company_id || "(none)"}`);
        console.log("");
      });
    }
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected.");
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
