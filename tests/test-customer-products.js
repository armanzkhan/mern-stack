const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const User = require('./models/User');
const Customer = require('./models/Customer');

async function testCustomerProducts() {
  try {
    await mongoose.connect('mongodb://localhost:27017/Ressichem');
    console.log('✅ Connected to MongoDB');

    // Find the customer user we just created
    const user = await User.findOne({ email: 'aman@jazz.com' });
    if (!user) {
      console.log('❌ Customer user not found');
      return;
    }

    console.log('👤 Found customer user:', {
      email: user.email,
      role: user.role,
      company_id: user.company_id
    });

    // Create a JWT token
    const token = jwt.sign(
      { 
        _id: user._id, 
        email: user.email, 
        company_id: user.company_id,
        role: user.role 
      },
      process.env.JWT_SECRET || 'supersecretkey',
      { expiresIn: '24h' }
    );

    console.log('🔑 Generated token:', token.substring(0, 50) + '...');

    // Test the customer products endpoint
    const response = await fetch('http://localhost:5000/api/customers/products', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    console.log('📊 API Response Status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Success:', {
        productsCount: data.products?.length || 0,
        assignedManager: data.assignedManager,
        assignedCategories: data.assignedCategories
      });
    } else {
      const errorData = await response.json();
      console.log('❌ Error:', errorData);
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
  }
}

testCustomerProducts();
