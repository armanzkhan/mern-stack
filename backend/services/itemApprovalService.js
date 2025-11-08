const OrderItemApproval = require('../models/OrderItemApproval');
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const Customer = require('../models/Customer');
const notificationService = require('./notificationService');
const invoiceService = require('./invoiceService');
const realtimeService = require('./realtimeService');

class ItemApprovalService {
  
  /**
   * Create approval entries for each item in an order
   * Routes items to their respective category managers
   */
  async createItemApprovals(order) {
    try {
      console.log('🔍 Creating item approvals for order:', order.orderNumber);
      
      const itemApprovals = [];
      
      // Get all products with their categories
      const productIds = order.items.map(item => item.product);
      const products = await Product.find({ _id: { $in: productIds } });
      const productMap = new Map(products.map(p => [p._id.toString(), p]));
      
      for (let i = 0; i < order.items.length; i++) {
        const item = order.items[i];
        const product = productMap.get(item.product.toString());
        
        if (!product) {
          console.error(`❌ Product not found for item ${i}:`, item.product);
          continue;
        }
        
        // Determine the category for this item
        let category = '';
        if (typeof product.category === 'string') {
          category = product.category;
        } else if (product.category && product.category.mainCategory) {
          category = product.category.mainCategory;
        }
        
        if (!category) {
          console.warn(`⚠️ No category found for product ${product.name}, skipping approval`);
          continue;
        }
        
        // Find managers assigned to this category
        const managers = await this.getManagersForCategory(category, order.company_id);
        
        if (managers.length === 0) {
          console.warn(`⚠️ No managers found for category ${category}, auto-approving item`);
          // Auto-approve if no manager is assigned
          itemApprovals.push({
            orderId: order._id,
            itemIndex: i,
            product: item.product,
            category: category,
            assignedManager: null, // No manager assigned
            status: 'approved',
            approvedBy: null,
            approvedAt: new Date(),
            originalAmount: item.total,
            company_id: order.company_id
          });
        } else {
          // Assign to ONLY the first manager for this category (not all managers)
          // This ensures each item goes to only one manager
          const assignedManager = managers[0];
          console.log(`📋 Assigning item ${i} (${category}) to manager: ${assignedManager.email}`);
          
          itemApprovals.push({
            orderId: order._id,
            itemIndex: i,
            product: item.product,
            category: category,
            assignedManager: assignedManager._id,
            status: 'pending',
            originalAmount: item.total,
            company_id: order.company_id
          });
        }
      }
      
      // Save all approval entries
      if (itemApprovals.length > 0) {
        await OrderItemApproval.insertMany(itemApprovals);
        console.log(`✅ Created ${itemApprovals.length} item approval entries`);
        
        // Send notifications to managers
        await this.notifyManagers(itemApprovals);
      }
      
      return itemApprovals;
    } catch (error) {
      console.error('❌ Error creating item approvals:', error);
      throw error;
    }
  }
  
  /**
   * Get managers assigned to a specific category
   */
  async getManagersForCategory(category, companyId) {
    try {
      const managers = await User.find({
        company_id: companyId,
        isManager: true,
        isActive: true,
        'managerProfile.assignedCategories': category
      });
      
      console.log(`👥 Found ${managers.length} managers for category ${category}`);
      return managers;
    } catch (error) {
      console.error('❌ Error getting managers for category:', error);
      return [];
    }
  }
  
