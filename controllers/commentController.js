const { getAllCommentsBYPost } = require("../models/commentModel");
const redisClient = require("../config/redis");
const { cache } = require("react");

// convert to Nested Structure

function buildNestedComments(comments) {
  const map = {};
  const result = [];

  // Step 1: Initialize map
  comments.forEach((comment) => {
    map[comment.id] = { ...comment, replies: [] };
  });

  // step 2: Build tree
  comments.forEach((comment) => {
    if (comment.parent_id === null) {
      result.push(map[comment.id]); // root comment
    } else {
      map[comment.parent_id]?.replies.push(map[comment.id]);
    }
  });

  return result;
}

async function getCommentsWithReplies(req, res) {
  const postId = parseInt(req.params.id);

  if (isNaN(postId)) {
    return res.status(400).json({
      message: "Invalid post ID",
    });
  }

  const cacheKey = `comments:${postId}`;

  try {
    // ✅ 1. Check cache
    const cachedComments = await redisClient.get(cacheKey);

    if (cachedComments) {
      return res.status(200).json(JSON.parse(cachedComments));
    }

    // ✅ 2. Fetch from DB
    const comments = await getAllCommentsByPost(postId);

    if (!comments || comments.length === 0) {
      const emptyResponse = {
        success: true,
        data: [],
      };

      // Cache empty result (short TTL)
      await redisClient.setEx(cacheKey, 60, JSON.stringify(emptyResponse));

      return res.status(200).json(emptyResponse);
    }

    // ✅ 3. Build nested structure
    const nestedComments = buildNestedComments(comments);

    const response = {
      success: true,
      data: nestedComments,
    };

    // ✅ 4. Store in cache (1 hour)
    await redisClient.setEx(cacheKey, 3600, JSON.stringify(response));

    // ✅ 5. Send response
    res.status(200).json(response);

  } catch (err) {
    console.error("Error:", err.message);

    res.status(500).json({
      message: "Internal server error",
    });
  }
}

module.exports = {
  getCommentsWithReplies,
};
