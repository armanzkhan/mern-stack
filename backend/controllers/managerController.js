const Manager = require("../models/Manager");
const CategoryAssignment = require("../models/CategoryAssignment");
const User = require("../models/User");
const Order = require("../models/Order");
const Product = require("../models/Product");
const notificationService = require("../services/notificationService");
const { getAllCategories, getMainCategories } = require("../utils/productCategories");

// Create or update manager profile
exports.createOrUpdateManager = async (req, res) => {
  try {
    const { user_id, assignedCategories, managerLevel, notificationPreferences } = req.body;
    const companyId = req.user?.company_id || req.headers['x-company-id'] || "RESSICHEM";

    // Check if user exists
    const user = await User.findOne({ user_id, company_id: companyId });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if manager already exists
    let manager = await Manager.findOne({ user_id, company_id: companyId });
    
    if (manager) {
      // Update existing manager
      manager.assignedCategories = assignedCategories.map(category => ({
        category,
        assignedBy: req.user.id,
        assignedAt: new Date(),
        isActive: true
      }));
      manager.managerLevel = managerLevel || manager.managerLevel;
      manager.notificationPreferences = { ...manager.notificationPreferences, ...notificationPreferences };
      manager.updatedBy = req.user.id;
    } else {
      // Create new manager
      manager = new Manager({
        user_id,
        company_id: companyId,
        assignedCategories: assignedCategories.map(category => ({
          category,
          assignedBy: req.user.id,
          assignedAt: new Date(),
          isActive: true
        })),
        managerLevel: managerLevel || 'junior',
        notificationPreferences: notificationPreferences || {
          orderUpdates: true,
          stockAlerts: true,
          statusChanges: true,
          newOrders: true,
          lowStock: true,
          categoryReports: true
        },
        createdBy: req.user.id
      });
    }

    await manager.save();

    // Update user profile
    user.isManager = true;
    user.managerProfile = {
      manager_id: manager._id,
      assignedCategories: assignedCategories,
      managerLevel: managerLevel || 'junior',
      canAssignCategories: false,
      notificationPreferences: manager.notificationPreferences
    };
    await user.save();

    // Create category assignments
    for (const category of assignedCategories) {
      await CategoryAssignment.findOneAndUpdate(
        { manager_id: manager._id, category, company_id: companyId },
        {
          manager_id: manager._id,
          user_id,
          company_id: companyId,
          category,
          assignedBy: req.user.id,
          isActive: true,
          isPrimary: true
        },
        { upsert: true, new: true }
      );
    }

    res.status(201).json({
      message: "Manager profile created/updated successfully",
      manager: {
        _id: manager._id,
        user_id: manager.user_id,
        assignedCategories: manager.assignedCategories,
        managerLevel: manager.managerLevel,
        notificationPreferences: manager.notificationPreferences
      }
    });
  } catch (err) {
    console.error("Manager creation error:", err);
    res.status(500).json({ message: "Error creating manager profile", error: err.message });
  }
};

// Get manager profile
exports.getManagerProfile = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const companyId = req.user.company_id;

    // First try to find a Manager record
    let manager = await Manager.findOne({ user_id: userId, company_id: companyId })
      .populate('assignedCategories.assignedBy', 'firstName lastName email');

    // If no Manager record found, check User's managerProfile
    if (!manager) {
      const user = await User.findOne({ user_id: userId, company_id: companyId });
      if (!user || !user.isManager || !user.managerProfile) {
        return res.status(404).json({ message: "Manager profile not found" });
      }

      // Create a manager object from user's managerProfile
      manager = {
        _id: user.managerProfile.manager_id || user._id,
        user_id: user.user_id,
        assignedCategories: user.managerProfile.assignedCategories.map(category => ({
          category,
          assignedBy: user._id,
          assignedAt: new Date(),
          isActive: true
        })),
        managerLevel: user.managerProfile.managerLevel || 'junior',
        notificationPreferences: user.managerProfile.notificationPreferences || {
          orderUpdates: true,
          stockAlerts: true,
          statusChanges: true,
          newOrders: true,
          lowStock: true,
          categoryReports: true
        },
        permissions: user.managerProfile.permissions || [],
        performance: user.managerProfile.performance || {
          totalOrdersManaged: 0,
          totalProductsManaged: 0,
          averageResponseTime: 0,
          lastActiveAt: new Date()
        }
      };
    }

    // Get category assignments
    const categoryAssignments = await CategoryAssignment.find({
      manager_id: manager._id,
      isActive: true
    });

    res.json({
      manager: {
        _id: manager._id,
        user_id: manager.user_id,
        assignedCategories: manager.assignedCategories.map(cat => cat.category || cat),
        managerLevel: manager.managerLevel,
        notificationPreferences: manager.notificationPreferences,
        permissions: manager.permissions,
        performance: manager.performance,
        categoryAssignments: categoryAssignments
      }
    });
  } catch (err) {
    console.error("Get manager profile error:", err);
    res.status(500).json({ message: "Error fetching manager profile", error: err.message });
  }
};