  /**
   * Notify managers about items requiring approval
   */
  async notifyManagers(itemApprovals) {
    try {
      // Group approvals by manager
      const managerApprovals = new Map();
      
      for (const approval of itemApprovals) {
        if (!approval.assignedManager) continue;
        
        if (!managerApprovals.has(approval.assignedManager.toString())) {
          managerApprovals.set(approval.assignedManager.toString(), []);
        }
        managerApprovals.get(approval.assignedManager.toString()).push(approval);
      }
      
      // Send notification to each manager
      for (const [managerId, approvals] of managerApprovals) {
        const manager = await User.findById(managerId);
        if (!manager) continue;
        
        const order = await Order.findById(approvals[0].orderId);
        if (!order) continue;
        
        // Create notification
        const notification = await notificationService.createNotification({
          title: 'Items Require Your Approval',
          message: `You have ${approvals.length} item(s) from order #${order.orderNumber} requiring approval`,
          type: 'approval_required',
          priority: 'high',
          targetType: 'user',
          targetIds: [managerId],
          company_id: order.company_id,
          sender_id: 'system',
          sender_name: 'System',
          data: {
            orderId: order._id,
            orderNumber: order.orderNumber,
            itemCount: approvals.length,
            categories: [...new Set(approvals.map(a => a.category))],
            url: `/orders/${order._id}/approve`
          }
        });
        
        await notificationService.sendNotification(notification._id);
        
        // Send real-time notification
        realtimeService.sendToUser(managerId, {
          type: 'item_approval_required',
          orderId: order._id,
          orderNumber: order.orderNumber,
          itemCount: approvals.length,
          categories: [...new Set(approvals.map(a => a.category))]
        });
        
        console.log(`📧 Sent approval notification to manager ${manager.email}`);
      }
    } catch (error) {
      console.error('❌ Error notifying managers:', error);
    }
  }
  
  /**
   * Get pending approvals for a specific manager
   */
  async getManagerAllApprovals(managerId, companyId) {
    try {
      console.log(`🔍 Getting all approvals for manager ${managerId} in company ${companyId}`);
      
      const approvals = await OrderItemApproval.find({
        assignedManager: managerId,
        company_id: companyId
      })
      .populate({
        path: 'orderId',
        select: 'orderNumber customer status createdAt',
        populate: {
          path: 'customer',
          select: 'companyName contactName email'
        }
      })
      .populate('product', 'name description price category')
      .sort({ createdAt: -1 });
      
      console.log(`✅ Found ${approvals.length} total approvals`);
      
      // Transform the data to match frontend expectations
      const transformedApprovals = approvals.map(approval => {
        // Add null checks for populated fields
        if (!approval.orderId) {
          console.warn(`⚠️ OrderId is null for approval ${approval._id}`);
        }
        if (!approval.product) {
          console.warn(`⚠️ Product is null for approval ${approval._id}`);
        }
        
        return {
          _id: approval._id,
          orderId: approval.orderId?._id || null,
          itemIndex: approval.itemIndex,
          product: approval.product ? {
            _id: approval.product._id,
            name: approval.product.name,
            description: approval.product.description || '',
            price: approval.product.price
          } : null,
          category: approval.category,
          status: approval.status,
          originalAmount: approval.originalAmount,
          comments: approval.comments,
          discountPercentage: approval.discountPercentage,
          discountAmount: approval.discountAmount,
          approvedBy: approval.approvedBy,
          approvedAt: approval.approvedAt,
          rejectedAt: approval.rejectedAt,
          order: approval.orderId ? {
            _id: approval.orderId._id,
            orderNumber: approval.orderId.orderNumber,
            status: approval.orderId.status || 'pending',
            customer: approval.orderId.customer ? {
              _id: approval.orderId.customer._id,
              companyName: approval.orderId.customer.companyName || 'Unknown Company',
              contactName: approval.orderId.customer.contactName || 'Unknown Contact',
              email: approval.orderId.customer.email || 'Unknown Email'
            } : {
              _id: null,
              companyName: 'Unknown Company',
              contactName: 'Unknown Contact',
              email: 'Unknown Email'
            },
            createdAt: approval.orderId.createdAt
          } : {
            _id: null,
            orderNumber: 'Unknown Order',
            status: 'pending',
            customer: {
              _id: null,
              companyName: 'Unknown Company',
              contactName: 'Unknown Contact',
              email: 'Unknown Email'
            },
            createdAt: null
          }
        };
      });
      
      return transformedApprovals;
    } catch (error) {
      console.error('❌ Error getting all manager approvals:', error);
      return [];
    }
  }

