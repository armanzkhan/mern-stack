// Script to verify database connectivity and check all collections in Ressichem database
const mongoose = require('mongoose');
const Customer = require('./models/Customer');
const User = require('./models/User');
const Notification = require('./models/Notification');
const Order = require('./models/Order');
const Product = require('./models/Product');
const Company = require('./models/Company');

async function verifyDatabaseConnectivity() {
  try {
    // Connect to MongoDB
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/Ressichem');
    console.log('✅ Connected to MongoDB - Database: Ressichem');

    // Get database name
    const dbName = mongoose.connection.db.databaseName;
    console.log(`📊 Database Name: ${dbName}`);

    // Check all collections and their counts
    console.log('\n📋 Database Collections Status:');
    
    const collections = [
      { name: 'Customers', model: Customer },
      { name: 'Users', model: User },
      { name: 'Notifications', model: Notification },
      { name: 'Orders', model: Order },
      { name: 'Products', model: Product },
      { name: 'Companies', model: Company }
    ];

    for (const collection of collections) {
      try {
        const count = await collection.model.countDocuments();
        console.log(`   ${collection.name}: ${count} documents`);
      } catch (error) {
        console.log(`   ${collection.name}: Error - ${error.message}`);
      }
    }

    // Get recent notifications
    console.log('\n🔔 Recent Notifications (Last 5):');
    const recentNotifications = await Notification.find()
      .sort({ createdAt: -1 })
      .limit(5);
    
    recentNotifications.forEach((notif, index) => {
      console.log(`   ${index + 1}. ${notif.title} - ${notif.type} - ${notif.createdAt}`);
    });

    // Get recent customers
    console.log('\n👥 Recent Customers (Last 3):');
    const recentCustomers = await Customer.find()
      .sort({ createdAt: -1 })
      .limit(3);
    
    recentCustomers.forEach((customer, index) => {
      console.log(`   ${index + 1}. ${customer.companyName} - ${customer.email} - User ID: ${customer.user_id || 'Not linked'}`);
    });

    // Get recent users
    console.log('\n👤 Recent Users (Last 3):');
    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(3);
    
    recentUsers.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.firstName} ${user.lastName} - ${user.email} - Customer: ${user.isCustomer}`);
    });

    // Check notification types distribution
    console.log('\n📈 Notification Types Distribution:');
    const notificationTypes = await Notification.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    notificationTypes.forEach(type => {
      console.log(`   ${type._id}: ${type.count} notifications`);
    });

    await mongoose.connection.close();
    console.log('\n✅ Database connectivity verification completed successfully');

  } catch (error) {
    console.error('❌ Database connectivity verification failed:', error);
    process.exit(1);
  }
}

verifyDatabaseConnectivity();
