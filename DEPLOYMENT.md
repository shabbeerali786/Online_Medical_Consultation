# Deployment Guide - Online Medical Consultation

This guide covers deploying both the frontend and backend of the Online Medical Consultation application.

## Table of Contents
1. [Backend Deployment](#backend-deployment)
2. [Frontend Deployment](#frontend-deployment)
3. [Environment Variables](#environment-variables)
4. [Deployment Platforms](#deployment-platforms)

---

## Backend Deployment

### Prerequisites
- MongoDB Atlas account (or any MongoDB hosting)
- Node.js hosting platform (Render, Railway, Heroku, etc.)

### Step 1: Prepare Backend for Production

1. **Set up MongoDB Atlas** (if not already done):
   - Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Create a cluster
   - Get your connection string
   - Whitelist IP addresses (use `0.0.0.0/0` for all IPs or specific IPs)

2. **Configure Environment Variables**:
   - Copy `backend/.env.production` and rename to `backend/.env`
   - Update with your production values:
     ```env
     PORT=5000
     MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/online_medical?retryWrites=true&w=majority
     MONGODB_DB_NAME=online_medical
     NODE_ENV=production
     ```

### Step 2: Deploy Backend

#### Option A: Deploy to Render

1. **Create Render Account**: Go to [render.com](https://render.com)

2. **Create New Web Service**:
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Configure:
     - **Name**: `online-medical-backend`
     - **Root Directory**: `backend`
     - **Environment**: `Node`
     - **Build Command**: `npm install`
     - **Start Command**: `npm start`
     - **Plan**: Free or Starter

3. **Add Environment Variables**:
   - Go to "Environment" tab
   - Add:
     - `PORT` = `5000`
     - `MONGODB_URI` = Your MongoDB connection string
     - `MONGODB_DB_NAME` = `online_medical`
     - `NODE_ENV` = `production`

4. **Deploy**: Click "Create Web Service"

5. **Note your backend URL**: e.g., `https://online-medical-backend.onrender.com`

#### Option B: Deploy to Railway

1. **Create Railway Account**: Go to [railway.app](https://railway.app)

2. **Create New Project**:
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Select your repository

3. **Configure Service**:
   - Select the backend directory
   - Railway will auto-detect Node.js
   - Add environment variables in the "Variables" tab

4. **Deploy**: Railway will automatically deploy

#### Option C: Deploy to Heroku

1. **Install Heroku CLI**:
   ```bash
   npm install -g heroku
   ```

2. **Login and Create App**:
   ```bash
   heroku login
   heroku create online-medical-backend
   ```

3. **Set Environment Variables**:
   ```bash
   heroku config:set MONGODB_URI="your_mongodb_uri"
   heroku config:set MONGODB_DB_NAME="online_medical"
   heroku config:set NODE_ENV="production"
   ```

4. **Deploy**:
   ```bash
   cd backend
   git subtree push --prefix backend heroku main
   ```

---

## Frontend Deployment

### Step 1: Update API Configuration

1. **Create API configuration file**:
   - Update `frontend/.env.production` with your backend URL:
     ```env
     VITE_API_URL=https://your-backend-url.com/api
     ```

2. **Update frontend code to use environment variable**:
   - Replace all hardcoded `http://localhost:5000` with `import.meta.env.VITE_API_URL`
   - Example:
     ```javascript
     const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
     ```

### Step 2: Build Frontend

```bash
cd frontend
npm run build
```

This creates a `dist` folder with production-ready files.

### Step 3: Deploy Frontend

#### Option A: Deploy to Vercel (Recommended for React)

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Deploy**:
   ```bash
   cd frontend
   vercel
   ```

3. **Configure**:
   - Follow the prompts
   - Set root directory to `frontend`
   - Add environment variable:
     - `VITE_API_URL` = Your backend URL

4. **Production Deploy**:
   ```bash
   vercel --prod
   ```

#### Option B: Deploy to Netlify

1. **Install Netlify CLI**:
   ```bash
   npm install -g netlify-cli
   ```

2. **Build and Deploy**:
   ```bash
   cd frontend
   npm run build
   netlify deploy --prod --dir=dist
   ```

3. **Configure**:
   - Set build command: `npm run build`
   - Set publish directory: `dist`
   - Add environment variable:
     - `VITE_API_URL` = Your backend URL

#### Option C: Deploy to Render (Static Site)

1. **Create New Static Site** on Render

2. **Configure**:
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`

3. **Add Environment Variable**:
   - `VITE_API_URL` = Your backend URL

#### Option D: Deploy to GitHub Pages

1. **Update `vite.config.js`**:
   ```javascript
   export default defineConfig({
     plugins: [react()],
     base: '/online_medical-consultation/',
   })
   ```

2. **Install gh-pages**:
   ```bash
   cd frontend
   npm install --save-dev gh-pages
   ```

3. **Add deploy script to `package.json`**:
   ```json
   "scripts": {
     "predeploy": "npm run build",
     "deploy": "gh-pages -d dist"
   }
   ```

4. **Deploy**:
   ```bash
   npm run deploy
   ```

---

## Environment Variables

### Backend Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Server port | `5000` |
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://...` |
| `MONGODB_DB_NAME` | Database name | `online_medical` |
| `NODE_ENV` | Environment | `production` |

### Frontend Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `https://api.example.com/api` |

---

## Post-Deployment Checklist

### Backend
- [ ] MongoDB connection is working
- [ ] All API endpoints are accessible
- [ ] CORS is configured for frontend domain
- [ ] Health check endpoint works: `/health`
- [ ] File uploads directory is writable

### Frontend
- [ ] API calls are using production backend URL
- [ ] All pages load correctly
- [ ] Authentication works
- [ ] File uploads work
- [ ] No console errors

### Security
- [ ] Environment variables are not exposed
- [ ] CORS is restricted to frontend domain only
- [ ] MongoDB connection string is secure
- [ ] Rate limiting is enabled (if implemented)

---

## Updating CORS for Production

Update `backend/server/index.js` to allow your frontend domain:

```javascript
const allowedOrigins = [
  'http://localhost:5173',
  'https://your-frontend-domain.com',
  'https://your-frontend-domain.vercel.app'
];

app.use(cors({
  origin: function(origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
```

---

## Troubleshooting

### Backend Issues

1. **Database Connection Failed**:
   - Check MongoDB URI is correct
   - Verify IP whitelist in MongoDB Atlas
   - Check network connectivity

2. **Server Not Starting**:
   - Check logs for errors
   - Verify all dependencies are installed
   - Check PORT environment variable

### Frontend Issues

1. **API Calls Failing**:
   - Check VITE_API_URL is correct
   - Verify CORS is configured
   - Check browser console for errors

2. **Build Fails**:
   - Clear node_modules and reinstall
   - Check for syntax errors
   - Verify all dependencies are in package.json

---

## Monitoring

### Backend Monitoring
- Check server logs regularly
- Monitor database connections
- Set up uptime monitoring (UptimeRobot, Pingdom)

### Frontend Monitoring
- Use browser console for errors
- Monitor API response times
- Check user feedback

---

## Scaling Considerations

### Backend
- Use load balancers for multiple instances
- Implement caching (Redis)
- Optimize database queries
- Add rate limiting

### Frontend
- Use CDN for static assets
- Implement code splitting
- Optimize images
- Enable compression

---

## Support

For issues or questions:
1. Check the logs first
2. Review environment variables
3. Test API endpoints individually
4. Check database connectivity

---

## Quick Deploy Commands

### Backend (Render)
```bash
# Push to GitHub
git add .
git commit -m "Deploy backend"
git push origin main
# Render will auto-deploy
```

### Frontend (Vercel)
```bash
cd frontend
vercel --prod
```

### Full Stack Update
```bash
# Update backend
git push origin main

# Update frontend
cd frontend
npm run build
vercel --prod
```

---

## Cost Estimation

### Free Tier Options
- **Backend**: Render Free (sleeps after inactivity), Railway Free ($5 credit)
- **Frontend**: Vercel Free, Netlify Free
- **Database**: MongoDB Atlas Free (512MB)

### Paid Options
- **Backend**: Render Starter ($7/month), Railway ($5/month)
- **Frontend**: Vercel Pro ($20/month), Netlify Pro ($19/month)
- **Database**: MongoDB Atlas Shared ($9/month)

---

## Next Steps

1. Deploy backend first
2. Note the backend URL
3. Update frontend environment variables
4. Deploy frontend
5. Test the complete application
6. Set up custom domains (optional)
7. Configure SSL certificates (usually automatic)

Good luck with your deployment! 🚀
