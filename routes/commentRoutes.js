const express = require("express");
const router = express.Router();
const { getCommentsWithReplies } = require("../controllers/commentController");
router.get("/posts/:id/comments/nested", getCommentsWithReplies);

module.exports = router;
