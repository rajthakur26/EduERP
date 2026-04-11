# EduERP - ERP-Based Integrated Student Management System

A full-stack MERN application with role-based access control for Admins, Teachers, and Students.

## 🚀 Tech Stack
- **Frontend**: React (Vite) + Tailwind CSS + Redux Toolkit
- **Backend**: Node.js + Express.js + MongoDB (Mongoose)
- **Auth**: JWT (access + refresh tokens)
- **Realtime**: Socket.IO
- **File Upload**: Cloudinary
- **Email**: Nodemailer

## 📁 Project Structure
```
EduERP/
├── backend/          # Express API server
│   ├── config/       # DB & Cloudinary config
│   ├── controllers/  # Route handlers
│   ├── middleware/   # Auth & error middleware
│   ├── models/       # Mongoose schemas
│   ├── routes/       # Express routes
│   ├── socket/       # Socket.IO manager
│   └── utils/        # JWT & Email utilities
└── frontend/         # React + Vite app
    └── src/
        ├── api/      # Axios instance
        ├── components/
        ├── hooks/    # Socket hook
        ├── pages/    # Admin / Teacher / Student pages
        └── store/    # Redux slices
```

## ⚙️ Setup Instructions

### 1. Backend Setup
```bash
cd backend
cp .env.example .env
# Fill in your MongoDB URI, JWT secrets, Cloudinary & Email credentials
npm install
npm run dev
```

### 2. Frontend Setup
```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

### 3. Seed Demo Data (optional)
```bash
cd backend
node utils/seed.js
```

## 👥 Demo Credentials (after seeding)
| Role    | Email                  | Password    |
|---------|------------------------|-------------|
| Admin   | admin@eduerp.com       | admin123    |
| Teacher | teacher@eduerp.com     | teacher123  |
| Student | student@eduerp.com     | student123  |

## 🔥 Features
- **Admin**: Dashboard analytics, manage students & teachers, fee management, notifications
- **Teacher**: Mark attendance, upload results, create & grade assignments
- **Student**: View attendance %, results with grade breakdown, fee status, submit assignments
- **Realtime**: Socket.IO notifications pushed to connected users

## 📡 API Endpoints
| Module       | Base Path            |
|--------------|----------------------|
| Auth         | `/api/auth`          |
| Users        | `/api/users`         |
| Students     | `/api/students`      |
| Teachers     | `/api/teachers`      |
| Attendance   | `/api/attendance`    |
| Results      | `/api/results`       |
| Fees         | `/api/fees`          |
| Assignments  | `/api/assignments`   |
| Notifications| `/api/notifications` |
| Analytics    | `/api/analytics`     |
