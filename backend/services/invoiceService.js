const Invoice = require('../models/Invoice');
const Order = require('../models/Order');
const OrderItemApproval = require('../models/OrderItemApproval');
const Customer = require('../models/Customer');
const Product = require('../models/Product');
const User = require('../models/User');
const customerLedgerService = require('./customerLedgerService');

class InvoiceService {
  /**
   * Create invoice from approved order items
   * @param {string} orderId - Order ID
   * @param {string} companyId - Company ID
   * @returns {Promise<Object>} Created invoice
   */
  async createInvoiceFromApprovedItems(orderId, companyId = "RESSICHEM", createdBy = null) {
    try {
      console.log(`📄 Creating invoice for order ${orderId}`);
      
      // Get order with populated data
      const order = await Order.findById(orderId)
        .populate('customer', 'companyName email street city state zip country')
        .populate('items.product', 'name category')
        .populate('createdBy', 'firstName lastName email');
      
      if (!order) {
        throw new Error('Order not found');
      }

      // Get all approved items for this order
      const approvedItems = await OrderItemApproval.find({
        orderId: orderId,
        status: 'approved'
      }).populate('product', 'name category')
        .populate('approvedBy', 'firstName lastName email');

      if (approvedItems.length === 0) {
        throw new Error('No approved items found for this order');
      }

      console.log(`📄 Found ${approvedItems.length} approved items for invoice`);

      // Generate invoice number
      const invoiceNumber = Invoice.generateInvoiceNumber(companyId);

      // Prepare invoice items from approved items
      const invoiceItems = approvedItems.map(approval => {
        const product = approval.product;
        const finalAmount = approval.originalAmount - (approval.discountAmount || 0);
        
        return {
          product: product._id,
          productName: product.name,
          category: approval.category,
          quantity: 1, // Assuming 1 quantity per approval
          unitPrice: approval.originalAmount,
          originalAmount: approval.originalAmount,
          discountPercentage: approval.discountPercentage || 0,
          discountAmount: approval.discountAmount || 0,
          finalAmount: finalAmount,
          approvedBy: approval.approvedBy,
          approvedAt: approval.approvedAt,
          comments: approval.comments
        };
      });

      // Calculate totals
      const subtotal = invoiceItems.reduce((sum, item) => sum + item.finalAmount, 0);
      const totalDiscount = invoiceItems.reduce((sum, item) => sum + item.discountAmount, 0);
      const taxRate = 0; // Default tax rate - can be made configurable
      const taxAmount = subtotal * (taxRate / 100);
      const total = subtotal + taxAmount;

      // Calculate due date (30 days from invoice date)
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 30);

      // Create invoice
      const invoice = new Invoice({
        invoiceNumber,
        orderNumber: order.orderNumber,
        orderId: order._id,
        customer: order.customer._id,
        customerName: order.customer.companyName,
        customerEmail: order.customer.email,
        customerAddress: {
          street: order.customer.street,
          city: order.customer.city,
          state: order.customer.state,
          zip: order.customer.zip,
          country: order.customer.country
        },
        items: invoiceItems,
        subtotal,
        totalDiscount,
        taxRate,
        taxAmount,
        total,
        dueDate,
        paymentTerms: "Net 30",
        company_id: companyId,
        companyInfo: {
          name: "Ressichem",
          address: "Your Company Address",
          phone: "+92-XXX-XXXXXXX",
          email: "info@ressichem.com",
          taxId: "TAX-ID-XXXXX"
        },
        createdBy: createdBy || order.createdBy,
        approvedItems: approvedItems.map(item => item._id),
        notes: `Invoice generated from order ${order.orderNumber}`,
        internalNotes: `Auto-generated from approved items. Order created by ${order.createdBy?.firstName} ${order.createdBy?.lastName}`
      });

      await invoice.save();
      console.log(`✅ Invoice created successfully: ${invoiceNumber}`);

      // Add invoice transaction to customer ledger
      try {
        await customerLedgerService.addInvoiceTransaction(invoice._id, invoice, companyId, createdBy);
        console.log(`✅ Added invoice transaction to customer ledger for invoice ${invoiceNumber}`);
      } catch (ledgerError) {
        console.error('❌ Error adding invoice to customer ledger:', ledgerError);
        // Don't throw error - invoice creation should still succeed
      }

      // Send notification about invoice creation
      await this.notifyInvoiceCreated(invoice, order);

      return invoice;
    } catch (error) {
      console.error('❌ Error creating invoice:', error);
      throw error;
    }
  }

  /**
   * Get invoice by ID
   * @param {string} invoiceId - Invoice ID
   * @returns {Promise<Object>} Invoice with populated data
   */
  async getInvoiceById(invoiceId) {
    try {
      const invoice = await Invoice.findById(invoiceId)
        .populate('customer', 'companyName email phone street city state zip country')
        .populate('items.product', 'name description category')
        .populate('items.approvedBy', 'firstName lastName email')
        .populate('createdBy', 'firstName lastName email')
        .populate('approvedItems', 'status comments discountAmount');

      if (!invoice) {
        throw new Error('Invoice not found');
      }

      // Transform the invoice data to match frontend expectations
      const transformedInvoice = {
        ...invoice.toObject(),
        company: {
          name: invoice.companyInfo?.name || 'Ressichem',
          address: invoice.companyInfo?.address || 'Your Company Address',
          phone: invoice.companyInfo?.phone || '+92-XXX-XXXXXXX',
          email: invoice.companyInfo?.email || 'info@ressichem.com',
          taxId: invoice.companyInfo?.taxId || 'TAX-ID-XXXXX'
        },
        customer: {
          name: invoice.customerName || invoice.customer?.companyName || 'Customer Name',
          email: invoice.customerEmail || invoice.customer?.email || 'customer@example.com',
          address: invoice.customerAddress?.street || invoice.customer?.street || 'Customer Address',
          city: invoice.customerAddress?.city || invoice.customer?.city || 'City',
          state: invoice.customerAddress?.state || invoice.customer?.state || 'State',
          zipCode: invoice.customerAddress?.zip || invoice.customer?.zip || 'ZIP',
          country: invoice.customerAddress?.country || invoice.customer?.country || 'Country'
        }
      };

      return transformedInvoice;
    } catch (error) {
      console.error('❌ Error getting invoice:', error);
      throw error;
    }
  }

  /**
   * Get all invoices for a company
   * @param {string} companyId - Company ID
   * @param {Object} filters - Filter options
   * @returns {Promise<Array>} List of invoices
   */
  async getInvoices(companyId, filters = {}) {
    try {
      console.log('🔍 InvoiceService: getInvoices called');
      console.log('🔍 Company ID:', companyId);
      console.log('🔍 Filters:', filters);
      
      const query = { company_id: companyId };
      
      // Apply filters
      if (filters.status) {
        query.status = filters.status;
      }
      if (filters.customer) {
        query.customer = filters.customer;
      }
      if (filters.orderNumber) {
        query.orderNumber = filters.orderNumber;
      }
      if (filters.managerId) {
        // For manager-specific filtering, we need to find invoices where the manager approved any of the items
        if (filters.managerApprovedOnly) {
          // First, try to find the User by manager_id (if managerId is a manager_id string)
          // or use it directly if it's already a User ObjectId
          let userId = filters.managerId;
          
          // Check if managerId looks like a manager_id string (not an ObjectId)
          // ObjectIds are 24 character hex strings
          if (filters.managerId.length !== 24 || !/^[0-9a-fA-F]{24}$/.test(filters.managerId)) {
            // It's likely a manager_id string, find the User by managerProfile.manager_id
            const managerUser = await User.findOne({
              'managerProfile.manager_id': filters.managerId,
              company_id: companyId
            }).select('_id');
            
            if (managerUser) {
              userId = managerUser._id;
              console.log('🔍 Found User by manager_id:', filters.managerId, '-> User._id:', userId);
            } else {
              // If not found, try to find by user_id
              const userById = await User.findOne({
                user_id: filters.managerId,
                company_id: companyId
              }).select('_id');
              
              if (userById) {
                userId = userById._id;
                console.log('🔍 Found User by user_id:', filters.managerId, '-> User._id:', userId);
              } else {
                console.warn('⚠️ Could not find User for managerId:', filters.managerId);
                // Return empty result instead of throwing error
                return [];
              }
            }
          }
          
          // Find all approved items by this user (using User._id)
          const approvedItems = await OrderItemApproval.find({
            approvedBy: userId,
            status: 'approved'
          }).select('_id');
          
          const approvedItemIds = approvedItems.map(item => item._id);
          console.log('🔍 Manager approved items:', approvedItemIds.length);
          
          if (approvedItemIds.length === 0) {
            // No approved items found, return empty array
            console.log('🔍 No approved items found for manager, returning empty invoices');
            return [];
          }
          
          // Find invoices that contain any of these approved items
          query.approvedItems = { $in: approvedItemIds };
          console.log('🔍 Filtering by approved items:', approvedItemIds);
        } else {
          // Original behavior - filter by createdBy
          // Also handle manager_id -> User._id conversion
          let userId = filters.managerId;
          
          if (filters.managerId.length !== 24 || !/^[0-9a-fA-F]{24}$/.test(filters.managerId)) {
            const managerUser = await User.findOne({
              'managerProfile.manager_id': filters.managerId,
              company_id: companyId
            }).select('_id');
            
            if (managerUser) {
              userId = managerUser._id;
            } else {
              const userById = await User.findOne({
                user_id: filters.managerId,
                company_id: companyId
              }).select('_id');
              
              if (userById) {
                userId = userById._id;
              }
            }
          }
          
          query.createdBy = userId;
          console.log('🔍 Added managerId filter (createdBy):', userId);
        }
      }
      if (filters.dateFrom || filters.dateTo) {
        query.invoiceDate = {};
        
        // If only dateFrom is provided (no dateTo), filter to show only that specific date
        // If both are provided, show the date range
        if (filters.dateFrom && !filters.dateTo) {
          // Only dateFrom selected - show ONLY invoices on that exact date
          const [year, month, day] = filters.dateFrom.split('-').map(Number);
          const dateFrom = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
          const dateTo = new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999));
          query.invoiceDate.$gte = dateFrom;
          query.invoiceDate.$lte = dateTo;
          console.log('🔍 Date From only (exact date):', filters.dateFrom);
          console.log('   Date range:', dateFrom.toISOString(), 'to', dateTo.toISOString());
        } else if (filters.dateFrom && filters.dateTo) {
          // Both dateFrom and dateTo provided - show date range
          const [yearFrom, monthFrom, dayFrom] = filters.dateFrom.split('-').map(Number);
          const [yearTo, monthTo, dayTo] = filters.dateTo.split('-').map(Number);
          const dateFrom = new Date(Date.UTC(yearFrom, monthFrom - 1, dayFrom, 0, 0, 0, 0));
          const dateTo = new Date(Date.UTC(yearTo, monthTo - 1, dayTo, 23, 59, 59, 999));
          query.invoiceDate.$gte = dateFrom;
          query.invoiceDate.$lte = dateTo;
          console.log('🔍 Date range:', filters.dateFrom, 'to', filters.dateTo);
          console.log('   Date range:', dateFrom.toISOString(), 'to', dateTo.toISOString());
        } else if (!filters.dateFrom && filters.dateTo) {
          // Only dateTo provided - show all invoices up to that date
          const [year, month, day] = filters.dateTo.split('-').map(Number);
          const dateTo = new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999));
          query.invoiceDate.$lte = dateTo;
          console.log('🔍 Date To only (up to date):', filters.dateTo, '->', dateTo.toISOString());
        }
      }

      // Log the query with proper date serialization
      const queryForLog = {
        ...query,
        invoiceDate: query.invoiceDate ? {
          $gte: query.invoiceDate.$gte ? query.invoiceDate.$gte.toISOString() : undefined,
          $lte: query.invoiceDate.$lte ? query.invoiceDate.$lte.toISOString() : undefined
        } : undefined
      };
      console.log('🔍 Final query:', JSON.stringify(queryForLog, null, 2));

      const invoices = await Invoice.find(query)
        .populate('customer', 'companyName email')
        .populate('createdBy', 'firstName lastName email')
        .populate('approvedItems', 'approvedBy productName originalAmount')
        .sort({ invoiceDate: -1 })
        .limit(filters.limit || 50);

      console.log('🔍 Query result:', invoices.length, 'invoices found');
      if (invoices.length > 0 && query.invoiceDate) {
        console.log('🔍 Sample invoice dates:', invoices.slice(0, 3).map(inv => ({
          invoiceNumber: inv.invoiceNumber,
          invoiceDate: inv.invoiceDate ? inv.invoiceDate.toISOString() : 'N/A'
        })));
      }
      return invoices;
    } catch (error) {
      console.error('❌ Error getting invoices:', error);
      throw error;
    }
  }

  /**
   * Update invoice status
   * @param {string} invoiceId - Invoice ID
   * @param {string} status - New status
   * @param {Object} updateData - Additional update data
   * @returns {Promise<Object>} Updated invoice
   */
  async updateInvoiceStatus(invoiceId, status, updateData = {}) {
    try {
      const invoice = await Invoice.findById(invoiceId);
      if (!invoice) {
        throw new Error('Invoice not found');
      }

      // Update status and related fields
      invoice.status = status;
      
      if (status === 'sent') {
        invoice.sentAt = new Date();
      } else if (status === 'paid') {
        invoice.paidAt = new Date();
        invoice.paymentStatus = 'paid';
        invoice.paidAmount = invoice.total;
        invoice.remainingAmount = 0;
      } else if (status === 'cancelled') {
        invoice.cancelledAt = new Date();
      }

      // Apply additional updates
      Object.assign(invoice, updateData);

      await invoice.save();
      console.log(`✅ Invoice ${invoice.invoiceNumber} status updated to ${status}`);

      return invoice;
    } catch (error) {
      console.error('❌ Error updating invoice status:', error);
      throw error;
    }
  }

  /**
   * Add payment to invoice
   * @param {string} invoiceId - Invoice ID
   * @param {number} amount - Payment amount
   * @param {string} notes - Payment notes
   * @returns {Promise<Object>} Updated invoice
   */
  async addPayment(invoiceId, amount, notes = '') {
    try {
      const invoice = await Invoice.findById(invoiceId);
      if (!invoice) {
        throw new Error('Invoice not found');
      }

      const newPaidAmount = invoice.paidAmount + amount;
      const remainingAmount = invoice.total - newPaidAmount;

      if (newPaidAmount > invoice.total) {
        throw new Error('Payment amount exceeds invoice total');
      }

      invoice.paidAmount = newPaidAmount;
      invoice.remainingAmount = remainingAmount;
      invoice.paymentStatus = remainingAmount === 0 ? 'paid' : 'partial';
      
      if (remainingAmount === 0) {
        invoice.status = 'paid';
        invoice.paidAt = new Date();
      }

      // Add payment note
      if (notes) {
        invoice.internalNotes = (invoice.internalNotes || '') + `\nPayment: ${amount} - ${notes}`;
      }

      await invoice.save();
      console.log(`✅ Payment of ${amount} added to invoice ${invoice.invoiceNumber}`);

      // Send payment notification
      await this.notifyPaymentReceived(invoice, amount, notes);

      return invoice;
    } catch (error) {
      console.error('❌ Error adding payment:', error);
      throw error;
    }
  }

  /**
   * Check if order has any approved items ready for invoicing
   * @param {string} orderId - Order ID
   * @returns {Promise<boolean>} True if order has approved items
   */
  async hasApprovedItemsForInvoicing(orderId) {
    try {
      const approvedCount = await OrderItemApproval.countDocuments({
        orderId: orderId,
        status: 'approved'
      });

      return approvedCount > 0;
    } catch (error) {
      console.error('❌ Error checking approved items:', error);
      return false;
    }
  }

  /**
   * Get invoice statistics for dashboard
   * @param {string} companyId - Company ID
   * @returns {Promise<Object>} Invoice statistics
   */
  async getInvoiceStats(companyId, customerId = null) {
    try {
      // Build match query
      const matchQuery = { company_id: companyId };
      
      // If customerId is provided, filter by customer
      if (customerId) {
        matchQuery.customer = customerId;
        console.log('🔍 Filtering invoice stats for customer:', customerId);
      }
      
      const stats = await Invoice.aggregate([
        { $match: matchQuery },
        {
          $group: {
            _id: null,
            totalInvoices: { $sum: 1 },
            totalAmount: { $sum: '$total' },
            paidAmount: { $sum: '$paidAmount' },
            pendingAmount: { $sum: { $subtract: ['$total', '$paidAmount'] } },
            draftInvoices: {
              $sum: { $cond: [{ $eq: ['$status', 'draft'] }, 1, 0] }
            },
            sentInvoices: {
              $sum: { $cond: [{ $eq: ['$status', 'sent'] }, 1, 0] }
            },
            paidInvoices: {
              $sum: { $cond: [{ $eq: ['$status', 'paid'] }, 1, 0] }
            },
            overdueInvoices: {
              $sum: {
                $cond: [
                  {
                    $and: [
                      { $ne: ['$status', 'paid'] },
                      { $ne: ['$status', 'cancelled'] },
                      { $lt: ['$dueDate', new Date()] }
                    ]
                  },
                  1,
                  0
                ]
              }
            }
          }
        }
      ]);

      return stats[0] || {
        totalInvoices: 0,
        totalAmount: 0,
        paidAmount: 0,
        pendingAmount: 0,
        draftInvoices: 0,
        sentInvoices: 0,
        paidInvoices: 0,
        overdueInvoices: 0
      };
    } catch (error) {
      console.error('❌ Error getting invoice stats:', error);
      throw error;
    }
  }

  /**
   * Create a new invoice manually
   * @param {Object} invoiceData - Invoice data
   * @returns {Promise<Object>} Created invoice
   */
  async createInvoice(invoiceData) {
    try {
      console.log('📄 Creating manual invoice:', invoiceData);
      
      // Generate invoice number if not provided
      if (!invoiceData.invoiceNumber) {
        invoiceData.invoiceNumber = Invoice.generateInvoiceNumber(invoiceData.company_id);
      }
      
      // Calculate totals if not provided
      if (invoiceData.items && invoiceData.items.length > 0) {
        const subtotal = invoiceData.items.reduce((sum, item) => sum + item.finalAmount, 0);
        const totalDiscount = invoiceData.items.reduce((sum, item) => sum + (item.discountAmount || 0), 0);
        const taxRate = invoiceData.taxRate || 0;
        const taxAmount = subtotal * (taxRate / 100);
        const total = subtotal + taxAmount;
        
        invoiceData.subtotal = subtotal;
        invoiceData.totalDiscount = totalDiscount;
        invoiceData.taxAmount = taxAmount;
        invoiceData.total = total;
        invoiceData.remainingAmount = total;
      }
      
      // Set due date if not provided
      if (!invoiceData.dueDate) {
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 30);
        invoiceData.dueDate = dueDate;
      }
      
      const invoice = new Invoice(invoiceData);
      await invoice.save();
      
      console.log(`✅ Manual invoice created: ${invoice.invoiceNumber}`);
      return invoice;
    } catch (error) {
      console.error('❌ Error creating manual invoice:', error);
      throw error;
    }
  }

  /**
   * Update an existing invoice
   * @param {string} invoiceId - Invoice ID
   * @param {Object} updateData - Update data
   * @returns {Promise<Object>} Updated invoice
   */
  async updateInvoice(invoiceId, updateData) {
    try {
      console.log('📄 Updating invoice:', invoiceId, updateData);
      
      const invoice = await Invoice.findById(invoiceId);
      if (!invoice) {
        throw new Error('Invoice not found');
      }
      
      // Recalculate totals if items are updated
      if (updateData.items && updateData.items.length > 0) {
        const subtotal = updateData.items.reduce((sum, item) => sum + item.finalAmount, 0);
        const totalDiscount = updateData.items.reduce((sum, item) => sum + (item.discountAmount || 0), 0);
        const taxRate = updateData.taxRate || invoice.taxRate || 0;
        const taxAmount = subtotal * (taxRate / 100);
        const total = subtotal + taxAmount;
        
        updateData.subtotal = subtotal;
        updateData.totalDiscount = totalDiscount;
        updateData.taxAmount = taxAmount;
        updateData.total = total;
        updateData.remainingAmount = total - invoice.paidAmount;
      }
      
      // Update the invoice
      Object.assign(invoice, updateData);
      await invoice.save();
      
      console.log(`✅ Invoice updated: ${invoice.invoiceNumber}`);
      return invoice;
    } catch (error) {
      console.error('❌ Error updating invoice:', error);
      throw error;
    }
  }

  /**
   * Delete an invoice
   * @param {string} invoiceId - Invoice ID
   * @returns {Promise<void>}
   */
  async deleteInvoice(invoiceId) {
    try {
      console.log('📄 Deleting invoice:', invoiceId);
      
      const invoice = await Invoice.findById(invoiceId);
      if (!invoice) {
        throw new Error('Invoice not found');
      }
      
      // Check if invoice can be deleted (only draft invoices can be deleted)
      if (invoice.status !== 'draft') {
        throw new Error('Only draft invoices can be deleted');
      }
      
      await Invoice.findByIdAndDelete(invoiceId);
      console.log(`✅ Invoice deleted: ${invoice.invoiceNumber}`);
    } catch (error) {
      console.error('❌ Error deleting invoice:', error);
      throw error;
    }
  }

  /**
   * Duplicate an invoice
   * @param {string} invoiceId - Original invoice ID
   * @param {string} companyId - Company ID
   * @param {string} createdBy - User ID who created the duplicate
   * @returns {Promise<Object>} Duplicated invoice
   */
  async duplicateInvoice(invoiceId, companyId, createdBy) {
    try {
      console.log('📄 Duplicating invoice:', invoiceId);
      
      const originalInvoice = await Invoice.findById(invoiceId);
      if (!originalInvoice) {
        throw new Error('Original invoice not found');
      }
      
      // Create a copy of the invoice data
      const invoiceData = originalInvoice.toObject();
      
      // Remove fields that should be unique or reset
      delete invoiceData._id;
      delete invoiceData.invoiceNumber;
      delete invoiceData.createdAt;
      delete invoiceData.updatedAt;
      delete invoiceData.sentAt;
      delete invoiceData.paidAt;
      delete invoiceData.cancelledAt;
      
      // Reset status and payment info
      invoiceData.status = 'draft';
      invoiceData.paymentStatus = 'unpaid';
      invoiceData.paidAmount = 0;
      invoiceData.remainingAmount = invoiceData.total;
      invoiceData.company_id = companyId;
      invoiceData.createdBy = createdBy;
      
      // Generate new invoice number
      invoiceData.invoiceNumber = Invoice.generateInvoiceNumber(companyId);
      
      // Update invoice date to current date
      invoiceData.invoiceDate = new Date();
      
      // Set new due date
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 30);
      invoiceData.dueDate = dueDate;
      
      const duplicateInvoice = new Invoice(invoiceData);
      await duplicateInvoice.save();
      
      console.log(`✅ Invoice duplicated: ${duplicateInvoice.invoiceNumber}`);
      return duplicateInvoice;
    } catch (error) {
      console.error('❌ Error duplicating invoice:', error);
      throw error;
    }
  }

  /**
   * Send notification about invoice creation
   * @param {Object} invoice - Created invoice
   * @param {Object} order - Original order
   */
  async notifyInvoiceCreated(invoice, order) {
    try {
      const notificationService = require('./notificationService');

      // Create notification using the notification service
      const notification = await notificationService.createNotification({
        title: 'Invoice Created',
        message: `Invoice ${invoice.invoiceNumber} has been created for order ${order.orderNumber}`,
        type: 'invoice',
        priority: 'medium',
        targetType: 'customer',
        targetIds: [order.customer._id],
        company_id: invoice.company_id,
        sender_id: 'system',
        sender_name: 'System',
        data: {
          invoiceId: invoice._id,
          invoiceNumber: invoice.invoiceNumber,
          orderId: order._id,
          orderNumber: order.orderNumber,
          total: invoice.total,
          dueDate: invoice.dueDate
        }
      });

      await notificationService.sendNotification(notification._id);
      console.log(`✅ Invoice creation notification sent`);

    } catch (error) {
      console.error('❌ Error sending invoice notification:', error);
      // Don't throw error - notification failure shouldn't break invoice creation
    }
  }

  /**
   * Send notification about payment received
   * @param {Object} invoice - Updated invoice
   * @param {number} amount - Payment amount
   * @param {string} notes - Payment notes
   */
  async notifyPaymentReceived(invoice, amount, notes = '') {
    try {
      const notificationService = require('./notificationService');

      // Determine notification message based on payment status
      let message = '';
      let priority = 'medium';
      
      if (invoice.paymentStatus === 'paid') {
        message = `Invoice ${invoice.invoiceNumber} has been fully paid (${amount.toLocaleString()} PKR)`;
        priority = 'high';
      } else if (invoice.paymentStatus === 'partial') {
        message = `Partial payment of ${amount.toLocaleString()} PKR received for invoice ${invoice.invoiceNumber}. Remaining: ${invoice.remainingAmount.toLocaleString()} PKR`;
        priority = 'medium';
      }

      // Create notification using the notification service
      const notification = await notificationService.createNotification({
        title: 'Payment Received',
        message: message,
        type: 'payment',
        priority: priority,
        targetType: 'customer',
        targetIds: [invoice.customer],
        company_id: invoice.company_id,
        sender_id: 'system',
        sender_name: 'System',
        data: {
          invoiceId: invoice._id,
          invoiceNumber: invoice.invoiceNumber,
          paymentAmount: amount,
          paymentStatus: invoice.paymentStatus,
          remainingAmount: invoice.remainingAmount,
          totalAmount: invoice.total,
          notes: notes
        }
      });

      await notificationService.sendNotification(notification._id);
      console.log(`✅ Payment notification sent`);

    } catch (error) {
      console.error('❌ Error sending payment notification:', error);
      // Don't throw error - notification failure shouldn't break payment processing
    }
  }
}

module.exports = new InvoiceService();
