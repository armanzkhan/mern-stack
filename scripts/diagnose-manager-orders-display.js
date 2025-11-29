require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { connect, disconnect } = require('../config/_db');
const Order = require('../models/Order');
const User = require('../models/User');
const Manager = require('../models/Manager');
const OrderItemApproval = require('../models/OrderItemApproval');

const MANAGER_EMAIL = 'amin.irfan@ressichem.com';

async function diagnoseManagerOrdersDisplay() {
  try {
    await connect();
    console.log('✅ Connected to MongoDB\n');

    console.log('🔍 DIAGNOSING MANAGER ORDERS DISPLAY ISSUE\n');
    console.log('='.repeat(80));

    // 1. Find the manager user
    console.log(`\n1️⃣ Finding manager: ${MANAGER_EMAIL}`);
    const managerUser = await User.findOne({ email: MANAGER_EMAIL });
    if (!managerUser) {
      console.log('❌ Manager user not found!');
      await disconnect();
      return;
    }

    console.log('✅ Manager user found:');
    console.log(`   - User._id: ${managerUser._id}`);
    console.log(`   - user_id: ${managerUser.user_id}`);
    console.log(`   - Email: ${managerUser.email}`);
    console.log(`   - Is Manager: ${managerUser.isManager}`);
    console.log(`   - Is Active: ${managerUser.isActive}`);

    // 2. Check manager categories
    console.log(`\n2️⃣ Checking manager categories:`);
    let managerCategories = [];
    if (managerUser.managerProfile?.assignedCategories) {
      managerCategories = managerUser.managerProfile.assignedCategories.map(c =>
        typeof c === 'string' ? c : (c.category || c)
      );
      console.log(`   - From User.managerProfile: ${managerCategories.join(', ')}`);
    }

    const managerRecord = await Manager.findOne({ user_id: managerUser.user_id });
    if (managerRecord) {
      const recordCategories = managerRecord.assignedCategories.map(c =>
        typeof c === 'string' ? c : (c.category || c)
      );
      console.log(`   - From Manager record: ${recordCategories.join(', ')}`);
      if (managerCategories.length === 0) {
        managerCategories = recordCategories;
      }
    }

    // 3. Check OrderItemApproval entries
    console.log(`\n3️⃣ Checking OrderItemApproval entries:`);
    console.log(`   - Looking for approvals with assignedManager: ${managerUser._id}`);
    
    const approvals = await OrderItemApproval.find({
      assignedManager: managerUser._id
    });

    console.log(`   - Found ${approvals.length} approval(s) assigned to this manager`);
    
    if (approvals.length > 0) {
      const orderIds = [...new Set(approvals.map(a => a.orderId.toString()))];
      console.log(`   - Unique order IDs: ${orderIds.length}`);
      console.log(`   - Order IDs: ${orderIds.join(', ')}`);

      // 4. Check if orders exist
      console.log(`\n4️⃣ Checking if orders exist:`);
      const orders = await Order.find({
        _id: { $in: orderIds }
      });

      console.log(`   - Found ${orders.length} order(s) in database`);
      for (const order of orders) {
        console.log(`   - Order: ${order.orderNumber} (ID: ${order._id})`);
        console.log(`     Status: ${order.status}`);
        console.log(`     Customer: ${order.customer?.companyName || order.customer?.email || 'N/A'}`);
        console.log(`     Categories: ${order.categories?.join(', ') || 'None'}`);
        console.log(`     Created: ${order.createdAt}`);
      }
    } else {
      console.log(`   ⚠️ NO APPROVALS FOUND! This is the problem.`);
      console.log(`   - The manager has no item approvals assigned`);
      console.log(`   - This means orders won't show up in the dashboard`);
    }

    // 5. Check all orders in the system
    console.log(`\n5️⃣ Checking all orders in system:`);
    const allOrders = await Order.find({ company_id: 'RESSICHEM' })
      .populate('customer', 'companyName email')
      .sort({ createdAt: -1 })
      .limit(10);

    console.log(`   - Total orders in system: ${await Order.countDocuments({ company_id: 'RESSICHEM' })}`);
    console.log(`   - Recent orders (last 10):`);
    for (const order of allOrders) {
      console.log(`     - ${order.orderNumber}: ${order.categories?.join(', ') || 'No categories'}`);
    }

    // 6. Check if there are any approvals at all
    console.log(`\n6️⃣ Checking all OrderItemApproval entries:`);
    const allApprovals = await OrderItemApproval.find({ company_id: 'RESSICHEM' })
      .populate('assignedManager', 'email')
      .limit(10);

    console.log(`   - Total approvals in system: ${await OrderItemApproval.countDocuments({ company_id: 'RESSICHEM' })}`);
    console.log(`   - Sample approvals (last 10):`);
    for (const approval of allApprovals) {
      const manager = approval.assignedManager ? await User.findById(approval.assignedManager) : null;
      console.log(`     - Approval ID: ${approval._id}`);
      console.log(`       Order ID: ${approval.orderId}`);
      console.log(`       Assigned Manager: ${manager?.email || approval.assignedManager || 'None'}`);
      console.log(`       Category: ${approval.category}`);
      console.log(`       Status: ${approval.status}`);
    }

    // 7. Test the query that getOrders uses
    console.log(`\n7️⃣ Testing the query that getOrders uses:`);
    if (approvals.length > 0) {
      const approvalOrderIds = approvals.map(a => a.orderId);
      const testQuery = {
        _id: { $in: approvalOrderIds },
        company_id: 'RESSICHEM'
      };
      console.log(`   - Query:`, JSON.stringify(testQuery, null, 2));
      
      const testOrders = await Order.find(testQuery);
      console.log(`   - Orders found with this query: ${testOrders.length}`);
    } else {
      console.log(`   ⚠️ Cannot test query - no approvals found`);
    }

    // 8. Summary and recommendations
    console.log(`\n8️⃣ SUMMARY AND RECOMMENDATIONS:`);
    console.log('='.repeat(80));

    if (approvals.length === 0) {
      console.log('\n❌ ROOT CAUSE: No OrderItemApproval entries found for this manager');
      console.log('\n💡 RECOMMENDATIONS:');
      console.log('   1. Check if item approvals were created when orders were created');
      console.log('   2. Verify that the order creation process calls itemApprovalService.createItemApprovals()');
      console.log('   3. Check if there are any errors in the order creation logs');
      console.log('   4. Re-run the fix script: node scripts/fix-order-manager-assignment.js');
    } else if (approvals.length > 0 && orders.length === 0) {
      console.log('\n❌ ROOT CAUSE: Approvals exist but orders not found');
      console.log('   - This could be a data inconsistency issue');
      console.log('   - Order IDs in approvals might not match actual orders');
    } else {
      console.log('\n✅ Data looks correct - orders and approvals exist');
      console.log('   - The issue might be in the API endpoint logic');
      console.log('   - Check server logs when accessing /api/orders');
    }

    console.log('\n' + '='.repeat(80));

    await disconnect();
  } catch (error) {
    console.error('❌ Error during diagnosis:', error);
    console.error(error.stack);
    await disconnect();
  }
}

diagnoseManagerOrdersDisplay();

