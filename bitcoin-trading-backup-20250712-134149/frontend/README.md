# CryptoStrategy Pro - Frontend

React-based frontend application for the CryptoStrategy Pro cryptocurrency trading platform.

## Features

- **Real-time Trading Interface**: Professional TradingView charts with live market data
- **Multi-ticker Dashboard**: Support for 25+ cryptocurrencies across different categories
- **User Authentication**: JWT-based authentication with role-based access control
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **Performance Optimized**: Lazy loading, code splitting, and performance monitoring
- **Advanced Charts**: Interactive charts with technical indicators and signal overlays

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS + Radix UI
- **State Management**: TanStack React Query + React Context
- **Routing**: Wouter
- **Charts**: Lightweight Charts + TradingView widgets
- **Animations**: Framer Motion

## Quick Start

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment variables**:
   ```bash
   cp .env.example .env
   ```
   Update the API base URL in `.env`:
   ```
   VITE_API_BASE_URL=http://localhost:3001
   VITE_WS_URL=ws://localhost:3001
   ```

3. **Start development server**:
   ```bash
   npm run dev
   ```

4. **Build for production**:
   ```bash
   npm run build
   ```

## Architecture

### Component Structure
- `/components/ui/` - Reusable UI components (shadcn/ui)
- `/components/layout/` - Layout components (Sidebar, TopBar, etc.)
- `/components/charts/` - Chart components (TradingView, Lightweight Charts)
- `/components/auth/` - Authentication components
- `/components/trading/` - Trading-specific components

### Pages Structure
- `/pages/` - Page components for routing
- `/pages/admin/` - Admin dashboard pages
- `/pages/auth/` - Authentication pages

### Utilities
- `/lib/` - Utility functions and configurations
- `/hooks/` - Custom React hooks
- `/services/` - API service functions
- `/types/` - TypeScript type definitions

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | Backend API URL | `http://localhost:3001` |
| `VITE_WS_URL` | WebSocket URL | `ws://localhost:3001` |

## Development

- **Port**: 3000
- **Proxy**: API calls are proxied to backend on port 3001
- **Hot Reload**: Enabled for fast development

## Performance Features

- **Code Splitting**: Automatic route-based code splitting
- **Lazy Loading**: Heavy components are lazy-loaded
- **Bundle Analysis**: Optimized vendor chunks
- **Performance Monitoring**: Built-in performance tracking

## Build & Deploy

The frontend builds to static files that can be deployed to any static hosting service:

```bash
npm run build
npm run preview  # Preview production build
```

## API Integration

The frontend communicates with the backend via:
- REST API endpoints (`/api/*`)
- WebSocket connections for real-time updates
- Authentication via JWT tokens stored in localStorage