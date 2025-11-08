const customerLedgerService = require('../services/customerLedgerService');

/**
 * Get customer ledger with transactions
 */
exports.getCustomerLedger = async (req, res) => {
  try {
    const { customerId } = req.params;
    const { transactionType, dateFrom, dateTo, limit, page } = req.query;
    const companyId = req.headers?.['x-company-id'] || req.user?.company_id || "RESSICHEM";
    
    console.log('🔍 Getting customer ledger for:', customerId);
    console.log('🔍 Company ID:', companyId);
    console.log('🔍 Query params:', req.query);
    
    const options = {
      transactionType,
      dateFrom,
      dateTo,
      limit: parseInt(limit) || 50,
      page: parseInt(page) || 1,
      createdBy: req.user?._id || null
    };
    
    const result = await customerLedgerService.getCustomerLedger(customerId, companyId, options);
    
    if (!result) {
      console.warn('⚠️ Customer ledger service returned null for customer:', customerId);
      return res.status(404).json({
        success: false,
        message: 'Customer ledger not found'
      });
    }
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('❌ Error getting customer ledger:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting customer ledger',
      error: error.message
    });
  }
};

/**
 * Get all customer ledgers with aging analysis
 */
exports.getAllCustomerLedgers = async (req, res) => {
  try {
    const { status, minBalance, limit } = req.query;
    const companyId = req.headers?.['x-company-id'] || req.user?.company_id || "RESSICHEM";
    
    console.log('🔍 Backend: getAllCustomerLedgers called');
    console.log('🔍 User info:', {
      user_id: req.user?.user_id,
      _id: req.user?._id,
      company_id: req.user?.company_id,
      email: req.user?.email,
      isManager: req.user?.isManager,
      isCustomer: req.user?.isCustomer
    });
    console.log('🔍 Query params:', req.query);
    
    let customerId = null;
    
    // If user is a customer, filter by their customer record
    if (req.user && req.user.isCustomer) {
      const Customer = require('../models/Customer');
      const currentUser = await require('../models/User').findById(req.user._id).select('email');
      
      console.log(`🔍 Customer user detected: ${req.user.email}, User ID: ${req.user._id}`);
      
      if (currentUser) {
        const customer = await Customer.findOne({ 
          email: currentUser.email,
          company_id: companyId 
        });
        
        if (customer) {
          customerId = customer._id;
          console.log(`🔍 Found customer record:`, { id: customer._id, email: customer.email, companyName: customer.companyName });
          console.log(`🔍 Customer ${req.user.email} - filtering ledgers for customer ID: ${customer._id}`);
        } else {
          console.log(`⚠️ Customer user ${req.user.email} not found in customer records`);
          // Return empty array if customer not found
          return res.json({
            success: true,
            data: [],
            count: 0
          });
        }
      }
    }
    
    const options = {
      status,
      minBalance: parseFloat(minBalance) || 0,
      limit: parseInt(limit) || 100,
      customerId: customerId
    };
    
    const ledgers = await customerLedgerService.getAllCustomerLedgers(companyId, options);
    
    console.log('🔍 Found ledgers:', ledgers.length);
    
    res.json({
      success: true,
      data: ledgers,
      count: ledgers.length
    });
  } catch (error) {
    console.error('❌ Error getting all customer ledgers:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting all customer ledgers',
      error: error.message
    });
  }
};

/**
 * Record a payment
 */
exports.recordPayment = async (req, res) => {
  try {
    const { customerId } = req.params;
    const paymentData = req.body;
    const companyId = req.headers?.['x-company-id'] || req.user?.company_id || "RESSICHEM";
    const createdBy = req.user._id;
    
    console.log('🔍 Recording payment for customer:', customerId);
    console.log('🔍 Payment data:', paymentData);
    
    // Validate required fields
    if (!paymentData.amount || paymentData.amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Payment amount is required and must be greater than 0'
      });
    }
    
    const transaction = await customerLedgerService.addPaymentTransaction(
      customerId,
      paymentData,
      companyId,
      createdBy
    );
    
    res.status(201).json({
      success: true,
      message: 'Payment recorded successfully',
      data: transaction
    });
  } catch (error) {
    console.error('❌ Error recording payment:', error);
    res.status(500).json({
      success: false,
      message: 'Error recording payment',
      error: error.message
    });
  }
};

/**
 * Update customer ledger settings
 */
exports.updateCustomerLedger = async (req, res) => {
  try {
    const { customerId } = req.params;
    const updateData = req.body;
    const companyId = req.headers?.['x-company-id'] || req.user?.company_id || "RESSICHEM";
    const updatedBy = req.user._id;
    
    console.log('🔍 Updating customer ledger for:', customerId);
    console.log('🔍 Update data:', updateData);
    
    const ledger = await customerLedgerService.updateCustomerLedger(
      customerId,
      updateData,
      companyId,
      updatedBy
    );
    
    res.json({
      success: true,
      message: 'Customer ledger updated successfully',
      data: ledger
    });
  } catch (error) {
    console.error('❌ Error updating customer ledger:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating customer ledger',
      error: error.message
    });
  }
};

