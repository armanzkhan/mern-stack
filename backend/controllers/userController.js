const User = require("../models/User");
const Customer = require("../models/Customer");
const CategoryAssignment = require("../models/CategoryAssignment");
const notificationService = require("../services/notificationService");
const notificationTriggerService = require("../services/notificationTriggerService");

// Get all users
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Error fetching users" });
  }
};

// Get user by ID
exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ message: "Error fetching user" });
  }
};

// Create user
exports.createUser = async (req, res) => {
  try {
    const userData = req.body;
    
    // Set default company_id if not provided
    if (!userData.company_id) {
      userData.company_id = "RESSICHEM";
    }

    // Generate unique user_id if not provided
    if (!userData.user_id) {
      userData.user_id = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    // Hash password if provided
    if (userData.password) {
      const bcrypt = require('bcryptjs');
      userData.password = await bcrypt.hash(userData.password, 10);
    }

    // If this is a customer, assign customer role and permissions
    if (userData.isCustomer || userData.userType === 'customer') {
      try {
        // Find Customer role
        const CustomerRole = require('../models/Role');
        const customerRole = await CustomerRole.findOne({ 
          name: 'Customer', 
          company_id: userData.company_id 
        });
        
        if (customerRole) {
          userData.roles = [customerRole._id];
          // Get customer permissions
          const Permission = require('../models/Permission');
          const customerPermissions = await Permission.find({
            key: { $in: ['products.read', 'orders.create', 'orders.read', 'profile.update', 'notifications.read', 'customer.dashboard'] },
            company_id: userData.company_id
          });
          userData.permissions = customerPermissions.map(p => p._id);
        }
      } catch (roleError) {
        console.error("Error assigning customer role:", roleError);
      }
    }

    // Validate: Customers cannot be assigned as managers
    if ((userData.isCustomer || userData.userType === 'customer') && 
        (userData.isManager || userData.userType === 'manager')) {
      return res.status(400).json({ 
        message: "A user cannot be both a customer and a manager. Please choose one role." 
      });
    }

    // If this is a manager, initialize managerProfile and set isManager flag
    if (userData.isManager || userData.userType === 'manager') {
      // Additional validation: Ensure user is not already a customer
      if (userData.isCustomer || userData.userType === 'customer' || userData.customerProfile?.customer_id) {
        return res.status(400).json({ 
          message: "Customers cannot be assigned as managers. Please remove customer role first." 
        });
      }
      
      // Ensure isManager flag is set
      userData.isManager = true;
      
      if (!userData.managerProfile) {
        userData.managerProfile = {
          assignedCategories: [],
          managerLevel: 'junior',
          canAssignCategories: false,
          notificationPreferences: {
            orderUpdates: true,
            stockAlerts: true,
            statusChanges: true,
            newOrders: true,
            lowStock: true,
            categoryReports: true
          }
        };
      }
    }

    const user = new User(userData);
    await user.save();
    console.log(`✅ User saved to database: ${user.email}, isManager: ${user.isManager}, userType: ${userData.userType}`);
    
    // If this is a manager user, create manager record and category assignments
    if (userData.isManager || userData.userType === 'manager') {
      try {
        const Manager = require('../models/Manager');
        const CategoryAssignment = require('../models/CategoryAssignment');
        const managerSyncService = require('../services/managerSyncService');
        
        // Check if manager already exists
        const existingManager = await Manager.findOne({ 
          user_id: user.user_id, 
          company_id: user.company_id 
        });
        
        if (existingManager) {
          console.log(`⚠️ Manager already exists for user ${user.email}, updating...`);
          
          // Update existing manager record
          if (userData.assignedCategories && userData.assignedCategories.length > 0) {
            existingManager.assignedCategories = userData.assignedCategories.map(category => ({
              category: typeof category === 'string' ? category : (category.category || category),
              assignedBy: req.user?._id || existingManager.assignedCategories[0]?.assignedBy || null,
              assignedAt: new Date(),
              isActive: true
            }));
          }
          existingManager.isActive = true;
          await existingManager.save();
          console.log(`✅ Existing Manager record updated for user ${user.email}`);
          
          // Update user's managerProfile with manager_id
          if (!user.managerProfile) {
            user.managerProfile = {};
          }
          user.managerProfile.manager_id = existingManager._id;
          user.isManager = true; // Ensure flag is set
          await user.save();
          console.log(`✅ User record updated with manager_id: ${user.email}`);
          
          // Sync to ensure consistency
          await managerSyncService.ensureSync(existingManager._id, user.company_id);
        } else {
          // Get assignedCategories from userData or managerProfile
          const assignedCategories = userData.assignedCategories || 
                                   userData.managerProfile?.assignedCategories || 
                                   [];
          
          // Create Manager record
          const manager = new Manager({
            user_id: user.user_id,
            company_id: user.company_id,
            assignedCategories: assignedCategories.map(category => ({
              category: typeof category === 'string' ? category : (category.category || category),
              assignedBy: req.user?._id || null,
              assignedAt: new Date(),
              isActive: true
            })),
            managerLevel: userData.managerLevel || userData.managerProfile?.managerLevel || 'junior',
            notificationPreferences: userData.notificationPreferences || userData.managerProfile?.notificationPreferences || {
              orderUpdates: true,
              stockAlerts: true,
              statusChanges: true,
              newOrders: true,
              lowStock: true,
              categoryReports: true
            },
            isActive: true,
            createdBy: req.user?._id || null
          });
          
          await manager.save();
          console.log(`✅ Manager record saved to database for user ${user.email} (Manager ID: ${manager._id})`);
          
          // Update user's managerProfile with manager_id and ensure isManager is true
          if (!user.managerProfile) {
            user.managerProfile = {};
          }
          user.managerProfile.manager_id = manager._id;
          user.isManager = true; // Ensure flag is set
          if (assignedCategories.length > 0) {
            user.managerProfile.assignedCategories = assignedCategories.map(cat => 
              typeof cat === 'string' ? cat : (cat.category || cat)
            );
          }
          await user.save();
          console.log(`✅ User record updated and saved with manager_id: ${user.email}, isManager: ${user.isManager}`);
          
          // Sync to ensure consistency (this will also sync categories)
          await managerSyncService.ensureSync(manager._id, user.company_id);
          console.log(`✅ Manager sync completed for user ${user.email}`);
          
          // Create CategoryAssignment records
          for (const category of assignedCategories) {
            try {
              const categoryName = typeof category === 'string' ? category : (category.category || category);
              const assignment = new CategoryAssignment({
                manager_id: manager._id,
                user_id: user.user_id,
                company_id: user.company_id,
                category: categoryName,
                assignedBy: req.user?._id || null,
                isActive: true,
                isPrimary: true,
                permissions: {
                  canUpdateStatus: true,
                  canAddComments: true,
                  canViewReports: true,
                  canManageProducts: true
                }
              });
              await assignment.save();
              console.log(`✅ Category assignment saved to database: ${categoryName} for manager ${manager._id}`);
            } catch (assignmentError) {
              console.error(`❌ Error creating category assignment for ${category}:`, assignmentError);
              // Continue with other categories
            }
          }
        }
      } catch (managerError) {
        console.error("❌ Error creating manager record:", managerError);
        console.error("❌ Error stack:", managerError.stack);
        console.error("❌ User email:", user.email);
        console.error("❌ User ID:", user.user_id);
        console.error("❌ Company ID:", user.company_id);
        // Don't fail user creation if manager creation fails, but log it
        // This allows the user to be created, and the Manager record can be created later via fix script
      }
    }
    
    // If this is a customer user, create customer record and assignments
    if (userData.isCustomer || userData.userType === 'customer') {
      try {
        // Create customer record
        const customerData = {
          companyName: userData.companyName || '',
          contactName: userData.contactName || `${userData.firstName} ${userData.lastName}`,
          email: userData.email,
          phone: userData.customerPhone || userData.phone || '',
          street: userData.address?.street || '',
          city: userData.address?.city || '',
          state: userData.address?.state || '',
          zip: userData.address?.zip || '',
          country: userData.address?.country || 'Pakistan',
          status: 'active',
          customerType: userData.customerType || 'regular',
          company_id: userData.company_id,
          user_id: user._id, // Link to the user record
          preferences: {
            notificationPreferences: {
              orderUpdates: true,
              statusChanges: true,
              newProducts: true
            }
          }
        };

        const customer = new Customer(customerData);
        await customer.save();

        // Assign managers to customer if provided
        if (userData.assignedManagers && Array.isArray(userData.assignedManagers) && userData.assignedManagers.length > 0) {
          try {
            const Manager = require('../models/Manager');
            const assignedManagers = [];
            
            for (const managerId of userData.assignedManagers) {
              // Find manager by _id or user_id
              const manager = await Manager.findOne({
                $or: [
                  { _id: managerId },
                  { user_id: managerId }
                ],
                company_id: userData.company_id,
                isActive: true
              });
              
              if (manager) {
                assignedManagers.push({
                  manager_id: manager._id,
                  assignedBy: req.user?._id || req.user?.user_id || null,
                  assignedAt: new Date(),
                  isActive: true
                });
                console.log(`✅ Assigned manager ${manager._id} to customer ${customer._id}`);
              } else {
                console.warn(`⚠️ Manager not found: ${managerId}`);
              }
            }
            
            if (assignedManagers.length > 0) {
              customer.assignedManagers = assignedManagers;
              // Also set the first manager as assignedManager for backward compatibility
              if (assignedManagers[0]) {
                customer.assignedManager = {
                  manager_id: assignedManagers[0].manager_id,
                  assignedBy: assignedManagers[0].assignedBy,
                  assignedAt: assignedManagers[0].assignedAt,
                  isActive: true
                };
              }
              await customer.save();
              console.log(`✅ Assigned ${assignedManagers.length} manager(s) to customer ${customer._id}`);
            }
          } catch (managerError) {
            console.error("Error assigning managers to customer:", managerError);
            // Don't fail customer creation if manager assignment fails
          }
        }

        // Send welcome notification to customer
        try {
          const welcomeNotification = await notificationService.createNotification({
            title: "Welcome to Our Platform!",
            message: `Welcome ${customer.contactName}! Your customer account has been created successfully. You can now browse products and place orders.`,
            type: "welcome",
            priority: "high",
            targetType: "customer",
            targetIds: [customer._id],
            company_id: userData.company_id,
            sender_id: "system",
            sender_name: "System",
            data: {
              customerId: customer._id,
              customerName: customer.contactName,
              url: "/customer-dashboard"
            }
          });
          
          // Send the notification
          await notificationService.sendNotification(welcomeNotification._id);
          console.log('✅ Welcome notification sent to customer');
        } catch (notificationError) {
          console.error("Failed to send welcome notification:", notificationError);
        }

        // Send notification to company about new customer
        try {
          const companyNotification = await notificationService.createNotification({
            title: "New Customer Added",
            message: `A new customer "${customer.companyName}" has been added to the system`,
            type: "success",
            priority: "medium",
            targetType: "company",
            targetIds: [userData.company_id],
            company_id: userData.company_id,
            sender_id: "system",
            sender_name: "System",
            data: {
              entityType: 'customer',
              entityId: customer._id,
              action: 'created',
              url: "/customers"
            }
          });
          
          // Send the notification
          await notificationService.sendNotification(companyNotification._id);
          console.log('✅ Company notification sent about new customer');
        } catch (notificationError) {
          console.error("Failed to send company notification:", notificationError);
        }

        console.log(`✅ Customer record created for user ${user.email}`);
      } catch (customerError) {
        console.error("Error creating customer record:", customerError);
        // Don't fail the user creation if customer record creation fails
      }
    }
    
    // Send notification about new user creation (for ALL users, including customers)
    try {
      // Construct createdBy object with proper name handling
      let createdBy;
      if (req.user) {
        // Construct name from firstName and lastName, or use email
        const name = req.user.firstName || req.user.lastName 
          ? `${req.user.firstName || ''} ${req.user.lastName || ''}`.trim()
          : req.user.email || 'Unknown User';
        
        createdBy = {
          _id: req.user._id || req.user.user_id || 'system',
          name: name,
          email: req.user.email || 'system@ressichem.com'
        };
      } else {
        createdBy = { _id: 'system', name: 'System', email: 'system@ressichem.com' };
      }
      
      await notificationTriggerService.triggerUserCreated(user, createdBy);
      console.log('✅ User creation notification sent');
    } catch (notificationError) {
      console.error("Failed to send user creation notification:", notificationError);
      // Don't fail the user creation if notification fails
    }
    
    // Verify manager data was saved correctly (for managers only)
    if (user.isManager || userData.isManager || userData.userType === 'manager') {
      try {
        const Manager = require('../models/Manager');
        const savedManager = await Manager.findOne({ 
          user_id: user.user_id, 
          company_id: user.company_id 
        });
        
        if (savedManager) {
          console.log(`✅ VERIFICATION: Manager record found in database for ${user.email}`);
          console.log(`   - Manager ID: ${savedManager._id}`);
          console.log(`   - User ID: ${savedManager.user_id}`);
          console.log(`   - Is Active: ${savedManager.isActive}`);
          console.log(`   - Categories: ${savedManager.assignedCategories?.length || 0}`);
        } else {
          console.warn(`⚠️ VERIFICATION: Manager record NOT found in database for ${user.email}`);
        }
        
        // Verify user record
        const savedUser = await User.findById(user._id);
        if (savedUser) {
          console.log(`✅ VERIFICATION: User record found in database for ${user.email}`);
          console.log(`   - Is Manager: ${savedUser.isManager}`);
          console.log(`   - Has Manager Profile: ${!!savedUser.managerProfile}`);
          console.log(`   - Manager ID in profile: ${savedUser.managerProfile?.manager_id || 'None'}`);
        }
      } catch (verifyError) {
        console.error("❌ Error verifying manager data:", verifyError);
      }
    }
    
    // Return user without password
    const userResponse = user.toObject();
    delete userResponse.password;
    
    res.status(201).json(userResponse);
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ message: "Error creating user" });
  }
};

// Update user
exports.updateUser = async (req, res) => {
  try {
    // Get existing user to check current status
    const existingUser = await User.findById(req.params.id);
    if (!existingUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Validate: Customers cannot be assigned as managers
    const isBecomingManager = req.body.isManager === true || req.body.userType === 'manager';
    const isCurrentlyCustomer = existingUser.isCustomer || existingUser.customerProfile?.customer_id;
    
    if (isCurrentlyCustomer && isBecomingManager) {
      return res.status(400).json({ 
        message: "Cannot assign manager role: This user is a customer. Customers cannot be managers." 
      });
    }

    // Validate: Managers cannot be assigned as customers
    const isBecomingCustomer = req.body.isCustomer === true || req.body.userType === 'customer';
    const isCurrentlyManager = existingUser.isManager || existingUser.managerProfile?.manager_id;
    
    if (isCurrentlyManager && isBecomingCustomer) {
      return res.status(400).json({ 
        message: "Cannot assign customer role: This user is a manager. Managers cannot be customers." 
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    res.json(user);
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ message: "Error updating user" });
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "Error deleting user" });
  }
};
