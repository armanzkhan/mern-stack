const Order = require("../models/Order");
const Customer = require("../models/Customer");
const Product = require("../models/Product");
const CategoryApproval = require("../models/CategoryApproval");
const User = require("../models/User");
const Manager = require("../models/Manager");
const notificationService = require("../services/notificationService");
const notificationTriggerService = require("../services/notificationTriggerService");
const categoryNotificationService = require("../services/categoryNotificationService");
const realtimeService = require("../services/realtimeService");
const itemApprovalService = require("../services/itemApprovalService");
const OrderItemApproval = require("../models/OrderItemApproval");

const LOGISTICS_STATUSES = ["dispatch", "hold", "partial_shipment"];
const LOGISTICS_VISIBLE_STATUSES = [
  "approved",
  ...LOGISTICS_STATUSES,
  "dispatched",
  "shipped",
  "completed",
  "cancelled",
];
const MANAGER_STATUSES = ["processing", "rejected"];
const COMPANY_ADMIN_STATUSES = [
  "pending",
  "approved",
  "rejected",
  "confirmed",
  "processing",
  "allocated",
  "dispatch",
  "hold",
  "partial_shipment",
  "dispatched",
  "shipped",
  "completed",
  "cancelled"
];

const normalizeRoleName = (role) => String(role || "").toLowerCase().trim();
const getActorMeta = (req) => {
  const firstName = String(req.user?.firstName || "").trim();
  const lastName = String(req.user?.lastName || "").trim();
  const fullName = `${firstName} ${lastName}`.trim();
  const role = normalizeRoleName(req.user?.role);
  let source = "system";
  if (req.user?.isCustomer || role === "customer") source = "customer";
  else if (req.user?.isSuperAdmin || req.user?.isCompanyAdmin || isCompanyAdminUser(req)) source = "admin";
  else if (role.includes("logistic")) source = "logistics";
  else if (req.user?.isManager) source = "manager";

  return {
    userId: req.user?._id || null,
    email: req.user?.email || "",
    name: fullName || req.user?.email || "System",
    source,
  };
};

const isLogisticManagerUser = (req) => {
  const tokenRole = normalizeRoleName(req.user?.role);
  const tokenRoles = Array.isArray(req.user?.roles) ? req.user.roles.map(normalizeRoleName) : [];
  return tokenRole === "logistic manager" ||
    tokenRole === "logistic_manager" ||
    tokenRole === "logistic" ||
    tokenRoles.includes("logistic manager") ||
    tokenRoles.includes("logistic_manager") ||
    tokenRoles.includes("logistic");
};

/** Token + DB (JWT may omit role strings on older tokens). */
const isLogisticManagerRequest = async (req, companyId) => {
  if (!req.user?.user_id) return false;
  if (isLogisticManagerUser(req)) return true;
  const u = await User.findOne({
    user_id: req.user.user_id,
    company_id: companyId,
  }).select("role roles isCompanyAdmin");
  if (!u || u.isCompanyAdmin) return false;
  const r = normalizeRoleName(u.role);
  const rs = Array.isArray(u.roles) ? u.roles.map(normalizeRoleName) : [];
  return (
    r === "logistic manager" ||
    r === "logistic_manager" ||
    r === "logistic" ||
    rs.includes("logistic manager") ||
    rs.includes("logistic_manager") ||
    rs.includes("logistic")
  );
};

const isCompanyAdminUser = (req) => {
  const tokenRole = normalizeRoleName(req.user?.role);
  const tokenRoles = Array.isArray(req.user?.roles) ? req.user.roles.map(normalizeRoleName) : [];
  return req.user?.isCompanyAdmin === true ||
    tokenRole === "company admin" || tokenRole === "company_admin" ||
    tokenRole === "companyadmin" ||
    tokenRoles.includes("company admin") || tokenRoles.includes("company_admin") ||
    tokenRoles.includes("companyadmin");
};

const getAllowedStatusesForUserAsync = async (req, companyId) => {
  if (req.user?.isSuperAdmin || isCompanyAdminUser(req)) return COMPANY_ADMIN_STATUSES;
  if (await isLogisticManagerRequest(req, companyId)) {
    return LOGISTICS_STATUSES;
  }
  let isMgr = req.user?.isManager === true;
  if (!isMgr && req.user?.user_id) {
    const fullUser = await User.findOne({
      user_id: req.user.user_id,
      company_id: companyId,
    }).select("isManager");
    if (fullUser?.isManager) isMgr = true;
  }
  if (isMgr) {
    return MANAGER_STATUSES;
  }
  return [...LOGISTICS_STATUSES, ...MANAGER_STATUSES];
};

const isCategoryManagerRequest = async (req, companyId) => {
  if (req.user?.isSuperAdmin || isCompanyAdminUser(req)) return false;
  if (await isLogisticManagerRequest(req, companyId)) return false;

  let isMgr = req.user?.isManager === true;
  if (!isMgr && req.user?.user_id) {
    const fullUser = await User.findOne({
      user_id: req.user.user_id,
      company_id: companyId,
    }).select("isManager");
    if (fullUser?.isManager) isMgr = true;
  }
  return isMgr;
};

