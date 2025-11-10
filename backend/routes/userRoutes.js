const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const permissionMiddleware = require("../middleware/permissionMiddleware");
const userController = require('../controllers/userController');
const User = require('../models/User');
const notificationService = require("../services/notificationService");
const notificationTriggerService = require("../services/notificationTriggerService");
const multer = require('multer');
const path = require('path');

// Get current user
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ user });
  } catch (e) {
    res.status(500).json({ message: 'Error fetching user', error: e.message });
  }
});

// Update current user profile
router.put('/me', auth, async (req, res) => {
  try {
    const { firstName, lastName, phone, email, bio } = req.body;
    const user = await User.findOne({ user_id: req.user.user_id, company_id: req.user.company_id });
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    // Update allowed fields
    if (firstName !== undefined) user.firstName = firstName.trim();
    if (lastName !== undefined) user.lastName = lastName.trim();
    if (phone !== undefined) user.phone = phone.trim();
    if (email !== undefined) user.email = email.trim();
    if (bio !== undefined) user.bio = bio.trim();
    
    await user.save();
    
    res.json({ 
      message: 'Profile updated successfully', 
      user: { 
        _id: user._id, 
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        email: user.email,
        bio: user.bio,
        avatarUrl: user.avatarUrl 
      } 
    });
  } catch (e) {
    console.error('Profile update error:', e);
    res.status(500).json({ message: 'Error updating profile', error: e.message });
  }
});

// ===== Avatar upload (multipart/form-data) =====
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '..', 'uploads', 'avatars'));
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname) || '.jpg';
    cb(null, `${req.user._id}-${Date.now()}${ext}`);
  }
});
const upload = multer({ storage });

router.post('/me/avatar', auth, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    const relPath = `/uploads/avatars/${req.file.filename}`;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.avatarUrl = relPath;
    await user.save();
    res.json({ message: 'Avatar uploaded', avatarUrl: relPath });
  } catch (e) {
    res.status(500).json({ message: 'Error uploading avatar', error: e.message });
  }
});

// (Do not export yet; additional routes below)

// Test route to verify MongoDB Atlas connection (no auth required)
router.get("/test", async (req, res) => {
  try {
    const users = await User.find({}).select("-password").limit(5);
    res.json({ 
      message: "MongoDB Atlas connection working!", 
      users: users,
      count: users.length 
    });
  } catch (e) {
    res.status(500).json({ message: "MongoDB Atlas connection failed: " + e.message });
  }
});

// List users by company (with auth)
router.get("/", auth, async (req, res) => {
  try {
    const companyId = req.query.company_id || req.user.company_id;
    const users = await User.find({ company_id: companyId }).select("-password");
    res.json(users);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

// Simple endpoint to get all users (for frontend testing)
router.get("/all", async (req, res) => {
  try {
    const users = await User.find({}).select("-password");
    res.json(users);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

// Test route to create user without auth (for testing MongoDB Atlas)
router.post("/test", async (req, res) => {
  try {
    const { firstName, lastName, email, password, phone, role, company_id } = req.body;
    const bcrypt = require("bcryptjs");
    const hashedPassword = await bcrypt.hash(password || "test123", 10);
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User with this email already exists" });
    }

    const created = await User.create({
      company_id: company_id || "RESSICHEM",
      user_id: `test_${Date.now()}`,
      email,
      password: hashedPassword,
      firstName: firstName || "Test",
      lastName: lastName || "User",
      phone: phone || "+92-300-1234567",
      role: role || "Staff",
      isActive: true
    });

    console.log(`✅ Test user created successfully in MongoDB Atlas: ${email}`);

    res.status(201).json({
      message: "User created successfully in MongoDB Atlas!",
      user: {
        _id: created._id,
        company_id: created.company_id,
        user_id: created.user_id,
        email: created.email,
        firstName: created.firstName,
        lastName: created.lastName,
        phone: created.phone,
        role: created.role
      }
    });
  } catch (e) {
    console.error("Error creating test user:", e);
    res.status(500).json({ message: "Failed to create user: " + e.message });
  }
});

// User creation endpoint using userController (supports customer creation)
router.post("/create", auth, userController.createUser);

// Create user (admin-only)
router.post(
  "/",
  auth,
  permissionMiddleware(["create_user"]),
  async (req, res) => {
    try {
      const { company_id, user_id, email, password, department, roleIds } = req.body;
      const bcrypt = require("bcryptjs");
      const hashedPassword = await bcrypt.hash(password, 10);
      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: "User with this email already exists" });
      }

      const created = await User.create({
        company_id: company_id || req.user.company_id,
        user_id,
        email,
        password: hashedPassword,
        department,
        roles: Array.isArray(roleIds) ? roleIds : []
      });

      console.log(`✅ User created successfully: ${email} with user_id: ${user_id}`);

      // Send notification about new user
      try {
        // Construct createdBy object with proper name handling
        let createdBy;
        if (req.user) {
          // Construct name from firstName and lastName, or use email
          const name = req.user.firstName || req.user.lastName 
            ? `${req.user.firstName || ''} ${req.user.lastName || ''}`.trim()
            : req.user.email || 'Unknown User';
          
          createdBy = {
            _id: req.user._id || req.user.user_id || 'system',
            name: name,
            email: req.user.email || 'system@ressichem.com'
          };
        } else {
          createdBy = { _id: 'system', name: 'System', email: 'system@ressichem.com' };
        }
        
        await notificationTriggerService.triggerUserCreated(created, createdBy);
      } catch (notificationError) {
        console.error("Failed to send user creation notification:", notificationError);
        // Don't fail the user creation if notification fails
      }

      res.status(201).json({
        _id: created._id,
        company_id: created.company_id,
        user_id: created.user_id,
        email: created.email,
        department: created.department,
        roles: created.roles
      });
    } catch (e) {
      res.status(400).json({ message: e.message });
    }
  }
);

// Update user
router.put(
  "/:id",
  auth,
  permissionMiddleware(["update_user"]),
  async (req, res) => {
    try {
      const oldUser = await User.findById(req.params.id);
      const updated = await User.findByIdAndUpdate(req.params.id, req.body, { new: true }).select("-password");
      if (!updated) return res.status(404).json({ message: "Not found" });

      // Send notification about user update
      try {
        await notificationTriggerService.triggerUserUpdated(updated, req.user, req.body);
      } catch (notificationError) {
        console.error("Failed to send user update notification:", notificationError);
        // Don't fail the user update if notification fails
      }

      res.json(updated);
    } catch (e) {
      res.status(400).json({ message: e.message });
    }
  }
);

// Delete user
router.delete(
  "/:id",
  auth,
  permissionMiddleware(["delete_user"]),
  async (req, res) => {
    try {
      const deleted = await User.findByIdAndDelete(req.params.id);
      if (!deleted) return res.status(404).json({ message: "Not found" });
      res.json({ message: "Deleted" });
    } catch (e) {
      res.status(400).json({ message: e.message });
    }
  }
);

// Reset user password (admin-only)
router.put(
  "/:userId/reset-password",
  auth,
  permissionMiddleware(["create_user"]),
  async (req, res) => {
    try {
      const { userId } = req.params;
      const { newPassword } = req.body;
      
      if (!newPassword || newPassword.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters long" });
      }

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const bcrypt = require("bcryptjs");
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword;
      await user.save();

      console.log(`✅ Password reset for user: ${user.email}`);

      res.json({
        success: true,
        message: "Password reset successfully"
      });
    } catch (e) {
      console.error("Password reset error:", e);
      res.status(500).json({ message: "Failed to reset password" });
    }
  }
);

module.exports = router;

