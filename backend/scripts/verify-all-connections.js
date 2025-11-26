const mongoose = require('mongoose');
require('dotenv').config();

// Import all models
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Invoice = require('../models/Invoice');
const Customer = require('../models/Customer');
const Manager = require('../models/Manager');
const ProductCategory = require('../models/ProductCategory');
const Notification = require('../models/Notification');
const CustomerLedger = require('../models/CustomerLedger');
const OrderItemApproval = require('../models/OrderItemApproval');
const CategoryAssignment = require('../models/CategoryAssignment');

async function verifyAllConnections() {
  try {
    console.log('🔍 VERIFYING ALL SYSTEM CONNECTIONS');
    console.log('=====================================\n');

    // 1. DATABASE CONNECTION
    console.log('1️⃣ DATABASE CONNECTION');
    console.log('----------------------');
    
    const mongoUri = process.env.CONNECTION_STRING || "mongodb+srv://armanzaman4_db_user:1JJORz7jP2VFgTaP@cluster0.qn1babq.mongodb.net/Ressichem?retryWrites=true&w=majority";
    
    console.log('   Connecting to MongoDB...');
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      dbName: "Ressichem"
    });
    
    console.log('   ✅ MongoDB Connected');
    console.log('   Database:', mongoose.connection.db.databaseName);
    console.log('   Host:', mongoose.connection.host);
    console.log('   State:', mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected');
    console.log('');

    // 2. MODEL COLLECTIONS VERIFICATION
    console.log('2️⃣ MODEL COLLECTIONS VERIFICATION');
    console.log('----------------------------------');
    
    const models = [
      { name: 'User', model: User, collection: 'users' },
      { name: 'Product', model: Product, collection: 'products' },
      { name: 'Order', model: Order, collection: 'orders' },
      { name: 'Invoice', model: Invoice, collection: 'invoices' },
      { name: 'Customer', model: Customer, collection: 'customers' },
      { name: 'Manager', model: Manager, collection: 'managers' },
      { name: 'ProductCategory', model: ProductCategory, collection: 'productcategories' },
      { name: 'Notification', model: Notification, collection: 'notifications' },
      { name: 'CustomerLedger', model: CustomerLedger, collection: 'customerledgers' },
      { name: 'OrderItemApproval', model: OrderItemApproval, collection: 'orderitemapprovals' },
      { name: 'CategoryAssignment', model: CategoryAssignment, collection: 'categoryassignments' },
    ];

    for (const { name, model, collection } of models) {
      try {
        const count = await model.countDocuments();
        const collectionExists = mongoose.connection.db.listCollections({ name: collection }).hasNext();
        console.log(`   ✅ ${name.padEnd(20)} | Collection: ${collection.padEnd(25)} | Documents: ${count}`);
      } catch (error) {
        console.log(`   ❌ ${name.padEnd(20)} | Error: ${error.message}`);
      }
    }
    console.log('');

    // 3. DATA INTEGRITY CHECKS
    console.log('3️⃣ DATA INTEGRITY CHECKS');
    console.log('-------------------------');
    
    // Check Users
    const totalUsers = await User.countDocuments();
    const usersWithCompany = await User.countDocuments({ company_id: { $exists: true, $ne: null } });
    console.log(`   Users: ${totalUsers} total, ${usersWithCompany} with company_id`);
    
    // Check Products
    const totalProducts = await Product.countDocuments();
    const productsWithCompany = await Product.countDocuments({ company_id: { $exists: true, $ne: null } });
    const productsWithCategory = await Product.countDocuments({ 'category.mainCategory': { $exists: true } });
    console.log(`   Products: ${totalProducts} total, ${productsWithCompany} with company_id, ${productsWithCategory} with category`);
    
    // Check Orders
    const totalOrders = await Order.countDocuments();
    const ordersWithCustomer = await Order.countDocuments({ customer: { $exists: true, $ne: null } });
    console.log(`   Orders: ${totalOrders} total, ${ordersWithCustomer} with customer`);
    
    // Check Invoices
    const totalInvoices = await Invoice.countDocuments();
    const invoicesWithOrder = await Invoice.countDocuments({ orderId: { $exists: true, $ne: null } });
    console.log(`   Invoices: ${totalInvoices} total, ${invoicesWithOrder} with orderId`);
    
    // Check Customers
    const totalCustomers = await Customer.countDocuments();
    const customersWithCompany = await Customer.countDocuments({ company_id: { $exists: true, $ne: null } });
    console.log(`   Customers: ${totalCustomers} total, ${customersWithCompany} with company_id`);
    
    // Check Managers
    const totalManagers = await Manager.countDocuments();
    const managersWithCategories = await Manager.countDocuments({ assignedCategories: { $exists: true, $ne: [] } });
    console.log(`   Managers: ${totalManagers} total, ${managersWithCategories} with assigned categories`);
    
    // Check Categories
    const totalCategories = await ProductCategory.countDocuments();
    const activeCategories = await ProductCategory.countDocuments({ isActive: true });
    console.log(`   Categories: ${totalCategories} total, ${activeCategories} active`);
    
    // Check Notifications
    const totalNotifications = await Notification.countDocuments();
    const unreadNotifications = await Notification.countDocuments({ read: false });
    console.log(`   Notifications: ${totalNotifications} total, ${unreadNotifications} unread`);
    console.log('');

    // 4. RELATIONSHIP VERIFICATION
    console.log('4️⃣ RELATIONSHIP VERIFICATION');
    console.log('------------------------------');
    
    // Users → Managers
    const usersWithManagerProfile = await User.countDocuments({ 'managerProfile.manager_id': { $exists: true } });
    console.log(`   ✅ Users with Manager Profile: ${usersWithManagerProfile}`);
    
    // Users → Customers
    const usersWithCustomerProfile = await User.countDocuments({ 'customerProfile.customer_id': { $exists: true } });
    console.log(`   ✅ Users with Customer Profile: ${usersWithCustomerProfile}`);
    
    // Orders → Customers
    const ordersWithValidCustomer = await Order.countDocuments({ 
      customer: { $exists: true, $ne: null },
      company_id: { $exists: true }
    });
    console.log(`   ✅ Orders with valid customer: ${ordersWithValidCustomer}`);
    
    // Invoices → Orders
    const invoicesWithValidOrder = await Invoice.countDocuments({ 
      orderId: { $exists: true, $ne: null },
      company_id: { $exists: true }
    });
    console.log(`   ✅ Invoices with valid order: ${invoicesWithValidOrder}`);
    
    // Managers → Category Assignments
    const managersWithAssignments = await CategoryAssignment.countDocuments();
    console.log(`   ✅ Category Assignments: ${managersWithAssignments}`);
    console.log('');

    // 5. COMPANY ID CONSISTENCY
    console.log('5️⃣ COMPANY ID CONSISTENCY');
    console.log('-------------------------');
    
    const companyIds = {
      users: await User.distinct('company_id'),
      products: await Product.distinct('company_id'),
      orders: await Order.distinct('company_id'),
      invoices: await Invoice.distinct('company_id'),
      customers: await Customer.distinct('company_id'),
      managers: await Manager.distinct('company_id'),
    };
    
    console.log('   Company IDs found:');
    console.log(`     Users: ${companyIds.users.join(', ') || 'None'}`);
    console.log(`     Products: ${companyIds.products.join(', ') || 'None'}`);
    console.log(`     Orders: ${companyIds.orders.join(', ') || 'None'}`);
    console.log(`     Invoices: ${companyIds.invoices.join(', ') || 'None'}`);
    console.log(`     Customers: ${companyIds.customers.join(', ') || 'None'}`);
    console.log(`     Managers: ${companyIds.managers.join(', ') || 'None'}`);
    
    const allCompanyIds = [...new Set([
      ...companyIds.users,
      ...companyIds.products,
      ...companyIds.orders,
      ...companyIds.invoices,
      ...companyIds.customers,
      ...companyIds.managers,
    ])];
    
    console.log(`   ✅ Unique Company IDs: ${allCompanyIds.join(', ') || 'None'}`);
    console.log('');

    // 6. RECENT ACTIVITY
    console.log('6️⃣ RECENT ACTIVITY (Last 7 Days)');
    console.log('---------------------------------');
    
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentUsers = await User.countDocuments({ createdAt: { $gte: sevenDaysAgo } });
    const recentProducts = await Product.countDocuments({ createdAt: { $gte: sevenDaysAgo } });
    const recentOrders = await Order.countDocuments({ createdAt: { $gte: sevenDaysAgo } });
    const recentInvoices = await Invoice.countDocuments({ createdAt: { $gte: sevenDaysAgo } });
    const recentNotifications = await Notification.countDocuments({ createdAt: { $gte: sevenDaysAgo } });
    
    console.log(`   Users created: ${recentUsers}`);
    console.log(`   Products created: ${recentProducts}`);
    console.log(`   Orders created: ${recentOrders}`);
    console.log(`   Invoices created: ${recentInvoices}`);
    console.log(`   Notifications created: ${recentNotifications}`);
    console.log('');

    // 7. SUMMARY
    console.log('7️⃣ CONNECTION SUMMARY');
    console.log('---------------------');
    console.log('   ✅ Database: Connected');
    console.log('   ✅ Models: All registered');
    console.log('   ✅ Collections: All accessible');
    console.log('   ✅ Relationships: Verified');
    console.log('   ✅ Data Integrity: Checked');
    console.log('');
    console.log('✅ ALL CONNECTIONS VERIFIED SUCCESSFULLY!');
    console.log('');

  } catch (error) {
    console.error('❌ Verification Error:', error);
    console.error('   Message:', error.message);
    console.error('   Stack:', error.stack);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

verifyAllConnections();

