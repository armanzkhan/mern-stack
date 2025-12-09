const mongoose = require('mongoose');
const Company = require('../models/Company');

async function updateCompanyData() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.CONNECTION_STRING || 'mongodb://localhost:27017/Ressichem', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      dbName: "Ressichem"
    });
    console.log('✅ Connected to MongoDB');

    console.log('\n🔧 Updating company data...');
    
    // Update the existing RESSICHEM company with complete data
    const updatedCompany = await Company.findOneAndUpdate(
      { company_id: 'RESSICHEM' },
      {
        email: 'admin@ressichem.com',
        address: '123 Chemical Street, Karachi, Pakistan',
        industry: 'Chemical Manufacturing',
        userCount: 14, // Actual user count
        isActive: true,
        departments: ['HR', 'Finance', 'IT', 'Sales', 'Production', 'Administration', 'Staff']
      },
      { new: true }
    );

    if (updatedCompany) {
      console.log('✅ Company updated successfully!');
      console.log(`   Name: ${updatedCompany.name}`);
      console.log(`   Email: ${updatedCompany.email}`);
      console.log(`   Industry: ${updatedCompany.industry}`);
      console.log(`   Address: ${updatedCompany.address}`);
      console.log(`   User Count: ${updatedCompany.userCount}`);
      console.log(`   Departments: ${updatedCompany.departments.join(', ')}`);
      console.log(`   Active: ${updatedCompany.isActive}`);
    } else {
      console.log('❌ Company not found');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

updateCompanyData();
