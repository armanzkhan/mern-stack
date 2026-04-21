const ProductCategory = require("../models/ProductCategory");
const Manager = require("../models/Manager");
const User = require("../models/User");
const notificationService = require("../services/notificationService");

function escapeRegex(value) {
  return String(value || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function parseSubCategories(input) {
  if (!Array.isArray(input)) return [];
  return input
    .map((item) => String(item || "").trim())
    .filter(Boolean)
    .filter((item, index, arr) => arr.findIndex((x) => x.toLowerCase() === item.toLowerCase()) === index);
}

async function recalculateChildPaths(parentCategory) {
  const children = await ProductCategory.find({
    parent: parentCategory._id,
    isActive: true,
  });

  for (const child of children) {
    const expectedPath = `${parentCategory.path} > ${child.name}`;
    if (child.path !== expectedPath) {
      child.path = expectedPath;
      await child.save();
    }
    await recalculateChildPaths(child);
  }
}

async function isParentInCategorySubtree(parentCategoryId, categoryId) {
  let currentId = parentCategoryId;
  while (currentId) {
    if (String(currentId) === String(categoryId)) return true;
    const doc = await ProductCategory.findById(currentId).select("parent");
    if (!doc || !doc.parent) return false;
    currentId = doc.parent;
  }
  return false;
}

async function addSubCategoryToParent(parentId, childName) {
  if (!parentId || !childName) return;
  const parentDoc = await ProductCategory.findById(parentId);
  if (!parentDoc) return;
  const parentSubs = Array.isArray(parentDoc.subCategories) ? parentDoc.subCategories : [];
  if (!parentSubs.some((sub) => String(sub).toLowerCase() === String(childName).toLowerCase())) {
    parentDoc.subCategories = [...parentSubs, childName];
    await parentDoc.save();
  }
}

async function removeSubCategoryFromParent(parentId, childName) {
  if (!parentId || !childName) return;
  const parentDoc = await ProductCategory.findById(parentId);
  if (!parentDoc || !Array.isArray(parentDoc.subCategories)) return;
  parentDoc.subCategories = parentDoc.subCategories.filter(
    (sub) => String(sub).toLowerCase() !== String(childName).toLowerCase()
  );
  await parentDoc.save();
}

// Get all product categories
exports.getAllCategories = async (req, res) => {
  try {
    console.log("🔍 getAllCategories controller called");
    console.log("🔍 User from auth:", req.user);
    const includeInactive =
      String(req.query?.includeInactive || "").toLowerCase() === "true" ||
      String(req.query?.includeInactive || "") === "1";
    const filter = includeInactive ? {} : { isActive: true };
    const categories = await ProductCategory.find(filter).sort({ name: 1 });
    console.log("✅ Categories found:", categories.length);
    res.json(categories);
  } catch (err) {
    console.error("Get all categories error:", err);
    console.error("Error details:", err.message);
    console.error("Error stack:", err.stack);
    res.status(500).json({ message: "Error fetching categories", error: err.message });
  }
};

// Create new category
exports.createCategory = async (req, res) => {
  try {
    const rawName = String(req.body?.name || "").trim();
    const level = Number(req.body?.level || 1);
    const parentId = req.body?.parent || null;
    const parsedSubCategories = parseSubCategories(req.body?.subCategories);

    if (!rawName) {
      return res.status(400).json({ message: "Category name is required" });
    }

    if (![1, 2, 3].includes(level)) {
      return res.status(400).json({ message: "Category level must be 1, 2, or 3" });
    }

    let parentDoc = null;
    if (level > 1) {
      if (!parentId) {
        return res.status(400).json({ message: "Parent category is required for level 2/3 categories" });
      }
      parentDoc = await ProductCategory.findById(parentId);
      if (!parentDoc || !parentDoc.isActive) {
        return res.status(404).json({ message: "Parent category not found" });
      }
      if (parentDoc.level !== level - 1) {
        return res.status(400).json({
          message: `Parent category must be level ${level - 1} for level ${level} category`,
        });
      }
    }

    const duplicate = await ProductCategory.findOne({
      name: new RegExp(`^${escapeRegex(rawName)}$`, "i"),
      level,
      parent: parentDoc ? parentDoc._id : null,
      isActive: true,
    });
    if (duplicate) {
      return res.status(409).json({ message: "A category with this name already exists at this level" });
    }

    const path = level === 1 ? rawName : `${parentDoc.path} > ${rawName}`;
    const category = await ProductCategory.create({
      name: rawName,
      level,
      parent: parentDoc ? parentDoc._id : null,
      path,
      isActive: true,
      subCategories: level === 1 ? parsedSubCategories : [],
    });

    if (level === 2 && parentDoc) {
      await addSubCategoryToParent(parentDoc._id, rawName);
    }

    res.status(201).json(category);
  } catch (err) {
    console.error("Create category error:", err);
    res.status(500).json({ message: "Error creating category", error: err.message });
  }
};

// Update category
exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await ProductCategory.findById(id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    const rawName = req.body?.name !== undefined ? String(req.body.name).trim() : category.name;
    const level = req.body?.level !== undefined ? Number(req.body.level) : category.level;
    const requestedParentId =
      req.body?.parent !== undefined ? (req.body.parent || null) : category.parent || null;

    if (!rawName) {
      return res.status(400).json({ message: "Category name is required" });
    }
    if (![1, 2, 3].includes(level)) {
      return res.status(400).json({ message: "Category level must be 1, 2, or 3" });
    }

    let parentDoc = null;
    if (level > 1) {
      if (!requestedParentId) {
        return res.status(400).json({ message: "Parent category is required for level 2/3 categories" });
      }
      parentDoc = await ProductCategory.findById(requestedParentId);
      if (!parentDoc || !parentDoc.isActive) {
        return res.status(404).json({ message: "Parent category not found" });
      }
      if (String(parentDoc._id) === String(category._id)) {
        return res.status(400).json({ message: "Category cannot be its own parent" });
      }
      const wouldCreateCycle = await isParentInCategorySubtree(parentDoc._id, category._id);
      if (wouldCreateCycle) {
        return res.status(400).json({ message: "Invalid parent selection: category cycle detected" });
      }
      if (parentDoc.level !== level - 1) {
        return res.status(400).json({
          message: `Parent category must be level ${level - 1} for level ${level} category`,
        });
      }
    }

    const duplicate = await ProductCategory.findOne({
      _id: { $ne: category._id },
      name: new RegExp(`^${escapeRegex(rawName)}$`, "i"),
      level,
      parent: parentDoc ? parentDoc._id : null,
      isActive: true,
    });
    if (duplicate) {
      return res.status(409).json({ message: "A category with this name already exists at this level" });
    }

    const oldParentId = category.parent ? String(category.parent) : null;
    const newParentId = parentDoc ? String(parentDoc._id) : null;
    const oldName = category.name;
    const newPath = level === 1 ? rawName : `${parentDoc.path} > ${rawName}`;

    category.name = rawName;
    category.level = level;
    category.parent = parentDoc ? parentDoc._id : null;
    category.path = newPath;
    category.subCategories =
      level === 1
        ? parseSubCategories(req.body?.subCategories !== undefined ? req.body.subCategories : category.subCategories)
        : [];
    if (typeof req.body?.isActive === "boolean") {
      category.isActive = req.body.isActive;
    }
    await category.save();

    // Keep level-1 legacy subCategories in sync when level-2 child changes
    if (oldParentId && oldParentId !== newParentId) {
      await removeSubCategoryFromParent(oldParentId, oldName);
    }

    if (newParentId && level === 2) {
      await removeSubCategoryFromParent(newParentId, oldName);
      await addSubCategoryToParent(newParentId, rawName);
    }

    await recalculateChildPaths(category);
    res.json(category);
  } catch (err) {
    console.error("Update category error:", err);
    res.status(500).json({ message: "Error updating category", error: err.message });
  }
};

// Delete category
exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await ProductCategory.findById(id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    const activeChildrenCount = await ProductCategory.countDocuments({
      parent: category._id,
      isActive: true,
    });
    if (activeChildrenCount > 0) {
      return res.status(400).json({
        message: "Cannot delete category with active child categories. Delete or move children first.",
      });
    }

    if (category.level === 2 && category.parent) {
      const parentCategory = await ProductCategory.findById(category.parent);
      if (parentCategory && Array.isArray(parentCategory.subCategories)) {
        parentCategory.subCategories = parentCategory.subCategories.filter(
          (sub) => String(sub).toLowerCase() !== String(category.name).toLowerCase()
        );
        await parentCategory.save();
      }
    }

    category.isActive = false;
    await category.save();

    res.json({ message: "Category deleted successfully" });
  } catch (err) {
    console.error("Delete category error:", err);
    res.status(500).json({ message: "Error deleting category", error: err.message });
  }
};

