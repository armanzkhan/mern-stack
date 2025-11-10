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

    const user = new User(userData);
    await user.save();
    
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

        // Note: No manager assignment - orders will be routed dynamically based on product categories

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
    const user = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
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
