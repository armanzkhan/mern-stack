const mongoose = require('mongoose');

const ledgerTransactionSchema = new mongoose.Schema({
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
  transactionType: {
    type: String,
    required: true,
    enum: ["Invoice", "Payment", "Credit", "Adjustment", "Refund", "Write-off"]
  },
  referenceId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    index: true
  },
  referenceNumber: {
    type: String,
    required: true,
    index: true
  },
  debitAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  creditAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  balance: {
    type: Number,
    required: true,
    default: 0
  },
  description: {
    type: String,
    required: true
  },
  transactionDate: {
    type: Date,
    required: true,
    default: Date.now,
    index: true
  },
  paymentMethod: {
    type: String,
    enum: ["Cash", "Check", "Bank Transfer", "Credit Card", "Other"]
  },
  checkNumber: {
    type: String
  },
  bankReference: {
    type: String
  },
  notes: {
    type: String
  },
  isReversed: {
    type: Boolean,
    default: false
  },
  reversedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reversedAt: {
    type: Date
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Indexes for better performance
ledgerTransactionSchema.index({ customerId: 1, transactionDate: -1 });
ledgerTransactionSchema.index({ companyId: 1, transactionType: 1 });
ledgerTransactionSchema.index({ referenceId: 1, transactionType: 1 });
ledgerTransactionSchema.index({ transactionDate: -1 });

// Virtual for net amount (debit - credit)
ledgerTransactionSchema.virtual('netAmount').get(function() {
  return this.debitAmount - this.creditAmount;
});

// Virtual for transaction age in days
ledgerTransactionSchema.virtual('ageInDays').get(function() {
  return Math.floor((new Date() - this.transactionDate) / (1000 * 60 * 60 * 24));
});

// Ensure virtuals are included in JSON output
ledgerTransactionSchema.set('toJSON', { virtuals: true });
ledgerTransactionSchema.set('toObject', { virtuals: true });

// Pre-save middleware to validate debit/credit amounts
ledgerTransactionSchema.pre('save', function(next) {
  if (this.debitAmount > 0 && this.creditAmount > 0) {
    return next(new Error('Transaction cannot have both debit and credit amounts'));
  }
  if (this.debitAmount === 0 && this.creditAmount === 0) {
    return next(new Error('Transaction must have either debit or credit amount'));
  }
  next();
});

module.exports = mongoose.model('LedgerTransaction', ledgerTransactionSchema);
