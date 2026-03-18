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

async function getPublishedPosts(limit, offset, filter) {
  const query = `
    SELECT id,title,content,published,author_id,created_at
    FROM posts 
    WHERE published = true
  `;

  if (!filter) {
    const { rows } = await pool.query(
      query + ` ORDER BY created_at DESC LIMIT $1 OFFSET $2`,
      [limit, offset],
    );
    return rows;
  }

  let values = [];
  index = 1;

  // author filter
  if (filter.author_id) {
    query += ` AND author_id = $${index}`;
    values.push(filter.author_id);
    index++;
  }

  // search filter
  if (filter.search) {
    query += ` AND (title ILIKE $${index})`;
    values.push(`%${filter.search}%`);
    index++;
  }

  query += ` ORDER BY created_at DESC LIMIT $${index} OFFSET $${index + 1}`;
  values.push(limit, offset);

  const { rows } = await pool.query(query, values);
  return rows;
}

async function getTotalPostsCount(filter) {
  let query = `
    SELECT COUNT(*) FROM posts WHERE published = true
  `;

  let values = [];
  let index = 1;

  if (filter?.author_id) {
    query += ` AND author_id = $${index}`;
    values.push(filter.author_id);
    index++;
  }

  if (filter?.search) {
    query += ` AND title ILIKE $${index}`;
    values.push(`%${filter.search}%`);
    index++;
  }

  const { rows } = await pool.query(query, values);
  return parseInt(rows[0].count);
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

async function likePost(post_id, user_id) {
  const { rows } = await pool.query(
    `INSERT INTO likes (post_id,user_id) VALUES ($1,$2)
    ON CONFLICT (post_id,user_id) DO NOTHING RETURNING *`,
    [post_id, user_id],
  );

  return rows[0];
}

async function unlikePost(post_id, user_id) {
  const { rows } = await pool.query(
    `
    DELETE FROM likes WHERE post_id = $1 AND user_id =$2 RETURNING *
  `,
    [post_id, user_id],
  );

  return rows[0];
}

async function getLikesCount(post_id) {
  const { rows } = await pool.query(
    `
    SELECT COUNT(*) FROM likes WHERE post_id = $1
  `,
    [post_id],
  );

  return parseInt(rows[0].count);
}

module.exports = {
  savePost,
  getPublishedPosts,
  getPostById,
  updatePostById,
  deletePostById,
  getTotalPostsCount,
  likePost,
  unlikePost,
  getLikesCount,
};
