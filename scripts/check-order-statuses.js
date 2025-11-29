const mongoose = require('mongoose');
require('dotenv').config();

const Order = require('../models/Order');

async function checkOrderStatuses() {
  try {
    console.log('🔍 CHECKING ORDER STATUSES');
    console.log('==========================\n');

    const mongoUri = process.env.CONNECTION_STRING || "mongodb+srv://armanzaman4_db_user:1JJORz7jP2VFgTaP@cluster0.qn1babq.mongodb.net/Ressichem?retryWrites=true&w=majority";
    
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      dbName: "Ressichem"
    });
    console.log('✅ Connected to MongoDB\n');

    // Get status counts
    const statusCounts = await Order.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    console.log('📊 ORDER STATUS BREAKDOWN:');
    console.log('--------------------------');
    statusCounts.forEach(item => {
      const status = item._id || 'null/undefined';
      console.log(`  ${status.padEnd(20)}: ${item.count} orders`);
    });

    const totalOrders = await Order.countDocuments();
    console.log(`\nTotal Orders: ${totalOrders}`);

    // Check for specific statuses
    const dispatchedCount = await Order.countDocuments({ status: 'dispatched' });
    const completedCount = await Order.countDocuments({ status: 'completed' });
    const deliveredCount = await Order.countDocuments({ status: 'delivered' });
    const shippedCount = await Order.countDocuments({ status: 'shipped' });

    console.log('\n🔍 SPECIFIC STATUS CHECKS:');
    console.log('-------------------------');
    console.log(`  dispatched: ${dispatchedCount} orders`);
    console.log(`  completed: ${completedCount} orders`);
    console.log(`  delivered: ${deliveredCount} orders`);
    console.log(`  shipped: ${shippedCount} orders`);

    // Get all unique statuses
    const allStatuses = await Order.distinct('status');
    console.log(`\n📋 All unique statuses: ${allStatuses.join(', ')}`);

    // Check recent orders (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentStatusCounts = await Order.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    console.log('\n📅 STATUSES IN LAST 30 DAYS:');
    console.log('----------------------------');
    recentStatusCounts.forEach(item => {
      const status = item._id || 'null/undefined';
      console.log(`  ${status.padEnd(20)}: ${item.count} orders`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

checkOrderStatuses();

