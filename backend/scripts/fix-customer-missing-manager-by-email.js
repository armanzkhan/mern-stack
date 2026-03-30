/**
 * Fix a customer whose assignedManager exists but `manager_id` is missing.
 *
 * Usage:
 *   node backend/scripts/fix-customer-missing-manager-by-email.js <customerEmail> <managerEmail>
 *
 * What it fixes:
 * - Customer.assignedManager.manager_id
 * - Customer.assignedManagers[] (array variant)
 * - User.customerProfile.assignedManager.manager_id
 */

const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const mongoose = require("mongoose");
const Customer = require("../models/Customer");
const Manager = require("../models/Manager");
const User = require("../models/User");
const managerSyncService = require("../services/managerSyncService");

const COMPANY_ID = "RESSICHEM";

function requireArg(name) {
  const value = process.argv.findIndex((a) => a === name);
  return value >= 0 ? process.argv[value + 1] : null;
}

function getArgs() {
  // Simple positional args
  const [customerEmail, managerEmail] = process.argv.slice(2);
  if (!customerEmail || !managerEmail) {
    console.log(
      "Usage: node backend/scripts/fix-customer-missing-manager-by-email.js <customerEmail> <managerEmail>"
    );
    process.exit(1);
  }
  return { customerEmail: String(customerEmail).toLowerCase(), managerEmail: String(managerEmail).toLowerCase() };
}

async function main() {
  const { customerEmail, managerEmail } = getArgs();

  const MONGODB_URI = process.env.CONNECTION_STRING || process.env.MONGODB_URI;
  if (!MONGODB_URI) throw new Error("Missing CONNECTION_STRING / MONGODB_URI in .env");

  await mongoose.connect(MONGODB_URI);

  const customer = await Customer.findOne({ company_id: COMPANY_ID, email: customerEmail }).lean();
  if (!customer) {
    console.log(`❌ Customer not found for email: ${customerEmail}`);
    await mongoose.disconnect();
    return;
  }

  const before = customer.assignedManager || null;
  console.log("Before assignedManager:", before);

  const managerUser = await User.findOne({ company_id: COMPANY_ID, email: managerEmail }).lean();
  if (!managerUser) {
    throw new Error(`Manager user not found for email: ${managerEmail}`);
  }

  const managerRecord = await Manager.findOne({
    company_id: COMPANY_ID,
    user_id: managerUser.user_id,
    isActive: true,
  }).lean();

  if (!managerRecord) {
    throw new Error(`Manager record not found for manager user_id: ${managerUser.user_id}`);
  }

  const assignedAt = customer.assignedManager?.assignedAt || new Date();
  const assignedBy = customer.assignedManager?.assignedBy || managerUser._id;
  const notes = customer.assignedManager?.notes || `Auto fix: missing manager_id (from ${managerEmail})`;

  const newAssignedManager = {
    manager_id: managerRecord._id,
    assignedBy,
    assignedAt,
    isActive: true,
    notes,
  };

  const newAssignedManagersArray = [
    {
      manager_id: managerRecord._id,
      assignedBy,
      assignedAt,
      isActive: true,
      notes,
    },
  ];

  // Update Customer (both legacy + array variants)
  await Customer.updateOne(
    { _id: customer._id },
    {
      $set: {
        assignedManager: newAssignedManager,
        assignedManagers: newAssignedManagersArray,
      },
    }
  );

  // Update User.customerProfile
  const updateUserRes = await User.updateOne(
    { company_id: COMPANY_ID, "customerProfile.customer_id": customer._id },
    {
      $set: {
        "customerProfile.assignedManager": {
          manager_id: managerRecord._id,
          assignedBy,
          assignedAt,
          isActive: true,
        },
      },
    }
  );

  // Optional: ensure manager's categories are synced to its own User.managerProfile
  // (this doesn't affect customer assignment, but prevents category-related issues)
  await managerSyncService.syncManagerToUser(managerRecord._id, COMPANY_ID);

  // Verify
  const updatedCustomer = await Customer.findById(customer._id)
    .populate("assignedManager.manager_id", "assignedCategories isActive user_id")
    .populate("assignedManagers.manager_id", "assignedCategories isActive user_id")
    .lean();

  console.log("UpdateUser matched/modified:", updateUserRes.matchedCount, updateUserRes.modifiedCount);
  console.log("After assignedManager.manager_id:", updatedCustomer?.assignedManager?.manager_id?._id || updatedCustomer?.assignedManager?.manager_id);
  console.log(
    "After manager categories length:",
    updatedCustomer?.assignedManager?.manager_id?.assignedCategories?.length || 0
  );

  await mongoose.disconnect();
}

main()
  .then(() => process.exit(0))
  .catch(async (e) => {
    console.error("❌ Failed:", e);
    process.exit(1);
  });

