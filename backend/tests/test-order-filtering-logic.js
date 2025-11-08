// Test order filtering logic without authentication
const mongoose = require('mongoose');
const User = require('./models/User');
const Order = require('./models/Order');
const Product = require('./models/Product');
const Customer = require('./models/Customer');

async function testOrderFilteringLogic() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/Ressichem');
    console.log('Connected to MongoDB - Database: Ressichem');

    console.log('\n🧪 TESTING ORDER FILTERING LOGIC:');
    
    // Get all orders
    const allOrders = await Order.find({ company_id: 'RESSICHEM' })
      .populate("customer", "companyName contactName email")
      .populate("items.product", "name price category")
      .sort({ createdAt: -1 });

    console.log(`📊 Total orders in system: ${allOrders.length}`);

    // Test sales manager filtering (Tiling and Grouting Materials)
    const salesManager = await User.findOne({ email: 'sales@ressichem.com' });
    if (salesManager && salesManager.managerProfile?.assignedCategories) {
      const salesCategories = salesManager.managerProfile.assignedCategories;
      console.log(`\n👤 Sales Manager Categories: ${salesCategories.join(', ')}`);
      
      // Filter orders for sales manager
      const salesOrders = allOrders.filter(order => {
        // Check if order categories match
        if (order.categories && order.categories.some(cat => salesCategories.includes(cat))) {
          return true;
        }
        
        // Check if any product in the order matches sales categories
        if (order.items && order.items.some(item => {
          if (item.product && item.product.category) {
            const productCategory = item.product.category;
            return salesCategories.some(managerCat => 
              productCategory.mainCategory === managerCat ||
              productCategory.subCategory === managerCat ||
              productCategory.subSubCategory === managerCat
            );
          }
          return false;
        })) {
          return true;
        }
        
        return false;
      });
      
      console.log(`📋 Orders for Sales Manager: ${salesOrders.length}`);
      salesOrders.forEach((order, index) => {
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
    }

    // Test shah manager filtering (Epoxy Adhesives and Coatings)
    const shahManager = await User.findOne({ email: 'shah@ressichem.com' });
    if (shahManager && shahManager.managerProfile?.assignedCategories) {
      const shahCategories = shahManager.managerProfile.assignedCategories;
      console.log(`\n👤 Shah Manager Categories: ${shahCategories.join(', ')}`);
      
      // Filter orders for shah manager
      const shahOrders = allOrders.filter(order => {
        // Check if order categories match
        if (order.categories && order.categories.some(cat => shahCategories.includes(cat))) {
          return true;
        }
        
        // Check if any product in the order matches shah categories
        if (order.items && order.items.some(item => {
          if (item.product && item.product.category) {
            const productCategory = item.product.category;
            return shahCategories.some(managerCat => 
              productCategory.mainCategory === managerCat ||
              productCategory.subCategory === managerCat ||
              productCategory.subSubCategory === managerCat
            );
          }
          return false;
        })) {
          return true;
        }
        
        return false;
      });
      
      console.log(`📋 Orders for Shah Manager: ${shahOrders.length}`);
      shahOrders.forEach((order, index) => {
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
    }

    // Show all orders for comparison
    console.log('\n📊 ALL ORDERS (for comparison):');
    allOrders.forEach((order, index) => {
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
    console.log('\n✅ Order filtering logic test completed!');

  } catch (error) {
    console.error('❌ Order filtering logic test failed:', error);
    process.exit(1);
  }
}

testOrderFilteringLogic();
