const mongoose = require("mongoose");

const invoiceItemSchema = new mongoose.Schema(
  {
    product: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Product", 
      required: true 
    },
    productName: { type: String, required: true },
    category: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
    originalAmount: { type: Number, required: true, min: 0 },
    discountPercentage: { type: Number, default: 0, min: 0, max: 100 },
    discountAmount: { type: Number, default: 0, min: 0 },
    finalAmount: { type: Number, required: true, min: 0 },
    approvedBy: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User" 
    },
    approvedAt: { type: Date },
    comments: { type: String }
  },
  { _id: false }
);

const invoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: { 
      type: String, 
      required: true, 
      unique: true 
    },
    orderNumber: { 
      type: String, 
      required: true,
      ref: "Order"
    },
    orderId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Order", 
      required: true 
    },
    customer: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Customer", 
      required: true 
    },
    customerName: { type: String, required: true },
    customerEmail: { type: String, required: true },
    customerAddress: {
      street: { type: String },
      city: { type: String },
      state: { type: String },
      zip: { type: String },
      country: { type: String }
    },
    
    // Invoice details
    invoiceDate: { type: Date, default: Date.now },
    dueDate: { type: Date },
    status: {
      type: String,
      enum: ["draft", "sent", "paid", "overdue", "cancelled"],
      default: "draft"
    },
    
    // Items from approved order items
    items: [invoiceItemSchema],
    
    // Financial calculations
    subtotal: { type: Number, required: true, min: 0 },
    totalDiscount: { type: Number, default: 0, min: 0 },
    taxRate: { type: Number, default: 0, min: 0, max: 100 },
    taxAmount: { type: Number, default: 0, min: 0 },
    total: { type: Number, required: true, min: 0 },
    
    // Payment information
    paymentTerms: { type: String, default: "Net 30" },
    paymentStatus: {
      type: String,
      enum: ["unpaid", "partial", "paid"],
      default: "unpaid"
    },
    paidAmount: { type: Number, default: 0, min: 0 },
    remainingAmount: { type: Number, default: 0, min: 0 },
    
    // Company information
    company_id: { 
      type: String, 
      required: true, 
      default: "RESSICHEM" 
    },
    companyInfo: {
      name: { type: String, default: "Ressichem" },
      address: { type: String },
      phone: { type: String },
      email: { type: String },
      taxId: { type: String }
    },
    
    // Approval and creation tracking
    createdBy: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User" 
    },
    approvedItems: [{ 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "OrderItemApproval" 
    }],
    
    // Notes and additional information
    notes: { type: String },
    internalNotes: { type: String },
    
    // Timestamps
    sentAt: { type: Date },
    paidAt: { type: Date },
    cancelledAt: { type: Date }
  },
  { timestamps: true }
);

// Indexes for efficient queries
invoiceSchema.index({ invoiceNumber: 1 });
invoiceSchema.index({ orderNumber: 1 });
invoiceSchema.index({ customer: 1, status: 1 });
invoiceSchema.index({ company_id: 1, status: 1 });
invoiceSchema.index({ invoiceDate: -1 });
invoiceSchema.index({ dueDate: 1 });

// Virtual for remaining amount calculation
invoiceSchema.virtual('calculatedRemainingAmount').get(function() {
  return this.total - this.paidAmount;
});

// Pre-save middleware to update remaining amount
invoiceSchema.pre('save', function(next) {
  this.remainingAmount = this.total - this.paidAmount;
  next();
});

// Static method to generate invoice number
invoiceSchema.statics.generateInvoiceNumber = function(companyId = "RESSICHEM") {
  const prefix = companyId === "RESSICHEM" ? "INV" : companyId.substring(0, 3).toUpperCase();
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${prefix}-${timestamp}-${random}`;
};

module.exports = mongoose.model("Invoice", invoiceSchema);
