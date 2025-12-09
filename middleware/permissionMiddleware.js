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

    const headerCompany = req.headers["x-company-id"];
    if (headerCompany && headerCompany !== req.user.company_id) {
      return res.status(403).json({ message: "Forbidden: Company scope mismatch" });
    }

    const userPermissions = req.user.permissions || [];
    
    // Extract permission keys from permission objects
    const userPermissionKeys = userPermissions.map(perm => {
      if (typeof perm === 'string') return perm;
      if (perm && perm.key) return perm.key;
      return null;
    }).filter(key => key !== null);
    
    console.log("🔑 User permission keys:", userPermissionKeys);
    
    const hasPermission = requiredPermissions.every((p) =>
      userPermissionKeys.includes(p)
    );
    if (!hasPermission) {
      return res.status(403).json({ 
        message: `Permission Denied: You do not have permission to ${requiredPermissions.join(', ')}. Please contact an administrator.` 
      });
    }

    next();
  };
}

module.exports = permissionMiddleware;
