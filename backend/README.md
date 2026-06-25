# DevArena Backend

> **Robust, scalable REST API driving the DevArena platform.**

The backend service is responsible for user authentication, platform data synchronization (LeetCode, Codeforces, GitHub), metric aggregation, and serving real-time analytics to the frontend.

---

## Key Features

- **Authentication & OAuth**  
  Stateless authentication utilizing JWT (Access & Refresh tokens), secure HTTP-Only cookies, and Google OAuth integration.
- **Platform Synchronization**  
  Aggregates statistics, heatmaps, rating timelines, and solved problem details across multiple competitive programming platforms.
- **Rate-Limit Prevention**  
  Employs sanitized token authorization and custom User-Agent configurations to bypass API blocks in cloud environments.
- **Smart Data Caching**  
  Stores historically solved problems locally in MongoDB, only querying and parsing new solves to respect external API rate limits.
- **Topic Classification Engine**  
  Dynamically maps problem tags and ratings into unified categories (Arrays, DP, Graphs, Math, Trees, Strings).
- **Active Keep-Alive Utility**  
  Background self-pinging mechanism preventing sleep mode on free-tier hosting platforms.

---

## Environment Configuration

Create a `.env` file in the `backend/` directory:

```env
PORT=5000
MONGODB_URI=your_mongodb_atlas_connection_string
CORS_ORIGIN=http://localhost:3000
ACCESS_TOKEN_SECRET=your_jwt_access_secret
ACCESS_TOKEN_EXPIRY=7d
REFRESH_TOKEN_SECRET=your_jwt_refresh_secret
REFRESH_TOKEN_EXPIRY=30d
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
GOOGLE_CLIENT_ID=your_google_oauth_client_id
SERVER_URL=http://localhost:5000
GITHUB_TOKEN=your_github_token
```

---

## Getting Started

### Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

### Running the Server

- **Development Mode** (with Hot Reloading):
  ```bash
  npm run dev
  ```
- **Production Mode:**
  ```bash
  npm start
  ```

The API runs on `http://localhost:5000` by default.

---

## Architecture Overview

```text
backend/
├── src/
│   ├── controllers/
│   │   ├── connectedAccount.controller.js
│   │   └── user.controller.js
│   ├── db/
│   │   └── connectDB.js
│   ├── middlewares/
│   │   ├── auth.middleware.js
│   │   └── multer.middleware.js
│   ├── models/
│   │   ├── connectedAccount.model.js
│   │   ├── follow.model.js
│   │   └── user.model.js
│   ├── routes/
│   │   ├── connectedAccount.route.js
│   │   └── user.route.js
│   ├── utils/
│   │   ├── ApiError.js
│   │   ├── Apiresponse.js
│   │   ├── AsyncHandler.js
│   │   ├── cloudinary.js
│   │   ├── keepAlive.js
│   │   ├── platformFetchers.js
│   │   └── userEnricher.js
│   ├── app.js
│   └── index.js
```
