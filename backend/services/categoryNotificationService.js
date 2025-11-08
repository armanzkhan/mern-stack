const Notification = require('../models/Notification');
const Manager = require('../models/Manager');
const CategoryAssignment = require('../models/CategoryAssignment');
const User = require('../models/User');
const webPushService = require('./webPushService');
const mobilePushService = require('./mobilePushService');

class CategoryNotificationService {
  
  /**
   * Send notification to managers based on product categories
   */
  async sendCategoryNotification(notificationData) {
    try {
      const { 
        title, 
        message, 
        categories, 
        type = 'info', 
        priority = 'medium',
        company_id,
        sender_id,
        sender_name,
        data = {},
        channels = ['in_app', 'web_push']
      } = notificationData;

      // Get managers who handle these categories
      const managers = await this.getManagersForCategories(categories, company_id);
      
      if (managers.length === 0) {
        console.log('No managers found for categories:', categories);
        return { success: false, message: 'No managers found for specified categories' };
      }

      // Create notifications for each manager
      const notificationResults = [];
      
      for (const manager of managers) {
        try {
          // Check if manager has notification preferences enabled
          const shouldNotify = this.shouldNotifyManager(manager, type, priority);
          
          if (!shouldNotify) {
            console.log(`Skipping notification for manager ${manager.user_id} - preferences disabled`);
            continue;
          }

          // Create notification record
          const notification = new Notification({
            title,
            message,
            type,
            priority,
            targetType: 'user',
            targetIds: [manager.user_id],
            company_id,
            sender_id,
            sender_name,
            data: {
              ...data,
              categories,
              manager_id: manager._id,
              managerCategories: manager.managerProfile?.assignedCategories || []
            },
            channels: channels.map(channel => ({
              type: channel,
              enabled: true
            })),
            status: 'draft'
          });

          await notification.save();

          // Send through configured channels
          const deliveryResults = await this.sendToChannels(notification, manager, channels);
          
          // Update notification status
          notification.status = 'sent';
          notification.delivery_stats = deliveryResults;
          await notification.save();

          notificationResults.push({
            manager_id: manager._id,
            user_id: manager.user_id,
            success: true,
            deliveryResults
          });

        } catch (error) {
          console.error(`Error sending notification to manager ${manager.user_id}:`, error);
          notificationResults.push({
            manager_id: manager._id,
            user_id: manager.user_id,
            success: false,
            error: error.message
          });
        }
      }

      return {
        success: true,
        message: `Notifications sent to ${notificationResults.filter(r => r.success).length} managers`,
        results: notificationResults
      };

    } catch (error) {
      console.error('Category notification service error:', error);
      throw error;
    }
  }

  /**
   * Get managers who handle specific categories
   */
  async getManagersForCategories(categories, company_id) {
    try {
      console.log('🔍 Looking for managers for categories:', categories);
      
      // Get managers from User model (not Manager model)
      const managers = await User.find({
        company_id,
        isManager: true,
        isActive: true
      });

      console.log(`📊 Found ${managers.length} managers in company`);

      // Filter managers who have access to at least one of the specified categories
      const relevantManagers = managers.filter(manager => {
        if (!manager.managerProfile || !manager.managerProfile.assignedCategories) {
          console.log(`⚠️ Manager ${manager.email} has no assigned categories`);
          return false;
        }

        const managerCategories = manager.managerProfile.assignedCategories;
        console.log(`🔍 Manager ${manager.email} categories:`, managerCategories);
        
        const hasMatchingCategory = categories.some(category => 
          managerCategories.includes(category)
        );
        
        console.log(`✅ Manager ${manager.email} has matching category: ${hasMatchingCategory}`);
        return hasMatchingCategory;
      });

      console.log(`📋 Found ${relevantManagers.length} relevant managers`);
      return relevantManagers;
    } catch (error) {
      console.error('Error getting managers for categories:', error);
      return [];
    }
  }

  /**
   * Check if manager should receive notification based on preferences
   */
  shouldNotifyManager(manager, type, priority) {
    const preferences = manager.managerProfile?.notificationPreferences;
    
    // Check if manager has notifications enabled
    if (!preferences) {
      console.log(`⚠️ Manager ${manager.email} has no notification preferences`);
      return false;
    }

    console.log(`🔍 Checking preferences for ${manager.email}:`, preferences);

    // Check type-specific preferences
    switch (type) {
      case 'order':
        const orderResult = preferences.orderUpdates || preferences.newOrders;
        console.log(`   Order notifications: ${orderResult}`);
        return orderResult;
      case 'stock':
        const stockResult = preferences.stockAlerts || preferences.lowStock;
        console.log(`   Stock notifications: ${stockResult}`);
        return stockResult;
      case 'status':
        const statusResult = preferences.statusChanges;
        console.log(`   Status notifications: ${statusResult}`);
        return statusResult;
      case 'report':
        const reportResult = preferences.categoryReports;
        console.log(`   Report notifications: ${reportResult}`);
        return reportResult;
      default:
        return true;
    }
  }

