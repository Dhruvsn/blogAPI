const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/verifyTokenMiddleware.js");
const {
  registerUser,
  loginUser,
  refreshToken,
  logoutUser,
} = require("../controllers/authController");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", verifyToken, logoutUser);
router.post("/refresh-token", refreshToken);

module.exports = router;
