const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema(
  {
    companyName: { type: String, required: true },
    industry: { type: String },
    taxId: { type: String },
    customerType: { type: String, default: "regular" },
    contactName: { type: String, required: true },
    jobTitle: { type: String },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String },
    zip: { type: String },
    country: { type: String },
    paymentTerms: { type: String },
    creditLimit: { type: Number },
    notes: { type: String },
    status: { 
      type: String, 
      enum: ['active', 'inactive', 'suspended'], 
      default: 'active' 
    },
    company_id: { 
      type: String, 
      required: true, 
      default: 'RESSICHEM' 
    },
    user_id: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User" 
    },
    // Manager assignment for existing customers (legacy - single manager)
    assignedManager: {
      manager_id: { type: mongoose.Schema.Types.ObjectId, ref: "Manager" },
      assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      assignedAt: { type: Date, default: Date.now },
      isActive: { type: Boolean, default: true },
      notes: { type: String }
    },
    // Multiple manager assignments (new - supports multiple managers)
    assignedManagers: [{
      manager_id: { type: mongoose.Schema.Types.ObjectId, ref: "Manager", required: true },
      assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      assignedAt: { type: Date, default: Date.now },
      isActive: { type: Boolean, default: true },
      notes: { type: String }
    }],
    // Customer preferences
    preferences: {
      preferredCategories: [{ type: String }],
      notificationPreferences: {
        orderUpdates: { type: Boolean, default: true },
        statusChanges: { type: Boolean, default: true },
        newProducts: { type: Boolean, default: false }
      }
    }
  },
  { timestamps: true }
);

// Make email unique per company_id for true multi-tenancy
// This allows same email in different companies but prevents duplicates within same company
customerSchema.index({ company_id: 1, email: 1 }, { unique: true });

module.exports = mongoose.model("Customer", customerSchema);
