//services/notificationTriggerService.js
const Notification = require('../models/Notification');
const User = require('../models/User');
const notificationService = require('./notificationService');

class NotificationTriggerService {
  
  /**
   * Trigger notification when a user is created
   */
  async triggerUserCreated(userData, createdBy) {
    try {
      // Construct user name from firstName and lastName, or use email
      const userName = (userData.firstName || userData.lastName)
        ? `${userData.firstName || ''} ${userData.lastName || ''}`.trim()
        : userData.email || 'Unknown User';
      
      // Get creator details with role information
      const creator = await User.findById(createdBy._id).select('firstName lastName email role isCompanyAdmin isManager isSuperAdmin').populate('roles', 'name');
      let creatorName = 'System';
      let creatorRole = 'User';
      
      if (creator) {
        const fullName = `${creator.firstName || ''} ${creator.lastName || ''}`.trim();
        creatorName = fullName || creator.email || 'System';
        
        // Determine role display
        if (creator.isSuperAdmin) {
          creatorRole = 'Super Admin';
        } else if (creator.isCompanyAdmin) {
          creatorRole = 'Company Admin';
        } else if (creator.isManager) {
          creatorRole = 'Manager';
        } else if (creator.roles && creator.roles.length > 0) {
          creatorRole = creator.roles[0].name || 'User';
        } else if (creator.role) {
          creatorRole = creator.role;
        }
      }
      
      const notification = await this.createNotification({
        title: 'New User Created',
        message: `A new user "${userName}" has been created by ${creatorName} (${creatorRole})`,
        type: 'system',
        priority: 'medium',
        targetType: 'company',
        targetIds: [userData.company_id, userData.user_id],
        company_id: userData.company_id,
        sender_id: createdBy._id,
        sender_name: creatorName,
        data: {
          entityType: 'user',
          entityId: userData._id,
          action: 'created',
          url: `/users`,
          creatorRole: creatorRole
        }
      });

      await notificationService.sendNotification(notification._id);
      return notification;
    } catch (error) {
      console.error('Error triggering user created notification:', error);
    }
  }

  /**
   * Trigger notification when a user is updated
   */
  async triggerUserUpdated(userData, updatedBy, changes) {
    try {
      const notification = await this.createNotification({
        title: 'User Updated',
        message: `User "${userData.name || userData.email}" has been updated by ${updatedBy.name || updatedBy.email}`,
        type: 'system',
        priority: 'low',
        targetType: 'company',
        targetIds: [userData.company_id],
        company_id: userData.company_id,
        sender_id: updatedBy._id,
        sender_name: updatedBy.name || updatedBy.email,
        data: {
          entityType: 'user',
          entityId: userData._id,
          action: 'updated',
          changes: changes,
          url: `/users`
        }
      });

      await notificationService.sendNotification(notification._id);
      return notification;
    } catch (error) {
      console.error('Error triggering user updated notification:', error);
    }
  }

  /**
   * Trigger notification when a customer is created
   */
  async triggerCustomerCreated(customerData, createdBy) {
    try {
      console.log('NotificationTriggerService: Creating customer notification...');
      console.log('Customer data:', customerData);
      console.log('Created by:', createdBy);
      
      // Get creator details with role information
      const creator = await User.findById(createdBy._id).select('firstName lastName email role isCompanyAdmin isManager isSuperAdmin').populate('roles', 'name');
      let creatorName = 'System';
      let creatorRole = 'User';
      
      if (creator) {
        const fullName = `${creator.firstName || ''} ${creator.lastName || ''}`.trim();
        creatorName = fullName || creator.email || 'System';
        
        // Determine role display
        if (creator.isSuperAdmin) {
          creatorRole = 'Super Admin';
        } else if (creator.isCompanyAdmin) {
          creatorRole = 'Company Admin';
        } else if (creator.isManager) {
          creatorRole = 'Manager';
        } else if (creator.roles && creator.roles.length > 0) {
          creatorRole = creator.roles[0].name || 'User';
        } else if (creator.role) {
          creatorRole = creator.role;
        }
      }
      
      const notification = await this.createNotification({
        title: 'New Customer Added',
        message: `A new customer "${customerData.companyName}" has been added by ${creatorName} (${creatorRole})`,
        type: 'success',
        priority: 'medium',
        targetType: 'company',
        targetIds: [customerData.company_id],
        company_id: customerData.company_id,
        sender_id: createdBy._id,
        sender_name: creatorName,
        data: {
          entityType: 'customer',
          entityId: customerData._id,
          action: 'created',
          url: `/customers`,
          creatorRole: creatorRole
        }
      });

      console.log('Notification created:', notification._id);
      console.log('Sending notification...');
      
      await notificationService.sendNotification(notification._id);
      console.log('Notification sent successfully');
      
      return notification;
    } catch (error) {
      console.error('Error triggering customer created notification:', error);
      console.error('Error details:', error.message);
      console.error('Error stack:', error.stack);
      throw error; // Re-throw to see the error in the controller
    }
  }

