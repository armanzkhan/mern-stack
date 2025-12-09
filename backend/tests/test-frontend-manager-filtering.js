// Test frontend manager filtering logic
const mongoose = require('mongoose');
const User = require('./models/User');
const Order = require('./models/Order');
const Customer = require('./models/Customer');
const Product = require('./models/Product');

async function testFrontendManagerFiltering() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/Ressichem');
    console.log('Connected to MongoDB - Database: Ressichem');

    console.log('\n🧪 TESTING FRONTEND MANAGER FILTERING:');
    
    // Test with sales@ressichem.com (Tiling and Grouting Materials)
    const salesManager = await User.findOne({ email: 'sales@ressichem.com' });
    if (!salesManager) {
      console.log('❌ Sales manager not found');
      return;
    }

    console.log(`\n👤 Testing with: ${salesManager.firstName} ${salesManager.lastName} (${salesManager.email})`);
    console.log(`   Is Manager: ${salesManager.isManager}`);
    console.log(`   Assigned Categories: ${salesManager.managerProfile?.assignedCategories?.join(', ') || 'None'}`);

    // Get all orders
    const allOrders = await Order.find({ company_id: 'RESSICHEM' })
      .populate("customer", "companyName contactName email")
      .populate("items.product", "name price category")
      .sort({ createdAt: -1 });

    console.log(`\n📊 Total orders in system: ${allOrders.length}`);

    // Simulate frontend filtering logic
    const managerCategories = salesManager.managerProfile?.assignedCategories || [];
    console.log(`🔍 Manager categories: ${managerCategories.join(', ')}`);

    const filteredOrders = allOrders.filter(order => {
      // Check if order has categories matching manager's assigned categories
      const orderHasMatchingCategories = order.categories && order.categories.some(cat => 
        managerCategories.includes(cat)
      );
      
      // Check if any product in the order matches manager's categories
      const orderHasMatchingProducts = order.items && order.items.some(item => {
        if (item.product?.category) {
          const productCategory = item.product.category;
          return managerCategories.some(managerCat => 
            productCategory.mainCategory === managerCat ||
            productCategory.subCategory === managerCat ||
            productCategory.subSubCategory === managerCat
          );
        }
        return false;
      });
      
      return orderHasMatchingCategories || orderHasMatchingProducts;
    });

    console.log(`\n📋 Orders visible to Sales Manager: ${filteredOrders.length}`);
    
    filteredOrders.forEach((order, index) => {
      console.log(`\n   ${index + 1}. ${order.orderNumber} - ${order.customer?.companyName || 'Unknown'}`);
      console.log(`      Status: ${order.status}`);
      console.log(`      Categories: ${order.categories?.join(', ') || 'None'}`);
      console.log(`      Items: ${order.items?.length || 0}`);
      
      if (order.items && order.items.length > 0) {
        order.items.forEach((item, i) => {
          if (item.product) {
            console.log(`         Item ${i + 1}: ${item.product.name}`);
            console.log(`           Category: ${JSON.stringify(item.product.category)}`);
            
            // Check if this item matches manager categories
            if (item.product.category) {
              const productCategory = item.product.category;
              const matchesManager = managerCategories.some(managerCat => 
                productCategory.mainCategory === managerCat ||
                productCategory.subCategory === managerCat ||
                productCategory.subSubCategory === managerCat
              );
              console.log(`           Matches Manager Categories: ${matchesManager ? '✅' : '❌'}`);
            }
          }
        });
      }
    });

    // Show orders that should NOT be visible
    const hiddenOrders = allOrders.filter(order => !filteredOrders.includes(order));
    console.log(`\n🚫 Orders NOT visible to Sales Manager: ${hiddenOrders.length}`);
    
    hiddenOrders.forEach((order, index) => {
      console.log(`   ${index + 1}. ${order.orderNumber} - ${order.customer?.companyName || 'Unknown'}`);
      console.log(`      Categories: ${order.categories?.join(', ') || 'None'}`);
      if (order.items && order.items.length > 0) {
        order.items.forEach((item, i) => {
          if (item.product) {
            console.log(`         Item ${i + 1}: ${item.product.name}`);
            console.log(`           Category: ${JSON.stringify(item.product.category)}`);
          }
        });
      }
    });

    await mongoose.connection.close();
    console.log('\n✅ Frontend manager filtering test completed!');

  } catch (error) {
    console.error('❌ Frontend manager filtering test failed:', error);
    process.exit(1);
  }
}

testFrontendManagerFiltering();
