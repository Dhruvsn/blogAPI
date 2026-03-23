const {
  savePost,
  getPublishedPosts,
  getPostById,
  updatePostById,
  deletePostById,
  getTotalPostsCount,
  likePost,
  unlikePost,
  getLikesCount,
} = require("../models/postModel");

const redisClient = require("../config/redis");

async function clearPostListCache() {
  try {
    const keys = await redisClient.keys("posts:*");
    if (keys && keys.length > 0) {
      await redisClient.del(keys);
    }
  } catch (err) {
    console.error("Cache clear error: ", err);
  }
}
// create post flow

async function createPost(req, res) {
  // get title/content/published from req
  const { title, content, published = false } = req.body;
  if (!title?.trim() || !content?.trim()) {
    return res.status(400).json({
      message: "Invalid input!",
    });
  }
  try {
    const author_id = req.user.id;

    const post = await savePost(title, content, published, author_id);
    if (!post) {
      throw new Error("Error while saving post in the db");
    }

    await clearPostListCache();

    res.status(201).json({
      message: "post created successfully!",
      post,
    });
  } catch (error) {
    console.error("error: ", error);
    return res.status(500).json({
      message: "Internal server error!",
    });
  }
}

// get all published posts
async function getPosts(req, res) {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));

  const offset = (page - 1) * limit;
  const { author_id, search } = req.query;
  // uniqe cache key
  const cacheKey = `posts:${page}:${limit}:${author_id || "all"}:${search || "none"}`;
  try {
    // check data in chache
    const cachedData = await redisClient.get(cacheKey);

    if (cachedData) {
      // console.log("data from cache");
      return res.status(200).json(JSON.parse(cachedData));
    }

    // not in cach -> fetch from db.

    const posts = await getPublishedPosts(limit, offset, {
      author_id,
      search,
    });

    const total = await getTotalPostsCount({
      author_id,
      search,
    });

    const response = {
      success: true,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      data: posts,
    };

    // save data in cache
    await redisClient.setEx(cacheKey, 3600, JSON.stringify(response));
    return res.status(200).json(response);
  } catch (error) {
    console.error("error: ", error.message);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
}

async function getSinglePost(req, res) {
  const postId = req.params.id;

  if (isNaN(postId)) {
    return res.status(400).json({
      message: "Invalid post Id",
    });
  }

  const cacheKey = `post:${postId}`;

  try {
    const cachedPost = await redisClient.get(cacheKey);

    if (cachedPost) {
      return res.status(200).json(JSON.parse(cachedPost));
    }

    const post = await getPostById(postId);
    if (!post) {
      return res.status(404).json({
        message: "Post not found!",
      });
    }

    if (!post.published) {
      if (!req.user) {
        return res.status(403).json({
          message: "This post is not published",
        });
      }
    }

    // logged in but NOT author or admin -> deny
    if (req.user.id !== post.author_id && req.user.role !== "admin") {
      return res.status(403).json({
        message: "you are not allowed to view this post",
      });
    }

    // store the cache
    await redisClient.setEx(cacheKey, 3600, JSON.stringify(post));

    res.status(200).json({
      message: "Post fetched successfully!",
      post,
    });
  } catch (error) {
    console.error("error: ", error.message);
    return res.status(500).json({
      message: "Internal server error!",
    });
  }
}

async function updatePost(req, res) {
  const id = parseInt(req.params.id);

  if (isNaN(id)) {
    return res.status(400).json({
      message: "Invalid post ID",
    });
  }

  const { title, content, published } = req.body;

  if (title === undefined && content === undefined && published === undefined) {
    return res.status(400).json({
      message: "At least one field is required to update",
    });
  }

  try {
    const post = await getPostById(id);

    if (!post) {
      return res.status(404).json({
        message: "Post not found!",
      });
    }

    // 🔥 Authorization
    if (post.author_id !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({
        message: "You are not allowed to update this post",
      });
    }

    const updatedPost = await updatePostById(id, {
      title,
      content,
      published,
    });

    await clearPostListCache();
    await redisClient.del(`post:${id}`);

    res.status(200).json({
      success: true,
      data: updatedPost,
    });
  } catch (err) {
    console.error("error: ", err.message);
    return res.status(500).json({
      message: "Internal server error!",
    });
  }
}

// delete post controller function
async function deletePost(req, res) {
  const id = parseInt(req.params.id);

  if (isNaN(id)) {
    return res.status(400).json({
      message: "Invalid input id",
    });
  }

  try {
    const post = await getPostById(id);

    if (!post) {
      return res.status(404).json({
        message: "Post not found!",
      });
    }

    // authenticate user
    if (post.author_id !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({
        message: "you are not allowed to delete the post",
      });
    }

    const deletedPost = await deletePostById(id);

    await clearPostListCache();
    await redisClient.del(`post:${id}`);
    await redisClient.del(`likes:${id}`);

    res.status(200).json({
      success: true,
      message: "post delete successfully",
      data: deletedPost,
    });
  } catch (err) {
    console.log("Error", err.message);
    return res.status(500).json({
      message: "Internal server error!",
    });
  }
}

async function likePostController(req, res) {
  const post_id = parseInt(req.params.id);
  const user_id = req.user.id;

  if (isNaN(post_id)) {
    return res.status(400).json({
      message: "Invalid post id",
    });
  }

  try {
    await likePost(post_id, user_id);

    await redisClient.del(`likes:${post_id}`);

    res.status(200).json({
      message: "Post liked successfully!",
    });
  } catch (err) {
    console.error("error: ", err.message);
    return res.status(500).json({
      message: "Internal server error!",
    });
  }
}

async function unlikePostController(req, res) {
  const post_id = parseInt(req.params.id);
  const user_id = req.user.id;

  if (isNaN(post_id)) {
    return res.status(400).json({
      message: "Invalid post id",
    });
  }

  try {
    await unlikePost(post_id, user_id);

    await redisClient.del(`likes:${post_id}`);

    res.status(200).json({
      message: "Post unliked successfully!",
    });
  } catch (err) {
    console.error("error: ", err.message);
    return res.status(500).json({
      message: "Internal server error!",
    });
  }
}

// get likes of a post
async function getLikes(req, res) {
  const postId = parseInt(req.params.id);
  const cacheKey = `likes:${postId}`;

  try {
    const cachedLikes = await redisClient.get(cacheKey);

    if (cachedLikes) {
      return res.status(200).json({ likes: parseInt(cachedLikes) });
    }

    const count = await getLikesCount(postId);

    await redisClient.setEx(cacheKey, 3600, count.toString());

    res.status(200).json({
      likes: count,
    });
  } catch (err) {
    res.status(500).json({
      message: "Internal server error",
    });
  }
}

module.exports = {
  createPost,
  getPosts,
  getSinglePost,
  updatePost,
  deletePost,
  likePostController,
  unlikePostController,
  getLikes
};
