# 💻 DevArena - Frontend Web App

[![React](https://img.shields.io/badge/React-19.x-blue.svg)](https://react.dev/)
[![Next.js](https://img.shields.io/badge/Next.js-15.x-black.svg)](https://nextjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC.svg)](https://tailwindcss.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)

Welcome to the frontend web application for **DevArena**. This is a modern, responsive, and interactive dashboard built using Next.js (App Router) and Tailwind CSS, featuring beautiful data visualizations and micro-animations.

---

## 🚀 Key Features

- **⚡ Modern Responsive Dashboard:** Dynamic layout tailored for competitive programmers to monitor ratings, streaks, and total solves.
- **📊 Interactive Visualizations (Recharts):** 
  - Radar charts mapping topic strengths.
  - Growth line graphs showing rating history over time.
  - Badges displaying difficulty ratios.
  - Activity grids showing submissions heatmaps.
- **🔐 Protected Navigation & Session Routing:** Authentication middleware and custom contexts that prevent unauthenticated users from visiting dashboard pages.
- **🎨 Glassmorphic Dark UI:** Sleek, high-contrast dark theme utilizing Framer Motion for smooth tab switches, modal openings, and hover indicators.
- **📁 Avatar & Profile Uploader:** Integrated avatar profile changes featuring custom file uploads and image conversions.

---

## 🚦 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18.0.0 or higher recommended)
- [DevArena Backend REST API](file:///c:/Users/jhuma/OneDrive/Desktop/My%20Folder/My%20codes/Project%20Dev/backend) running locally on port 5000

### Installation

1. **Navigate to the frontend folder:**
   ```bash
   cd frontend
   ```
2. **Install project dependencies:**
   ```bash
   npm install
   ```
3. **Environment Setup:**
   Create a `.env` file in the root of the `frontend/` directory:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
   NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_oauth_client_id
   ```

### Running Server

- **Start Local Server:**
  ```bash
  npm run dev
  ```
  Open [http://localhost:3000](http://localhost:3000) to view the client.

- **Production Build & Type Check:**
  ```bash
  npm run build
  ```

---

## 📁 Page Routes & Folder Structure

```text
frontend/
├── src/
│   ├── app/
│   │   ├── (authenticated)/    # Protected route pages group
│   │   │   ├── dashboard/      # Unified metrics overview
│   │   │   ├── stats/          # CP ratings, charts & stats
│   │   │   ├── analysis/       # Topic strengths, skills & recent solves
│   │   │   └── profile/        # User settings & profile avatar upload
│   │   │   login/              # User credentials form
│   │   │   register/           # User onboarding form
│   │   └── page.tsx            # App landing page
│   ├── components/             # Dynamic layouts & charts
│   ├── context/                # AuthContext (JWT tokens, Google login)
│   └── hooks/                  # HTTP client wrappers
```
