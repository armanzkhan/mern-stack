const CustomerLedger = require('../models/CustomerLedger');
const LedgerTransaction = require('../models/LedgerTransaction');
const Customer = require('../models/Customer');
const Invoice = require('../models/Invoice');

class CustomerLedgerService {
  /**
   * Get or create customer ledger
   * @param {string} customerId - Customer ID
   * @param {string} companyId - Company ID
   * @param {string} createdBy - User ID who created
   * @returns {Promise<Object>} Customer ledger
   */
  async getOrCreateCustomerLedger(customerId, companyId = "RESSICHEM", createdBy) {
    try {
      let ledger = await CustomerLedger.findOne({ customerId, companyId });
      
      if (!ledger) {
        ledger = new CustomerLedger({
          customerId,
          companyId,
          createdBy,
          currentBalance: 0,
          creditLimit: 0,
          paymentTerms: "Net 30",
          accountStatus: "Active"
        });
        await ledger.save();
        console.log(`✅ Created new customer ledger for customer ${customerId}`);
      }
      
      return ledger;
    } catch (error) {
      console.error('❌ Error getting/creating customer ledger:', error);
      throw error;
    }
  }

  /**
   * Add invoice transaction to ledger
   * @param {string} invoiceId - Invoice ID
   * @param {Object} invoice - Invoice object
   * @param {string} companyId - Company ID
   * @param {string} createdBy - User ID
   * @returns {Promise<Object>} Created transaction
   */
  async addInvoiceTransaction(invoiceId, invoice, companyId = "RESSICHEM", createdBy) {
    try {
      // Get or create customer ledger
      const ledger = await this.getOrCreateCustomerLedger(invoice.customer, companyId, createdBy);
      
      // Calculate new balance
      const newBalance = ledger.currentBalance + invoice.total;
      
      // Create transaction
      const transaction = new LedgerTransaction({
        customerId: invoice.customer,
        companyId,
        transactionType: "Invoice",
        referenceId: invoiceId,
        referenceNumber: invoice.invoiceNumber,
        debitAmount: invoice.total,
        creditAmount: 0,
        balance: newBalance,
        description: `Invoice ${invoice.invoiceNumber} - ${invoice.items?.length || 0} items`,
        transactionDate: invoice.invoiceDate || new Date(),
        createdBy
      });
      
      await transaction.save();
      
      // Update ledger
      ledger.currentBalance = newBalance;
      ledger.totalInvoiced += invoice.total;
      ledger.lastInvoiceDate = invoice.invoiceDate || new Date();
      ledger.updatedBy = createdBy;
      await ledger.save();
      
      console.log(`✅ Added invoice transaction for ${invoice.invoiceNumber}, new balance: ${newBalance}`);
      return transaction;
    } catch (error) {
      console.error('❌ Error adding invoice transaction:', error);
      throw error;
    }
  }

  /**
   * Add payment transaction to ledger
   * @param {string} customerId - Customer ID
   * @param {Object} paymentData - Payment data
   * @param {string} companyId - Company ID
   * @param {string} createdBy - User ID
   * @returns {Promise<Object>} Created transaction
   */
  async addPaymentTransaction(customerId, paymentData, companyId = "RESSICHEM", createdBy) {
    try {
      // Get or create customer ledger
      const ledger = await this.getOrCreateCustomerLedger(customerId, companyId, createdBy);
      
      // Calculate new balance
      const newBalance = Math.max(0, ledger.currentBalance - paymentData.amount);
      
      // Create transaction
      const transaction = new LedgerTransaction({
        customerId,
        companyId,
        transactionType: "Payment",
        referenceId: paymentData.referenceId || new mongoose.Types.ObjectId(),
        referenceNumber: paymentData.referenceNumber || `PAY-${Date.now()}`,
        debitAmount: 0,
        creditAmount: paymentData.amount,
        balance: newBalance,
        description: paymentData.description || `Payment received - ${paymentData.paymentMethod || 'Unknown method'}`,
        transactionDate: paymentData.paymentDate || new Date(),
        paymentMethod: paymentData.paymentMethod,
        checkNumber: paymentData.checkNumber,
        bankReference: paymentData.bankReference,
        notes: paymentData.notes,
        createdBy
      });
      
      await transaction.save();
      
      // Update ledger
      ledger.currentBalance = newBalance;
      ledger.totalPaid += paymentData.amount;
      ledger.lastPaymentDate = paymentData.paymentDate || new Date();
      ledger.lastPaymentAmount = paymentData.amount;
      ledger.updatedBy = createdBy;
      await ledger.save();
      
      console.log(`✅ Added payment transaction for customer ${customerId}, new balance: ${newBalance}`);
      return transaction;
    } catch (error) {
      console.error('❌ Error adding payment transaction:', error);
      throw error;
    }
  }

