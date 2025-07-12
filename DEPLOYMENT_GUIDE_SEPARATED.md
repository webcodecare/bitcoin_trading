# 🚀 Separated Frontend & Backend Deployment Guide

## 📁 Project Structure

```
your-project/
├── frontend_new/          # React frontend for Vercel
├── backend_new/           # Express backend for Railway/Render
└── DEPLOYMENT_GUIDE_SEPARATED.md
```

## 🔄 Step 1: Reorganize Your Code

### Option A: Use the prepared folders
```bash
# The frontend_new and backend_new folders are ready
# Just rename them and proceed to deployment
mv frontend_new frontend
mv backend_new backend
```

### Option B: Create from scratch
```bash
# Create clean frontend folder
mkdir frontend
cp -r client/* frontend/

# Create clean backend folder  
mkdir backend
cp -r server/* backend/
```

## 🌐 Step 2: Deploy Backend First

### Option 1: Railway (Recommended)
1. Go to [railway.app](https://railway.app)
2. Connect your GitHub repository
3. Click "Deploy"
4. Set root directory to `backend_new` (or `backend`)
5. Add environment variables:
   ```
   NODE_ENV=production
   DATABASE_URL=(provided by Railway)
   JWT_SECRET=your-jwt-secret-here
   SESSION_SECRET=your-session-secret-here
   ```
6. Note your deployed backend URL: `https://your-app.railway.app`

### Option 2: Render
1. Go to [render.com](https://render.com)
2. Connect your GitHub repository
3. Create new "Web Service"
4. Set root directory to `backend_new` (or `backend`) 
5. Build command: `npm install && npm run build`
6. Start command: `npm start`
7. Add environment variables (same as above)

### Option 3: Heroku
```bash
# Install Heroku CLI first
cd backend_new  # or backend
heroku create your-backend-name
heroku addons:create heroku-postgresql:hobby-dev
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your-jwt-secret
git subtree push --prefix=backend_new heroku main
```

## 💻 Step 3: Deploy Frontend to Vercel

### Method 1: Vercel Dashboard (Easiest)
1. Go to [vercel.com](https://vercel.com)
2. Import your GitHub repository
3. **Important**: Set "Root Directory" to `frontend_new` (or `frontend`)
4. Configure environment variables:
   ```
   VITE_API_BASE_URL=https://your-backend.railway.app
   VITE_WS_URL=wss://your-backend.railway.app  
   VITE_APP_NAME=Crypto Trading Platform
   VITE_ENVIRONMENT=production
   ```
5. Click "Deploy"

### Method 2: Vercel CLI
```bash
npm i -g vercel
cd frontend_new  # or frontend
vercel --prod
# Follow prompts and add environment variables
```

## 🔧 Step 4: Update Environment Variables

### Frontend (.env.production)
```env
VITE_API_BASE_URL=https://your-backend.railway.app
VITE_WS_URL=wss://your-backend.railway.app
VITE_APP_NAME=Crypto Trading Platform
VITE_ENVIRONMENT=production
```

### Backend (.env)
```env
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@host:5432/dbname
JWT_SECRET=your-super-secret-jwt-key
SESSION_SECRET=your-super-secret-session-key
CORS_ORIGIN=https://your-frontend.vercel.app
```

## 🔄 Step 5: Git Repository Setup

### Option 1: Separate Repositories (Recommended)
```bash
# Create frontend repo
cd frontend_new
git init
git add .
git commit -m "Initial frontend commit"
git remote add origin https://github.com/yourusername/crypto-frontend.git
git push -u origin main

# Create backend repo  
cd ../backend_new
git init
git add .
git commit -m "Initial backend commit"
git remote add origin https://github.com/yourusername/crypto-backend.git
git push -u origin main
```

### Option 2: Monorepo with Subdirectories
```bash
# Keep everything in one repo but deploy subdirectories
git add frontend_new backend_new
git commit -m "Add separated frontend and backend"
git push origin main

# Deploy frontend: Set Vercel root directory to "frontend_new"
# Deploy backend: Set Railway root directory to "backend_new"
```

## ✅ Step 6: Verification

### Check Backend
```bash
curl https://your-backend.railway.app/api/tickers
```

### Check Frontend
- Visit `https://your-frontend.vercel.app`
- Verify login functionality
- Test trading signals
- Check admin dashboard

## 🛠️ Troubleshooting

### CORS Issues
Add your Vercel domain to backend CORS settings:
```js
// backend/src/index.ts
app.use(cors({
  origin: [
    'https://your-frontend.vercel.app',
    'http://localhost:3000'
  ]
}));
```

### Environment Variables
- Backend: Use platform's environment variable settings
- Frontend: Must be prefixed with `VITE_` and set in Vercel dashboard

### Database Connection
- Railway: Automatically provides DATABASE_URL
- Render: Add PostgreSQL add-on  
- Heroku: Use `heroku addons:create heroku-postgresql`

## 📝 Final Notes

- **Frontend URL**: `https://your-frontend.vercel.app`
- **Backend URL**: `https://your-backend.railway.app` 
- **Admin Access**: Use existing admin credentials
- **API Documentation**: Available at backend URL + `/api/docs`

## 🔄 Future Updates

### Frontend Updates
```bash
cd frontend
git add .
git commit -m "Update frontend"
git push origin main
# Vercel auto-deploys
```

### Backend Updates  
```bash
cd backend
git add .
git commit -m "Update backend"
git push origin main
# Railway/Render auto-deploys
```