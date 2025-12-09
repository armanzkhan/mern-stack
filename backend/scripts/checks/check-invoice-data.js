const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const Order = require('./models/Order');
const OrderItemApproval = require('./models/OrderItemApproval');
const Invoice = require('./models/Invoice');
const Customer = require('./models/Customer');
const Product = require('./models/Product');
const User = require('./models/User');

async function checkInvoiceData() {
  try {
    console.log('🔍 CHECKING INVOICE DATA');
    console.log('========================\n');

    // Connect to MongoDB
    await mongoose.connect(process.env.CONNECTION_STRING || 'mongodb://localhost:27017/Ressichem', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      dbName: 'Ressichem'
    });
    console.log('✅ Connected to MongoDB');

    // Check orders
    const orders = await Order.find().populate('customer', 'companyName email').limit(5);
    console.log(`\n📋 Found ${orders.length} orders:`);
    orders.forEach((order, index) => {
      console.log(`   ${index + 1}. ${order.orderNumber} - ${order.customer?.companyName} - Status: ${order.status}`);
    });

    // Check order item approvals
    const approvals = await OrderItemApproval.find().populate('product', 'name').limit(10);
    console.log(`\n📦 Found ${approvals.length} order item approvals:`);
    approvals.forEach((approval, index) => {
      console.log(`   ${index + 1}. Order: ${approval.orderId} - Product: ${approval.product?.name} - Status: ${approval.status}`);
    });

    // Check invoices
    const invoices = await Invoice.find().populate('customer', 'companyName').limit(5);
    console.log(`\n📄 Found ${invoices.length} invoices:`);
    invoices.forEach((invoice, index) => {
      console.log(`   ${index + 1}. ${invoice.invoiceNumber} - ${invoice.customer?.companyName} - Status: ${invoice.status}`);
    });

    // Check for approved items specifically
    const approvedItems = await OrderItemApproval.find({ status: 'approved' });
    console.log(`\n✅ Found ${approvedItems.length} approved items`);

    if (approvedItems.length > 0) {
      console.log('\n📦 Approved items details:');
      for (const item of approvedItems) {
        const order = await Order.findById(item.orderId).populate('customer', 'companyName');
        console.log(`   - Order: ${order?.orderNumber} (${order?.customer?.companyName})`);
        console.log(`     Product: ${item.product}`);
        console.log(`     Original Amount: PKR ${item.originalAmount}`);
        console.log(`     Discount: PKR ${item.discountAmount || 0}`);
        console.log(`     Final Amount: PKR ${item.originalAmount - (item.discountAmount || 0)}`);
        console.log(`     Approved At: ${item.approvedAt}`);
        console.log('');
      }
    }

  } catch (error) {
    console.error('❌ Error checking invoice data:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
}

// Run the check
checkInvoiceData();
