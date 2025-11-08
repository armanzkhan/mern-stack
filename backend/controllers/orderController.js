const Order = require("../models/Order");
const Customer = require("../models/Customer");
const Product = require("../models/Product");
const CategoryApproval = require("../models/CategoryApproval");
const User = require("../models/User");
const Manager = require("../models/Manager");
const notificationTriggerService = require("../services/notificationTriggerService");
const categoryNotificationService = require("../services/categoryNotificationService");
const realtimeService = require("../services/realtimeService");
const itemApprovalService = require("../services/itemApprovalService");

// Create order
exports.createOrder = async (req, res) => {
  try {
    const { customer, items, notes } = req.body;
    const companyId = req.headers['x-company-id'] || req.user?.company_id || "RESSICHEM";

    // ✅ Validate customer
    const customerExists = await Customer.findOne({ _id: customer, company_id: companyId });
    if (!customerExists) {
      return res.status(404).json({ message: "Customer not found" });
    }

    let subtotal = 0;
    const orderItems = [];
    const categories = new Set();

    // ✅ Validate products and collect categories
    for (const item of items) {
      const product = await Product.findOne({ _id: item.product, company_id: companyId });
      if (!product) {
        return res.status(404).json({ message: `Product not found: ${item.product}` });
      }
      
      const total = item.quantity * item.unitPrice;
      subtotal += total;
      
      // Collect categories
      if (product.category?.mainCategory) {
        categories.add(product.category.mainCategory);
      }

      orderItems.push({
        product: product._id,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        total,
        tdsLink: item.tdsLink || "", // Include TDS link if provided
      });
    }

    const tax = subtotal * 0.1; // ✅ example 10% tax
    const total = subtotal + tax;

    // Generate unique order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const order = new Order({
      orderNumber,
      customer,
      items: orderItems,
      subtotal,
      tax,
      total,
      notes,
      createdBy: req.user ? req.user._id : null,
      company_id: companyId,
      categories: Array.from(categories),
      requiresApproval: categories.size > 0
    });

    await order.save();

    // Create item-level approvals (NEW SYSTEM)
    try {
      await itemApprovalService.createItemApprovals(order);
      console.log('✅ Item-level approvals created successfully');
    } catch (approvalError) {
      console.error("Failed to create item approvals:", approvalError);
      // Don't fail the order creation if approval setup fails
    }

    // Send real-time notification for new order
    try {
      realtimeService.sendNewOrderNotification(order);
    } catch (realtimeError) {
      console.error("Realtime notification error:", realtimeError);
    }

    // Send notification to customer about order creation
    try {
      const customerRecord = await Customer.findById(customer);
      if (customerRecord) {
        await notificationService.createNotification({
          title: "Order Created Successfully",
          message: `Your order #${order.orderNumber} has been created and is pending approval`,
          type: "order_created",
          priority: "medium",
          targetType: "customer",
          targetIds: [customerRecord._id],
          company_id: companyId,
          sender_id: "system",
          sender_name: "System",
          data: {
            orderId: order._id,
            orderNumber: order.orderNumber,
            total: order.total
          },
          channels: [
            { type: "in_app", enabled: true },
            { type: "web_push", enabled: true }
          ]
        });
      }
    } catch (customerNotificationError) {
      console.error("Failed to send customer notification:", customerNotificationError);
    }

    // Send category-based notifications to managers
    try {
      const createdBy = req.user || { _id: 'system', name: 'System', email: 'system@ressichem.com' };
      await categoryNotificationService.notifyOrderUpdate(order, 'created', createdBy);
    } catch (notificationError) {
      console.error("Failed to send category manager notifications:", notificationError);
      // Don't fail the order creation if notification fails
    }

    // Send notification about new order
    try {
      const createdBy = req.user || { _id: 'system', name: 'System', email: 'system@ressichem.com' };
      await notificationTriggerService.triggerOrderCreated(order, createdBy);
    } catch (notificationError) {
      console.error("Failed to send order creation notification:", notificationError);
      // Don't fail the order creation if notification fails
    }

    res.status(201).json(order);
  } catch (err) {
    console.error("Error creating order:", err);
    res.status(500).json({ message: "Error creating order", error: err.message });
  }
};

// Get pending item approvals for a manager
exports.getManagerPendingApprovals = async (req, res) => {
  try {
    const managerId = req.user._id;
    const companyId = req.user.company_id || "RESSICHEM";
    
    console.log(`🔍 Getting pending approvals for manager ${managerId} in company ${companyId}`);
    
    const approvals = await itemApprovalService.getManagerPendingApprovals(managerId, companyId);
    
    console.log(`✅ Found ${approvals.length} pending approvals for manager`);
    
    res.json({
      success: true,
      approvals: approvals,
      count: approvals.length
    });
  } catch (err) {
    console.error("Error getting manager pending approvals:", err);
    res.status(500).json({ message: "Error fetching pending approvals", error: err.message });
  }
};

