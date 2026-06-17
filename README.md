# 💻 Project Dev

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Version](https://img.shields.io/badge/version-1.0.0--beta-orange.svg)](#)
[![Status](https://img.shields.io/badge/status-active-success.svg)](#)

Welcome to **Project Dev**! This is a modern, all-in-one developer workspace dashboard and utility toolkit designed to streamline local development workflows, scaffold project templates, manage automation scripts, and monitor system environments.

---

## 🚀 Key Features

- **⚡ Instant Scaffolding:** Spin up pre-configured templates for Frontend (React, Vite, Next.js), Backend (Express, FastAPI), and Fullstack apps in seconds.
- **📊 Workspace Monitor:** Real-time diagnostics of local system resources, active port listeners, and git repository statuses.
- **🔧 Built-in DevTools:** Integrated API client, JSON formatting/linting suite, JWT inspectors, and regex validators.
- **🤖 Task Automation:** Write and trigger custom workspace tasks (shell scripts, python utils, build pipelines) directly from a GUI dashboard.
- **🎨 Dark Mode & Glassmorphic UI:** A beautifully designed web-based interface built with rich animations, responsive layouts, and intuitive controls.

---

## 🛠️ Tech Stack

Project Dev is built using a modern, scalable stack designed for maximum performance and a fluid user experience:

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React, Next.js (App Router), TypeScript, Tailwind CSS, Framer Motion |
| **Backend** | Node.js, Express, Fastify, Socket.io (for real-time system alerts) |
| **Database** | SQLite / Local JSON database (low footprint, configuration-based) |
| **Diagnostics** | Systeminformation API, Git CLI wrappers |

---

## 📁 Project Structure

Here is an overview of the directory hierarchy:

```text
Project Dev/
├── .github/              # GitHub Actions workflows and templates
├── client/               # Next.js web dashboard frontend
│   ├── components/       # Reusable UI components
│   ├── pages/            # App router page handlers
│   └── public/           # Static assets, logos, and icons
├── server/               # Node.js workspace backend runner
│   ├── controllers/      # Route controllers for APIs
│   ├── scripts/          # Workspace automation scripts
│   └── index.ts          # Backend entry point
├── LICENSE               # MIT License
└── README.md             # Project documentation
```

---

## 🚦 Getting Started

Follow these steps to set up and run Project Dev locally on your machine.

### Prerequisites

Ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v18.0.0 or higher)
- [Git](https://git-scm.com/)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Tiyas04/project-dev.git
   cd project-dev
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env` file in the root directory:
   ```env
   PORT=3000
   DEV_MODE=true
   WORKSPACE_PATH=C:/Users/username/Projects
   ```

### Running the Application

To start both the client and server concurrently in development mode:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the dashboard.

---

## 🤝 Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the MIT License. See [LICENSE](file:///c:/Users/jhuma/OneDrive/Desktop/My%20Folder/My%20codes/Project%20Dev/LICENSE) for more details.
