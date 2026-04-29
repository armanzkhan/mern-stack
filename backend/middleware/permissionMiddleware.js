function permissionMiddleware(requiredPermissions = []) {
  return async (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    // 🔹 Debug log
    console.log("🔑 Permission check:", {
      required: requiredPermissions,
      userPerms: req.user.permissions,
      isSuperAdmin: req.user.isSuperAdmin,
      isCompanyAdmin: req.user.isCompanyAdmin,
      role: req.user.role
    });

    // Super Admin bypasses all permission checks
    if (req.user.isSuperAdmin) {
      console.log("✅ Super Admin - bypassing permission check");
      return next();
    }
    
    // Check if user is a Company Admin (multiple ways to identify)
    let isCompanyAdmin = req.user.isCompanyAdmin === true;
    const userRole = req.user.role || '';
    const isCompanyAdminByRole = userRole.toLowerCase().includes('company') && userRole.toLowerCase().includes('admin');
    
    // If not in JWT, check database as fallback
    if (!isCompanyAdmin && req.user.user_id) {
      try {
        const User = require('../models/User');
        const fullUser = await User.findOne({ 
          user_id: req.user.user_id, 
          company_id: req.user.company_id 
        }).select('isCompanyAdmin role');
        
        if (fullUser) {
          isCompanyAdmin = fullUser.isCompanyAdmin === true || 
                          (fullUser.role && fullUser.role.toLowerCase().includes('company') && fullUser.role.toLowerCase().includes('admin'));
          console.log("🔍 Company Admin status from database:", isCompanyAdmin);
        }
      } catch (dbError) {
        console.error("⚠️ Error checking database for company admin:", dbError.message);
      }
    }
    
    // Company Admins should have access to most admin functions
    // Allow them to assign categories (common admin task)
    if ((isCompanyAdmin || isCompanyAdminByRole) && requiredPermissions.includes('assign_categories')) {
      console.log("✅ Company Admin granted access to assign_categories");
      return next();
    }

    // Customer users (portal): allow orders and related permissions even if they have no Role in DB
    const customerAllowedPermissions = [
      "orders.create",
      "orders.read",
      "orders.update",
      "products.read",
      "profile.update",
      "notifications.read",
      "invoices.read",
    ];
    const allowedForCustomers = requiredPermissions.every((p) => customerAllowedPermissions.includes(p));
    let isCustomer = req.user.isCustomer === true;

    if (!isCustomer && allowedForCustomers) {
      try {
        const User = require("../models/User");
        const mongoose = require("mongoose");
        let dbUser = null;
        if (req.user.user_id && req.user.company_id) {
          dbUser = await User.findOne({
            user_id: req.user.user_id,
            company_id: new RegExp(`^${String(req.user.company_id).replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i"),
          }).select("isCustomer role");
        }
        if (!dbUser && req.user._id && mongoose.Types.ObjectId.isValid(req.user._id)) {
          dbUser = await User.findById(req.user._id).select("isCustomer role");
        }
        if (!dbUser && req.user.email) {
          dbUser = await User.findOne({
            email: req.user.email,
            ...(req.user.company_id && { company_id: new RegExp(`^${String(req.user.company_id).replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i") }),
          }).select("isCustomer role");
        }
        isCustomer =
          dbUser &&
          (dbUser.isCustomer === true ||
            (dbUser.role && String(dbUser.role).toLowerCase() === "customer"));
        if (isCustomer) console.log("🔍 Customer status from database: true");
      } catch (e) {
        console.error("⚠️ Error checking customer in DB:", e.message);
      }
    }

    if (isCustomer && allowedForCustomers) {
      console.log("✅ Customer user granted access to:", requiredPermissions);
      return next();
    }

    const headerCompany = req.headers["x-company-id"];
    if (headerCompany && headerCompany !== req.user.company_id) {
      return res.status(403).json({ message: "Forbidden: Company scope mismatch" });
    }

    const userPermissions = req.user.permissions || [];

    const userPermissionKeys = userPermissions.map((perm) => {
      if (typeof perm === "string") return perm;
      if (perm && perm.key) return perm.key;
      return null;
    }).filter((key) => key !== null);

    console.log("🔑 User permission keys:", userPermissionKeys);

    // Support legacy/new permission-key variants (e.g. update_user vs users.update).
    const permissionAliases = {
      update_user: ["users.update", "user_update", "user_manage"],
      create_user: ["users.create", "user_add", "user_manage"],
      "users.read": ["user_view", "users.view"],
      "users.update": ["update_user", "user_update", "user_manage"],
      "users.create": ["create_user", "user_add", "user_manage"],
    };

    const hasPermission = requiredPermissions.every((required) => {
      const aliases = permissionAliases[required] || [];
      return [required, ...aliases].some((candidate) =>
        userPermissionKeys.includes(candidate)
      );
    });
    if (!hasPermission) {
      return res.status(403).json({
        message: `Permission Denied: You do not have permission to ${requiredPermissions.join(", ")}. Please contact an administrator.`,
      });
    }

    next();
  };
}

module.exports = permissionMiddleware;
