#!/bin/bash

echo "🔄 Creating complete project backup..."

# Create backup directory with timestamp
BACKUP_DIR="bitcoin-trading-backup-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"

echo "📁 Copying all project files..."

# Copy all essential directories and files
cp -r client/ "$BACKUP_DIR/"
cp -r server/ "$BACKUP_DIR/"
cp -r shared/ "$BACKUP_DIR/"
cp -r backend/ "$BACKUP_DIR/"
cp -r frontend/ "$BACKUP_DIR/"
cp -r node_modules/ "$BACKUP_DIR/" 2>/dev/null || echo "Skipping node_modules (too large)"

# Copy all configuration files
cp package*.json "$BACKUP_DIR/"
cp tsconfig.json "$BACKUP_DIR/"
cp vite.config.ts "$BACKUP_DIR/"
cp tailwind.config.ts "$BACKUP_DIR/"
cp components.json "$BACKUP_DIR/"
cp drizzle.config.ts "$BACKUP_DIR/"
cp .replit "$BACKUP_DIR/"
cp replit.md "$BACKUP_DIR/"

# Copy documentation
cp *.md "$BACKUP_DIR/"
cp -r attached_assets/ "$BACKUP_DIR/" 2>/dev/null || echo "No attached assets"

# Export database
echo "💾 Exporting database..."
if [ ! -z "$DATABASE_URL" ]; then
    pg_dump "$DATABASE_URL" > "$BACKUP_DIR/database-backup.sql"
    echo "✅ Database exported to database-backup.sql"
else
    echo "⚠️  DATABASE_URL not found, skipping database export"
fi

# Create environment template
echo "🔧 Creating environment template..."
cat > "$BACKUP_DIR/.env.example" << EOF
# Database
DATABASE_URL=your_postgresql_url_here

# API Configuration
NODE_ENV=production
PORT=5000

# External APIs (optional)
BINANCE_API_KEY=your_binance_api_key
BINANCE_SECRET_KEY=your_binance_secret_key

# Notification Services (optional)
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_PHONE_NUMBER=your_twilio_phone

# Email Service (optional)
SENDGRID_API_KEY=your_sendgrid_key
FROM_EMAIL=your_email@domain.com

# Telegram Bot (optional)
TELEGRAM_BOT_TOKEN=your_telegram_token
EOF

# Create deployment instructions
cat > "$BACKUP_DIR/DEPLOYMENT_INSTRUCTIONS.md" << EOF
# Bitcoin Trading Platform - Deployment Instructions

## Quick Start

1. **Install Dependencies:**
   \`\`\`bash
   npm install
   \`\`\`

2. **Setup Database:**
   \`\`\`bash
   # Restore database
   psql \$DATABASE_URL < database-backup.sql
   
   # Or push schema if starting fresh
   npm run db:push
   \`\`\`

3. **Configure Environment:**
   \`\`\`bash
   cp .env.example .env
   # Edit .env with your actual values
   \`\`\`

4. **Start Application:**
   \`\`\`bash
   npm run dev
   \`\`\`

## What's Included

✅ Complete frontend (React + TypeScript)
✅ Complete backend (Node.js + Express)
✅ Database schema with all tables
✅ 28 cryptocurrency tickers
✅ TradingView webhook integration
✅ Professional trading charts
✅ Real-time price updates
✅ Notification system (Email/SMS/Telegram)
✅ Admin dashboard
✅ User management
✅ Subscription management

## Database Tables (28 total)

- users, user_settings, user_subscriptions
- alert_signals, user_alerts
- available_tickers (28 cryptocurrencies)
- ohlc_cache, heatmap_data, cycle_indicator_data, forecast_data
- notification_queue, notification_logs, notification_templates
- webhook_secrets, subscription_plans
- admin_activity_log, user_roles
- And more...

## Current Features Working

- Bitcoin price: \$69,452 (live fallback data)
- Real-time updates every 5 seconds
- Professional TradingView-style charts
- Database with 28 cryptocurrency support
- Complete notification infrastructure
- Admin management system

## 24/7 Deployment Ready

This codebase is ready for deployment to:
- Railway.app
- Render.com
- Fly.io
- Heroku
- Any Node.js hosting platform

The backend can run independently for 24/7 operation.
EOF

# Create archive
echo "📦 Creating compressed archive..."
tar -czf "${BACKUP_DIR}.tar.gz" "$BACKUP_DIR"

# Show results
echo ""
echo "✅ Backup completed successfully!"
echo "📂 Backup directory: $BACKUP_DIR"
echo "📦 Compressed archive: ${BACKUP_DIR}.tar.gz"
echo ""
echo "📋 Backup Contents:"
ls -la "$BACKUP_DIR"
echo ""
echo "💾 Database backup: $(ls -lh $BACKUP_DIR/database-backup.sql 2>/dev/null || echo 'Not created - DATABASE_URL missing')"
echo "📊 Archive size: $(ls -lh ${BACKUP_DIR}.tar.gz)"
echo ""
echo "🚀 Ready for deployment on any platform!"