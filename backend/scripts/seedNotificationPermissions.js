// scripts/seedNotificationPermissions.js
const { connect, disconnect } = require('../config/_db');
const Permission = require('../models/Permission');
const PermissionGroup = require('../models/PermissionGroup');
const Role = require('../models/Role');
const Company = require('../models/Company');

async function seedNotificationPermissions() {
  await connect();

  try {
    const companies = await Company.find({});
    if (!companies.length) {
      console.log('No companies found. Run seedInitialData first.');
      return;
    }

    for (const company of companies) {
      const companyId = company.company_id;
      console.log('Seeding notifications for company:', company.name);

      const keys = [
        'notification.create',
        'notification.view',
        'notification.update',
        'notification.delete',
        'notification.send',
        'notification.manage'
      ];

      const created = [];
      for (const key of keys) {
        let p = await Permission.findOne({ key, company_id: companyId });
        if (!p) {
          p = await Permission.create({ key, description: key.replace('.', ' '), company_id: companyId });
          console.log('Created permission:', key);
        } else {
          console.log('Permission exists:', key);
        }
        created.push(p);
      }

      let group = await PermissionGroup.findOne({ name: 'Notification Management', company_id: companyId });
      if (!group) {
        group = await PermissionGroup.create({
          name: 'Notification Management',
          company_id: companyId,
          permissions: created.map(p => p._id)
        });
        console.log('Created Notification Management group for', companyId);
      } else {
        const missing = created.map(p => p._id).filter(id => !group.permissions.includes(id));
        if (missing.length) {
          group.permissions.push(...missing);
          await group.save();
          console.log('Updated Notification Management group for', companyId);
        } else {
          console.log('Notification Management group exists for', companyId);
        }
      }

      // Update roles
      const roles = await Role.find({ company_id: companyId });
      for (const role of roles) {
        let changed = false;
        // Super/Admin roles get all notification perms
        if (role.name.toLowerCase().includes('admin') || role.name.toLowerCase().includes('super')) {
          for (const perm of created) {
            if (!role.permissions) role.permissions = [];
            if (!role.permissions.includes(perm._id)) {
              role.permissions.push(perm._id);
              changed = true;
            }
          }
        } else if (role.name.toLowerCase().includes('manager')) {
          // managers get most except delete
          for (const perm of created) {
            if (perm.key === 'notification.delete') continue;
            if (!role.permissions) role.permissions = [];
            if (!role.permissions.includes(perm._id)) {
              role.permissions.push(perm._id);
              changed = true;
            }
          }
        } else {
          // regular users get view
          const viewPerm = created.find(p => p.key === 'notification.view');
          if (viewPerm) {
            if (!role.permissions) role.permissions = [];
            if (!role.permissions.includes(viewPerm._id)) {
              role.permissions.push(viewPerm._id);
              changed = true;
            }
          }
        }

        if (!role.permissionGroups) role.permissionGroups = [];
        if (!role.permissionGroups.includes(group._id)) {
          role.permissionGroups.push(group._id);
          changed = true;
        }
        if (changed) {
          await role.save();
          console.log('Updated role with notification perms:', role.name);
        }
      }
    }

    console.log('seedNotificationPermissions finished.');
  } catch (err) {
    console.error('seedNotificationPermissions error:', err);
    throw err;
  } finally {
    await disconnect();
  }
}

module.exports = seedNotificationPermissions;

if (require.main === module) {
  seedNotificationPermissions().catch(err => {
    console.error(err);
    process.exit(1);
  });
}
