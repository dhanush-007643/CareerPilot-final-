# CareerPilot 🚀

> **AI-Powered Recruitment Platform** — Connecting ambitious freshers with innovative startups.

---

## ✨ Features

| Feature | Details |
|---|---|
| 🔐 JWT Auth | Register/login with role-based access (Fresher / Startup) |
| 🎯 AI Skill Matching | Jobs sorted by % skill overlap with your profile |
| 📋 ATS Kanban Board | 6-stage visual pipeline for recruiters |
| 🏆 Assessment Certificates | Timed quizzes → PDF certificates with verification codes |
| 🔔 Real-Time Notifications | Socket.io live status updates |
| 💬 Live Chat | Direct messaging between freshers and startups |
| 📧 Email Notifications | Welcome emails + status change alerts via Nodemailer |
| 📁 File Uploads | Resume and avatar uploads via Multer |

---

## 🛠 Tech Stack

**Backend** — `Node.js + Express + MongoDB + Socket.io`  
**Frontend** — `React + Vite + Tailwind CSS + Framer Motion`  

---

## 🚀 Quick Start

### 1. Clone & Install

```bash
# Backend
cd cp/backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Configure Environment

Create `cp/backend/.env`:

```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/careerpilot
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRE=30d
CLIENT_URL=http://localhost:5173

# Optional — Nodemailer Gmail
EMAIL_USER=your.email@gmail.com
EMAIL_PASS=your_app_password
```

> **Gmail App Password**: Go to Google Account → Security → 2FA → App Passwords

Create `cp/frontend/.env`:

```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

### 3. Seed Demo Data

Start the backend first, then visit:
```
GET http://localhost:5000/api/seed
```

This creates:
- **Fresher**: `alex@demo.com` / `password123`
- **Startup**: `sarah@demo.com` / `password123`
- 2 sample jobs + 1 quiz

### 4. Run

```bash
# Terminal 1 — Backend
cd cp/backend
npm run dev          # nodemon server.js on :5000

# Terminal 2 — Frontend  
cd cp/frontend
npm run dev          # Vite on :5173
```

Visit **http://localhost:5173**

---

## 📁 Project Structure

```
cp/
├── backend/
│   ├── config/          # DB connection
│   ├── controllers/     # Business logic
│   ├── middleware/       # Auth, upload
│   ├── models/          # Mongoose schemas
│   ├── routes/          # Express routers
│   ├── utils/           # email.js, matchScore.js
│   ├── public/uploads/  # Uploaded files
│   └── server.js        # Entry point
├── frontend/
│   ├── src/
│   │   ├── components/  # Navbar, NotificationBell, LoadingScreen
│   │   ├── context/     # AuthContext
│   │   ├── hooks/       # useNotifications
│   │   ├── pages/       # All page components
│   │   └── services/    # api.js, socket.js
│   └── index.html
├── index.html           # Standalone landing page
├── style.css            # Standalone landing styles
└── main.js              # Standalone landing JS
```

---

## 🔗 API Endpoints

| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Register user |
| POST | `/api/auth/login` | Public | Login |
| GET | `/api/auth/me` | JWT | Get current user |
| PUT | `/api/auth/profile` | JWT | Update profile |
| GET | `/api/jobs` | JWT | List jobs (sorted by match) |
| GET | `/api/jobs/:id` | JWT | Single job |
| POST | `/api/jobs` | Startup | Post a job |
| GET | `/api/jobs/my` | Startup | My posted jobs |
| DELETE | `/api/jobs/:id` | Startup | Delete job |
| POST | `/api/applications` | Fresher | Apply to job |
| GET | `/api/applications/my` | Fresher | My applications |
| GET | `/api/applications/ats/:jobId` | Startup | ATS board |
| PATCH | `/api/applications/:id/status` | Startup | Update status |
| GET | `/api/quizzes` | JWT | List quizzes |
| POST | `/api/quizzes/submit` | Fresher | Submit quiz |
| GET | `/api/notifications` | JWT | My notifications |
| PATCH | `/api/notifications/read-all` | JWT | Mark all read |
| GET | `/api/messages/contacts` | JWT | Chat contacts |
| GET | `/api/messages/:room` | JWT | Room history |
| POST | `/api/upload/resume` | JWT | Upload resume |
| POST | `/api/upload/avatar` | JWT | Upload avatar |
| GET | `/api/seed` | Public | Seed demo data |
| GET | `/api/health` | Public | Health check |

---

## 🎨 Design System

- **Background**: `#0A0F1E` (cyber dark)
- **Primary**: `#3B82F6` → `#8B5CF6` (blue-purple gradient)
- **Glass**: `backdrop-blur-xl + bg-[#0D1530]/70`
- **Font**: Inter (weights 300–900)

---

## 📄 License

MIT — Build freely, hire smartly.
