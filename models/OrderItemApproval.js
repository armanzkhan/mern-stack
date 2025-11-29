const mongoose = require("mongoose");

const orderItemApprovalSchema = new mongoose.Schema(
  {
    orderId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Order", 
      required: true 
    },
    itemIndex: { 
      type: Number, 
      required: true 
    },
    product: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Product", 
      required: true 
    },
    category: { 
      type: String, 
      required: true 
    },
    assignedManager: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: false 
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending"
    },
    approvedBy: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User" 
    },
    approvedAt: { 
      type: Date 
    },
    rejectedAt: { 
      type: Date 
    },
    comments: { 
      type: String 
    },
    discountPercentage: { 
      type: Number, 
      default: 0, 
      min: 0, 
      max: 100 
    },
    discountAmount: { 
      type: Number, 
      default: 0, 
      min: 0 
    },
    originalAmount: { 
      type: Number, 
      required: true 
    },
    company_id: { 
      type: String, 
      required: true, 
      default: "RESSICHEM" 
    }
  },
  { timestamps: true }
);

// Index for efficient queries
orderItemApprovalSchema.index({ orderId: 1, itemIndex: 1 });
orderItemApprovalSchema.index({ assignedManager: 1, status: 1 });
orderItemApprovalSchema.index({ category: 1, status: 1 });

module.exports = mongoose.model("OrderItemApproval", orderItemApprovalSchema);
