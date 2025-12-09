const User = require('../models/User');
const Manager = require('../models/Manager');

/**
 * Service to keep Manager record and User.managerProfile in sync
 */
class ManagerSyncService {
  
  /**
   * Sync categories and preferences from Manager record to User.managerProfile
   * This ensures data consistency and prevents notification issues
   */
  async syncManagerToUser(managerId, companyId = null) {
    try {
      const manager = await Manager.findById(managerId);
      if (!manager) {
        console.warn(`⚠️ Manager not found: ${managerId}`);
        return { success: false, message: 'Manager not found' };
      }

      const user = await User.findOne({ 
        user_id: manager.user_id,
        company_id: companyId || manager.company_id 
      });

      if (!user) {
        console.warn(`⚠️ User not found for manager: ${manager.user_id}`);
        return { success: false, message: 'User not found' };
      }

      // Ensure managerProfile exists
      if (!user.managerProfile) {
        user.managerProfile = {};
      }

      // Sync categories
      const managerCategories = manager.assignedCategories?.map(c => 
        typeof c === 'string' ? c : (c.category || c)
      ) || [];

      user.managerProfile.assignedCategories = managerCategories;
      user.managerProfile.manager_id = manager._id;

      // Sync notification preferences
      if (manager.notificationPreferences) {
        if (!user.managerProfile.notificationPreferences) {
          user.managerProfile.notificationPreferences = {};
        }
        Object.assign(user.managerProfile.notificationPreferences, manager.notificationPreferences);
      }

      // Sync manager level
      if (manager.managerLevel) {
        user.managerProfile.managerLevel = manager.managerLevel;
      }

      await user.save();

      console.log(`✅ Synced manager ${manager._id} to user ${user.email}`);
      return { 
        success: true, 
        message: 'Manager synced successfully',
        categories: managerCategories
      };
    } catch (error) {
      console.error('❌ Error syncing manager to user:', error);
      return { success: false, message: error.message, error };
    }
  }

  /**
   * Sync categories and preferences from User.managerProfile to Manager record
   * This is useful when updating via User model
   */
  async syncUserToManager(userId, companyId) {
    try {
      const user = await User.findOne({ 
        _id: userId,
        company_id: companyId 
      });

      if (!user || !user.isManager || !user.managerProfile) {
        return { success: false, message: 'User is not a manager or has no manager profile' };
      }

      const manager = await Manager.findOne({ 
        user_id: user.user_id,
        company_id: companyId 
      });

      if (!manager) {
        console.warn(`⚠️ Manager record not found for user: ${user.email}`);
        return { success: false, message: 'Manager record not found' };
      }

      // Sync categories
      const userCategories = user.managerProfile.assignedCategories?.map(c =>
        typeof c === 'string' ? c : (c.category || c)
      ) || [];

      manager.assignedCategories = userCategories.map(category => ({
        category,
        assignedBy: manager.assignedCategories?.[0]?.assignedBy || null,
        assignedAt: manager.assignedCategories?.[0]?.assignedAt || new Date(),
        isActive: true
      }));

      // Sync notification preferences
      if (user.managerProfile.notificationPreferences) {
        manager.notificationPreferences = {
          ...manager.notificationPreferences,
          ...user.managerProfile.notificationPreferences
        };
      }

      // Sync manager level
      if (user.managerProfile.managerLevel) {
        manager.managerLevel = user.managerProfile.managerLevel;
      }

      await manager.save();

      console.log(`✅ Synced user ${user.email} to manager ${manager._id}`);
      return { 
        success: true, 
        message: 'User synced to manager successfully',
        categories: userCategories
      };
    } catch (error) {
      console.error('❌ Error syncing user to manager:', error);
      return { success: false, message: error.message, error };
    }
  }

  /**
   * Ensure both Manager and User are in sync
   * This is the recommended method to call after any manager/user update
   */
  async ensureSync(managerId, companyId = null) {
    try {
      const result = await this.syncManagerToUser(managerId, companyId);
      return result;
    } catch (error) {
      console.error('❌ Error ensuring sync:', error);
      return { success: false, message: error.message, error };
    }
  }
}

module.exports = new ManagerSyncService();

