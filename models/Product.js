// backend/models/Product.js
const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({
  company_id: { type: String, required: true, index: true }, // used by seeds and multi-tenant
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number, default: 0 },
  unit: { type: String },
  sku: { type: String }, // Stock Keeping Unit - product identifier
  stock: { type: Number, default: 0 },
  minStock: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  category: {
    mainCategory: { type: String, required: true },
    subCategory: { type: String },
    subSubCategory: { type: String },
  },
  // Product images
  images: {
    primary: { type: String }, // Main product image URL
    category: { type: String }, // Category-specific image URL
    gallery: [{ type: String }] // Additional product images
  },
  // SEO and display
  imageAlt: { type: String }, // Alt text for accessibility
  displayOrder: { type: Number, default: 0 }, // For sorting products
  // Technical documentation
  tdsLink: { type: String }, // TDS (Technical Data Sheet) document link
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
}, {
  timestamps: true
});

// text index for search (used by productController)
ProductSchema.index({ name: "text", description: "text" });

module.exports = mongoose.model("Product", ProductSchema);
