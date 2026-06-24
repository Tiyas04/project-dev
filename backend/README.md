# 💻 DevArena - Backend REST API

[![Node.js](https://img.shields.io/badge/Node.js-20.x-green.svg)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-5.x-lightgrey.svg)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-brightgreen.svg)](https://mongoosejs.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

Welcome to the backend REST API for **DevArena**. This is a Node.js and Express server that handles user authentication, connects developer accounts across multiple platforms, aggregates competitive programming metrics, and serves real-time analysis to the frontend.

---

## 🚀 Key Features

- **🔒 Authentication & OAuth:** Stateless authentication using JWT (Access & Refresh tokens) and safe HTTP-Only cookies, with integration for Google OAuth login.
- **🔄 Platform Synchronization Service:** Aggregates statistics, heatmaps, rating timelines, and solved problem details from LeetCode, Codeforces, and GitHub.
- **⚡ Rate-Limit Prevention:** Includes sanitized token authorization (via `GITHUB_TOKEN` environment variable) and a custom User-Agent configuration to prevent API blocks in cloud/production environments.
- **📂 Client-Side Solved Problem Caching:** Specifically stores a list of historically solved LeetCode problems in MongoDB, parsing only new solves during syncs to avoid hitting LeetCode GraphQL rate limits.
- **🎨 Topic Classification Engine:** Dynamically maps LeetCode tag metrics and Codeforces problem ratings into Arrays, DP, Graphs, Math, Trees, and Strings topic data.
- **🌐 Active Keep-Alive Utility:** Background keep-alive utility that self-pings the server at regular intervals to prevent free-tier containers (e.g. Render) from entering sleep mode.

---

## 🛠️ Environment Configuration

Create a `.env` file in the root of the `backend/` directory and configure the following variables:

```env
PORT=5000
MONGODB_URI=your_mongodb_atlas_connection_string
CORS_ORIGIN=http://localhost:3000
ACCESS_TOKEN_SECRET=your_jwt_access_secret_key
ACCESS_TOKEN_EXPIRY=7d
REFRESH_TOKEN_SECRET=your_jwt_refresh_secret_key
REFRESH_TOKEN_EXPIRY=30d
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
GOOGLE_CLIENT_ID=your_google_oauth_client_id
SERVER_URL=http://localhost:5000
GITHUB_TOKEN=your_github_token
```

---

## 🏃‍♂️ Getting Started

### Installation

1. **Navigate to the backend folder:**
   ```bash
   cd backend
   ```
2. **Install package dependencies:**
   ```bash
   npm install
   ```

### Running Server

- **Development Mode (with Hot Reloading & Dotenv preloading):**
   ```bash
   npm run dev
   ```
- **Production Mode:**
   ```bash
   npm start
   ```

The server runs on [http://localhost:5000](http://localhost:5000) by default.

---

## 📁 Directory Structure

```text
backend/
├── src/
│   ├── app.js         # Express setup, CORS, cookies, and route declarations
│   ├── index.js       # App entry point, DB connector, and port listener
│   ├── controllers/   # Route controller logic (auth, user, connected accounts)
│   ├── db/            # Database connection management and configuration
│   ├── models/        # Mongoose database collections (User, ConnectedAccount)
│   ├── routes/        # Express API endpoints
│   ├── middlewares/   # Custom middlewars (JWT auth validation, Multer files)
│   └── utils/         # Helper functions (ApiError, Cloudinary upload, platform fetchers)
├── .env               # Environment configuration (ignored by Git)
├── package.json       # Backend dependencies and configuration
└── README.md          # Backend documentation
```
