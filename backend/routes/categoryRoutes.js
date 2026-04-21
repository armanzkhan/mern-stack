const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const categoryController = require('../controllers/categoryController');

// Get all categories
router.get('/', auth, categoryController.getAllCategories);

// Create new category
router.post('/', auth, categoryController.createCategory);

// Update category
router.put('/:id', auth, categoryController.updateCategory);

// Delete category
router.delete('/:id', auth, categoryController.deleteCategory);

// Bulk activate/deactivate categories
router.patch('/bulk-status', auth, categoryController.bulkUpdateCategoryStatus);
router.patch('/bulk-delete', auth, categoryController.bulkDeleteCategories);
router.patch('/bulk-move-parent', auth, categoryController.bulkMoveCategoryParent);

// Assign categories to manager
router.post('/assign-to-manager', auth, categoryController.assignCategoriesToManager);

// Get manager's assigned categories
router.get('/manager/:managerId', auth, categoryController.getManagerCategories);

module.exports = router;