  async getManagerPendingApprovals(managerId, companyId) {
    try {
      console.log(`🔍 Getting pending approvals for manager ${managerId} in company ${companyId}`);
      
      const approvals = await OrderItemApproval.find({
        assignedManager: managerId,
        status: 'pending',
        company_id: companyId
      })
      .populate({
        path: 'orderId',
        select: 'orderNumber customer status createdAt',
        populate: {
          path: 'customer',
          select: 'companyName contactName email'
        }
      })
      .populate('product', 'name description price category')
      .sort({ createdAt: -1 });
      
      console.log(`✅ Found ${approvals.length} pending approvals`);
      
      // Transform the data to match frontend expectations
      const transformedApprovals = approvals.map(approval => {
        // Add null checks for populated fields
        if (!approval.orderId) {
          console.warn(`⚠️ OrderId is null for approval ${approval._id}`);
        }
        if (!approval.product) {
          console.warn(`⚠️ Product is null for approval ${approval._id}`);
        }
        
        return {
          _id: approval._id,
          orderId: approval.orderId?._id || null,
          itemIndex: approval.itemIndex,
          product: approval.product ? {
            _id: approval.product._id,
            name: approval.product.name,
            description: approval.product.description || '',
            price: approval.product.price
          } : null,
          category: approval.category,
          status: approval.status,
          originalAmount: approval.originalAmount,
          comments: approval.comments,
          discountPercentage: approval.discountPercentage,
          discountAmount: approval.discountAmount,
          order: approval.orderId ? {
            _id: approval.orderId._id,
            orderNumber: approval.orderId.orderNumber,
            status: approval.orderId.status || 'pending',
            customer: approval.orderId.customer ? {
              _id: approval.orderId.customer._id,
              companyName: approval.orderId.customer.companyName || 'Unknown Company',
              contactName: approval.orderId.customer.contactName || 'Unknown Contact',
              email: approval.orderId.customer.email || 'Unknown Email'
            } : {
              _id: null,
              companyName: 'Unknown Company',
              contactName: 'Unknown Contact',
              email: 'Unknown Email'
            },
            createdAt: approval.orderId.createdAt
          } : {
            _id: null,
            orderNumber: 'Unknown Order',
            status: 'pending',
            customer: {
              _id: null,
              companyName: 'Unknown Company',
              contactName: 'Unknown Contact',
              email: 'Unknown Email'
            },
            createdAt: null
          }
        };
      });
      
      return transformedApprovals;
    } catch (error) {
      console.error('❌ Error getting manager pending approvals:', error);
      return [];
    }
  }
  