// Get manager's category-specific orders
exports.getManagerOrders = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const companyId = req.user.company_id;
    const { status, category, page = 1, limit = 10 } = req.query;

    // Get manager's assigned categories
    let manager = await Manager.findOne({ user_id: userId, company_id: companyId });
    
    // If no Manager record found, check User's managerProfile
    if (!manager) {
      const user = await User.findOne({ user_id: userId, company_id: companyId });
      if (!user || !user.isManager || !user.managerProfile) {
        return res.status(404).json({ message: "Manager profile not found" });
      }
      
      // Create a manager object from user's managerProfile
      manager = {
        _id: user.managerProfile.manager_id || user._id,
        user_id: user.user_id,
        getCategoryList: () => user.managerProfile.assignedCategories || []
      };
    }

    const assignedCategories = manager.getCategoryList();

    // Build query for orders with manager's categories
    // Create a more flexible category matching that handles hierarchical categories
    const categoryMatches = [];
    
    // For each assigned category, create matches for main categories and subcategories
    assignedCategories.forEach(assignedCat => {
      // Extract main category from assigned category
      const mainCategory = assignedCat.split(' > ')[0];
      categoryMatches.push(mainCategory);
      
      // Also include the full assigned category for exact matches
      categoryMatches.push(assignedCat);
      
      // Include any subcategories
      if (assignedCat.includes(' > ')) {
        const parts = assignedCat.split(' > ');
        for (let i = 1; i < parts.length; i++) {
          const subCategory = parts.slice(0, i + 1).join(' > ');
          categoryMatches.push(subCategory);
        }
      }
    });
    
    const query = {
      company_id: companyId,
      $or: [
        { categories: { $in: categoryMatches } },
        { "items.product": { $exists: true } }
      ]
    };

    if (status) query.status = status;
    if (category) query.categories = category;

    // Get orders with populated data
    const orders = await Order.find(query)
      .populate('customer', 'companyName contactName email phone')
      .populate('items.product', 'name category price')
      .populate('createdBy', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Filter orders to only include items from manager's categories
    const filteredOrders = orders.map(order => {
      const filteredItems = order.items.filter(item => {
        const productCategory = item.product?.category?.mainCategory || item.product?.category;
        
        // Check if product category matches any of the manager's assigned categories
        return categoryMatches.some(categoryMatch => {
          if (typeof productCategory === 'string') {
            return productCategory.includes(categoryMatch) || categoryMatch.includes(productCategory);
          } else if (productCategory && productCategory.mainCategory) {
            return productCategory.mainCategory.includes(categoryMatch) || categoryMatch.includes(productCategory.mainCategory);
          }
          return false;
        });
      });

      return {
        ...order.toObject(),
        items: filteredItems,
        totalItems: filteredItems.length
      };
    }).filter(order => order.items.length > 0);

    res.json({
      orders: filteredOrders,
      totalOrders: filteredOrders.length,
      assignedCategories,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: filteredOrders.length
      }
    });
  } catch (err) {
    console.error("Get manager orders error:", err);
    res.status(500).json({ message: "Error fetching manager orders", error: err.message });
  }
};

