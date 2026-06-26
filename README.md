# 🚀 CareerPilot — AI-Powered Recruitment Platform

> **Connect freshers with startups** through an intelligent job matching platform with real-time notifications, ATS pipeline, assessments, and automated email workflows.

[![Deploy](https://img.shields.io/badge/Frontend-Vercel-black?style=for-the-badge&logo=vercel)](https://careerpilot.vercel.app)
[![Backend](https://img.shields.io/badge/Backend-Render-46E3B7?style=for-the-badge&logo=render)](https://careerpilot-api.onrender.com)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker)](./docker-compose.yml)
[![K8s](https://img.shields.io/badge/Kubernetes-Demo-326CE5?style=for-the-badge&logo=kubernetes)](./k8s/)

---

## 📐 Architecture

```
Users
  │
  ▼
Vercel (React + Vite Frontend)
  │
  ├── REST API ──────▶ Render (Node.js + Express Backend)
  │                         │
  └── WebSocket ────▶ Socket.io (Real-time Notifications)
                            │
                    ┌───────┴───────┐
                    │               │
              MongoDB Atlas    Cloudinary
              (Database)       (File Storage)
                    │               │
                    ▼               ▼
              • Users           • Resumes (PDF)
              • Jobs            • Avatars
              • Applications    • Company Logos
              • Notifications   • Certificates
              • Messages
              • Assessments
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, Vite, TailwindCSS, Framer Motion, Recharts |
| **Backend** | Node.js, Express.js, Socket.io, Nodemailer |
| **Database** | MongoDB (Mongoose ODM) |
| **File Storage** | Cloudinary (free tier) / AWS S3 (optional) |
| **Auth** | JWT (JSON Web Tokens) + bcrypt |
| **Deployment** | Vercel (frontend) + Render (backend) |
| **CI/CD** | GitHub Actions |
| **Containerization** | Docker + Docker Compose |
| **Orchestration** | Kubernetes (Minikube demo) |

---

## ✨ Features

### For Freshers
- 🔍 Browse and search jobs by skill, domain, location
- 📄 Upload and manage resume (PDF)
- 📝 Apply to jobs with one click
- 🏆 Take skill assessments and earn certificates
- 📊 Track application status in real-time
- 💬 Chat with startup recruiters
- 🔔 Real-time notifications (Socket.io)
- 📧 Email alerts for status changes

### For Startups
- 📋 Post jobs with detailed requirements
- 🎯 ATS Pipeline — drag-and-drop applicant tracking
- 👥 View and filter fresher profiles
- 💌 Invite top candidates to apply
- 📊 Analytics dashboard
- 🔒 Private/public company profiles
- 👥 Follower management with approvals

---

## 📁 Project Structure

```
careerpilot/
├── frontend/                    # React + Vite frontend
│   ├── src/
│   │   ├── components/          # Reusable UI components
│   │   ├── pages/               # Page components (routes)
│   │   ├── context/             # React Context providers
│   │   └── App.jsx              # Root component + routing
│   ├── Dockerfile               # Multi-stage build (Node → Nginx)
│   ├── nginx.conf               # SPA routing config
│   └── .env.example             # Frontend env template
│
├── backend/                     # Node.js + Express API
│   ├── config/                  # DB, S3, Cloudinary configs
│   ├── controllers/             # Route handlers
│   ├── middleware/               # Auth, upload middleware
│   ├── models/                  # Mongoose schemas
│   ├── routes/                  # Express route definitions
│   ├── services/                # Business logic (resume parsing)
│   ├── utils/                   # Email templates, helpers
│   ├── server.js                # Entry point
│   ├── Dockerfile               # Production Node.js image
│   └── .env.example             # Backend env template
│
├── k8s/                         # Kubernetes manifests
│   ├── namespace.yaml
│   ├── configmap.yaml
│   ├── secret.yaml              # Template — replace values
│   ├── backend-deployment.yaml
│   ├── frontend-deployment.yaml
│   ├── mongo-deployment.yaml
│   ├── ingress.yaml
│   └── README.md                # Minikube deployment guide
│
├── .github/workflows/           # CI/CD pipelines
│   ├── deploy.yml               # Auto-deploy to Vercel + Render
│   └── docker-build.yml         # Build & push Docker images
│
├── docker-compose.yml           # Local multi-container setup
├── Jenkinsfile                  # Jenkins CI pipeline (optional)
├── .env.example                 # Root-level env reference
└── README.md                    # ← You are here
```

---

## 🚀 Quick Start (Local Development)

### Prerequisites

- **Node.js** 18+ — [nodejs.org](https://nodejs.org/)
- **MongoDB** — Local install or [MongoDB Atlas](https://cloud.mongodb.com/) (free)
- **Git** — [git-scm.com](https://git-scm.com/)

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/careerpilot.git
cd careerpilot
```

### 2. Set Up the Backend

```bash
cd backend
cp .env.example .env
# Edit .env with your MongoDB URI, JWT secret, etc.
npm install
npm run dev
```

The backend runs at **http://localhost:5000**

### 3. Set Up the Frontend

```bash
cd frontend
cp .env.example .env
# Default values point to localhost:5000
npm install
npm run dev
```

The frontend runs at **http://localhost:5173**

### 4. Seed Demo Data

Open your browser and visit:

```
http://localhost:5000/api/seed
```

This creates demo users, jobs, and quizzes. Login with:
- **Fresher:** `alex@demo.com` / `password123`
- **Startup:** `sarah@demo.com` / `password123`

---

## ☁️ Deployment Guide

Follow these steps **in order** to deploy CareerPilot for free.

### Step 1: MongoDB Atlas (Database)

1. Go to [cloud.mongodb.com](https://cloud.mongodb.com/) → Create a **free** account
2. Create a **free cluster** (M0 Sandbox)
3. Go to **Database Access** → Add a database user
4. Go to **Network Access** → Add `0.0.0.0/0` (allow all — needed for Render)
5. Click **Connect** → **Connect your application** → Copy the connection string
6. Replace `<password>` with your database user's password

```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/careerpilot?retryWrites=true&w=majority
```

### Step 2: Cloudinary (File Storage)

1. Go to [cloudinary.com](https://cloudinary.com/) → Create a **free** account
2. Go to **Dashboard** → Copy:
   - **Cloud Name**
   - **API Key**
   - **API Secret**

Free tier includes **25 GB** storage and **25 GB** monthly bandwidth.

### Step 3: Deploy Backend to Render

1. Go to [render.com](https://render.com/) → Create a **free** account
2. Click **New** → **Web Service**
3. Connect your GitHub repository
4. Configure:
   - **Name:** `careerpilot-api`
   - **Root Directory:** `backend`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Instance Type:** Free
5. Add **Environment Variables** (from your `backend/.env.example`):

   | Key | Value |
   |-----|-------|
   | `MONGO_URI` | Your MongoDB Atlas connection string |
   | `JWT_SECRET` | A random 64+ character string |
   | `JWT_EXPIRE` | `30d` |
   | `NODE_ENV` | `production` |
   | `EMAIL_USER` | Your Gmail address |
   | `EMAIL_PASS` | Your Gmail App Password |
   | `CLIENT_URL` | `https://careerpilot.vercel.app` |
   | `SERVER_URL` | `https://careerpilot-api.onrender.com` |
   | `CLOUDINARY_NAME` | Your Cloudinary cloud name |
   | `CLOUDINARY_KEY` | Your Cloudinary API key |
   | `CLOUDINARY_SECRET` | Your Cloudinary API secret |

6. Click **Create Web Service** → Wait for deploy

Your backend is now live at: **https://careerpilot-api.onrender.com**

> **Note:** Free Render instances spin down after 15 minutes of inactivity. First request after idle takes ~30 seconds.

### Step 4: Deploy Frontend to Vercel

1. Go to [vercel.com](https://vercel.com/) → Create a **free** account
2. Click **Add New** → **Project**
3. Import your GitHub repository
4. Configure:
   - **Framework Preset:** Vite
   - **Root Directory:** `frontend`
5. Add **Environment Variables**:

   | Key | Value |
   |-----|-------|
   | `VITE_API_URL` | `https://careerpilot-api.onrender.com/api` |
   | `VITE_SOCKET_URL` | `https://careerpilot-api.onrender.com` |

6. Click **Deploy**

Your frontend is now live at: **https://careerpilot.vercel.app**

### Step 5: Email Notifications (Gmail)

1. Go to [myaccount.google.com](https://myaccount.google.com/)
2. Enable **2-Step Verification**
3. Go to [App Passwords](https://myaccount.google.com/apppasswords)
4. Generate an App Password for **Mail**
5. Add to your Render environment variables:
   - `EMAIL_USER` = your Gmail address
   - `EMAIL_PASS` = the 16-character app password

### Step 6: GitHub Actions (Auto-Deploy)

The CI/CD pipeline is already configured in `.github/workflows/deploy.yml`.

Add these **GitHub Secrets** (Repository → Settings → Secrets → Actions):

| Secret | Where to get it |
|--------|----------------|
| `RENDER_DEPLOY_HOOK` | Render Dashboard → Your service → Settings → Deploy Hook |
| `VERCEL_TOKEN` | Vercel → Settings → Tokens → Create |
| `VERCEL_ORG_ID` | Run `vercel` CLI locally, check `.vercel/project.json` |
| `VERCEL_PROJECT_ID` | Same `.vercel/project.json` |
| `DOCKER_USERNAME` | Your Docker Hub username (optional, for K8s) |
| `DOCKER_PASSWORD` | Docker Hub access token (optional, for K8s) |

Now every `git push` to `main` automatically deploys both frontend and backend.

---

## 🐳 Docker (Local Containerization)

### Quick Start

```bash
# Build and run all services
docker compose up -d

# View logs
docker compose logs -f

# Stop all services
docker compose down
```

This starts:
- **MongoDB** at `localhost:27017`
- **Backend** at `localhost:5000`
- **Frontend** at `localhost:3000`

### Production Build with Custom API URL

```bash
docker compose build --build-arg VITE_API_URL=https://careerpilot-api.onrender.com/api
docker compose up -d
```

---

## ☸️ Kubernetes (Minikube Demo)

See the full guide: [k8s/README.md](./k8s/README.md)

### Quick Deploy

```bash
# Start Minikube
minikube start --driver=docker
minikube addons enable ingress

# Deploy all resources
kubectl apply -f k8s/

# Check status
kubectl get all -n careerpilot

# Access via port-forward
kubectl port-forward -n careerpilot svc/cp-frontend 3000:80
```

---

## 🔐 Environment Variables Reference

| Variable | Service | Required | Description |
|----------|---------|----------|-------------|
| `PORT` | Backend | No | Server port (default: 5000) |
| `NODE_ENV` | Backend | No | `development` or `production` |
| `MONGO_URI` | Backend | **Yes** | MongoDB connection string |
| `JWT_SECRET` | Backend | **Yes** | Secret key for JWT signing |
| `JWT_EXPIRE` | Backend | No | Token expiration (default: 30d) |
| `EMAIL_USER` | Backend | No | Gmail address for Nodemailer |
| `EMAIL_PASS` | Backend | No | Gmail App Password |
| `CLIENT_URL` | Backend | **Yes** | Frontend URL (for CORS + emails) |
| `SERVER_URL` | Backend | No | Backend public URL |
| `CLOUDINARY_NAME` | Backend | No* | Cloudinary cloud name |
| `CLOUDINARY_KEY` | Backend | No* | Cloudinary API key |
| `CLOUDINARY_SECRET` | Backend | No* | Cloudinary API secret |
| `VITE_API_URL` | Frontend | **Yes** | Backend API base URL |
| `VITE_SOCKET_URL` | Frontend | **Yes** | Backend WebSocket URL |

> \* Cloudinary variables are optional for local development (files stored on disk). **Required for production** (Render doesn't persist disk storage).

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/register` | Register a new user |
| `POST` | `/api/auth/login` | Login and get JWT token |
| `GET` | `/api/jobs` | List all jobs |
| `POST` | `/api/jobs` | Create a job (startup only) |
| `GET` | `/api/applications` | List applications |
| `POST` | `/api/applications` | Apply to a job |
| `GET` | `/api/quizzes` | List assessments |
| `POST` | `/api/quizzes/:id/submit` | Submit assessment answers |
| `GET` | `/api/notifications` | Get notifications |
| `GET` | `/api/profile/me` | Get current user profile |
| `PUT` | `/api/profile/me` | Update profile |
| `POST` | `/api/upload/resume` | Upload resume (PDF) |
| `POST` | `/api/upload/avatar` | Upload profile photo |
| `GET` | `/api/companies` | List companies |
| `GET` | `/api/messages/:roomId` | Get chat messages |
| `GET` | `/api/health` | Health check |
| `GET` | `/api/seed` | Seed demo data |

---

## 📧 Email Notifications

CareerPilot sends automated emails via Nodemailer + Gmail:

| Email | Trigger |
|-------|---------|
| 🚀 Welcome Email | User registration |
| ⭐ Shortlisted | Application status → Shortlisted |
| 📅 Interview | Application status → Interviewing |
| 🎉 Selected | Application status → Selected |
| 🏆 Hired | Application status → Hired |
| 📩 Rejected | Application status → Rejected |
| 🔔 Follow Request | Fresher follows a startup |
| ✅ Follow Approved | Startup approves follow |
| 💌 Job Invitation | Startup invites fresher |
| 📢 New Job Alert | Company posts new job (to followers) |

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

<p align="center">
  Built with ❤️ by <strong>Dhaanush</strong>
</p>
