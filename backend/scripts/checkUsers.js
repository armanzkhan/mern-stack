const mongoose = require('mongoose');
const User = require('../models/User');
const Company = require('../models/Company');

async function checkUsers() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.CONNECTION_STRING || 'mongodb://localhost:27017/Ressichem', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      dbName: "Ressichem"
    });
    console.log('✅ Connected to MongoDB');

    console.log('\n📊 COMPANY OVERVIEW:');
    console.log('='.repeat(50));
    
    // Get all companies
    const companies = await Company.find({});
    console.log(`\n🏢 Found ${companies.length} companies:`);
    
    for (const company of companies) {
      console.log(`\n📋 Company: ${company.name} (${company.company_id})`);
      console.log(`   📧 Email: ${company.email}`);
      console.log(`   🏭 Industry: ${company.industry}`);
      console.log(`   📍 Address: ${company.address}`);
      console.log(`   👥 User Count: ${company.userCount}`);
      console.log(`   🏢 Departments: ${company.departments.join(', ')}`);
      console.log(`   ✅ Active: ${company.isActive ? 'Yes' : 'No'}`);
      
      // Get users for this company
      const users = await User.find({ company_id: company.company_id });
      console.log(`   👤 Actual Users: ${users.length}`);
      
      if (users.length > 0) {
        console.log(`   📝 User Details:`);
        users.forEach((user, index) => {
          console.log(`      ${index + 1}. ${user.email}`);
          console.log(`         - User ID: ${user.user_id}`);
          console.log(`         - Department: ${user.department || 'N/A'}`);
          console.log(`         - Super Admin: ${user.isSuperAdmin ? 'Yes' : 'No'}`);
          console.log(`         - Manager: ${user.isManager ? 'Yes' : 'No'}`);
          console.log(`         - Roles: ${user.roles?.length || 0}`);
          console.log(`         - Permissions: ${user.permissions?.length || 0}`);
        });
      } else {
        console.log(`   ⚠️  No users found for this company!`);
      }
    }

    console.log('\n\n👥 ALL USERS SUMMARY:');
    console.log('='.repeat(50));
    
    const allUsers = await User.find({});
    console.log(`\n📊 Total users in database: ${allUsers.length}`);
    
    if (allUsers.length > 0) {
      console.log('\n📋 User List:');
      allUsers.forEach((user, index) => {
        console.log(`\n${index + 1}. ${user.email}`);
        console.log(`   Company: ${user.company_id}`);
        console.log(`   User ID: ${user.user_id}`);
        console.log(`   Department: ${user.department || 'N/A'}`);
        console.log(`   Super Admin: ${user.isSuperAdmin ? 'Yes' : 'No'}`);
        console.log(`   Manager: ${user.isManager ? 'Yes' : 'No'}`);
        console.log(`   Created: ${user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}`);
      });
    }

    console.log('\n\n🔐 LOGIN CREDENTIALS:');
    console.log('='.repeat(50));
    console.log('\nSuper Admin:');
    console.log('   Email: admin@example.com');
    console.log('   Password: admin123');
    console.log('\nDemo User:');
    console.log('   Email: demo@example.com');
    console.log('   Password: demo123');
    console.log('\nSales Manager:');
    console.log('   Email: sales@ressichem.com');
    console.log('   Password: password123');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

checkUsers();
