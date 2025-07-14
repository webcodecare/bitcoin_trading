# Deployment Guide - Separated Architecture

This guide covers deploying the Bitcoin Trading platform using the separated frontend and backend architecture.

## Deployment Overview

The separated architecture allows for flexible deployment options:

- **Frontend**: Static hosting (Vercel, Netlify, AWS S3, etc.)
- **Backend**: Container platforms (Railway, Heroku, AWS ECS, etc.)
- **Database**: Managed PostgreSQL (Neon, Supabase, AWS RDS, etc.)

## Frontend Deployment

### Option 1: Vercel (Recommended)

```bash
# Install Vercel CLI
npm install -g vercel

# Navigate to frontend directory
cd frontend

# Build the application
npm run build

# Deploy to Vercel
vercel

# Set environment variables in Vercel dashboard
# VITE_API_BASE_URL=https://your-backend-domain.com
# VITE_WS_URL=wss://your-backend-domain.com
```

**Vercel Configuration (vercel.json):**
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### Option 2: Netlify

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Navigate to frontend directory
cd frontend

# Build the application
npm run build

# Deploy to Netlify
netlify deploy --prod --dir=dist

# Set environment variables in Netlify dashboard
```

**Netlify Configuration (_redirects):**
```
/*    /index.html   200
```

### Option 3: AWS S3 + CloudFront

```bash
# Build the application
cd frontend
npm run build

# Install AWS CLI and configure
aws configure

# Create S3 bucket
aws s3 mb s3://your-crypto-app-frontend

# Upload files
aws s3 sync dist/ s3://your-crypto-app-frontend

# Set up CloudFront distribution
# Configure custom domain and SSL
```

## Backend Deployment

### Option 1: Railway (Recommended)

```bash
# Install Railway CLI
npm install -g @railway/cli

# Navigate to backend directory
cd backend

# Login to Railway
railway login

# Initialize project
railway init

# Set environment variables
railway variables set DATABASE_URL=postgresql://...
railway variables set JWT_SECRET=your-secret
railway variables set PORT=3001

# Deploy
railway up
```

**Railway Configuration (railway.toml):**
```toml
[build]
builder = "nixpacks"

[deploy]
startCommand = "npm start"
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 10

[[services]]
name = "backend"
source = "."
```

### Option 2: Heroku

```bash
# Install Heroku CLI
# Navigate to backend directory
cd backend

# Create Heroku app
heroku create your-crypto-backend

# Add PostgreSQL addon
heroku addons:create heroku-postgresql:hobby-dev

# Set environment variables
heroku config:set JWT_SECRET=your-secret
heroku config:set NODE_ENV=production

# Deploy
git init
git add .
git commit -m "Initial commit"
heroku git:remote -a your-crypto-backend
git push heroku main

# Push database schema
heroku run npm run db:push
```

**Heroku Configuration (Procfile):**
```
web: npm start
```

### Option 3: Docker + AWS ECS

**Dockerfile:**
```dockerfile
FROM node:18-alpine AS builder

# Build backend
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm ci --only=production
COPY backend/ ./
RUN npm run build

# Production image
FROM node:18-alpine AS production
WORKDIR /app
COPY --from=builder /app/backend/dist ./
COPY --from=builder /app/backend/node_modules ./node_modules
COPY backend/package.json ./

EXPOSE 3001
CMD ["npm", "start"]
```

```bash
# Build and push to ECR
docker build -t crypto-backend .
docker tag crypto-backend:latest your-account.dkr.ecr.region.amazonaws.com/crypto-backend:latest
docker push your-account.dkr.ecr.region.amazonaws.com/crypto-backend:latest

# Deploy to ECS
aws ecs update-service --cluster your-cluster --service crypto-backend --force-new-deployment
```

## Database Setup

### Option 1: Neon (Recommended)

```bash
# Sign up at https://neon.tech
# Create a new project
# Copy connection string
DATABASE_URL=postgresql://username:password@hostname/database?sslmode=require

# Push schema
cd backend
npm run db:push
```

### Option 2: Supabase

```bash
# Sign up at https://supabase.com
# Create a new project
# Go to Settings > Database
# Copy connection string
DATABASE_URL=postgresql://postgres:password@hostname:5432/postgres

# Push schema
cd backend
npm run db:push
```

### Option 3: AWS RDS

```bash
# Create RDS PostgreSQL instance
aws rds create-db-instance \
  --db-instance-identifier crypto-db \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --master-username admin \
  --master-user-password yourpassword \
  --allocated-storage 20

# Update DATABASE_URL with RDS endpoint
DATABASE_URL=postgresql://admin:yourpassword@crypto-db.xxxxx.rds.amazonaws.com:5432/postgres
```

## Full-Stack Deployment Examples

### Example 1: Vercel + Railway + Neon

```bash
# 1. Deploy Database (Neon)
# Create project at neon.tech
export DATABASE_URL="postgresql://username:password@hostname/database?sslmode=require"

# 2. Deploy Backend (Railway)
cd backend
railway login
railway init
railway variables set DATABASE_URL=$DATABASE_URL
railway variables set JWT_SECRET=$(openssl rand -base64 32)
railway up

# Get backend URL
export BACKEND_URL=$(railway status --json | jq -r '.deployment.url')

# 3. Deploy Frontend (Vercel)
cd ../frontend
vercel env add VITE_API_BASE_URL production $BACKEND_URL
vercel env add VITE_WS_URL production ${BACKEND_URL/https/wss}
vercel --prod
```

### Example 2: Netlify + Heroku + Supabase

```bash
# 1. Deploy Database (Supabase)
# Create project at supabase.com
export DATABASE_URL="postgresql://postgres:password@hostname:5432/postgres"

# 2. Deploy Backend (Heroku)
cd backend
heroku create crypto-backend-app
heroku config:set DATABASE_URL=$DATABASE_URL
heroku config:set JWT_SECRET=$(openssl rand -base64 32)
git push heroku main

# Get backend URL
export BACKEND_URL="https://crypto-backend-app.herokuapp.com"

# 3. Deploy Frontend (Netlify)
cd ../frontend
echo "VITE_API_BASE_URL=$BACKEND_URL" > .env.production
echo "VITE_WS_URL=${BACKEND_URL/https/wss}" >> .env.production
npm run build
netlify deploy --prod --dir=dist
```

## Environment Configuration

### Production Environment Variables

**Frontend (.env.production):**
```bash
VITE_API_BASE_URL=https://your-backend-domain.com
VITE_WS_URL=wss://your-backend-domain.com
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_TRADING=true
VITE_ENABLE_NOTIFICATIONS=true
```

**Backend (production):**
```bash
DATABASE_URL=postgresql://user:pass@host:5432/db?sslmode=require
JWT_SECRET=your-production-secret-key
NODE_ENV=production
PORT=3001

# Optional services
TWILIO_ACCOUNT_SID=your-production-sid
TWILIO_AUTH_TOKEN=your-production-token
TELEGRAM_BOT_TOKEN=your-production-bot-token
SENDGRID_API_KEY=your-production-sendgrid-key
```

## Domain Configuration

### Custom Domain Setup

**Frontend (Vercel):**
```bash
# Add custom domain in Vercel dashboard
# Configure DNS records:
# A record: @ -> Vercel IP
# CNAME record: www -> vercel-alias.com
```

**Backend (Railway/Heroku):**
```bash
# Railway
railway domain add your-api-domain.com

# Heroku
heroku domains:add your-api-domain.com
```

### SSL Certificate

Most platforms provide automatic SSL:
- Vercel: Automatic Let's Encrypt
- Netlify: Automatic Let's Encrypt
- Railway: Automatic SSL
- Heroku: Automatic SSL for custom domains

## Monitoring & Observability

### Application Monitoring

```bash
# Add monitoring to backend
npm install @sentry/node @sentry/integrations

# Configure in backend/src/index.ts
import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
});
```

### Database Monitoring

```bash
# Monitor database performance
# Neon: Built-in monitoring dashboard
# Supabase: Database insights
# RDS: CloudWatch metrics
```

### Uptime Monitoring

```bash
# Use services like:
# - Pingdom
# - UptimeRobot
# - Better Uptime

# Monitor endpoints:
# - Frontend: https://your-domain.com
# - Backend: https://your-api-domain.com/api/health
# - Database: Connection health checks
```

## Security Considerations

### Production Security Checklist

- [ ] Use strong JWT secrets (32+ characters)
- [ ] Enable HTTPS for all domains
- [ ] Configure CORS for production domains only
- [ ] Use environment variables for all secrets
- [ ] Enable database SSL connections
- [ ] Set up rate limiting
- [ ] Configure security headers
- [ ] Enable audit logging
- [ ] Use managed database services
- [ ] Regular security updates

### Environment Secrets

```bash
# Never commit secrets to git
echo ".env*" >> .gitignore
echo "*.key" >> .gitignore
echo "config/production.json" >> .gitignore

# Use platform secret management
# Vercel: Environment Variables
# Railway: Variables
# Heroku: Config Vars
# AWS: Parameter Store
```

## Backup & Recovery

### Database Backups

```bash
# Neon: Automatic backups
# Supabase: Automatic backups
# RDS: Automated snapshots

# Manual backup
pg_dump $DATABASE_URL > backup.sql

# Restore from backup
psql $DATABASE_URL < backup.sql
```

### Application Backups

```bash
# Code: Git repository
# Static assets: CDN/S3 backup
# Environment configs: Secure documentation
# Database: Regular automated backups
```

## Performance Optimization

### Frontend Optimization

```bash
# Build optimization
npm run build

# Analyze bundle
npm install -g webpack-bundle-analyzer
npx vite-bundle-analyzer dist

# CDN configuration
# Use Vercel Edge Network or CloudFront
```

### Backend Optimization

```bash
# Database connection pooling (already configured)
# Redis caching (optional)
# Load balancing for multiple instances
# Database query optimization
```

## Troubleshooting Deployment

### Common Issues

#### CORS Errors
```bash
# Update backend CORS configuration
# Add production frontend domain to allowed origins
```

#### Environment Variables Not Loading
```bash
# Verify variables are set in platform dashboard
# Check variable names (VITE_ prefix for frontend)
# Restart applications after changes
```

#### Database Connection Issues
```bash
# Verify DATABASE_URL format
# Check SSL requirements
# Test connection manually
psql $DATABASE_URL
```

#### Build Failures
```bash
# Check build logs
# Verify all dependencies are listed in package.json
# Test build locally first
npm run build
```

This deployment guide provides comprehensive coverage for deploying the separated architecture to various platforms. Choose the options that best fit your requirements and infrastructure preferences.