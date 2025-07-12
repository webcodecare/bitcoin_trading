# 🛠️ Development Setup Guide

## 🚨 **Quick Fix for Localhost Issues**

If you see **"site can't be reached"** on localhost:5173, here are **3 simple solutions**:

### **Solution 1: Use Your Live Backend (Recommended)**
Your backend is already live and working perfectly! Just use it:

```bash
cd frontend
npm install
npm run dev
```

This will:
- Run frontend on `http://localhost:3000` 
- Connect to your live backend at `https://swiftlead.site/api`
- ✅ **No localhost issues!**

### **Solution 2: Current Monolithic Setup**
If you want to keep using port 5000:

```bash
npm run dev
```

This runs both frontend and backend together on port 5000.

### **Solution 3: Fix Port Access (Advanced)**
If localhost:5173 is not accessible, try:

```bash
cd frontend
npm run dev -- --host 0.0.0.0
```

## 🎯 **Recommended Development Workflow**

**For daily development, use Solution 1:**
1. Your live backend is running 24/7 at `https://swiftlead.site/api`
2. Run only the frontend locally on port 3000
3. All your data, authentication, and APIs work instantly
4. No need to manage local backend/database

## 📁 **Project Structure**

```
📦 Your Clean Project/
├── 📁 frontend/          # React App (Port 3000)
├── 📁 backend/           # API Server (Port 3001) 
└── 📄 *.md files         # Documentation
```

## 🔧 **Environment Configuration**

### **Frontend** (`frontend/.env`)
```bash
# Using Live Backend (No localhost issues)
VITE_API_BASE_URL=https://swiftlead.site/api
VITE_WS_URL=wss://swiftlead.site
```

### **Backend** (`backend/.env`) 
```bash
# For local backend development only
NODE_ENV=development
PORT=3001
DATABASE_URL=postgresql://neondb_owner:...
```

## ✅ **Why Use Live Backend?**

1. **No Setup Required** - Backend already configured and running
2. **Real Data** - 28 cryptocurrencies with live prices
3. **No localhost Issues** - External URL always accessible
4. **Professional** - Same setup as production
5. **Fast Development** - Focus on frontend features

## 🚀 **Quick Start**

```bash
# Option 1: Frontend only (recommended)
cd frontend && npm run dev

# Option 2: Full application  
npm run dev
```

Your cryptocurrency platform is ready for development!