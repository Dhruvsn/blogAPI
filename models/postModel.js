const pool = require("../db/pool");

async function savePost(title, content, published, author_id) {
  const { rows } = await pool.query(
    `
        INSERT INTO posts(title,content,published,author_id) VALUES($1,$2,$3,$4)
        RETURNING id,title,content,published,author_id,created_at
        
        `,
    [title, content, published, author_id],
  );

  return rows[0];
}

async function getPublishedPosts(limit, offset) {
  const { rows } = await pool.query(
    `
    SELECT id,title,content,author_id,created_at 
    FROM posts
    WHERE published = true ORDER BY created_at DESC LIMIT $1 OFFSET $2
    `,
    [limit, offset],
  );

  return rows;
}

module.exports = {
  savePost,
  getPublishedPosts,
};
