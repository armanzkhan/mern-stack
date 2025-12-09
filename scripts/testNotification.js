// scripts/testNotification.js
const notificationService = require('../services/notificationService');
const { connect, disconnect } = require('../config/_db');

async function testNotification() {
  await connect();
  try {
    const testNotification = {
      title: 'Welcome to the Notification System!',
      message: 'This is a test notification to demonstrate the new push notification system.',
      type: 'info',
      priority: 'medium',
      targetType: 'company',
      targetIds: [], // company-wide
      company_id: 'RESSICHEM',
      sender_id: 'system',
      sender_name: 'System',
      data: { url: '/notifications', test: true },
      actions: [{ label: 'View Notifications', action: 'view', url: '/notifications' }],
      channels: ['in_app', 'web_push'],
      status: 'draft'
    };

    const notification = await notificationService.createNotification(testNotification);
    console.log('Created notification id:', notification._id);

    const results = await notificationService.sendNotification(notification._id);
    console.log('Send results:', results);
  } catch (err) {
    console.error('testNotification error:', err);
  } finally {
    await disconnect();
  }
}

if (require.main === module) {
  testNotification().catch(err => {
    console.error(err);
    process.exit(1);
  });
}

module.exports = testNotification;