exports.getManagerAllApprovals = async (req, res) => {
  try {
    const managerId = req.user._id;
    const companyId = req.user.company_id || "RESSICHEM";
    
    console.log(`🔍 Getting all approvals for manager ${managerId} in company ${companyId}`);
    
    const approvals = await itemApprovalService.getManagerAllApprovals(managerId, companyId);
    
    console.log(`✅ Found ${approvals.length} total approvals for manager`);
    
    res.json({
      success: true,
      approvals: approvals,
      count: approvals.length
    });
  } catch (err) {
    console.error("Error getting all manager approvals:", err);
    res.status(500).json({ message: "Error fetching all approvals", error: err.message });
  }
};

// Approve or reject a specific item
exports.approveItem = async (req, res) => {
  try {
    const { approvalId, action, comments, discountPercentage, discountAmount } = req.body;
    const managerId = req.user._id;
    
    if (!['approved', 'rejected'].includes(action)) {
      return res.status(400).json({ message: "Invalid action. Must be 'approved' or 'rejected'" });
    }
    
    const result = await itemApprovalService.approveItem(
      approvalId, 
      managerId, 
      action, 
      comments, 
      discountPercentage, 
      discountAmount
    );
    
    res.json({
      success: true,
      message: `Item ${action} successfully`,
      approval: result
    });
  } catch (err) {
    console.error("Error approving item:", err);
    
    // Check if it's a business logic error (400) or server error (500)
    if (err.isBusinessLogicError || err.statusCode === 400) {
      res.status(400).json({ message: err.message, error: err.message });
    } else {
      res.status(500).json({ message: "Error processing item approval", error: err.message });
    }
  }
};

// Update discount for an approved item
exports.updateDiscount = async (req, res) => {
  try {
    const { approvalId, discountAmount, comments } = req.body;
    const managerId = req.user._id;
    
    console.log(`🔍 Updating discount for approval ${approvalId} by manager ${managerId}`);
    console.log(`🔍 New discount amount: ${discountAmount}, Comments: ${comments}`);
    
    const result = await itemApprovalService.updateDiscount(
      approvalId, 
      managerId, 
      discountAmount, 
      comments
    );
    
    res.json({
      success: true,
      message: `Discount updated successfully`,
      approval: result
    });
  } catch (err) {
    console.error("Error updating discount:", err);
    
    // Check if it's a business logic error (400) or server error (500)
    if (err.isBusinessLogicError || err.statusCode === 400) {
      res.status(400).json({ message: err.message, error: err.message });
    } else {
      res.status(500).json({ message: "Error updating discount", error: err.message });
    }
  }
};

// Notify approvers for each category
exports.notifyApprovers = async (order, companyId) => {
  try {
    for (const category of order.categories) {
      // Find approvers for this category
      const categoryApprovals = await CategoryApproval.find({
        company_id: companyId,
        category: category,
        isActive: true
      }).populate('approverUser');

      for (const approval of categoryApprovals) {
        // Send notification to approver
        try {
          await notificationTriggerService.triggerOrderApprovalRequired(order, approval.approverUser, category);
        } catch (notificationError) {
          console.error(`Failed to notify approver for category ${category}:`, notificationError);
        }
      }
    }
  } catch (error) {
    console.error("Error notifying approvers:", error);
  }
};