  /**
   * Send notification through configured channels
   */
  async sendToChannels(notification, manager, channels) {
    const results = {
      in_app: { delivered: 0, failed: 0 },
      web_push: { delivered: 0, failed: 0 },
      mobile_push: { delivered: 0, failed: 0 }
    };

    try {
      // In-app notifications (always delivered)
      if (channels.includes('in_app')) {
        results.in_app.delivered = 1;
      }

      // Web push notifications
      if (channels.includes('web_push')) {
        try {
          const webPushResult = await this.sendWebPush(notification, manager);
          results.web_push = webPushResult;
        } catch (error) {
          console.error('Web push error:', error);
          results.web_push.failed = 1;
        }
      }

      // Mobile push notifications
      if (channels.includes('mobile_push')) {
        try {
          const mobilePushResult = await this.sendMobilePush(notification, manager);
          results.mobile_push = mobilePushResult;
        } catch (error) {
          console.error('Mobile push error:', error);
          results.mobile_push.failed = 1;
        }
      }

    } catch (error) {
      console.error('Channel delivery error:', error);
    }

    return results;
  }

  /**
   * Send web push notification
   */
  async sendWebPush(notification, manager) {
    try {
      // Get user's web push subscriptions
      const user = await User.findOne({ user_id: manager.user_id });
      if (!user) {
        return { delivered: 0, failed: 1 };
      }

      // This would integrate with your existing web push service
      // For now, we'll simulate success
      return { delivered: 1, failed: 0 };
    } catch (error) {
      console.error('Web push delivery error:', error);
      return { delivered: 0, failed: 1 };
    }
  }

  /**
   * Send mobile push notification
   */
  async sendMobilePush(notification, manager) {
    try {
      // This would integrate with your existing mobile push service
      // For now, we'll simulate success
      return { delivered: 1, failed: 0 };
    } catch (error) {
      console.error('Mobile push delivery error:', error);
      return { delivered: 0, failed: 1 };
    }
  }

  /**
   * Send order-related notifications to category managers
   */
  async notifyOrderUpdate(order, updateType, updatedBy) {
    try {
      const categories = order.categories || [];
      
      if (categories.length === 0) {
        console.log('No categories found in order, skipping category notifications');
        return;
      }

      const notificationData = {
        title: `Order ${updateType}`,
        message: `Order #${order.orderNumber} has been ${updateType.toLowerCase()}`,
        categories,
        type: 'order',
        priority: updateType === 'created' ? 'high' : 'medium',
        company_id: order.company_id,
        sender_id: updatedBy.id || updatedBy._id,
        sender_name: updatedBy.email || updatedBy.name || 'System',
        data: {
          orderId: order._id,
          orderNumber: order.orderNumber,
          status: order.status,
          total: order.total,
          customer: order.customer,
          updateType
        },
        channels: ['in_app', 'web_push']
      };

      return await this.sendCategoryNotification(notificationData);
    } catch (error) {
      console.error('Order notification error:', error);
      throw error;
    }
  }

  /**
   * Send stock-related notifications to category managers
   */
  async notifyStockUpdate(product, updateType, updatedBy) {
    try {
      const category = product.category?.mainCategory || product.category;
      
      if (!category) {
        console.log('No category found for product, skipping stock notification');
        return;
      }

      const notificationData = {
        title: `Stock ${updateType}`,
        message: `Product "${product.name}" stock has been ${updateType.toLowerCase()}`,
        categories: [category],
        type: 'stock',
        priority: updateType === 'low' || updateType === 'out' ? 'high' : 'medium',
        company_id: product.company_id,
        sender_id: updatedBy.id || updatedBy._id,
        sender_name: updatedBy.email || updatedBy.name || 'System',
        data: {
          productId: product._id,
          productName: product.name,
          currentStock: product.stock,
          minStock: product.minStock,
          category,
          updateType
        },
        channels: ['in_app', 'web_push']
      };

      return await this.sendCategoryNotification(notificationData);
    } catch (error) {
      console.error('Stock notification error:', error);
      throw error;
    }
  }

  /**
   * Send status change notifications to category managers
   */
  async notifyStatusChange(order, oldStatus, newStatus, changedBy) {
    try {
      const categories = order.categories || [];
      
      if (categories.length === 0) {
        console.log('No categories found in order, skipping status change notification');
        return;
      }

      const notificationData = {
        title: 'Order Status Changed',
        message: `Order #${order.orderNumber} status changed from ${oldStatus} to ${newStatus}`,
        categories,
        type: 'status',
        priority: 'medium',
        company_id: order.company_id,
        sender_id: changedBy.id || changedBy._id,
        sender_name: changedBy.email || changedBy.name || 'System',
        data: {
          orderId: order._id,
          orderNumber: order.orderNumber,
          oldStatus,
          newStatus,
          categories
        },
        channels: ['in_app', 'web_push']
      };

      return await this.sendCategoryNotification(notificationData);
    } catch (error) {
      console.error('Status change notification error:', error);
      throw error;
    }
  }
}

module.exports = new CategoryNotificationService();
