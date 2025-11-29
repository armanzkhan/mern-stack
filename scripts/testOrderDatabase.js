const { connect, disconnect } = require('../config/_db');
const Order = require('../models/Order');
const Customer = require('../models/Customer');
const Product = require('../models/Product');

async function testOrderDatabase() {
  await connect();
  
  try {
    console.log('🔍 Testing Order Database Operations...\n');
    
    // Step 1: Create a test customer
    console.log('📝 Step 1: Creating test customer...');
    let customer;
    try {
      customer = await Customer.findOne({ companyName: 'Test Order Customer' });
      if (!customer) {
        customer = new Customer({
          companyName: 'Test Order Customer',
          contactName: 'Test Contact',
          email: 'testorder@example.com',
          phone: '1234567890',
          street: '123 Test St',
          city: 'Test City',
          status: 'active',
          company_id: 'RESSICHEM'
        });
        await customer.save();
        console.log('✅ Test customer created');
      } else {
        console.log('✅ Test customer already exists');
      }
    } catch (error) {
      console.log('❌ Error creating customer:', error.message);
      return;
    }
    
    // Step 2: Create test products
    console.log('\n📝 Step 2: Creating test products...');
    let products = [];
    try {
      const existingProducts = await Product.find({ company_id: 'RESSICHEM' });
      if (existingProducts.length >= 2) {
        products = existingProducts.slice(0, 2);
        console.log('✅ Using existing products');
      } else {
        // Create test products
        const product1 = new Product({
          name: 'Test Electronics Product',
          description: 'Test electronics item',
          price: 1000,
          category: { mainCategory: 'Electronics' },
          stock: 100,
          company_id: 'RESSICHEM'
        });
        await product1.save();
        products.push(product1);
        
        const product2 = new Product({
          name: 'Test Chemical Product',
          description: 'Test chemical item',
          price: 500,
          category: { mainCategory: 'Chemicals' },
          stock: 50,
          company_id: 'RESSICHEM'
        });
        await product2.save();
        products.push(product2);
        
        console.log('✅ Test products created');
      }
    } catch (error) {
      console.log('❌ Error creating products:', error.message);
      return;
    }
    
    // Step 3: Create test order
    console.log('\n📝 Step 3: Creating test order...');
    try {
      const orderNumber = `TEST-${Date.now()}`;
      const order = new Order({
        orderNumber,
        customer: customer._id,
        items: [
          {
            product: products[0]._id,
            quantity: 2,
            unitPrice: products[0].price,
            total: products[0].price * 2
          },
          {
            product: products[1]._id,
            quantity: 1,
            unitPrice: products[1].price,
            total: products[1].price
          }
        ],
        subtotal: (products[0].price * 2) + products[1].price,
        tax: ((products[0].price * 2) + products[1].price) * 0.1,
        total: ((products[0].price * 2) + products[1].price) * 1.1,
        notes: 'Test order for database verification',
        company_id: 'RESSICHEM',
        categories: ['Electronics', 'Chemicals'],
        approvals: [
          { category: 'Electronics', status: 'pending' },
          { category: 'Chemicals', status: 'pending' }
        ]
      });
      
      await order.save();
      console.log('✅ Test order created successfully');
      console.log('   Order Number:', order.orderNumber);
      console.log('   Status:', order.status);
      console.log('   Categories:', order.categories);
      console.log('   Total:', order.total);
      
    } catch (error) {
      console.log('❌ Error creating order:', error.message);
      return;
    }
    
    // Step 4: Verify order in database
    console.log('\n📝 Step 4: Verifying order in database...');
    try {
      const orders = await Order.find({ company_id: 'RESSICHEM' }).sort({ createdAt: -1 });
      console.log(`✅ Found ${orders.length} orders in database`);
      
      if (orders.length > 0) {
        const latestOrder = orders[0];
        console.log('   Latest Order:');
        console.log('     Number:', latestOrder.orderNumber);
        console.log('     Status:', latestOrder.status);
        console.log('     Categories:', latestOrder.categories);
        console.log('     Total:', latestOrder.total);
        console.log('     Created:', latestOrder.createdAt);
      }
      
    } catch (error) {
      console.log('❌ Error verifying orders:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await disconnect();
  }
}

if (require.main === module) {
  testOrderDatabase();
}

module.exports = testOrderDatabase;