  /**
   * Trigger notification when a customer is updated
   */
  async triggerCustomerUpdated(customerData, updatedBy, changes) {
    try {
      const notification = await this.createNotification({
        title: 'Customer Updated',
        message: `Customer "${customerData.companyName}" has been updated by ${updatedBy.name || updatedBy.email}`,
        type: 'info',
        priority: 'low',
        targetType: 'company',
        targetIds: [customerData.company_id],
        company_id: customerData.company_id,
        sender_id: updatedBy._id,
        sender_name: updatedBy.name || updatedBy.email,
        data: {
          entityType: 'customer',
          entityId: customerData._id,
          action: 'updated',
          changes: changes,
          url: `/customers`
        }
      });

      await notificationService.sendNotification(notification._id);
      return notification;
    } catch (error) {
      console.error('Error triggering customer updated notification:', error);
    }
  }

  /**
   * Trigger notification when an order is created
   */
  async triggerOrderCreated(orderData, createdBy) {
    try {
      // Construct proper sender name
      const senderName = createdBy.firstName && createdBy.lastName
        ? `${createdBy.firstName} ${createdBy.lastName}`
        : createdBy.name || createdBy.email || 'Unknown User';
      
      // Use email in message if we have it, otherwise use name
      const creatorDisplay = createdBy.email || senderName;
      
      const notification = await this.createNotification({
        title: 'New Order Created',
        message: `A new order #${orderData.orderNumber} has been created by ${creatorDisplay}`,
        type: 'order',
        priority: 'high',
        targetType: 'company',
        targetIds: [orderData.company_id],
        company_id: orderData.company_id,
        sender_id: createdBy._id && createdBy._id !== 'system' ? createdBy._id : null,
        sender_name: senderName,
        data: {
          entityType: 'order',
          entityId: orderData._id,
          action: 'created',
          orderNumber: orderData.orderNumber,
          total: orderData.total,
          url: `/orders?highlight=${orderData._id}`
        }
      });

      await notificationService.sendNotification(notification._id);
      return notification;
    } catch (error) {
      console.error('Error triggering order created notification:', error);
    }
  }

  /**
   * Trigger notification when an order is updated
   */
  async triggerOrderUpdated(orderData, updatedBy, changes) {
    try {
      const notification = await this.createNotification({
        title: 'Order Updated',
        message: `Order #${orderData.orderNumber} has been updated by ${updatedBy.name || updatedBy.email}`,
        type: 'order',
        priority: 'medium',
        targetType: 'company',
        targetIds: [orderData.company_id],
        company_id: orderData.company_id,
        sender_id: updatedBy._id,
        sender_name: updatedBy.name || updatedBy.email,
        data: {
          entityType: 'order',
          entityId: orderData._id,
          action: 'updated',
          orderNumber: orderData.orderNumber,
          changes: changes,
          url: `/orders`
        }
      });

      await notificationService.sendNotification(notification._id);
      return notification;
    } catch (error) {
      console.error('Error triggering order updated notification:', error);
    }
  }

