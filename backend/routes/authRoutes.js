const express = require("express");
const router = express.Router();
const { register, login, getCurrentUser, refresh } = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/register", register);
router.post("/login", login);
router.post("/refresh", refresh); // 👈 new
router.get("/me", authMiddleware, getCurrentUser);
router.get("/current-user", authMiddleware, getCurrentUser);

module.exports = router;