  /**
   * Approve or reject a specific item
   */
  async approveItem(approvalId, managerId, action, comments = '', discountPercentage = 0, discountAmount = 0) {
    try {
      console.log(`🔍 Approving item - ID: ${approvalId}, Manager: ${managerId}, Action: ${action}`);
      
      const approval = await OrderItemApproval.findById(approvalId);
      if (!approval) {
        throw new Error('Approval not found');
      }
      
      if (approval.assignedManager.toString() !== managerId.toString()) {
        throw new Error('You are not authorized to approve this item');
      }
      
      if (approval.status !== 'pending') {
        const error = new Error('This item has already been processed');
        error.statusCode = 400;
        error.isBusinessLogicError = true;
        throw error;
      }
      
      // Update approval status
      approval.status = action;
      approval.comments = comments;
      approval.discountPercentage = discountPercentage;
      approval.discountAmount = discountAmount;
      
      if (action === 'approved') {
        approval.approvedBy = managerId;
        approval.approvedAt = new Date();
      } else if (action === 'rejected') {
        approval.approvedBy = managerId; // Set approvedBy for rejected items too for notification purposes
        approval.rejectedAt = new Date();
      }
      
      console.log(`💾 Saving approval with status: ${action}`);
      await approval.save();
      console.log(`✅ Approval saved successfully`);
      
      // If item is approved, set order status to processing immediately
      if (action === 'approved') {
        const order = await Order.findById(approval.orderId).populate('customer');
        if (order) {
          // Always set to processing when item is approved, unless order is already completed or cancelled
          if (order.status !== 'completed' && order.status !== 'cancelled') {
            const previousStatus = order.status;
            order.status = 'processing';
            await order.save();
            console.log(`✅ Order ${order.orderNumber} status updated to processing after item approval (was: ${previousStatus})`);
            
            // Send notification to customer about order status change to processing
            try {
              await this.notifyCustomerAboutOrderStatus(order, previousStatus);
              console.log(`✅ Customer notified about order status change to processing`);
            } catch (notificationError) {
              console.error('⚠️ Failed to send order status notification (non-critical):', notificationError);
              // Don't throw here as this is not critical
            }
          }
        }
      }
      
      // Check if all items in the order are now processed
      console.log(`🔍 Checking order completion for order: ${approval.orderId}`);
      await this.checkOrderCompletion(approval.orderId);
      console.log(`✅ Order completion check completed`);
      
      // Send notification to customer about item status
      console.log(`📧 Sending customer notification for item status`);
      await this.notifyCustomerAboutItemStatus(approval);
      console.log(`✅ Customer notification sent`);
      
      // Fetch order and product data for notifications (outside try blocks so both notifications can use them)
      const order = await Order.findById(approval.orderId).populate('customer');
      const product = await Product.findById(approval.product);
      const productName = product ? product.name : 'Unknown Product';
      
      // Get manager details for proper sender information
      const manager = await User.findById(managerId).select('firstName lastName email role isCompanyAdmin isManager isSuperAdmin').populate('roles', 'name');
      let managerName = 'Unknown Manager';
      let managerRole = 'User';
      
      if (manager) {
        const fullName = `${manager.firstName || ''} ${manager.lastName || ''}`.trim();
        managerName = fullName || manager.email || 'Unknown Manager';
        
        // Determine role display
        if (manager.isSuperAdmin) {
          managerRole = 'Super Admin';
        } else if (manager.isCompanyAdmin) {
          managerRole = 'Company Admin';
        } else if (manager.isManager) {
          managerRole = 'Manager';
        } else if (manager.roles && manager.roles.length > 0) {
          managerRole = manager.roles[0].name || 'User';
        } else if (manager.role) {
          managerRole = manager.role;
        }
      }
      
      // Create database notification for the manager who approved the item
      console.log(`💾 Creating database notification for manager`);
      try {
        
        const managerNotification = await notificationService.createNotification({
          title: `Item ${action === 'approved' ? 'Approved' : 'Rejected'}`,
          message: `${managerName} (${managerRole}) has ${action} the item "${productName}" from order #${order?.orderNumber || 'Unknown'}`,
          type: 'item_approval_status',
          priority: 'medium',
          targetType: 'user',
          targetIds: [managerId],
          company_id: approval.company_id,
          sender_id: managerId,
          sender_name: managerName,
          data: {
            approvalId: approval._id,
            orderId: order?._id,
            orderNumber: order?.orderNumber,
            productName: productName,
            status: action,
            comments: comments,
            discountAmount: discountAmount,
            customerName: order?.customer?.companyName || 'Unknown Customer',
            managerRole: managerRole
          }
        });
        
        console.log(`💾 Sending manager notification: ${managerNotification._id}`);
        await notificationService.sendNotification(managerNotification._id);
        console.log(`✅ Manager database notification sent`);
      } catch (notificationError) {
        console.error(`⚠️ Manager database notification failed (non-critical):`, notificationError);
        // Don't throw here as this is not critical
      }
      
      // Send realtime notification about status change
      console.log(`📡 Sending realtime notification to manager ID: ${managerId}`);
      console.log(`📡 Manager ID type: ${typeof managerId}`);
      try {
        const realtimeService = require('./realtimeService');
        
        console.log(`📡 Manager user details:`, manager ? {
          id: manager._id,
          email: manager.email,
          name: managerName
        } : 'Not found');
        
        const notificationData = {
          type: 'notification',
          notification: {
            _id: `item_approval_${approval._id}`,
            title: `Item ${action === 'approved' ? 'Approved' : 'Rejected'}`,
            message: `${managerName} (${managerRole}) has ${action} the item "${productName}" from order #${order?.orderNumber || 'Unknown'}`,
            type: 'item_approval_status',
            priority: 'medium',
            createdAt: new Date().toISOString(),
            data: {
              approvalId: approval._id,
              status: action,
              orderNumber: order?.orderNumber,
              productName: productName,
              comments: comments,
              discountAmount: discountAmount,
              managerRole: managerRole
            },
            sender_name: managerName
          }
        };
        
        console.log(`📡 Notification data:`, notificationData);
        const sent = await realtimeService.sendToUser(managerId, notificationData);
        console.log(`📡 Realtime notification sent: ${sent}`);
      } catch (realtimeError) {
        console.error(`⚠️ Realtime notification failed (non-critical):`, realtimeError);
        // Don't throw here as this is not critical
      }
      
      console.log(`✅ Item ${action} by manager ${managerId}`);
      return approval;
    } catch (error) {
      console.error('❌ Error approving item:', error);
      console.error('❌ Error stack:', error.stack);
      throw error;
    }
  }
  
