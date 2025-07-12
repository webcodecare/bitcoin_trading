# Clean Project Structure

## 📁 **Simplified Structure**

Your project now has a clean, professional structure with only 2 main folders:

```
📦 cryptocurrency-trading-platform/
├── 📁 frontend/          # React.js Application
│   ├── src/
│   ├── public/
│   ├── package.json
│   ├── vite.config.ts
│   └── README.md
├── 📁 backend/           # Node.js API Server  
│   ├── src/
│   ├── package.json
│   ├── drizzle.config.ts
│   └── README.md
└── 📄 Documentation files (*.md)
```

## 🚀 **Development Commands**

### **Start Full Application**
```bash
# Run both frontend and backend
npm run dev
```

### **Frontend Only** (Port 3000)
```bash
cd frontend
npm install
npm run dev
```

### **Backend Only** (Port 3001)
```bash
cd backend
npm install
npm run dev
```

## 🔧 **Configuration**

### **Frontend Environment** (`frontend/.env`)
```bash
VITE_API_BASE_URL=https://swiftlead.site/api
VITE_WS_URL=wss://swiftlead.site
```

### **Backend Environment** (`backend/.env`)
```bash
NODE_ENV=development
PORT=3001
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret
```

## 📊 **Benefits of Clean Structure**

✅ **Simple Navigation** - Only 2 folders to focus on
✅ **Independent Development** - Work on frontend/backend separately  
✅ **Easy Deployment** - Deploy each component independently
✅ **Clear Separation** - Frontend UI vs Backend API logic
✅ **Documentation** - All guides in root folder for easy access

## 🌐 **Live Backend Status**

Your backend is already deployed and running 24/7:
- **URL**: https://swiftlead.site/api
- **Status**: ✅ Active with 28 cryptocurrencies
- **Database**: ✅ PostgreSQL (Neon) running 24/7
- **Features**: Real-time prices, TradingView webhooks, user authentication

## 📖 **Documentation**

All documentation remains in the root folder:
- `DEPLOYMENT_GUIDE.md` - Complete deployment instructions
- `DEVELOPMENT_SETUP.md` - Local development setup
- `API_Documentation_Guide.md` - API endpoints and usage
- `replit.md` - Project overview and architecture

Your project is now clean, organized, and ready for professional development!