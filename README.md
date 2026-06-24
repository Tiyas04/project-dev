# 💻 DevArena - AI-Powered Competitive Programming Analytics Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Version](https://img.shields.io/badge/version-1.0.0--beta-orange.svg)](#)
[![Status](https://img.shields.io/badge/status-active-success.svg)](#)

Welcome to **DevArena**! DevArena is a modern, all-in-one competitive programming analytics dashboard and developer profile tracker. It aggregates data from multiple platforms—**LeetCode**, **Codeforces**, and **GitHub**—transforming raw API responses and statistics into beautiful, actionable visualizations and performance metrics.

---

## 🚀 Key Features

- **📊 Unified Developer Stats:** Consolidate your competitive programming rating, total solved counts, streak data, and global rankings across LeetCode, Codeforces, and GitHub.
- **📈 Growth & Rating Analytics:** Interactive charts tracking your contest rating changes, monthly submissions, and growth trajectory.
- **🎯 Dynamic Topic & Skill Profiling:** Visualizes category strengths (Arrays, DP, Graphs, Math, Trees, Strings) and GitHub skill highlights (React, Node, databases, DevOps, testing) using dynamic Radar Charts.
- **✨ Automated Sync Service:** Single-click manual sync that pulls live statistics, difficulty breakdowns, and recently solved problems with rate-limit protection.
- **🛡️ Secure Auth & Session Handling:** JWT-based secure authentication featuring access/refresh token flows, cookie storage, and Google OAuth integration.
- **🎨 Glassmorphic UI:** A beautifully crafted, responsive Next.js dark-themed workspace dashboard utilizing Framer Motion micro-animations and Recharts.

---

## 🛠️ Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19, Next.js 15 (App Router), TypeScript, Tailwind CSS, Framer Motion, Recharts, Axios |
| **Backend** | Node.js, Express, REST APIs, JSON Web Tokens (JWT), Cookie Parser, Cors |
| **Database** | MongoDB Atlas, Mongoose (with advanced aggregation pagination) |
| **Media Handling** | Multer, Cloudinary API |

---

## 📁 Project Structure

Here is an overview of the directory hierarchy:

```text
Project Dev/
├── backend/              # Express Node.js backend server
│   ├── src/
│   │   ├── controllers/  # Route controller handlers
│   │   ├── models/       # Mongoose schemas
│   │   ├── routes/       # API endpoint routes
│   │   ├── middlewares/  # Authentication & upload middlewares
│   │   ├── utils/        # Platform API fetchers & keep-alive pinger
│   │   └── app.js        # Express configuration
│   └── package.json
├── frontend/             # Next.js frontend web app
│   ├── src/
│   │   ├── app/          # Next.js App Router (authenticated & dashboard routes)
│   │   ├── components/   # Reusable UI widgets & graphs
│   │   ├── context/      # AuthContext state management
│   │   └── hooks/        # Custom Axios & routing hooks
│   └── package.json
├── PROGRESS.md           # High-level feature roadmap & status
├── PLAN.md               # Original development outline
└── README.md             # Global project documentation
```

---

## 🚦 Getting Started

Follow these steps to set up and run DevArena locally.

### Prerequisites

Ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v18.0.0 or higher)
- [MongoDB](https://www.mongodb.com/) (Local server or MongoDB Atlas cluster URI)
- [Git](https://git-scm.com/)

---

### Installation & Configuration

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Tiyas04/project-dev.git
   cd project-dev
   ```

2. **Configure the Backend:**
   * Navigate to the `backend/` directory:
     ```bash
     cd backend
     npm install
     ```
   * Create a `.env` file in the `backend/` directory:
     ```env
     PORT=5000
     MONGODB_URI=your_mongodb_connection_uri
     CORS_ORIGIN=http://localhost:3000
     ACCESS_TOKEN_SECRET=your_jwt_access_secret
     ACCESS_TOKEN_EXPIRY=7d
     REFRESH_TOKEN_SECRET=your_jwt_refresh_secret
     REFRESH_TOKEN_EXPIRY=30d
     SERVER_URL=http://localhost:5000
     GOOGLE_CLIENT_ID=your_google_oauth_client_id
     CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
     CLOUDINARY_API_KEY=your_cloudinary_api_key
     CLOUDINARY_API_SECRET=your_cloudinary_api_secret
     GITHUB_TOKEN=your_github_personal_access_token
     ```

3. **Configure the Frontend:**
   * Navigate to the `frontend/` directory:
     ```bash
     cd ../frontend
     npm install
     ```
   * Create a `.env` file in the `frontend/` directory:
     ```env
     NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
     NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_oauth_client_id
     ```

---

### Running the Application

To run the application locally, you must run both the backend and frontend development servers concurrently:

1. **Start the Backend:**
   ```bash
   cd backend
   npm run dev
   ```
2. **Start the Frontend:**
   ```bash
   cd frontend
   npm run dev
   ```

Open your browser to [http://localhost:3000](http://localhost:3000) to access the DevArena dashboard.

---

## 🤝 Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more details.
