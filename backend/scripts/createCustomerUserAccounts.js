const mongoose = require("mongoose");
const User = require("../models/User");
const Customer = require("../models/Customer");
const bcrypt = require("bcryptjs");

// Connect to MongoDB
async function connectDB() {
  try {
    await mongoose.connect(process.env.CONNECTION_STRING || "mongodb://localhost:27017/Ressichem", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ Connected to MongoDB");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1);
  }
}

// Create customer user accounts
async function createCustomerUserAccounts() {
  try {
    console.log("👥 Creating customer user accounts...");
    
    // Get all customers
    const customers = await Customer.find({ status: 'active' });
    console.log(`📊 Found ${customers.length} active customers`);
    
    if (customers.length === 0) {
      console.log("❌ No customers found. Please create customers first.");
      return;
    }
    
    // Create user accounts for customers
    for (const customer of customers) {
      try {
        // Check if user already exists
        const existingUser = await User.findOne({ 
          email: customer.email,
          company_id: customer.company_id 
        });
        
        if (existingUser) {
          console.log(`⚠️ User already exists for ${customer.email}`);
          continue;
        }
        
        // Create user account for customer
        const hashedPassword = await bcrypt.hash('customer123', 10); // Default password
        
        const user = new User({
          user_id: `customer_${customer._id}`,
          company_id: customer.company_id,
          email: customer.email,
          password: hashedPassword,
          firstName: customer.contactName.split(' ')[0] || 'Customer',
          lastName: customer.contactName.split(' ').slice(1).join(' ') || '',
          phone: customer.phone,
          role: 'customer',
          isActive: true,
          isManager: false,
          managerProfile: {
            manager_id: null,
            assignedCategories: [],
            managerLevel: 'junior', // Use valid enum value
            canAssignCategories: false,
            notificationPreferences: {
              orderUpdates: true,
              statusChanges: true,
              newProducts: false
            }
          }
        });
        
        await user.save();
        
        // Update customer with user reference
        customer.user_id = user.user_id;
        await customer.save();
        
        console.log(`✅ Created user account for ${customer.companyName} (${customer.email})`);
        console.log(`   User ID: ${user.user_id}`);
        console.log(`   Password: customer123`);
        
      } catch (error) {
        console.error(`❌ Error creating user for ${customer.email}:`, error.message);
      }
    }
    
    console.log("\n🎉 Customer user accounts created successfully!");
    console.log("\n📋 Login Credentials:");
    console.log("   All customers can login with:");
    console.log("   - Email: [customer email]");
    console.log("   - Password: customer123");
    console.log("\n🔗 Customer Login URL: http://localhost:3000/customer-login");
    
  } catch (error) {
    console.error("❌ Error creating customer user accounts:", error);
  }
}

// Main function
async function main() {
  await connectDB();
  await createCustomerUserAccounts();
  await mongoose.connection.close();
  console.log("✅ Database connection closed");
}

// Run the script
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { createCustomerUserAccounts };
