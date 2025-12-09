const mongoose = require("mongoose");

const NotificationSubscriptionSchema = new mongoose.Schema({
  user_id: { type: String, ref: "User", required: true },
  endpoint: { type: String, required: true },
  keys: {
    p256dh: { type: String, required: true },
    auth: { type: String, required: true }
  },
  isActive: { type: Boolean, default: true },
  company_id: { type: String, ref: "Company", required: true },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

// Update the updated_at field before saving
NotificationSubscriptionSchema.pre('save', function(next) {
  this.updated_at = new Date();
  next();
});

module.exports = mongoose.model("NotificationSubscription", NotificationSubscriptionSchema);