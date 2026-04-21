const Product = require("../models/Product");
const ProductCategory = require("../models/ProductCategory");
const ProductPriceHistory = require("../models/ProductPriceHistory");
const notificationTriggerService = require("../services/notificationTriggerService");

/** Same idea as frontend `getCategoryVariants`: DB may store "and" vs "&" differently. */
function mainCategoryFilterVariants(mainCategory) {
  const raw = String(mainCategory || "")
    .trim()
    .replace(/\s+/g, " ");
  if (!raw) return [];
  const variants = new Set([raw]);
  if (/\band\b/i.test(raw)) {
    variants.add(raw.replace(/\band\b/gi, "&"));
  }
  if (raw.includes("&")) {
    variants.add(raw.replace(/\s*&\s*/g, " and "));
  }
  return Array.from(variants).filter(Boolean);
}

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
      const variants = mainCategoryFilterVariants(mainCategory);
      if (variants.length === 0) {
        filter["category.mainCategory"] = mainCategory;
      } else if (variants.length === 1) {
        filter["category.mainCategory"] = variants[0];
      } else {
        filter["category.mainCategory"] = { $in: variants };
      }
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

    // Backward-compatible hydration:
    // if a product doesn't yet have `lastPriceChange`, read the latest row from history
    // so UI can show previous/new price without requiring a new edit.
    const productsWithPriceInfo = products.map((p) => p.toObject());
    const missingSnapshotIds = productsWithPriceInfo
      .filter((p) => !p.lastPriceChange || p.lastPriceChange.newPrice === undefined)
      .map((p) => p._id);

    if (missingSnapshotIds.length > 0) {
      const historyRows = await ProductPriceHistory.find({
        product: { $in: missingSnapshotIds },
      })
        .sort({ createdAt: -1 })
        .select("product previousPrice newPrice changedByName changedByEmail createdAt")
        .lean();

      const latestByProduct = new Map();
      for (const row of historyRows) {
        const key = String(row.product);
        if (!latestByProduct.has(key)) {
          latestByProduct.set(key, row);
        }
      }

      for (const product of productsWithPriceInfo) {
        if (product.lastPriceChange && product.lastPriceChange.newPrice !== undefined) continue;
        const row = latestByProduct.get(String(product._id));
        if (!row) continue;
        product.lastPriceChange = {
          previousPrice: row.previousPrice,
          newPrice: row.newPrice,
          changedByName: row.changedByName,
          changedByEmail: row.changedByEmail,
          changedAt: row.createdAt,
        };
      }
    }

    res.json({
      products: productsWithPriceInfo,
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

    const normalizedIncomingPrice =
      req.body.price !== undefined && req.body.price !== null
        ? Number(req.body.price)
        : undefined;
    const hasPriceChanged =
      Number.isFinite(normalizedIncomingPrice) &&
      Number(oldProduct.price) !== normalizedIncomingPrice;
    const changedByName =
      [req.user?.firstName, req.user?.lastName].filter(Boolean).join(" ").trim() ||
      req.user?.name ||
      req.user?.email ||
      "System";
    const changedByEmail = req.user?.email || "system@ressichem.com";

    if (hasPriceChanged) {
      req.body.lastPriceChange = {
        previousPrice: Number(oldProduct.price || 0),
        newPrice: normalizedIncomingPrice,
        changedByName,
        changedByEmail,
        changedAt: new Date(),
      };
    }

    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    }).populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');
    
    if (!product) return res.status(404).json({ message: "Product not found" });

    if (hasPriceChanged) {
      const changedById = req.user?._id || req.user?.id || null;

      await ProductPriceHistory.create({
        product: product._id,
        company_id: product.company_id || req.user?.company_id || "RESSICHEM",
        previousPrice: Number(oldProduct.price || 0),
        newPrice: normalizedIncomingPrice,
        changedBy: changedById,
        changedByName,
        changedByEmail,
        reason: req.body?.priceChangeReason || "",
      });
    }
    
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

// Get price history for a product
exports.getProductPriceHistory = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).select("company_id");
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const requesterCompanyId = String(
      req.headers["x-company-id"] || req.user?.company_id || ""
    ).trim();
    const productCompanyId = String(product.company_id || "").trim();
    const normalizedRequesterCompanyId = requesterCompanyId.toLowerCase();
    const normalizedProductCompanyId = productCompanyId.toLowerCase();

    if (
      requesterCompanyId &&
      productCompanyId &&
      normalizedRequesterCompanyId !== normalizedProductCompanyId
    ) {
      return res.status(403).json({ message: "You do not have access to this product history" });
    }

    const history = await ProductPriceHistory.find({
      product: req.params.id,
    })
      .sort({ createdAt: -1 })
      .limit(50)
      .populate("changedBy", "firstName lastName email");

    res.json({ history });
  } catch (err) {
    res.status(500).json({ message: "Error fetching product price history", error: err.message });
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

// Create product category
exports.createCategory = async (req, res) => {
  try {
    const rawName = String(req.body?.name || "").trim();
    const level = Number(req.body?.level || 1);
    const parentId = req.body?.parent || null;

    if (!rawName) {
      return res.status(400).json({ message: "Category name is required" });
    }

    if (![1, 2, 3].includes(level)) {
      return res.status(400).json({ message: "Category level must be 1, 2, or 3" });
    }

    let parentDoc = null;
    if (level > 1) {
      if (!parentId) {
        return res.status(400).json({ message: "Parent category is required for subcategories" });
      }
      parentDoc = await ProductCategory.findById(parentId);
      if (!parentDoc || !parentDoc.isActive) {
        return res.status(404).json({ message: "Parent category not found" });
      }
      if (parentDoc.level !== level - 1) {
        return res.status(400).json({
          message: `Parent category level must be ${level - 1} for level ${level} category`,
        });
      }
    }

    const duplicate = await ProductCategory.findOne({
      name: new RegExp(`^${rawName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i"),
      level,
      parent: parentDoc ? parentDoc._id : null,
      isActive: true,
    });
    if (duplicate) {
      return res.status(409).json({ message: "A category with this name already exists at this level" });
    }

    const path = level === 1 ? rawName : `${parentDoc.path} > ${rawName}`;
    const subCategories =
      level === 1 && Array.isArray(req.body?.subCategories)
        ? req.body.subCategories
            .map((s) => String(s || "").trim())
            .filter(Boolean)
            .filter((s, i, arr) => arr.findIndex((x) => x.toLowerCase() === s.toLowerCase()) === i)
        : [];

    const category = await ProductCategory.create({
      name: rawName,
      level,
      parent: parentDoc ? parentDoc._id : null,
      path,
      isActive: true,
      subCategories,
    });

    // Keep legacy `subCategories` list in sync for main categories
    if (level === 2 && parentDoc) {
      const parentSubs = Array.isArray(parentDoc.subCategories) ? parentDoc.subCategories : [];
      if (!parentSubs.some((s) => String(s).toLowerCase() === rawName.toLowerCase())) {
        parentDoc.subCategories = [...parentSubs, rawName];
        await parentDoc.save();
      }
    }

    res.status(201).json(category);
  } catch (err) {
    console.error("❌ Error creating category:", err);
    res.status(500).json({ message: "Error creating category", error: err.message });
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
