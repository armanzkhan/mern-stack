const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");
const authMiddleware = require("../middleware/authMiddleware");

// Apply authentication middleware to all routes
router.use(authMiddleware);

// CRUD routes
router.post("/", productController.createProduct);
router.get("/", productController.getProducts);
router.get("/categories", productController.getCategories);
router.post("/categories", productController.createCategory);
router.get("/low-stock", productController.getLowStockProducts);
router.get("/:id/price-history", productController.getProductPriceHistory);
router.get("/:id", productController.getProductById);
router.put("/:id", productController.updateProduct);
router.put("/bulk/stock", productController.bulkUpdateStock);
router.delete("/:id", productController.deleteProduct);

module.exports = router;
