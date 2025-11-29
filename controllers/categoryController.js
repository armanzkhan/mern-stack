const ProductCategory = require("../models/ProductCategory");
const Manager = require("../models/Manager");
const User = require("../models/User");
const notificationService = require("../services/notificationService");

// Get all product categories
exports.getAllCategories = async (req, res) => {
  try {
    console.log("🔍 getAllCategories controller called");
    console.log("🔍 User from auth:", req.user);
    const categories = await ProductCategory.find({ isActive: true }).sort({ name: 1 });
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
    const { mainCategory, subCategories } = req.body;
    
    const category = new ProductCategory({
      mainCategory,
      subCategories: subCategories || []
    });
    
    await category.save();
    
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
    const updateData = req.body;
    
    const category = await ProductCategory.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }
    
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
    
    const category = await ProductCategory.findByIdAndDelete(id);
    
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }
    
    res.json({ message: "Category deleted successfully" });
  } catch (err) {
    console.error("Delete category error:", err);
    res.status(500).json({ message: "Error deleting category", error: err.message });
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
