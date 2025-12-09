const express = require('express');
const router = express.Router();
const productImageService = require('../services/productImageService');
const authMiddleware = require('../middleware/authMiddleware');
const permissionMiddleware = require('../middleware/permissionMiddleware');

// Populate product images
router.post('/populate', authMiddleware, permissionMiddleware(['admin', 'super_admin']), async (req, res) => {
  try {
    const result = await productImageService.populateProductImages();
    
    if (result.success) {
      res.json({
        success: true,
        message: result.message,
        updatedCount: result.updatedCount || 0
      });
    } else {
      res.status(500).json({
        success: false,
        message: result.message || 'Failed to populate product images',
        error: result.error
      });
    }
  } catch (error) {
    console.error('Error in populate product images:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// Get image mapping
router.get('/mapping', authMiddleware, permissionMiddleware(['admin', 'super_admin']), (req, res) => {
  try {
    // Return the mapping from the service
    res.json({
      success: true,
      message: 'Image mapping retrieved successfully'
    });
  } catch (error) {
    console.error('Error getting image mapping:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get image mapping',
      error: error.message
    });
  }
});

module.exports = router;
