# DevArena 

> **An AI-Powered Competitive Programming Analytics Platform**

DevArena is a comprehensive analytics dashboard and developer portfolio tracker. It aggregates data from multiple platforms—**LeetCode**, **Codeforces**, and **GitHub**—transforming raw API responses and statistics into actionable visualizations and performance metrics.

---

## Key Features

- **Unified Developer Stats**  
  Consolidate your competitive programming rating, total solved counts, streak data, and global rankings across platforms.
- **Growth & Rating Analytics**  
  Interactive charts tracking your contest rating changes, monthly submissions, and growth trajectory.
- **Dynamic Topic & Skill Profiling**  
  Visualizes category strengths (Arrays, DP, Graphs, Math, Trees, Strings) and GitHub skill highlights using dynamic radar charts.
- **Automated Sync Service**  
  Single-click manual sync that pulls live statistics, difficulty breakdowns, and recently solved problems with rate-limit protection.
- **Secure Auth & Session Handling**  
  JWT-based secure authentication featuring access/refresh token flows, cookie storage, and Google OAuth integration.
- **Glassmorphic UI**  
  A beautifully crafted, responsive Next.js dark-themed workspace dashboard utilizing Framer Motion and Recharts.

---

## Tech Stack

### Frontend
- **Framework:** Next.js 16 (App Router), React 19
- **Styling:** Tailwind CSS 4, Framer Motion
- **Data Visualization:** Recharts
- **Language:** TypeScript

### Backend
- **Framework:** Node.js, Express
- **Authentication:** JWT, Google OAuth
- **Database:** MongoDB Atlas, Mongoose
- **Caching & Queueing:** Redis, BullMQ
- **Media & AI:** Cloudinary, Gemini API

---

## Architecture Overview

```text
Project Dev/
├── backend/              # Express Node.js backend server
│   ├── src/
│   │   ├── controllers/  # Route controller handlers
│   │   ├── models/       # Mongoose schemas
│   │   ├── routes/       # API endpoint routes
│   │   ├── middlewares/  # Authentication & upload middlewares
│   │   └── utils/        # Platform API fetchers & keep-alive pinger
│   └── package.json
├── frontend/             # Next.js frontend web app
│   ├── src/
│   │   ├── app/          # Next.js App Router (authenticated & dashboard routes)
│   │   ├── components/   # Reusable UI widgets & graphs
│   │   ├── context/      # AuthContext state management
│   │   └── lib/          # Custom hooks and utilities
│   └── package.json
├── PROGRESS.md           # High-level feature roadmap & status
├── PLAN.md               # Original development outline
└── README.md             # Global project documentation
```

---

## Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB (Local or Atlas URI)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Tiyas04/project-dev.git
   cd project-dev
   ```

2. **Configure the Backend**
   ```bash
   cd backend
   npm install
   ```
   Create a `.env` file in `backend/`:
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

3. **Configure the Frontend**
   ```bash
   cd ../frontend
   npm install
   ```
   Create a `.env` file in `frontend/`:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
   NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_oauth_client_id
   ```

### Running the Application

Start the development servers concurrently:

**Backend:**
```bash
cd backend
npm run dev
```

**Frontend:**
```bash
cd frontend
npm run dev
```

The application will be available at `http://localhost:3000`.

---

## License

Distributed under the MIT License. See `LICENSE` for more details.