// Bulk update category active status
exports.bulkUpdateCategoryStatus = async (req, res) => {
  try {
    const ids = Array.isArray(req.body?.ids) ? req.body.ids : [];
    const isActive = req.body?.isActive;

    if (ids.length === 0) {
      return res.status(400).json({ message: "At least one category id is required" });
    }
    if (typeof isActive !== "boolean") {
      return res.status(400).json({ message: "isActive must be a boolean value" });
    }

    const uniqueIds = Array.from(new Set(ids.map((id) => String(id).trim()).filter(Boolean)));
    const categories = await ProductCategory.find({ _id: { $in: uniqueIds } });
    if (categories.length === 0) {
      return res.status(404).json({ message: "No matching categories found" });
    }

    if (!isActive) {
      for (const category of categories) {
        const activeChildrenCount = await ProductCategory.countDocuments({
          parent: category._id,
          isActive: true,
        });
        if (activeChildrenCount > 0) {
          return res.status(400).json({
            message: `Cannot deactivate "${category.name}" because it has active child categories`,
          });
        }
      }
    }

    await ProductCategory.updateMany(
      { _id: { $in: uniqueIds } },
      { $set: { isActive } }
    );

    res.json({
      message: `Updated ${uniqueIds.length} categor${uniqueIds.length === 1 ? "y" : "ies"} successfully`,
      updatedCount: uniqueIds.length,
      isActive,
    });
  } catch (err) {
    console.error("Bulk update category status error:", err);
    res.status(500).json({ message: "Error updating category status", error: err.message });
  }
};

