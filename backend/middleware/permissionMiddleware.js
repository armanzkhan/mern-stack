function permissionMiddleware(requiredPermissions = []) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    // 🔹 Debug log
    console.log("🔑 Permission check:", {
      required: requiredPermissions,
      userPerms: req.user.permissions,
      isSuperAdmin: req.user.isSuperAdmin,
      isCompanyAdmin: req.user.isCompanyAdmin
    });

    // Super Admin and Company Admin bypass permission checks
    if (req.user.isSuperAdmin) return next();
    
    // Company Admins should have access to most admin functions
    // Allow them to assign categories (common admin task)
    if (req.user.isCompanyAdmin && requiredPermissions.includes('assign_categories')) {
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
      return res.status(403).json({ message: "Forbidden: Insufficient permissions" });
    }

    next();
  };
}

module.exports = permissionMiddleware;
