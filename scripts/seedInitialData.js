// scripts/seedInitialData.js
const { connect, disconnect } = require('../config/_db');
const Company = require('../models/Company');
const Permission = require('../models/Permission');
const PermissionGroup = require('../models/PermissionGroup');
const Role = require('../models/Role');

async function seedInitialData() {
  await connect();

  try {
    const companyId = 'RESSICHEM';
    const companyName = 'Ressichem';

    // create company if not exists
    let company = await Company.findOne({ company_id: companyId });
    if (!company) {
      company = await Company.create({ company_id: companyId, name: companyName, departments: ['HR', 'Finance', 'IT'] });
      console.log('Created company:', companyName);
    } else {
      console.log('Company exists:', companyName);
    }

    // base permissions
    const baseEntities = ['company','role','group','permission','user','order','customer','product','notification'];
    const actions = ['add','update','view','delete','send','manage'];
    const permissionDocs = [];

    for (const ent of baseEntities) {
      for (const act of actions) {
        const key = `${ent}_${act}`;
        let p = await Permission.findOne({ key, company_id: companyId });
        if (!p) {
          p = await Permission.create({ key, description: `${act} ${ent}`, company_id: companyId });
          console.log('Created permission:', key);
        }
        permissionDocs.push(p);
      }
    }

    // Super Admin permission group
    let superGroup = await PermissionGroup.findOne({ name: 'Super Admin', company_id: companyId });
    if (!superGroup) {
      superGroup = await PermissionGroup.create({
        name: 'Super Admin',
        company_id: companyId,
        permissions: permissionDocs.map(p => p._id)
      });
      console.log('Created Super Admin permission group');
    } else {
      // ensure contains these permissions
      const missing = permissionDocs.map(p => p._id).filter(id => !superGroup.permissions.includes(id));
      if (missing.length > 0) {
        superGroup.permissions.push(...missing);
        await superGroup.save();
        console.log('Updated Super Admin permission group with missing permissions');
      } else {
        console.log('Super Admin permission group exists');
      }
    }

    // Role: Super Admin
    let superRole = await Role.findOne({ name: 'Super Admin', company_id: companyId });
    if (!superRole) {
      superRole = await Role.create({ name: 'Super Admin', company_id: companyId, permissionGroups: [superGroup._id] });
      console.log('Created Super Admin role');
    } else {
      if (!superRole.permissionGroups.includes(superGroup._id)) {
        superRole.permissionGroups.push(superGroup._id);
        await superRole.save();
        console.log('Attached Super Admin group to Super Admin role');
      } else {
        console.log('Super Admin role exists');
      }
    }

    console.log('seedInitialData finished.');
  } catch (err) {
    console.error('seedInitialData error:', err);
    throw err;
  } finally {
    await disconnect();
  }
}

module.exports = seedInitialData;

// Allow running directly
if (require.main === module) {
  seedInitialData().catch(err => {
    console.error(err);
    process.exit(1);
  });
}
