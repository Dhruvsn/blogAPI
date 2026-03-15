#! /usr/bin/env node

require("dotenv").config();
const { Client } = require("pg");
const SQL = `


CREATE TABLE IF NOT EXISTS users(
id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
username VARCHAR(100) NOT NULL,
email VARCHAR(100) UNIQUE NOT NULL,
password TEXT NOT NULL,
role VARCHAR(20) DEFAULT 'AUTHOR',
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS posts(
id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
title VARCHAR(200) NOT NULL,
content TEXT NOT NULL,
published BOOLEAN DEFAULT FALSE,
author_id INT NOT NULL,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS comments(
id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
content TEXT NOT NULL,
post_id INT NOT NULL,
user_id INT,
username VARCHAR(100),
email VARCHAR(100),
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);


`;
DB_URL = "postgresql://batman:password@localhost:5432/blogdb";
console.log(DB_URL); // why is show undefined : because we need to load env variables before using them, so we need to call require("dotenv").config() at the top of the file

const main = async () => {
  const client = new Client({
    connectionString: DB_URL,
  });

  try {
    await client.connect();
    await client.query(SQL);
    console.log("Tables created");
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await client.end();
  }
};

main();
