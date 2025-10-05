# ✅ Pre-Deployment Checklist

Complete this checklist before deploying your application to production.

## 📋 Backend Checklist

### Environment Setup
- [ ] MongoDB Atlas cluster created and running
- [ ] MongoDB connection string obtained
- [ ] Network access configured (IP whitelist: `0.0.0.0/0` or specific IPs)
- [ ] Database user created with proper permissions
- [ ] `backend/.env` file created with all required variables
- [ ] All environment variables are secure (no hardcoded values in code)

### Code Review
- [ ] All API endpoints tested locally
- [ ] Error handling implemented
- [ ] CORS configured properly
- [ ] File upload functionality tested
- [ ] Database models validated
- [ ] No console.log statements in production code (or minimal)
- [ ] No sensitive data in code comments

### Dependencies
- [ ] All dependencies in `package.json`
- [ ] No unused dependencies
- [ ] Package versions are stable (not using `latest`)
- [ ] `npm install` runs without errors

### Testing
- [ ] Health check endpoint (`/health`) works
- [ ] All API routes tested
- [ ] Database connection tested
- [ ] File uploads tested
- [ ] Authentication tested (if implemented)

### Files & Directories
- [ ] `uploads/` directory exists
- [ ] `.gitignore` configured properly
- [ ] No `.env` file committed to git
- [ ] `ENV.example` file exists with template

---

## 🎨 Frontend Checklist

### Environment Setup
- [ ] `.env.production` created with backend URL
- [ ] `.env.development` created with local backend URL
- [ ] API configuration file created (`src/config/api.js`)
- [ ] All hardcoded URLs replaced with environment variables

### Code Review
- [ ] All components tested locally
- [ ] No console errors in browser
- [ ] Responsive design tested (mobile, tablet, desktop)
- [ ] All forms validated
- [ ] Error messages displayed properly
- [ ] Loading states implemented
- [ ] No hardcoded API URLs (using `import.meta.env.VITE_API_URL`)

### Dependencies
- [ ] All dependencies in `package.json`
- [ ] No unused dependencies
- [ ] Package versions are stable
- [ ] `npm install` runs without errors
- [ ] `npm run build` completes successfully

### Build & Performance
- [ ] Production build tested (`npm run build`)
- [ ] Build size is reasonable (<5MB recommended)
- [ ] Images optimized
- [ ] No build warnings
- [ ] Preview tested (`npm run preview`)

### Testing
- [ ] All pages load correctly
- [ ] Navigation works
- [ ] Forms submit properly
- [ ] File uploads work
- [ ] Authentication flow tested
- [ ] API calls successful

---

## 🗄️ Database Checklist

### MongoDB Atlas
- [ ] Cluster created and active
- [ ] Database name matches `MONGODB_DB_NAME`
- [ ] Network access configured
- [ ] Database user created
- [ ] Connection string tested
- [ ] Backup enabled (recommended)

### Data
- [ ] Sample data loaded (if needed)
- [ ] Indexes created (if needed)
- [ ] Collections created properly
- [ ] Data validation rules set (if needed)

---

## 🔐 Security Checklist

### Environment Variables
- [ ] All secrets in environment variables
- [ ] No API keys in code
- [ ] No database credentials in code
- [ ] `.env` files not committed to git
- [ ] Production environment variables different from development

### CORS
- [ ] CORS configured with specific origins
- [ ] Not using `*` for CORS in production
- [ ] Frontend URL whitelisted in backend

### General
- [ ] HTTPS enabled (handled by hosting platforms)
- [ ] No sensitive data in logs
- [ ] Error messages don't expose system details
- [ ] Rate limiting considered (optional)

---

## 📦 Git & Repository

### Git Status
- [ ] All changes committed
- [ ] No uncommitted files
- [ ] `.gitignore` configured properly
- [ ] Repository pushed to GitHub/GitLab
- [ ] Branch is up to date

### Documentation
- [ ] README.md updated
- [ ] DEPLOYMENT.md reviewed
- [ ] HOSTING_QUICK_START.md reviewed
- [ ] API documentation (if applicable)

---

## 🚀 Deployment Platform Setup

### Backend (Render/Railway/etc.)
- [ ] Account created
- [ ] Repository connected
- [ ] Build command configured: `npm install`
- [ ] Start command configured: `npm start`
- [ ] Root directory set: `backend`
- [ ] Environment variables added
- [ ] Port configured (usually 5000)

