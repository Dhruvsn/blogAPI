const express = require("express");
const router = express.Router();

const verifyToken = require("../middleware/verfiyTokenMiddleware");
const { createPost, getPosts } = require("../controllers/postController");

router.post("/posts", verifyToken, createPost);
router.get("/posts", getPosts);

module.exports = router;
