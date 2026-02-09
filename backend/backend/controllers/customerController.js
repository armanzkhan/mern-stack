const Customer = require("../models/Customer");
const Manager = require("../models/Manager");
const Product = require("../models/Product");
const Order = require("../models/Order");
const User = require("../models/User");
const notificationService = require("../services/notificationService");
const realtimeService = require("../services/realtimeService");

// ===== CRUD Operations for Customer Management =====

// Get all customers (admin/manager view)
exports.getAllCustomers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status, company_id } = req.query;
    const companyId = (company_id || req.user?.company_id || "RESSICHEM").trim();
    // Case-insensitive company_id so RESSICHEM/Ressichem/ressichem all match (fixes dashboard count off-by-one)
    const companyIdEscaped = String(companyId).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const query = { company_id: new RegExp(`^${companyIdEscaped}$`, "i") };
    
    if (search) {
      query.$or = [
        { companyName: { $regex: search, $options: 'i' } },
        { contactName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (status && status !== 'all') {
      query.status = status;
    }
    
    const customers = await Customer.find(query)
      .populate('assignedManager.manager_id', 'user_id assignedCategories managerLevel')
      .populate('assignedManager.assignedBy', 'firstName lastName email')
      .populate('assignedManagers.manager_id', 'user_id assignedCategories managerLevel')
      .populate('assignedManagers.assignedBy', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Customer.countDocuments(query);
    
    res.json({
      customers,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (err) {
    console.error("Get all customers error:", err);
    res.status(500).json({ message: "Error fetching customers", error: err.message });
  }
};

// Get single customer
exports.getCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const companyId = req.user?.company_id || "RESSICHEM";
    
    const customer = await Customer.findOne({ _id: id, company_id: companyId })
      .populate('assignedManager.manager_id', 'user_id assignedCategories managerLevel')
      .populate('assignedManager.assignedBy', 'firstName lastName email')
      .populate('assignedManagers.manager_id', 'user_id assignedCategories managerLevel')
      .populate('assignedManagers.assignedBy', 'firstName lastName email');
    
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }
    
    res.json(customer);
  } catch (err) {
    console.error("Get customer error:", err);
    res.status(500).json({ message: "Error fetching customer", error: err.message });
  }
};

// Create new customer
exports.createCustomer = async (req, res) => {
  try {
    const companyId = req.user?.company_id || "RESSICHEM";
    console.log('📝 Creating customer with data:', {
      companyName: req.body.companyName,
      email: req.body.email,
      company_id: companyId,
      hasRequiredFields: {
        companyName: !!req.body.companyName,
        contactName: !!req.body.contactName,
        email: !!req.body.email,
        phone: !!req.body.phone,
        street: !!req.body.street,
        city: !!req.body.city
      }
    });
    
    const customerData = {
      ...req.body,
      company_id: companyId,
      createdBy: req.user._id
    };
    
    const customer = new Customer(customerData);
    await customer.save();
    console.log('✅ Customer saved successfully:', {
      _id: customer._id,
      companyName: customer.companyName,
      email: customer.email,
      company_id: customer.company_id
    });
    
    // Create corresponding User record for customer (only if createLogin is true)
    if (customerData.createLogin && customerData.password) {
      try {
        // Check if user with this email already exists in this company
        const existingUser = await User.findOne({ 
          email: customer.email,
          company_id: companyId 
        });
        if (existingUser) {
          console.log('⚠️ User with email already exists:', customer.email);
          // Link existing user to customer
          customer.user_id = existingUser._id;
          await customer.save();
          console.log('✅ Linked customer to existing user:', existingUser._id);
        } else {
          // Create new user account
          const user = new User({
            user_id: `customer_${customer._id}`,
            email: customer.email,
            password: customerData.password,
            firstName: customer.contactName?.split(' ')[0] || 'Customer',
            lastName: customer.contactName?.split(' ').slice(1).join(' ') || 'User',
            phone: customer.phone,
            role: 'Customer',
            department: 'Customer',
            company_id: companyId,
            isCustomer: true,
            isActive: true,
            customerProfile: {
              customer_id: customer._id,
              companyName: customer.companyName,
              customerType: customer.customerType || 'regular',
              assignedManager: customer.assignedManager,
              preferences: customer.preferences
            }
          });
          
          await user.save();
          console.log('✅ Created user account for customer:', user.email);
          
          // Update customer record with user_id
          customer.user_id = user._id;
          await customer.save();
          console.log('✅ Linked customer to user:', user._id);
          
          // Send user creation notification
          try {
            const notificationTriggerService = require('../services/notificationTriggerService');
            
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
            console.log('✅ User creation notification sent for customer');
          } catch (notificationError) {
            console.error("Failed to send user creation notification:", notificationError);
            // Don't fail the customer creation if notification fails
          }
        }
      } catch (userError) {
        console.error('⚠️ Failed to create user for customer:', userError.message);
        // Don't fail the customer creation if user creation fails
      }
    } else {
      console.log('ℹ️ No login account created for customer (createLogin not enabled)');
    }
    
    // Send notification
    try {
      const notification = await notificationService.createNotification({
        title: 'New Customer Added',
        message: `Customer ${customer.companyName} has been added`,
        type: 'success',
        priority: 'medium',
        targetType: 'company',
        targetIds: [companyId],
        company_id: companyId,
        sender_id: req.user._id || 'system',
        sender_name: req.user.name || 'System',
        data: {
          entityType: 'customer',
          entityId: customer._id,
          action: 'created',
          url: '/customers'
        }
      });
      
      await notificationService.sendNotification(notification._id);
      console.log('✅ Customer creation notification sent');
    } catch (notificationError) {
      console.error("Failed to send customer creation notification:", notificationError);
      // Don't fail the customer creation if notification fails
    }
    
    res.status(201).json(customer);
  } catch (err) {
    console.error("❌ Create customer error:", err);
    console.error("Error details:", {
      message: err.message,
      name: err.name,
      errors: err.errors,
      stack: err.stack
    });
    
    // Handle validation errors
    if (err.name === 'ValidationError') {
      const validationErrors = Object.keys(err.errors || {}).map(key => ({
        field: key,
        message: err.errors[key].message
      }));
      return res.status(400).json({ 
        message: "Validation error", 
        errors: validationErrors,
        error: err.message 
      });
    }
    
    res.status(500).json({ message: "Error creating customer", error: err.message });
  }
};

// Update customer
exports.updateCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const companyId = req.user?.company_id || "RESSICHEM";
    
    const customer = await Customer.findOneAndUpdate(
      { _id: id, company_id: companyId },
      { ...req.body, updatedBy: req.user._id },
      { new: true, runValidators: true }
    );
    
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }
    
    // Update corresponding User record
    try {
      const user = await User.findOne({ 
        'customerProfile.customer_id': customer._id,
        company_id: companyId 
      });
      
      if (user) {
        user.email = customer.email;
        user.firstName = customer.contactName?.split(' ')[0] || 'Customer';
        user.lastName = customer.contactName?.split(' ').slice(1).join(' ') || 'User';
        user.phone = customer.phone;
        user.customerProfile.companyName = customer.companyName;
        user.customerProfile.customerType = customer.customerType || 'regular';
        user.customerProfile.assignedManager = customer.assignedManager;
        user.customerProfile.preferences = customer.preferences;
        
        await user.save();
        console.log('✅ Updated user record for customer:', user.email);
      }
    } catch (userError) {
      console.error('⚠️ Failed to update user for customer:', userError.message);
      // Don't fail the customer update if user update fails
    }
    
    // Send notification
    await notificationService.sendNotification({
      type: 'customer_updated',
      title: 'Customer Updated',
      message: `Customer ${customer.companyName} has been updated`,
      company_id: companyId
    });
    
    res.json(customer);
  } catch (err) {
    console.error("Update customer error:", err);
    res.status(500).json({ message: "Error updating customer", error: err.message });
  }
};