// Bulk delete categories (soft delete via isActive=false)
exports.bulkDeleteCategories = async (req, res) => {
  try {
    const ids = Array.isArray(req.body?.ids) ? req.body.ids : [];
    if (ids.length === 0) {
      return res.status(400).json({ message: "At least one category id is required" });
    }

    const uniqueIds = Array.from(new Set(ids.map((id) => String(id).trim()).filter(Boolean)));
    const categories = await ProductCategory.find({ _id: { $in: uniqueIds } });
    if (categories.length === 0) {
      return res.status(404).json({ message: "No matching categories found" });
    }

    for (const category of categories) {
      const activeChildrenCount = await ProductCategory.countDocuments({
        parent: category._id,
        isActive: true,
      });
      if (activeChildrenCount > 0) {
        return res.status(400).json({
          message: `Cannot delete "${category.name}" because it has active child categories`,
        });
      }
    }

    for (const category of categories) {
      if (category.level === 2 && category.parent) {
        await removeSubCategoryFromParent(String(category.parent), category.name);
      }
      category.isActive = false;
      await category.save();
    }

    res.json({
      message: `Deleted ${categories.length} categor${categories.length === 1 ? "y" : "ies"} successfully`,
      deletedCount: categories.length,
    });
  } catch (err) {
    console.error("Bulk delete categories error:", err);
    res.status(500).json({ message: "Error deleting categories", error: err.message });
  }
};