// Get all orders
exports.getOrders = async (req, res) => {
  try {
    const companyId = req.headers['x-company-id'] || req.user?.company_id || "RESSICHEM";
    
    // Check if user is a customer - if so, filter by their orders only
    let query = { company_id: companyId };
    
    if (req.user && req.user.isCustomer) {
      // For customer users, find their customer record and filter orders
      const Customer = require('../models/Customer');
      const currentUser = await User.findById(req.user._id).select('email');
      
      console.log(`🔍 Customer user detected: ${req.user.email}, User ID: ${req.user._id}`);
      console.log(`🔍 Current user from DB:`, currentUser);
      
      if (currentUser) {
        const customer = await Customer.findOne({ 
          email: currentUser.email,
          company_id: companyId 
        });
        
        console.log(`🔍 Found customer record:`, customer ? { id: customer._id, email: customer.email, companyName: customer.companyName } : 'Not found');
        
        if (customer) {
          query.customer = customer._id;
          console.log(`🔍 Customer ${req.user.email} - filtering orders for customer ID: ${customer._id}`);
        } else {
          console.log(`⚠️ Customer user ${req.user.email} not found in customer records`);
          return res.json([]); // Return empty array if customer not found
        }
      } else {
        console.log(`⚠️ Current user not found in database for ID: ${req.user._id}`);
        return res.json([]);
      }
    } else if (req.user && req.user.isManager && req.user.managerProfile?.assignedCategories) {
      // For manager users, filter by their assigned categories
      const managerCategories = req.user.managerProfile.assignedCategories;
      console.log(`🔍 Manager ${req.user.email} assigned categories:`, managerCategories);
      
      // Filter orders that have products in the manager's assigned categories
      query = {
        company_id: companyId,
        $or: [
          // Orders with categories matching manager's assigned categories
          { categories: { $in: managerCategories } },
          // Orders with products in manager's assigned categories
          { 
            "items.product": {
              $in: await Product.find({
                company_id: companyId,
                $or: [
                  { "category.mainCategory": { $in: managerCategories } },
                  { "category.subCategory": { $in: managerCategories } },
                  { "category.subSubCategory": { $in: managerCategories } }
                ]
              }).distinct('_id')
            }
          }
        ]
      };
      
      console.log(`📋 Filtering orders for manager categories:`, managerCategories);
    }
    
    const orders = await Order.find(query)
      .populate("customer", "companyName contactName email")
      .populate("items.product", "name price category")
      .populate("createdBy", "email firstName lastName")
      .sort({ createdAt: -1 });
    
    console.log(`📊 Found ${orders.length} orders for user ${req.user?.email || 'anonymous'}`);
    console.log(`📊 Orders details:`, orders.map(order => ({
      orderNumber: order.orderNumber,
      customer: order.customer?.companyName,
      status: order.status,
      total: order.total
    })));
    res.json(orders);
  } catch (err) {
    console.error("Error fetching orders:", err);
    res.status(500).json({ message: "Error fetching orders", error: err.message });
  }
};

// Get order by ID
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("customer", "companyName contactName email")
      .populate("items.product", "name price");
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: "Error fetching order", error: err.message });
  }
};

// Update order status
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status, comments, discountAmount } = req.body;
    const oldOrder = await Order.findById(req.params.id);
    if (!oldOrder) return res.status(404).json({ message: "Order not found" });

    // Prepare update data
    const updateData = { status };
    
    // Handle discount amount if provided
    if (discountAmount && discountAmount > 0) {
      updateData.totalDiscount = discountAmount;
      updateData.finalTotal = oldOrder.total - discountAmount;
      
      // Add discount info to notes if comments provided
      if (comments) {
        updateData.notes = comments;
      } else {
        updateData.notes = `Discount applied: PKR ${discountAmount}`;
      }
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    // Send real-time notification for order status change
    try {
      const updatedBy = req.user ? {
        _id: req.user._id,
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        email: req.user.email,
        name: req.user.firstName && req.user.lastName ? `${req.user.firstName} ${req.user.lastName}` : req.user.email
      } : { _id: 'system', name: 'System', email: 'system@ressichem.com' };
      realtimeService.sendOrderStatusUpdate(order, oldOrder.status, status, updatedBy);
    } catch (realtimeError) {
      console.error("Realtime notification error:", realtimeError);
    }

    // Send notification about order status change
    try {
      const updatedBy = req.user ? {
        _id: req.user._id,
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        email: req.user.email,
        name: req.user.firstName && req.user.lastName ? `${req.user.firstName} ${req.user.lastName}` : req.user.email
      } : { _id: 'system', name: 'System', email: 'system@ressichem.com' };
      await notificationTriggerService.triggerOrderStatusChanged(order, updatedBy, oldOrder.status, status);
    } catch (notificationError) {
      console.error("Failed to send order status change notification:", notificationError);
      // Don't fail the order update if notification fails
    }

    res.json(order);
  } catch (err) {
    res.status(500).json({ message: "Error updating order", error: err.message });
  }
};