### Frontend (Vercel/Netlify/etc.)
- [ ] Account created
- [ ] Repository connected
- [ ] Build command configured: `npm run build`
- [ ] Output directory set: `dist`
- [ ] Root directory set: `frontend`
- [ ] Environment variables added
- [ ] Framework preset: Vite

---

## 🧪 Post-Deployment Testing

### Backend Testing
- [ ] Backend URL accessible
- [ ] Health check endpoint works: `https://your-backend.com/health`
- [ ] API endpoints respond correctly
- [ ] Database connection active
- [ ] File uploads work
- [ ] Logs show no errors

### Frontend Testing
- [ ] Frontend URL accessible
- [ ] All pages load
- [ ] API calls successful
- [ ] No CORS errors
- [ ] Forms work
- [ ] File uploads work
- [ ] Authentication works
- [ ] No console errors

### Integration Testing
- [ ] Frontend can communicate with backend
- [ ] Data flows correctly
- [ ] All features work end-to-end
- [ ] Test with demo credentials
- [ ] Test user registration
- [ ] Test appointment booking
- [ ] Test document upload
- [ ] Test messaging

---

## 📊 Monitoring Setup

### Basic Monitoring
- [ ] Check deployment logs regularly
- [ ] Monitor error rates
- [ ] Check database usage
- [ ] Monitor API response times

### Optional (Recommended)
- [ ] Set up uptime monitoring (UptimeRobot, Pingdom)
- [ ] Configure error tracking (Sentry)
- [ ] Set up analytics (Google Analytics)
- [ ] Configure alerts for downtime

---

## 💰 Cost Verification

### Free Tier Limits
- [ ] Understand free tier limitations
- [ ] Know when backend sleeps (if using free tier)
- [ ] Aware of bandwidth limits
- [ ] Understand build minute limits

### Upgrade Plan
- [ ] Know when to upgrade
- [ ] Budget allocated (if needed)
- [ ] Payment method added (if needed)

---

## 📱 Optional Enhancements

### Custom Domain
- [ ] Domain purchased (if desired)
- [ ] DNS configured
- [ ] SSL certificate configured (usually automatic)

### Performance
- [ ] CDN configured (usually automatic)
- [ ] Caching enabled
- [ ] Compression enabled

### SEO (if applicable)
- [ ] Meta tags added
- [ ] Open Graph tags added
- [ ] Sitemap created

---

## 🆘 Troubleshooting Preparation

### Documentation
- [ ] Know where to find logs (backend)
- [ ] Know where to find logs (frontend)
- [ ] Have MongoDB Atlas credentials saved
- [ ] Have hosting platform credentials saved

### Backup Plan
- [ ] Database backup strategy
- [ ] Code backup (git)
- [ ] Know how to rollback deployment

---

## ✅ Final Verification

Before going live, verify:

1. **Backend is running**: Visit `https://your-backend.com/health`
2. **Frontend is accessible**: Visit `https://your-frontend.com`
3. **Login works**: Test with demo credentials
4. **Core features work**: Test main user flows
5. **No errors in console**: Check browser console
6. **No errors in logs**: Check platform logs
7. **Database is connected**: Check MongoDB Atlas
8. **CORS is working**: No CORS errors in browser

---

## 🎉 Ready to Deploy!

If all items are checked, you're ready to deploy!

### Quick Deploy Steps:
1. Deploy backend first (Render/Railway)
2. Note the backend URL
3. Update frontend `.env.production` with backend URL
4. Deploy frontend (Vercel/Netlify)
5. Update backend `FRONTEND_URL` with frontend URL
6. Test everything
7. Celebrate! 🎊

---

## 📞 Need Help?

If you encounter issues:
1. Check the logs first
2. Review [DEPLOYMENT.md](./DEPLOYMENT.md)
3. Check [HOSTING_QUICK_START.md](./HOSTING_QUICK_START.md)
4. Review platform documentation
5. Check MongoDB Atlas status

---

## 📝 Notes

**Important Reminders:**
- Free tier backend may sleep after 15 minutes of inactivity
- First request after sleep takes ~30 seconds
- Monitor your usage to avoid unexpected charges
- Keep your environment variables secure
- Regularly check logs for errors
- Test thoroughly before sharing with users

**Common Issues:**
- **CORS errors**: Check `FRONTEND_URL` in backend matches exactly
- **API calls fail**: Verify `VITE_API_URL` is correct
- **Database connection fails**: Check MongoDB Atlas IP whitelist
- **Build fails**: Check for syntax errors and missing dependencies
- **404 errors**: Check routing configuration

Good luck with your deployment! 🚀