// Delete customer
exports.deleteCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const companyId = req.user?.company_id || "RESSICHEM";
    
    const customer = await Customer.findOneAndDelete({ _id: id, company_id: companyId });
    
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }
    
    // Delete corresponding User record
    // Try multiple methods to find the user (in case references are broken)
    try {
      let user = null;
      
      // Method 1: Find by customerProfile.customer_id (primary method)
      user = await User.findOne({ 
        'customerProfile.customer_id': customer._id,
        company_id: companyId 
      });
      
      // Method 2: If not found, try by email (fallback for broken references)
      if (!user && customer.email) {
        user = await User.findOne({ 
          email: customer.email,
          company_id: companyId,
          isCustomer: true
        });
        console.log('⚠️ Found user by email (customer_id reference may be broken):', customer.email);
      }
      
      if (user) {
        await User.findByIdAndDelete(user._id);
        console.log('✅ Deleted user record for customer:', user.email);
      } else {
        console.log('⚠️ No user record found for customer:', customer.email);
      }
    } catch (userError) {
      console.error('⚠️ Failed to delete user for customer:', userError.message);
      // Don't fail the customer deletion if user deletion fails
    }
    
    // Send notification
    await notificationService.sendNotification({
      type: 'customer_deleted',
      title: 'Customer Deleted',
      message: `Customer ${customer.companyName} has been deleted`,
      company_id: companyId
    });
    
    res.json({ message: "Customer deleted successfully" });
  } catch (err) {
    console.error("Delete customer error:", err);
    res.status(500).json({ message: "Error deleting customer", error: err.message });
  }
};

