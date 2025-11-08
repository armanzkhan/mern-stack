const invoiceService = require('../services/invoiceService');

/**
 * Get all invoices for a company
 */
exports.getInvoices = async (req, res) => {
  try {
    console.log('🔍 Backend: getInvoices called');
    console.log('🔍 Query params:', req.query);
    console.log('🔍 User info:', {
      user_id: req.user?.user_id,
      _id: req.user?._id,
      company_id: req.user?.company_id,
      email: req.user?.email,
      isManager: req.user?.isManager,
      isCustomer: req.user?.isCustomer,
      managerProfile: req.user?.managerProfile,
      customerProfile: req.user?.customerProfile
    });
    
    const companyId = req.headers?.['x-company-id'] || req.user?.company_id || "RESSICHEM";
    
    const filters = {
      status: req.query.status,
      customer: req.query.customer,
      dateFrom: req.query.dateFrom,
      dateTo: req.query.dateTo,
      managerId: req.query.managerId,
      managerApprovedOnly: req.query.managerApprovedOnly === 'true',
      limit: parseInt(req.query.limit) || 50
    };

    console.log('🔍 Initial filters:', filters);

    // Check if user is a customer - if so, filter by their customer record
    if (req.user && req.user.isCustomer) {
      const Customer = require('../models/Customer');
      const currentUser = await require('../models/User').findById(req.user._id).select('email');
      
      console.log(`🔍 Customer user detected: ${req.user.email}, User ID: ${req.user._id}`);
      
      if (currentUser) {
        const customer = await Customer.findOne({ 
          email: currentUser.email,
          company_id: companyId 
        });
        
        console.log(`🔍 Found customer record for invoices:`, customer ? { id: customer._id, email: customer.email, companyName: customer.companyName } : 'Not found');
        
        if (customer) {
          filters.customer = customer._id;
          console.log(`🔍 Customer ${req.user.email} - filtering invoices for customer ID: ${customer._id}`);
        } else {
          console.log(`⚠️ Customer user ${req.user.email} not found in customer records`);
          return res.json({
            success: true,
            data: [],
            count: 0
          });
        }
      } else {
        console.log(`⚠️ Current user not found in database for ID: ${req.user._id}`);
        return res.json({
          success: true,
          data: [],
          count: 0
        });
      }
    }
    // If managerId is provided, use it; otherwise, if user is a manager, filter by their User._id
    else if (!filters.managerId && req.user?.isManager && req.user?._id) {
      // Use User._id instead of manager_id, as approvedBy stores User._id
      filters.managerId = req.user._id.toString();
      filters.managerApprovedOnly = true; // For managers, only show invoices from their approved items
    }

    console.log('🔍 Final filters:', filters);

    const invoices = await invoiceService.getInvoices(companyId, filters);
    
    console.log('🔍 Found invoices:', invoices.length);
    console.log('🔍 Invoice details:', invoices.map(inv => ({
      id: inv._id,
      invoiceNumber: inv.invoiceNumber,
      approvedItemsCount: inv.approvedItems?.length || 0
    })));
    
    res.json({
      success: true,
      data: invoices,
      count: invoices.length
    });
  } catch (error) {
    console.error('Error fetching invoices:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching invoices',
      error: error.message
    });
  }
};

/**
 * Get invoice by ID
 */