// Update order (general update)
exports.updateOrder = async (req, res) => {
  try {
    const { status, notes, subtotal, tax, total } = req.body;
    const companyId = req.headers['x-company-id'] || req.user?.company_id || "RESSICHEM";
    
    const oldOrder = await Order.findOne({ _id: req.params.id, company_id: companyId });
    if (!oldOrder) return res.status(404).json({ message: "Order not found" });

    // Prepare update object
    const updateData = {};
    if (status !== undefined) updateData.status = status;
    if (notes !== undefined) updateData.notes = notes;
    if (subtotal !== undefined) updateData.subtotal = subtotal;
    if (tax !== undefined) updateData.tax = tax;
    if (total !== undefined) updateData.total = total;

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate('customer', 'companyName contactName email');

    // Send notification about order status change if status was updated
    if (status && status !== oldOrder.status) {
      try {
        const updatedBy = req.user || { _id: 'system', name: 'System', email: 'system@ressichem.com' };
        await notificationTriggerService.triggerOrderStatusChanged(order, updatedBy, oldOrder.status, status);
        
        // Send category-based notifications to managers
        await categoryNotificationService.notifyStatusChange(order, oldOrder.status, status, updatedBy);
      } catch (notificationError) {
        console.error("Failed to send order status change notification:", notificationError);
        // Don't fail the order update if notification fails
      }
    }

    res.json(order);
  } catch (err) {
    res.status(500).json({ message: "Error updating order", error: err.message });
  }
};

// Approve order category
exports.approveOrderCategory = async (req, res) => {
  try {
    const { orderId, category, comments, discountPercentage, discountAmount } = req.body;
    const approverId = req.user._id;
    const companyId = req.user.company_id || "RESSICHEM";

    const order = await Order.findOne({ _id: orderId, company_id: companyId });
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Check if user can approve this category
    const canApprove = await CategoryApproval.findOne({
      company_id: companyId,
      category: category,
      $or: [
        { approverUser: approverId },
        { approverRole: { $in: req.user.roles } }
      ],
      isActive: true
    });

    if (!canApprove) {
      return res.status(403).json({ message: "You don't have permission to approve this category" });
    }

    // Update approval status
    const approvalIndex = order.approvals.findIndex(a => a.category === category);
    if (approvalIndex === -1) {
      return res.status(404).json({ message: "Category not found in order" });
    }

    // Calculate discount amount if percentage is provided
    let calculatedDiscountAmount = 0;
    if (discountPercentage && discountPercentage > 0) {
      // Calculate discount based on category items total
      const categoryItems = order.items.filter(item => {
        if (typeof item.product.category === 'string') {
          return item.product.category === category;
        } else if (item.product.category && item.product.category.mainCategory) {
          return item.product.category.mainCategory === category;
        }
        return false;
      });
      
      const categorySubtotal = categoryItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      calculatedDiscountAmount = (categorySubtotal * discountPercentage) / 100;
    } else if (discountAmount && discountAmount > 0) {
      calculatedDiscountAmount = discountAmount;
    }

    order.approvals[approvalIndex] = {
      category,
      approvedBy: approverId,
      approvedAt: new Date(),
      status: "approved",
      comments,
      discountPercentage: discountPercentage || 0,
      discountAmount: calculatedDiscountAmount,
      originalAmount: order.approvals[approvalIndex]?.originalAmount || 0
    };

    // Check if all categories are approved
    const allApproved = order.approvals.every(a => a.status === "approved");
    if (allApproved) {
      order.approvalStatus = "approved";
      order.status = "approved";
      order.approvedAt = new Date();
      
      // Recalculate order total with discounts
      const totalDiscountAmount = order.approvals.reduce((sum, approval) => {
        return sum + (approval.discountAmount || 0);
      }, 0);
      
      order.totalDiscount = totalDiscountAmount;
      order.finalTotal = order.total - totalDiscountAmount;
      
      console.log(`💰 Order ${order.orderNumber} - Total: ${order.total}, Discount: ${totalDiscountAmount}, Final: ${order.finalTotal}`);
    }

    await order.save();

    // Send notification about approval
    try {
      await notificationTriggerService.triggerOrderCategoryApproved(order, req.user, category);
    } catch (notificationError) {
      console.error("Failed to send approval notification:", notificationError);
    }

    // Send notification to customer if all categories are approved
    if (allApproved) {
      try {
        const customer = await Customer.findById(order.customer);
        if (customer) {
          await notificationService.createNotification({
            title: "Order Approved",
            message: `Your order #${order.orderNumber} has been approved and is ready for processing`,
            type: "order_approved",
            priority: "high",
            targetType: "customer",
            targetIds: [customer._id],
            company_id: order.company_id,
            sender_id: req.user._id,
            sender_name: req.user.email,
            data: {
              orderId: order._id,
              orderNumber: order.orderNumber,
              total: order.total
            },
            channels: [
              { type: "in_app", enabled: true },
              { type: "web_push", enabled: true }
            ]
          });
        }
      } catch (customerNotificationError) {
        console.error("Failed to send customer approval notification:", customerNotificationError);
      }
    }

    res.json(order);
  } catch (err) {
    console.error("Error approving order category:", err);
    res.status(500).json({ message: "Error approving order category", error: err.message });
  }
};

