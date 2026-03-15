const { savePost, getPublishedPosts } = require("../models/postModel");
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
module.exports = {
  createPost,
  getPosts,
};
