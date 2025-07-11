# Bitcoin Trading Platform - Separated Architecture

A professional cryptocurrency trading platform with separated frontend and backend architecture for better scalability and maintainability.

## Architecture Overview

The application is now separated into two distinct applications:

### Frontend (`/frontend/`)
- **React + TypeScript** SPA
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **TanStack React Query** for data fetching
- **Runs on port 3000**

### Backend (`/backend/`)
- **Node.js + Express** API server
- **PostgreSQL** with Drizzle ORM
- **WebSocket** for real-time features
- **JWT Authentication**
- **Runs on port 3001**

## Quick Start

### Option 1: Run Both Applications Separately

1. **Start Backend**:
   ```bash
   cd backend
   npm install
   npm run dev
   ```

2. **Start Frontend** (in new terminal):
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

3. **Access Application**:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001/api

### Option 2: Use the Original Monolith Setup

The original combined setup is still available in the root directory:
```bash
npm run dev
```

## Key Benefits of Separated Architecture

### 🚀 **Scalability**
- Independent scaling of frontend and backend
- Deploy frontend to CDN/static hosting
- Backend can be containerized and load-balanced

### 🔧 **Development**
- Teams can work independently on frontend/backend
- Separate technology stacks and dependencies
- Better code organization and maintainability

### 🌐 **Deployment Options**
- **Frontend**: Deploy to Vercel, Netlify, S3, etc.
- **Backend**: Deploy to Railway, Heroku, AWS, etc.
- **Database**: Use managed PostgreSQL services

### 🔒 **Security**
- Clear separation of concerns
- Frontend only handles UI/UX
- Backend handles all business logic and data

## Project Structure

```
crypto-strategy-pro/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # UI components
│   │   ├── pages/           # Page components
│   │   ├── hooks/           # Custom hooks
│   │   ├── lib/             # Utilities
│   │   └── types/           # TypeScript types
│   ├── package.json
│   ├── vite.config.ts
│   └── README.md
├── backend/                  # Express backend API
│   ├── src/
│   │   ├── routes.ts        # API routes
│   │   ├── schema.ts        # Database schema
│   │   ├── services/        # Business logic
│   │   └── middleware/      # Express middleware
│   ├── package.json
│   ├── drizzle.config.ts
│   └── README.md
├── client/                   # Original frontend (deprecated)
├── server/                   # Original backend (deprecated)
└── README.md                # This file
```

## Migration Guide

### From Monolith to Separated Architecture

1. **Frontend Migration**:
   - All React components moved to `frontend/src/`
   - API calls now use proxy configuration
   - Environment variables prefixed with `VITE_`

2. **Backend Migration**:
   - Express server moved to `backend/src/`
   - Database schema and migrations unchanged
   - API endpoints remain the same

3. **Database**:
   - No changes required
   - Same PostgreSQL database used by both setups

## Environment Setup

### Frontend Environment (`.env`)
```
VITE_API_BASE_URL=http://localhost:3001
VITE_WS_URL=ws://localhost:3001
```

### Backend Environment (`.env`)
```
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret-key
PORT=3001
NODE_ENV=development
```

## API Communication

The frontend communicates with the backend via:
- **REST API**: `/api/*` endpoints
- **WebSocket**: Real-time updates
- **CORS**: Configured for cross-origin requests

## Deployment Examples

### Frontend Deployment (Vercel)
```bash
cd frontend
npm run build
# Deploy dist/ folder to Vercel
```

### Backend Deployment (Railway)
```bash
cd backend
npm run build
# Deploy to Railway with PostgreSQL addon
```

### Full-Stack Deployment (Docker)
```dockerfile
# Multi-stage build for both apps
FROM node:18-alpine AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

FROM node:18-alpine AS backend-build
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm install
COPY backend/ ./
RUN npm run build

FROM node:18-alpine AS production
WORKDIR /app
COPY --from=backend-build /app/backend/dist ./backend/
COPY --from=frontend-build /app/frontend/dist ./frontend/
EXPOSE 3001
CMD ["node", "backend/index.js"]
```

## Development Workflow

### 1. Feature Development
- Create feature branches for frontend and backend separately
- Use separate package.json files for dependencies
- Test integration between apps

### 2. API Changes
- Update backend API endpoints
- Update frontend API calls
- Maintain backward compatibility when possible

### 3. Database Changes
- Use Drizzle migrations from backend directory
- Update schema types in both apps
- Test data flow end-to-end

## Testing

### Frontend Tests
```bash
cd frontend
npm test
```

### Backend Tests
```bash
cd backend
npm test
```

### Integration Tests
```bash
# Start both apps and run E2E tests
npm run test:e2e
```

## Monitoring & Observability

### Frontend Monitoring
- Performance metrics via Web Vitals
- Error tracking with error boundaries
- User analytics and behavior tracking

### Backend Monitoring
- API response times and error rates
- Database query performance
- WebSocket connection health
- Resource usage (CPU, memory)

## Contributing

When contributing to the separated architecture:

1. **Frontend changes**: Work in `frontend/` directory
2. **Backend changes**: Work in `backend/` directory
3. **Database changes**: Update schema in `backend/src/schema.ts`
4. **Documentation**: Update relevant README files

## Support

For issues specific to:
- **Frontend**: Check `frontend/README.md`
- **Backend**: Check `backend/README.md`
- **Database**: Check Drizzle documentation
- **General**: Create an issue in the main repository

---

**Note**: The original monolith setup in the root directory is still functional and will be maintained for backward compatibility. Choose the architecture that best fits your deployment needs and team structure.