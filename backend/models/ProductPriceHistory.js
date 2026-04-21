const mongoose = require("mongoose");

const productPriceHistorySchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      index: true,
    },
    company_id: {
      type: String,
      required: true,
      default: "RESSICHEM",
      index: true,
    },
    previousPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    newPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    changedByName: { type: String },
    changedByEmail: { type: String },
    reason: { type: String },
  },
  { timestamps: true }
);

productPriceHistorySchema.index({ product: 1, createdAt: -1 });
productPriceHistorySchema.index({ company_id: 1, createdAt: -1 });

module.exports = mongoose.model("ProductPriceHistory", productPriceHistorySchema);
