const mongoose = require('mongoose');
const Order = require('../models/Order');
const Customer = require('../models/Customer');
const Product = require('../models/Product');
require('dotenv').config();

const sampleOrders = [
  {
    orderNumber: "ORD-2024-001",
    customer: null, // Will be populated with actual customer ID
    status: "pending",
    total: 15000,
    subtotal: 13636,
    tax: 1364,
    orderDate: new Date('2024-01-15'),
    notes: "Urgent delivery required for Riyadh construction project",
    company_id: "RESSICHEM",
    items: [
      {
        product: null, // Will be populated with actual product ID
        quantity: 2,
        unitPrice: 5000,
        total: 10000
      },
      {
        product: null, // Will be populated with actual product ID
        quantity: 1,
        unitPrice: 5000,
        total: 5000
      }
    ]
  },
  {
    orderNumber: "ORD-2024-002",
    customer: null, // Will be populated with actual customer ID
    status: "approved",
    total: 25000,
    subtotal: 22727,
    tax: 2273,
    orderDate: new Date('2024-01-16'),
    notes: "Standard delivery for Jeddah industrial facility",
    company_id: "RESSICHEM",
    items: [
      {
        product: null, // Will be populated with actual product ID
        quantity: 5,
        unitPrice: 5000,
        total: 25000
      }
    ]
  },
  {
    orderNumber: "ORD-2024-003",
    customer: null, // Will be populated with actual customer ID
    status: "confirmed",
    total: 35000,
    subtotal: 31818,
    tax: 3182,
    orderDate: new Date('2024-01-17'),
    notes: "Bulk order for Dammam industrial project - discount applied",
    company_id: "RESSICHEM",
    items: [
      {
        product: null, // Will be populated with actual product ID
        quantity: 3,
        unitPrice: 8000,
        total: 24000
      },
      {
        product: null, // Will be populated with actual product ID
        quantity: 2,
        unitPrice: 5500,
        total: 11000
      }
    ]
  },
  {
    orderNumber: "ORD-2024-004",
    customer: null, // Will be populated with actual customer ID
    status: "completed",
    total: 12000,
    subtotal: 10909,
    tax: 1091,
    orderDate: new Date('2024-01-18'),
    notes: "Delivered successfully to Dubai construction site",
    company_id: "RESSICHEM",
    items: [
      {
        product: null, // Will be populated with actual product ID
        quantity: 2,
        unitPrice: 6000,
        total: 12000
      }
    ]
  },
  {
    orderNumber: "ORD-2024-005",
    customer: null, // Will be populated with actual customer ID
    status: "cancelled",
    total: 8000,
    subtotal: 7273,
    tax: 727,
    orderDate: new Date('2024-01-19'),
    notes: "Customer requested cancellation due to project delay",
    company_id: "RESSICHEM",
    items: [
      {
        product: null, // Will be populated with actual product ID
        quantity: 1,
        unitPrice: 8000,
        total: 8000
      }
    ]
  }
];

async function seedOrders() {
  try {
    console.log('🌱 Starting order seeding...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.CONNECTION_STRING || 'mongodb://localhost:27017/Ressichem', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ Connected to MongoDB');
    
    // Get customers and products
    const customers = await Customer.find({ company_id: "RESSICHEM" });
    const products = await Product.find({ company_id: "RESSICHEM" });
    
    if (customers.length === 0) {
      console.log('❌ No customers found. Please run customer seeding first.');
      return;
    }
    
    if (products.length === 0) {
      console.log('❌ No products found. Please run product seeding first.');
      return;
    }
    
    console.log(`📦 Found ${customers.length} customers and ${products.length} products`);
    
    // Clear existing orders
    await Order.deleteMany({ company_id: "RESSICHEM" });
    console.log('🗑️ Cleared existing orders');
    
    // Populate orders with actual customer and product IDs
    const populatedOrders = sampleOrders.map((order, index) => {
      const customer = customers[index % customers.length];
      const product1 = products[index % products.length];
      const product2 = products[(index + 1) % products.length];
      
      return {
        ...order,
        customer: customer._id,
        items: order.items.map((item, itemIndex) => ({
          ...item,
          product: itemIndex === 0 ? product1._id : product2._id
        }))
      };
    });
    
    // Insert sample orders
    const orders = await Order.insertMany(populatedOrders);
    console.log(`✅ Created ${orders.length} orders`);
    
    // Display created orders
    orders.forEach(order => {
      console.log(`   - ${order.orderNumber} (${order.status}) - PKR ${order.total.toLocaleString()}`);
    });
    
    console.log('🎉 Order seeding completed successfully!');
    
  } catch (error) {
    console.error('❌ Error seeding orders:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the seeding function
seedOrders();