const pool = require("../db/pool");

async function getAllCommentsBYPost(postId) {
  const { rows } = await pool.query(
    `
        SELECT c.*,u.username FROM comments c 
        JOIN users u ON c.user_id = u.id
        WHERE c.post_id = $1
        ORDER BY c.created_at ASC
        `,
    [postId],
  );

  return rows;
}

module.exports = {
  getAllCommentsBYPost,
};