  /**
   * Trigger notification when an order status changes
   */
  async triggerOrderStatusChanged(orderData, updatedBy, oldStatus, newStatus) {
    try {
      const priority = newStatus === 'cancelled' || newStatus === 'delivered' ? 'high' : 'medium';
      
      // Get proper sender information
      const senderName = updatedBy.firstName && updatedBy.lastName 
        ? `${updatedBy.firstName} ${updatedBy.lastName}`
        : updatedBy.name || updatedBy.email || 'Unknown User';
      
      const notification = await this.createNotification({
        title: 'Order Status Changed',
        message: `Order #${orderData.orderNumber} status changed from "${oldStatus}" to "${newStatus}" by ${senderName}`,
        type: 'order',
        priority: priority,
        targetType: 'company',
        targetIds: [orderData.company_id],
        company_id: orderData.company_id,
        sender_id: updatedBy._id,
        sender_name: senderName,
        data: {
          entityType: 'order',
          entityId: orderData._id,
          action: 'status_changed',
          orderNumber: orderData.orderNumber,
          oldStatus: oldStatus,
          newStatus: newStatus,
          url: `/orders?highlight=${orderData._id}`
        }
      });

      await notificationService.sendNotification(notification._id);
      return notification;
    } catch (error) {
      console.error('Error triggering order status changed notification:', error);
    }
  }

  /**
   * Trigger notification when a product is created
   */
  async triggerProductCreated(productData, createdBy) {
    try {
      const notification = await this.createNotification({
        title: 'New Product Added',
        message: `A new product "${productData.name}" has been added by ${createdBy.name || createdBy.email}`,
        type: 'success',
        priority: 'medium',
        targetType: 'company',
        targetIds: [productData.company_id],
        company_id: productData.company_id,
        sender_id: createdBy._id,
        sender_name: createdBy.name || createdBy.email,
        data: {
          entityType: 'product',
          entityId: productData._id,
          action: 'created',
          url: `/products/${productData._id}`
        }
      });

      await notificationService.sendNotification(notification._id);
      return notification;
    } catch (error) {
      console.error('Error triggering product created notification:', error);
    }
  }

  /**
   * Trigger notification when a role is created or updated
   */
  async triggerRoleChanged(roleData, changedBy, action) {
    try {
      const notification = await this.createNotification({
        title: `Role ${action === 'created' ? 'Created' : 'Updated'}`,
        message: `Role "${roleData.name}" has been ${action} by ${changedBy.name || changedBy.email}`,
        type: 'system',
        priority: 'high',
        targetType: 'company',
        targetIds: [userData.company_id],
        company_id: roleData.company_id,
        sender_id: changedBy._id,
        sender_name: changedBy.name || changedBy.email,
        data: {
          entityType: 'role',
          entityId: roleData._id,
          action: action,
          url: `/roles/${roleData._id}`
        }
      });

      await notificationService.sendNotification(notification._id);
      return notification;
    } catch (error) {
      console.error('Error triggering role changed notification:', error);
    }
  }

  /**
   * Create a notification record
   */
  async createNotification(notificationData) {
    try {
      console.log('Creating notification with data:', notificationData);
      
      const notification = new Notification({
        ...notificationData,
        channels: [
          { type: 'in_app', enabled: true },
          { type: 'web_push', enabled: true },
          { type: 'mobile_push', enabled: true }
        ],
        status: 'draft'
      });

      console.log('Notification object created, saving to database...');
      await notification.save();
      console.log('Notification saved successfully with ID:', notification._id);
      
      return notification;
    } catch (error) {
      console.error('Error creating notification:', error);
      console.error('Error details:', error.message);
      console.error('Error stack:', error.stack);
      throw error;
    }
  }

