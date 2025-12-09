// scripts/seedSuperAdmin.js
const { connect, disconnect } = require('../config/_db');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const Role = require('../models/Role');
const Company = require('../models/Company');

async function seedSuperAdmin() {
  await connect();

  try {
    const companyId = 'RESSICHEM';
    const superEmail = process.env.SUPER_ADMIN_EMAIL || 'admin@example.com';
    const superPassword = process.env.SUPER_ADMIN_PASSWORD || 'admin123';

    // ensure company exists
    let company = await Company.findOne({ company_id: companyId });
    if (!company) {
      company = await Company.create({ company_id: companyId, name: 'Ressichem', departments: ['IT'] });
      console.log('Created company for super admin:', company.name);
    }

    // find super role
    const superRole = await Role.findOne({ name: 'Super Admin', company_id: companyId });
    if (!superRole) {
      console.warn('Super Admin role not found. Run seedInitialData first.');
    }

    // create or ensure super admin
    let superAdmin = await User.findOne({ email: superEmail });
    if (!superAdmin) {
      const hashed = await bcrypt.hash(superPassword, 10);
      superAdmin = await User.create({
        user_id: 'super_admin_001',
        company_id: companyId,
        email: superEmail,
        password: hashed,
        department: 'IT',
        isSuperAdmin: true,
        roles: superRole ? [superRole._id] : []
      });
      console.log('Created super admin:', superEmail);
    } else {
      let changed = false;
      if (superAdmin.company_id !== companyId) {
        superAdmin.company_id = companyId;
        changed = true;
      }
      if (superRole && (!superAdmin.roles || !superAdmin.roles.some(r => String(r) === String(superRole._id)))) {
        superAdmin.roles = [...(superAdmin.roles || []), superRole._id];
        changed = true;
      }
      if (changed) {
        await superAdmin.save();
        console.log('Updated super admin and attached role');
      } else {
        console.log('Super admin already configured');
      }
    }

    // demo user
    const demoEmail = 'demo@example.com';
    const demoPassword = 'demo123';
    let demoUser = await User.findOne({ email: demoEmail });
    if (!demoUser) {
      const hashed = await bcrypt.hash(demoPassword, 10);
      demoUser = await User.create({
        user_id: 'demo_user_001',
        company_id: companyId,
        email: demoEmail,
        password: hashed,
        department: 'Sales',
        isSuperAdmin: false
      });
      console.log('Created demo user:', demoEmail);
    } else {
      console.log('Demo user exists');
    }

    console.log('\nSuper Admin credentials:');
    console.log('Email:', superEmail);
    console.log('Password:', superPassword);

  } catch (err) {
    console.error('seedSuperAdmin error:', err);
    throw err;
  } finally {
    await disconnect();
  }
}

module.exports = seedSuperAdmin;

if (require.main === module) {
  seedSuperAdmin().catch(err => {
    console.error(err);
    process.exit(1);
  });
}
