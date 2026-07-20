<div align="center">
  <img src="frontend/public/fvicon.png" alt="StuHub Logo" width="120" />
  <h1>StuHub</h1>
  <p><strong>A modern, handcrafted academic workspace for students.</strong></p>
</div>

---

StuHub is a premium full-stack academic platform designed with a modern command-palette interface, rich aesthetics, and intelligent AI features. It moves beyond traditional learning management systems by acting as a living, personalized workspace.

## ✨ Features

- **Omnibar Command Palette**: Navigate, search notes, assignments, and PYQs instantly with a sleek `⌘K` interface.
- **Smart OAuth Integrations**: One-click authentication with Google, GitHub, and LinkedIn.
- **Living Dashboard**: Real-time widgets displaying actual attendance, upcoming assignments, and AI analytics (never dummy data).
- **Advanced PYQ Analyzer**: Analyzes Previous Year Question papers using Gemini AI to generate insights, topic frequency, and study plans.
- **Full Assignment Management**: Create, track, and manage assignments with integrated reminders, due dates, and rich formatting.
- **Beautiful UI**: Modern glassmorphism, dynamic focus rings, subtle micro-animations, and curated dark-mode color palettes.

## 🛠️ Technology Stack

**Frontend:**
- React (Vite) + TypeScript
- Tailwind CSS (customized with premium design tokens)
- Lucide Icons & Recharts (Analytics)
- Custom Command Palette Navigation

**Backend:**
- Node.js & Express
- MongoDB & Mongoose
- Socket.io (Realtime notifications)
- Gemini AI API integration
- Cloudinary (Asset management)

## 🚀 Quick Start

### 1. Clone the repository
```bash
git clone https://github.com/sourabh-sahu-08/stuhub.git
cd stuhub
```

### 2. Install dependencies
Install dependencies for both the frontend and backend:
```bash
npm install
```

### 3. Environment Configuration
Duplicate the example environment files and configure your keys:

**Backend (`backend/.env`)**
```env
PORT=5000
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_super_secret_jwt_key
CLIENT_URL=http://localhost:5173

# OAuth Keys
GOOGLE_CLIENT_ID=your_google_client_id
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_secret
LINKEDIN_CLIENT_ID=your_linkedin_client_id
LINKEDIN_CLIENT_SECRET=your_linkedin_secret

# AI API Keys
GEMINI_API_KEY=your_gemini_api_key
```

**Frontend (`frontend/.env`)**
```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000

# OAuth Keys (Matches Backend)
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_GITHUB_CLIENT_ID=your_github_client_id
VITE_LINKEDIN_CLIENT_ID=your_linkedin_client_id
```

### 4. Seed & Run
```bash
# Optional: Seed the database with initial data
npm run seed

# Start the development server (runs both frontend and backend concurrently)
npm run dev
```

The frontend will be available at `http://localhost:5173` and the backend API at `http://localhost:5000`.

## 🐳 Docker Deployment

To spin up the entire stack using Docker:
```bash
docker compose up --build
```

## 🌐 Production Deployment (Render)

StuHub is optimized for deployment on Render.
1. Deploy the `backend` directory as a **Web Service** (Node.js).
2. Deploy the `frontend` directory as a **Static Site**.
3. Ensure you add `frontend/public/_redirects` to handle SPA routing.
4. Whitelist your production URLs in the Google, GitHub, and LinkedIn OAuth consoles.

---
*Built with precision and designed for the modern student.*