  /**
   * Send system-wide announcement
   */
  async sendSystemAnnouncement(title, message, priority = 'medium', targetRoles = ['admin', 'super_admin']) {
    try {
      const notification = await this.createNotification({
        title: title,
        message: message,
        type: 'system',
        priority: priority,
        targetType: 'role',
        targetIds: targetRoles,
        company_id: 'system', // System-wide
        data: {
          entityType: 'system',
          action: 'announcement',
          url: '/dashboard'
        }
      });

      await notificationService.sendNotification(notification._id);
      return notification;
    } catch (error) {
      console.error('Error sending system announcement:', error);
    }
  }

  /**
   * Trigger notification when a product is updated
   */
  async triggerProductUpdated(productData, updatedBy, changes) {
    try {
      const notification = await this.createNotification({
        title: 'Product Updated',
        message: `Product "${productData.name}" has been updated by ${updatedBy.name || updatedBy.email}`,
        type: 'info',
        priority: 'medium',
        targetType: 'company',
        targetIds: [productData.company_id],
        company_id: productData.company_id,
        sender_id: updatedBy._id,
        sender_name: updatedBy.name || updatedBy.email,
        data: {
          entityType: 'product',
          entityId: productData._id,
          action: 'updated',
          url: `/products/${productData._id}`
        }
      });

      await notificationService.sendNotification(notification._id);
      return notification;
    } catch (error) {
      console.error('Error triggering product updated notification:', error);
    }
  }

  /**
   * Trigger notification when product stock is low
   */
  async triggerLowStockAlert(productData, updatedBy, currentStock) {
    try {
      const notification = await this.createNotification({
        title: 'Low Stock Alert',
        message: `Product "${productData.name}" is running low on stock (${currentStock} remaining)`,
        type: 'warning',
        priority: 'high',
        targetType: 'company',
        targetIds: [productData.company_id],
        company_id: productData.company_id,
        sender_id: updatedBy._id,
        sender_name: updatedBy.name || updatedBy.email,
        data: {
          entityType: 'product',
          entityId: productData._id,
          action: 'low_stock',
          url: `/products/${productData._id}`
        }
      });

      await notificationService.sendNotification(notification._id);
      return notification;
    } catch (error) {
      console.error('Error triggering low stock alert:', error);
    }
  }

  /**
   * Trigger notification when product stock is significantly reduced
   */
  async triggerStockSignificantlyReduced(productData, updatedBy, oldStock, newStock) {
    try {
      const reductionPercentage = Math.round(((oldStock - newStock) / oldStock) * 100);
      const notification = await this.createNotification({
        title: 'Stock Significantly Reduced',
        message: `Product "${productData.name}" stock reduced by ${reductionPercentage}% (${oldStock} → ${newStock})`,
        type: 'warning',
        priority: 'medium',
        targetType: 'company',
        targetIds: [productData.company_id],
        company_id: productData.company_id,
        sender_id: updatedBy._id,
        sender_name: updatedBy.name || updatedBy.email,
        data: {
          entityType: 'product',
          entityId: productData._id,
          action: 'stock_reduced',
          url: `/products/${productData._id}`
        }
      });

      await notificationService.sendNotification(notification._id);
      return notification;
    } catch (error) {
      console.error('Error triggering stock reduction notification:', error);
    }
  }

  /**
   * Trigger notification when product category is changed
   */
  async triggerProductCategoryChanged(productData, updatedBy, oldCategory, newCategory) {
    try {
      const oldCategoryName = typeof oldCategory === 'string' ? oldCategory : oldCategory?.mainCategory || 'Unknown';
      const newCategoryName = typeof newCategory === 'string' ? newCategory : newCategory?.mainCategory || 'Unknown';
      
      const notification = await this.createNotification({
        title: 'Product Category Changed',
        message: `Product "${productData.name}" category changed from "${oldCategoryName}" to "${newCategoryName}"`,
        type: 'info',
        priority: 'medium',
        targetType: 'company',
        targetIds: [productData.company_id],
        company_id: productData.company_id,
        sender_id: updatedBy._id,
        sender_name: updatedBy.name || updatedBy.email,
        data: {
          entityType: 'product',
          entityId: productData._id,
          action: 'category_changed',
          url: `/products/${productData._id}`
        }
      });

      await notificationService.sendNotification(notification._id);
      return notification;
    } catch (error) {
      console.error('Error triggering product category change notification:', error);
    }
  }

