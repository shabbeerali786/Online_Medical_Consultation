# Online Medical Consultation

A modern full-stack application for online medical consultation services. This application provides a comprehensive platform for patients, doctors, and administrators to manage medical appointments and consultations.

## Project Structure

This project is organized into separate frontend and backend directories:

```
online-medical-consultation/
├── frontend/          # React frontend application
├── backend/           # Express.js backend API
├── package.json       # Root package.json for managing both projects
└── README.md
```

## Features

### 🏠 Home Page
- Project title and navigation bar
- Welcome section with call-to-action buttons
- Features overview and how-it-works section

### 🔐 User Authentication
- **Login Page**: Sign in for patients, doctors, and admins
- **Signup Page**: Registration for patients and doctors
- Role-based authentication with Context API
- Demo credentials provided for testing

### 👨‍⚕️ Patient Dashboard
- **Find Doctors**: Browse and filter doctors by specialization
- **Book Appointment**: Select doctor, date, time, and reason
- **My Appointments**: View upcoming and past appointments
- Responsive design with tabbed interface

### 🩺 Doctor Dashboard
- **View Appointments**: See upcoming and completed appointments
- **Upload Prescription**: Add/edit clinical notes and medications
- **Patient Management**: Track patient consultations
- Modal-based prescription form

### 👨‍💼 Admin Dashboard
- **User Management**: View all doctors and patients
- **Appointment Overview**: Monitor all appointments
- **Statistics**: Dashboard with key metrics
- Comprehensive data tables

## Tech Stack

### Frontend
- **Framework**: React 18 with Vite
- **Routing**: React Router DOM v6
- **Styling**: Tailwind CSS
- **State Management**: React Context API
- **Build Tool**: Vite

### Backend
- **Runtime**: Node.js with Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (planned)
- **CORS**: Enabled for frontend communication

## Getting Started

### Prerequisites
- Node.js (version 16 or higher)
- npm or yarn
- MongoDB (local or cloud instance)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd online-medical-consultation
```

2. Install all dependencies (frontend, backend, and root):
```bash
npm run install:all
```

Or install individually:
```bash
# Install root dependencies
npm install

# Install frontend dependencies
cd frontend && npm install

# Install backend dependencies
cd backend && npm install
```

3. Set up environment variables:
```bash
# Copy the example environment file
cp backend/ENV.example backend/.env

# Edit backend/.env with your MongoDB connection string
```

4. Start both frontend and backend in development mode:
```bash
npm run dev
```

Or start individually:
```bash
# Start backend only
npm run dev:backend

# Start frontend only
npm run dev:frontend
```

5. Access the application:
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:5000`

## Available Scripts

### Root Level
- `npm run install:all` - Install dependencies for all projects
- `npm run dev` - Start both frontend and backend in development mode
- `npm run dev:frontend` - Start only the frontend
- `npm run dev:backend` - Start only the backend
- `npm run build` - Build the frontend for production
- `npm run start` - Start the backend in production mode

### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Backend
- `npm run dev` - Start development server with nodemon
- `npm run start` - Start production server

## Demo Credentials

### Patient Login
- Email: `patient@demo.com`
- Password: `password123`

### Doctor Login
- Email: `doctor@demo.com`
- Password: `password123`

## Development

### Frontend Structure
```
frontend/
├── src/
│   ├── components/
│   │   └── Navbar.jsx
│   ├── contexts/
│   │   └── AuthContext.jsx
│   ├── pages/
│   │   ├── Home.jsx
│   │   ├── Login.jsx
│   │   ├── Signup.jsx
│   │   ├── PatientDashboard.jsx
│   │   ├── DoctorDashboard.jsx
│   │   └── AdminDashboard.jsx
│   ├── assets/
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── index.html
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── package.json
```

### Backend Structure
```
backend/
├── server/
│   ├── config/
│   │   └── db.js
│   ├── middleware/
│   ├── models/
│   └── index.js
├── .env
├── ENV.example
└── package.json
```

## 🚀 Deployment

This application is ready for production deployment!

### Quick Deploy (15 minutes)
Follow the [HOSTING_QUICK_START.md](./HOSTING_QUICK_START.md) guide for step-by-step deployment instructions.

### Deployment Documentation
- **[HOSTING_QUICK_START.md](./HOSTING_QUICK_START.md)** - Quick 15-minute deployment guide
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Comprehensive deployment documentation
- **[PRE_DEPLOYMENT_CHECKLIST.md](./PRE_DEPLOYMENT_CHECKLIST.md)** - Pre-deployment checklist
- **[PLATFORM_COMPARISON.md](./PLATFORM_COMPARISON.md)** - Hosting platform comparison

### Recommended Stack (Free Tier)
- **Frontend**: Vercel (free tier)
- **Backend**: Render (free tier with sleep)
- **Database**: MongoDB Atlas (free 512MB)

### Environment Variables Required

**Backend** (`backend/.env`):
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
MONGODB_DB_NAME=online_medical
NODE_ENV=production
FRONTEND_URL=https://your-frontend-url.com
```

**Frontend** (`frontend/.env.production`):
```env
VITE_API_URL=https://your-backend-url.com/api
```

### Deployment Files Included
- ✅ Docker configuration (`Dockerfile`, `docker-compose.yml`)
- ✅ Render configuration (`render.yaml`)
- ✅ Vercel configuration (`vercel.json`)
- ✅ Netlify configuration (`netlify.toml`)
- ✅ Heroku configuration (`Procfile`)
- ✅ Deployment scripts (PowerShell & Bash)

### Quick Deploy Commands

**Using Docker:**
```bash
docker-compose up -d
```

**Using Scripts (Windows):**
```powershell
.\scripts\deploy-backend.ps1
.\scripts\deploy-frontend.ps1
```

**Using Scripts (Linux/Mac):**
```bash
./scripts/deploy-backend.sh
./scripts/deploy-frontend.sh
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test both frontend and backend
5. Submit a pull request

## License

This project is licensed under the MIT License.