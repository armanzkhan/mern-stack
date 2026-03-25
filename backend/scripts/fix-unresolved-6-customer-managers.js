const path = require("path");
const mongoose = require("mongoose");

require("dotenv").config({ path: path.join(__dirname, "..", ".env") });
if (!process.env.CONNECTION_STRING && !process.env.MONGODB_URI) {
  require("dotenv").config({ path: path.join(__dirname, "..", "..", ".env") });
}

const Customer = require("../models/Customer");
const Manager = require("../models/Manager");
const User = require("../models/User");

const MONGODB_URI = process.env.CONNECTION_STRING || process.env.MONGODB_URI;
const COMPANY_ID = "RESSICHEM";

// The 6 unresolved rows mapped to intended customer + manager
const TARGETS = [
  { customerName: "AMAN ULLAH SB ( AFG )", managerEmail: "managerzepoxy@gmail.com" },
  { customerName: "JUNAID AHMED CO MANSOOR PAINTS & TILES", managerEmail: "tileadhesive@gmail.com" },
  { customerName: "SALEEM RAZA CO AHMED IRON STORE & CEMENT DEPO", managerEmail: "tileadhesive@gmail.com" },
  { customerName: "SHAKARGANJ FOOD PRODUCTS LIMITED", managerEmail: "managerzepoxy@gmail.com" },
  { customerName: "VEL COMMODITIES SINGAPORE PTE LTD", managerEmail: "managerothers@gmail.com" },
  { customerName: "WAQAS MAMDANI ( DIGITAL )", managerEmail: "manager@digital.com" },
];

function escRegex(s) {
  return String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

async function getManagerEntryByEmail(email) {
  const managerUser = await User.findOne({
    company_id: COMPANY_ID,
    email: String(email).toLowerCase(),
  }).lean();
  if (!managerUser) return null;

  const manager = await Manager.findOne({
    company_id: COMPANY_ID,
    user_id: managerUser.user_id,
    isActive: true,
  }).lean();
  if (!manager) return null;

  return { manager, managerUser };
}

async function assignOne(customerName, managerEmail) {
  const managerEntry = await getManagerEntryByEmail(managerEmail);
  if (!managerEntry) {
    return { ok: false, reason: `manager_not_found:${managerEmail}` };
  }

  const customer = await Customer.findOne({
    company_id: COMPANY_ID,
    $or: [
      { companyName: { $regex: `^${escRegex(customerName)}$`, $options: "i" } },
      { contactName: { $regex: `^${escRegex(customerName)}$`, $options: "i" } },
    ],
  });

  if (!customer) {
    return { ok: false, reason: `customer_not_found:${customerName}` };
  }

  const assignedAt = new Date();
  const managerId = managerEntry.manager._id;
  const assignedBy = managerEntry.managerUser._id;

  customer.assignedManager = {
    manager_id: managerId,
    assignedBy,
    assignedAt,
    isActive: true,
    notes: "Manual fix for unresolved assignment row",
  };
  customer.assignedManagers = [
    {
      manager_id: managerId,
      assignedBy,
      assignedAt,
      isActive: true,
      notes: "Manual fix for unresolved assignment row",
    },
  ];
  await customer.save();

  await User.updateOne(
    {
      company_id: COMPANY_ID,
      "customerProfile.customer_id": customer._id,
    },
    {
      $set: {
        "customerProfile.assignedManager": {
          manager_id: managerId,
          assignedBy,
          assignedAt,
          isActive: true,
        },
      },
    }
  );

  return { ok: true, customerId: String(customer._id), customerName: customer.companyName };
}

async function main() {
  if (!MONGODB_URI) {
    throw new Error("Missing CONNECTION_STRING / MONGODB_URI");
  }

  await mongoose.connect(MONGODB_URI);
  console.log("Connected");

  let okCount = 0;
  for (const t of TARGETS) {
    const res = await assignOne(t.customerName, t.managerEmail);
    if (res.ok) {
      okCount++;
      console.log(`OK: ${t.customerName} -> ${t.managerEmail}`);
    } else {
      console.log(`FAILED: ${t.customerName} -> ${t.managerEmail} (${res.reason})`);
    }
  }

  console.log(`Done. Updated ${okCount}/${TARGETS.length}`);
  await mongoose.disconnect();
}

if (require.main === module) {
  main().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}

