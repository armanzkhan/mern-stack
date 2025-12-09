const mongoose = require("mongoose");

const ManagerSchema = new mongoose.Schema({
  user_id: { 
    type: String, 
    ref: "User", 
    required: true,
    unique: true 
  },
  company_id: { 
    type: String, 
    ref: "Company", 
    required: true 
  },
  
  // Category assignments
  assignedCategories: [{
    category: { type: String, required: true }, // Product category
    subCategory: { type: String }, // Optional sub-category
    assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Who assigned
    assignedAt: { type: Date, default: Date.now },
    isActive: { type: Boolean, default: true }
  }],
  
  // Manager preferences
  notificationPreferences: {
    orderUpdates: { type: Boolean, default: true },
    stockAlerts: { type: Boolean, default: true },
    statusChanges: { type: Boolean, default: true },
    newOrders: { type: Boolean, default: true },
    lowStock: { type: Boolean, default: true },
    categoryReports: { type: Boolean, default: true }
  },
  
  // Manager permissions for their categories
  permissions: {
    canUpdateStatus: { type: Boolean, default: true },
    canAddComments: { type: Boolean, default: true },
    canViewReports: { type: Boolean, default: true },
    canManageStock: { type: Boolean, default: true }
  },
  
  // Manager performance tracking
  performance: {
    totalOrdersManaged: { type: Number, default: 0 },
    totalProductsManaged: { type: Number, default: 0 },
    averageResponseTime: { type: Number, default: 0 }, // in hours
    lastActiveAt: { type: Date, default: Date.now }
  },
  
  // Manager status
  isActive: { type: Boolean, default: true },
  managerLevel: { 
    type: String, 
    enum: ['junior', 'senior', 'lead', 'head'], 
    default: 'junior' 
  },
  
  // Audit trail
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
}, {
  timestamps: true
});

// Indexes for performance
ManagerSchema.index({ user_id: 1, company_id: 1 }, { unique: true });
ManagerSchema.index({ company_id: 1, isActive: 1 });
ManagerSchema.index({ "assignedCategories.category": 1 });

// Virtual for active categories
ManagerSchema.virtual('activeCategories').get(function() {
  return this.assignedCategories.filter(cat => cat.isActive);
});

// Method to check if manager has access to a category
ManagerSchema.methods.hasCategoryAccess = function(category, subCategory = null) {
  return this.assignedCategories.some(cat => 
    cat.isActive && 
    cat.category === category && 
    (!subCategory || cat.subCategory === subCategory)
  );
};

// Method to get manager's categories as array
ManagerSchema.methods.getCategoryList = function() {
  return this.assignedCategories
    .filter(cat => cat.isActive)
    .map(cat => cat.category);
};

// Post-save hook to auto-sync with User.managerProfile
ManagerSchema.post('save', async function() {
  try {
    // Only sync if categories or preferences were modified
    if (this.isModified('assignedCategories') || this.isModified('notificationPreferences')) {
      const managerSyncService = require('../services/managerSyncService');
      await managerSyncService.syncManagerToUser(this._id, this.company_id);
      console.log(`✅ Auto-synced manager ${this._id} to user profile`);
    }
  } catch (error) {
    // Don't throw error in post-save hook, just log it
    console.error(`⚠️ Error auto-syncing manager ${this._id}:`, error.message);
  }
});

module.exports = mongoose.model("Manager", ManagerSchema);
