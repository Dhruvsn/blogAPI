const express = require("express");
const app = express();

require("dotenv").config();
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