  /**
   * Get customer ledger with transactions
   * @param {string} customerId - Customer ID
   * @param {string} companyId - Company ID
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Customer ledger with transactions
   */
  async getCustomerLedger(customerId, companyId = "RESSICHEM", options = {}) {
    try {
      const { limit = 50, page = 1, transactionType, dateFrom, dateTo, createdBy } = options;
      
      // Get or create customer ledger (auto-create if doesn't exist)
      let ledger = await CustomerLedger.findOne({ customerId, companyId })
        .populate('customerId', 'companyName email phone address')
        .populate('createdBy', 'firstName lastName email')
        .populate('updatedBy', 'firstName lastName email');
      
      if (!ledger) {
        // Auto-create ledger if it doesn't exist
        console.log(`📝 Customer ledger not found, creating new ledger for customer ${customerId}`);
        ledger = await this.getOrCreateCustomerLedger(
          customerId, 
          companyId, 
          createdBy || null
        );
        
        // Re-populate after creation
        ledger = await CustomerLedger.findById(ledger._id)
          .populate('customerId', 'companyName email phone address')
          .populate('createdBy', 'firstName lastName email')
          .populate('updatedBy', 'firstName lastName email');
      }
      
      // Build transaction query
      const transactionQuery = { customerId, companyId };
      
      if (transactionType) {
        transactionQuery.transactionType = transactionType;
      }
      
      if (dateFrom || dateTo) {
        transactionQuery.transactionDate = {};
        if (dateFrom) {
          transactionQuery.transactionDate.$gte = new Date(dateFrom);
        }
        if (dateTo) {
          transactionQuery.transactionDate.$lte = new Date(dateTo);
        }
      }
      
      // Get transactions
      const transactions = await LedgerTransaction.find(transactionQuery)
        .populate('createdBy', 'firstName lastName email')
        .sort({ transactionDate: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);
      
      // Get total count for pagination
      const totalTransactions = await LedgerTransaction.countDocuments(transactionQuery);
      
      return {
        ledger,
        transactions,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalTransactions / limit),
          totalTransactions,
          hasNextPage: page < Math.ceil(totalTransactions / limit),
          hasPrevPage: page > 1
        }
      };
    } catch (error) {
      console.error('❌ Error getting customer ledger:', error);
      throw error;
    }
  }

  /**
   * Get all customer ledgers with aging analysis
   * @param {string} companyId - Company ID
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Customer ledgers with aging
   */
  async getAllCustomerLedgers(companyId = "RESSICHEM", options = {}) {
    try {
      const { status, minBalance = 0, limit = 100, customerId = null } = options;
      
      const query = { companyId };
      
      // If customerId is provided, filter by that customer only
      if (customerId) {
        query.customerId = customerId;
        console.log('🔍 Filtering ledgers for customer:', customerId);
      }
      
      if (status) {
        query.accountStatus = status;
      }
      
      if (minBalance > 0) {
        query.currentBalance = { $gte: minBalance };
      }
      
      const ledgers = await CustomerLedger.find(query)
        .populate('customerId', 'companyName email phone address')
        .populate('createdBy', 'firstName lastName email')
        .sort({ currentBalance: -1 })
        .limit(limit);
      
      // Add aging analysis for each ledger
      const ledgersWithAging = await Promise.all(
        ledgers.map(async (ledger) => {
          const aging = await this.getAgingAnalysis(ledger.customerId, companyId);
          return {
            ...ledger.toObject(),
            aging
          };
        })
      );
      
      return ledgersWithAging;
    } catch (error) {
      console.error('❌ Error getting all customer ledgers:', error);
      throw error;
    }
  }

  /**
   * Get aging analysis for a customer
   * @param {string} customerId - Customer ID
   * @param {string} companyId - Company ID
   * @returns {Promise<Object>} Aging analysis
   */
  async getAgingAnalysis(customerId, companyId = "RESSICHEM") {
    try {
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
      const sixtyDaysAgo = new Date(now.getTime() - (60 * 24 * 60 * 60 * 1000));
      const ninetyDaysAgo = new Date(now.getTime() - (90 * 24 * 60 * 60 * 1000));
      
      const aging = {
        current: 0,      // 0-30 days
        days31to60: 0,   // 31-60 days
        days61to90: 0,   // 61-90 days
        over90: 0,       // Over 90 days
        total: 0
      };
      
      // Get all outstanding invoice transactions
      const invoiceTransactions = await LedgerTransaction.find({
        customerId,
        companyId,
        transactionType: "Invoice",
        isReversed: false
      }).sort({ transactionDate: 1 });
      
      // Calculate aging for each invoice
      for (const transaction of invoiceTransactions) {
        const daysOld = Math.floor((now - transaction.transactionDate) / (1000 * 60 * 60 * 24));
        const remainingAmount = await this.getRemainingInvoiceAmount(transaction.referenceId, companyId);
        
        if (remainingAmount > 0) {
          if (daysOld <= 30) {
            aging.current += remainingAmount;
          } else if (daysOld <= 60) {
            aging.days31to60 += remainingAmount;
          } else if (daysOld <= 90) {
            aging.days61to90 += remainingAmount;
          } else {
            aging.over90 += remainingAmount;
          }
        }
      }
      
      aging.total = aging.current + aging.days31to60 + aging.days61to90 + aging.over90;
      
      return aging;
    } catch (error) {
      console.error('❌ Error getting aging analysis:', error);
      throw error;
    }
  }

  /**
   * Get remaining amount for an invoice
   * @param {string} invoiceId - Invoice ID
   * @param {string} companyId - Company ID
   * @returns {Promise<number>} Remaining amount
   */
  async getRemainingInvoiceAmount(invoiceId, companyId = "RESSICHEM") {
    try {
      const invoice = await Invoice.findById(invoiceId);
      if (!invoice) return 0;
      
      // Get total payments for this invoice
      const payments = await LedgerTransaction.find({
        referenceId: invoiceId,
        companyId,
        transactionType: "Payment",
        isReversed: false
      });
      
      const totalPaid = payments.reduce((sum, payment) => sum + payment.creditAmount, 0);
      return Math.max(0, invoice.total - totalPaid);
    } catch (error) {
      console.error('❌ Error getting remaining invoice amount:', error);
      return 0;
    }
  }

  /**
   * Update customer ledger settings
   * @param {string} customerId - Customer ID
   * @param {Object} updateData - Update data
   * @param {string} companyId - Company ID
   * @param {string} updatedBy - User ID
   * @returns {Promise<Object>} Updated ledger
   */
  async updateCustomerLedger(customerId, updateData, companyId = "RESSICHEM", updatedBy) {
    try {
      const ledger = await CustomerLedger.findOneAndUpdate(
        { customerId, companyId },
        {
          ...updateData,
          updatedBy,
          updatedAt: new Date()
        },
        { new: true, runValidators: true }
      );
      
      if (!ledger) {
        throw new Error('Customer ledger not found');
      }
      
      console.log(`✅ Updated customer ledger for customer ${customerId}`);
      return ledger;
    } catch (error) {
      console.error('❌ Error updating customer ledger:', error);
      throw error;
    }
  }
}

module.exports = new CustomerLedgerService();
