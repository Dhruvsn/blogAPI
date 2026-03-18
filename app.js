const express = require("express");
const app = express();
const {
  rateLimiter,
  speedLimiter,
} = require("./middleware/rateLimitMiddleware.js");

require("dotenv").config();
app.use(rateLimiter);
app.use(speedLimiter);
// routes
const authRoutes = require("./routes/authRoutes");
const postRoutes = require("./routes/postRoutes");

// middleware
app.use(express.json());

// base route
app.get("/", (req, res) => {
  res.send("Blog API running");
});

// register routes
app.use("/api/auth", authRoutes);
app.use("/api", postRoutes);

module.exports = app;