  /**
   * Update discount for an already approved item
   */
  async updateDiscount(approvalId, managerId, discountAmount, comments) {
    try {
      console.log(`🔍 Updating discount for approval: ${approvalId}, Manager: ${managerId}`);
      
      const approval = await OrderItemApproval.findById(approvalId);
      if (!approval) {
        const error = new Error('Approval not found');
        error.statusCode = 404;
        error.isBusinessLogicError = true;
        throw error;
      }
      
      if (approval.assignedManager.toString() !== managerId.toString()) {
        const error = new Error('You are not authorized to update this item');
        error.statusCode = 403;
        error.isBusinessLogicError = true;
        throw error;
      }
      
      if (approval.status !== 'approved') {
        const error = new Error('Only approved items can have their discount updated');
        error.statusCode = 400;
        error.isBusinessLogicError = true;
        throw error;
      }
      
      // Update discount information
      const oldDiscountAmount = approval.discountAmount || 0;
      approval.discountAmount = discountAmount || 0;
      approval.comments = comments || approval.comments;
      
      console.log(`💾 Updating discount from ${oldDiscountAmount} to ${discountAmount}`);
      await approval.save();
      console.log(`✅ Discount updated successfully`);
      
      // Recalculate order totals since discount changed
      await this.checkOrderCompletion(approval.orderId);
      console.log(`✅ Order totals recalculated`);
      
      // Create database notification for discount update
      console.log(`💾 Creating database notification for discount update`);
      try {
        const order = await Order.findById(approval.orderId).populate('customer');
        const product = await Product.findById(approval.product);
        const productName = product ? product.name : 'Unknown Product';
        
        // Get manager details for proper sender information
        const manager = await User.findById(managerId).select('firstName lastName email');
        const managerName = manager ? `${manager.firstName} ${manager.lastName}`.trim() : 'Unknown Manager';
        
        const discountNotification = await notificationService.createNotification({
          title: 'Discount Updated',
          message: `You have updated the discount for "${productName}" from order #${order?.orderNumber || 'Unknown'} from PKR ${oldDiscountAmount} to PKR ${discountAmount}`,
          type: 'discount_updated',
          priority: 'medium',
          targetType: 'user',
          targetIds: [managerId],
          company_id: approval.company_id,
          sender_id: managerId,
          sender_name: managerName,
          data: {
            approvalId: approval._id,
            orderId: order?._id,
            orderNumber: order?.orderNumber,
            productName: productName,
            oldDiscountAmount,
            newDiscountAmount: discountAmount,
            comments: comments,
            customerName: order?.customer?.companyName || 'Unknown Customer'
          }
        });
        
        console.log(`💾 Sending discount notification: ${discountNotification._id}`);
        await notificationService.sendNotification(discountNotification._id);
        console.log(`✅ Discount database notification sent`);
      } catch (notificationError) {
        console.error(`⚠️ Discount database notification failed (non-critical):`, notificationError);
        // Don't throw here as this is not critical
      }
      
      // Send realtime notification about discount update
      try {
        const realtimeService = require('./realtimeService');
        // Get order and product details for better notification message
        const order = await Order.findById(approval.orderId).populate('customer');
        const product = await Product.findById(approval.product);
        const productName = product ? product.name : 'Unknown Product';
        
        // Get manager details for real-time notification
        const manager = await User.findById(managerId).select('firstName lastName email');
        const managerName = manager ? `${manager.firstName} ${manager.lastName}`.trim() : 'Unknown Manager';
        
        await realtimeService.sendToUser(managerId, {
          type: 'notification',
          notification: {
            _id: `discount_update_${approval._id}`,
            title: 'Discount Updated',
            message: `You have updated the discount for "${productName}" from order #${order?.orderNumber || 'Unknown'} from PKR ${oldDiscountAmount} to PKR ${discountAmount}`,
            type: 'discount_updated',
            priority: 'medium',
            createdAt: new Date().toISOString(),
            data: {
              approvalId: approval._id,
              oldDiscountAmount,
              newDiscountAmount: discountAmount,
              orderNumber: order?.orderNumber,
              productName: productName,
              comments: comments
            },
            sender_name: managerName
          }
        });
        console.log(`✅ Realtime notification sent for discount update`);
      } catch (realtimeError) {
        console.error(`⚠️ Realtime notification failed (non-critical):`, realtimeError);
        // Don't throw here as this is not critical
      }
      
      console.log(`✅ Discount updated by manager ${managerId}`);
      return approval;
    } catch (error) {
      console.error('❌ Error updating discount:', error);
      console.error('❌ Error stack:', error.stack);
      throw error;
    }
  }
  
