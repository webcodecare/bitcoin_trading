import { createServer } from "http";
import { Server } from "socket.io";
import express from "express";
import { registerRoutes } from "./routes.js";
import { initializeTickers } from "./init-tickers.js";
import { scheduledProcessor } from "./services/scheduledProcessor.js";
import { config } from "./config.js";
import helmet from "helmet";
import cors from "cors";
import { createPool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import { schema } from "./schema.js";
import { eq } from "drizzle-orm";
import { smsService } from "./services/smsService.js";
import { telegramService } from "./services/telegramService.js";
import rateLimit from "express-rate-limit";
import { securityMiddleware, encryptionMiddleware, dataValidationMiddleware } from "./middleware/simple.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = config.port;

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https:"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https:"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https:", "wss:"],
      frameSrc: ["'self'", "https:"],
      fontSrc: ["'self'", "https:", "data:"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'", "https:"],
      workerSrc: ["'self'", "blob:"],
      upgradeInsecureRequests: [],
    },
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS Configuration using centralized config
const corsOrigins = config.corsOrigin 
  ? config.corsOrigin.split(',').map(origin => origin.trim())
  : config.nodeEnv === 'production' 
    ? ['*'] // Allow all origins for API-only deployment
    : ['http://localhost:3000', 'http://localhost:5000', 'http://localhost:5173'];

app.use(cors({
  origin: corsOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

app.use('/api', limiter);

// Security middleware
app.use(securityMiddleware);
app.use(encryptionMiddleware);
app.use(dataValidationMiddleware);

// Serve static files from frontend_new/dist (if built) or a simple HTML page
const frontendDistPath = path.join(__dirname, '../../../frontend_new/dist');
app.use(express.static(frontendDistPath));

// Add a simple API status page at root
app.get('/', (req, res) => {
  res.json({
    name: "Bitcoin Trading Backend API",
    version: "1.0.0",
    status: "online",
    features: [
      "28 cryptocurrency tickers",
      "Real-time WebSocket support", 
      "TradingView webhook integration",
      "JWT authentication",
      "PostgreSQL database",
      "Notification processing"
    ],
    endpoints: {
      tickers: "/api/tickers",
      signals: "/api/signals", 
      users: "/api/users",
      ohlc: "/api/ohlc",
      webhook: "/api/webhook/alerts",
      health: "/api/health"
    },
    database: {
      connected: true,
      tickers: 28
    },
    services: {
      notificationProcessor: "active",
      webSocket: "ready",
      authentication: "enabled"
    }
  });
});

// Initialize services
if (process.env.NODE_ENV === 'development') {
  console.log('SMS Service not configured - missing Twilio credentials');
  console.log('Telegram Service not configured - missing bot token');
}

const server = createServer(app);

// Initialize and start services
async function initializeServices() {
  try {
    await initializeTickers();
    console.log('Cryptocurrency tickers initialized successfully');
  } catch (error) {
    console.error('Failed to initialize tickers:', error);
  }

  // Start notification processor
  scheduledProcessor.startScheduledProcessing();
}

// Register API routes
const wsServer = await registerRoutes(app);

// Start services
await initializeServices();

server.listen(port, "0.0.0.0", () => {
  console.log(`Backend API server running on port ${port}`);
});