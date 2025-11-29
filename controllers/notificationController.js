const notificationService = require('../services/notificationService');
const { validationResult } = require('express-validator');

class NotificationController {
  
  /**
   * Create a new notification
   */
  async createNotification(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const {
        title,
        message,
        type = 'info',
        priority = 'medium',
        targetType,
        targetIds,
        data,
        actions,
        channels = ['in_app'],
        scheduled_at
      } = req.body;

      const company_id = req.user.company_id;
      const sender_id = req.user.user_id;
      const sender_name = req.user.email; // You might want to store actual name

      const notificationData = {
        title,
        message,
        type,
        priority,
        targetType,
        targetIds,
        company_id,
        sender_id,
        sender_name,
        data,
        actions,
        channels: channels.map(channel => ({
          type: channel,
          enabled: true
        })),
        scheduled_at: scheduled_at ? new Date(scheduled_at) : null,
        status: scheduled_at ? 'scheduled' : 'draft'
      };

      const notification = await notificationService.createNotification(notificationData);

      // If not scheduled, send immediately
      if (!scheduled_at) {
        await notificationService.sendNotification(notification._id);
      }

      res.status(201).json({
        success: true,
        message: 'Notification created successfully',
        data: notification
      });
    } catch (error) {
      console.error('Create notification error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create notification',
        error: error.message
      });
    }
  }

  /**
   * Get notifications for the current user
   */
  async getUserNotifications(req, res) {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.log('Validation errors in getUserNotifications:', errors.array());
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const userId = req.user.user_id;
      const companyId = req.user.company_id;
      
      
      const {
        limit = 50,
        offset = 0,
        type,
        priority,
        unreadOnly = false,
        since
      } = req.query;

      const notifications = await notificationService.getUserNotifications(
        userId,
        companyId,
        {
          limit: parseInt(limit),
          offset: parseInt(offset),
          type,
          priority,
          unreadOnly: unreadOnly === 'true',
          since
        }
      );

      res.json({
        success: true,
        data: notifications,
        pagination: {
          limit: parseInt(limit),
          offset: parseInt(offset),
          total: notifications.length
        }
      });
    } catch (error) {
      console.error('Get user notifications error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get notifications',
        error: error.message
      });
    }
  }

  /**
   * Mark notification as read
   */
  async markAsRead(req, res) {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { notificationId } = req.params;
      const userId = req.user.user_id;

      const notification = await notificationService.markAsRead(notificationId, userId);

      res.json({
        success: true,
        message: 'Notification marked as read',
        data: notification
      });
    } catch (error) {
      console.error('Mark as read error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to mark notification as read',
        error: error.message
      });
    }
  }

  /**
   * Create or update notification subscription
   */
  async createSubscription(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const userId = req.user.user_id;
      const companyId = req.user.company_id;
      
      const {
        device_type,
        platform,
        user_agent,
        endpoint,
        p256dh_key,
        auth_key,
        fcm_token,
        apns_token,
        preferences,
        app_version,
        os_version,
        browser_version
      } = req.body;

      const subscriptionData = {
        user_id: userId,
        company_id: companyId,
        device_type,
        platform,
        user_agent,
        endpoint,
        p256dh_key,
        auth_key,
        fcm_token,
        apns_token,
        preferences: preferences || {
          in_app: true,
          web_push: true,
          mobile_push: true,
          email: false,
          sms: false,
          types: {
            info: true,
            success: true,
            warning: true,
            error: true,
            order: true,
            delivery: true,
            invoice: true,
            system: true
          },
          priorities: {
            low: true,
            medium: true,
            high: true,
            urgent: true
          }
        },
        app_version,
        os_version,
        browser_version
      };

      const subscription = await notificationService.createOrUpdateSubscription(subscriptionData);

      res.status(201).json({
        success: true,
        message: 'Subscription created/updated successfully',
        data: subscription
      });
    } catch (error) {
      console.error('Create subscription error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create/update subscription',
        error: error.message
      });
    }
  }

  /**
   * Get notification statistics (admin only)
   */
  async getNotificationStats(req, res) {
    try {
      const companyId = req.user.company_id;
      const { start_date, end_date } = req.query;

      const dateRange = {};
      if (start_date) dateRange.start = start_date;
      if (end_date) dateRange.end = end_date;

      const stats = await notificationService.getNotificationStats(companyId, dateRange);

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Get notification stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get notification statistics',
        error: error.message
      });
    }
  }

  /**
   * Get all notifications (admin only)
   */
  async getAllNotifications(req, res) {
    try {
      const companyId = req.user.company_id;
      const {
        limit = 50,
        offset = 0,
        status,
        type,
        priority,
        targetType
      } = req.query;

      const query = { company_id: companyId };
      if (status) query.status = status;
      if (type) query.type = type;
      if (priority) query.priority = priority;
      if (targetType) query.targetType = targetType;

      const Notification = require('../models/Notification');
      const notifications = await Notification.find(query)
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .skip(parseInt(offset));

      const total = await Notification.countDocuments(query);

      res.json({
        success: true,
        data: notifications,
        pagination: {
          limit: parseInt(limit),
          offset: parseInt(offset),
          total
        }
      });
    } catch (error) {
      console.error('Get all notifications error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get notifications',
        error: error.message
      });
    }
  }

  /**
   * Update notification
   */
  async updateNotification(req, res) {
    try {
      const { notificationId } = req.params;
      const companyId = req.user.company_id;
      const updateData = req.body;

      const Notification = require('../models/Notification');
      const notification = await Notification.findOneAndUpdate(
        { _id: notificationId, company_id: companyId },
        updateData,
        { new: true, runValidators: true }
      );

      if (!notification) {
        return res.status(404).json({
          success: false,
          message: 'Notification not found'
        });
      }

      res.json({
        success: true,
        message: 'Notification updated successfully',
        data: notification
      });
    } catch (error) {
      console.error('Update notification error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update notification',
        error: error.message
      });
    }
  }

  /**
   * Delete notification
   */
  async deleteNotification(req, res) {
    try {
      const { notificationId } = req.params;
      const companyId = req.user.company_id;

      const Notification = require('../models/Notification');
      const notification = await Notification.findOneAndUpdate(
        { _id: notificationId, company_id: companyId },
        { isActive: false },
        { new: true }
      );

      if (!notification) {
        return res.status(404).json({
          success: false,
          message: 'Notification not found'
        });
      }

      res.json({
        success: true,
        message: 'Notification deleted successfully'
      });
    } catch (error) {
      console.error('Delete notification error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete notification',
        error: error.message
      });
    }
  }

  /**
   * Send scheduled notification
   */
  async sendScheduledNotification(req, res) {
    try {
      const { notificationId } = req.params;
      const companyId = req.user.company_id;

      const Notification = require('../models/Notification');
      const notification = await Notification.findOne({
        _id: notificationId,
        company_id: companyId,
        status: 'scheduled'
      });

      if (!notification) {
        return res.status(404).json({
          success: false,
          message: 'Scheduled notification not found'
        });
      }

      const results = await notificationService.sendNotification(notificationId);

      res.json({
        success: true,
        message: 'Scheduled notification sent successfully',
        data: results
      });
    } catch (error) {
      console.error('Send scheduled notification error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to send scheduled notification',
        error: error.message
      });
    }
  }
}

module.exports = new NotificationController();
