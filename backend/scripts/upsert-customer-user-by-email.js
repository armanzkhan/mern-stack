/**
 * Upsert a customer + linked user by email.
 *
 * Run:
 *   node scripts/upsert-customer-user-by-email.js "Name" "email@gmail.com" "Password@123" "Address..." "SINDH" "0300-0000000"
 */
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Customer = require("../models/Customer");
const User = require("../models/User");

const nameArg = process.argv[2];
const emailArg = process.argv[3];
const passwordArg = process.argv[4];
const addressArg = process.argv[5];
const stateArg = process.argv[6];
const phoneArg = process.argv[7];

if (!nameArg || !emailArg || !passwordArg || !addressArg || !stateArg) {
  console.error("❌ Provide name, email, password, address, and state.");
  process.exit(1);
}

const uri =
  process.env.CONNECTION_STRING ||
  process.env.MONGODB_URI ||
  "mongodb+srv://armanzaman4_db_user:1JJORz7jP2VFgTaP@cluster0.qn1babq.mongodb.net/Ressichem?retryWrites=true&w=majority";

const COMPANY_ID = "RESSICHEM";
const COUNTRY = "Pakistan";

function extractCity(address, state) {
  const lower = address.toLowerCase();
  const cities = ["karachi", "lahore", "islamabad", "rawalpindi", "peshawar", "quetta", "faisalabad", "gujranwala", "sialkot", "hyderabad", "multan"];
  for (const city of cities) {
    if (lower.includes(city)) return city.charAt(0).toUpperCase() + city.slice(1);
  }
  if (state === "SINDH") return "Karachi";
  if (state === "PUNJAB") return "Lahore";
  if (state === "KPK") return "Peshawar";
  if (state === "BALOCHISTAN") return "Quetta";
  return "Pakistan";
}

async function run() {
  await mongoose.connect(uri, { dbName: "Ressichem" });
  const name = String(nameArg).trim();
  const email = String(emailArg).toLowerCase();
  const password = String(passwordArg);
  const address = String(addressArg).trim();
  const state = String(stateArg).trim().toUpperCase();
  const phone = phoneArg ? String(phoneArg).trim() : "0300-0000000";

  let customer = await Customer.findOne({
    company_id: COMPANY_ID,
    $or: [{ email }, { companyName: { $regex: new RegExp(`^${name}$`, "i") } }],
  });

  if (!customer) {
    customer = new Customer({
      companyName: name,
      contactName: name,
      email,
      phone,
      street: address,
      city: extractCity(address, state),
      state,
      country: COUNTRY,
      company_id: COMPANY_ID,
      status: "active",
      customerType: "regular",
    });
    await customer.save();
    console.log("✅ Customer created:", customer._id);
  } else {
    if (customer.email !== email) {
      customer.email = email;
    }
    if (!customer.phone && phone) {
      customer.phone = phone;
    }
    if (!customer.street && address) {
      customer.street = address;
    }
    if (!customer.state && state) {
      customer.state = state;
    }
    await customer.save();
    console.log("✅ Customer updated:", customer._id);
  }

  let user = await User.findOne({ email, company_id: COMPANY_ID });
  const hashedPassword = await bcrypt.hash(password, 10);

  if (!user) {
    const nameParts = name.split(/\s+/);
    const firstName = nameParts[0] || "Customer";
    const lastName = nameParts.slice(1).join(" ") || "User";
    user = new User({
      user_id: `customer_${customer._id}`,
      email,
      password: hashedPassword,
      firstName,
      lastName,
      phone: customer.phone,
      role: "Customer",
      department: "Customer",
      company_id: COMPANY_ID,
      isCustomer: true,
      isActive: true,
      customerProfile: {
        customer_id: customer._id,
        companyName: customer.companyName,
        customerType: customer.customerType || "regular",
      },
    });
    await user.save();
    console.log("✅ User created:", user._id);
  } else {
    user.password = hashedPassword;
    await user.save();
    console.log("✅ User password updated:", user._id);
  }

  if (!customer.user_id || customer.user_id.toString() !== user._id.toString()) {
    customer.user_id = user._id;
    await customer.save();
    console.log("✅ Linked customer to user");
  }

  await mongoose.disconnect();
}

run().catch((err) => {
  console.error("❌ Error:", err);
  process.exit(1);
});
