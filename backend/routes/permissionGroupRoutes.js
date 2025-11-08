const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const permissionMiddleware = require("../middleware/permissionMiddleware");
const PermissionGroup = require("../models/PermissionGroup");

// List groups by company
router.get("/", authMiddleware, async (req, res) => {
  try {
    const company_id = req.query.company_id || req.user.company_id;
    const groups = await PermissionGroup.find({ company_id }).populate("permissions");
    res.json(groups);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

// Create group
router.post("/", authMiddleware, permissionMiddleware(["create_permission_group"]), async (req, res) => {
  try {
    const group = await PermissionGroup.create({ ...req.body, company_id: req.body.company_id || req.user.company_id });
    res.status(201).json(group);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

// Update group
router.put("/:id", authMiddleware, permissionMiddleware(["update_permission_group"]), async (req, res) => {
  try {
    const updated = await PermissionGroup.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: "Not found" });
    res.json(updated);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

// Delete group
router.delete("/:id", authMiddleware, permissionMiddleware(["delete_permission_group"]), async (req, res) => {
  try {
    const deleted = await PermissionGroup.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Not found" });
    res.json({ message: "Deleted" });
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

module.exports = router;

