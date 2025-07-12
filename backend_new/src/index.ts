import { createServer } from "http";
import { Server } from "socket.io";
import express from "express";
import { registerRoutes } from "./routes.js";
import { initializeTickers } from "./init-tickers.js";
import { startNotificationProcessor } from "./services/scheduledProcessor.js";
import helmet from "helmet";
import cors from "cors";
import { createPool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import { schema } from "./schema.js";
import { eq } from "drizzle-orm";
import { smsService } from "./services/smsService.js";
import { telegramService } from "./services/telegramService.js";
import rateLimit from "express-rate-limit";
import { securityMiddleware } from "./middleware/security.js";
import { encryptionMiddleware } from "./middleware/encryption.js";
import { dataValidationMiddleware } from "./middleware/dataValidation.js";

const app = express();
const port = Number(process.env.PORT) || 3001;

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

app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['*'] // Allow all origins for API-only deployment
    : ['http://localhost:3000', 'http://localhost:5000', 'http://localhost:5173'],
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
  startNotificationProcessor();
}

// Register API routes
const wsServer = await registerRoutes(app);

// Start services
await initializeServices();

server.listen(port, "0.0.0.0", () => {
  console.log(`Backend API server running on port ${port}`);
});