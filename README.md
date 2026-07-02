# Stuhub

A modern full-stack college operating system for students, teachers, and administrators.

## Stack

- React, TypeScript, Tailwind CSS, React Router
- Node.js, Express, MongoDB, Mongoose
- JWT authentication with role-based access control
- Socket.io realtime notifications
- Recharts analytics
- Docker-ready development and production configuration

## Quick Start

```bashh
npm install
cp .env.example .env
npm run seed
npm run dev
```

The frontend runs at `http://localhost:5173` and the backend API runs at `http://localhost:5000`.

## Demo Accounts

- Admin: `admin@stuhub.edu` / `password123`
- Teacher: `teacher@stuhub.edu` / `password123`
- Student: `student@stuhub.edu` / `password123`

## Docker

```bash
docker compose up --build
```
