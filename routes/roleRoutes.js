const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const permissionMiddleware = require("../middleware/permissionMiddleware");
const Role = require("../models/Role");

// List roles for a company
router.get("/", authMiddleware, async (req, res) => {
  try {
    const company_id = req.user.isSuperAdmin ? (req.query.company_id || req.user.company_id) : req.user.company_id;
    const roles = await Role.find({ company_id }).populate("permissionGroups");
    res.json(roles);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

// Get single role by ID
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const role = await Role.findById(req.params.id)
      .populate("permissionGroups")
      .populate("permissions");
    if (!role) return res.status(404).json({ message: "Role not found" });
    res.json(role);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

// Create role
router.post("/", authMiddleware, permissionMiddleware(["create_role"]), async (req, res) => {
  try {
    const role = await Role.create({ ...req.body, company_id: req.body.company_id || req.user.company_id });
    res.status(201).json(role);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

// Update role
router.put("/:id", authMiddleware, permissionMiddleware(["update_role"]), async (req, res) => {
  try {
    const { permissions, ...otherFields } = req.body;
    
    // Prepare update data
    const updateData = { ...otherFields };
    
    // If permissions are provided, update the permissions field
    if (permissions && Array.isArray(permissions)) {
      updateData.permissions = permissions;
    }
    
    const updated = await Role.findByIdAndUpdate(req.params.id, updateData, { new: true })
      .populate("permissionGroups")
      .populate("permissions");
    
    if (!updated) return res.status(404).json({ message: "Not found" });
    res.json(updated);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

// Delete role
router.delete("/:id", authMiddleware, permissionMiddleware(["delete_role"]), async (req, res) => {
  try {
    const deleted = await Role.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Not found" });
    res.json({ message: "Deleted" });
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

module.exports = router;

