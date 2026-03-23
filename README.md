# Blog API

A robust RESTful API backend for a blogging platform built with [Node.js](https://nodejs.org/) and [Express](https://expressjs.com/). It offers complete CRUD functionality for blog posts, user authentication, a nested comment system, post liking mechanisms, and integrates [Redis](https://redis.io/) for high-performance caching.

## Features

- **Authentication & Authorization:** Secure registration and login using bcrypt and JWT (with access and refresh tokens). Role-based access ensures authors can manage their own unpublished posts securely.
- **Post Management:** Fully functional CRUD operations for authors to manage blog posts. Includes search and pagination support.
- **Engagement System:** Users can like/unlike posts and comment on them. Comments are retrieved with a fully nested hierarchy.
- **Caching:** Blazing-fast response times for posts, post lists, comments, and like counts using Redis caching.
- **Rate Limiting & Security:** Prevent abuse with `express-rate-limit` and `express-slow-down` to throttle excessive requests automatically.
- **PostgreSQL Database:** Relational data management using the `pg` driver to power users, posts, comments, and likes.

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** PostgreSQL (using `pg` driver)
- **Cache:** Redis
- **Security:** bcrypt (password hashing), jsonwebtoken (JWT auth)

## Prerequisites

Before running the project locally, make sure you have the following installed on your machine:

- Node.js (v18+ recommended)
- PostgreSQL
- Redis Server (running locally or remotely) 

## Installation & Setup

1. **Clone the repository** (or navigate to your project directory):
   ```bash
   cd blog-api
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env` file in the root of the project with the following properties:
   ```env
   PORT=3000
   SALT_ROUNDS=10
   JWT_SECRET=your_super_secret_jwt_key
   REFRESH_TOKEN=your_super_secret_refresh_token_key
   ```
   *(Ensure your Redis and PostgreSQL connections in `db/pool.js` and `config/redis.js` match your local development environment credentials).*

4. **Initialize the Database:**
   Use the provided schema in `db.txt` to structure your PostgreSQL database. Run those queries in your preferred SQL client (e.g. `psql`, pgAdmin, or DBeaver). It creates the `blogdb` database and `users`, `posts`, `comments`, and `likes` tables.

5. **Start the Server:**
   The project is configured to watch for file changes automatically using Node's native `--watch` flag.
   ```bash
   npm start
   ```
   The server will start at `http://localhost:3000`.

## API Endpoints Reference

### 🔐 Authentication (`/api/auth`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `POST` | `/register` | Register a new user account | ❌ |
| `POST` | `/login` | Authenticate and obtain JWTs | ❌ |
| `POST` | `/logout` | Logout / clear refresh token | ✅ |
| `POST` | `/refresh-token` | Obtain a new access token | ❌ |

### 📝 Posts (`/api/posts`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `GET` | `/` | Get paginated published posts (supports `search` & `author_id` queries) | ❌ |
| `GET` | `/:id` | Fetch a single post (Authors can view their unpublished posts) | Optional |
| `POST` | `/` | Create a new blog post | ✅ |
| `PUT` | `/:id` | Update an existing post using its ID | ✅ |
| `DELETE` | `/:id` | Drop a post entirely | ✅ |

### ❤️ Likes (`/api/posts/:id/like*`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `GET` | `/likes` | Get the total number of likes for a post | ❌ |
| `POST` | `/like` | Like a specific post | ✅ |
| `DELETE` | `/like` | Unlike a specific post | ✅ |

### 💬 Comments (`/api/posts/:id/comments`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `GET` | `/nested` | Get all comments under a post mapped in a nested parent-child tree | ❌ |

## Project Structure Highlights

- `/config` — Redis initialization.
- `/controllers` — Handlers routing requests to business logic and views.
- `/db` — PostgreSQL connection pool and population utilities.
- `/middleware` — Custom middlewares for rate-limiting and authorization (`verifyToken`, `optionalAuth`).
- `/models` — Database query functions mapping to data structures.
- `/routes` — API endpoint declarations.
- `/utils` — Utilities like token generation and validators.

## License
MIT