  /**
   * Check if all items in an order are processed and update order status
   */
  async checkOrderCompletion(orderId) {
    try {
      const order = await Order.findById(orderId);
      if (!order) return;
      
      const allApprovals = await OrderItemApproval.find({ orderId: orderId });
      const pendingApprovals = allApprovals.filter(a => a.status === 'pending');
      const rejectedApprovals = allApprovals.filter(a => a.status === 'rejected');
      const approvedApprovals = allApprovals.filter(a => a.status === 'approved');
      
      if (pendingApprovals.length === 0) {
        // All items have been processed
        if (rejectedApprovals.length > 0) {
          // Some items were rejected
          order.status = 'rejected';
          order.approvalStatus = 'rejected';
          order.rejectedAt = new Date();
        } else if (approvedApprovals.length > 0) {
          // All items were approved - set status to processing
          order.status = 'processing';
          order.approvalStatus = 'approved';
          order.approvedAt = new Date();
          
          // Calculate final total with discounts
          const totalDiscount = approvedApprovals.reduce((sum, approval) => {
            return sum + (approval.discountAmount || 0);
          }, 0);
          
          order.totalDiscount = totalDiscount;
          order.finalTotal = order.total - totalDiscount;
          
          // Create invoice for approved items
          console.log(`📄 Creating invoice for approved order: ${order.orderNumber}`);
          try {
            const invoice = await invoiceService.createInvoiceFromApprovedItems(orderId, order.company_id);
            console.log(`✅ Invoice created successfully: ${invoice.invoiceNumber}`);
            
            // Send notification about invoice creation
            await this.notifyInvoiceCreated(order, invoice);
          } catch (invoiceError) {
            console.error('❌ Error creating invoice:', invoiceError);
            // Don't fail the order approval if invoice creation fails
          }
        }
        
        await order.save();
        console.log(`📋 Order ${order.orderNumber} status updated to: ${order.status}`);
        
        // Notify customer about order status
        await this.notifyCustomerAboutOrderStatus(order);
      }
    } catch (error) {
      console.error('❌ Error checking order completion:', error);
    }
  }
  
  /**
   * Notify customer about item status change
   */
  async notifyCustomerAboutItemStatus(approval) {
    try {
      console.log(`📧 Notifying customer about item status for approval: ${approval._id}`);
      
      const order = await Order.findById(approval.orderId).populate('customer');
      if (!order || !order.customer) {
        console.log(`⚠️ Order or customer not found for approval: ${approval._id}`);
        return;
      }
      
      const product = await Product.findById(approval.product);
      const productName = product ? product.name : 'Unknown Product';
      
      // Get manager details for proper sender information
      const manager = await User.findById(approval.approvedBy).select('firstName lastName email role isCompanyAdmin isManager isSuperAdmin').populate('roles', 'name');
      let managerName = 'Unknown Manager';
      let managerRole = 'User';
      
      if (manager) {
        const fullName = `${manager.firstName || ''} ${manager.lastName || ''}`.trim();
        managerName = fullName || manager.email || 'Unknown Manager';
        
        // Determine role display
        if (manager.isSuperAdmin) {
          managerRole = 'Super Admin';
        } else if (manager.isCompanyAdmin) {
          managerRole = 'Company Admin';
        } else if (manager.isManager) {
          managerRole = 'Manager';
        } else if (manager.roles && manager.roles.length > 0) {
          managerRole = manager.roles[0].name || 'User';
        } else if (manager.role) {
          managerRole = manager.role;
        }
      }
      
      console.log(`📧 Creating notification for customer: ${order.customer._id}`);
      const notification = await notificationService.createNotification({
        title: `Item ${approval.status === 'approved' ? 'Approved' : 'Rejected'}`,
        message: `Your item "${productName}" from order #${order.orderNumber} has been ${approval.status} by ${managerName} (${managerRole})`,
        type: 'item_status_update',
        priority: 'medium',
        targetType: 'customer',
        targetIds: [order.customer._id],
        company_id: order.company_id,
        sender_id: approval.approvedBy || 'system',
        sender_name: managerName,
        data: {
          orderId: order._id,
          orderNumber: order.orderNumber,
          itemName: productName,
          status: approval.status,
          comments: approval.comments,
          approvedBy: managerName,
          managerRole: managerRole
        }
      });
      
      console.log(`📧 Sending notification: ${notification._id}`);
      await notificationService.sendNotification(notification._id);
      console.log(`✅ Customer notification sent successfully`);
    } catch (error) {
      console.error('❌ Error notifying customer about item status:', error);
      console.error('❌ Error stack:', error.stack);
      // Don't throw here as this is not critical for the main operation
    }
  }
  