// Bulk move selected categories under a new parent
exports.bulkMoveCategoryParent = async (req, res) => {
  try {
    const ids = Array.isArray(req.body?.ids) ? req.body.ids : [];
    const newParentId = String(req.body?.newParentId || "").trim();

    if (ids.length === 0) {
      return res.status(400).json({ message: "At least one category id is required" });
    }
    if (!newParentId) {
      return res.status(400).json({ message: "New parent category is required" });
    }

    const uniqueIds = Array.from(new Set(ids.map((id) => String(id).trim()).filter(Boolean)));
    const categories = await ProductCategory.find({ _id: { $in: uniqueIds }, isActive: true });
    if (categories.length !== uniqueIds.length) {
      return res.status(404).json({ message: "One or more selected categories were not found" });
    }

    const levels = Array.from(new Set(categories.map((cat) => Number(cat.level))));
    if (levels.length !== 1) {
      return res.status(400).json({ message: "Selected categories must all be from the same level" });
    }
    const selectedLevel = levels[0];
    if (selectedLevel === 1) {
      return res.status(400).json({ message: "Main categories cannot be moved under a parent" });
    }

    const newParent = await ProductCategory.findById(newParentId);
    if (!newParent || !newParent.isActive) {
      return res.status(404).json({ message: "Target parent category not found" });
    }
    if (Number(newParent.level) !== selectedLevel - 1) {
      return res.status(400).json({
        message: `Target parent must be level ${selectedLevel - 1} for level ${selectedLevel} categories`,
      });
    }

    for (const category of categories) {
      if (String(category._id) === String(newParent._id)) {
        return res.status(400).json({ message: "Category cannot be moved under itself" });
      }
      const cycleDetected = await isParentInCategorySubtree(newParent._id, category._id);
      if (cycleDetected) {
        return res.status(400).json({
          message: `Invalid move for "${category.name}": parent would create a cycle`,
        });
      }
    }

    for (const category of categories) {
      const oldParentId = category.parent ? String(category.parent) : null;
      category.parent = newParent._id;
      category.path = `${newParent.path} > ${category.name}`;
      await category.save();

      if (selectedLevel === 2) {
        await removeSubCategoryFromParent(oldParentId, category.name);
        await addSubCategoryToParent(newParent._id, category.name);
      }

      await recalculateChildPaths(category);
    }

    res.json({
      message: `Moved ${categories.length} categor${categories.length === 1 ? "y" : "ies"} successfully`,
      movedCount: categories.length,
      newParentId: String(newParent._id),
    });
  } catch (err) {
    console.error("Bulk move category parent error:", err);
    res.status(500).json({ message: "Error moving category parent", error: err.message });
  }
};

// Assign categories to manager
exports.assignCategoriesToManager = async (req, res) => {
  try {
    const { managerId, categories } = req.body;
    const companyId = req.user?.company_id || "RESSICHEM";
    
    // Find the manager
    const manager = await Manager.findById(managerId);
    if (!manager) {
      return res.status(404).json({ message: "Manager not found" });
    }
    
    // Update manager's assigned categories
    manager.assignedCategories = categories;
    await manager.save();
    
    // Update corresponding user record
    const user = await User.findOne({ 
      'managerProfile.manager_id': managerId,
      company_id: companyId 
    });
    
    if (user) {
      user.managerProfile.assignedCategories = categories;
      await user.save();
    }
    
    // Send notification to manager
    try {
      const notification = await notificationService.createNotification({
        title: "Categories Assigned",
        message: `You have been assigned to manage ${categories.length} product categories`,
        type: "category_assignment",
        priority: "medium",
        targetType: "user",
        targetIds: [manager.user_id],
        company_id: companyId,
        sender_id: req.user._id,
        sender_name: req.user.email,
        data: {
          managerId: manager._id,
          categories: categories
        },
        channels: [
          { type: "in_app", enabled: true },
          { type: "web_push", enabled: true }
        ]
      });

      // Send realtime notification
      const realtimeService = require('../services/realtimeService');
      console.log(`🔍 Sending realtime notification to manager ${manager.user_id}`);
      
      realtimeService.sendToUser(manager.user_id, {
        type: 'category_assignment',
        title: "Categories Assigned",
        message: `You have been assigned to manage ${categories.length} product categories`,
        data: {
          managerId: manager._id,
          categories: categories
        }
      });

      console.log(`📧 Sent category assignment notification to manager ${manager.user_id}`);
    } catch (notificationError) {
      console.error("Notification error:", notificationError);
    }
    
    res.json({
      message: "Categories assigned successfully",
      manager: {
        _id: manager._id,
        assignedCategories: manager.assignedCategories
      }
    });
  } catch (err) {
    console.error("Assign categories error:", err);
    res.status(500).json({ message: "Error assigning categories", error: err.message });
  }
};

// Get manager's assigned categories
exports.getManagerCategories = async (req, res) => {
  try {
    const { managerId } = req.params;
    
    const manager = await Manager.findById(managerId);
    if (!manager) {
      return res.status(404).json({ message: "Manager not found" });
    }
    
    res.json({
      managerId: manager._id,
      assignedCategories: manager.assignedCategories
    });
  } catch (err) {
    console.error("Get manager categories error:", err);
    res.status(500).json({ message: "Error fetching manager categories", error: err.message });
  }
};