exports.getInvoiceById = async (req, res) => {
  try {
    const { id } = req.params;
    const companyId = req.headers?.['x-company-id'] || req.user?.company_id || "RESSICHEM";
    
    console.log('🔍 Backend: getInvoiceById called');
    console.log('🔍 Invoice ID:', id);
    console.log('🔍 User info:', {
      user_id: req.user?.user_id,
      _id: req.user?._id,
      company_id: req.user?.company_id,
      email: req.user?.email,
      isManager: req.user?.isManager,
      isCustomer: req.user?.isCustomer
    });
    
    // If user is a customer, verify the invoice belongs to them
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
          console.log(`🔍 Found customer record:`, { id: customer._id, email: customer.email, companyName: customer.companyName });
          
          // Get invoice and verify it belongs to this customer
          const invoice = await invoiceService.getInvoiceById(id);
          
          // Check if invoice customer matches the logged-in customer
          const invoiceCustomerId = invoice.customer?._id?.toString() || invoice.customer?.toString();
          const customerIdStr = customer._id.toString();
          
          console.log(`🔍 Invoice customer ID:`, invoiceCustomerId);
          console.log(`🔍 Logged-in customer ID:`, customerIdStr);
          
          if (invoiceCustomerId !== customerIdStr) {
            console.log(`⚠️ Customer ${req.user.email} tried to access invoice that doesn't belong to them`);
            return res.status(403).json({
              success: false,
              message: 'Access denied. This invoice does not belong to you.',
              error: 'Access denied'
            });
          }
          
          console.log(`✅ Customer ${req.user.email} - invoice access verified`);
          return res.json({
            success: true,
            data: invoice
          });
        } else {
          console.log(`⚠️ Customer user ${req.user.email} not found in customer records`);
          return res.status(403).json({
            success: false,
            message: 'Access denied. Customer record not found.',
            error: 'Access denied'
          });
        }
      }
    }
    
    // For non-customer users or if customer check passed, proceed normally
    const invoice = await invoiceService.getInvoiceById(id);
    
    res.json({
      success: true,
      data: invoice
    });
  } catch (error) {
    console.error('Error fetching invoice:', error);
    res.status(404).json({
      success: false,
      message: 'Invoice not found',
      error: error.message
    });
  }
};

/**
 * Create invoice from approved order items
 */
exports.createInvoiceFromOrder = async (req, res) => {
  try {
    const { orderId } = req.body;
    const companyId = req.headers?.['x-company-id'] || req.user?.company_id || "RESSICHEM";
    const createdBy = req.user._id; // Use current user as creator
    
    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: 'Order ID is required'
      });
    }

    // Check if order has approved items
    const hasApprovedItems = await invoiceService.hasApprovedItemsForInvoicing(orderId);
    if (!hasApprovedItems) {
      return res.status(400).json({
        success: false,
        message: 'No approved items found for this order'
      });
    }

    const invoice = await invoiceService.createInvoiceFromApprovedItems(orderId, companyId, createdBy);
    
    res.status(201).json({
      success: true,
      message: 'Invoice created successfully',
      data: invoice
    });
  } catch (error) {
    console.error('Error creating invoice:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating invoice',
      error: error.message
    });
  }
};

/**
 * Update invoice status
 */
exports.updateInvoiceStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, ...updateData } = req.body;
    
    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }

    const validStatuses = ['draft', 'sent', 'paid', 'overdue', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be one of: ' + validStatuses.join(', ')
      });
    }

    const invoice = await invoiceService.updateInvoiceStatus(id, status, updateData);
    
    res.json({
      success: true,
      message: 'Invoice status updated successfully',
      data: invoice
    });
  } catch (error) {
    console.error('Error updating invoice status:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating invoice status',
      error: error.message
    });
  }
};

/**
 * Add payment to invoice
 */
exports.addPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, notes } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid payment amount is required'
      });
    }

    const invoice = await invoiceService.addPayment(id, amount, notes);
    
    res.json({
      success: true,
      message: 'Payment added successfully',
      data: invoice
    });
  } catch (error) {
    console.error('Error adding payment:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding payment',
      error: error.message
    });
  }
};

/**
 * Create a new invoice manually
 */
exports.createInvoice = async (req, res) => {
  try {
    const companyId = req.headers?.['x-company-id'] || req.user?.company_id || "RESSICHEM";
    const invoiceData = req.body;
    
    // Add company_id and createdBy to the invoice data
    invoiceData.company_id = companyId;
    invoiceData.createdBy = req.user._id;
    
    const invoice = await invoiceService.createInvoice(invoiceData);
    
    res.status(201).json({
      success: true,
      message: 'Invoice created successfully',
      data: invoice
    });
  } catch (error) {
    console.error('Error creating invoice:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating invoice',
      error: error.message
    });
  }
};