// Create order
exports.createOrder = async (req, res) => {
  try {
    const { customer, items, notes, attachment, deliveryCharges: deliveryChargesRaw, biltyCharges: biltyChargesRaw } = req.body;
    const companyId = req.headers['x-company-id'] || req.user?.company_id || "RESSICHEM";

    // ✅ Validate customer
    const customerExists = await Customer.findOne({ _id: customer, company_id: companyId });
    if (!customerExists) {
      return res.status(404).json({ message: "Customer not found" });
    }

    let subtotal = 0;
    let totalDeliveryCharges = 0;
    let totalBiltyCharges = 0;
    const orderItems = [];
    const categories = new Set();

    // Batch-fetch products to avoid N database queries during order creation.
    const uniqueProductIds = [...new Set((items || []).map((item) => String(item.product)))];
    const products = await Product.find({
      _id: { $in: uniqueProductIds },
      company_id: companyId,
    })
      .select("_id category")
      .lean();
    const productById = new Map(products.map((product) => [String(product._id), product]));

    // ✅ Validate products and collect categories
    for (const item of items) {
      const product = productById.get(String(item.product));
      if (!product) {
        return res.status(404).json({ message: `Product not found: ${item.product}` });
      }

      const itemDeliveryCharges = Math.max(0, Number(item.deliveryCharges || 0));
      const itemBiltyCharges = Math.max(0, Number(item.biltyCharges || 0));
      const total = item.quantity * item.unitPrice + itemDeliveryCharges + itemBiltyCharges;
      subtotal += total;
      totalDeliveryCharges += itemDeliveryCharges;
      totalBiltyCharges += itemBiltyCharges;

      // Collect categories
      if (product.category?.mainCategory) {
        categories.add(product.category.mainCategory);
      }

      orderItems.push({
        product: product._id,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        deliveryCharges: itemDeliveryCharges,
        biltyCharges: itemBiltyCharges,
        total,
        tdsLink: item.tdsLink || "", // Include TDS link if provided
      });
    }

    const tax = 0;
    const deliveryCharges = Math.max(0, Number(deliveryChargesRaw || totalDeliveryCharges || 0));
    const biltyCharges = Math.max(0, Number(biltyChargesRaw || totalBiltyCharges || 0));
    const total = subtotal + tax;

    // Generate unique order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    let normalizedAttachment = undefined;
    if (attachment) {
      const normalizedFileType = String(attachment?.fileType || "").toLowerCase();
      const isAllowedType =
        normalizedFileType.startsWith("image/") || normalizedFileType === "application/pdf";
      const maxSizeBytes = 10 * 1024 * 1024; // 10MB
      const fileSize = Number(attachment?.fileSize || 0);
      const dataUrl = String(attachment?.dataUrl || "");

      if (!isAllowedType) {
        return res.status(400).json({
          message: "Invalid attachment type. Only images and PDFs are allowed.",
        });
      }
      if (!fileSize || fileSize > maxSizeBytes) {
        return res.status(400).json({
          message: "Attachment too large. Maximum allowed size is 10MB.",
        });
      }
      if (!dataUrl.startsWith("data:")) {
        return res.status(400).json({
          message: "Invalid attachment format.",
        });
      }

      normalizedAttachment = {
        fileName: attachment.fileName || "attachment",
        fileType: attachment.fileType,
        fileSize,
        dataUrl,
        uploadedAt: attachment.uploadedAt ? new Date(attachment.uploadedAt) : new Date(),
      };
    }

    const order = new Order({
      orderNumber,
      customer,
      items: orderItems,
      subtotal,
      tax,
      deliveryCharges,
      biltyCharges,
      total,
      notes,
      customerNotes: notes,
      attachment: normalizedAttachment,
      createdBy: req.user ? req.user._id : null,
      company_id: companyId,
      categories: Array.from(categories),
      requiresApproval: categories.size > 0,
      statusHistory: [
        {
          fromStatus: null,
          toStatus: "pending",
          changedAt: new Date(),
          changedBy: req.user ? req.user._id : null,
          changedByEmail: req.user?.email || "",
          changedByName: req.user?.email || "System",
          reason: notes || "",
          source: req.user?.isCustomer ? "customer" : "admin",
        },
      ],
    });

    await order.save();

    // Populate customer for notifications
    await order.populate('customer', 'email companyName contactName');

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

    // Prepare createdBy information - use customer info if available, otherwise use req.user
    let createdBy = null;
    if (order.customer) {
      // Use customer information
      const customerName = order.customer.contactName || 
                          order.customer.companyName || 
                          order.customer.email || 
                          'Customer';
      createdBy = {
        _id: order.customer._id,
        name: customerName,
        email: order.customer.email,
        firstName: order.customer.contactName?.split(' ')[0] || null,
        lastName: order.customer.contactName?.split(' ').slice(1).join(' ') || null
      };
    } else if (req.user) {
      // Use req.user information - construct name from firstName/lastName if needed
      const userName = req.user.firstName && req.user.lastName
        ? `${req.user.firstName} ${req.user.lastName}`
        : req.user.name || req.user.email || 'User';
      createdBy = {
        _id: req.user._id,
        name: userName,
        email: req.user.email,
        firstName: req.user.firstName || null,
        lastName: req.user.lastName || null
      };
    } else {
      // Fallback to system
      createdBy = { 
        _id: 'system', 
        name: 'System', 
        email: 'system@ressichem.com' 
      };
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
      await categoryNotificationService.notifyOrderUpdate(order, 'created', createdBy);
    } catch (notificationError) {
      console.error("Failed to send category manager notifications:", notificationError);
      // Don't fail the order creation if notification fails
    }

    // Send notification about new order
    try {
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
    const requestedCompanyId = req.query?.company_id;
    let companyId;
    if (requestedCompanyId && String(requestedCompanyId).trim()) {
      companyId = String(requestedCompanyId).trim();
    } else if (req.user?.user_id) {
      const dbUser = await User.findOne({ user_id: req.user.user_id }).select("company_id").lean();
      companyId = String(dbUser?.company_id || req.user?.company_id || "RESSICHEM").trim();
    } else if (req.user?._id) {
      const dbUser = await User.findById(req.user._id).select("company_id").lean();
      companyId = String(dbUser?.company_id || req.user?.company_id || "RESSICHEM").trim();
    } else {
      companyId = String(req.headers['x-company-id'] || req.user?.company_id || "RESSICHEM").trim();
    }
    const companyIdEscaped = companyId.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const companyFilter = new RegExp(`^${companyIdEscaped}$`, "i");
    const requestedStatus = normalizeRoleName(req.query?.status || "");
    
    let canViewAllCompanyOrders = req.user?.isSuperAdmin || isCompanyAdminUser(req);

    // Check if user is a customer - if so, filter by their orders only
    let query = { company_id: companyFilter };
    let fullUser = null; // Declare outside to use later
    
    if (req.user && req.user.isCustomer) {
      // For customer users, find their customer record and filter orders
      const Customer = require('../models/Customer');
      let currentUserEmail = req.user?.email;
      if (!currentUserEmail && req.user?._id) {
        const currentUser = await User.findById(req.user._id).select('email').lean();
        currentUserEmail = currentUser?.email;
      }

      if (!currentUserEmail) {
        return res.json([]);
      }

      const customer = await Customer.findOne({
        email: currentUserEmail,
        company_id: companyId
      }).select('_id').lean();

      if (customer) {
        query.customer = customer._id;
      } else {
        return res.json([]); // Return empty array if customer not found
      }
    } else {

      // Check if user is a manager by querying the database
      // (JWT token doesn't include isManager, so we need to check the database)
      fullUser = await User.findOne({ 
        user_id: req.user?.user_id, 
        company_id: companyId 
      }).select('isManager managerProfile _id role roles isCompanyAdmin isSuperAdmin');

      // Some accounts store role as "companyadmin" (without space/underscore).
      const dbRole = normalizeRoleName(fullUser?.role);
      const dbRoles = Array.isArray(fullUser?.roles) ? fullUser.roles.map(normalizeRoleName) : [];
      const isDbCompanyAdmin =
        fullUser?.isCompanyAdmin === true ||
        dbRole === "company admin" ||
        dbRole === "company_admin" ||
        dbRole === "companyadmin" ||
        dbRoles.includes("company admin") ||
        dbRoles.includes("company_admin") ||
        dbRoles.includes("companyadmin");
      if (isDbCompanyAdmin || fullUser?.isSuperAdmin) {
        canViewAllCompanyOrders = true;
      }

      const fullUserRole = normalizeRoleName(fullUser?.role);
      const fullUserRoles = Array.isArray(fullUser?.roles) ? fullUser.roles.map(normalizeRoleName) : [];
      const isLogisticUser =
        !canViewAllCompanyOrders &&
        (isLogisticManagerUser(req) ||
          fullUserRole === "logistic manager" ||
          fullUserRole === "logistic_manager" ||
          fullUserRole === "logistic" ||
          fullUserRoles.includes("logistic manager") ||
          fullUserRoles.includes("logistic_manager") ||
          fullUserRoles.includes("logistic"));

      if (isLogisticUser) {
        // Logistics board: approved orders are actionable, while dispatch/hold remain visible for tracking.
        query = {
          company_id: companyFilter,
          status: { $in: LOGISTICS_VISIBLE_STATUSES },
        };
        console.log(`🚚 Logistic manager ${req.user?.email}: returning logistics-visible orders (${LOGISTICS_VISIBLE_STATUSES.join(", ")})`);
      }
      
      // Company admins / super admins should always see all company orders,
      // even if their DB user record also has isManager=true.
      else if (!canViewAllCompanyOrders && fullUser && fullUser.isManager) {
        // For manager users, use OrderItemApproval as primary source (most reliable)
        console.log(`🔍 Manager user detected: ${req.user?.email}, user_id: ${req.user?.user_id}, User._id: ${fullUser._id}`);
        
        let managerCategories = [];
        
        // Check User.managerProfile.assignedCategories first
        if (fullUser.managerProfile && fullUser.managerProfile.assignedCategories) {
          managerCategories = Array.isArray(fullUser.managerProfile.assignedCategories) 
            ? fullUser.managerProfile.assignedCategories 
            : [];
          console.log(`🔍 Manager categories from User.managerProfile:`, managerCategories);
        }
        
        // If User.managerProfile.assignedCategories is empty, check Manager record
        if (managerCategories.length === 0) {
          const manager = await Manager.findOne({ 
            user_id: req.user.user_id, 
            company_id: companyId 
          });
          
          if (manager && manager.assignedCategories && manager.assignedCategories.length > 0) {
            // Extract category names from Manager.assignedCategories array
            managerCategories = manager.assignedCategories.map(cat => {
              if (typeof cat === 'string') return cat;
              return cat.category || cat;
            });
            console.log(`🔍 Manager categories from Manager record:`, managerCategories);
          } else {
            console.log(`⚠️ No Manager record found or no assigned categories for user ${req.user.user_id}`);
          }
        }
        
        // PRIMARY METHOD: Use OrderItemApproval to find orders assigned to this manager
        const OrderItemApproval = require('../models/OrderItemApproval');
        console.log(`🔍 Looking for approvals with assignedManager: ${fullUser._id} (User._id from database)`);
        console.log(`🔍 Manager email: ${req.user?.email}, user_id: ${req.user?.user_id}`);
        console.log(`🔍 Company ID: ${companyId}`);
        
        const approvalOrderIds = await OrderItemApproval.find({
          assignedManager: fullUser._id, // Use fullUser._id (User._id) not req.user._id
          company_id: companyId
        }).distinct('orderId');
        
        console.log(`✅ Found ${approvalOrderIds.length} unique orders via item approvals for manager ${req.user?.email}`);
        if (approvalOrderIds.length > 0) {
          console.log(`   Order IDs: ${approvalOrderIds.map(id => id.toString()).join(', ')}`);
        }
        
        if (approvalOrderIds.length > 0) {
          // Use orders from approvals
          query = {
            _id: { $in: approvalOrderIds },
            company_id: companyFilter
          };
          console.log(`📋 Query built:`, JSON.stringify(query, null, 2));
          console.log(`📋 Using ${approvalOrderIds.length} orders from item approvals`);
        } else if (managerCategories.length > 0) {
          // FALLBACK: Use normalized category matching if no approvals found
          console.log(`⚠️ No item approvals found, falling back to normalized category matching`);
          
          // Normalize category name function
          const normalizeCategory = (cat) => {
            if (!cat || typeof cat !== 'string') return '';
            return cat.toLowerCase().trim()
              .replace(/\s*&\s*/g, ' and ')
              .replace(/\s+/g, ' ');
          };
          
          // Normalize manager categories
          const normalizedManagerCategories = managerCategories.map(cat => 
            normalizeCategory(typeof cat === 'string' ? cat : (cat.category || cat))
          );
          
          console.log(`🔍 Normalized manager categories:`, normalizedManagerCategories);
          
          // Get all orders and filter by normalized category matching
          const allOrders = await Order.find({ company_id: companyId })
            .select('_id categories')
            .lean();
          
          const matchingOrderIds = allOrders
            .filter(order => {
              if (!order.categories || order.categories.length === 0) return false;
              return order.categories.some(orderCat => {
                const normalizedOrderCat = normalizeCategory(orderCat);
                return normalizedManagerCategories.some(managerCat => 
                  normalizedOrderCat === managerCat ||
                  normalizedOrderCat.includes(managerCat) ||
                  managerCat.includes(normalizedOrderCat)
                );
              });
            })
            .map(order => order._id);
          
          query = {
            _id: { $in: matchingOrderIds },
            company_id: companyFilter
          };
          console.log(`✅ Found ${matchingOrderIds.length} orders via normalized category matching`);
        } else {
          console.log(`⚠️ Manager ${req.user?.email} has no assigned categories - returning empty result`);
          query = { company_id: companyFilter, _id: null }; // Return no orders
        }
      } else if (canViewAllCompanyOrders) {
        console.log(`🔓 Admin-level access for ${req.user?.email}: returning all company orders`);
      }
    }

    // Optional explicit status filter for admin/staff/customer views.
    // (Logistics query is forced to approved above.)
    if (requestedStatus && requestedStatus !== "all" && query.status === undefined) {
      query.status = requestedStatus;
    }
    
    let orders = await Order.find(query)
      .populate("customer", "companyName contactName email")
      .populate("items.product", "name price category")
      .populate("createdBy", "email firstName lastName")
      .sort({ createdAt: -1 })
      .lean();

    // For admin-level views, include assigned manager names/emails for each customer
    // so company admin / super admin can see who owns each customer's orders.
    if (canViewAllCompanyOrders && orders.length > 0) {
      const customerIds = [
        ...new Set(
          orders
            .map((order) => order.customer?._id?.toString())
            .filter(Boolean)
        ),
      ];

      if (customerIds.length > 0) {
        const customers = await Customer.find({
          _id: { $in: customerIds },
          company_id: companyId,
        })
          .select("assignedManager assignedManagers")
          .lean();

        const customerById = new Map();
        const managerIds = new Set();

        for (const customer of customers) {
          const customerId = customer._id.toString();
          customerById.set(customerId, customer);

          if (customer.assignedManager?.manager_id) {
            managerIds.add(customer.assignedManager.manager_id.toString());
          }

          if (Array.isArray(customer.assignedManagers)) {
            for (const assigned of customer.assignedManagers) {
              if (assigned?.manager_id) {
                managerIds.add(assigned.manager_id.toString());
              }
            }
          }
        }

        const managers = await Manager.find({
          _id: { $in: Array.from(managerIds) },
          company_id: companyId,
        })
          .select("_id user_id")
          .lean();

        const userIds = [
          ...new Set(managers.map((manager) => manager.user_id).filter(Boolean)),
        ];

        const users = await User.find({
          user_id: { $in: userIds },
          company_id: companyId,
        })
          .select("user_id email firstName lastName")
          .lean();

        const userByUserId = new Map(users.map((user) => [user.user_id, user]));
        const managerLabelById = new Map();

        for (const manager of managers) {
          const user = userByUserId.get(manager.user_id);
          if (!user) continue;

          const fullName = `${user.firstName || ""} ${user.lastName || ""}`.trim();
          const label = fullName ? `${fullName} (${user.email})` : user.email;
          managerLabelById.set(manager._id.toString(), label || manager.user_id);
        }

        const orderIds = orders.map((order) => order._id);
        const OrderItemApproval = require("../models/OrderItemApproval");
        const orderApprovalRows = await OrderItemApproval.find({
          orderId: { $in: orderIds },
          company_id: companyId,
          assignedManager: { $ne: null },
        })
          .select("orderId assignedManager")
          .lean();

        const approvalManagerIds = [
          ...new Set(
            orderApprovalRows
              .map((row) => row.assignedManager?.toString())
              .filter(Boolean)
          ),
        ];

        const approvalUsers = approvalManagerIds.length
          ? await User.find({
              _id: { $in: approvalManagerIds },
              company_id: companyId,
            })
              .select("_id email firstName lastName")
              .lean()
          : [];

        const approvalUserLabelById = new Map(
          approvalUsers.map((user) => {
            const fullName = `${user.firstName || ""} ${user.lastName || ""}`.trim();
            const label = fullName ? `${fullName} (${user.email})` : user.email;
            return [user._id.toString(), label || user._id.toString()];
          })
        );

        const approvalManagersByOrderId = new Map();
        for (const row of orderApprovalRows) {
          const orderId = row.orderId?.toString();
          const managerId = row.assignedManager?.toString();
          if (!orderId || !managerId) continue;
          if (!approvalManagersByOrderId.has(orderId)) {
            approvalManagersByOrderId.set(orderId, new Set());
          }
          approvalManagersByOrderId
            .get(orderId)
            .add(approvalUserLabelById.get(managerId) || managerId);
        }

        orders = orders.map((order) => {
          const plainOrder = order;
          const customerId = plainOrder.customer?._id?.toString();
          const customerRecord = customerById.get(customerId);
          const managerLabels = new Set();
          const orderApprovalManagerLabels =
            approvalManagersByOrderId.get(plainOrder._id.toString()) || new Set();

          if (customerRecord?.assignedManager?.manager_id) {
            const managerId = customerRecord.assignedManager.manager_id.toString();
            managerLabels.add(managerLabelById.get(managerId) || managerId);
          }

          if (Array.isArray(customerRecord?.assignedManagers)) {
            for (const assigned of customerRecord.assignedManagers) {
              if (!assigned?.manager_id) continue;
              const managerId = assigned.manager_id.toString();
              managerLabels.add(managerLabelById.get(managerId) || managerId);
            }
          }

          if (plainOrder.customer) {
            plainOrder.customer.assignedManagerNames = Array.from(managerLabels);
          }
          plainOrder.orderApprovalManagerNames = Array.from(orderApprovalManagerLabels);

          return plainOrder;
        });
      }
    }
    
    // For managers, the query above already filtered by OrderItemApproval or normalized categories
    // So we don't need additional filtering here - the orders are already correct
    // But we can add a final verification if needed
    if (req.user && fullUser && fullUser.isManager) {
      console.log(`✅ Manager ${req.user?.email}: Returning ${orders.length} orders (already filtered by approvals/categories)`);
    } else if (isLogisticManagerUser(req)) {
      console.log(`✅ Logistic manager ${req.user?.email}: Returning ${orders.length} logistics-visible orders`);
    }

    console.log(`📊 Found ${orders.length} orders for user ${req.user?.email || 'anonymous'}`);
    res.json(orders);
  } catch (err) {
    console.error("Error fetching orders:", err);
    res.status(500).json({ message: "Error fetching orders", error: err.message });
  }
};

// Get order by ID
exports.getOrderById = async (req, res) => {
  try {
    const companyId = req.headers['x-company-id'] || req.user?.company_id || "RESSICHEM";
    const order = await Order.findById(req.params.id)
      .populate("customer", "companyName contactName email")
      .populate("items.product", "name price category");
    
    if (!order) return res.status(404).json({ message: "Order not found" });

    const orderCompanyId = order.company_id || companyId;
    if (
      !(req.user?.isSuperAdmin || isCompanyAdminUser(req)) &&
      (await isLogisticManagerRequest(req, orderCompanyId))
    ) {
      const st = String(order.status || "").toLowerCase();
      if (!LOGISTICS_VISIBLE_STATUSES.includes(st)) {
        return res.status(403).json({
          message: `Logistics can only view orders that are in: ${LOGISTICS_VISIBLE_STATUSES.join(", ")} status.`,
        });
      }
    }
    
    // Check if user is a manager and filter items by assigned categories
    let isManager = req.user?.isManager === true;
    let managerCategories = [];
    
    // If flags not in JWT, check database (for backward compatibility with old tokens)
    if (!isManager && req.user?.user_id) {
      const fullUser = await User.findOne({ 
        user_id: req.user.user_id, 
        company_id: companyId 
      }).select('isManager managerProfile');
      
      if (fullUser && fullUser.isManager) {
        isManager = true;
        if (fullUser.managerProfile && fullUser.managerProfile.assignedCategories) {
          managerCategories = Array.isArray(fullUser.managerProfile.assignedCategories) 
            ? fullUser.managerProfile.assignedCategories 
            : [];
        }
      }
    } else if (isManager) {
      // Get categories from JWT or database
      managerCategories = req.user?.managerProfile?.assignedCategories || [];
    }
    
    // If manager has no categories in user profile, check Manager record
    if (isManager && managerCategories.length === 0) {
      const manager = await Manager.findOne({ 
        user_id: req.user.user_id, 
        company_id: companyId 
      });
      
      if (manager && manager.assignedCategories && manager.assignedCategories.length > 0) {
        managerCategories = manager.assignedCategories.map(cat => {
          if (typeof cat === 'string') return cat;
          return cat.category || cat;
        });
        console.log(`🔍 Manager categories from Manager record for order view:`, managerCategories);
      }
    }
    
    // Filter items for managers - only show items assigned to them via OrderItemApproval
    if (isManager && managerCategories.length > 0) {
      // Get all OrderItemApproval entries for this order assigned to this manager
      const OrderItemApproval = require('../models/OrderItemApproval');
      const itemApprovals = await OrderItemApproval.find({
        orderId: order._id,
        assignedManager: req.user._id,
        company_id: companyId
      });
      
      console.log(`🔍 Manager ${req.user?.email} viewing order ${order.orderNumber}:`);
      console.log(`   Found ${itemApprovals.length} item approval entries assigned to this manager`);
      console.log(`   Order has ${order.items.length} total items`);
      
      // Create a map of itemIndex to approval entry
      const approvalMap = new Map();
      itemApprovals.forEach(approval => {
        approvalMap.set(approval.itemIndex, approval);
      });
      
      const normalizeCategory = (value) =>
        String(value || "")
          .toLowerCase()
          .trim()
          .replace(/\s*&\s*/g, " and ")
          .replace(/\s+and\s+/g, " and ")
          .replace(/\bspeciality\b/g, "specialty")
          .replace(/\s+/g, " ");
      const normalizedManagerCategories = managerCategories.map(normalizeCategory).filter(Boolean);

      // Filter items for manager:
      // - include items explicitly assigned via approval rows
      // - also include category-matching items (fallback for newly added rows)
      const filteredItems = order.items.filter((item, index) => {
        const hasApprovalEntry = approvalMap.has(index);
        if (!item.product?.category) {
          console.log(`   ⚠️ Item ${index} has no category`);
          return false;
        }

        const productCategoryRaw =
          typeof item.product.category === "string"
            ? item.product.category
            : item.product.category?.mainCategory ||
              item.product.category?.subCategory ||
              item.product.category?.subSubCategory ||
              "";
        const normalizedProductCategory = normalizeCategory(productCategoryRaw);
        const categoryMatches = normalizedManagerCategories.some(
          (managerCat) =>
            normalizedProductCategory === managerCat ||
            normalizedProductCategory.includes(managerCat) ||
            managerCat.includes(normalizedProductCategory)
        );

        if (!hasApprovalEntry && !categoryMatches) {
          console.log(`   ⚠️ Item ${index} (${item.product?.name}) not assigned/category-matched for manager ${req.user?.email}`);
          return false;
        }
        if (!categoryMatches) {
          console.log(`   ⚠️ Item ${index} category doesn't match manager's categories`);
        }
        return true;
      });
      
      console.log(`   ✅ Filtered to ${filteredItems.length} items assigned to this manager`);
      
      // Return order with filtered items
      const filteredOrder = order.toObject();
      filteredOrder.items = filteredItems;
      
      return res.json(filteredOrder);
    }
    
    // For non-managers or managers without categories, return full order
    res.json(order);
  } catch (err) {
    console.error("Error fetching order by ID:", err);
    res.status(500).json({ message: "Error fetching order", error: err.message });
  }
};

// Update order status
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status, comments, discountAmount, partialShipmentItems } = req.body;
    const oldOrder = await Order.findById(req.params.id);
    if (!oldOrder) return res.status(404).json({ message: "Order not found" });

    const companyId = oldOrder.company_id || req.headers["x-company-id"] || req.user?.company_id || "RESSICHEM";
    const allowedStatuses = await getAllowedStatusesForUserAsync(req, companyId);
    if (status && !allowedStatuses.includes(String(status).toLowerCase())) {
      return res.status(400).json({ message: `Invalid status. Allowed statuses are: ${allowedStatuses.join(", ")}.` });
    }
    if (String(status || "").toLowerCase() === "hold" && !String(comments || "").trim()) {
      return res.status(400).json({
        message: "Reason is required when setting status to hold.",
      });
    }

    if (status && (await isLogisticManagerRequest(req, companyId))) {
      if (Number(discountAmount || 0) > 0) {
        return res.status(403).json({
          message: "Logistics managers are not allowed to apply discounts.",
        });
      }
      const oldS = String(oldOrder.status || "").toLowerCase();
      const newS = String(status).toLowerCase();
      if (!["approved", "hold", "partial_shipment"].includes(oldS)) {
        return res.status(403).json({
          message: "Logistics can only update orders that are in approved, hold, or partial_shipment status.",
        });
      }
      if (!LOGISTICS_STATUSES.includes(newS)) {
        return res.status(400).json({
          message: `Logistics can only set status to: ${LOGISTICS_STATUSES.join(", ")}.`,
        });
      }
      if (["hold", "dispatch", "partial_shipment"].includes(newS) && !String(comments || "").trim()) {
        return res.status(400).json({
          message: "Reason is required when setting status to hold, dispatch, or partial_shipment.",
        });
      }
      if (newS === "partial_shipment") {
        if (!Array.isArray(partialShipmentItems) || partialShipmentItems.length === 0) {
          return res.status(400).json({
            message: "Partial shipment item details are required.",
          });
        }
      }
    }

    if (status && (await isCategoryManagerRequest(req, companyId))) {
      const oldS = String(oldOrder.status || "").toLowerCase();
      const newS = String(status).toLowerCase();
      if (oldS !== "pending") {
        return res.status(403).json({
          message: "Managers can only update orders that are in pending status.",
        });
      }
      if (!MANAGER_STATUSES.includes(newS)) {
        return res.status(400).json({
          message: `Managers can only set status to: ${MANAGER_STATUSES.join(", ")}.`,
        });
      }
    }

    // Prepare update data
    const updateData = {};
    const actorMeta = getActorMeta(req);
    const nextStatus = status ? String(status).toLowerCase() : String(oldOrder.status || "").toLowerCase();
    if (status) {
      updateData.status = nextStatus;
    }
    if (String(status || "").toLowerCase() === "hold" && String(comments || "").trim()) {
      const holdReason = String(comments).trim();
      const currentRemarks = Array.isArray(oldOrder.logisticsRemarks) ? [...oldOrder.logisticsRemarks] : [];
      currentRemarks.push({
        status: "hold",
        remark: holdReason,
        createdAt: new Date(),
        createdBy: actorMeta.userId,
        createdByEmail: actorMeta.email,
        createdByName: actorMeta.name,
      });
      updateData.logisticsRemarks = currentRemarks;
    } else if (
      String(status || "").toLowerCase() === "dispatch" &&
      String(comments || "").trim()
    ) {
      const dispatchRemark = String(comments).trim();
      const normalizedDispatchItems = Array.isArray(partialShipmentItems)
        ? partialShipmentItems
          .map((item) => {
            const orderedQuantity = Number(item?.orderedQuantity);
            const shippedQuantity = Number(item?.shippedQuantity);
            const remainingQuantity = Number(item?.remainingQuantity);
            const safeOrdered = Number.isFinite(orderedQuantity) ? orderedQuantity : 0;
            const safeShipped = Number.isFinite(shippedQuantity) ? shippedQuantity : 0;
            const safeRemaining = Number.isFinite(remainingQuantity)
              ? remainingQuantity
              : Math.max(safeOrdered - safeShipped, 0);
            return {
              productId: item?.productId || undefined,
              productName: String(item?.productName || "").trim(),
              orderedQuantity: safeOrdered,
              shippedQuantity: safeShipped,
              remainingQuantity: safeRemaining,
            };
          })
          .filter((item) =>
            (item.productId || item.productName) &&
            item.orderedQuantity >= 0 &&
            item.shippedQuantity >= 0 &&
            item.remainingQuantity >= 0 &&
            item.shippedQuantity <= item.orderedQuantity &&
            item.remainingQuantity === item.orderedQuantity - item.shippedQuantity
          )
        : [];
      const currentRemarks = Array.isArray(oldOrder.logisticsRemarks) ? [...oldOrder.logisticsRemarks] : [];
      currentRemarks.push({
        status: "dispatch",
        remark: dispatchRemark,
        ...(normalizedDispatchItems.length ? { partialShipmentItems: normalizedDispatchItems } : {}),
        createdAt: new Date(),
        createdBy: actorMeta.userId,
        createdByEmail: actorMeta.email,
        createdByName: actorMeta.name,
      });
      updateData.logisticsRemarks = currentRemarks;
    } else if (
      String(status || "").toLowerCase() === "partial_shipment" &&
      String(comments || "").trim()
    ) {
      const partialShipmentRemark = String(comments).trim();
      const normalizedPartialItems = Array.isArray(partialShipmentItems)
        ? partialShipmentItems
          .map((item) => {
            const orderedQuantity = Number(item?.orderedQuantity);
            const shippedQuantity = Number(item?.shippedQuantity);
            const remainingQuantity = Number(item?.remainingQuantity);
            const safeOrdered = Number.isFinite(orderedQuantity) ? orderedQuantity : 0;
            const safeShipped = Number.isFinite(shippedQuantity) ? shippedQuantity : 0;
            const safeRemaining = Number.isFinite(remainingQuantity)
              ? remainingQuantity
              : Math.max(safeOrdered - safeShipped, 0);
            return {
              productId: item?.productId || undefined,
              productName: String(item?.productName || "").trim(),
              orderedQuantity: safeOrdered,
              shippedQuantity: safeShipped,
              remainingQuantity: safeRemaining,
            };
          })
          .filter((item) =>
            (item.productId || item.productName) &&
            item.orderedQuantity > 0 &&
            item.shippedQuantity >= 0 &&
            item.remainingQuantity >= 0 &&
            item.shippedQuantity <= item.orderedQuantity &&
            item.remainingQuantity === item.orderedQuantity - item.shippedQuantity
          )
        : [];

      if (!normalizedPartialItems.length) {
        return res.status(400).json({
          message: "Provide valid partial shipment quantities (shipped and remaining) for at least one item.",
        });
      }

      const shippedAny = normalizedPartialItems.some((item) => item.shippedQuantity > 0);
      const hasRemainingAny = normalizedPartialItems.some((item) => item.remainingQuantity > 0);
      if (!shippedAny || !hasRemainingAny) {
        return res.status(400).json({
          message: "Partial shipment requires at least one shipped quantity and at least one remaining quantity.",
        });
      }

      const currentRemarks = Array.isArray(oldOrder.logisticsRemarks) ? [...oldOrder.logisticsRemarks] : [];
      currentRemarks.push({
        status: "partial_shipment",
        remark: partialShipmentRemark,
        partialShipmentItems: normalizedPartialItems,
        createdAt: new Date(),
        createdBy: actorMeta.userId,
        createdByEmail: actorMeta.email,
        createdByName: actorMeta.name,
      });
      updateData.logisticsRemarks = currentRemarks;
    }

    if (status && String(oldOrder.status || "").toLowerCase() !== nextStatus) {
      const currentStatusHistory = Array.isArray(oldOrder.statusHistory) ? [...oldOrder.statusHistory] : [];
      currentStatusHistory.push({
        fromStatus: String(oldOrder.status || "").toLowerCase(),
        toStatus: nextStatus,
        changedAt: new Date(),
        changedBy: actorMeta.userId,
        changedByEmail: actorMeta.email,
        changedByName: actorMeta.name,
        reason: String(comments || "").trim(),
        source: actorMeta.source,
      });
      updateData.statusHistory = currentStatusHistory;
    }
    
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

    // Fire notifications asynchronously so status API responds immediately.
    try {
      const updatedBy = req.user ? {
        _id: req.user._id,
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        email: req.user.email,
        name: req.user.firstName && req.user.lastName ? `${req.user.firstName} ${req.user.lastName}` : req.user.email
      } : { _id: 'system', name: 'System', email: 'system@ressichem.com' };
      Promise.resolve(
        notificationTriggerService.triggerOrderStatusChanged(order, updatedBy, oldOrder.status, status)
      ).catch((notificationError) => {
        console.error("Failed to send order status change notification:", notificationError);
      });
    } catch (notificationError) {
      console.error("Failed to queue order status change notification:", notificationError);
    }

    res.json(order);
  } catch (err) {
    res.status(500).json({ message: "Error updating order", error: err.message });
  }
};

