const mongoose = require('mongoose');
const Customer = require('../models/Customer');
require('dotenv').config();

const sampleCustomers = [
  {
    companyName: "Al-Rashid Construction Co.",
    contactName: "Ahmed Al-Rashid",
    email: "ahmed@alrashidconstruction.com",
    phone: "+966-50-123-4567",
    street: "King Fahd Road, Building 45",
    city: "Riyadh",
    state: "Riyadh",
    zip: "11564",
    country: "Saudi Arabia",
    status: "active",
    customerType: "premium",
    company_id: "RESSICHEM",
    totalOrders: 25,
    totalSpent: 125000
  },
  {
    companyName: "Bin Laden Group",
    contactName: "Mohammed Bin Laden",
    email: "mohammed@binladengroup.com",
    phone: "+966-11-456-7890",
    street: "Olaya District, Tower 12",
    city: "Riyadh",
    state: "Riyadh",
    zip: "12211",
    country: "Saudi Arabia",
    status: "active",
    customerType: "vip",
    company_id: "RESSICHEM",
    totalOrders: 45,
    totalSpent: 250000
  },
  {
    companyName: "Saudi Oger Ltd",
    contactName: "Faisal Al-Oger",
    email: "faisal@saudioger.com",
    phone: "+966-13-789-0123",
    street: "Industrial Area, Block 3",
    city: "Dammam",
    state: "Eastern Province",
    zip: "31421",
    country: "Saudi Arabia",
    status: "active",
    customerType: "premium",
    company_id: "RESSICHEM",
    totalOrders: 3,
    totalSpent: 8000
  },
  {
    companyName: "Nesma Construction Co.",
    contactName: "Khalid Al-Nesma",
    email: "khalid@nesmaconstruction.com",
    phone: "+966-11-234-5678",
    street: "Prince Mohammed Bin Abdulaziz Road",
    city: "Jeddah",
    state: "Makkah",
    zip: "21432",
    country: "Saudi Arabia",
    status: "active",
    customerType: "vip",
    company_id: "RESSICHEM",
    totalOrders: 35,
    totalSpent: 180000
  },
  {
    companyName: "Al-Habtoor Group",
    contactName: "Rashid Al-Habtoor",
    email: "rashid@alhabtoor.com",
    phone: "+971-4-345-6789",
    street: "Sheikh Zayed Road, Tower 1",
    city: "Dubai",
    state: "Dubai",
    zip: "00000",
    country: "UAE",
    status: "active",
    customerType: "premium",
    company_id: "RESSICHEM",
    totalOrders: 18,
    totalSpent: 95000
  },
  {
    companyName: "Saudi Aramco",
    contactName: "Abdulaziz Al-Saudi",
    email: "abdulaziz@aramco.com",
    phone: "+966-13-456-7890",
    street: "Dhahran Industrial Area",
    city: "Dhahran",
    state: "Eastern Province",
    zip: "31311",
    country: "Saudi Arabia",
    status: "active",
    customerType: "vip",
    company_id: "RESSICHEM",
    totalOrders: 60,
    totalSpent: 35000
  }
];

async function seedCustomers() {
  try {
    console.log('🌱 Starting customer seeding...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.CONNECTION_STRING || 'mongodb://localhost:27017/Ressichem', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ Connected to MongoDB');
    
    // Clear existing customers
    await Customer.deleteMany({ company_id: "RESSICHEM" });
    console.log('🗑️ Cleared existing customers');
    
    // Insert sample customers
    const customers = await Customer.insertMany(sampleCustomers);
    console.log(`✅ Created ${customers.length} customers`);
    
    // Display created customers
    customers.forEach(customer => {
      console.log(`   - ${customer.companyName} (${customer.contactName}) - ${customer.status}`);
    });
    
    console.log('🎉 Customer seeding completed successfully!');
    
  } catch (error) {
    console.error('❌ Error seeding customers:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the seeding function
seedCustomers();
