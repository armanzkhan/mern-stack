function requireSuperAdmin(req, res, next) {
  if (!req.user) return res.status(401).json({ message: "Unauthorized" });
  if (req.user.isSuperAdmin) return next();
  return res.status(403).json({ message: "Forbidden: Super admin only" });
}

module.exports = requireSuperAdmin;


