# CryptoStrategy Pro

## Overview

CryptoStrategy Pro is a full-stack cryptocurrency trading signals platform built with React and Express. The application provides real-time trading signals, advanced analytics including 200-week heatmaps and cycle forecasting, user management with role-based access control, and comprehensive alert systems for cryptocurrency traders.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with CSS variables for theming
- **UI Components**: Radix UI primitives with shadcn/ui component library
- **State Management**: TanStack React Query for server state, React Context for authentication
- **Routing**: Wouter for client-side routing
- **Build Tool**: Vite with ESBuild for production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon serverless PostgreSQL
- **Real-time Communication**: WebSocket server for live updates
- **Authentication**: JWT tokens with bcrypt password hashing
- **Session Storage**: PostgreSQL-backed sessions with connect-pg-simple

## Key Components

### Database Schema
The application uses a comprehensive PostgreSQL schema managed by Drizzle ORM:
- **Users**: Authentication and profile management with role-based access
- **User Settings**: Preferences for notifications, theme, and language
- **Available Tickers**: Cryptocurrency symbols with enable/disable functionality
- **Subscriptions**: User subscriptions to specific trading pairs
- **Alert Signals**: Trading signals (buy/sell) with timestamps and metadata
- **OHLC Data**: Price data for charting and analysis
- **Heatmap Data**: 200-week SMA analysis data
- **Cycle Data**: Market cycle analysis with 2-year moving averages
- **Forecast Data**: Predictive analytics data
- **Admin Logs**: Administrative action tracking

### Authentication System
- JWT-based authentication with secure token storage
- Role-based access control (admin/user roles)
- Protected routes with AuthGuard component
- Persistent sessions with automatic token refresh

### Real-time Features
- WebSocket connection manager for live updates
- Real-time trading signals broadcast to connected clients
- Live market data updates for charts and widgets
- Connection management with automatic reconnection

### Chart Components
- **TradingViewChart**: OHLC price charts with signal overlays
- **HeatmapChart**: 200-week SMA deviation visualization
- **CycleChart**: Market cycle analysis with forecasting
- Custom chart implementations with responsive design

## Data Flow

1. **User Authentication**: Login/register → JWT token → stored in localStorage → included in API requests
2. **Real-time Updates**: WebSocket connection → broadcasts signals → updates UI components
3. **Market Data**: External APIs → processed by backend → cached → served to frontend
4. **Trading Signals**: Algorithm generation → database storage → WebSocket broadcast → user notifications
5. **User Preferences**: Frontend settings → API updates → database persistence → real-time sync

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: Serverless PostgreSQL driver for Neon
- **drizzle-orm**: Type-safe SQL query builder and ORM
- **@tanstack/react-query**: Server state management and caching
- **bcryptjs**: Password hashing for security
- **ws**: WebSocket server implementation
- **express**: Web framework for Node.js

### UI Dependencies
- **@radix-ui/***: Accessible component primitives
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Component variant management
- **lucide-react**: Icon library

### Development Dependencies
- **vite**: Build tool and development server
- **typescript**: Type checking and compilation
- **tsx**: TypeScript execution for development

## Deployment Strategy

### Development Environment
- Vite development server with HMR (Hot Module Replacement)
- Express server running on separate process
- WebSocket server integrated with HTTP server
- Automatic TypeScript compilation and error overlay

### Production Build
- Frontend: Vite build → static assets in `dist/public`
- Backend: ESBuild bundle → single `dist/index.js` file
- Database: Drizzle migrations applied via `drizzle-kit push`
- Environment: PostgreSQL database URL required for deployment

### Configuration
- TypeScript configuration supports both client and server code
- Path aliases configured for clean imports (`@/`, `@shared/`)
- Tailwind CSS configured with custom design tokens
- PostCSS with autoprefixer for browser compatibility

## Current Authentication System

**Note**: The project documents mention Supabase authentication, but the current implementation uses:
- JWT-based authentication with bcrypt password hashing
- Role-based access control (admin/user roles)
- Session storage in PostgreSQL with connect-pg-simple
- Manual user registration and login system

**Supabase Integration**: To implement Supabase authentication as mentioned in the project documents, we would need to:
1. Replace the current JWT auth system with Supabase Auth
2. Update the user schema to match Supabase user structure  
3. Implement row-level security (RLS) policies
4. Update all auth-related frontend components

## Complete Admin Module System

Based on the attached project documents, the platform now includes all required admin modules:

### Core Admin Modules
- **User Management** (`/admin/users`) - CRUD operations for users, role management
- **Ticker Management** (`/admin/tickers`) - Enable/disable trading pairs, control chart availability
- **Signal Logs** (`/admin/signals`) - View all trading signals, manual signal injection

### Alert & Notification System  
- **Alert System** (`/admin/alerts`) - Webhook configurations, TradingView integration, delivery queue
- **Notification Management** (`/admin/notifications`) - Email/SMS/Push configuration, template management
- **Activity Logs** (`/admin/logs`) - Complete audit trail of admin actions

### Analytics Management
- **Analytics** (`/admin/analytics`) - 200-week heatmap, cycle indicators, forecast data management

### Buy/Sell Signal System
The platform supports manual signal injection through the admin interface:
- Manual buy/sell signal creation with price, ticker, and notes
- Real-time WebSocket broadcasting to all connected users
- Integration with TradingView webhook alerts
- Signal history and analytics tracking

## Changelog

```
Changelog:
- July 05, 2025. Initial setup
- July 05, 2025. Added PostgreSQL database with sample data
- July 05, 2025. Created separate admin pages for user management, signal logs, and ticker management
- July 05, 2025. Fixed component naming conflicts and added proper routing for admin sub-pages
- July 05, 2025. Added complete frontend page structure: Members, Market Data, About, Contact, Privacy, Terms
- July 05, 2025. Updated navigation menus with all required pages and added footer component
- July 05, 2025. Added comprehensive admin module system: alerts, notifications, logs, analytics management
- July 05, 2025. Implemented buy/sell signal injection system and TradingView webhook integration support
- July 05, 2025. Enhanced payment processing with promotional codes, usage tracking, and comprehensive subscription management
- July 05, 2025. Added complete admin module system with all 11 specialized pages: Reports, Subscriptions, Payments, Integrations, Content Management
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```