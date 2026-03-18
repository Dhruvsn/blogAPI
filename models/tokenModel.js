const pool = require("../db/pool");

async function saveRefreshToken(refresh_token, user) {
  await pool.query(
    `
        UPDATE users SET refresh_token = $1 WHERE id = $2
        `,
    [refresh_token, user.id],
  );
}

module.exports = { saveRefreshToken };
