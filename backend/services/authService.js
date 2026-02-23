// services/authService.js
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Role = require("../models/Role");
const PermissionGroup = require("../models/PermissionGroup");
const Permission = require("../models/Permission");
const { encryptObject } = require("../utils/crypto");

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";
const REFRESH_SECRET = process.env.REFRESH_SECRET || "superrefreshkey"; // 👈 add in .env

async function getUserPermissions(userId, companyId) {
  const user = await User.findOne({ user_id: userId, company_id: companyId })
    .populate({
      path: "roles",
      populate: {
        path: "permissions"
      }
    })
    .populate("permissions");

  if (!user) throw new Error("User not found");

  const roles = [];
  const permissionGroups = [];
  const permissions = [];

  // Get permissions from roles
  user.roles.forEach((role) => {
    roles.push(role.name);
    if (role.permissions) {
      role.permissions.forEach((p) => {
        if (!permissions.includes(p.key)) permissions.push(p.key);
      });
    }
  });

  // Get direct permissions
  if (user.permissions) {
    user.permissions.forEach((p) => {
      if (!permissions.includes(p.key)) permissions.push(p.key);
    });
  }

  return { roles, permissionGroups, permissions };
}

async function generateToken(user, expiresIn = "1h", isRefresh = false) {
  try {
    // Validate required fields
    if (!user || !user.user_id || !user.company_id) {
      throw new Error(`Missing required fields: user_id=${!!user?.user_id}, company_id=${!!user?.company_id}`);
    }

    let roles = [];
    let permissionGroups = [];
    let permissions = [];

    // 👇 Automatically detect Super Admin by ID or email
    const isSuperAdmin =
      user.isSuperAdmin === true ||
      user.user_id === "super_admin_001" ||
      user.email === "superadmin@ressichem.com"; // ✅ update to your actual Super Admin email if you like

    if (isSuperAdmin) {
      const allPermissions = await Permission.find({});
      permissions = allPermissions.map(p => p.key);
      roles = ["SuperAdmin"];
      permissionGroups = ["All"];
    } else {
      try {
        ({ roles, permissionGroups, permissions } = await getUserPermissions(
          user.user_id,
          user.company_id
        ));
      } catch (permError) {
        console.error("❌ Error getting user permissions:", permError);
        // Use empty arrays as fallback instead of failing
        roles = [];
        permissionGroups = [];
        permissions = [];
      }
    }

    const encrypted = encryptObject({ roles, permissionGroups, permissions });
    const payload = {
      user_id: user.user_id,
      _id: user._id, // Include MongoDB ObjectId for database references
      company_id: user.company_id,
      email: user.email || '',
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      perms: encrypted,
      isSuperAdmin,
      // Include user type flags for role-based filtering
      isManager: user.isManager === true,
      isCustomer: user.isCustomer === true,
      isCompanyAdmin: user.isCompanyAdmin === true,
    };

    return jwt.sign(payload, isRefresh ? REFRESH_SECRET : JWT_SECRET, { expiresIn });
  } catch (error) {
    console.error("❌ generateToken error:", error);
    console.error("User data:", {
      user_id: user?.user_id,
      company_id: user?.company_id,
      email: user?.email
    });
    throw error;
  }
}

function verifyRefreshToken(token) {
  return jwt.verify(token, REFRESH_SECRET);
}

module.exports = { getUserPermissions, generateToken, verifyRefreshToken };
