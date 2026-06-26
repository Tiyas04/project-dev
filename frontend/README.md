# DevArena Frontend

> **Modern, responsive, and interactive dashboard built for competitive programmers.**

The DevArena frontend leverages Next.js and Tailwind CSS to deliver a beautifully designed, high-contrast dark theme utilizing glassmorphism and Framer Motion for a premium user experience.

---

## Key Features

- **Modern Responsive Dashboard**  
  Dynamic layout tailored to monitor ratings, streaks, and total solves effortlessly.
- **Interactive Visualizations**  
  Rich data presentation using Recharts (Radar charts, growth line graphs, difficulty badges, and submission heatmaps).
- **Protected Navigation**  
  Secure routing with custom contexts preventing unauthenticated access to dashboard views.
- **Glassmorphic Dark UI**  
  A sleek aesthetic combined with smooth tab switches, modal transitions, and hover indicators via Framer Motion.
- **Profile Customization**  
  Integrated avatar updates with custom file uploads and image conversions.

---

## Getting Started

### Prerequisites

- Node.js (v18+)
- DevArena Backend REST API running locally on port 5000.

### Installation & Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Environment Configuration**
   Create a `.env` file in the root of the `frontend/` directory:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
   NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_oauth_client_id
   ```

### Running the Server

- **Development Server:**
  ```bash
  npm run dev
  ```
  Access the client at `http://localhost:3000`.

- **Production Build:**
  ```bash
  npm run build
  npm start
  ```

---

## Project Structure

```text
frontend/
├── src/
│   ├── app/
│   │   ├── (authenticated)/
│   │   │   ├── analysis/
│   │   │   ├── dashboard/
│   │   │   ├── profile/
│   │   │   └── stats/
│   │   ├── auth/
│   │   ├── search/
│   │   └── user/
│   ├── components/
│   │   ├── about.tsx
│   │   ├── background.tsx
│   │   ├── faq.tsx
│   │   ├── features.tsx
│   │   ├── followers-modal.tsx
│   │   ├── footer.tsx
│   │   ├── hero.tsx
│   │   ├── loggedin-footer.tsx
│   │   ├── loggedin-navbar.tsx
│   │   ├── login.tsx
│   │   ├── navbar.tsx
│   │   ├── protected-route.tsx
│   │   ├── signup.tsx
│   │   └── work.tsx
│   ├── context/
│   │   └── AuthContext.tsx
│   ├── lib/
│   │   └── axios.ts
│   └── proxy.ts
```
