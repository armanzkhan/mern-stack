// Test manager order filtering by categories
const mongoose = require('mongoose');
const User = require('./models/User');
const Order = require('./models/Order');
const Product = require('./models/Product');
const authService = require('./services/authService');

async function testManagerOrderFiltering() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/Ressichem');
    console.log('Connected to MongoDB - Database: Ressichem');

    console.log('\n🧪 TESTING MANAGER ORDER FILTERING:');
    
    // Test with sales@ressichem.com (Tiling and Grouting Materials)
    const salesManager = await User.findOne({ email: 'sales@ressichem.com' })
      .populate({
        path: 'roles',
        populate: {
          path: 'permissions'
        }
      });

    if (!salesManager) {
      console.log('❌ Sales manager not found');
      return;
    }

    console.log(`\n👤 Testing with: ${salesManager.firstName} ${salesManager.lastName} (${salesManager.email})`);
    console.log(`   Assigned Categories: ${salesManager.managerProfile?.assignedCategories?.join(', ') || 'None'}`);

    // Generate token for the manager
    const token = authService.generateToken(salesManager);
    console.log(`✅ Generated token for sales manager`);

    // Test the orders API with manager token
    try {
      const response = await fetch('http://localhost:5000/api/orders', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log(`📡 Orders API Response Status: ${response.status}`);
      
      if (response.ok) {
        const orders = await response.json();
        console.log(`✅ Orders API working! Found ${orders.length} orders for sales manager`);
        
        // Check if orders contain only tiling products
        if (orders.length > 0) {
          console.log('\n📋 Order Analysis:');
          orders.forEach((order, index) => {
            console.log(`   Order ${index + 1}: ${order.orderNumber}`);
            console.log(`     Customer: ${order.customer?.companyName || 'Unknown'}`);
            console.log(`     Categories: ${order.categories?.join(', ') || 'None'}`);
            console.log(`     Items: ${order.items?.length || 0}`);
            
            if (order.items && order.items.length > 0) {
              order.items.forEach((item, i) => {
                console.log(`       Item ${i + 1}: ${item.product?.name || 'Unknown'}`);
                console.log(`         Category: ${JSON.stringify(item.product?.category) || 'None'}`);
              });
            }
          });
        }
      } else {
        const errorData = await response.json();
        console.log(`❌ Orders API failed: ${errorData.message}`);
      }
    } catch (apiError) {
      console.log(`❌ Orders API call failed: ${apiError.message}`);
    }

    // Test with shah@ressichem.com (Epoxy Adhesives and Coatings)
    console.log('\n' + '='.repeat(50));
    const shahManager = await User.findOne({ email: 'shah@ressichem.com' })
      .populate({
        path: 'roles',
        populate: {
          path: 'permissions'
        }
      });

    if (shahManager) {
      console.log(`\n👤 Testing with: ${shahManager.firstName} ${shahManager.lastName} (${shahManager.email})`);
      console.log(`   Assigned Categories: ${shahManager.managerProfile?.assignedCategories?.join(', ') || 'None'}`);

      const shahToken = authService.generateToken(shahManager);
      console.log(`✅ Generated token for shah manager`);

      try {
        const response = await fetch('http://localhost:5000/api/orders', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${shahToken}`,
            'Content-Type': 'application/json',
          },
        });

        console.log(`📡 Orders API Response Status: ${response.status}`);
        
        if (response.ok) {
          const orders = await response.json();
          console.log(`✅ Orders API working! Found ${orders.length} orders for shah manager`);
        } else {
          const errorData = await response.json();
          console.log(`❌ Orders API failed: ${errorData.message}`);
        }
      } catch (apiError) {
        console.log(`❌ Orders API call failed: ${apiError.message}`);
      }
    }

    await mongoose.connection.close();
    console.log('\n✅ Manager order filtering test completed!');

  } catch (error) {
    console.error('❌ Manager order filtering test failed:', error);
    process.exit(1);
  }
}

testManagerOrderFiltering();
