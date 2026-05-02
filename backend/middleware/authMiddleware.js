// middleware/authMiddleware.js
const jwt = require("jsonwebtoken");
const { decryptObject } = require("../utils/crypto");
const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers["authorization"];
    console.log("➡️ authMiddleware - Authorization header:", authHeader);
    console.log("➡️ authMiddleware - Request URL:", req.url);
    console.log("➡️ authMiddleware - Request method:", req.method);

    if (!authHeader) {
      console.log("⛔ No Authorization header present");
      return res.status(401).json({ message: "No token provided" });
    }

    const parts = authHeader.split(" ");
    if (parts.length !== 2 || parts[0] !== "Bearer") {
      console.log("⛔ Bad Authorization header format:", authHeader);
      return res.status(401).json({ message: "Invalid authorization header" });
    }

    const token = parts[1];
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
      console.log("✅ JWT decoded payload:", decoded);
    } catch (err) {
      console.error("⛔ JWT verify error:", err.message);
      const isExpired = err && err.name === "TokenExpiredError";
      return res
        .status(isExpired ? 401 : 403)
        .json({ message: isExpired ? "Token expired" : "Invalid or expired token" });
    }

    // If there's an encrypted perms payload, decrypt it and merge
    if (decoded?.perms) {
      try {
        const decrypted = decryptObject(decoded.perms);
        console.log("🔐 decrypted perms object:", decrypted);
        req.user = { ...decoded, ...decrypted };
      } catch (e) {
        console.error("⛔ decryptObject failed:", e && e.message ? e.message : e);
        return res.status(403).json({ message: "Invalid encrypted payload" });
      }
    } else {
      req.user = decoded;
    }

    // Normalize a few fields for debugging
    console.log("ℹ️ req.user after auth:", {
      user_id: req.user?.user_id,
      _id: req.user?._id,
      company_id: req.user?.company_id,
      isSuperAdmin: req.user?.isSuperAdmin,
      permissions: req.user?.permissions,
    });

    // Allow super admin switch company context
    const headerCompany = req.headers["x-company-id"];
    if (req.user.isSuperAdmin && headerCompany) {
      console.log("🔁 Super admin company override header:", headerCompany);
      req.user.company_id = String(headerCompany);
    }

    next();
  } catch (err) {
    console.error("authMiddleware unexpected error:", err);
    console.error("Error details:", err.message);
    console.error("Error stack:", err.stack);
    return res.status(500).json({ message: "Auth error", error: err.message });
  }
}

module.exports = authMiddleware;
