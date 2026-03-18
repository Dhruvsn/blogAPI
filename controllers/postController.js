const {
  savePost,
  getPublishedPosts,
  getPostById,
  updatePostById,
  deletePostById,
} = require("../models/postModel");

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
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  const offset = (page - 1) * limit;
  try {
    const posts = await getPublishedPosts(limit, offset);

    res.status(200).json({
      message: "post fetched successfully!",
      posts,
    });
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
  try {
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

    res.status(200).json({
      message: "Post fetched successfully!",
      post,
    });
  } catch (error) {
    console.error("error: ", error.message);
    res.status(200).json({
      success: true,
      data: post,
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
    if (post.author_id !== user.id && req.user.role !== "admin") {
      return res.status(403).json({
        message: "you are not allowed to delete the post",
      });
    }

    const deletePost = await deletePostById(id);

    res.status(200).json({
      success: true,
      message: "post delete successfully",
      data: deletePost,
    });
  } catch (err) {
    console.log("Error", err.message);
    return res.status(500).json({
      message: "Internal server error!",
    });
  }
}

module.exports = {
  createPost,
  getPosts,
  getSinglePost,
  updatePost,
  deletePost,
};
