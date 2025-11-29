// backend/models/ProductCategory.js
const mongoose = require("mongoose");

const ProductCategorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  level: { type: Number, default: 1 },
  parent: { type: mongoose.Schema.Types.ObjectId, default: null },
  path: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  subCategories: [{ type: String }]
}, { timestamps: true });

module.exports = mongoose.model("ProductCategory", ProductCategorySchema);