  /**
   * Notify customer about order status change
   */
  async notifyCustomerAboutOrderStatus(order, previousStatus = null) {
    try {
      let title = '';
      let message = '';
      
      // Determine notification title and message based on status
      switch (order.status) {
        case 'processing':
          title = 'Order Now Processing';
          message = `Your order #${order.orderNumber} is now being processed`;
          break;
        case 'approved':
          title = 'Order Approved';
          message = `Your order #${order.orderNumber} has been approved`;
          break;
        case 'rejected':
          title = 'Order Rejected';
          message = `Your order #${order.orderNumber} has been rejected`;
          break;
        case 'allocated':
          title = 'Order Allocated';
          message = `Your order #${order.orderNumber} has been allocated`;
          break;
        case 'dispatched':
          title = 'Order Dispatched';
          message = `Your order #${order.orderNumber} has been dispatched`;
          break;
        case 'shipped':
          title = 'Order Shipped';
          message = `Your order #${order.orderNumber} has been shipped`;
          break;
        case 'completed':
          title = 'Order Completed';
          message = `Your order #${order.orderNumber} has been completed`;
          break;
        default:
          title = 'Order Status Updated';
          message = `Your order #${order.orderNumber} status has been updated to ${order.status}`;
      }
      
      const notification = await notificationService.createNotification({
        title: title,
        message: message,
        type: 'order_status_update',
        priority: order.status === 'processing' || order.status === 'completed' ? 'high' : 'medium',
        targetType: 'customer',
        targetIds: [order.customer],
        company_id: order.company_id,
        sender_id: 'system',
        sender_name: 'System',
        data: {
          orderId: order._id,
          orderNumber: order.orderNumber,
          status: order.status,
          previousStatus: previousStatus,
          finalTotal: order.finalTotal || order.total
        }
      });
      
      await notificationService.sendNotification(notification._id);
      console.log(`✅ Order status notification sent to customer for status: ${order.status}`);
    } catch (error) {
      console.error('❌ Error notifying customer about order status:', error);
    }
  }

  /**
   * Notify customer about invoice creation
   */
  async notifyInvoiceCreated(order, invoice) {
    try {
      const notification = await notificationService.createNotification({
        title: 'Invoice Created',
        message: `Invoice ${invoice.invoiceNumber} has been created for your order #${order.orderNumber}`,
        type: 'invoice',
        priority: 'high',
        targetType: 'customer',
        targetIds: [order.customer],
        company_id: order.company_id,
        sender_id: 'system',
        sender_name: 'System',
        data: {
          orderId: order._id,
          orderNumber: order.orderNumber,
          invoiceId: invoice._id,
          invoiceNumber: invoice.invoiceNumber,
          total: invoice.total,
          dueDate: invoice.dueDate
        }
      });

      await notificationService.sendNotification(notification._id);
      console.log(`✅ Invoice notification sent to customer`);
    } catch (error) {
      console.error('❌ Error notifying customer about invoice creation:', error);
    }
  }
}

module.exports = new ItemApprovalService();
