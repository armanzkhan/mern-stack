const mongoose = require("mongoose");

const CompanySchema = new mongoose.Schema({
  company_id: { type: String, unique: true, required: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  address: { type: String, required: true },
  industry: { type: String, required: true },
  departments: [{ type: String }],
  userCount: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Update the updatedAt field before saving
CompanySchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model("Company", CompanySchema);

