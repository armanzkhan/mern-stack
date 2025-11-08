const mongoose = require("mongoose");

const categoryApprovalSchema = new mongoose.Schema({
  company_id: { type: String, required: true, default: "RESSICHEM" },
  category: { type: String, required: true }, // Product category
  approverRole: { type: String, required: true }, // Role that can approve this category
  approverUser: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Specific user (optional)
  isActive: { type: Boolean, default: true },
  requiresApproval: { type: Boolean, default: true },
  approvalLimit: { type: Number }, // Maximum amount that can be approved without higher approval
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
}, {
  timestamps: true
});

// Ensure unique combination of company, category, and approver
categoryApprovalSchema.index({ company_id: 1, category: 1, approverRole: 1 }, { unique: true });

module.exports = mongoose.model("CategoryApproval", categoryApprovalSchema);
