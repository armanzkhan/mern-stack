//services/mobilePushService.js
const admin = require('firebase-admin');

class MobilePushService {
  constructor() {
    this.initialized = false;
    this.initializeFirebase();
  }

  initializeFirebase() {
    try {
      // Check if Firebase environment variables are set
      if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL || !process.env.FIREBASE_PRIVATE_KEY) {
        console.warn('Firebase environment variables not set. Mobile push notifications will be disabled.');
        this.initialized = false;
        return;
      }

      // Initialize Firebase Admin SDK
      if (!admin.apps.length) {
        const serviceAccount = {
          type: "service_account",
          project_id: process.env.FIREBASE_PROJECT_ID,
          private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
          private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
          client_email: process.env.FIREBASE_CLIENT_EMAIL,
          client_id: process.env.FIREBASE_CLIENT_ID,
          auth_uri: "https://accounts.google.com/o/oauth2/auth",
          token_uri: "https://oauth2.googleapis.com/token",
          auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
          client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${process.env.FIREBASE_CLIENT_EMAIL}`
        };

        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
          projectId: process.env.FIREBASE_PROJECT_ID
        });
      }
      this.initialized = true;
      console.log('Firebase Admin SDK initialized successfully');
    } catch (error) {
      console.error('Error initializing Firebase Admin SDK:', error);
      this.initialized = false;
    }
  }

  async sendNotification(token, notification, platform = 'android') {
    if (!this.initialized) {
      return { success: false, error: 'Firebase not initialized' };
    }

    try {
      const message = {
        token: token,
        notification: {
          title: notification.title,
          body: notification.message
        },
        data: {
          notificationId: notification._id,
          type: notification.type,
          priority: notification.priority,
          url: notification.data?.url || '/notifications'
        },
        android: {
          notification: {
            icon: 'ic_notification',
            color: this.getNotificationColor(notification.type),
            priority: this.getAndroidPriority(notification.priority),
            sound: notification.priority === 'urgent' ? 'default' : 'default'
          }
        },
        apns: {
          payload: {
            aps: {
              alert: {
                title: notification.title,
                body: notification.message
              },
              badge: 1,
              sound: notification.priority === 'urgent' ? 'default' : 'default',
              category: notification.type
            }
          }
        }
      };

      const response = await admin.messaging().send(message);
      return { success: true, messageId: response };
    } catch (error) {
      console.error('Error sending mobile push notification:', error);
      return { success: false, error: error.message };
    }
  }

  async sendToMultipleTokens(tokens, notification, platform = 'android') {
    if (!this.initialized) {
      return { success: false, error: 'Firebase not initialized' };
    }

    try {
      const message = {
        tokens: tokens,
        notification: {
          title: notification.title,
          body: notification.message
        },
        data: {
          notificationId: notification._id,
          type: notification.type,
          priority: notification.priority,
          url: notification.data?.url || '/notifications'
        },
        android: {
          notification: {
            icon: 'ic_notification',
            color: this.getNotificationColor(notification.type),
            priority: this.getAndroidPriority(notification.priority)
          }
        },
        apns: {
          payload: {
            aps: {
              alert: {
                title: notification.title,
                body: notification.message
              },
              badge: 1,
              sound: 'default',
              category: notification.type
            }
          }
        }
      };

      const response = await admin.messaging().sendMulticast(message);
      return { 
        success: true, 
        successCount: response.successCount,
        failureCount: response.failureCount,
        responses: response.responses
      };
    } catch (error) {
      console.error('Error sending multicast mobile push notification:', error);
      return { success: false, error: error.message };
    }
  }

  getNotificationColor(type) {
    const colors = {
      info: '#3B82F6',
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      order: '#8B5CF6',
      delivery: '#6366F1',
      invoice: '#EC4899',
      system: '#6B7280'
    };
    return colors[type] || '#3B82F6';
  }

  getAndroidPriority(priority) {
    const priorities = {
      low: 'low',
      medium: 'normal',
      high: 'high',
      urgent: 'high'
    };
    return priorities[priority] || 'normal';
  }

  async validateToken(token) {
    if (!this.initialized) {
      return false;
    }

    try {
      // Try to send a test message to validate the token
      await admin.messaging().send({
        token: token,
        data: { test: 'true' }
      }, true); // dry run
      return true;
    } catch (error) {
      return false;
    }
  }
}

module.exports = new MobilePushService();
