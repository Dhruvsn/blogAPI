const express = require("express");
const router = express.Router();

const loginLimiter = require("../middleware/rateLimitMiddleware.js");
const {
  registerUser,
  loginUser,
  refreshToken,
  logoutUser,
} = require("../controllers/authController");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.post("/refresh-token", refreshToken);

module.exports = router;
