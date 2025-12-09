const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const User = require('./models/User');
const Role = require('./models/Role');
const Permission = require('./models/Permission');

async function checkCompanyAdminPermissions() {
  try {
    console.log('🔍 CHECKING COMPANY ADMIN PERMISSIONS');
    console.log('====================================\n');

    // Connect to MongoDB
    await mongoose.connect(process.env.CONNECTION_STRING || 'mongodb://localhost:27017/Ressichem', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      dbName: 'Ressichem'
    });
    console.log('✅ Connected to MongoDB');

    // Find the company admin user
    const companyAdmin = await User.findOne({ email: 'companyadmin@samplecompany.com' });
    
    if (!companyAdmin) {
      console.log('❌ Company admin user not found');
      return;
    }

    console.log(`\n👤 Found company admin: ${companyAdmin.firstName} ${companyAdmin.lastName}`);
    console.log(`   Email: ${companyAdmin.email}`);
    console.log(`   User Type: ${companyAdmin.userType}`);
    console.log(`   Is Company Admin: ${companyAdmin.isCompanyAdmin}`);
    console.log(`   Roles: ${companyAdmin.roles.length} assigned`);

    // Check if invoice permissions exist
    const invoicePermissions = await Permission.find({
      key: { $regex: /invoice/i },
      company_id: 'RESSICHEM'
    });

    console.log(`\n📄 Invoice permissions found: ${invoicePermissions.length}`);
    invoicePermissions.forEach(perm => {
      console.log(`   - ${perm.key}: ${perm.description}`);
    });

    // Create invoice permissions if they don't exist
    const requiredInvoicePermissions = [
      {
        key: 'invoices.read',
        description: 'View invoices',
        company_id: 'RESSICHEM'
      },
      {
        key: 'invoices.create',
        description: 'Create invoices',
        company_id: 'RESSICHEM'
      },
      {
        key: 'invoices.update',
        description: 'Update invoices',
        company_id: 'RESSICHEM'
      },
      {
        key: 'invoices.delete',
        description: 'Delete invoices',
        company_id: 'RESSICHEM'
      },
      {
        key: 'invoices.manage',
        description: 'Full invoice management',
        company_id: 'RESSICHEM'
      }
    ];

    for (const permData of requiredInvoicePermissions) {
      let permission = await Permission.findOne({ key: permData.key, company_id: permData.company_id });
      if (!permission) {
        permission = new Permission(permData);
        await permission.save();
        console.log(`✅ Created permission: ${permData.key}`);
      } else {
        console.log(`✅ Permission exists: ${permData.key}`);
      }
    }

    // Find or create Company Admin role
    let companyAdminRole = await Role.findOne({ name: 'Company Admin', company_id: 'RESSICHEM' });
    if (!companyAdminRole) {
      companyAdminRole = new Role({
        name: 'Company Admin',
        description: 'Full access to company management including invoices',
        company_id: 'RESSICHEM',
        permissions: []
      });
      await companyAdminRole.save();
      console.log('✅ Created Company Admin role');
    } else {
      console.log('✅ Company Admin role exists');
    }

    // Get all permissions for the role
    const allPermissions = await Permission.find({ company_id: 'RESSICHEM' });
    companyAdminRole.permissions = allPermissions.map(p => p._id);
    await companyAdminRole.save();
    console.log(`✅ Updated Company Admin role with ${allPermissions.length} permissions`);

    // Ensure company admin has the role
    if (!companyAdmin.roles.includes(companyAdminRole._id)) {
      companyAdmin.roles.push(companyAdminRole._id);
      await companyAdmin.save();
      console.log('✅ Assigned Company Admin role to user');
    } else {
      console.log('✅ User already has Company Admin role');
    }

    // Ensure user is marked as company admin
    if (!companyAdmin.isCompanyAdmin) {
      companyAdmin.isCompanyAdmin = true;
      await companyAdmin.save();
      console.log('✅ Set isCompanyAdmin to true');
    } else {
      console.log('✅ User is already marked as company admin');
    }

    console.log('\n🎉 COMPANY ADMIN PERMISSIONS SETUP COMPLETE');
    console.log('===========================================');
    console.log('✅ Invoice permissions created/verified');
    console.log('✅ Company Admin role updated');
    console.log('✅ User permissions assigned');
    console.log('✅ User marked as company admin');

  } catch (error) {
    console.error('❌ Error setting up company admin permissions:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
}

// Run the setup
checkCompanyAdminPermissions();
