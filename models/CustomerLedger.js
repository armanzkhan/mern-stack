const mongoose = require('mongoose');

const customerLedgerSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true,
    index: true
  },
  companyId: {
    type: String,
    required: true,
    default: "RESSICHEM",
    index: true
  },
  currentBalance: {
    type: Number,
    default: 0,
    required: true
  },
  creditLimit: {
    type: Number,
    default: 0
  },
  paymentTerms: {
    type: String,
    default: "Net 30",
    enum: ["Net 15", "Net 30", "Net 45", "Net 60", "2/10 Net 30", "Cash on Delivery"]
  },
  accountStatus: {
    type: String,
    default: "Active",
    enum: ["Active", "Suspended", "Closed", "On Hold"]
  },
  lastPaymentDate: {
    type: Date
  },
  lastInvoiceDate: {
    type: Date
  },
  lastPaymentAmount: {
    type: Number,
    default: 0
  },
  totalInvoiced: {
    type: Number,
    default: 0
  },
  totalPaid: {
    type: Number,
    default: 0
  },
  notes: {
    type: String
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Indexes for better performance
customerLedgerSchema.index({ customerId: 1, companyId: 1 });
customerLedgerSchema.index({ companyId: 1, accountStatus: 1 });
customerLedgerSchema.index({ currentBalance: 1 });

// Virtual for credit utilization
customerLedgerSchema.virtual('creditUtilization').get(function() {
  if (this.creditLimit > 0) {
    return (this.currentBalance / this.creditLimit) * 100;
  }
  return 0;
});

// Virtual for days since last payment
customerLedgerSchema.virtual('daysSinceLastPayment').get(function() {
  if (this.lastPaymentDate) {
    return Math.floor((new Date() - this.lastPaymentDate) / (1000 * 60 * 60 * 24));
  }
  return null;
});

// Virtual for days since last invoice
customerLedgerSchema.virtual('daysSinceLastInvoice').get(function() {
  if (this.lastInvoiceDate) {
    return Math.floor((new Date() - this.lastInvoiceDate) / (1000 * 60 * 60 * 24));
  }
  return null;
});

// Ensure virtuals are included in JSON output
customerLedgerSchema.set('toJSON', { virtuals: true });
customerLedgerSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('CustomerLedger', customerLedgerSchema);