// Get customer profile
exports.getCustomerProfile = async (req, res) => {
  try {
    // Resolve current user and map to customer via email (Customer schema has no user_id)
    const currentUser = await User.findById(req.user._id).select('email');
    if (!currentUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const customer = await Customer.findOne({ email: currentUser.email, company_id: companyId })
      .populate('assignedManager.manager_id', 'user_id assignedCategories managerLevel')
      .populate('assignedManager.assignedBy', 'firstName lastName email')
      .populate('assignedManagers.manager_id', 'user_id assignedCategories managerLevel')
      .populate('assignedManagers.assignedBy', 'firstName lastName email');

    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    res.json({
      customer: {
        _id: customer._id,
        companyName: customer.companyName,
        contactName: customer.contactName,
        email: customer.email,
        phone: customer.phone,
        assignedManager: customer.assignedManager,
        preferences: customer.preferences,
        status: customer.status
      }
    });
  } catch (err) {
    console.error("Get customer profile error:", err);
    res.status(500).json({ message: "Error fetching customer profile", error: err.message });
  }
};

// Get products for customer (shows ALL products - orders routed dynamically by category)
exports.getCustomerProducts = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, category } = req.query;
    const companyId = req.user?.company_id || req.headers['x-company-id'] || "RESSICHEM";

    // Resolve current user and map to customer via email
    const currentUser = await User.findById(req.user._id).select('email');
    if (!currentUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Get customer record (optional - for customer info display)
    const customer = await Customer.findOne({ email: currentUser.email });

    // Build filter - customers can only see active products that are in stock
    // Customers should only see products they can actually order
    let filter = { 
      company_id: companyId, 
      isActive: true,
      stock: { $gt: 0 } // Only show products with stock greater than 0 - customers can't order out of stock items
    };

    // Build $and conditions array for search and category filters
    const andConditions = [];

    // Add search filter
    if (search) {
      andConditions.push({
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { sku: { $regex: search, $options: 'i' } }
        ]
      });
    }

    // Add category filter
    if (category) {
      andConditions.push({
        $or: [
          { "category.mainCategory": category },
          { "category": category }
        ]
      });
    }

    // If we have any $and conditions, add them to the filter
    if (andConditions.length > 0) {
      filter.$and = andConditions;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const products = await Product.find(filter)
      .populate('createdBy', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Product.countDocuments(filter);

    res.json({
      products,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalProducts: total,
        hasNext: skip + products.length < total,
        hasPrev: parseInt(page) > 1
      },
      message: "Showing all available products - orders will be routed to appropriate category managers",
      customerInfo: customer ? {
        customerName: customer.contactName,
        companyName: customer.companyName
      } : null
    });
  } catch (err) {
    console.error("Get customer products error:", err);
    res.status(500).json({ message: "Error fetching customer products", error: err.message });
  }
};

