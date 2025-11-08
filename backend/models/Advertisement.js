// backend/models/Advertisement.js
const mongoose = require("mongoose");

const AdvertisementSchema = new mongoose.Schema({
  company_id: { type: String, required: true, index: true }, // Multi-tenant support
  title: { type: String, required: true },
  description: { type: String },
  
  // Media
  image: { type: String, required: true }, // Image URL/path
  imageAlt: { type: String }, // Alt text for accessibility
  video: { type: String }, // Optional video URL
  
  // Link/Action
  link: { type: String }, // Where the ad should link to
  linkText: { type: String, default: "Learn More" }, // Call-to-action button text
  
  // Display settings
  displayLocation: { 
    type: String, 
    enum: ['homepage', 'dashboard', 'product-page', 'category-page', 'sidebar', 'header', 'footer', 'all'],
    default: 'all'
  },
  position: { 
    type: String, 
    enum: ['top', 'middle', 'bottom', 'sidebar', 'header', 'footer', 'carousel'],
    default: 'carousel'
  },
  displayOrder: { type: Number, default: 0 }, // For sorting advertisements
  
  // Scheduling
  startDate: { type: Date }, // When the ad should start showing
  endDate: { type: Date }, // When the ad should stop showing
  isActive: { type: Boolean, default: true }, // Manual activation/deactivation
  
  // Target audience (optional)
  targetAudience: {
    type: String,
    enum: ['all', 'customers', 'users', 'managers', 'admins', 'specific'],
    default: 'all'
  },
  targetUserIds: [{ type: String }], // Specific user IDs if targetAudience is 'specific'
  targetRoles: [{ type: String }], // Specific roles
  
  // Analytics (optional)
  views: { type: Number, default: 0 }, // Number of times ad was viewed
  clicks: { type: Number, default: 0 }, // Number of times ad was clicked
  impressions: { type: Number, default: 0 }, // Total impressions
  
  // Metadata
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
}, {
  timestamps: true // Automatically adds createdAt and updatedAt
});

// Indexes for better query performance
AdvertisementSchema.index({ company_id: 1, isActive: 1 });
AdvertisementSchema.index({ company_id: 1, displayLocation: 1 });
AdvertisementSchema.index({ company_id: 1, position: 1 });
AdvertisementSchema.index({ startDate: 1, endDate: 1 });
AdvertisementSchema.index({ displayOrder: 1 });

// Text search index
AdvertisementSchema.index({ title: "text", description: "text" });

module.exports = mongoose.model("Advertisement", AdvertisementSchema);

