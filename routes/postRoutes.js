const express = require("express");
const router = express.Router();

const verifyToken = require("../middleware/verfiyTokenMiddleware");
const optionalAuth = require("../middleware/optionalAuthMiddleware");
const {
  createPost,
  getPosts,
  getSinglePost,
  updatePost,
  deletePost,
} = require("../controllers/postController");

router.post("/posts", verifyToken, createPost);
router.get("/posts/:id", optionalAuth, getSinglePost);
router.get("/posts", getPosts);
router.put("/posts/:id", verifyToken, updatePost);
router.delete("/posts/:id", verifyToken, deletePost);

module.exports = router;