/**
 * Update an existing invoice
 */
exports.updateInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    // Remove fields that shouldn't be updated directly
    delete updateData._id;
    delete updateData.invoiceNumber;
    delete updateData.company_id;
    delete updateData.createdAt;
    delete updateData.updatedAt;
    
    const invoice = await invoiceService.updateInvoice(id, updateData);
    
    res.json({
      success: true,
      message: 'Invoice updated successfully',
      data: invoice
    });
  } catch (error) {
    console.error('Error updating invoice:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating invoice',
      error: error.message
    });
  }
};

/**
 * Delete an invoice
 */
exports.deleteInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    
    await invoiceService.deleteInvoice(id);
    
    res.json({
      success: true,
      message: 'Invoice deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting invoice:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting invoice',
      error: error.message
    });
  }
};

/**
 * Duplicate an invoice
 */
exports.duplicateInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    const companyId = req.headers?.['x-company-id'] || req.user?.company_id || "RESSICHEM";
    
    const invoice = await invoiceService.duplicateInvoice(id, companyId, req.user._id);
    
    res.status(201).json({
      success: true,
      message: 'Invoice duplicated successfully',
      data: invoice
    });
  } catch (error) {
    console.error('Error duplicating invoice:', error);
    res.status(500).json({
      success: false,
      message: 'Error duplicating invoice',
      error: error.message
    });
  }
};

/**
 * Get invoice statistics
 */
exports.getInvoiceStats = async (req, res) => {
  try {
    console.log('🔍 Backend: getInvoiceStats called');
    console.log('🔍 User info:', {
      user_id: req.user?.user_id,
      _id: req.user?._id,
      company_id: req.user?.company_id,
      email: req.user?.email,
      isManager: req.user?.isManager,
      isCustomer: req.user?.isCustomer
    });
    
    const companyId = req.headers?.['x-company-id'] || req.user?.company_id || "RESSICHEM";
    let customerId = null;
    
    // Check if user is a customer - if so, filter by their customer record
    if (req.user && req.user.isCustomer) {
      const Customer = require('../models/Customer');
      const currentUser = await require('../models/User').findById(req.user._id).select('email');
      
      console.log(`🔍 Customer user detected for stats: ${req.user.email}, User ID: ${req.user._id}`);
      
      if (currentUser) {
        const customer = await Customer.findOne({ 
          email: currentUser.email,
          company_id: companyId 
        });
        
        console.log(`🔍 Found customer record for stats:`, customer ? { id: customer._id, email: customer.email, companyName: customer.companyName } : 'Not found');
        
        if (customer) {
          customerId = customer._id;
          console.log(`🔍 Customer ${req.user.email} - filtering stats for customer ID: ${customer._id}`);
        } else {
          console.log(`⚠️ Customer user ${req.user.email} not found in customer records`);
          // Return empty stats if customer not found
          return res.json({
            success: true,
            data: {
              totalInvoices: 0,
              totalAmount: 0,
              paidAmount: 0,
              pendingAmount: 0,
              draftInvoices: 0,
              sentInvoices: 0,
              paidInvoices: 0,
              overdueInvoices: 0
            }
          });
        }
      }
    }
    
    const stats = await invoiceService.getInvoiceStats(companyId, customerId);
    
    console.log('🔍 Invoice stats:', stats);
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching invoice stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching invoice statistics',
      error: error.message
    });
  }
};

/**
 * Get invoices by order number
 */
exports.getInvoicesByOrder = async (req, res) => {
  try {
    const { orderNumber } = req.params;
    const companyId = req.headers?.['x-company-id'] || req.user?.company_id || "RESSICHEM";
    
    const invoices = await invoiceService.getInvoices(companyId, { orderNumber });
    
    res.json({
      success: true,
      data: invoices,
      count: invoices.length
    });
  } catch (error) {
    console.error('Error fetching invoices by order:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching invoices for order',
      error: error.message
    });
  }
};
