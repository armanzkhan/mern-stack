const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
    deliveryCharges: { type: Number, default: 0, min: 0 },
    biltyCharges: { type: Number, default: 0, min: 0 },
    total: { type: Number, required: true, min: 0 },
    tdsLink: { type: String }, // TDS (Tax Deducted at Source) document link for this product
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, required: true, unique: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", required: true },
    orderDate: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "confirmed", "processing", "allocated", "dispatched", "dispatch", "hold", "partial_shipment", "shipped", "completed", "cancelled"],
      default: "pending",
    },
    items: [orderItemSchema],
    subtotal: { type: Number, required: true },
    tax: { type: Number, default: 0 },
    deliveryCharges: { type: Number, default: 0 },
    biltyCharges: { type: Number, default: 0 },
    total: { type: Number, required: true },
    totalDiscount: { type: Number, default: 0 },
    finalTotal: { type: Number },
    notes: { type: String },
    customerNotes: { type: String },
    logisticsRemarks: [{
      status: { type: String },
      remark: { type: String, required: true },
      partialShipmentItems: [{
        productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        productName: { type: String },
        orderedQuantity: { type: Number, min: 0 },
        shippedQuantity: { type: Number, min: 0 },
        remainingQuantity: { type: Number, min: 0 },
      }],
      createdAt: { type: Date, default: Date.now },
      createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      createdByEmail: { type: String },
      createdByName: { type: String },
    }],
    statusHistory: [{
      fromStatus: { type: String },
      toStatus: { type: String, required: true },
      changedAt: { type: Date, default: Date.now },
      changedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      changedByEmail: { type: String },
      changedByName: { type: String },
      reason: { type: String },
      source: { type: String, enum: ["customer", "manager", "logistics", "admin", "system"], default: "system" },
    }],
    attachment: {
      fileName: { type: String },
      fileType: { type: String },
      fileSize: { type: Number },
      dataUrl: { type: String },
      uploadedAt: { type: Date },
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    company_id: { type: String, required: true, default: "RESSICHEM" },
    
    // Approval workflow fields
    approvalStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending"
    },
    approvals: [{
      category: { type: String, required: true },
      approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      approvedAt: { type: Date },
      status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
      comments: { type: String },
      discountPercentage: { type: Number, default: 0, min: 0, max: 100 },
      discountAmount: { type: Number, default: 0, min: 0 },
      originalAmount: { type: Number, default: 0 }
    }],
    
    // Category-based workflow
    categories: [{ type: String }], // Auto-populated from items
    requiresApproval: { type: Boolean, default: true },
    
    // Timestamps for workflow
    submittedAt: { type: Date, default: Date.now },
    approvedAt: { type: Date },
    rejectedAt: { type: Date }
  },
  { timestamps: true }
);

// Read-path indexes for order listing and status dashboards.
orderSchema.index({ company_id: 1, createdAt: -1 });
orderSchema.index({ company_id: 1, status: 1, createdAt: -1 });
orderSchema.index({ company_id: 1, customer: 1, createdAt: -1 });
orderSchema.index({ company_id: 1, approvalStatus: 1, createdAt: -1 });

module.exports = mongoose.model("Order", orderSchema);
