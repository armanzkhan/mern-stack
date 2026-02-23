/**
 * Find customers by partial name (company/contact).
 *
 * Run:
 *   node scripts/find-customer-by-name.js "NAVEED ( DIGITAL )"
 */
const mongoose = require("mongoose");
const Customer = require("../models/Customer");

const term = process.argv[2];
if (!term) {
  console.error("❌ Please provide a search term.");
  process.exit(1);
}

const uri =
  process.env.CONNECTION_STRING ||
  process.env.MONGODB_URI ||
  "mongodb+srv://armanzaman4_db_user:1JJORz7jP2VFgTaP@cluster0.qn1babq.mongodb.net/Ressichem?retryWrites=true&w=majority";

async function run() {
  await mongoose.connect(uri, { dbName: "Ressichem" });
  const regex = new RegExp(term, "i");

  const customers = await Customer.find(
    { $or: [{ companyName: regex }, { contactName: regex }] },
    { companyName: 1, contactName: 1, email: 1, phone: 1, user_id: 1 }
  )
    .limit(10)
    .lean();

  console.log("Matches:", customers);
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error("❌ Error:", err);
  process.exit(1);
});
