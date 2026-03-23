const pool = require("../db/pool.js");

async function saveUser(username, email, password) {
  const res = await pool.query(
    `INSERT INTO users (username,email,password) VALUES ($1,$2,$3) RETURNING id,username,email `,
    [username, email, password],
  );

  return res.rows[0];
}

async function findUser(email) {
  const res = await pool.query(`SELECT * FROM users WHERE email = $1`, [email]);
  return res.rows[0];
}

async function findUserById(id) {
  const { rows } = await pool.query(
    `SELECT id,username,email,refresh_token FROM users WHERE id = $1`,
    [id],
  );
  return rows[0];
}

module.exports = {
  saveUser,
  findUser,
  findUserById,
};