// Update order status for manager's categories
exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params; // Get orderId from URL parameter
    const { status, comments, categoryStatuses, discountAmount } = req.body;
    const userId = req.user.user_id;
    const companyId = req.user.company_id;
    
    console.log('🔄 Backend updateOrderStatus called:', { orderId, status, comments, userId, companyId });

    // Get manager's assigned categories
    const manager = await Manager.findOne({ user_id: userId, company_id: companyId });
    if (!manager) {
      console.log('❌ Manager not found:', { userId, companyId });
      return res.status(404).json({ message: "Manager profile not found" });
    }

    const assignedCategories = manager.getCategoryList();
    console.log('✅ Manager found, assigned categories:', assignedCategories);

    // Get order
    const order = await Order.findById(orderId).populate('items.product');
    if (!order) {
      console.log('❌ Order not found:', orderId);
      return res.status(404).json({ message: "Order not found" });
    }
    
    console.log('✅ Order found:', { orderId: order._id, status: order.status, items: order.items.length });
    
    // Debug: Log order items and their categories
    console.log('📋 Order items categories:', order.items.map(item => ({
      productName: item.product?.name,
      productCategory: item.product?.category?.mainCategory || item.product?.category,
      fullCategory: item.product?.category
    })));

    // Check if order has items from manager's categories
    const hasManagerCategories = order.items.some(item => {
      const productCategory = item.product?.category?.mainCategory || item.product?.category;
      console.log('🔍 Checking category match:', {
        productCategory,
        assignedCategories,
        match: assignedCategories.some(assignedCat => {
          // Check if the assigned category contains the product category or vice versa
          return assignedCat.includes(productCategory) || productCategory.includes(assignedCat) ||
                 assignedCat.includes(productCategory.split(' > ')[0]) || // Check main category
                 productCategory.includes(assignedCat.split(' > ')[0]); // Check main category
        })
      });
      
      return assignedCategories.some(assignedCat => {
        // Check if the assigned category contains the product category or vice versa
        return assignedCat.includes(productCategory) || productCategory.includes(assignedCat) ||
               assignedCat.includes(productCategory.split(' > ')[0]) || // Check main category
               productCategory.includes(assignedCat.split(' > ')[0]); // Check main category
      });
    });

    if (!hasManagerCategories) {
      return res.status(403).json({ message: "You don't have permission to update this order" });
    }

    // Update order status
    if (status) {
      order.status = status;
    }

    // Update category-specific statuses
    if (categoryStatuses) {
      for (const [category, categoryStatus] of Object.entries(categoryStatuses)) {
        if (assignedCategories.includes(category)) {
          // Update approval status for this category
          const approvalIndex = order.approvals.findIndex(approval => approval.category === category);
          if (approvalIndex >= 0) {
            order.approvals[approvalIndex].status = categoryStatus;
            order.approvals[approvalIndex].approvedBy = req.user.id;
            order.approvals[approvalIndex].approvedAt = new Date();
            if (comments) {
              order.approvals[approvalIndex].comments = comments;
            }
          }
        }
      }
    }

    // Add manager comments
    if (comments) {
      order.notes = (order.notes || '') + `\n[Manager ${req.user.email}]: ${comments}`;
    }

    // Handle discount amount if provided
    if (discountAmount && discountAmount > 0) {
      order.totalDiscount = discountAmount;
      order.finalTotal = order.total - discountAmount;
      
      // Add discount info to notes
      const discountNote = `\n[Manager ${req.user.email}]: Discount applied: PKR ${discountAmount}`;
      order.notes = (order.notes || '') + discountNote;
      
      console.log('💰 Discount applied:', {
        orderId: order._id,
        originalTotal: order.total,
        discountAmount: discountAmount,
        finalTotal: order.finalTotal
      });
    }

    await order.save();

    // Update manager performance
    manager.performance.totalOrdersManaged += 1;
    manager.performance.lastActiveAt = new Date();
    await manager.save();

    // Send notification to admin about status change
    try {
      await notificationService.createNotification({
        title: "Order Status Updated",
        message: `Manager ${req.user.email} updated status for order #${order.orderNumber}`,
        type: "order",
        priority: "medium",
        targetType: "company",
        targetIds: [companyId],
        company_id: companyId,
        sender_id: userId,
        sender_name: req.user.email,
        data: {
          orderId: order._id,
          orderNumber: order.orderNumber,
          status: status,
          categoryStatuses: categoryStatuses,
          manager: req.user.email
        },
        channels: [
          { type: "in_app", enabled: true },
          { type: "web_push", enabled: true }
        ]
      });
    } catch (notificationError) {
      console.error("Notification error:", notificationError);
    }

    console.log('✅ Order status updated successfully:', {
      orderId: order._id,
      orderNumber: order.orderNumber,
      newStatus: order.status,
      updatedAt: order.updatedAt
    });

    res.json({
      message: "Order status updated successfully",
      order: {
        _id: order._id,
        orderNumber: order.orderNumber,
        status: order.status,
        approvals: order.approvals,
        updatedAt: order.updatedAt
      }
    });
  } catch (err) {
    console.error("Update order status error:", err);
    res.status(500).json({ message: "Error updating order status", error: err.message });
  }
};