// Get customer orders
exports.getCustomerOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const companyId = req.user?.company_id || req.headers['x-company-id'] || "RESSICHEM";

    console.log('🔍 Get customer orders - Company ID:', companyId);
    console.log('🔍 Get customer orders - User ID:', req.user._id);

    // Resolve current user and map to customer via email
    const currentUser = await User.findById(req.user._id).select('email');
    if (!currentUser) {
      console.error('❌ User not found:', req.user._id);
      return res.status(404).json({ message: "User not found" });
    }

    console.log('🔍 Looking for customer with email:', currentUser.email);

    // Find customer - include company_id filter if available
    let customer = await Customer.findOne({ 
      email: currentUser.email,
      company_id: companyId 
    });
    
    if (!customer) {
      // Try without company_id filter as fallback
      const customerFallback = await Customer.findOne({ email: currentUser.email });
      if (!customerFallback) {
        console.error('❌ Customer not found for email:', currentUser.email);
        return res.status(404).json({ message: "Customer not found" });
      }
      console.log('⚠️ Customer found without company_id filter:', customerFallback._id);
      customer = customerFallback;
    }

    console.log('✅ Customer found:', {
      id: customer._id,
      email: customer.email,
      companyName: customer.companyName,
      company_id: customer.company_id
    });

    // Build query - try multiple company_id matching strategies
    // Try both ObjectId and string format for customer ID
    const mongoose = require('mongoose');
    let query = {};
    
    // Try to match customer as ObjectId first, fallback to string
    if (mongoose.Types.ObjectId.isValid(customer._id)) {
      query.customer = { $in: [customer._id, customer._id.toString()] };
    } else {
      query.customer = customer._id;
    }

    if (status) {
      query.status = status;
    }

    // Calculate skip for pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Try exact match first
    query.company_id = companyId;
    console.log('🔍 Orders query (exact match):', JSON.stringify(query));
    console.log('🔍 Query customer ID (ObjectId):', customer._id.toString());
    console.log('🔍 Query customer ID (string):', String(customer._id));
    console.log('🔍 Query company_id:', companyId);
    console.log('🔍 Pagination:', { page: parseInt(page), limit: parseInt(limit), skip: skip });

    let orders = await Order.find(query)
      .populate('customer', 'companyName contactName email phone')
      .populate('items.product', 'name category price')
      .populate('createdBy', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    let total = await Order.countDocuments(query);
    
    console.log('🔍 First query result:', {
      ordersFound: orders.length,
      totalFound: total,
      query: JSON.stringify(query)
    });
    
    // If found total but no orders, try with just customer ID (no company_id filter)
    if (total > 0 && orders.length === 0) {
      console.log('⚠️ Found total orders but 0 returned, trying without company_id filter...');
      const queryWithoutCompany = { 
        customer: mongoose.Types.ObjectId.isValid(customer._id) 
          ? { $in: [customer._id, customer._id.toString()] }
          : customer._id
      };
      if (status) {
        queryWithoutCompany.status = status;
      }
      
      console.log('🔍 Query without company_id:', JSON.stringify(queryWithoutCompany));
      
      orders = await Order.find(queryWithoutCompany)
        .populate('customer', 'companyName contactName email phone')
        .populate('items.product', 'name category price')
        .populate('createdBy', 'firstName lastName email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));
      
      total = await Order.countDocuments(queryWithoutCompany);
      
      console.log('🔍 Query without company_id result:', {
        ordersFound: orders.length,
        totalFound: total
      });
      
      query = queryWithoutCompany;
    }

    // If no orders found with exact match, try case-insensitive
    if (orders.length === 0 && total === 0) {
      console.log('⚠️ No orders with exact company_id match, trying case-insensitive...');
      const companyIdRegex = new RegExp(`^${companyId}$`, 'i');
      query.company_id = companyIdRegex;
      console.log('🔍 Orders query (case-insensitive):', JSON.stringify(query));
      
      orders = await Order.find(query)
        .populate('customer', 'companyName contactName email phone')
        .populate('items.product', 'name category price')
        .populate('createdBy', 'firstName lastName email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

      total = await Order.countDocuments(query);
    }

    // If still no orders, try without company_id filter
    if (orders.length === 0 && total === 0) {
      console.log('⚠️ No orders with company_id filter, trying without company_id...');
      delete query.company_id;
      console.log('🔍 Orders query (no company_id):', JSON.stringify(query));
      
      orders = await Order.find(query)
        .populate('customer', 'companyName contactName email phone')
        .populate('items.product', 'name category price')
        .populate('createdBy', 'firstName lastName email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

      total = await Order.countDocuments(query);
    }

    console.log('✅ Found orders:', {
      count: orders.length,
      total: total,
      page: parseInt(page),
      limit: parseInt(limit),
      skip: skip,
      query: query
    });

    res.json({
      orders,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalOrders: total,
        hasNext: skip + orders.length < total,
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (err) {
    console.error("❌ Get customer orders error:", err);
    res.status(500).json({ message: "Error fetching customer orders", error: err.message });
  }
};

// Assign customer to manager
exports.assignCustomerToManager = async (req, res) => {
  try {
    const { customerId, managerId, notes } = req.body;
    const companyId = req.user?.company_id || req.headers['x-company-id'] || "RESSICHEM";

    // Get customer and manager
    const customer = await Customer.findById(customerId);
    const manager = await Manager.findById(managerId);

    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    if (!manager) {
      return res.status(404).json({ message: "Manager not found" });
    }

    // Update customer assignment
    customer.assignedManager = {
      manager_id: managerId,
      assignedBy: req.user.id,
      assignedAt: new Date(),
      isActive: true,
      notes: notes || ""
    };

    await customer.save();

    // Send notification to manager
    try {
      await notificationService.createNotification({
        title: "New Customer Assignment",
        message: `Customer ${customer.companyName} has been assigned to you`,
        type: "customer_assignment",
        priority: "medium",
        targetType: "user",
        targetIds: [manager.user_id],
        company_id: companyId,
        sender_id: req.user.id,
        sender_name: req.user.email,
        data: {
          customerId: customer._id,
          customerName: customer.companyName,
          managerId: manager._id
        },
        channels: [
          { type: "in_app", enabled: true },
          { type: "web_push", enabled: true }
        ]
      });
    } catch (notificationError) {
      console.error("Notification error:", notificationError);
    }

    res.json({
      message: "Customer assigned to manager successfully",
      customer: {
        _id: customer._id,
        companyName: customer.companyName,
        assignedManager: customer.assignedManager
      }
    });
  } catch (err) {
    console.error("Assign customer to manager error:", err);
    res.status(500).json({ message: "Error assigning customer to manager", error: err.message });
  }
};

// Update customer preferences
exports.updateCustomerPreferences = async (req, res) => {
  try {
    const customerId = req.params.id || req.user.customer_id;
    const { preferredCategories, notificationPreferences } = req.body;

    const customer = await Customer.findById(customerId);
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    // Update preferences
    if (preferredCategories) {
      customer.preferences.preferredCategories = preferredCategories;
    }

    if (notificationPreferences) {
      customer.preferences.notificationPreferences = {
        ...customer.preferences.notificationPreferences,
        ...notificationPreferences
      };
    }

    await customer.save();

    res.json({
      message: "Customer preferences updated successfully",
      preferences: customer.preferences
    });
  } catch (err) {
    console.error("Update customer preferences error:", err);
    res.status(500).json({ message: "Error updating customer preferences", error: err.message });
  }
};

// Get customer dashboard data
exports.getCustomerDashboard = async (req, res) => {
  try {
    const companyId = req.user?.company_id || req.headers['x-company-id'] || "RESSICHEM";

    // Resolve current user and map to customer via email
    const currentUser = await User.findById(req.user._id).select('email');
    if (!currentUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Find customer - include company_id filter if available
    let customer = await Customer.findOne({ 
      email: currentUser.email,
      company_id: companyId 
    })
      .populate('assignedManager.manager_id', 'user_id assignedCategories managerLevel')
      .populate('assignedManagers.manager_id', 'user_id assignedCategories managerLevel');
    
    if (!customer) {
      // Try without company_id filter as fallback
      const customerFallback = await Customer.findOne({ email: currentUser.email })
        .populate('assignedManager.manager_id', 'user_id assignedCategories managerLevel')
        .populate('assignedManagers.manager_id', 'user_id assignedCategories managerLevel');
      if (!customerFallback) {
        return res.status(404).json({ message: "Customer not found" });
      }
      console.log('⚠️ Customer found without company_id filter in dashboard:', customerFallback._id);
      customer = customerFallback;
    }

    console.log('✅ Customer found in dashboard:', {
      id: customer._id,
      email: customer.email,
      companyName: customer.companyName,
      company_id: customer.company_id
    });

    // Get recent orders
    const recentOrders = await Order.find({ 
      customer: customer._id, 
      company_id: companyId 
    })
      .populate('items.product', 'name category price')
      .sort({ createdAt: -1 })
      .limit(5);

    // Get available products count
    let productFilter = { company_id: companyId, isActive: true };
    
    if (customer.assignedManager?.manager_id?.assignedCategories) {
      const assignedCategories = customer.assignedManager.manager_id.assignedCategories.map(cat => cat.category);
      productFilter.$or = [
        { "category.mainCategory": { $in: assignedCategories } },
        { "category": { $in: assignedCategories } }
      ];
    }

    const availableProductsCount = await Product.countDocuments(productFilter);

    // Get order statistics
    const orderStats = await Order.aggregate([
      { $match: { customer: customer._id, company_id: companyId } },
      { $group: {
        _id: "$status",
        count: { $sum: 1 }
      }}
    ]);

    const stats = {
      totalOrders: orderStats.reduce((sum, stat) => sum + stat.count, 0),
      pendingOrders: orderStats.find(s => s._id === 'pending')?.count || 0,
      approvedOrders: orderStats.find(s => s._id === 'approved')?.count || 0,
      availableProducts: availableProductsCount
    };

    // Extract categories from all assigned managers
    const allAssignedCategories = new Set();
    if (customer.assignedManager?.manager_id?.assignedCategories) {
      customer.assignedManager.manager_id.assignedCategories.forEach((cat) => {
        allAssignedCategories.add(cat.category || cat);
      });
    }
    if (customer.assignedManagers && customer.assignedManagers.length > 0) {
      customer.assignedManagers.forEach((am) => {
        if (am.manager_id?.assignedCategories) {
          am.manager_id.assignedCategories.forEach((cat) => {
            allAssignedCategories.add(cat.category || cat);
          });
        }
      });
    }

    res.json({
      customer: {
        _id: customer._id,
        companyName: customer.companyName,
        contactName: customer.contactName,
        assignedManager: customer.assignedManager,
        assignedManagers: customer.assignedManagers || [], // Include all assigned managers
        preferences: customer.preferences
      },
      recentOrders,
      stats,
      assignedCategories: Array.from(allAssignedCategories) // All categories from all managers
    });
  } catch (err) {
    console.error("Get customer dashboard error:", err);
    res.status(500).json({ message: "Error fetching customer dashboard", error: err.message });
  }
};