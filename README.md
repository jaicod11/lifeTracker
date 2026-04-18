# 🌿 Life Tracker

> **Atmospheric Precision for your Finances, Habits & Goals.**

A full-stack personal productivity dashboard built with the MERN stack. Track daily habits, log expenses, set strategic goals, and receive AI-powered monthly insights — all in one dark, vibrant interface.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🔐 **Secure Auth** | JWT access tokens + refresh tokens stored in HTTP-only cookies |
| 📊 **Dashboard** | Real-time overview of habits, expenses, goals, and overall pace |
| ✅ **Habits** | Daily/weekly habit tracking with streaks, completion rings, and goal milestones |
| 💰 **Expenses** | Log transactions by category, view spending breakdowns and budget rings |
| 🎯 **Goals** | Strategic milestones with progress tracking and trajectory list |
| 📈 **Reports** | Monthly analytics with Chart.js visualizations and Gemini AI summaries |
| 🤖 **AI Insights** | Gemini 1.5 Flash generates smart summaries like "You spent 20% more this month" |
| ⏰ **Cron Jobs** | Automated monthly report generation via node-cron |

---

## 🛠 Tech Stack

### Backend
- **Node.js** + **Express** — REST API
- **MongoDB** + **Mongoose** — Database & ODM
- **JWT** + **bcryptjs** — Authentication & password hashing
- **node-cron** — Monthly report automation
- **@google/generative-ai** — Gemini AI integration

### Frontend
- **React 18** + **Vite** — UI framework & build tool
- **React Router v6** — Client-side routing
- **Chart.js** + **react-chartjs-2** — Data visualizations
- **Framer Motion** — Page animations
- **Axios** — HTTP client with interceptors

---

## 📁 Project Structure

```
lifetracker/
├── backend/
│   ├── config/
│   │   └── db.js                 # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── habitController.js
│   │   ├── expenseController.js
│   │   ├── goalController.js
│   │   └── reportController.js
│   ├── middleware/
│   │   └── authMiddleware.js     # JWT protect middleware
│   ├── models/
│   │   ├── User.js
│   │   ├── Habit.js
│   │   ├── Expense.js
│   │   ├── Goal.js
│   │   └── MonthlyReport.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── habitRoutes.js
│   │   ├── expenseRoutes.js
│   │   ├── goalRoutes.js
│   │   └── reportRoutes.js
│   ├── services/
│   │   └── geminiService.js      # Gemini AI prompt & response
│   ├── jobs/
│   │   └── monthlyReportJob.js   # node-cron monthly aggregation
│   ├── .env.example              # ← copy to .env and fill in values
│   ├── package.json
│   └── server.js
│
└── frontend/
    ├── src/
    │   ├── api/
    │   │   └── axios.js          # Axios instance + interceptors
    │   ├── context/
    │   │   └── AuthContext.jsx   # Global auth state
    │   ├── components/
    │   │   └── DashboardShell.jsx # Sidebar + topbar layout
    │   ├── pages/
    │   │   ├── Login.jsx
    │   │   ├── Register.jsx
    │   │   ├── Dashboard.jsx
    │   │   ├── Habits.jsx
    │   │   ├── Expenses.jsx
    │   │   ├── Goals.jsx
    │   │   └── Reports.jsx
    │   ├── App.jsx               # Routes (PublicRoute / PrivateRoute)
    │   └── main.jsx
    ├── .env.example              # ← copy to .env and fill in values
    └── package.json
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- MongoDB Atlas account (free tier works)
- Gemini API key (free at [aistudio.google.com](https://aistudio.google.com/app/apikey))

---

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/lifetracker.git
cd lifetracker
```

---

### 2. Set up the Backend

```bash
cd backend
npm install
```

Copy the example env file and fill in your values:

```bash
cp .env.example .env
```

Open `backend/.env` and set:

```env
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster0.xxxxx.mongodb.net/lifetracker
JWT_SECRET=<run: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))">
JWT_REFRESH_SECRET=<run the same command again for a different value>
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=7d
GEMINI_API_KEY=<your gemini key>
CLIENT_URL=http://localhost:5173
```

Start the backend:

```bash
npm run dev     # development (nodemon)
# or
npm start       # production
```

Backend runs on **http://localhost:5000**

---

### 3. Set up the Frontend

```bash
cd ../frontend
npm install
```

Copy the example env file:

```bash
cp .env.example .env
```

Open `frontend/.env` and set:

```env
VITE_API_URL=http://localhost:5000/api
```

Start the frontend:

```bash
npm run dev
```

Frontend runs on **http://localhost:5173**

---

### 4. Generate JWT Secrets

Run this in your terminal to generate secure secrets:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Run it twice — once for `JWT_SECRET`, once for `JWT_REFRESH_SECRET`.

---

## 🔄 Monthly Report Flow

```
User logs data daily
        ↓
Data stored in MongoDB
        ↓
Cron job runs on 1st of every month (00:00)
        ↓
Aggregates expenses, habits, goals for that month
        ↓
Calls Gemini AI → generates smart summary
        ↓
Saves to MonthlyReport collection
        ↓
Frontend fetches report → shows charts + AI insights
```

You can also manually trigger a report from the Reports page using the **"Regenerate"** button.

---

## 🌐 Deployment

### Backend → Railway

1. Go to [railway.app](https://railway.app) → New Project → Deploy from GitHub
2. Select your repo → set the root directory to `backend/`
3. Add all your environment variables from `.env`
4. Change `CLIENT_URL` to your Vercel frontend URL
5. Railway auto-detects Node.js and deploys

### Frontend → Vercel

1. Go to [vercel.com](https://vercel.com) → New Project → Import from GitHub
2. Set the root directory to `frontend/`
3. Add environment variable: `VITE_API_URL=https://your-backend.railway.app/api`
4. Deploy

---

## 📸 Screenshots

| Page | Description |
|---|---|
| Login | Editorial split-panel with dark navy theme |
| Dashboard | Weekly habit matrix + stat cards + pace ring |
| Habits | Today's ledger with streak tracker and goal milestones |
| Expenses | Spending breakdown + transaction list + forecast |
| Goals | Strategic milestones bento grid + trajectory list |
| Reports | Chart.js analytics + Gemini AI monthly summary |

---

## 🔐 Environment Variables Reference

### Backend (`backend/.env`)

| Variable | Description | Required |
|---|---|---|
| `PORT` | Server port (default 5000) | ✅ |
| `MONGODB_URI` | MongoDB Atlas connection string | ✅ |
| `JWT_SECRET` | 64-char hex secret for access tokens | ✅ |
| `JWT_REFRESH_SECRET` | 64-char hex secret for refresh tokens | ✅ |
| `JWT_ACCESS_EXPIRES` | Access token expiry (e.g. `15m`) | ✅ |
| `JWT_REFRESH_EXPIRES` | Refresh token expiry (e.g. `7d`) | ✅ |
| `GEMINI_API_KEY` | Google Gemini AI API key | ✅ |
| `CLIENT_URL` | Frontend URL for CORS | ✅ |

### Frontend (`frontend/.env`)

| Variable | Description | Required |
|---|---|---|
| `VITE_API_URL` | Backend API base URL | ✅ |

---

## 🧑‍💻 Author

Built by **Jaideep** — a full-stack MERN project with dark vibrant UI, AI-powered insights, and atmospheric precision.

---

## 📄 License

MIT — feel free to fork, modify and build on top of this.
