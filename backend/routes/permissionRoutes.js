const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const permissionMiddleware = require("../middleware/permissionMiddleware");
const Permission = require("../models/Permission");

// ✅ Get all permissions for the current company
router.get("/", authMiddleware, async (req, res) => {
  try {
    const company_id = req.query.company_id || req.user.company_id;

    // ✅ Return all fields needed by the frontend
    const permissions = await Permission.find({ company_id }).select("_id key description");

    if (!permissions || permissions.length === 0) {
      return res.status(404).json({ message: "No permissions found" });
    }

    res.status(200).json(permissions);
  } catch (e) {
    console.error("Error fetching permissions:", e);
    res.status(500).json({ message: "Failed to fetch permissions", error: e.message });
  }
});

// ✅ Create a new permission
router.post(
  "/",
  authMiddleware,
  permissionMiddleware(["create_permission"]),
  async (req, res) => {
    try {
      const { name, key, description } = req.body;

      if (!name || !key) {
        return res.status(400).json({ message: "Permission name and key are required" });
      }

      const permission = await Permission.create({
        key,
        description: description || "",
        company_id: req.body.company_id || req.user.company_id,
      });

      res.status(201).json({
        _id: permission._id,
        key: permission.key,
        description: permission.description,
      });
    } catch (e) {
      console.error("Error creating permission:", e);
      res.status(400).json({ message: e.message });
    }
  }
);

// ✅ Update permission
router.put(
  "/:id",
  authMiddleware,
  permissionMiddleware(["update_permission"]),
  async (req, res) => {
    try {
      const updated = await Permission.findByIdAndUpdate(
        req.params.id,
        { name: req.body.name },
        { new: true }
      ).select("_id name");

      if (!updated) return res.status(404).json({ message: "Permission not found" });

      res.status(200).json(updated);
    } catch (e) {
      res.status(400).json({ message: e.message });
    }
  }
);

// ✅ Delete permission
router.delete(
  "/:id",
  authMiddleware,
  permissionMiddleware(["delete_permission"]),
  async (req, res) => {
    try {
      const deleted = await Permission.findByIdAndDelete(req.params.id);
      if (!deleted) return res.status(404).json({ message: "Permission not found" });
      res.status(200).json({ message: "Permission deleted successfully" });
    } catch (e) {
      res.status(400).json({ message: e.message });
    }
  }
);

module.exports = router;
