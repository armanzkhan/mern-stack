const mongoose = require('mongoose');
require('dotenv').config();

// Import all models
const User = require('./models/User');
const Order = require('./models/Order');
const OrderItemApproval = require('./models/OrderItemApproval');
const Customer = require('./models/Customer');
const Product = require('./models/Product');
const ProductCategory = require('./models/ProductCategory');
const Role = require('./models/Role');
const Permission = require('./models/Permission');
const Notification = require('./models/Notification');
const Invoice = require('./models/Invoice');

async function comprehensiveAlignmentCheck() {
  try {
    console.log('🔍 COMPREHENSIVE ALIGNMENT CHECK');
    console.log('=================================\n');

    // Connect to MongoDB
    await mongoose.connect(process.env.CONNECTION_STRING || 'mongodb://localhost:27017/Ressichem', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      dbName: 'Ressichem'
    });
    console.log('✅ Database connection successful');

    // 1. DATABASE CONNECTION & COLLECTIONS
    console.log('\n📊 DATABASE CONNECTION & COLLECTIONS');
    console.log('=====================================');
    
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(`📁 Total collections: ${collections.length}`);
    collections.forEach(col => {
      console.log(`   - ${col.name}`);
    });

    // 2. USER SYSTEM
    console.log('\n👥 USER SYSTEM');
    console.log('===============');
    
    const totalUsers = await User.countDocuments();
    const managers = await User.countDocuments({ isManager: true });
    const customers = await User.countDocuments({ isCustomer: true });
    const superAdmins = await User.countDocuments({ isSuperAdmin: true });
    
    console.log(`👤 Total users: ${totalUsers}`);
    console.log(`👨‍💼 Managers: ${managers}`);
    console.log(`👥 Customers: ${customers}`);
    console.log(`🔑 Super Admins: ${superAdmins}`);

    // Check specific users
    const testUsers = await User.find({
      email: { $in: ['sales@ressichem.com', 'companyadmin@samplecompany.com', 'yousuf@gmail.com'] }
    });
    
    console.log('\n🔍 Test Users Status:');
    testUsers.forEach(user => {
      console.log(`   ${user.email}:`);
      console.log(`     - Name: ${user.firstName} ${user.lastName}`);
      console.log(`     - Is Manager: ${user.isManager}`);
      console.log(`     - Is Customer: ${user.isCustomer}`);
      console.log(`     - Is Super Admin: ${user.isSuperAdmin}`);
      console.log(`     - Company ID: ${user.company_id}`);
      console.log(`     - Roles: ${user.roles?.length || 0} roles`);
    });

    // 3. PERMISSIONS SYSTEM
    console.log('\n🔐 PERMISSIONS SYSTEM');
    console.log('=====================');
    
    const totalPermissions = await Permission.countDocuments();
    const totalRoles = await Role.countDocuments();
    
    console.log(`🔑 Total permissions: ${totalPermissions}`);
    console.log(`👔 Total roles: ${totalRoles}`);

    // Check key permissions
    const keyPermissions = await Permission.find({
      key: { $in: ['orders.read', 'orders.create', 'orders.update', 'orders.delete', 'invoices.create', 'invoices.read'] }
    });
    
    console.log('\n🔍 Key Permissions:');
    keyPermissions.forEach(perm => {
      console.log(`   ${perm.key}: ${perm.name || 'No name'} (${perm._id})`);
    });

    // Check Manager role permissions
    const managerRole = await Role.findOne({ name: 'Manager' }).populate('permissions');
    if (managerRole) {
      console.log(`\n👨‍💼 Manager Role Permissions (${managerRole.permissions.length}):`);
      managerRole.permissions.forEach(perm => {
        console.log(`   - ${perm.key}: ${perm.name || 'No name'}`);
      });
    }

    // 4. ORDER SYSTEM
    console.log('\n📦 ORDER SYSTEM');
    console.log('================');
    
    const totalOrders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({ status: 'pending' });
    const approvedOrders = await Order.countDocuments({ status: 'approved' });
    const rejectedOrders = await Order.countDocuments({ status: 'rejected' });
    
    console.log(`📋 Total orders: ${totalOrders}`);
    console.log(`⏳ Pending orders: ${pendingOrders}`);
    console.log(`✅ Approved orders: ${approvedOrders}`);
    console.log(`❌ Rejected orders: ${rejectedOrders}`);

    // Check order item approvals
    const totalApprovals = await OrderItemApproval.countDocuments();
    const pendingApprovals = await OrderItemApproval.countDocuments({ status: 'pending' });
    const approvedApprovals = await OrderItemApproval.countDocuments({ status: 'approved' });
    const rejectedApprovals = await OrderItemApproval.countDocuments({ status: 'rejected' });
    
    console.log(`\n📝 Order Item Approvals:`);
    console.log(`   Total approvals: ${totalApprovals}`);
    console.log(`   Pending: ${pendingApprovals}`);
    console.log(`   Approved: ${approvedApprovals}`);
    console.log(`   Rejected: ${rejectedApprovals}`);

    // 5. NOTIFICATION SYSTEM
    console.log('\n🔔 NOTIFICATION SYSTEM');
    console.log('======================');
    
    const totalNotifications = await Notification.countDocuments();
    const recentNotifications = await Notification.find()
      .sort({ createdAt: -1 })
      .limit(5);
    
    console.log(`📢 Total notifications: ${totalNotifications}`);
    console.log('\n📋 Recent notifications:');
    recentNotifications.forEach((notif, index) => {
      console.log(`   ${index + 1}. ${notif.title} (${notif.type}) - ${notif.createdAt}`);
    });

    // 6. INVOICE SYSTEM
    console.log('\n🧾 INVOICE SYSTEM');
    console.log('=================');
    
    const totalInvoices = await Invoice.countDocuments();
    const draftInvoices = await Invoice.countDocuments({ status: 'draft' });
    const sentInvoices = await Invoice.countDocuments({ status: 'sent' });
    const paidInvoices = await Invoice.countDocuments({ status: 'paid' });
    
    console.log(`📄 Total invoices: ${totalInvoices}`);
    console.log(`📝 Draft invoices: ${draftInvoices}`);
    console.log(`📤 Sent invoices: ${sentInvoices}`);
    console.log(`💰 Paid invoices: ${paidInvoices}`);

    // 7. PRODUCT & CATEGORY SYSTEM
    console.log('\n🏷️ PRODUCT & CATEGORY SYSTEM');
    console.log('=============================');
    
    const totalProducts = await Product.countDocuments();
    const totalCategories = await ProductCategory.countDocuments();
    
    console.log(`📦 Total products: ${totalProducts}`);
    console.log(`🏷️ Total categories: ${totalCategories}`);

    // 8. CUSTOMER SYSTEM
    console.log('\n👥 CUSTOMER SYSTEM');
    console.log('==================');
    
    const totalCustomers = await Customer.countDocuments();
    const activeCustomers = await Customer.countDocuments({ isActive: true });
    
    console.log(`👤 Total customers: ${totalCustomers}`);
    console.log(`✅ Active customers: ${activeCustomers}`);

    // 9. API ENDPOINT VERIFICATION
    console.log('\n🌐 API ENDPOINT VERIFICATION');
    console.log('============================');
    
    const testEndpoints = [
      'http://localhost:5000/api/orders',
      'http://localhost:5000/api/users',
      'http://localhost:5000/api/notifications/recent',
      'http://localhost:5000/api/invoices'
    ];

    for (const endpoint of testEndpoints) {
      try {
        const response = await fetch(endpoint, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        });
        console.log(`   ${endpoint}: ${response.status} ${response.ok ? '✅' : '❌'}`);
      } catch (error) {
        console.log(`   ${endpoint}: ❌ Connection failed`);
      }
    }

    // 10. DATA INTEGRITY CHECKS
    console.log('\n🔍 DATA INTEGRITY CHECKS');
    console.log('=========================');
    
    // Check for orphaned approvals
    const orphanedApprovals = await OrderItemApproval.countDocuments({
      orderId: { $nin: await Order.distinct('_id') }
    });
    console.log(`🔗 Orphaned approvals: ${orphanedApprovals} ${orphanedApprovals > 0 ? '❌' : '✅'}`);

    // Check for users without roles
    const usersWithoutRoles = await User.countDocuments({
      $or: [
        { roles: { $exists: false } },
        { roles: { $size: 0 } }
      ]
    });
    console.log(`👤 Users without roles: ${usersWithoutRoles} ${usersWithoutRoles > 0 ? '❌' : '✅'}`);

    // Check for notifications without proper structure
    const invalidNotifications = await Notification.countDocuments({
      $or: [
        { title: { $exists: false } },
        { message: { $exists: false } },
        { type: { $exists: false } }
      ]
    });
    console.log(`📢 Invalid notifications: ${invalidNotifications} ${invalidNotifications > 0 ? '❌' : '✅'}`);

    console.log('\n✅ COMPREHENSIVE ALIGNMENT CHECK COMPLETED');
    console.log('===========================================');

  } catch (error) {
    console.error('❌ Error during alignment check:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
}

// Run the comprehensive check
comprehensiveAlignmentCheck();
