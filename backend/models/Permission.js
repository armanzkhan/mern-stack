const mongoose = require("mongoose");

const PermissionSchema = new mongoose.Schema({
  key: { type: String, required: true },
  description: { type: String },
  company_id: { type: String, ref: "Company", required: true },
  group: { type: mongoose.Schema.Types.ObjectId, ref: "PermissionGroup" }
});

// Create compound index to make key unique per company
PermissionSchema.index({ key: 1, company_id: 1 }, { unique: true });

module.exports = mongoose.model("Permission", PermissionSchema);

