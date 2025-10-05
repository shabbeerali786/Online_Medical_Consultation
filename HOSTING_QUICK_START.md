# 🚀 Quick Start Hosting Guide

This is a simplified guide to get your Online Medical Consultation app hosted quickly.

## 📋 Prerequisites Checklist

- [ ] MongoDB Atlas account (free tier available)
- [ ] GitHub account
- [ ] Render account (for backend) - [render.com](https://render.com)
- [ ] Vercel account (for frontend) - [vercel.com](https://vercel.com)

---

## 🎯 Step-by-Step Deployment (15 minutes)

### Step 1: Set Up MongoDB (5 minutes)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Click "Connect" → "Connect your application"
4. Copy your connection string (looks like: `mongodb+srv://username:password@cluster...`)
5. **Important**: In "Network Access", add `0.0.0.0/0` to allow all IPs

### Step 2: Deploy Backend to Render (5 minutes)

1. **Push your code to GitHub** (if not already):
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Go to [Render.com](https://render.com)** and sign up/login

3. **Create New Web Service**:
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select your repository

4. **Configure**:
   - **Name**: `online-medical-backend`
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free

5. **Add Environment Variables** (in "Environment" tab):
   ```
   PORT = 5000
   MONGODB_URI = [paste your MongoDB connection string]
   MONGODB_DB_NAME = online_medical
   NODE_ENV = production
   FRONTEND_URL = [leave empty for now, we'll add this later]
   ```

6. **Click "Create Web Service"**

7. **Wait for deployment** (2-3 minutes)

8. **Copy your backend URL** (e.g., `https://online-medical-backend.onrender.com`)

### Step 3: Deploy Frontend to Vercel (5 minutes)

1. **Update frontend environment**:
   - Open `frontend/.env.production`
   - Replace with your backend URL:
     ```
     VITE_API_URL=https://your-backend-url.onrender.com/api
     ```

2. **Commit the change**:
   ```bash
   git add frontend/.env.production
   git commit -m "Update production API URL"
   git push origin main
   ```

3. **Go to [Vercel.com](https://vercel.com)** and sign up/login

4. **Import Project**:
   - Click "Add New..." → "Project"
   - Import your GitHub repository
   - **Root Directory**: Select `frontend`
   - **Framework Preset**: Vite
   - Click "Deploy"

5. **Add Environment Variable**:
   - Go to "Settings" → "Environment Variables"
   - Add:
     - **Name**: `VITE_API_URL`
     - **Value**: `https://your-backend-url.onrender.com/api`
   - Click "Save"

6. **Redeploy**:
   - Go to "Deployments"
   - Click "..." on latest deployment → "Redeploy"

7. **Copy your frontend URL** (e.g., `https://your-app.vercel.app`)

### Step 4: Update Backend CORS (2 minutes)

1. **Go back to Render**:
   - Open your backend service
   - Go to "Environment"
   - Update `FRONTEND_URL` with your Vercel URL:
     ```
     FRONTEND_URL = https://your-app.vercel.app
     ```
   - Click "Save Changes"

2. **Wait for auto-redeploy** (1-2 minutes)

---

## ✅ Verification

1. **Open your frontend URL** in a browser
2. **Try logging in** with demo credentials:
   - Patient: `patient@demo.com` / `password123`
   - Doctor: `doctor@demo.com` / `password123`
3. **Check if everything works**

---

## 🐛 Troubleshooting

### Backend Issues

**Problem**: Backend not starting
- **Solution**: Check Render logs for errors
- Verify MongoDB connection string is correct
- Ensure IP whitelist includes `0.0.0.0/0`

**Problem**: Database connection failed
- **Solution**: 
  - Check MongoDB Atlas is running
  - Verify connection string has correct password
  - Check network access settings

### Frontend Issues

**Problem**: API calls failing (CORS errors)
- **Solution**: 
  - Verify `FRONTEND_URL` in backend matches your Vercel URL exactly
  - Check `VITE_API_URL` in Vercel environment variables
  - Redeploy both frontend and backend

**Problem**: Blank page or errors
- **Solution**:
  - Check browser console for errors
  - Verify `VITE_API_URL` is set correctly
  - Try clearing browser cache

---

## 💰 Cost

**Free Tier Limits**:
- **Render Free**: Backend sleeps after 15 min inactivity (wakes up in ~30 seconds)
- **Vercel Free**: Unlimited deployments, 100GB bandwidth/month
- **MongoDB Atlas Free**: 512MB storage

**Upgrade Options** (if needed):
- **Render Starter**: $7/month (no sleep)
- **Vercel Pro**: $20/month (more bandwidth)
- **MongoDB Shared**: $9/month (more storage)

---

## 🔄 Updating Your App

### Update Backend:
```bash
git add .
git commit -m "Update backend"
git push origin main
# Render auto-deploys
```

### Update Frontend:
```bash
git add .
git commit -m "Update frontend"
git push origin main
# Vercel auto-deploys
```

---

## 📱 Custom Domain (Optional)

### For Frontend (Vercel):
1. Go to "Settings" → "Domains"
2. Add your domain
3. Update DNS records as instructed

### For Backend (Render):
1. Upgrade to paid plan
2. Go to "Settings" → "Custom Domain"
3. Add your domain

---

## 🔐 Security Checklist

- [ ] MongoDB connection string is not in code
- [ ] Environment variables are set correctly
- [ ] CORS is configured with specific frontend URL
- [ ] MongoDB network access is configured
- [ ] All secrets are in environment variables

---

## 📞 Need Help?

1. Check the full [DEPLOYMENT.md](./DEPLOYMENT.md) guide
2. Review Render/Vercel logs for errors
3. Check MongoDB Atlas logs
4. Verify all environment variables

---

## 🎉 Success!

Your app is now live! Share your URLs:
- **Frontend**: `https://your-app.vercel.app`
- **Backend**: `https://your-backend.onrender.com`

**Note**: Free tier backend may sleep after inactivity. First request after sleep takes ~30 seconds to wake up.
