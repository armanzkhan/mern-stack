/**
 * Fix managers whose `assignedCategories` is empty by copying the category set
 * from a template manager that already has categories.
 *
 * Why:
 * - Customer product access is filtered using `customer.assignedManager.manager_id.assignedCategories`
 * - If a manager has 0 categories, customers appear to have "no access / failures"
 *
 * What this script does:
 * 1) Find active managers with empty `assignedCategories`
 * 2) Pick a template manager with non-empty categories
 * 3) Update each empty manager:
 *    - `manager.assignedCategories` populated from template categories
 *    - corresponding `User.managerProfile.assignedCategories` synced
 *    - create/replace `CategoryAssignment` rows for those categories
 */

const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const mongoose = require("mongoose");
const Manager = require("../models/Manager");
const CategoryAssignment = require("../models/CategoryAssignment");
const managerSyncService = require("../services/managerSyncService");

const COMPANY_ID = "RESSICHEM";

function normalizeCategoryEntry(cat) {
  if (!cat) return null;
  if (typeof cat === "string") return { category: cat, assignedBy: null };
  return {
    category: cat.category || "",
    assignedBy: cat.assignedBy || null,
  };
}

async function main() {
  const MONGODB_URI = process.env.CONNECTION_STRING || process.env.MONGODB_URI;
  if (!MONGODB_URI) throw new Error("Missing CONNECTION_STRING / MONGODB_URI");

  await mongoose.connect(MONGODB_URI);

  const activeManagers = await Manager.find({
    company_id: COMPANY_ID,
    isActive: true,
  }).lean();

  const emptyManagers = activeManagers.filter(
    (m) => !Array.isArray(m.assignedCategories) || m.assignedCategories.length === 0
  );

  if (emptyManagers.length === 0) {
    console.log("✅ No active managers with empty assignedCategories found.");
    await mongoose.disconnect();
    return;
  }

  const templateManager = activeManagers.find(
    (m) => Array.isArray(m.assignedCategories) && m.assignedCategories.length > 0
  );

  if (!templateManager) {
    throw new Error("No template manager found with non-empty assignedCategories.");
  }

  const templateCategories = (templateManager.assignedCategories || [])
    .map(normalizeCategoryEntry)
    .filter(Boolean)
    .filter((x) => x.category);

  const templateAssignedBy = templateManager.assignedCategories?.[0]?.assignedBy || null;
  if (!templateAssignedBy) {
    throw new Error(
      "Template manager categories are missing `assignedBy`, cannot populate CategoryAssignment.assignedBy"
    );
  }

  console.log(
    "Fixing managers with empty assignedCategories:",
    emptyManagers.map((m) => ({ managerId: String(m._id), email: m.user_id }))
  );

  let fixedCount = 0;

  for (const manager of emptyManagers) {
    const managerId = manager._id;

    // Update manager.assignedCategories
    const newAssignedCategories = templateCategories.map((c) => ({
      category: c.category,
      assignedBy: templateAssignedBy,
      assignedAt: new Date(),
      isActive: true,
    }));

    await Manager.updateOne(
      { _id: managerId },
      { $set: { assignedCategories: newAssignedCategories } }
    );

    // Sync to User.managerProfile
    await managerSyncService.syncManagerToUser(managerId, COMPANY_ID);

    // Refresh CategoryAssignment rows for this manager
    await CategoryAssignment.deleteMany({ manager_id: managerId, company_id: COMPANY_ID });

    for (const c of templateCategories) {
      await CategoryAssignment.create({
        manager_id: managerId,
        user_id: manager.user_id,
        company_id: COMPANY_ID,
        category: c.category,
        assignedBy: templateAssignedBy,
        assignedAt: new Date(),
        isActive: true,
        isPrimary: true,
        permissions: {
          canUpdateStatus: true,
          canAddComments: true,
          canViewReports: true,
          canManageStock: true,
          canApproveOrders: true,
        },
      });
    }

    fixedCount++;
    console.log(
      `✅ Fixed manager ${String(managerId)} (${fixedCount}/${emptyManagers.length}) - assigned ${templateCategories.length} categories`
    );
  }

  await mongoose.disconnect();
  console.log("🎉 Done. Fixed managers:", fixedCount);
}

if (require.main === module) {
  main().catch((err) => {
    console.error("❌ Failed:", err);
    process.exit(1);
  });
}