// Update order (general update)
exports.updateOrder = async (req, res) => {
  try {
    const { status, notes, subtotal, tax, total, attachment, items, deliveryCharges, biltyCharges } = req.body;
    const companyId = req.headers['x-company-id'] || req.user?.company_id || "RESSICHEM";
    
    const oldOrder = await Order.findOne({ _id: req.params.id, company_id: companyId });
    if (!oldOrder) return res.status(404).json({ message: "Order not found" });

    const isLogisticsRequest = await isLogisticManagerRequest(req, companyId);
    if (isLogisticsRequest) {
      const attemptedNonStatusUpdate =
        notes !== undefined ||
        subtotal !== undefined ||
        tax !== undefined ||
        total !== undefined ||
        deliveryCharges !== undefined ||
        biltyCharges !== undefined ||
        attachment !== undefined ||
        Array.isArray(items);
      if (attemptedNonStatusUpdate) {
        return res.status(403).json({
          message: "Logistics managers can only update order status.",
        });
      }
      if (status === undefined) {
        return res.status(400).json({
          message: "Status is required for logistics updates.",
        });
      }
    }

    // Prepare update object
    const updateData = {};
    if (status !== undefined) {
      const normalizedStatus = String(status).toLowerCase();
      const allowedStatuses = await getAllowedStatusesForUserAsync(req, companyId);
      console.log("🔍 updateOrder status validation:", {
        incomingStatus: status,
        normalizedStatus,
        allowedStatuses,
        isManager: req.user?.isManager,
        role: req.user?.role,
        roles: req.user?.roles,
        email: req.user?.email
      });
      if (!allowedStatuses.includes(normalizedStatus)) {
        return res.status(400).json({ message: `Invalid status. Allowed statuses are: ${allowedStatuses.join(", ")}.` });
      }
      if (await isLogisticManagerRequest(req, companyId)) {
        const oldS = String(oldOrder.status || "").toLowerCase();
        if (!["approved", "hold", "partial_shipment"].includes(oldS)) {
          return res.status(403).json({
            message: "Logistics can only update orders that are in approved, hold, or partial_shipment status.",
          });
        }
        if (!LOGISTICS_STATUSES.includes(normalizedStatus)) {
          return res.status(400).json({
            message: `Logistics can only set status to: ${LOGISTICS_STATUSES.join(", ")}.`,
          });
        }
      }
      if (await isCategoryManagerRequest(req, companyId)) {
        const oldS = String(oldOrder.status || "").toLowerCase();
        if (!["pending", "processing"].includes(oldS)) {
          return res.status(403).json({
            message: "Managers can only update orders that are in pending or processing status.",
          });
        }
        if (!MANAGER_STATUSES.includes(normalizedStatus)) {
          return res.status(400).json({
            message: `Managers can only set status to: ${MANAGER_STATUSES.join(", ")}.`,
          });
        }
      }
      updateData.status = normalizedStatus;
    }
    if (notes !== undefined) updateData.notes = notes;
    let managerAddedItemsMeta = [];
    if (Array.isArray(items)) {
      const normalizedItems = items.map((item) => {
        const quantity = Math.max(1, Number(item?.quantity || 1));
        const unitPrice = Math.max(0, Number(item?.unitPrice || 0));
        const lineDeliveryCharges = Math.max(0, Number(item?.deliveryCharges || 0));
        const lineBiltyCharges = Math.max(0, Number(item?.biltyCharges || 0));
        const productId = item?.product?._id || item?.product;
        return {
          _id: item?._id || undefined,
          product: productId,
          quantity,
          unitPrice,
          deliveryCharges: lineDeliveryCharges,
          biltyCharges: lineBiltyCharges,
          total: quantity * unitPrice + lineDeliveryCharges + lineBiltyCharges,
          tdsLink: item?.tdsLink || "",
        };
      });

      const hasInvalidItem = normalizedItems.some((item) => !item.product);
      if (hasInvalidItem) {
        return res.status(400).json({ message: "Each order item must include a valid product id." });
      }

      // Strict item-level RBAC for category managers.
      // Managers may edit assigned rows and add/remove only within their assigned categories.
      if (await isCategoryManagerRequest(req, companyId)) {
        const fullUser = req.user?.user_id
          ? await User.findOne({
              user_id: req.user.user_id,
              company_id: companyId,
            }).select("_id managerProfile user_id")
          : null;

        if (!fullUser?._id) {
          return res.status(403).json({ message: "Manager profile not found for item-level edit authorization." });
        }

        const editableRows = await OrderItemApproval.find({
          orderId: oldOrder._id,
          assignedManager: fullUser._id,
          company_id: companyId,
        })
          .select("itemIndex")
          .lean();
        const editableIndices = new Set(editableRows.map((row) => Number(row.itemIndex)));
        const managerCategoriesRaw = Array.isArray(fullUser.managerProfile?.assignedCategories)
          ? fullUser.managerProfile.assignedCategories
          : [];
        let managerCategories = managerCategoriesRaw
          .map((cat) =>
            typeof cat === "string"
              ? cat
              : cat?.category || cat?.name || ""
          )
          .filter(Boolean);
        if (managerCategories.length === 0) {
          const managerRecord = await Manager.findOne({
            user_id: fullUser.user_id || req.user?.user_id,
            company_id: companyId,
          }).select("assignedCategories");
          if (managerRecord?.assignedCategories?.length) {
            managerCategories = managerRecord.assignedCategories
              .map((cat) => (typeof cat === "string" ? cat : cat?.category || cat?.name || ""))
              .filter(Boolean);
          }
        }
        const normalizeCategory = (value) =>
          String(value || "")
            .toLowerCase()
            .trim()
            .replace(/\s*&\s*/g, " and ")
            .replace(/\s+and\s+/g, " and ")
            .replace(/\bspeciality\b/g, "specialty")
            .replace(/\s+/g, " ");
        const normalizedManagerCategories = managerCategories.map(normalizeCategory).filter(Boolean);
        if (normalizedManagerCategories.length === 0) {
          return res.status(403).json({
            message: "No assigned categories found for manager; item add/edit is blocked.",
          });
        }

        const oldItems = Array.isArray(oldOrder.items) ? oldOrder.items : [];
        if (normalizedItems.length < oldItems.length) {
          return res.status(403).json({
            message: "Managers cannot remove existing order items; only add new category-allowed items.",
          });
        }

        for (let index = 0; index < oldItems.length; index++) {
          const oldItem = oldItems[index];
          const nextItem = normalizedItems[index];
          if (!nextItem) {
            return res.status(403).json({ message: "Invalid item update payload." });
          }

          const oldProductId = String(oldItem?.product || "");
          const nextProductId = String(nextItem.product || "");
          if (oldProductId !== nextProductId) {
            return res.status(403).json({
              message: "Managers cannot change product mapping for existing order items.",
            });
          }

          const oldQuantity = Number(oldItem?.quantity || 0);
          const oldUnitPrice = Number(oldItem?.unitPrice || 0);
          const oldDeliveryCharges = Number(oldItem?.deliveryCharges || 0);
          const oldBiltyCharges = Number(oldItem?.biltyCharges || 0);
          const changedByManager =
            oldQuantity !== Number(nextItem.quantity) ||
            oldUnitPrice !== Number(nextItem.unitPrice) ||
            oldDeliveryCharges !== Number(nextItem.deliveryCharges || 0) ||
            oldBiltyCharges !== Number(nextItem.biltyCharges || 0) ||
            String(oldItem?.tdsLink || "") !== String(nextItem.tdsLink || "");

          if (changedByManager && !editableIndices.has(index)) {
            return res.status(403).json({
              message: `You can edit only your assigned items. Item ${index + 1} is locked.`,
            });
          }
        }

        const newItems = normalizedItems.slice(oldItems.length);
        if (newItems.length > 0) {
          const newProductIds = [...new Set(newItems.map((item) => String(item.product || "").trim()).filter(Boolean))];
          const productDocs = await Product.find({
            _id: { $in: newProductIds },
            company_id: companyId,
          }).select("_id category");
          const productById = new Map(productDocs.map((p) => [String(p._id), p]));

          for (let i = 0; i < newItems.length; i++) {
            const newItem = newItems[i];
            const productId = String(newItem.product || "").trim();
            const productDoc = productById.get(productId);
            if (!productDoc) {
              return res.status(400).json({ message: "Invalid product in new manager-added item." });
            }
            const rawCategory =
              typeof productDoc.category === "string"
                ? productDoc.category
                : productDoc.category?.mainCategory || "";
            const normalizedProductCategory = normalizeCategory(rawCategory);
            const allowed = normalizedManagerCategories.some(
              (managerCat) =>
                normalizedProductCategory === managerCat ||
                normalizedProductCategory.includes(managerCat) ||
                managerCat.includes(normalizedProductCategory)
            );
            if (!allowed) {
              return res.status(403).json({
                message: "Managers can only add items from their assigned categories.",
              });
            }
            managerAddedItemsMeta.push({
              itemIndex: oldItems.length + i,
              productId,
              category: rawCategory,
              originalAmount: Number(newItem.total || 0),
            });
          }
        }
      }

      updateData.items = normalizedItems;
      const recalculatedSubtotal = normalizedItems.reduce(
        (sum, item) => sum + Number(item.total || 0),
        0
      );
      const recalculatedDeliveryCharges = normalizedItems.reduce(
        (sum, item) => sum + Number(item.deliveryCharges || 0),
        0
      );
      const recalculatedBiltyCharges = normalizedItems.reduce(
        (sum, item) => sum + Number(item.biltyCharges || 0),
        0
      );
      updateData.subtotal = recalculatedSubtotal;
      updateData.tax = 0; // Tax is removed from this workflow.
      updateData.deliveryCharges = recalculatedDeliveryCharges;
      updateData.biltyCharges = recalculatedBiltyCharges;
      updateData.total = recalculatedSubtotal;
      updateData.totalDiscount = 0;
      updateData.finalTotal = updateData.total;
    } else {
      if (subtotal !== undefined) updateData.subtotal = subtotal;
      if (tax !== undefined) updateData.tax = tax;
      if (total !== undefined) updateData.total = total;
      if (deliveryCharges !== undefined) updateData.deliveryCharges = Math.max(0, Number(deliveryCharges || 0));
      if (biltyCharges !== undefined) updateData.biltyCharges = Math.max(0, Number(biltyCharges || 0));
    }
    if (attachment !== undefined) {
      if (attachment === null) {
        updateData.attachment = null;
      } else {
        const normalizedFileType = String(attachment?.fileType || "").toLowerCase();
        const isAllowedType =
          normalizedFileType.startsWith("image/") || normalizedFileType === "application/pdf";
        const maxSizeBytes = 10 * 1024 * 1024; // 10MB
        const fileSize = Number(attachment?.fileSize || 0);
        const dataUrl = String(attachment?.dataUrl || "");

        if (!isAllowedType) {
          return res.status(400).json({
            message: "Invalid attachment type. Only images and PDFs are allowed.",
          });
        }
        if (!fileSize || fileSize > maxSizeBytes) {
          return res.status(400).json({
            message: "Attachment too large. Maximum allowed size is 10MB.",
          });
        }
        if (!dataUrl.startsWith("data:")) {
          return res.status(400).json({
            message: "Invalid attachment format.",
          });
        }

        updateData.attachment = {
          fileName: attachment.fileName || "attachment",
          fileType: attachment.fileType,
          fileSize,
          dataUrl,
          uploadedAt: attachment.uploadedAt ? new Date(attachment.uploadedAt) : new Date(),
        };
      }
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate('customer', 'companyName contactName email');

    if (managerAddedItemsMeta.length > 0) {
      const approvalsToCreate = [];
      for (const row of managerAddedItemsMeta) {
        const managers = await itemApprovalService.getManagersForCategory(
          row.category,
          companyId,
          oldOrder.customer
        );
        if (!managers || managers.length === 0) {
          approvalsToCreate.push({
            orderId: oldOrder._id,
            itemIndex: row.itemIndex,
            product: row.productId,
            category: row.category,
            assignedManager: null,
            status: "approved",
            approvedBy: null,
            approvedAt: new Date(),
            originalAmount: row.originalAmount,
            company_id: companyId,
          });
        } else if (managers.length === 1) {
          approvalsToCreate.push({
            orderId: oldOrder._id,
            itemIndex: row.itemIndex,
            product: row.productId,
            category: row.category,
            assignedManager: managers[0]._id,
            status: "pending",
            originalAmount: row.originalAmount,
            company_id: companyId,
          });
        } else {
          for (const manager of managers) {
            approvalsToCreate.push({
              orderId: oldOrder._id,
              itemIndex: row.itemIndex,
              product: row.productId,
              category: row.category,
              assignedManager: manager._id,
              status: "pending",
              originalAmount: row.originalAmount,
              company_id: companyId,
            });
          }
        }
      }
      if (approvalsToCreate.length > 0) {
        await OrderItemApproval.insertMany(approvalsToCreate);
      }
    }

    // Send notification about order status change if status was updated
    if (status && status !== oldOrder.status) {
      try {
        const updatedBy = req.user || { _id: 'system', name: 'System', email: 'system@ressichem.com' };
        Promise.resolve(
          notificationTriggerService.triggerOrderStatusChanged(order, updatedBy, oldOrder.status, status)
        ).catch((notificationError) => {
          console.error("Failed to send order status change notification:", notificationError);
        });

        // Send category-based notifications to managers in background.
        Promise.resolve(
          categoryNotificationService.notifyStatusChange(order, oldOrder.status, status, updatedBy)
        ).catch((notificationError) => {
          console.error("Failed to send category status change notification:", notificationError);
        });
      } catch (notificationError) {
        console.error("Failed to queue order status change notification:", notificationError);
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
