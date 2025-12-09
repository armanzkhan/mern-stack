const express = require("express");
const router = express.Router();
const customerController = require("../controllers/customerController");
const authMiddleware = require("../middleware/authMiddleware");

// ===== CRUD Routes for Customer Management =====
router.get("/", authMiddleware, customerController.getAllCustomers);
router.post("/", authMiddleware, customerController.createCustomer);

// Customer profile routes - MUST come before /:id routes
router.get("/profile/:id?", authMiddleware, customerController.getCustomerProfile);
router.get("/dashboard", authMiddleware, customerController.getCustomerDashboard);
router.get("/dashboard/:id", authMiddleware, customerController.getCustomerDashboard);

// Customer product routes (filtered by assigned manager's categories)
router.get("/products/:id?", authMiddleware, customerController.getCustomerProducts);

// Customer order routes - MUST come before /:id routes
router.get("/orders", authMiddleware, customerController.getCustomerOrders);
router.get("/orders/:id", authMiddleware, customerController.getCustomerOrders);

// Generic CRUD routes - MUST come after specific routes
router.get("/:id", authMiddleware, customerController.getCustomer);
router.put("/:id", authMiddleware, customerController.updateCustomer);
router.delete("/:id", authMiddleware, customerController.deleteCustomer);

// Customer assignment routes (admin only)
router.post("/assign-manager", authMiddleware, customerController.assignCustomerToManager);

// Customer preferences
router.put("/preferences/:id?", authMiddleware, customerController.updateCustomerPreferences);

module.exports = router;