  /**
   * Trigger notification when an invoice is created
   */
  async triggerInvoiceCreated(invoiceData, createdBy) {
    try {
      const notification = await this.createNotification({
        title: 'Invoice Created',
        message: `Invoice ${invoiceData.invoiceNumber} has been created for order ${invoiceData.orderNumber}`,
        type: 'invoice',
        priority: 'high',
        targetType: 'customer',
        targetIds: [invoiceData.customer],
        company_id: invoiceData.company_id,
        sender_id: createdBy._id,
        sender_name: createdBy.name || createdBy.email,
        data: {
          entityType: 'invoice',
          entityId: invoiceData._id,
          action: 'created',
          invoiceNumber: invoiceData.invoiceNumber,
          orderNumber: invoiceData.orderNumber,
          total: invoiceData.total,
          url: `/invoices/${invoiceData._id}`
        }
      });

      await notificationService.sendNotification(notification._id);
      return notification;
    } catch (error) {
      console.error('Error triggering invoice created notification:', error);
    }
  }

  /**
   * Trigger notification when a payment is received
   */
  async triggerPaymentReceived(invoiceData, paymentAmount, paymentStatus, createdBy) {
    try {
      let message = '';
      let priority = 'medium';
      
      if (paymentStatus === 'paid') {
        message = `Invoice ${invoiceData.invoiceNumber} has been fully paid (${paymentAmount.toLocaleString()} PKR)`;
        priority = 'high';
      } else if (paymentStatus === 'partial') {
        message = `Partial payment of ${paymentAmount.toLocaleString()} PKR received for invoice ${invoiceData.invoiceNumber}`;
        priority = 'medium';
      }

      const notification = await this.createNotification({
        title: 'Payment Received',
        message: message,
        type: 'payment',
        priority: priority,
        targetType: 'customer',
        targetIds: [invoiceData.customer],
        company_id: invoiceData.company_id,
        sender_id: createdBy._id,
        sender_name: createdBy.name || createdBy.email,
        data: {
          entityType: 'payment',
          entityId: invoiceData._id,
          action: 'payment_received',
          invoiceNumber: invoiceData.invoiceNumber,
          paymentAmount: paymentAmount,
          paymentStatus: paymentStatus,
          remainingAmount: invoiceData.remainingAmount,
          url: `/invoices/${invoiceData._id}`
        }
      });

      await notificationService.sendNotification(notification._id);
      return notification;
    } catch (error) {
      console.error('Error triggering payment received notification:', error);
    }
  }

  /**
   * Trigger notification when an invoice is overdue
   */
  async triggerInvoiceOverdue(invoiceData, createdBy) {
    try {
      const notification = await this.createNotification({
        title: 'Invoice Overdue',
        message: `Invoice ${invoiceData.invoiceNumber} is now overdue. Amount due: ${invoiceData.remainingAmount.toLocaleString()} PKR`,
        type: 'warning',
        priority: 'high',
        targetType: 'customer',
        targetIds: [invoiceData.customer],
        company_id: invoiceData.company_id,
        sender_id: createdBy._id,
        sender_name: createdBy.name || createdBy.email,
        data: {
          entityType: 'invoice',
          entityId: invoiceData._id,
          action: 'overdue',
          invoiceNumber: invoiceData.invoiceNumber,
          remainingAmount: invoiceData.remainingAmount,
          dueDate: invoiceData.dueDate,
          url: `/invoices/${invoiceData._id}`
        }
      });

      await notificationService.sendNotification(notification._id);
      return notification;
    } catch (error) {
      console.error('Error triggering invoice overdue notification:', error);
    }
  }
}

module.exports = new NotificationTriggerService();
