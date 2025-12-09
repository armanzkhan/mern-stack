require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { connect, disconnect } = require('../config/_db');

// Import models
const OrderItemApproval = require('../models/OrderItemApproval');
const Order = require('../models/Order');
const User = require('../models/User');
const Customer = require('../models/Customer');
const Manager = require('../models/Manager');
const Product = require('../models/Product');

async function debugApprovalIssue() {
  try {
    // Connect to MongoDB
    await connect();
    console.log('✅ Connected to MongoDB\n');

    // Find customer
    const customer = await Customer.findOne({ email: 'zamar@gmail.com' });
    if (!customer) {
      console.log('❌ Customer "zamar@gmail.com" not found');
      return;
    }
    console.log(`✅ Found customer: ${customer.companyName} (${customer.email})`);
    console.log(`   Customer ID: ${customer._id}\n`);

    // Find manager
    const managerUser = await User.findOne({ email: 'shah@ressichem.com' });
    if (!managerUser) {
      console.log('❌ Manager "shah@ressichem.com" not found');
      return;
    }
    console.log(`✅ Found manager user: ${managerUser.email}`);
    console.log(`   User._id: ${managerUser._id}`);
    console.log(`   user_id: ${managerUser.user_id}`);
    console.log(`   isManager: ${managerUser.isManager}`);
    console.log(`   isActive: ${managerUser.isActive}`);
    console.log(`   Assigned categories:`, managerUser.managerProfile?.assignedCategories || 'None');
    console.log();

    // Find Manager record
    const managerRecord = await Manager.findOne({ user_id: managerUser.user_id });
    if (managerRecord) {
      console.log(`✅ Found Manager record`);
      console.log(`   Manager._id: ${managerRecord._id}`);
      console.log(`   Assigned categories:`, managerRecord.assignedCategories?.map(c => typeof c === 'string' ? c : c.category) || 'None');
    } else {
      console.log(`⚠️ Manager record not found for user_id: ${managerUser.user_id}`);
    }
    console.log();

    // Check customer-manager assignment
    console.log(`🔍 Checking customer-manager assignment:`);
    console.log(`   Customer assignedManager:`, customer.assignedManager?.manager_id || 'None');
    console.log(`   Customer assignedManagers:`, customer.assignedManagers?.length || 0);
    if (customer.assignedManagers && customer.assignedManagers.length > 0) {
      customer.assignedManagers.forEach((am, idx) => {
        console.log(`   [${idx}] manager_id: ${am.manager_id}, isActive: ${am.isActive}`);
      });
    }
    console.log();

    // Check if manager is assigned to customer
    let isAssigned = false;
    if (customer.assignedManager?.manager_id) {
      const assignedManagerRecord = await Manager.findById(customer.assignedManager.manager_id);
      if (assignedManagerRecord && assignedManagerRecord.user_id === managerUser.user_id) {
        isAssigned = true;
        console.log(`✅ Manager is assigned via assignedManager`);
      }
    }
    if (customer.assignedManagers && customer.assignedManagers.length > 0) {
      for (const am of customer.assignedManagers) {
        if (am.manager_id && am.isActive !== false) {
          const assignedManagerRecord = await Manager.findById(am.manager_id);
          if (assignedManagerRecord && assignedManagerRecord.user_id === managerUser.user_id) {
            isAssigned = true;
            console.log(`✅ Manager is assigned via assignedManagers`);
            break;
          }
        }
      }
    }
    if (!isAssigned) {
      console.log(`⚠️ Manager is NOT assigned to customer`);
    }
    console.log();

    // Find recent orders from this customer
    const recentOrders = await Order.find({ customer: customer._id })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('items.product', 'name category');
    
    console.log(`📦 Recent orders from customer (${recentOrders.length}):`);
    for (const order of recentOrders) {
      console.log(`   Order: ${order.orderNumber}`);
      console.log(`       Created: ${order.createdAt}`);
      console.log(`       Items: ${order.items.length}`);
      order.items.forEach((item, itemIdx) => {
        const product = item.product;
        const category = typeof product?.category === 'string' 
          ? product.category 
          : product?.category?.mainCategory || 'Unknown';
        console.log(`         [${itemIdx}] Product: ${product?.name || 'N/A'}, Category: ${category}`);
      });
      
      // Check if approvals exist for this order
      const orderApprovals = await OrderItemApproval.find({ orderId: order._id });
      console.log(`       Approvals: ${orderApprovals.length}`);
      if (orderApprovals.length === 0) {
        console.log(`       ⚠️ NO APPROVALS FOUND FOR THIS ORDER!`);
      } else {
        orderApprovals.forEach(approval => {
          console.log(`         - Approval ID: ${approval._id}, Category: ${approval.category}, AssignedManager: ${approval.assignedManager}, Status: ${approval.status}`);
        });
      }
      console.log();
    }

    // Find approvals for this manager
    const approvals = await OrderItemApproval.find({
      assignedManager: managerUser._id
    })
      .populate('orderId', 'orderNumber customer')
      .populate('product', 'name category')
      .sort({ createdAt: -1 })
      .limit(10);

    console.log(`📋 Approvals assigned to manager (${approvals.length}):`);
    if (approvals.length === 0) {
      console.log(`   ⚠️ No approvals found for manager ${managerUser._id}`);
      
      // Check all approvals
      const allApprovals = await OrderItemApproval.find({}).limit(5);
      console.log(`\n📊 Total approvals in database: ${await OrderItemApproval.countDocuments({})}`);
      console.log(`📊 Sample approvals (first 5):`);
      allApprovals.forEach(approval => {
        console.log(`   - Approval ID: ${approval._id}`);
        console.log(`     assignedManager: ${approval.assignedManager}`);
        console.log(`     category: ${approval.category}`);
        console.log(`     orderId: ${approval.orderId}`);
      });
    } else {
      approvals.forEach((approval, idx) => {
        console.log(`   [${idx}] Approval ID: ${approval._id}`);
        console.log(`       Order: ${approval.orderId?.orderNumber || 'N/A'}`);
        console.log(`       Category: ${approval.category}`);
        console.log(`       Product: ${approval.product?.name || 'N/A'}`);
        console.log(`       Status: ${approval.status}`);
        console.log(`       AssignedManager: ${approval.assignedManager}`);
      });
    }

    await disconnect();
    console.log('\n✅ Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ Error:', error);
    await disconnect();
    process.exit(1);
  }
}

debugApprovalIssue();