// Get manager's category-specific products
exports.getManagerProducts = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const companyId = req.user.company_id;
    const { category, search, page = 1, limit = 10 } = req.query;

    // Get manager's assigned categories
    const manager = await Manager.findOne({ user_id: userId, company_id: companyId });
    if (!manager) {
      return res.status(404).json({ message: "Manager profile not found" });
    }

    const assignedCategories = manager.getCategoryList();

    // Build query
    const query = {
      company_id: companyId,
      isActive: true,
      $or: [
        { "category.mainCategory": { $in: assignedCategories } },
        { "category": { $in: assignedCategories } }
      ]
    };

    if (category) {
      query.$or = [
        { "category.mainCategory": category },
        { "category": category }
      ];
    }

    if (search) {
      query.$and = [
        { $or: [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ]}
      ];
    }

    const products = await Product.find(query)
      .populate('createdBy', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    res.json({
      products,
      totalProducts: products.length,
      assignedCategories,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: products.length
      }
    });
  } catch (err) {
    console.error("Get manager products error:", err);
    res.status(500).json({ message: "Error fetching manager products", error: err.message });
  }
};

// Get manager's category-specific reports
exports.getManagerReports = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const companyId = req.user.company_id;
    const { period = '30d', category } = req.query;

    // Get manager's assigned categories
    const manager = await Manager.findOne({ user_id: userId, company_id: companyId });
    if (!manager) {
      return res.status(404).json({ message: "Manager profile not found" });
    }

    const assignedCategories = manager.getCategoryList();

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    switch (period) {
      case '7d':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(endDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(endDate.getDate() - 90);
        break;
      default:
        startDate.setDate(endDate.getDate() - 30);
    }

    // Get orders for manager's categories
    const ordersQuery = {
      company_id: companyId,
      createdAt: { $gte: startDate, $lte: endDate },
      categories: { $in: assignedCategories }
    };

    if (category) {
      ordersQuery.categories = category;
    }

    const orders = await Order.find(ordersQuery)
      .populate('customer', 'companyName contactName')
      .populate('items.product', 'name category price');

    // Calculate statistics
    const stats = {
      totalOrders: orders.length,
      totalRevenue: orders.reduce((sum, order) => sum + order.total, 0),
      averageOrderValue: orders.length > 0 ? orders.reduce((sum, order) => sum + order.total, 0) / orders.length : 0,
      ordersByStatus: {},
      ordersByCategory: {},
      topCustomers: {},
      monthlyTrend: []
    };

    // Process orders for statistics
    orders.forEach(order => {
      // Orders by status
      stats.ordersByStatus[order.status] = (stats.ordersByStatus[order.status] || 0) + 1;
      
      // Orders by category
      order.categories.forEach(cat => {
        if (assignedCategories.includes(cat)) {
          stats.ordersByCategory[cat] = (stats.ordersByCategory[cat] || 0) + 1;
        }
      });

      // Top customers
      const customerName = order.customer?.companyName || 'Unknown';
      stats.topCustomers[customerName] = (stats.topCustomers[customerName] || 0) + 1;
    });

    // Get monthly trend
    const monthlyData = {};
    orders.forEach(order => {
      const month = order.createdAt.toISOString().substring(0, 7);
      if (!monthlyData[month]) {
        monthlyData[month] = { orders: 0, revenue: 0 };
      }
      monthlyData[month].orders += 1;
      monthlyData[month].revenue += order.total;
    });

    stats.monthlyTrend = Object.entries(monthlyData).map(([month, data]) => ({
      month,
      orders: data.orders,
      revenue: data.revenue
    }));

    res.json({
      reports: stats,
      assignedCategories,
      period,
      generatedAt: new Date()
    });
  } catch (err) {
    console.error("Get manager reports error:", err);
    res.status(500).json({ message: "Error fetching manager reports", error: err.message });
  }
};

