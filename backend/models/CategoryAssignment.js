const mongoose = require("mongoose");

const CategoryAssignmentSchema = new mongoose.Schema({
  manager_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Manager", 
    required: true 
  },
  user_id: { 
    type: String, 
    ref: "User", 
    required: true 
  },
  company_id: { 
    type: String, 
    ref: "Company", 
    required: true 
  },
  
  // Category details
  category: { 
    type: String, 
    required: true 
  },
  subCategory: { 
    type: String 
  },
  subSubCategory: { 
    type: String 
  },
  
  // Assignment details
  assignedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  assignedAt: { 
    type: Date, 
    default: Date.now 
  },
  
  // Assignment status
  isActive: { 
    type: Boolean, 
    default: true 
  },
  isPrimary: { 
    type: Boolean, 
    default: false 
  }, // Primary manager for this category
  
  // Manager permissions for this specific category
  permissions: {
    canUpdateStatus: { type: Boolean, default: true },
    canAddComments: { type: Boolean, default: true },
    canViewReports: { type: Boolean, default: true },
    canManageStock: { type: Boolean, default: true },
    canApproveOrders: { type: Boolean, default: true }
  },
  
  // Performance tracking for this category
  performance: {
    ordersProcessed: { type: Number, default: 0 },
    averageResponseTime: { type: Number, default: 0 },
    lastActivityAt: { type: Date, default: Date.now }
  },
  
  // Notes and comments
  notes: { type: String },
  
  // Audit trail
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
}, {
  timestamps: true
});

// Indexes for performance
CategoryAssignmentSchema.index({ manager_id: 1, isActive: 1 });
CategoryAssignmentSchema.index({ user_id: 1, company_id: 1, isActive: 1 });
CategoryAssignmentSchema.index({ category: 1, subCategory: 1, isActive: 1 });
CategoryAssignmentSchema.index({ company_id: 1, category: 1, isActive: 1 });

// Ensure unique assignment per manager per category
CategoryAssignmentSchema.index({ 
  manager_id: 1, 
  category: 1, 
  subCategory: 1 
}, { unique: true });

// Method to get full category path
CategoryAssignmentSchema.methods.getCategoryPath = function() {
  let path = this.category;
  if (this.subCategory) path += ` > ${this.subCategory}`;
  if (this.subSubCategory) path += ` > ${this.subSubCategory}`;
  return path;
};

// Method to check if assignment is active
CategoryAssignmentSchema.methods.isActiveAssignment = function() {
  return this.isActive;
};

module.exports = mongoose.model("CategoryAssignment", CategoryAssignmentSchema);
