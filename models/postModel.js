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

async function getPostById(id) {
  const { rows } = await pool.query(
    `
    Select id,title,content,published,author_id,created_at
    FROM posts WHERE id = $1 AND published = true`,
    [id],
  );
  return rows[0];
}

async function updatePostById(id, data) {
  const { title, content, published } = data;

  const { rows } = await pool.query(
    `
    UPDATE posts
    SET 
      title = COALESCE($2, title),
      content = COALESCE($3, content),
      published = COALESCE($4, published)
    WHERE id = $1
    RETURNING id, title, content, published, author_id, created_at
    `,
    [id, title, content, published],
  );

  return rows[0];
}

async function deletePostById(id) {
  const { rows } = await pool.query(
    `
    DELETE FROM posts WHERE id = $1 
    RETURNING id,title,content,author_id
    `,
    [id],
  );

  return rows[0];
}

module.exports = {
  savePost,
  getPublishedPosts,
  getPostById,
  updatePostById,
  deletePostById,
};