// Get all managers (for admin)
exports.getAllManagers = async (req, res) => {
  try {
    const companyId = req.user?.company_id || req.headers['x-company-id'] || "RESSICHEM";

    // Get managers from Manager collection
    const managerRecords = await Manager.find({ company_id: companyId, isActive: true })
      .populate('assignedCategories.assignedBy', 'firstName lastName email')
      .populate('createdBy', 'firstName lastName email')
      .sort({ createdAt: -1 });

    // Get managers from User collection (embedded managerProfile)
    // Include all users with isManager: true, even if they don't have assignedCategories yet
    const userManagers = await User.find({ 
      company_id: companyId, 
      isManager: true
    }).select('user_id email firstName lastName managerProfile createdAt');

    // Combine both sources
    const allManagers = [];

    // Add Manager records
    for (const manager of managerRecords) {
      // Get user details for this manager
      const user = await User.findOne({ user_id: manager.user_id, company_id: companyId })
        .select('firstName lastName email');
      
      allManagers.push({
        _id: manager._id,
        user_id: manager.user_id,
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        email: user?.email || '',
        fullName: user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : '',
        assignedCategories: manager.assignedCategories.map(cat => cat.category),
        managerLevel: manager.managerLevel,
        performance: manager.performance || {
          totalOrdersManaged: 0,
          totalProductsManaged: 0,
          averageResponseTime: 0,
          lastActiveAt: new Date()
        },
        isActive: manager.isActive,
        createdAt: manager.createdAt,
        source: 'Manager'
      });
    }

    // Add User manager profiles (include all managers, even without assignedCategories)
    userManagers.forEach(user => {
      // Check if this user is already in allManagers (from Manager collection)
      const alreadyAdded = allManagers.some(m => m.user_id === user.user_id);
      
      if (!alreadyAdded) {
        allManagers.push({
          _id: user.managerProfile?.manager_id || user._id,
          user_id: user.user_id,
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          email: user.email || '',
          fullName: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
          assignedCategories: user.managerProfile?.assignedCategories || [],
          managerLevel: user.managerProfile?.managerLevel || 'junior',
          performance: user.managerProfile?.performance || {
            totalOrdersManaged: 0,
            totalProductsManaged: 0,
            averageResponseTime: 0,
            lastActiveAt: new Date()
          },
          isActive: true,
          createdAt: user.createdAt,
          source: 'User'
        });
      }
    });

    // Remove duplicates (in case user exists in both collections)
    const uniqueManagers = allManagers.filter((manager, index, self) => 
      index === self.findIndex(m => m.user_id === manager.user_id)
    );

    res.json({
      managers: uniqueManagers.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    });
  } catch (err) {
    console.error("Get all managers error:", err);
    res.status(500).json({ message: "Error fetching managers", error: err.message });
  }
};

// Assign categories to manager (admin only)
exports.assignCategories = async (req, res) => {
  try {
    const { managerId, categories } = req.body;
    const companyId = req.user?.company_id || req.headers['x-company-id'] || "RESSICHEM";

    const manager = await Manager.findById(managerId);
    if (!manager) {
      return res.status(404).json({ message: "Manager not found" });
    }

    // Update assigned categories
    manager.assignedCategories = categories.map(category => ({
      category,
      assignedBy: req.user.id,
      assignedAt: new Date(),
      isActive: true
    }));

    await manager.save();

    // Update category assignments
    await CategoryAssignment.deleteMany({ manager_id: managerId });
    
    for (const category of categories) {
      await CategoryAssignment.create({
        manager_id: managerId,
        user_id: manager.user_id,
        company_id: companyId,
        category,
        assignedBy: req.user.id,
        isActive: true,
        isPrimary: true
      });
    }

    // Update user profile
    const user = await User.findOne({ user_id: manager.user_id, company_id: companyId });
    if (user) {
      user.managerProfile.assignedCategories = categories;
      await user.save();
    }

    res.json({
      message: "Categories assigned successfully",
      manager: {
        _id: manager._id,
        user_id: manager.user_id,
        assignedCategories: manager.assignedCategories
      }
    });
  } catch (err) {
    console.error("Assign categories error:", err);
    res.status(500).json({ message: "Error assigning categories", error: err.message });
  }
};

