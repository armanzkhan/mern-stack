const Product = require("../models/Product");
const ProductCategory = require("../models/ProductCategory");
const notificationTriggerService = require("../services/notificationTriggerService");

// Create product
exports.createProduct = async (req, res) => {
  try {
    // Add user info if available
    if (req.user) {
      req.body.createdBy = req.user.id;
    }
    
    const product = new Product(req.body);
    await product.save();
    
    // Trigger notification for product creation
    try {
      const createdBy = req.user || { _id: 'system', name: 'System', email: 'system@ressichem.com' };
      await notificationTriggerService.triggerProductCreated(product, createdBy);
    } catch (notificationError) {
      console.error("Failed to send product creation notification:", notificationError);
      // Don't fail the product creation if notification fails
    }
    
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ message: "Error creating product", error: err.message });
  }
};

// Get all products with filtering and pagination
exports.getProducts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      mainCategory,
      subCategory,
      minPrice,
      maxPrice,
      inStock,
      featured,
      sortBy = 'name',
      sortOrder = 'asc'
    } = req.query;

    // Get company_id from user context or default to RESSICHEM
    const companyId = req.headers['x-company-id'] || req.user?.company_id || "RESSICHEM";

    // Build filter object
    const filter = { 
      isActive: true,
      company_id: companyId // Filter by company_id for multi-tenant support
    };

    if (search) {
      filter.$text = { $search: search };
    }

    if (mainCategory) {
      filter['category.mainCategory'] = mainCategory;
    }

    if (subCategory) {
      filter['category.subCategory'] = subCategory;
    }

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }

    if (inStock === 'true') {
      filter.stock = { $gt: 0 };
    }

    if (featured === 'true') {
      filter.isFeatured = true;
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const products = await Product.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');

    const total = await Product.countDocuments(filter);

    res.json({
      products,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalProducts: total,
        hasNext: skip + products.length < total,
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (err) {
    res.status(500).json({ message: "Error fetching products", error: err.message });
  }
};

// Get product by ID
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');
    
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: "Error fetching product", error: err.message });
  }
};

// Update product
exports.updateProduct = async (req, res) => {
  try {
    // Get the old product data for comparison
    const oldProduct = await Product.findById(req.params.id);
    if (!oldProduct) return res.status(404).json({ message: "Product not found" });
    
    // Add user info if available
    if (req.user) {
      req.body.updatedBy = req.user.id;
    }

    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    }).populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');
    
    if (!product) return res.status(404).json({ message: "Product not found" });
    
    // Check for stock changes and trigger notifications
    try {
      const updatedBy = req.user || { _id: 'system', name: 'System', email: 'system@ressichem.com' };
      
      // Check if stock changed significantly
      if (req.body.stock !== undefined && oldProduct.stock !== req.body.stock) {
        const stockChange = req.body.stock - oldProduct.stock;
        const stockPercentage = (req.body.stock / oldProduct.stock) * 100;
        
        // Trigger low stock notification if stock is below 100 or decreased by more than 50%
        if (req.body.stock < 100) {
          await notificationTriggerService.triggerLowStockAlert(product, updatedBy, req.body.stock);
        } else if (stockChange < 0 && stockPercentage < 50) {
          await notificationTriggerService.triggerStockSignificantlyReduced(product, updatedBy, oldProduct.stock, req.body.stock);
        }
      }
      
      // Check if category changed
      if (req.body.category && JSON.stringify(oldProduct.category) !== JSON.stringify(req.body.category)) {
        await notificationTriggerService.triggerProductCategoryChanged(product, updatedBy, oldProduct.category, req.body.category);
      }
      
      // General product update notification
      await notificationTriggerService.triggerProductUpdated(product, updatedBy, req.body);
      
    } catch (notificationError) {
      console.error("Failed to send product update notifications:", notificationError);
      // Don't fail the product update if notification fails
    }
    
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: "Error updating product", error: err.message });
  }
};

// Delete product (soft delete with isActive=false)
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { isActive: false, updatedBy: req.user?.id },
      { new: true }
    );
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json({ message: "Product deactivated successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting product", error: err.message });
  }
};

// Get product categories
exports.getCategories = async (req, res) => {
  try {
    const { type = 'all' } = req.query;
    
    let categories;
    
    // Use ONLY real database categories - no utility functions
    if (type === 'main') {
      // Get main categories from database only
      categories = await ProductCategory.find({ 
        level: 1, 
        isActive: true 
      }).sort({ name: 1 });
      
    } else if (type === 'sub') {
      const { mainCategory } = req.query;
      if (!mainCategory) {
        return res.status(400).json({ message: "Main category is required for subcategories" });
      }
      
      // Get subcategories from database only
      const dbCategory = await ProductCategory.findOne({ 
        name: mainCategory, 
        level: 1, 
        isActive: true 
      });
      
      if (!dbCategory) {
        return res.status(404).json({ message: "Main category not found" });
      }
      
      // Return subcategories from database
      categories = (dbCategory.subCategories || []).map(subCat => ({
        name: subCat,
        subCategory: subCat
      }));
      
    } else if (type === 'subsub') {
      const { mainCategory: main, subCategory: sub } = req.query;
      if (!main || !sub) {
        return res.status(400).json({ message: "Main category and subcategory are required" });
      }
      
      // For now, return empty array as sub-sub categories are not implemented in database
      // This can be extended when sub-sub categories are added to the database
      categories = [];
      
    } else {
      // Get all categories from database only
      categories = await ProductCategory.find({ 
        isActive: true 
      }).sort({ name: 1 });
    }
    
    console.log(`✅ Fetched ${categories.length} REAL database categories`);
    res.json(categories);
  } catch (err) {
    console.error('❌ Error fetching categories:', err);
    res.status(500).json({ message: "Error fetching categories", error: err.message });
  }
};

// Get low stock products
exports.getLowStockProducts = async (req, res) => {
  try {
    const products = await Product.find({
      isActive: true,
      $expr: { $lte: ['$stock', '$minStock'] }
    }).populate('createdBy', 'name email');
    
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: "Error fetching low stock products", error: err.message });
  }
};

// Bulk update stock
exports.bulkUpdateStock = async (req, res) => {
  try {
    const { updates } = req.body; // Array of { productId, newStock }
    
    if (!Array.isArray(updates)) {
      return res.status(400).json({ message: "Updates must be an array" });
    }

    const bulkOps = updates.map(update => ({
      updateOne: {
        filter: { _id: update.productId },
        update: { 
          stock: update.newStock,
          updatedBy: req.user?.id
        }
      }
    }));

    const result = await Product.bulkWrite(bulkOps);
    res.json({ message: "Stock updated successfully", modifiedCount: result.modifiedCount });
  } catch (err) {
    res.status(500).json({ message: "Error updating stock", error: err.message });
  }
};
