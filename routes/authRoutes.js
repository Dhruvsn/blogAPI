const express = require("express");
const router = express.Router();

const loginLimiter = require("../middleware/rateLimitMiddleware.js");
const { registerUser, loginUser } = require("../controllers/authController");

router.post("/register", registerUser);
router.post("/login", loginLimiter, loginUser);

module.exports = router;
