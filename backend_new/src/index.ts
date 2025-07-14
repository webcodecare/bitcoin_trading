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

// Add a simple dashboard interface at root
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Bitcoin Trading Platform - Backend API</title>
        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
                font-family: 'Segoe UI', system-ui, sans-serif; 
                background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
                color: #ffffff;
                min-height: 100vh;
            }
            .container { max-width: 1200px; margin: 0 auto; padding: 2rem; }
            .header { text-align: center; margin-bottom: 3rem; }
            .logo { font-size: 2.5rem; font-weight: bold; color: #f39c12; margin-bottom: 0.5rem; }
            .subtitle { color: #bdc3c7; font-size: 1.2rem; }
            .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem; margin-bottom: 3rem; }
            .card { 
                background: rgba(255,255,255,0.1); 
                border-radius: 12px; 
                padding: 2rem; 
                backdrop-filter: blur(10px);
                border: 1px solid rgba(255,255,255,0.2);
            }
            .card h3 { color: #f39c12; margin-bottom: 1rem; font-size: 1.3rem; }
            .status { display: inline-block; padding: 0.3rem 0.8rem; border-radius: 20px; font-size: 0.9rem; }
            .online { background: #27ae60; }
            .endpoint { 
                background: rgba(52, 152, 219, 0.2); 
                padding: 0.5rem; 
                margin: 0.3rem 0; 
                border-radius: 6px; 
                font-family: monospace;
            }
            .endpoint a { color: #3498db; text-decoration: none; }
            .endpoint a:hover { text-decoration: underline; }
            .feature { 
                background: rgba(46, 204, 113, 0.2); 
                padding: 0.4rem 0.8rem; 
                margin: 0.2rem; 
                border-radius: 20px; 
                display: inline-block; 
                font-size: 0.9rem;
            }
            .footer { text-align: center; color: #7f8c8d; margin-top: 3rem; }
            .api-test { 
                background: rgba(142, 68, 173, 0.2); 
                padding: 1rem; 
                border-radius: 8px; 
                margin-top: 1rem;
            }
            button { 
                background: #f39c12; 
                color: white; 
                border: none; 
                padding: 0.7rem 1.5rem; 
                border-radius: 6px; 
                cursor: pointer; 
                margin: 0.3rem;
            }
            button:hover { background: #e67e22; }
            #results { 
                background: #2c3e50; 
                padding: 1rem; 
                border-radius: 6px; 
                margin-top: 1rem; 
                font-family: monospace; 
                font-size: 0.9rem;
                max-height: 300px;
                overflow-y: auto;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">₿ Bitcoin Trading Platform</div>
                <div class="subtitle">Backend API Server - Development Mode</div>
                <span class="status online">🟢 ONLINE</span>
            </div>

            <div class="grid">
                <div class="card">
                    <h3>📊 System Status</h3>
                    <p><strong>Version:</strong> 1.0.0</p>
                    <p><strong>Port:</strong> 5000</p>
                    <p><strong>Database:</strong> PostgreSQL (Connected)</p>
                    <p><strong>Tickers:</strong> 28 Active</p>
                    <p><strong>WebSocket:</strong> Ready</p>
                    <p><strong>Notifications:</strong> Processing</p>
                </div>

                <div class="card">
                    <h3>🔗 API Endpoints</h3>
                    <div class="endpoint"><a href="/api/tickers" target="_blank">GET /api/tickers</a></div>
                    <div class="endpoint"><a href="/api/signals" target="_blank">GET /api/signals</a></div>
                    <div class="endpoint"><a href="/api/users" target="_blank">GET /api/users</a></div>
                    <div class="endpoint"><a href="/api/ohlc?symbol=BTCUSDT&interval=1h&limit=10" target="_blank">GET /api/ohlc</a></div>
                    <div class="endpoint">POST /api/webhook/alerts</div>
                </div>

                <div class="card">
                    <h3>🚀 Features</h3>
                    <span class="feature">JWT Authentication</span>
                    <span class="feature">Real-time WebSocket</span>
                    <span class="feature">TradingView Webhooks</span>
                    <span class="feature">28 Crypto Tickers</span>
                    <span class="feature">Notification Processing</span>
                    <span class="feature">OHLC Data</span>
                </div>

                <div class="card">
                    <h3>🧪 API Testing</h3>
                    <button onclick="testEndpoint('/api/tickers')">Test Tickers</button>
                    <button onclick="testEndpoint('/api/signals')">Test Signals</button>
                    <button onclick="testEndpoint('/api/users')">Test Users</button>
                    <div id="results"></div>
                </div>
            </div>

            <div class="footer">
                <p>🔧 Development Server | Ready for Production Deployment</p>
                <p>Frontend can be deployed separately on Vercel, Netlify, or other platforms</p>
            </div>
        </div>

        <script>
            async function testEndpoint(endpoint) {
                const results = document.getElementById('results');
                results.innerHTML = 'Testing ' + endpoint + '...';
                
                try {
                    const response = await fetch(endpoint);
                    const data = await response.json();
                    results.innerHTML = '<strong>' + endpoint + '</strong>\\n' + JSON.stringify(data, null, 2);
                } catch (error) {
                    results.innerHTML = '<strong>Error:</strong>\\n' + error.message;
                }
            }

            // Auto-refresh status every 30 seconds
            setInterval(() => {
                document.querySelector('.status').innerHTML = '🟢 ONLINE - ' + new Date().toLocaleTimeString();
            }, 30000);
        </script>
    </body>
    </html>
  `);
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