// Create new manager
exports.createManager = async (req, res) => {
  try {
    const { user_id, assignedCategories, managerLevel, notificationPreferences } = req.body;
    const companyId = req.user.company_id;

    // Check if user exists
    const user = await User.findOne({ user_id, company_id: companyId });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if manager already exists
    const existingManager = await Manager.findOne({ user_id, company_id: companyId });
    if (existingManager) {
      return res.status(400).json({ message: "Manager already exists for this user" });
    }

    // Create new manager
    const manager = new Manager({
      user_id,
      company_id: companyId,
      assignedCategories: assignedCategories.map(category => ({
        category,
        assignedBy: req.user._id, // Use ObjectId instead of user_id string
        assignedAt: new Date(),
        isActive: true
      })),
      managerLevel: managerLevel || 'junior',
      notificationPreferences: notificationPreferences || {
        orderUpdates: true,
        stockAlerts: true,
        statusChanges: true,
        newOrders: true,
        lowStock: true,
        categoryReports: true
      },
      isActive: true,
      createdBy: req.user._id // Use ObjectId instead of user_id string
    });

    await manager.save();

    // Update user's manager profile
    user.isManager = true;
    user.managerProfile = {
      manager_id: manager._id,
      assignedCategories,
      managerLevel: managerLevel || 'junior',
      notificationPreferences: notificationPreferences || {
        orderUpdates: true,
        stockAlerts: true,
        statusChanges: true,
        newOrders: true,
        lowStock: true,
        categoryReports: true
      }
    };
    await user.save();

    // Create category assignments
    for (const category of assignedCategories) {
      const assignment = new CategoryAssignment({
        manager_id: manager._id,
        user_id: user_id,
        company_id: companyId,
        category,
        assignedBy: req.user._id,
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
    }

    res.status(201).json({
      message: "Manager created successfully",
      manager: {
        _id: manager._id,
        user_id: manager.user_id,
        assignedCategories: manager.assignedCategories,
        managerLevel: manager.managerLevel,
        isActive: manager.isActive
      }
    });
  } catch (err) {
    console.error("Create manager error:", err);
    res.status(500).json({ message: "Error creating manager", error: err.message });
  }
};

// Update manager
exports.updateManager = async (req, res) => {
  try {
    const { id } = req.params;
    const { managerLevel, isActive, notificationPreferences } = req.body;
    const companyId = req.user.company_id;

    const manager = await Manager.findOne({ _id: id, company_id: companyId });
    if (!manager) {
      return res.status(404).json({ message: "Manager not found" });
    }

    // Update manager fields
    if (managerLevel) manager.managerLevel = managerLevel;
    if (isActive !== undefined) manager.isActive = isActive;
    if (notificationPreferences) {
      manager.notificationPreferences = { ...manager.notificationPreferences, ...notificationPreferences };
    }
    manager.updatedBy = req.user._id;

    await manager.save();

    // Update user's manager profile if exists
    const user = await User.findOne({ user_id: manager.user_id, company_id: companyId });
    if (user && user.managerProfile) {
      if (managerLevel) user.managerProfile.managerLevel = managerLevel;
      if (notificationPreferences) {
        user.managerProfile.notificationPreferences = { ...user.managerProfile.notificationPreferences, ...notificationPreferences };
      }
      await user.save();
    }

    res.json({
      message: "Manager updated successfully",
      manager: {
        _id: manager._id,
        user_id: manager.user_id,
        assignedCategories: manager.assignedCategories,
        managerLevel: manager.managerLevel,
        isActive: manager.isActive
      }
    });
  } catch (err) {
    console.error("Update manager error:", err);
    res.status(500).json({ message: "Error updating manager", error: err.message });
  }
};

// Delete manager
exports.deleteManager = async (req, res) => {
  try {
    const { id } = req.params;
    const companyId = req.user.company_id;

    const manager = await Manager.findOne({ _id: id, company_id: companyId });
    if (!manager) {
      return res.status(404).json({ message: "Manager not found" });
    }

    // Update user's manager status
    const user = await User.findOne({ user_id: manager.user_id, company_id: companyId });
    if (user) {
      user.isManager = false;
      user.managerProfile = null;
      await user.save();
    }

    // Deactivate category assignments
    await CategoryAssignment.updateMany(
      { manager_id: manager._id },
      { isActive: false }
    );

    // Delete manager record
    await Manager.findByIdAndDelete(id);

    res.json({ message: "Manager deleted successfully" });
  } catch (err) {
    console.error("Delete manager error:", err);
    res.status(500).json({ message: "Error deleting manager", error: err.message });
  }
};

// Get users for manager creation
exports.getUsers = async (req, res) => {
  try {
    const companyId = req.user.company_id;
    const { search, page = 1, limit = 50 } = req.query;

    // Build query - Show all users for manager creation
    const query = { 
      company_id: companyId
      // Removed isManager filter to show all users
    };
    
    if (search) {
      query.$or = [
        { email: { $regex: search, $options: 'i' } },
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } }
      ];
    }

    // Get users
    const users = await User.find(query)
      .select('user_id email firstName lastName department isManager managerProfile')
      .sort({ firstName: 1, lastName: 1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const totalUsers = await User.countDocuments(query);

    res.json({
      users,
      totalUsers,
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalUsers / limit)
    });
  } catch (err) {
    console.error("Get users error:", err);
    res.status(500).json({ message: "Error fetching users", error: err.message });
  }
};
