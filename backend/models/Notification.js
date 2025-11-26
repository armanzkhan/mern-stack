const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema({
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['info', 'success', 'warning', 'error', 'order', 'delivery', 'invoice', 'payment', 'system', 'item_approval_status', 'discount_updated', 'approval_required', 'order_created', 'order_status_update', 'item_status_update', 'category_assignment'],
    default: 'info' 
  },
  priority: { 
    type: String, 
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium' 
  },
  
  // Target audience
  targetType: { 
    type: String, 
    enum: ['user', 'customer', 'role', 'permission_group', 'company', 'all'],
    required: true 
  },
  targetIds: [{ type: String }], // Array of user_ids, role_ids, or group_ids
  
  // Company isolation
  company_id: { type: String, ref: "Company", required: true },
  
  // Sender information
  sender_id: { type: String, ref: "User" },
  sender_name: { type: String },
  
  // Content and actions
  data: { type: mongoose.Schema.Types.Mixed }, // Additional data payload
  actions: [{
    label: String,
    action: String,
    url: String
  }],
  
  // Delivery settings
  channels: [{
    type: { 
      type: String, 
      enum: ['in_app', 'web_push', 'mobile_push', 'email', 'sms'],
      required: true 
    },
    enabled: { type: Boolean, default: true },
    scheduled_at: Date,
    sent_at: Date,
    failed_at: Date,
    error_message: String
  }],
  
  // Status tracking
  status: { 
    type: String, 
    enum: ['draft', 'scheduled', 'sending', 'sent', 'failed', 'cancelled'],
    default: 'draft' 
  },
  
  // Timing
  scheduled_at: Date,
  expires_at: Date,
  
  // Analytics
  delivery_stats: {
    total_recipients: { type: Number, default: 0 },
    delivered: { type: Number, default: 0 },
    opened: { type: Number, default: 0 },
    clicked: { type: Number, default: 0 },
    failed: { type: Number, default: 0 }
  },
  
  // Read status per user
  read_by: [{
    user_id: { type: String, ref: "User" },
    read_at: { type: Date, default: Date.now }
  }],
  
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true
});

// Indexes for performance
NotificationSchema.index({ company_id: 1, status: 1 });
NotificationSchema.index({ targetType: 1, targetIds: 1 });
NotificationSchema.index({ scheduled_at: 1 });
NotificationSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Notification", NotificationSchema);
