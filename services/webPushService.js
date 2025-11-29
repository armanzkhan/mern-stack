//services/webPushService.js
let webpush;
try {
  webpush = require('web-push');
} catch (error) {
  console.warn('web-push package not installed. Web push notifications will be disabled.');
  webpush = null;
}

class WebPushService {
  constructor() {
    this.initialized = false;
    
    if (webpush) {
      try {
        // Initialize web push with VAPID keys
        this.vapidKeys = {
          publicKey: process.env.VAPID_PUBLIC_KEY || 'BIVA_tS6oN3bplsM_XZDnO1a8bibiX3u3HZetJTaYe7AALaebb1zvZHDXHHK2PWJmWqPDJQt5DkNP3Ep_pbxqnM',
          privateKey: process.env.VAPID_PRIVATE_KEY || 'IOJlMKbjKlfpzLVHapcKDfFT_lpPUu7pJpdWBtoIFUo'
        };

        webpush.setVapidDetails(
          'mailto:admin@example.com',
          this.vapidKeys.publicKey,
          this.vapidKeys.privateKey
        );
        
        this.initialized = true;
        console.log('Web Push Service initialized successfully');
      } catch (error) {
        console.error('Error initializing Web Push Service:', error);
        this.initialized = false;
      }
    }
  }

  async sendNotification(subscription, notification) {
    if (!this.initialized || !webpush) {
      return { success: false, error: 'Web push service not initialized' };
    }

    try {
      const payload = JSON.stringify({
        title: notification.title,
        message: notification.message,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: notification._id,
        url: '/notifications',
        notificationId: notification._id,
        type: notification.type,
        priority: notification.priority,
        data: notification.data
      });

      await webpush.sendNotification(subscription, payload);
      return { success: true };
    } catch (error) {
      console.error('Web push error:', error);
      return { success: false, error: error.message };
    }
  }

  getVapidPublicKey() {
    return this.initialized ? this.vapidKeys.publicKey : null;
  }
}

module.exports = new WebPushService();
