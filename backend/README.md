# 💻 Project Dev - Backend API

[![Node.js](https://img.shields.io/badge/Node.js-18.x-green.svg)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-5.x-lightgrey.svg)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-brightgreen.svg)](https://mongoosejs.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

Welcome to the backend API for **Project Dev**. This is a robust RESTful API built with Node.js and Express, designed to power the frontend with secure authentication, database management, and media file handling.

---

## 🚀 Key Features

- **Robust Framework:** Built on top of Express.js for scalable routing and middleware management.
- **Database Integration:** Seamless MongoDB object modeling via Mongoose, including advanced aggregation pagination.
- **Secure Authentication:** JWT-based stateless authentication and secure cookie parsing.
- **Media Uploads:** Integrated with `multer` for local file handling and `cloudinary` for cloud-based media storage.
- **Developer Friendly:** Hot-reloading enabled via `nodemon` and strict code formatting via `prettier`.

---

## 🛠️ Tech Stack & Dependencies

| Technology | Purpose |
| :--- | :--- |
| **Express** | Fast, unopinionated web framework for routing. |
| **Mongoose** | Elegant MongoDB object modeling for Node.js. |
| **JWT** | JSON Web Tokens for secure API authorization. |
| **Multer & Cloudinary** | Handling multipart/form-data and cloud media storage. |
| **Cors & Cookie Parser** | Cross-Origin Resource Sharing and secure cookie management. |
| **Dotenv** | Zero-dependency module that loads environment variables. |

---

## 🚦 Getting Started

Follow these instructions to get a copy of the backend up and running on your local machine for development and testing purposes.

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [MongoDB](https://www.mongodb.com/) (Local instance or MongoDB Atlas URI)
- [Cloudinary Account](https://cloudinary.com/) (For media uploads)

### Installation

1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **Install the project dependencies:**
   ```bash
   npm install
   ```

3. **Environment Configuration:**
   Create a `.env` file in the root of the `backend` directory and add the following variables:
   ```env
   PORT=8000
   MONGODB_URI=your_mongodb_connection_string
   CORS_ORIGIN=*

   # JWT Secrets
   ACCESS_TOKEN_SECRET=your_access_token_secret
   ACCESS_TOKEN_EXPIRY=1d
   REFRESH_TOKEN_SECRET=your_refresh_token_secret
   REFRESH_TOKEN_EXPIRY=10d

   # Cloudinary Credentials
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```

### 🏃‍♂️ Running the Server

- **Development Mode (with auto-restart):**
  ```bash
  npm run dev
  ```
  *This uses `nodemon` and preloads `.env` variables automatically.*

- **Production Mode:**
  ```bash
  npm start
  ```

Once started, the server will listen on the port specified in your `.env` file (defaults to `3000` if not specified).

---

## 📁 Directory Structure

```text
backend/
├── src/
│   ├── app.js         # Express app setup and middleware configuration
│   ├── index.js       # Database connection and server initialization
│   ├── controllers/   # Request handlers (business logic)
│   ├── models/        # Mongoose database schemas
│   ├── routes/        # API route definitions
│   ├── middlewares/   # Custom Express middlewares (auth, upload)
│   └── utils/         # Helper functions (API errors, Cloudinary upload)
├── .env               # Environment variables (Ignored by Git)
├── .prettierrc        # Prettier formatting rules
├── package.json       # Dependencies and NPM scripts
└── README.md          # Backend documentation
```

---

## 📝 Notes & Next Steps

- **Typography & Formatting:** The project is configured with Prettier (`.prettierrc`). You can run formatting extensions via your IDE.
- **Database Aggregation:** This project uses `mongoose-aggregate-paginate-v2` to support complex query pagination easily. 
