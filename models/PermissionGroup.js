const mongoose = require("mongoose");

const PermissionGroupSchema = new mongoose.Schema({
  name: { type: String, required: true },
  company_id: { type: String, ref: "Company", required: true },
  permissions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Permission" }]
});

module.exports = mongoose.model("PermissionGroup", PermissionGroupSchema);

