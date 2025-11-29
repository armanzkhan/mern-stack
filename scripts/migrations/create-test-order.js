const mongoose = require('mongoose');
const Manager = require('./models/Manager');
const Order = require('./models/Order');
const User = require('./models/User');
const Product = require('./models/Product');

async function createTestOrder() {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/Ressichem');
    console.log('✅ Connected to MongoDB');

    // Find a manager
    const manager = await Manager.findOne({});
    if (!manager) {
      console.log('❌ No manager found');
      return;
    }
    console.log('✅ Manager found:', manager.user_id);

    // Get manager's categories
    const assignedCategories = manager.assignedCategories.map(cat => cat.category || cat);
    console.log('📋 Manager categories:', assignedCategories);

    // Find or create a product in manager's category
    let product = await Product.findOne({ 
      category: { $in: assignedCategories } 
    });
    
    if (!product) {
      // Create a test product in manager's category
      product = new Product({
        name: 'Test Epoxy Product',
        description: 'Test product for manager testing',
        price: 1000,
        category: {
          mainCategory: assignedCategories[0], // Use first assigned category
          subCategory: 'Test Sub Category'
        },
        stock: 50,
        minStock: 10,
        sku: 'TEST-EPOXY-001',
        isActive: true,
        company_id: manager.company_id
      });
      await product.save();
      console.log('✅ Created test product:', product.name);
    } else {
      console.log('✅ Found existing product:', product.name);
    }

    // Find a customer first
    const customer = await User.findOne({ company_id: manager.company_id });
    if (!customer) {
      console.log('❌ No customer found');
      return;
    }

    // Create a test order with manager's categories
    const testOrder = new Order({
      orderNumber: `TEST-${Date.now()}`,
      customer: customer._id, // Use actual customer ObjectId
      items: [{
        product: product._id,
        quantity: 2,
        unitPrice: product.price,
        total: product.price * 2
      }],
      categories: [assignedCategories[0]], // Use manager's category
      status: 'pending',
      total: product.price * 2,
      subtotal: product.price * 2,
      company_id: manager.company_id,
      createdBy: customer._id // Use actual user ObjectId
    });

    await testOrder.save();
    console.log('✅ Created test order:', testOrder.orderNumber);
    console.log('📋 Order categories:', testOrder.categories);
    console.log('📋 Order status:', testOrder.status);

    // Test if manager can update this order
    const hasManagerCategories = testOrder.items.some(item => {
      const productCategory = item.product?.category?.mainCategory || item.product?.category;
      return assignedCategories.includes(productCategory);
    });
    
    console.log('🔍 Manager can update this order:', hasManagerCategories);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  }
}

createTestOrder();
