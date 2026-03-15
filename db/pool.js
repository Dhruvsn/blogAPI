const { Pool } = require("pg");

const pool = new Pool({
  host: "localhost",
  user: "batman",
  password: "password",
  database: "blogdb",
  port: 5432,
});

module.exports = pool;