// Reject order category
exports.rejectOrderCategory = async (req, res) => {
  try {
    const { orderId, category, comments } = req.body;
    const approverId = req.user._id;
    const companyId = req.user.company_id || "RESSICHEM";

    const order = await Order.findOne({ _id: orderId, company_id: companyId });
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Check if user can approve this category
    const canApprove = await CategoryApproval.findOne({
      company_id: companyId,
      category: category,
      $or: [
        { approverUser: approverId },
        { approverRole: { $in: req.user.roles } }
      ],
      isActive: true
    });

    if (!canApprove) {
      return res.status(403).json({ message: "You don't have permission to approve this category" });
    }

    // Update approval status
    const approvalIndex = order.approvals.findIndex(a => a.category === category);
    if (approvalIndex === -1) {
      return res.status(404).json({ message: "Category not found in order" });
    }

    order.approvals[approvalIndex] = {
      category,
      approvedBy: approverId,
      approvedAt: new Date(),
      status: "rejected",
      comments
    };

    order.approvalStatus = "rejected";
    order.status = "rejected";
    order.rejectedAt = new Date();

    await order.save();

    // Send realtime notification for order rejection
    try {
      const updatedBy = req.user ? {
        _id: req.user._id,
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        email: req.user.email,
        name: req.user.firstName && req.user.lastName ? `${req.user.firstName} ${req.user.lastName}` : req.user.email
      } : { _id: 'system', name: 'System', email: 'system@ressichem.com' };
      
      realtimeService.sendOrderStatusUpdate(order, 'pending', 'rejected', updatedBy);
      console.log('✅ Realtime rejection notification sent');
    } catch (realtimeError) {
      console.error("Realtime rejection notification error:", realtimeError);
    }

    // Send notification about rejection
    try {
      await notificationTriggerService.triggerOrderCategoryRejected(order, req.user, category);
    } catch (notificationError) {
      console.error("Failed to send rejection notification:", notificationError);
    }

    // Send notification to customer about rejection
    try {
      const customer = await Customer.findById(order.customer);
      if (customer) {
        await notificationService.createNotification({
          title: "Order Rejected",
          message: `Your order #${order.orderNumber} has been rejected. Please contact support for more information.`,
          type: "order_rejected",
          priority: "high",
          targetType: "customer",
          targetIds: [customer._id],
          company_id: order.company_id,
          sender_id: req.user._id,
          sender_name: req.user.email,
          data: {
            orderId: order._id,
            orderNumber: order.orderNumber,
            total: order.total,
            reason: comments || "No reason provided"
          },
          channels: [
            { type: "in_app", enabled: true },
            { type: "web_push", enabled: true }
          ]
        });
      }
    } catch (customerNotificationError) {
      console.error("Failed to send customer rejection notification:", customerNotificationError);
    }

    res.json(order);
  } catch (err) {
    console.error("Error rejecting order category:", err);
    res.status(500).json({ message: "Error rejecting order category", error: err.message });
  }
};

// Get orders pending approval for current user
exports.getPendingApprovals = async (req, res) => {
  try {
    const companyId = req.user.company_id || "RESSICHEM";
    const userId = req.user._id;
    const userRoles = req.user.roles || [];

    // Find categories this user can approve
    const categoryApprovals = await CategoryApproval.find({
      company_id: companyId,
      $or: [
        { approverUser: userId },
        { approverRole: { $in: userRoles } }
      ],
      isActive: true
    });

    const categories = categoryApprovals.map(ca => ca.category);

    // Find orders with pending approvals for these categories
    const orders = await Order.find({
      company_id: companyId,
      approvalStatus: "pending",
      "approvals.category": { $in: categories },
      "approvals.status": "pending"
    })
    .populate("customer", "companyName contactName email")
    .populate("items.product", "name price category")
    .populate("createdBy", "email firstName lastName")
    .sort({ createdAt: -1 });

    res.json(orders);
  } catch (err) {
    console.error("Error fetching pending approvals:", err);
    res.status(500).json({ message: "Error fetching pending approvals", error: err.message });
  }
};

// Delete order
exports.deleteOrder = async (req, res) => {
  try {
    const companyId = req.headers['x-company-id'] || req.user?.company_id || "RESSICHEM";
    const order = await Order.findOneAndDelete({ _id: req.params.id, company_id: companyId });
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json({ message: "Order deleted successfully" });
  } catch (err) {
    console.error("Error deleting order:", err);
    res.status(500).json({ message: "Error deleting order", error: err.message });
  }
};
