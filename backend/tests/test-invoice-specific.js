const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const Order = require('./models/Order');
const OrderItemApproval = require('./models/OrderItemApproval');
const Invoice = require('./models/Invoice');
const Customer = require('./models/Customer');
const Product = require('./models/Product');
const User = require('./models/User');

// Import services
const invoiceService = require('./services/invoiceService');

async function testInvoiceSpecific() {
  try {
    console.log('🧪 TESTING INVOICE CREATION FOR SPECIFIC ORDER');
    console.log('==============================================\n');

    // Connect to MongoDB
    await mongoose.connect(process.env.CONNECTION_STRING || 'mongodb://localhost:27017/Ressichem', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      dbName: 'Ressichem'
    });
    console.log('✅ Connected to MongoDB');

    // Find an order with approved items
    const orderWithApprovedItems = await Order.findOne({ 
      orderNumber: 'ORD-1761542843510-u5sqkcqxs' 
    }).populate('customer', 'companyName email');

    if (!orderWithApprovedItems) {
      console.log('❌ Order not found');
      return;
    }

    console.log(`\n📋 Found order: ${orderWithApprovedItems.orderNumber}`);
    console.log(`   Customer: ${orderWithApprovedItems.customer.companyName}`);
    console.log(`   Status: ${orderWithApprovedItems.status}`);

    // Check if invoice already exists
    const existingInvoice = await Invoice.findOne({ orderId: orderWithApprovedItems._id });
    if (existingInvoice) {
      console.log(`\n📄 Invoice already exists: ${existingInvoice.invoiceNumber}`);
      return;
    }

    // Get approved items for this order
    const approvedItems = await OrderItemApproval.find({
      orderId: orderWithApprovedItems._id,
      status: 'approved'
    }).populate('product', 'name category')
      .populate('approvedBy', 'firstName lastName email');

    console.log(`\n📦 Found ${approvedItems.length} approved items for this order:`);
    approvedItems.forEach((item, index) => {
      console.log(`   ${index + 1}. ${item.product.name}`);
      console.log(`      Category: ${item.category}`);
      console.log(`      Original: PKR ${item.originalAmount}`);
      console.log(`      Discount: PKR ${item.discountAmount || 0}`);
      console.log(`      Final: PKR ${item.originalAmount - (item.discountAmount || 0)}`);
    });

    // Create invoice
    console.log('\n📄 Creating invoice...');
    const invoice = await invoiceService.createInvoiceFromApprovedItems(
      orderWithApprovedItems._id, 
      orderWithApprovedItems.company_id
    );
    
    console.log(`\n✅ Invoice created successfully!`);
    console.log(`   Invoice Number: ${invoice.invoiceNumber}`);
    console.log(`   Order Number: ${invoice.orderNumber}`);
    console.log(`   Customer: ${invoice.customerName}`);
    console.log(`   Subtotal: PKR ${invoice.subtotal}`);
    console.log(`   Total Discount: PKR ${invoice.totalDiscount}`);
    console.log(`   Tax: PKR ${invoice.taxAmount}`);
    console.log(`   Total: PKR ${invoice.total}`);
    console.log(`   Due Date: ${invoice.dueDate.toLocaleDateString()}`);

    console.log(`\n📋 Invoice Items:`);
    invoice.items.forEach((item, index) => {
      console.log(`   ${index + 1}. ${item.productName}`);
      console.log(`      Quantity: ${item.quantity}`);
      console.log(`      Unit Price: PKR ${item.unitPrice}`);
      console.log(`      Discount: PKR ${item.discountAmount}`);
      console.log(`      Final Amount: PKR ${item.finalAmount}`);
    });

    console.log('\n✅ Invoice creation test completed successfully!');

  } catch (error) {
    console.error('❌ Error testing invoice creation:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
}

// Run the test
testInvoiceSpecific();
