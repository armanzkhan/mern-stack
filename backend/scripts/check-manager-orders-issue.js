require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { connect, disconnect } = require('../config/_db');
const Order = require('../models/Order');
const Customer = require('../models/Customer');
const User = require('../models/User');
const Manager = require('../models/Manager');
const OrderItemApproval = require('../models/OrderItemApproval');
const Product = require('../models/Product');

const ORDER_NUMBER = 'ORD-1764153310822-e4qcnavca';
const MANAGER_EMAIL = 'amin.irfan@ressichem.com';

async function checkManagerOrdersIssue() {
  try {
    await connect();
    console.log('✅ Connected to MongoDB\n');

    console.log('🔍 INVESTIGATING MANAGER ORDERS ISSUE\n');
    console.log('='.repeat(80));

    // 1. Find the order
    console.log(`\n1️⃣ Finding order: ${ORDER_NUMBER}`);
    const order = await Order.findOne({ orderNumber: ORDER_NUMBER })
      .populate('customer', 'companyName email assignedManager assignedManagers');

    if (!order) {
      console.log('❌ Order not found!');
      await disconnect();
      return;
    }

    console.log('✅ Order found:');
    console.log(`   - Order ID: ${order._id}`);
    console.log(`   - Status: ${order.status}`);
    console.log(`   - Categories: ${order.categories.join(', ') || 'None'}`);
    console.log(`   - Customer: ${order.customer?.companyName} (${order.customer?.email})`);
    console.log(`   - Created At: ${order.createdAt}`);

    // 2. Check products and their categories
    console.log(`\n2️⃣ Checking order items and product categories:`);
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

    // 3. Check item approvals
    console.log(`\n3️⃣ Checking item approvals:`);
    const approvals = await OrderItemApproval.find({ orderId: order._id })
      .populate('assignedManager')
      .populate('product', 'name');

    console.log(`   - Total Approvals: ${approvals.length}`);
    for (const approval of approvals) {
      const manager = approval.assignedManager ? await User.findById(approval.assignedManager) : null;
      console.log(`   - Approval ID: ${approval._id}`);
      console.log(`     Status: ${approval.status}`);
      console.log(`     Category: ${approval.category}`);
      console.log(`     Assigned Manager: ${manager?.email || approval.assignedManager || 'None (Auto-approved)'}`);
      console.log(`     Product: ${approval.product?.name || 'Unknown'}`);
    }

    // 4. Check the manager
    console.log(`\n4️⃣ Checking manager: ${MANAGER_EMAIL}`);
    const managerUser = await User.findOne({ email: MANAGER_EMAIL });
    if (!managerUser) {
      console.log('❌ Manager user not found!');
      await disconnect();
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
      const userCategories = managerUser.managerProfile.assignedCategories?.map(c =>
        typeof c === 'string' ? c : (c.category || c)
      ) || [];
      console.log(`   - Assigned Categories in User.managerProfile: ${userCategories.join(', ') || 'None'}`);
    } else {
      console.log('   ⚠️ No manager profile found');
    }

    // Check Manager record
    const managerRecord = await Manager.findOne({ user_id: managerUser.user_id });
    if (managerRecord) {
      console.log(`   - Manager Record exists`);
      const managerCategories = managerRecord.assignedCategories?.map(c =>
        typeof c === 'string' ? c : (c.category || c)
      ) || [];
      console.log(`   - Assigned Categories in Manager record: ${managerCategories.join(', ') || 'None'}`);
      console.log(`   - Is Active: ${managerRecord.isActive}`);
    } else {
      console.log('   ⚠️ No Manager record found');
    }

    // 5. Check category matching
    console.log(`\n5️⃣ Checking category match:`);
    const orderCategoriesArray = Array.from(orderCategories);
    
    // Get all manager categories (from both sources)
    let managerCategories = [];
    if (managerUser.managerProfile?.assignedCategories) {
      managerCategories = managerUser.managerProfile.assignedCategories.map(c =>
        typeof c === 'string' ? c : (c.category || c)
      );
    }
    if (managerRecord?.assignedCategories) {
      const recordCategories = managerRecord.assignedCategories.map(c =>
        typeof c === 'string' ? c : (c.category || c)
      );
      // Merge categories
      managerCategories = [...new Set([...managerCategories, ...recordCategories])];
    }

    console.log(`   - Order Categories: ${orderCategoriesArray.join(', ') || 'None'}`);
    console.log(`   - Manager Categories: ${managerCategories.join(', ') || 'None'}`);

    // Normalize function for comparison
    const normalize = (cat) => {
      if (!cat || typeof cat !== 'string') return '';
      return cat.toLowerCase().trim().replace(/\s*&\s*/g, ' and ').replace(/\s+/g, ' ');
    };

    const hasMatchingCategory = orderCategoriesArray.some(orderCat => {
      const normalizedOrderCat = normalize(orderCat);
      return managerCategories.some(managerCat => {
        const normalizedManagerCat = normalize(managerCat);
        return normalizedOrderCat === normalizedManagerCat ||
               normalizedOrderCat.includes(normalizedManagerCat) ||
               normalizedManagerCat.includes(normalizedOrderCat);
      });
    });

    console.log(`   - Has Matching Category: ${hasMatchingCategory ? '✅ YES' : '❌ NO'}`);

    // 6. Check if manager has any pending approvals
    console.log(`\n6️⃣ Checking manager's pending approvals:`);
    const managerPendingApprovals = await OrderItemApproval.find({
      assignedManager: managerUser._id,
      status: 'pending',
      company_id: order.company_id
    })
      .populate('orderId', 'orderNumber status')
      .populate('product', 'name');

    console.log(`   - Pending Approvals for this manager: ${managerPendingApprovals.length}`);
    for (const approval of managerPendingApprovals) {
      console.log(`   - Approval ID: ${approval._id}`);
      console.log(`     Order: ${approval.orderId?.orderNumber || 'N/A'}`);
      console.log(`     Category: ${approval.category}`);
      console.log(`     Product: ${approval.product?.name || 'N/A'}`);
    }

    // 7. Check if manager should see this order
    console.log(`\n7️⃣ Checking if manager should see this order:`);
    const orderApprovals = await OrderItemApproval.find({
      orderId: order._id,
      assignedManager: managerUser._id
    });

    console.log(`   - Approvals assigned to this manager for this order: ${orderApprovals.length}`);
    if (orderApprovals.length === 0) {
      console.log('   ❌ No approvals assigned to this manager for this order');
      console.log('   ⚠️ This means the manager will NOT see this order');
    } else {
      console.log('   ✅ Manager has approvals for this order');
    }

    // 8. Summary and recommendations
    console.log(`\n8️⃣ SUMMARY AND RECOMMENDATIONS:`);
    console.log('='.repeat(80));

    const issues = [];
    const recommendations = [];

    if (!hasMatchingCategory) {
      issues.push('Manager does not have matching category');
      recommendations.push(`Assign category "${orderCategoriesArray[0] || 'Unknown'}" to manager ${MANAGER_EMAIL}`);
    }

    if (orderApprovals.length === 0) {
      issues.push('No item approvals assigned to manager for this order');
      if (hasMatchingCategory) {
        recommendations.push('Check why item approvals were not created/assigned - may need to recreate approvals');
      } else {
        recommendations.push('First assign matching category to manager, then recreate item approvals');
      }
    }

    if (managerPendingApprovals.length === 0 && orderApprovals.length > 0) {
      issues.push('Manager has approvals but they are not pending (may be approved/rejected)');
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

    console.log('\n' + '='.repeat(80));

    await disconnect();
  } catch (error) {
    console.error('❌ Error during investigation:', error);
    console.error(error.stack);
    await disconnect();
  }
}

checkManagerOrdersIssue();

