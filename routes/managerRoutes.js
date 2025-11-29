const express = require("express");
const router = express.Router();
const managerController = require("../controllers/managerController");
const authMiddleware = require("../middleware/authMiddleware");
const permissionMiddleware = require("../middleware/permissionMiddleware");

// Manager profile routes
router.post("/profile", authMiddleware, managerController.createOrUpdateManager);
router.get("/profile", authMiddleware, managerController.getManagerProfile);

// Manager data routes
router.get("/orders", authMiddleware, managerController.getManagerOrders);
router.get("/products", authMiddleware, managerController.getManagerProducts);
router.get("/reports", authMiddleware, managerController.getManagerReports);

// Order management routes
router.put("/orders/:orderId/status", authMiddleware, managerController.updateOrderStatus);

// Admin routes for manager management
router.get("/all", authMiddleware, managerController.getAllManagers);
router.post("/assign-categories", authMiddleware, permissionMiddleware(["assign_categories"]), managerController.assignCategories);

// CRUD routes for managers
router.get("/users", authMiddleware, managerController.getUsers);
router.post("/", authMiddleware, managerController.createManager);
router.put("/:id", authMiddleware, managerController.updateManager);
router.delete("/:id", authMiddleware, managerController.deleteManager);

module.exports = router;
