require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { connect, disconnect } = require('../config/_db');
const Order = require('../models/Order');
const Customer = require('../models/Customer');
const User = require('../models/User');
const Manager = require('../models/Manager');
const OrderItemApproval = require('../models/OrderItemApproval');
const Product = require('../models/Product');
const Notification = require('../models/Notification');

const ORDER_NUMBER = 'ORD-1764151352256-m8v79pi84';
const MANAGER_EMAIL = 'amin.irfan@ressichem.com';

async function diagnoseOrder() {
  try {
    console.log('\n🔍 DIAGNOSING ORDER ISSUE\n');
    console.log('='.repeat(60));
    
    // 1. Find the order
    console.log(`\n1️⃣ Finding order: ${ORDER_NUMBER}`);
    const order = await Order.findOne({ orderNumber: ORDER_NUMBER })
      .populate('customer', 'companyName email assignedManager assignedManagers');
    
    if (!order) {
      console.log('❌ Order not found!');
      return;
    }
    
    console.log('✅ Order found:');
    console.log(`   - Order ID: ${order._id}`);
    console.log(`   - Status: ${order.status}`);
    console.log(`   - Approval Status: ${order.approvalStatus}`);
    console.log(`   - Categories: ${order.categories.join(', ') || 'None'}`);
    console.log(`   - Customer: ${order.customer?.companyName} (${order.customer?.email})`);
    console.log(`   - Created At: ${order.createdAt}`);
    
    // 2. Check customer's assigned managers
    console.log(`\n2️⃣ Checking customer's assigned managers:`);
    const customer = order.customer;
    if (customer) {
      if (customer.assignedManager?.manager_id) {
        const manager = await Manager.findById(customer.assignedManager.manager_id);
        if (manager) {
          const user = await User.findOne({ user_id: manager.user_id });
          console.log(`   - Assigned Manager: ${user?.email || manager.user_id}`);
        }
      }
      if (customer.assignedManagers && customer.assignedManagers.length > 0) {
        console.log(`   - Assigned Managers (${customer.assignedManagers.length}):`);
        for (const am of customer.assignedManagers) {
          if (am.manager_id && am.isActive !== false) {
            const manager = await Manager.findById(am.manager_id);
            if (manager) {
              const user = await User.findOne({ user_id: manager.user_id });
              console.log(`     - ${user?.email || manager.user_id} (Active: ${am.isActive})`);
            }
          }
        }
      } else {
        console.log('   - No assigned managers found');
      }
    }
    
    // 3. Check products and their categories
    console.log(`\n3️⃣ Checking order items and product categories:`);
    const productIds = order.items.map(item => item.product);
    const products = await Product.find({ _id: { $in: productIds } });
    const productMap = new Map(products.map(p => [p._id.toString(), p]));
    
    const orderCategories = new Set();
    for (let i = 0; i < order.items.length; i++) {
      const item = order.items[i];
      const product = productMap.get(item.product.toString());
      if (product) {
        let category = '';
        if (typeof product.category === 'string') {
          category = product.category;
        } else if (product.category?.mainCategory) {
          category = product.category.mainCategory;
        }
        orderCategories.add(category);
        console.log(`   - Item ${i + 1}: ${product.name || 'Unknown'}`);
        console.log(`     Category: ${category || 'None'}`);
      }
    }
    console.log(`   - Unique Categories in Order: ${Array.from(orderCategories).join(', ') || 'None'}`);
    
    // 4. Check item approvals
    console.log(`\n4️⃣ Checking item approvals:`);
    const approvals = await OrderItemApproval.find({ orderId: order._id })
      .populate('assignedManager', 'email')
      .populate('product', 'name');
    
    console.log(`   - Total Approvals: ${approvals.length}`);
    for (const approval of approvals) {
      const manager = approval.assignedManager ? await User.findById(approval.assignedManager) : null;
      console.log(`   - Approval ID: ${approval._id}`);
      console.log(`     Status: ${approval.status}`);
      console.log(`     Category: ${approval.category}`);
      console.log(`     Assigned Manager: ${manager?.email || approval.assignedManager || 'None (Auto-approved)'}`);
      console.log(`     Product: ${approval.product?.name || 'Unknown'}`);
      console.log(`     Created At: ${approval.createdAt}`);
    }
    
    // 5. Check the specific manager
    console.log(`\n5️⃣ Checking manager: ${MANAGER_EMAIL}`);
    const managerUser = await User.findOne({ email: MANAGER_EMAIL });
    if (!managerUser) {
      console.log('❌ Manager user not found!');
      return;
    }
    
    console.log('✅ Manager user found:');
    console.log(`   - User ID: ${managerUser._id}`);
    console.log(`   - User ID (string): ${managerUser.user_id}`);
    console.log(`   - Is Manager: ${managerUser.isManager}`);
    console.log(`   - Is Active: ${managerUser.isActive}`);
    
    // Check manager profile
    if (managerUser.managerProfile) {
      console.log(`   - Manager Profile exists`);
      console.log(`   - Assigned Categories: ${JSON.stringify(managerUser.managerProfile.assignedCategories || [])}`);
      if (managerUser.managerProfile.notificationPreferences) {
        console.log(`   - Notification Preferences:`);
        console.log(`     - Order Updates: ${managerUser.managerProfile.notificationPreferences.orderUpdates}`);
        console.log(`     - New Orders: ${managerUser.managerProfile.notificationPreferences.newOrders}`);
      }
    } else {
      console.log('   ⚠️ No manager profile found');
    }
    
    // Check Manager record
    const managerRecord = await Manager.findOne({ user_id: managerUser.user_id });
    if (managerRecord) {
      console.log(`   - Manager Record exists`);
      console.log(`   - Assigned Categories: ${JSON.stringify(managerRecord.assignedCategories?.map(c => typeof c === 'string' ? c : c.category) || [])}`);
      if (managerRecord.notificationPreferences) {
        console.log(`   - Notification Preferences:`);
        console.log(`     - Order Updates: ${managerRecord.notificationPreferences.orderUpdates}`);
        console.log(`     - New Orders: ${managerRecord.notificationPreferences.newOrders}`);
      }
    } else {
      console.log('   ⚠️ No Manager record found');
    }
    
    // 6. Check if manager has matching categories
    console.log(`\n6️⃣ Checking category match:`);
    const orderCategoriesArray = Array.from(orderCategories);
    let managerCategories = [];
    
    if (managerUser.managerProfile?.assignedCategories) {
      managerCategories = managerUser.managerProfile.assignedCategories.map(c => 
        typeof c === 'string' ? c : (c.category || c)
      );
    } else if (managerRecord?.assignedCategories) {
      managerCategories = managerRecord.assignedCategories.map(c => 
        typeof c === 'string' ? c : (c.category || c)
      );
    }
    
    console.log(`   - Order Categories: ${orderCategoriesArray.join(', ') || 'None'}`);
    console.log(`   - Manager Categories: ${managerCategories.join(', ') || 'None'}`);
    
    const hasMatchingCategory = orderCategoriesArray.some(orderCat => 
      managerCategories.some(managerCat => {
        const orderCatStr = orderCat || '';
        const managerCatStr = managerCat || '';
        return orderCatStr === managerCatStr || 
               orderCatStr.includes(managerCatStr) || 
               managerCatStr.includes(orderCatStr);
      })
    );
    
    console.log(`   - Has Matching Category: ${hasMatchingCategory ? '✅ YES' : '❌ NO'}`);
    
    // 7. Check if manager is assigned to customer
    console.log(`\n7️⃣ Checking if manager is assigned to customer:`);
    let isAssignedToCustomer = false;
    if (customer) {
      if (customer.assignedManager?.manager_id) {
        const assignedManager = await Manager.findById(customer.assignedManager.manager_id);
        if (assignedManager && assignedManager.user_id === managerUser.user_id) {
          isAssignedToCustomer = true;
          console.log('   ✅ Manager is assigned via assignedManager');
        }
      }
      if (customer.assignedManagers && customer.assignedManagers.length > 0) {
        for (const am of customer.assignedManagers) {
          if (am.manager_id && am.isActive !== false) {
            const assignedManager = await Manager.findById(am.manager_id);
            if (assignedManager && assignedManager.user_id === managerUser.user_id) {
              isAssignedToCustomer = true;
              console.log('   ✅ Manager is assigned via assignedManagers array');
              break;
            }
          }
        }
      }
    }
    if (!isAssignedToCustomer) {
      console.log('   ⚠️ Manager is NOT assigned to customer');
      console.log('   ℹ️ Note: If customer has no assigned managers, all managers with matching categories should receive notifications');
    }
    
    // 8. Check notifications sent to this manager
    console.log(`\n8️⃣ Checking notifications sent to manager:`);
    const notifications = await Notification.find({
      targetType: 'user',
      targetIds: managerUser._id,
      'data.orderNumber': ORDER_NUMBER
    }).sort({ createdAt: -1 });
    
    console.log(`   - Notifications found: ${notifications.length}`);
    for (const notif of notifications) {
      console.log(`   - Notification ID: ${notif._id}`);
      console.log(`     Title: ${notif.title}`);
      console.log(`     Message: ${notif.message}`);
      console.log(`     Type: ${notif.type}`);
      console.log(`     Status: ${notif.status}`);
      console.log(`     Created At: ${notif.createdAt}`);
    }
    
    // 9. Check why order status is "processing"
    console.log(`\n9️⃣ Analyzing order status "processing":`);
    const pendingApprovals = approvals.filter(a => a.status === 'pending');
    const approvedApprovals = approvals.filter(a => a.status === 'approved');
    const rejectedApprovals = approvals.filter(a => a.status === 'rejected');
    
    console.log(`   - Pending Approvals: ${pendingApprovals.length}`);
    console.log(`   - Approved Approvals: ${approvedApprovals.length}`);
    console.log(`   - Rejected Approvals: ${rejectedApprovals.length}`);
    
    if (order.status === 'processing') {
      if (approvedApprovals.length > 0 && pendingApprovals.length === 0) {
        console.log('   ✅ Status is "processing" because all items have been approved');
      } else if (approvedApprovals.length > 0 && pendingApprovals.length > 0) {
        console.log('   ⚠️ Status is "processing" but there are still pending approvals');
        console.log('   ⚠️ This might be because an item was approved, which sets status to "processing"');
      } else {
        console.log('   ⚠️ Status is "processing" but no items have been approved');
        console.log('   ⚠️ This might indicate an issue with the approval flow');
      }
    }
    
    // 10. Summary and recommendations
    console.log(`\n🔟 SUMMARY AND RECOMMENDATIONS:`);
    console.log('='.repeat(60));
    
    const issues = [];
    const recommendations = [];
    
    if (!hasMatchingCategory) {
      issues.push('Manager does not have matching category');
      recommendations.push(`Assign category "${orderCategoriesArray[0] || 'Unknown'}" to manager ${MANAGER_EMAIL}`);
    }
    
    if (notifications.length === 0) {
      issues.push('No notifications were sent to manager');
      if (hasMatchingCategory) {
        recommendations.push('Check notification preferences - they might be disabled');
      }
    }
    
    if (order.status === 'processing' && pendingApprovals.length > 0) {
      issues.push('Order status is "processing" but there are pending approvals');
      recommendations.push('This is expected behavior - status changes to "processing" when any item is approved');
    }
    
    if (approvals.length === 0 || approvals.every(a => !a.assignedManager)) {
      issues.push('No manager was assigned to any item (items were auto-approved)');
      recommendations.push('Check why no manager was found for the categories in this order');
    }
    
    if (issues.length > 0) {
      console.log('\n❌ ISSUES FOUND:');
      issues.forEach((issue, i) => console.log(`   ${i + 1}. ${issue}`));
    } else {
      console.log('\n✅ No obvious issues found');
    }
    
    if (recommendations.length > 0) {
      console.log('\n💡 RECOMMENDATIONS:');
      recommendations.forEach((rec, i) => console.log(`   ${i + 1}. ${rec}`));
    }
    
    console.log('\n' + '='.repeat(60));
    
  } catch (error) {
    console.error('❌ Error during diagnosis:', error);
    console.error(error.stack);
  }
}

async function main() {
  try {
    await connect();
    console.log('✅ Connected to MongoDB\n');
    await diagnoseOrder();
    await disconnect();
    console.log('\n✅ Diagnosis complete');
    process.exit(0);
  } catch (error) {
    console.error('❌ Fatal error:', error);
    await disconnect();
    process.exit(1);
  }
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});