/**
 * Get aging analysis for all customers
 */
exports.getAgingAnalysis = async (req, res) => {
  try {
    const companyId = req.headers?.['x-company-id'] || req.user?.company_id || "RESSICHEM";
    
    console.log('🔍 Backend: getAgingAnalysis called');
    console.log('🔍 User info:', {
      user_id: req.user?.user_id,
      _id: req.user?._id,
      company_id: req.user?.company_id,
      email: req.user?.email,
      isManager: req.user?.isManager,
      isCustomer: req.user?.isCustomer
    });
    
    let customerId = null;
    
    // If user is a customer, filter by their customer record
    if (req.user && req.user.isCustomer) {
      const Customer = require('../models/Customer');
      const currentUser = await require('../models/User').findById(req.user._id).select('email');
      
      if (currentUser) {
        const customer = await Customer.findOne({ 
          email: currentUser.email,
          company_id: companyId 
        });
        
        if (customer) {
          customerId = customer._id;
          console.log(`🔍 Customer ${req.user.email} - filtering aging analysis for customer ID: ${customer._id}`);
        } else {
          // Return empty aging analysis if customer not found
          return res.json({
            success: true,
            data: {
              ledgers: [],
              totalAging: {
                current: 0,
                days31to60: 0,
                days61to90: 0,
                over90: 0,
                total: 0
              }
            }
          });
        }
      }
    }
    
    const ledgers = await customerLedgerService.getAllCustomerLedgers(companyId, { customerId });
    
    // Calculate total aging
    const totalAging = {
      current: 0,
      days31to60: 0,
      days61to90: 0,
      over90: 0,
      total: 0
    };
    
    ledgers.forEach(ledger => {
      if (ledger.aging) {
        totalAging.current += ledger.aging.current || 0;
        totalAging.days31to60 += ledger.aging.days31to60 || 0;
        totalAging.days61to90 += ledger.aging.days61to90 || 0;
        totalAging.over90 += ledger.aging.over90 || 0;
        totalAging.total += ledger.aging.total || 0;
      }
    });
    
    res.json({
      success: true,
      data: {
        ledgers,
        totalAging
      }
    });
  } catch (error) {
    console.error('❌ Error getting aging analysis:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting aging analysis',
      error: error.message
    });
  }
};

/**
 * Get customer ledger summary
 */
exports.getCustomerLedgerSummary = async (req, res) => {
  try {
    const companyId = req.headers?.['x-company-id'] || req.user?.company_id || "RESSICHEM";
    
    console.log('🔍 Backend: getCustomerLedgerSummary called');
    console.log('🔍 User info:', {
      user_id: req.user?.user_id,
      _id: req.user?._id,
      company_id: req.user?.company_id,
      email: req.user?.email,
      isManager: req.user?.isManager,
      isCustomer: req.user?.isCustomer
    });
    
    let customerId = null;
    
    // If user is a customer, filter by their customer record
    if (req.user && req.user.isCustomer) {
      const Customer = require('../models/Customer');
      const currentUser = await require('../models/User').findById(req.user._id).select('email');
      
      if (currentUser) {
        const customer = await Customer.findOne({ 
          email: currentUser.email,
          company_id: companyId 
        });
        
        if (customer) {
          customerId = customer._id;
          console.log(`🔍 Customer ${req.user.email} - filtering summary for customer ID: ${customer._id}`);
        } else {
          // Return empty summary if customer not found
          return res.json({
            success: true,
            data: {
              totalCustomers: 0,
              totalOutstanding: 0,
              totalInvoiced: 0,
              totalPaid: 0,
              activeCustomers: 0,
              suspendedCustomers: 0,
              overdueCustomers: 0
            }
          });
        }
      }
    }
    
    const ledgers = await customerLedgerService.getAllCustomerLedgers(companyId, { customerId });
    
    const summary = {
      totalCustomers: ledgers.length,
      totalOutstanding: 0,
      totalInvoiced: 0,
      totalPaid: 0,
      activeCustomers: 0,
      suspendedCustomers: 0,
      overdueCustomers: 0
    };
    
    ledgers.forEach(ledger => {
      summary.totalOutstanding += ledger.currentBalance || 0;
      summary.totalInvoiced += ledger.totalInvoiced || 0;
      summary.totalPaid += ledger.totalPaid || 0;
      
      if (ledger.accountStatus === 'Active') {
        summary.activeCustomers++;
      } else if (ledger.accountStatus === 'Suspended') {
        summary.suspendedCustomers++;
      }
      
      if (ledger.currentBalance > 0) {
        summary.overdueCustomers++;
      }
    });
    
    res.json({
      success: true,
      data: summary
    });
  } catch (error) {
    console.error('❌ Error getting customer ledger summary:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting customer ledger summary',
      error: error.message
    });
  }
};
