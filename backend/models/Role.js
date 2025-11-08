const mongoose = require("mongoose");

const RoleSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, default: "" },
  company_id: { type: String, ref: "Company", required: true },
  permissionGroups: [{ type: mongoose.Schema.Types.ObjectId, ref: "PermissionGroup" }],
  permissions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Permission" }], // Direct permissions for easier management
  isActive: { type: Boolean, default: true } // Role status - active by default
});

module.exports = mongoose.model("Role", RoleSchema);

