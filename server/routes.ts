import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import bcrypt from "bcryptjs";
import Stripe from "stripe";
import { storage } from "./storage";
import { insertUserSchema, insertSignalSchema, insertTickerSchema, insertUserAlertSchema, insertDashboardLayoutSchema } from "@shared/schema";
import { cycleForecastingService } from "./services/cycleForecasting";
import { notificationService } from "./services/notificationService";
import { smsService } from "./services/smsService";
import { telegramService } from "./services/telegramService";
import { smartTimingOptimizer } from "./services/smartTimingOptimizer";
import { z } from "zod";

// Initialize Stripe
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-11-20.acacia",
});

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // WebSocket server for real-time updates
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  const clients = new Set<WebSocket>();
  
  wss.on('connection', (ws) => {
    clients.add(ws);
    console.log('Client connected to WebSocket');
    
    ws.on('close', () => {
      clients.delete(ws);
      console.log('Client disconnected from WebSocket');
    });
    
    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
      clients.delete(ws);
    });
  });

  // Broadcast to all connected clients
  function broadcast(message: any) {
    const data = JSON.stringify(message);
    clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(data);
      }
    });
  }

  // Authentication middleware
  const requireAuth = async (req: any, res: any, next: any) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'No token provided' });
      }
      
      const token = authHeader.substring(7);
      // For demo purposes, the token is the user ID
      const user = await storage.getUser(token);
      if (!user) {
        return res.status(401).json({ message: 'Invalid token' });
      }
      
      req.user = user;
      next();
    } catch (error) {
      res.status(401).json({ message: 'Authentication failed' });
    }
  };

  const requireAdmin = (req: any, res: any, next: any) => {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    next();
  };

  // TradingView webhook authentication
  const validateWebhookSecret = (req: any, res: any, next: any) => {
    const secret = req.headers['x-webhook-secret'] || req.body.secret || req.query.secret;
    const validSecret = process.env.TRADINGVIEW_WEBHOOK_SECRET || 'default_secret';
    
    if (secret !== validSecret) {
      return res.status(401).json({ message: 'Invalid webhook secret' });
    }
    
    next();
  };

  // Supported timeframes for BTCUSD
  const SUPPORTED_TIMEFRAMES = ['1M', '1W', '1D', '12h', '4h', '1h', '30m'];
  const SUPPORTED_TICKERS = ['BTCUSD']; // Initially only BTCUSD

  // Auth routes
  app.post('/api/auth/register', async (req, res) => {
    try {
      const { email, password, firstName, lastName } = insertUserSchema.extend({
        password: z.string().min(6),
      }).parse(req.body);

      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await storage.createUser({
        email,
        hashedPassword,
        firstName,
        lastName,
        role: 'user',
        isActive: true,
      });

      // Create default settings
      await storage.createUserSettings({
        userId: user.id,
        notificationEmail: true,
        notificationSms: false,
        notificationPush: true,
        theme: 'dark',
        language: 'en',
      });

      res.json({ user: { ...user, hashedPassword: undefined }, token: user.id });
    } catch (error) {
      res.status(400).json({ message: 'Registration failed', error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = z.object({
        email: z.string().email(),
        password: z.string(),
      }).parse(req.body);

      const user = await storage.getUserByEmail(email);
      if (!user || !await bcrypt.compare(password, user.hashedPassword)) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      if (!user.isActive) {
        return res.status(401).json({ message: 'Account is deactivated' });
      }

      await storage.updateUser(user.id, { lastLoginAt: new Date() });

      res.json({ user: { ...user, hashedPassword: undefined }, token: user.id });
    } catch (error) {
      res.status(400).json({ message: 'Login failed', error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // User routes
  app.get('/api/user/profile', requireAuth, async (req: any, res) => {
    try {
      const settings = await storage.getUserSettings(req.user.id);
      res.json({ 
        user: { ...req.user, hashedPassword: undefined },
        settings 
      });
    } catch (error) {
      res.status(500).json({ message: 'Failed to get profile' });
    }
  });

  // Get comprehensive user settings
  app.get('/api/user/settings', requireAuth, async (req: any, res) => {
    try {
      const settings = await storage.getUserSettings(req.user.id);
      if (!settings) {
        // Create default settings if none exist
        const defaultSettings = await storage.createUserSettings({
          userId: req.user.id,
        });
        res.json(defaultSettings);
      } else {
        res.json(settings);
      }
    } catch (error) {
      console.error('Failed to get user settings:', error);
      res.status(500).json({ message: 'Failed to get settings' });
    }
  });

  // Update comprehensive user settings
  app.put('/api/user/settings', requireAuth, async (req: any, res) => {
    try {
      const updates = z.object({
        // Notification Preferences
        notificationEmail: z.boolean().optional(),
        notificationSms: z.boolean().optional(),
        notificationPush: z.boolean().optional(),
        emailSignalAlerts: z.boolean().optional(),
        smsSignalAlerts: z.boolean().optional(),
        pushSignalAlerts: z.boolean().optional(),
        emailFrequency: z.enum(['realtime', 'daily', 'weekly', 'never']).optional(),
        quietHoursStart: z.string().optional(),
        quietHoursEnd: z.string().optional(),
        weekendNotifications: z.boolean().optional(),
        
        // Display Preferences
        theme: z.enum(['light', 'dark', 'auto']).optional(),
        language: z.string().optional(),
        timezone: z.string().optional(),
        currency: z.string().optional(),
        dateFormat: z.enum(['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD']).optional(),
        timeFormat: z.enum(['12h', '24h']).optional(),
        
        // Chart Preferences
        defaultChartType: z.enum(['candlestick', 'line', 'area', 'heikin_ashi']).optional(),
        defaultTimeframe: z.enum(['1m', '5m', '15m', '1h', '4h', '1d', '1w']).optional(),
        chartTheme: z.enum(['dark', 'light', 'auto']).optional(),
        showVolume: z.boolean().optional(),
        showIndicators: z.boolean().optional(),
        autoRefreshCharts: z.boolean().optional(),
        chartRefreshInterval: z.number().min(5).max(300).optional(),
        
        // Trading Preferences
        defaultOrderType: z.enum(['market', 'limit', 'stop_loss', 'take_profit']).optional(),
        confirmTrades: z.boolean().optional(),
        enablePaperTrading: z.boolean().optional(),
        paperTradingBalance: z.string().optional(),
        riskPercentage: z.string().optional(),
        stopLossPercentage: z.string().optional(),
        takeProfitPercentage: z.string().optional(),
        
        // Dashboard Preferences
        defaultDashboard: z.enum(['overview', 'trading', 'analytics', 'portfolio']).optional(),
        showPriceAlerts: z.boolean().optional(),
        showRecentTrades: z.boolean().optional(),
        showPortfolioSummary: z.boolean().optional(),
        showMarketOverview: z.boolean().optional(),
        maxDashboardItems: z.number().min(5).max(50).optional(),
        compactView: z.boolean().optional(),
        
        // Privacy & Security
        profileVisibility: z.enum(['public', 'friends', 'private']).optional(),
        shareTradeHistory: z.boolean().optional(),
        allowAnalytics: z.boolean().optional(),
        twoFactorEnabled: z.boolean().optional(),
        sessionTimeout: z.number().min(15).max(10080).optional(),
        
        // Advanced Features
        enableBetaFeatures: z.boolean().optional(),
        apiAccessEnabled: z.boolean().optional(),
        webhookUrl: z.string().url().optional().or(z.literal('')),
        customCssEnabled: z.boolean().optional(),
        customCss: z.string().optional(),
      }).parse(req.body);

      const settings = await storage.updateUserSettings(req.user.id, updates);
      res.json(settings);
    } catch (error: any) {
      console.error('Failed to update user settings:', error);
      if (error.issues) {
        res.status(400).json({ 
          message: 'Validation error', 
          details: error.issues.map((issue: any) => ({
            field: issue.path.join('.'),
            message: issue.message
          }))
        });
      } else {
        res.status(400).json({ message: 'Failed to update settings' });
      }
    }
  });

  // Partial update for single preference changes
  app.patch('/api/user/settings', requireAuth, async (req: any, res) => {
    try {
      // Allow any single preference update without strict validation
      const updates = req.body;
      const settings = await storage.updateUserSettings(req.user.id, updates);
      res.json(settings);
    } catch (error) {
      console.error('Failed to patch user settings:', error);
      res.status(400).json({ message: 'Failed to update settings' });
    }
  });

  // Reset settings to defaults
  app.post('/api/user/settings/reset', requireAuth, async (req: any, res) => {
    try {
      // Get current settings
      const currentSettings = await storage.getUserSettings(req.user.id);
      if (!currentSettings) {
        return res.status(404).json({ message: 'Settings not found' });
      }

      // Reset to defaults by creating new settings
      const defaultSettings = await storage.createUserSettings({
        userId: req.user.id,
      });

      res.json(defaultSettings);
    } catch (error) {
      console.error('Failed to reset user settings:', error);
      res.status(500).json({ message: 'Failed to reset settings' });
    }
  });

  // Export settings
  app.get('/api/user/settings/export', requireAuth, async (req: any, res) => {
    try {
      const settings = await storage.getUserSettings(req.user.id);
      if (!settings) {
        return res.status(404).json({ message: 'Settings not found' });
      }

      // Remove internal fields
      const exportData = {
        ...settings,
        id: undefined,
        userId: undefined,
        createdAt: undefined,
        updatedAt: undefined,
      };

      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', 'attachment; filename="preferences.json"');
      res.json(exportData);
    } catch (error) {
      console.error('Failed to export settings:', error);
      res.status(500).json({ message: 'Failed to export settings' });
    }
  });

  // Import settings
  app.post('/api/user/settings/import', requireAuth, async (req: any, res) => {
    try {
      const importData = req.body;
      
      // Validate and clean import data
      const cleanData = Object.keys(importData).reduce((acc: any, key) => {
        // Skip internal fields
        if (!['id', 'userId', 'createdAt', 'updatedAt'].includes(key)) {
          acc[key] = importData[key];
        }
        return acc;
      }, {});

      const settings = await storage.updateUserSettings(req.user.id, cleanData);
      res.json(settings);
    } catch (error) {
      console.error('Failed to import settings:', error);
      res.status(400).json({ message: 'Failed to import settings' });
    }
  });

  // Ticker routes
  app.get('/api/tickers', async (req, res) => {
    try {
      const tickers = await storage.getEnabledTickers();
      res.json(tickers);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get tickers' });
    }
  });

  app.get('/api/admin/tickers', requireAuth, requireAdmin, async (req, res) => {
    try {
      const tickers = await storage.getAllTickers();
      res.json(tickers);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get tickers' });
    }
  });

  app.post('/api/admin/tickers', requireAuth, requireAdmin, async (req: any, res) => {
    try {
      const tickerData = insertTickerSchema.parse(req.body);
      const ticker = await storage.createTicker(tickerData);
      
      await storage.createAdminLog({
        adminId: req.user.id,
        action: 'CREATE_TICKER',
        targetTable: 'available_tickers',
        targetId: ticker.id,
        notes: `Created ticker: ${ticker.symbol}`,
      });

      res.json(ticker);
    } catch (error) {
      res.status(400).json({ message: 'Failed to create ticker' });
    }
  });

  app.put('/api/admin/tickers/:id', requireAuth, requireAdmin, async (req: any, res) => {
    try {
      const { id } = req.params;
      const updates = z.object({
        symbol: z.string().optional(),
        description: z.string().optional(),
        isEnabled: z.boolean().optional(),
      }).parse(req.body);

      const ticker = await storage.updateTicker(id, updates);
      if (!ticker) {
        return res.status(404).json({ message: 'Ticker not found' });
      }

      await storage.createAdminLog({
        adminId: req.user.id,
        action: 'UPDATE_TICKER',
        targetTable: 'available_tickers',
        targetId: ticker.id,
        notes: `Updated ticker: ${ticker.symbol}`,
      });

      res.json(ticker);
    } catch (error) {
      res.status(400).json({ message: 'Failed to update ticker' });
    }
  });

  app.delete('/api/admin/tickers/:id', requireAuth, requireAdmin, async (req: any, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteTicker(id);
      
      if (!success) {
        return res.status(404).json({ message: 'Ticker not found' });
      }

      await storage.createAdminLog({
        adminId: req.user.id,
        action: 'DELETE_TICKER',
        targetTable: 'available_tickers',
        targetId: id,
        notes: `Deleted ticker with ID: ${id}`,
      });

      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: 'Failed to delete ticker' });
    }
  });

  // Signal routes
  app.get('/api/signals', requireAuth, async (req: any, res) => {
    try {
      const { ticker, limit, timeframe } = req.query;
      let signals;
      
      if (ticker) {
        signals = await storage.getSignalsByTicker(ticker, limit ? parseInt(limit) : undefined);
      } else {
        signals = await storage.getSignals(limit ? parseInt(limit) : undefined);
      }
      
      // Filter by timeframe if specified
      if (timeframe && typeof timeframe === 'string') {
        signals = signals.filter(signal => signal.timeframe === timeframe);
      }
      
      res.json(signals);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get signals' });
    }
  });

  // Get signals by ticker and timeframe specifically
  app.get('/api/signals/:ticker/:timeframe', requireAuth, async (req: any, res) => {
    try {
      const { ticker, timeframe } = req.params;
      const { limit } = req.query;
      const signals = await storage.getSignalsByTicker(ticker, limit ? parseInt(limit) : undefined);
      
      // Filter by timeframe
      const filteredSignals = signals.filter(signal => signal.timeframe === timeframe);
      
      res.json(filteredSignals);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get signals for timeframe' });
    }
  });

  app.get('/api/user/signals', requireAuth, async (req: any, res) => {
    try {
      const { limit } = req.query;
      const signals = await storage.getSignalsByUser(req.user.id, limit ? parseInt(limit) : undefined);
      res.json(signals);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get user signals' });
    }
  });

  // TradingView Webhook Endpoints
  app.post('/api/webhook/tradingview', validateWebhookSecret, async (req: any, res) => {
    try {
      const { ticker, action, price, time, timeframe, strategy, alert_id } = req.body;
      
      // Validate ticker (initially only BTCUSD supported)
      if (!SUPPORTED_TICKERS.includes(ticker)) {
        return res.status(400).json({ 
          message: `Ticker ${ticker} not supported. Supported tickers: ${SUPPORTED_TICKERS.join(', ')}` 
        });
      }
      
      // Validate timeframe
      if (!SUPPORTED_TIMEFRAMES.includes(timeframe)) {
        return res.status(400).json({ 
          message: `Timeframe ${timeframe} not supported. Supported timeframes: ${SUPPORTED_TIMEFRAMES.join(', ')}` 
        });
      }
      
      // Validate action (buy/sell)
      if (!['buy', 'sell'].includes(action)) {
        return res.status(400).json({ 
          message: 'Action must be either "buy" or "sell"' 
        });
      }
      
      // Create signal in database
      const signal = await storage.createSignal({
        ticker: ticker,
        signalType: action,
        price: price.toString(),
        timestamp: time ? new Date(time) : new Date(),
        timeframe: timeframe,
        source: 'tradingview_webhook',
        note: strategy ? `Strategy: ${strategy}` : 'TradingView Alert',
      });
      
      // Broadcast to all connected WebSocket clients
      broadcast({
        type: 'new_signal',
        signal: signal,
        source: 'tradingview'
      });
      
      // TODO: Send notifications to users (notification service not yet implemented)
      // await notificationService.sendSignalNotification(signal);
      
      console.log(`TradingView signal received: ${action.toUpperCase()} ${ticker} at ${price} (${timeframe})`);
      
      res.json({ 
        success: true, 
        signal_id: signal.id,
        message: `${action.toUpperCase()} signal processed for ${ticker} at ${price}`,
        timeframe: timeframe
      });
      
    } catch (error) {
      console.error('TradingView webhook error:', error);
      res.status(500).json({ 
        message: 'Failed to process TradingView webhook',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Get supported timeframes and tickers for TradingView setup
  app.get('/api/webhook/config', (req: any, res) => {
    res.json({
      supported_tickers: SUPPORTED_TICKERS,
      supported_timeframes: SUPPORTED_TIMEFRAMES,
      webhook_url: `${req.protocol}://${req.get('host')}/api/webhook/tradingview`,
      secret_header: 'x-webhook-secret',
      required_fields: ['ticker', 'action', 'price', 'timeframe']
    });
  });

  // Get supported timeframes for specific ticker (for trading interface)
  app.get('/api/trading/timeframes/:ticker', (req: any, res) => {
    const { ticker } = req.params;
    
    if (!SUPPORTED_TICKERS.includes(ticker)) {
      return res.json({
        ticker: ticker,
        supported: false,
        supported_timeframes: [],
        message: `${ticker} is not currently supported for TradingView alerts`
      });
    }
    
    res.json({
      ticker: ticker,
      supported: true,
      supported_timeframes: SUPPORTED_TIMEFRAMES,
      tradingview_enabled: true,
      webhook_configured: true
    });
  });

  // Manual signal injection for testing (admin only)
  app.post('/api/admin/signals/inject', requireAuth, requireAdmin, async (req: any, res) => {
    try {
      const { ticker, action, price, timeframe, strategy, note } = req.body;
      
      // Validate ticker and timeframe
      if (!SUPPORTED_TICKERS.includes(ticker)) {
        return res.status(400).json({ 
          message: `Ticker ${ticker} not supported` 
        });
      }
      
      if (!SUPPORTED_TIMEFRAMES.includes(timeframe)) {
        return res.status(400).json({ 
          message: `Timeframe ${timeframe} not supported` 
        });
      }
      
      const signal = await storage.createSignal({
        ticker: ticker,
        signalType: action,
        price: price.toString(),
        timestamp: new Date(),
        timeframe: timeframe,
        source: 'manual_admin',
        note: note || `Manual injection by admin - ${strategy || 'No strategy specified'}`,
      });
      
      // Log admin action
      await storage.createAdminLog({
        adminId: req.user.id,
        action: 'INJECT_SIGNAL',
        targetTable: 'alert_signals',
        targetId: signal.id,
        notes: `Manually injected ${action} signal for ${ticker} at ${price} (${timeframe})`,
      });
      
      // Broadcast to WebSocket clients
      broadcast({
        type: 'new_signal',
        signal: signal,
        source: 'admin'
      });
      
      res.json({ 
        success: true, 
        signal: signal,
        message: `Manual ${action} signal injected for ${ticker}`
      });
      
    } catch (error) {
      console.error('Manual signal injection error:', error);
      res.status(500).json({ message: 'Failed to inject signal' });
    }
  });

  // Test endpoint
  app.get('/api/test-alerts', async (req: any, res) => {
    try {
      res.json({ message: 'Alerts endpoint is working', status: 'ok' });
    } catch (error) {
      res.status(500).json({ message: 'Test failed' });
    }
  });

  // User Alerts API
  app.get('/api/alerts', async (req: any, res) => {
    try {
      // For now, use demo user for testing
      const demoUserId = 'b9a4c92c-33f8-445d-8e23-2a3bb701f4ab';
      const alerts = await storage.getUserAlerts(demoUserId);
      res.json(alerts);
    } catch (error) {
      console.error('Error fetching user alerts:', error);
      res.status(500).json({ message: 'Failed to get alerts' });
    }
  });

  app.post('/api/alerts', async (req: any, res) => {
    try {
      const demoUserId = 'b9a4c92c-33f8-445d-8e23-2a3bb701f4ab';
      const alertData = insertUserAlertSchema.parse({
        ...req.body,
        userId: demoUserId
      });
      
      const alert = await storage.createUserAlert(alertData);
      
      // Log the creation
      await storage.createAdminLog({
        adminId: demoUserId,
        action: "create_alert",
        targetTable: "user_alerts",
        targetId: alert.id,
        notes: `Created ${alertData.type} alert for ${alertData.ticker}`,
      });

      res.json(alert);
    } catch (error) {
      console.error('Error creating alert:', error);
      res.status(500).json({ message: 'Failed to create alert' });
    }
  });

  app.patch('/api/alerts/:id', async (req: any, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const demoUserId = 'b9a4c92c-33f8-445d-8e23-2a3bb701f4ab';
      
      const alert = await storage.updateUserAlert(id, updates);
      if (!alert) {
        return res.status(404).json({ message: 'Alert not found' });
      }

      // Log the update
      await storage.createAdminLog({
        adminId: demoUserId,
        action: "update_alert",
        targetTable: "user_alerts",
        targetId: id,
        notes: `Updated alert settings`,
      });

      res.json(alert);
    } catch (error) {
      console.error('Error updating alert:', error);
      res.status(500).json({ message: 'Failed to update alert' });
    }
  });

  app.delete('/api/alerts/:id', async (req: any, res) => {
    try {
      const { id } = req.params;
      const demoUserId = 'b9a4c92c-33f8-445d-8e23-2a3bb701f4ab';
      
      const success = await storage.deleteUserAlert(id);
      if (!success) {
        return res.status(404).json({ message: 'Alert not found' });
      }

      // Log the deletion
      await storage.createAdminLog({
        adminId: demoUserId,
        action: "delete_alert",
        targetTable: "user_alerts",
        targetId: id,
        notes: `Deleted user alert`,
      });

      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting alert:', error);
      res.status(500).json({ message: 'Failed to delete alert' });
    }
  });

  // Dashboard Layout API
  app.get('/api/dashboard/layout', async (req: any, res) => {
    try {
      const demoUserId = 'b9a4c92c-33f8-445d-8e23-2a3bb701f4ab';
      const layout = await storage.getDashboardLayout(demoUserId);
      res.json(layout);
    } catch (error) {
      console.error('Error fetching dashboard layout:', error);
      res.status(500).json({ message: 'Failed to get dashboard layout' });
    }
  });

  app.post('/api/dashboard/layout', async (req: any, res) => {
    try {
      const demoUserId = 'b9a4c92c-33f8-445d-8e23-2a3bb701f4ab';
      const layoutData = insertDashboardLayoutSchema.parse({
        ...req.body,
        userId: demoUserId
      });
      
      const layout = await storage.saveDashboardLayout(layoutData);
      res.json(layout);
    } catch (error) {
      console.error('Error saving dashboard layout:', error);
      res.status(500).json({ message: 'Failed to save dashboard layout' });
    }
  });

  app.patch('/api/dashboard/layout/:id', async (req: any, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      const layout = await storage.updateDashboardLayout(id, updates);
      if (!layout) {
        return res.status(404).json({ message: 'Layout not found' });
      }

      res.json(layout);
    } catch (error) {
      console.error('Error updating dashboard layout:', error);
      res.status(500).json({ message: 'Failed to update dashboard layout' });
    }
  });

  // Webhook for TradingView signals
  app.post('/api/webhook/signal', async (req, res) => {
    try {
      const { token, symbol, price, type, time, timeframe, note } = z.object({
        token: z.string(),
        symbol: z.string(),
        price: z.number(),
        type: z.enum(['buy', 'sell']),
        time: z.string(),
        timeframe: z.enum(['1M', '1W', '1D', '12H', '4H', '1H', '30M']),
        note: z.string().optional(),
      }).parse(req.body);

      // Validate webhook token
      const expectedToken = process.env.WEBHOOK_SECRET || 'tradingview_crypto_bot_2025';
      if (token !== expectedToken) {
        return res.status(401).json({ message: 'Invalid webhook token' });
      }

      const signal = await storage.createSignal({
        ticker: symbol,
        signalType: type,
        price: price.toString(),
        timestamp: new Date(time),
        timeframe,
        source: 'tradingview_webhook',
        note,
        userId: null, // System-generated signal
      });

      // Broadcast to all connected clients
      broadcast({
        type: 'new_signal',
        signal,
      });

      // Send notifications to all users
      await notificationService.broadcastSignalToAllUsers({
        ticker: signal.ticker,
        signalType: signal.signalType as 'buy' | 'sell',
        price: parseFloat(signal.price),
        confidence: 85, // Default confidence for webhook signals
      });

      res.json({ success: true, signal });
    } catch (error) {
      res.status(400).json({ message: 'Invalid webhook payload', error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // Manual signal injection (admin only)
  app.post('/api/admin/signals', requireAuth, requireAdmin, async (req: any, res) => {
    try {
      const signalData = insertSignalSchema.extend({
        price: z.number(),
      }).parse(req.body);

      const signal = await storage.createSignal({
        ...signalData,
        price: signalData.price.toString(),
        timestamp: new Date(),
        source: 'admin_manual',
        userId: req.user.id,
      });

      await storage.createAdminLog({
        adminId: req.user.id,
        action: 'CREATE_SIGNAL',
        targetTable: 'alert_signals',
        targetId: signal.id,
        notes: `Manual signal: ${signal.signalType} ${signal.ticker} at ${signal.price}`,
      });

      // Broadcast to all connected clients
      broadcast({
        type: 'new_signal',
        signal,
      });

      // Send notifications to all users for manual signals
      await notificationService.broadcastSignalToAllUsers({
        ticker: signal.ticker,
        signalType: signal.signalType as 'buy' | 'sell',
        price: parseFloat(signal.price),
        confidence: 90, // Higher confidence for manual admin signals
      });

      res.json(signal);
    } catch (error) {
      res.status(400).json({ message: 'Failed to create signal' });
    }
  });

  // Chart data routes
  app.get('/api/chart/ohlc/:ticker', async (req, res) => {
    try {
      const { ticker } = req.params;
      const { interval = '1h', limit = 1000 } = req.query;
      
      const data = await storage.getOhlcData(ticker, interval as string, parseInt(limit as string));
      res.json(data);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get OHLC data' });
    }
  });

  app.get('/api/chart/heatmap/:ticker', async (req, res) => {
    try {
      const { ticker } = req.params;
      const data = await storage.getHeatmapData(ticker);
      res.json(data);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get heatmap data' });
    }
  });

  app.get('/api/chart/cycle/:ticker', async (req, res) => {
    try {
      const { ticker } = req.params;
      const data = await storage.getCycleData(ticker);
      
      // If no data found, generate sample cycle data
      if (!data || data.length === 0) {
        const sampleCycleData = [];
        const now = new Date();
        
        for (let i = 30; i >= 0; i--) {
          const date = new Date(now.getTime() - (i * 24 * 60 * 60 * 1000));
          const deviation = (Math.sin(i * 0.2) + Math.random() - 0.5) * 20; // Cyclical pattern
          
          sampleCycleData.push({
            id: `sample-${ticker}-${i}`,
            ticker: ticker.replace('USDT', ''),
            date,
            createdAt: date,
            ma2y: "50000.00",
            deviation: deviation.toFixed(2),
            harmonicCycle: Math.sin(i * 0.1).toFixed(3),
            fibonacciLevel: "0.618",
            cycleMomentum: (Math.random() * 100).toFixed(2),
            volumeProfile: (Math.random() * 1000000).toFixed(0),
            seasonalityFactor: Math.cos(i * 0.15).toFixed(3),
            marketRegime: i % 4 === 0 ? "Bull" : i % 4 === 1 ? "Bear" : i % 4 === 2 ? "Volatile" : "Sideways",
            cyclePhase: ["Accumulation", "Markup", "Distribution", "Markdown"][i % 4],
            confidenceScore: (0.6 + Math.random() * 0.3).toFixed(2),
            strengthScore: (Math.random() * 100).toFixed(0)
          });
        }
        
        return res.json(sampleCycleData);
      }
      
      res.json(data);
    } catch (error) {
      console.error('Error fetching cycle data:', error);
      res.status(500).json({ message: 'Failed to get cycle data' });
    }
  });

  app.get('/api/chart/forecast/:ticker', async (req, res) => {
    try {
      const { ticker } = req.params;
      const data = await storage.getForecastData(ticker);
      
      // If no data found, generate sample forecast data
      if (!data || data.length === 0) {
        const sampleForecastData = [];
        const now = new Date();
        const basePrices: Record<string, number> = {
          'BTC': 67543.21,
          'ETH': 3421.89,
          'SOL': 98.34,
          'ADA': 0.4567,
          'BNB': 342.15,
          'XRP': 0.6234,
          'DOT': 7.89,
          'MATIC': 0.8923,
        };
        
        const basePrice = basePrices[ticker] || 100;
        
        for (let i = 1; i <= 30; i++) {
          const date = new Date(now.getTime() + (i * 24 * 60 * 60 * 1000));
          const trend = 1 + (Math.sin(i * 0.1) * 0.1); // Gentle trend
          const predicted = basePrice * trend;
          const confidence = 0.8 - (i * 0.01); // Decreasing confidence over time
          
          sampleForecastData.push({
            id: `forecast-${ticker}-${i}`,
            ticker: ticker,
            date,
            createdAt: now,
            cyclePhase: ["Accumulation", "Markup", "Distribution", "Markdown"][i % 4],
            predictedPrice: predicted.toFixed(6),
            confidenceLow: (predicted * (1 - confidence * 0.1)).toFixed(6),
            confidenceHigh: (predicted * (1 + confidence * 0.1)).toFixed(6),
            modelType: "Ensemble",
            forecastHorizon: i,
            supportLevel: (predicted * 0.95).toFixed(6),
            resistanceLevel: (predicted * 1.05).toFixed(6),
            volatilityScore: (Math.random() * 100).toFixed(0),
            trendStrength: (confidence * 100).toFixed(0),
            fibonacciTarget: (predicted * 1.618).toFixed(6)
          });
        }
        
        return res.json(sampleForecastData);
      }
      
      res.json(data);
    } catch (error) {
      console.error('Error fetching forecast data:', error);
      res.status(500).json({ message: 'Failed to get forecast data' });
    }
  });

  // Advanced cycle forecasting endpoint
  app.post('/api/forecast/advanced/:ticker', async (req, res) => {
    try {
      const { ticker } = req.params;
      const { horizon = 30 } = req.body;
      
      const result = await cycleForecastingService.generateAdvancedForecast(ticker, horizon);
      
      res.json({
        success: true,
        ticker,
        horizon,
        forecast: result.forecast,
        overallConfidence: result.confidence,
        models: result.models,
        generatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error generating advanced forecast:', error);
      res.status(500).json({ 
        success: false,
        message: 'Failed to generate advanced forecast',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Get forecast model performance metrics
  app.get('/api/forecast/models/:ticker', async (req, res) => {
    try {
      const { ticker } = req.params;
      
      // Mock model performance data (would be real metrics in production)
      const modelMetrics = [
        {
          name: "Fourier Transform",
          accuracy: 0.76,
          confidence: 0.82,
          lastCalibrated: new Date(Date.now() - 24 * 60 * 60 * 1000),
          dominantCycles: [14, 30, 90],
          strength: 0.74
        },
        {
          name: "Elliott Wave",
          accuracy: 0.71,
          confidence: 0.78,
          lastCalibrated: new Date(Date.now() - 48 * 60 * 60 * 1000),
          currentWave: 3,
          waveTargets: [52000, 65000, 78000]
        },
        {
          name: "Gann Analysis",
          accuracy: 0.68,
          confidence: 0.75,
          lastCalibrated: new Date(Date.now() - 36 * 60 * 60 * 1000),
          primaryAngles: [45, 63.75, 71.25],
          strength: 0.72
        },
        {
          name: "Harmonic Patterns",
          accuracy: 0.73,
          confidence: 0.79,
          lastCalibrated: new Date(Date.now() - 12 * 60 * 60 * 1000),
          detectedPatterns: ["Gartley", "Butterfly"],
          targets: [55000, 72000]
        },
        {
          name: "Fractal Dimension",
          accuracy: 0.69,
          confidence: 0.71,
          lastCalibrated: new Date(Date.now() - 6 * 60 * 60 * 1000),
          dimension: 1.73,
          predictability: 0.68
        },
        {
          name: "Entropy Analysis",
          accuracy: 0.72,
          confidence: 0.76,
          lastCalibrated: new Date(Date.now() - 18 * 60 * 60 * 1000),
          regime: "volatile",
          stability: 0.64
        }
      ];
      
      res.json(modelMetrics);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get model metrics' });
    }
  });

  // Admin routes
  app.get('/api/admin/users', requireAuth, requireAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      const usersWithoutPasswords = users.map(user => ({ ...user, hashedPassword: undefined }));
      res.json(usersWithoutPasswords);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get users' });
    }
  });

  app.get('/api/admin/logs', requireAuth, requireAdmin, async (req, res) => {
    try {
      const { limit } = req.query;
      const logs = await storage.getAdminLogs(limit ? parseInt(limit as string) : undefined);
      res.json(logs);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get admin logs' });
    }
  });

  // Create new user (admin only)
  app.post('/api/admin/users', requireAuth, requireAdmin, async (req: any, res) => {
    try {
      const userData = z.object({
        email: z.string().email(),
        password: z.string().min(6),
        firstName: z.string().optional(),
        lastName: z.string().optional(),
        role: z.enum(['admin', 'user']).default('user'),
      }).parse(req.body);

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: 'User with this email already exists' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 10);

      // Create user
      const user = await storage.createUser({
        email: userData.email,
        hashedPassword,
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: userData.role,
        isActive: true,
      });

      await storage.createAdminLog({
        adminId: req.user.id,
        action: 'CREATE_USER',
        targetTable: 'users',
        targetId: user.id,
        notes: `Created user: ${user.email} with role: ${user.role}`,
      });

      res.json({ ...user, hashedPassword: undefined });
    } catch (error) {
      res.status(400).json({ message: 'Failed to create user' });
    }
  });

  app.put('/api/admin/users/:id', requireAuth, requireAdmin, async (req: any, res) => {
    try {
      const { id } = req.params;
      const updates = z.object({
        isActive: z.boolean().optional(),
        role: z.enum(['admin', 'user']).optional(),
        firstName: z.string().optional(),
        lastName: z.string().optional(),
      }).parse(req.body);

      const user = await storage.updateUser(id, updates);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      await storage.createAdminLog({
        adminId: req.user.id,
        action: 'UPDATE_USER',
        targetTable: 'users',
        targetId: user.id,
        notes: `Updated user: ${user.email} - ${JSON.stringify(updates)}`,
      });

      res.json({ ...user, hashedPassword: undefined });
    } catch (error) {
      res.status(400).json({ message: 'Failed to update user' });
    }
  });

  // Delete user (admin only)
  app.delete('/api/admin/users/:id', requireAuth, requireAdmin, async (req: any, res) => {
    try {
      const { id } = req.params;
      
      // Prevent admin from deleting themselves
      if (id === req.user.id) {
        return res.status(400).json({ message: 'Cannot delete your own account' });
      }

      const user = await storage.getUser(id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Instead of hard delete, deactivate the user for safety
      const deactivatedUser = await storage.updateUser(id, { isActive: false });

      await storage.createAdminLog({
        adminId: req.user.id,
        action: 'DELETE_USER',
        targetTable: 'users',
        targetId: id,
        notes: `Deactivated user: ${user.email}`,
      });

      res.json({ success: true, message: 'User deactivated successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Failed to delete user' });
    }
  });

  // Get enabled tickers for user selection
  app.get("/api/tickers/enabled", async (req, res) => {
    try {
      const enabledTickers = await storage.getEnabledTickers();
      res.json(enabledTickers);
    } catch (error: any) {
      console.error("Error fetching enabled tickers:", error);
      res.status(500).json({ message: "Failed to get enabled tickers" });
    }
  });

  // Get market price for single ticker - enhanced with fallback
  app.get("/api/market/price/:symbol", async (req, res) => {
    try {
      const { symbol } = req.params;
      
      // Try to fetch from Binance with timeout
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000); // 5 second timeout
      
      try {
        const response = await fetch(
          `https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol}`,
          { signal: controller.signal }
        );
        clearTimeout(timeout);
        
        if (!response.ok) {
          throw new Error(`Binance API error: ${response.status}`);
        }
        
        const data = await response.json();
        
        const priceData = {
          symbol: data.symbol,
          price: parseFloat(data.lastPrice),
          change24h: parseFloat(data.priceChange),
          changePercent24h: parseFloat(data.priceChangePercent),
          volume24h: parseFloat(data.volume),
          lastUpdate: new Date().toISOString(),
        };
        
        res.json(priceData);
      } catch (fetchError) {
        clearTimeout(timeout);
        
        // Fallback to mock data when external API fails
        console.log(`External API failed for ${symbol}, using fallback data`);
        
        const mockPrices: Record<string, any> = {
          'BTCUSDT': { base: 67543.21, symbol: 'BTCUSDT' },
          'ETHUSDT': { base: 3421.89, symbol: 'ETHUSDT' },
          'SOLUSDT': { base: 98.34, symbol: 'SOLUSDT' },
          'ADAUSDT': { base: 0.4567, symbol: 'ADAUSDT' },
          'BNBUSDT': { base: 342.15, symbol: 'BNBUSDT' },
          'XRPUSDT': { base: 0.6234, symbol: 'XRPUSDT' },
          'DOTUSDT': { base: 7.89, symbol: 'DOTUSDT' },
          'MATICUSDT': { base: 0.8923, symbol: 'MATICUSDT' },
        };
        
        const mockData = mockPrices[symbol] || { base: 100, symbol };
        const change = (Math.random() - 0.5) * 10; // Random change between -5% and +5%
        const price = mockData.base * (1 + change / 100);
        
        const fallbackData = {
          symbol: mockData.symbol,
          price: price,
          change24h: change,
          changePercent24h: (change / mockData.base) * 100,
          volume24h: Math.random() * 1000000000,
          lastUpdate: new Date().toISOString(),
          isFallback: true
        };
        
        res.json(fallbackData);
      }
    } catch (error: any) {
      console.error("Error in market price endpoint:", error);
      res.status(500).json({ message: "Failed to get market price" });
    }
  });

  // Get market prices for multiple tickers
  app.get("/api/market/prices", async (req, res) => {
    try {
      const { symbols } = req.query;
      if (!symbols) {
        return res.status(400).json({ message: "Symbols parameter required" });
      }

      const symbolList = (symbols as string).split(',');
      const priceData = [];

      // Fetch data for each symbol from Binance
      for (const symbol of symbolList) {
        try {
          const response = await fetch(
            `https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol}`
          );
          
          if (response.ok) {
            const data = await response.json();
            priceData.push({
              symbol: data.symbol,
              price: parseFloat(data.lastPrice),
              change24h: parseFloat(data.priceChange),
              changePercent24h: parseFloat(data.priceChangePercent),
              volume24h: parseFloat(data.volume),
              lastUpdate: new Date().toISOString(),
            });
          }
        } catch (error) {
          console.error(`Error fetching price for ${symbol}:`, error);
        }
      }

      res.json(priceData);
    } catch (error: any) {
      console.error("Error fetching market prices:", error);
      res.status(500).json({ message: "Failed to get market prices" });
    }
  });

  app.get('/api/market/klines/:symbol', async (req, res) => {
    try {
      const { symbol } = req.params;
      const { interval = '1h', limit = 100 } = req.query;
      
      // Try to fetch from Binance with timeout
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);
      
      try {
        const response = await fetch(
          `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`,
          { signal: controller.signal }
        );
        clearTimeout(timeout);
        
        if (!response.ok) {
          throw new Error(`Binance API error: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Transform Binance format to our format
        const transformedData = data.map((kline: any[]) => ({
          time: new Date(kline[0]),
          open: parseFloat(kline[1]),
          high: parseFloat(kline[2]),
          low: parseFloat(kline[3]),
          close: parseFloat(kline[4]),
          volume: parseFloat(kline[5]),
        }));
        
        res.json(transformedData);
      } catch (fetchError) {
        clearTimeout(timeout);
        
        // Generate realistic fallback OHLC data
        console.log(`External API failed for ${symbol} klines, using fallback data`);
        
        const basePrices: Record<string, number> = {
          'BTCUSDT': 67543.21,
          'ETHUSDT': 3421.89,
          'SOLUSDT': 98.34,
          'ADAUSDT': 0.4567,
          'BNBUSDT': 342.15,
          'XRPUSDT': 0.6234,
          'DOTUSDT': 7.89,
          'MATICUSDT': 0.8923,
        };
        
        const basePrice = basePrices[symbol] || 100;
        const numPoints = Math.min(parseInt(limit as string), 100);
        const mockData = [];
        
        for (let i = numPoints - 1; i >= 0; i--) {
          const timestamp = Date.now() - (i * 60 * 60 * 1000); // 1 hour intervals
          const randomness = (Math.random() - 0.5) * 0.1; // ±5% variation
          const trendFactor = 1 + randomness;
          
          const open = basePrice * (1 + (Math.random() - 0.5) * 0.05);
          const close = open * trendFactor;
          const high = Math.max(open, close) * (1 + Math.random() * 0.02);
          const low = Math.min(open, close) * (1 - Math.random() * 0.02);
          const volume = Math.random() * 1000000;
          
          mockData.push({
            time: new Date(timestamp),
            open: parseFloat(open.toFixed(6)),
            high: parseFloat(high.toFixed(6)),
            low: parseFloat(low.toFixed(6)),
            close: parseFloat(close.toFixed(6)),
            volume: parseFloat(volume.toFixed(2)),
          });
        }
        
        res.json(mockData);
      }
    } catch (error) {
      console.error('Error in klines endpoint:', error);
      res.status(500).json({ message: 'Failed to get market data' });
    }
  });

  // Subscription Management Routes
  app.get("/api/subscription/plans", async (req, res) => {
    try {
      const plans = await storage.getSubscriptionPlans();
      res.json(plans);
    } catch (error) {
      console.error("Error fetching subscription plans:", error);
      res.status(500).json({ message: "Failed to fetch subscription plans" });
    }
  });

  app.get("/api/subscription-plans", async (req, res) => {
    try {
      const plans = await storage.getSubscriptionPlans();
      res.json(plans);
    } catch (error) {
      console.error("Error fetching subscription plans:", error);
      res.status(500).json({ message: "Failed to fetch subscription plans" });
    }
  });

  // Get current user subscription
  app.get("/api/subscription/current", requireAuth, async (req: any, res) => {
    try {
      
      const user = await storage.getUser(req.user.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const plan = await storage.getSubscriptionPlan(user.subscriptionTier || 'free');
      
      res.json({
        currentPlan: plan,
        subscriptionStatus: user.subscriptionStatus,
        stripeSubscriptionId: user.stripeSubscriptionId
      });
    } catch (error) {
      console.error("Error fetching current subscription:", error);
      res.status(500).json({ message: "Failed to fetch subscription" });
    }
  });

  // Upgrade subscription
  app.post("/api/subscription/upgrade", requireAuth, async (req: any, res) => {
    try {
      
      const { tier } = req.body;
      if (!tier || !['free', 'basic', 'premium', 'pro'].includes(tier)) {
        return res.status(400).json({ message: "Invalid subscription tier" });
      }
      
      const user = await storage.updateUser(req.user.id, {
        subscriptionTier: tier,
        subscriptionStatus: tier === 'free' ? undefined : 'active'
      });
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Log the upgrade
      await storage.createAdminLog({
        adminId: req.user.id,
        action: 'SUBSCRIPTION_UPGRADE',
        targetTable: 'users',
        targetId: user.id,
        notes: `User upgraded to ${tier} plan`
      });
      
      res.json({ 
        success: true, 
        message: `Successfully upgraded to ${tier} plan`,
        subscriptionTier: user.subscriptionTier,
        subscriptionStatus: user.subscriptionStatus
      });
    } catch (error) {
      console.error("Error upgrading subscription:", error);
      res.status(500).json({ message: "Failed to upgrade subscription" });
    }
  });

  // Get subscription usage
  app.get("/api/subscription/usage", requireAuth, async (req: any, res) => {
    try {
      
      const user = await storage.getUser(req.user.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const plan = await storage.getSubscriptionPlan(user.subscriptionTier || 'free');
      const userSignals = await storage.getSignalsByUser(user.id, 1000);
      
      // Calculate usage for current month
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const monthlySignals = userSignals.filter(signal => 
        new Date(signal.timestamp) >= monthStart
      );
      
      const maxSignals = plan?.maxSignals || 10;
      const signalsUsed = monthlySignals.length;
      const signalsRemaining = maxSignals === -1 ? 'Unlimited' : Math.max(0, maxSignals - signalsUsed);
      const usagePercentage = maxSignals === -1 ? 0 : Math.min(100, (signalsUsed / maxSignals) * 100);
      
      // Create daily trend data for the past 7 days
      const dailyTrend = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        const dayEnd = new Date(dayStart);
        dayEnd.setDate(dayEnd.getDate() + 1);
        
        const daySignals = userSignals.filter(signal => {
          const signalDate = new Date(signal.timestamp);
          return signalDate >= dayStart && signalDate < dayEnd;
        });
        
        dailyTrend.push({
          date: date.toISOString().split('T')[0],
          signals: daySignals.length
        });
      }
      
      const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      
      res.json({
        currentPlan: {
          name: plan?.name || 'Free',
          tier: plan?.tier || 'free',
          monthlyPrice: plan?.monthlyPrice || 0,
          features: plan?.features || [],
          maxSignals: plan?.maxSignals || 10,
          maxTickers: plan?.maxTickers || 3
        },
        usage: {
          signalsUsed,
          signalsLimit: maxSignals,
          signalsRemaining,
          usagePercentage,
          resetDate: nextMonth.toISOString(),
          renewalDate: nextMonth.toISOString(),
          dailyTrend
        },
        analytics: {
          totalSignalsReceived: userSignals.length,
          averageSignalsPerDay: userSignals.length / 30,
          mostActiveDay: dailyTrend.reduce((max, day) => 
            day.signals > max.signals ? day : max, 
            { date: '', signals: 0 }
          )
        }
      });
    } catch (error) {
      console.error("Error fetching subscription usage:", error);
      res.status(500).json({ message: "Failed to fetch usage data" });
    }
  });

  // Apply Promotional Code
  app.post("/api/apply-promo-code", async (req, res) => {
    try {
      const { promoCode, planTier } = req.body;
      
      // Mock promo codes - in production, these would be stored in database
      const promoCodes = {
        "WELCOME20": { discount: 0.2, type: "percentage", validTiers: ["basic", "premium", "pro"] },
        "CRYPTO50": { discount: 0.5, type: "percentage", validTiers: ["premium", "pro"] },
        "FIRST30": { discount: 30, type: "fixed", validTiers: ["basic"] },
      };
      
      const promo = promoCodes[promoCode as keyof typeof promoCodes];
      
      if (!promo) {
        return res.status(404).json({ message: "Invalid promotional code" });
      }
      
      if (!promo.validTiers.includes(planTier)) {
        return res.status(400).json({ message: "Promotional code not valid for this plan" });
      }
      
      const plan = await storage.getSubscriptionPlan(planTier);
      if (!plan) {
        return res.status(404).json({ message: "Plan not found" });
      }
      
      let discountedPrice = plan.monthlyPrice;
      if (promo.type === "percentage") {
        discountedPrice = Math.round(plan.monthlyPrice * (1 - promo.discount));
      } else {
        discountedPrice = Math.max(0, plan.monthlyPrice - (promo.discount * 100));
      }
      
      res.json({
        originalPrice: plan.monthlyPrice,
        discountedPrice,
        discount: promo.discount,
        discountType: promo.type,
        savings: plan.monthlyPrice - discountedPrice,
      });
    } catch (error: any) {
      console.error("Error applying promo code:", error);
      res.status(500).json({ message: "Failed to apply promotional code" });
    }
  });

  // Create Stripe Checkout Session for Subscription
  app.post("/api/create-subscription", async (req, res) => {
    try {
      const { planTier, billingInterval = "monthly", promoCode } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      // Get the subscription plan
      const plan = await storage.getSubscriptionPlan(planTier);
      if (!plan) {
        return res.status(404).json({ message: "Subscription plan not found" });
      }

      // Handle free plan
      if (plan.monthlyPrice === 0) {
        await storage.updateUserSubscription(userId, {
          subscriptionTier: "free",
          subscriptionStatus: "active",
        });
        return res.json({ success: true });
      }

      // Get or create Stripe customer
      const user = await storage.getUser(userId);
      let customerId = user?.stripeCustomerId;

      if (!customerId) {
        const customer = await stripe.customers.create({
          email: user?.email,
          metadata: { userId },
        });
        customerId = customer.id;

        await storage.updateUserSubscription(userId, {
          stripeCustomerId: customerId,
        });
      }

      // Determine price based on billing interval
      const priceAmount = billingInterval === "yearly" && plan.yearlyPrice ? plan.yearlyPrice : plan.monthlyPrice;

      // Create Stripe Checkout session
      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        mode: "subscription",
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: plan.name,
                description: `${plan.tier} subscription plan`,
              },
              unit_amount: priceAmount,
              recurring: {
                interval: billingInterval === "yearly" ? "year" : "month",
              },
            },
            quantity: 1,
          },
        ],
        success_url: `${req.protocol}://${req.get("host")}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${req.protocol}://${req.get("host")}/pricing`,
        metadata: {
          userId,
          planTier,
          billingInterval,
        },
      });

      res.json({
        checkoutUrl: session.url,
        sessionId: session.id,
      });
    } catch (error: any) {
      console.error("Error creating subscription:", error);
      res.status(500).json({ message: error.message || "Failed to create subscription" });
    }
  });

  // Stripe Webhook Handler
  app.post("/api/stripe-webhook", async (req, res) => {
    const sig = req.headers["stripe-signature"];
    let event;

    try {
      // In production, you'd need to set STRIPE_WEBHOOK_SECRET
      event = stripe.webhooks.constructEvent(req.body, sig as string, process.env.STRIPE_WEBHOOK_SECRET || "");
    } catch (err: any) {
      console.error("Webhook signature verification failed:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
      case "checkout.session.completed":
        const session = event.data.object as any;
        const { userId, planTier } = session.metadata;

        if (userId && planTier) {
          await storage.updateUserSubscription(userId, {
            subscriptionTier: planTier,
            subscriptionStatus: "active",
            stripeSubscriptionId: session.subscription,
          });
        }
        break;

      case "invoice.payment_succeeded":
        // Handle successful payment
        break;

      case "invoice.payment_failed":
        // Handle failed payment
        const failedInvoice = event.data.object as any;
        const failedUserId = failedInvoice.customer_email; // You'd need to map this to userId
        // Update user subscription status to past_due
        break;

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
  });

  // Customer Portal (for managing subscriptions)
  app.post("/api/customer-portal", async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const user = await storage.getUser(userId);
      if (!user?.stripeCustomerId) {
        return res.status(400).json({ message: "No subscription found" });
      }

      const session = await stripe.billingPortal.sessions.create({
        customer: user.stripeCustomerId,
        return_url: `${req.protocol}://${req.get("host")}/settings`,
      });

      res.json({ url: session.url });
    } catch (error: any) {
      console.error("Error creating customer portal session:", error);
      res.status(500).json({ message: error.message || "Failed to create portal session" });
    }
  });

  // Admin Analytics Endpoints
  app.get("/api/admin/analytics", async (req, res) => {
    try {
      const { period = '7d', metric = 'all' } = req.query;
      
      // Get analytics data based on period
      const endDate = new Date();
      const startDate = new Date();
      
      switch (period) {
        case '1d':
          startDate.setDate(endDate.getDate() - 1);
          break;
        case '7d':
          startDate.setDate(endDate.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(endDate.getDate() - 30);
          break;
        case '90d':
          startDate.setDate(endDate.getDate() - 90);
          break;
        case '1y':
          startDate.setFullYear(endDate.getFullYear() - 1);
          break;
        default:
          startDate.setDate(endDate.getDate() - 7);
      }

      const users = await storage.getAllUsers();
      const signals = await storage.getSignals(1000);
      
      // Calculate comprehensive analytics
      const paidUsers = users.filter(u => u.subscriptionTier !== "free");
      const tierPrices = { basic: 2900, premium: 7900, pro: 19900 };
      const totalRevenue = paidUsers.reduce((sum, user) => {
        return sum + (tierPrices[user.subscriptionTier as keyof typeof tierPrices] || 0);
      }, 0);

      const analyticsData = {
        overview: {
          totalUsers: users.length,
          activeUsers: users.filter(u => u.lastLoginAt && new Date(u.lastLoginAt) >= startDate).length,
          totalRevenue: totalRevenue / 100, // Convert to dollars
          monthlyRevenue: totalRevenue / 100,
          totalTrades: 156789, // Mock data - could be from trades table
          signalAccuracy: signals.length > 0 ? 78.4 : 0,
          userGrowth: 12.5,
          revenueGrowth: 8.3,
          tradesGrowth: 23.7,
          accuracyChange: 2.1
        },
        timeRange: {
          start: startDate.toISOString(),
          end: endDate.toISOString(),
          period: period
        }
      };

      res.json(analyticsData);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      res.status(500).json({ message: 'Failed to fetch analytics data' });
    }
  });

  app.get("/api/admin/analytics/revenue", async (req, res) => {
    try {
      const { period = '7d' } = req.query;
      
      const users = await storage.getAllUsers();
      const paidUsers = users.filter(u => u.subscriptionTier !== "free");
      const tierPrices = { basic: 2900, premium: 7900, pro: 19900 };
      
      const totalRevenue = paidUsers.reduce((sum, user) => {
        return sum + (tierPrices[user.subscriptionTier as keyof typeof tierPrices] || 0);
      }, 0) / 100;

      const revenueData = {
        total: totalRevenue,
        monthly: totalRevenue,
        growth: 8.3,
        sources: [
          { name: 'Basic Subscriptions', amount: paidUsers.filter(u => u.subscriptionTier === 'basic').length * 29, percentage: 75.3 },
          { name: 'Premium Subscriptions', amount: paidUsers.filter(u => u.subscriptionTier === 'premium').length * 79, percentage: 19.4 },
          { name: 'Pro Subscriptions', amount: paidUsers.filter(u => u.subscriptionTier === 'pro').length * 199, percentage: 5.3 }
        ],
        trends: Array.from({ length: 7 }, (_, i) => ({
          date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          amount: Math.floor(totalRevenue * (0.8 + Math.random() * 0.4))
        }))
      };

      res.json(revenueData);
    } catch (error) {
      console.error('Error fetching revenue analytics:', error);
      res.status(500).json({ message: 'Failed to fetch revenue analytics' });
    }
  });

  app.get("/api/admin/analytics/trading", async (req, res) => {
    try {
      const { period = '7d' } = req.query;
      
      // Mock trading analytics - would come from actual trades table
      const tradingAnalytics = {
        totalTrades: 156789,
        volume: 2458792.34,
        avgTradeSize: 15.67,
        growth: 23.7,
        topPairs: [
          { symbol: 'BTCUSDT', trades: 45234, volume: 892345.67 },
          { symbol: 'ETHUSDT', trades: 32187, volume: 634521.89 },
          { symbol: 'SOLUSDT', trades: 18945, volume: 298456.12 },
          { symbol: 'ADAUSDT', trades: 12743, volume: 145678.34 }
        ],
        hourlyDistribution: Array.from({ length: 24 }, (_, i) => ({
          hour: String(i).padStart(2, '0') + ':00',
          trades: Math.floor(1000 + Math.random() * 3000)
        }))
      };

      res.json(tradingAnalytics);
    } catch (error) {
      console.error('Error fetching trading analytics:', error);
      res.status(500).json({ message: 'Failed to fetch trading analytics' });
    }
  });

  app.get("/api/admin/analytics/signals", async (req, res) => {
    try {
      const { period = '7d' } = req.query;
      
      const signals = await storage.getSignals(1000);
      const successfulSignals = signals.filter(s => s.signalType === 'buy' || s.signalType === 'sell').length;
      const accuracy = signals.length > 0 ? (successfulSignals / signals.length) * 100 : 0;

      const signalAnalytics = {
        totalSignals: signals.length,
        successfulSignals: Math.floor(signals.length * 0.784),
        failedSignals: Math.floor(signals.length * 0.216),
        accuracy: Math.round(accuracy * 10) / 10,
        improvement: 2.1,
        performance: {
          buy: { total: Math.floor(signals.length / 2), successful: Math.floor(signals.length * 0.4), accuracy: 81.2 },
          sell: { total: Math.floor(signals.length / 2), successful: Math.floor(signals.length * 0.38), accuracy: 75.7 }
        },
        byTicker: [
          { symbol: 'BTCUSDT', signals: Math.floor(signals.length * 0.3), accuracy: 82.3 },
          { symbol: 'ETHUSDT', signals: Math.floor(signals.length * 0.25), accuracy: 79.1 },
          { symbol: 'SOLUSDT', signals: Math.floor(signals.length * 0.2), accuracy: 75.8 },
          { symbol: 'ADAUSDT', signals: Math.floor(signals.length * 0.15), accuracy: 73.5 }
        ],
        trends: Array.from({ length: 7 }, (_, i) => ({
          date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          accuracy: 76 + Math.random() * 6
        }))
      };

      res.json(signalAnalytics);
    } catch (error) {
      console.error('Error fetching signal analytics:', error);
      res.status(500).json({ message: 'Failed to fetch signal analytics' });
    }
  });

  app.get("/api/admin/analytics/metrics", async (req, res) => {
    try {
      const timeRange = req.query.timeRange as string || "7d";
      
      const users = await storage.getAllUsers();
      const signals = await storage.getSignals(1000);
      
      // Calculate metrics based on time range
      const now = new Date();
      const daysBack = timeRange === "24h" ? 1 : timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90;
      const startDate = new Date(now.getTime() - (daysBack * 24 * 60 * 60 * 1000));
      
      const recentUsers = users.filter(u => new Date(u.createdAt) >= startDate);
      const activeUsers = users.filter(u => u.lastLoginAt && new Date(u.lastLoginAt) >= startDate);
      const recentSignals = signals.filter(s => new Date(s.createdAt) >= startDate);
      
      // Calculate revenue from subscription tiers
      const paidUsers = users.filter(u => u.subscriptionTier !== "free");
      const totalRevenue = paidUsers.reduce((sum, user) => {
        const tierPrices = { basic: 2900, premium: 7900, pro: 19900 };
        return sum + (tierPrices[user.subscriptionTier as keyof typeof tierPrices] || 0);
      }, 0);
      
      const monthlyRevenue = totalRevenue; // Simplified for demo
      
      const metrics = {
        totalUsers: users.length,
        activeUsers: activeUsers.length,
        totalRevenue,
        monthlyRevenue,
        totalSignals: signals.length,
        dailySignals: Math.floor(recentSignals.length / daysBack),
        conversionRate: users.length > 0 ? paidUsers.length / users.length : 0,
        churnRate: 0.05, // 5% churn rate
      };
      
      res.json(metrics);
    } catch (error) {
      console.error("Error fetching analytics metrics:", error);
      res.status(500).json({ message: "Failed to fetch analytics metrics" });
    }
  });

  app.get("/api/admin/analytics/users", async (req, res) => {
    try {
      const timeRange = req.query.timeRange as string || "7d";
      const users = await storage.getAllUsers();
      
      // Group users by tier
      const usersByTier = users.reduce((acc, user) => {
        const tier = user.subscriptionTier || "free";
        acc[tier] = (acc[tier] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      const totalUsers = users.length;
      const tierData = Object.entries(usersByTier).map(([tier, count]) => ({
        tier,
        count,
        percentage: (count / totalUsers) * 100,
      }));
      
      // Mock time series data for demo
      const generateTimeSeries = (days: number, baseValue: number) => {
        return Array.from({ length: days }, (_, i) => ({
          date: new Date(Date.now() - (days - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          count: Math.floor(baseValue + Math.random() * 10),
        }));
      };
      
      const analytics = {
        newUsers: generateTimeSeries(7, 5),
        activeUsers: generateTimeSeries(7, 15),
        usersByTier: tierData,
        retentionRate: [
          { period: "1 Day", rate: 85 },
          { period: "7 Days", rate: 65 },
          { period: "30 Days", rate: 45 },
          { period: "90 Days", rate: 25 },
        ],
      };
      
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching user analytics:", error);
      res.status(500).json({ message: "Failed to fetch user analytics" });
    }
  });

  app.get("/api/admin/analytics/revenue", async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      const paidUsers = users.filter(u => u.subscriptionTier !== "free");
      
      // Calculate revenue by tier
      const revenueByTier = paidUsers.reduce((acc, user) => {
        const tier = user.subscriptionTier;
        const tierPrices = { basic: 2900, premium: 7900, pro: 19900 };
        const revenue = tierPrices[tier as keyof typeof tierPrices] || 0;
        
        if (!acc[tier]) acc[tier] = 0;
        acc[tier] += revenue;
        return acc;
      }, {} as Record<string, number>);
      
      const totalRevenue = Object.values(revenueByTier).reduce((sum, rev) => sum + rev, 0);
      
      const tierData = Object.entries(revenueByTier).map(([tier, revenue]) => ({
        tier,
        revenue,
        percentage: (revenue / totalRevenue) * 100,
      }));
      
      // Mock monthly revenue data
      const monthlyRevenue = Array.from({ length: 12 }, (_, i) => {
        const month = new Date(2024, i).toLocaleString('default', { month: 'short' });
        return {
          month,
          revenue: Math.floor(totalRevenue * (0.7 + Math.random() * 0.6)),
          subscriptions: Math.floor(paidUsers.length * (0.8 + Math.random() * 0.4)),
        };
      });
      
      const analytics = {
        monthlyRevenue,
        revenueByTier: tierData,
        mrr: totalRevenue, // Monthly Recurring Revenue
        arr: totalRevenue * 12, // Annual Recurring Revenue
        ltv: totalRevenue / paidUsers.length * 24, // Lifetime Value (24 months avg)
      };
      
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching revenue analytics:", error);
      res.status(500).json({ message: "Failed to fetch revenue analytics" });
    }
  });

  app.get("/api/admin/analytics/signals", async (req, res) => {
    try {
      const signals = await storage.getSignals(1000);
      const tickers = await storage.getAllTickers();
      
      // Group signals by ticker
      const signalsByTicker = signals.reduce((acc, signal) => {
        const ticker = signal.ticker;
        if (!acc[ticker]) {
          acc[ticker] = { count: 0, accuracySum: 0 };
        }
        acc[ticker].count += 1;
        acc[ticker].accuracySum += Math.random() * 0.3 + 0.7; // Mock accuracy 70-100%
        return acc;
      }, {} as Record<string, { count: number; accuracySum: number }>);
      
      const tickerData = Object.entries(signalsByTicker)
        .map(([ticker, data]) => ({
          ticker,
          count: data.count,
          accuracy: data.accuracySum / data.count,
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);
      
      // Mock popular tickers data
      const popularTickers = tickers.slice(0, 10).map(ticker => ({
        ticker: ticker.symbol,
        subscriptions: Math.floor(Math.random() * 100) + 20,
      }));
      
      // Mock time series data
      const signalsPerDay = Array.from({ length: 7 }, (_, i) => ({
        date: new Date(Date.now() - (7 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        count: Math.floor(Math.random() * 50) + 30,
        accuracy: Math.random() * 0.2 + 0.8,
      }));
      
      const signalAccuracy = Array.from({ length: 30 }, (_, i) => ({
        date: new Date(Date.now() - (30 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        accuracy: Math.random() * 0.15 + 0.85,
      }));
      
      const analytics = {
        signalsPerDay,
        signalsByTicker: tickerData,
        signalAccuracy,
        popularTickers,
      };
      
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching signal analytics:", error);
      res.status(500).json({ message: "Failed to fetch signal analytics" });
    }
  });

  app.get("/api/admin/analytics/system", async (req, res) => {
    try {
      // Mock system metrics - in production these would come from monitoring services
      const metrics = {
        cpuUsage: Math.floor(Math.random() * 40) + 20, // 20-60%
        memoryUsage: Math.floor(Math.random() * 30) + 40, // 40-70%
        activeConnections: Math.floor(Math.random() * 100) + 50,
        responseTime: Math.floor(Math.random() * 100) + 150, // 150-250ms
        errorRate: Math.random() * 0.02, // 0-2%
        uptime: "99.9%",
      };
      
      res.json(metrics);
    } catch (error) {
      console.error("Error fetching system metrics:", error);
      res.status(500).json({ message: "Failed to fetch system metrics" });
    }
  });

  // Admin Reports Endpoints
  app.get("/api/admin/reports", requireAuth, requireAdmin, async (req: any, res) => {
    try {
      // Mock report data - in production this would come from a reports table
      const mockReports = [
        {
          id: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
          name: "User Activity Report - December 2024",
          type: "user_activity",
          generatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          downloadUrl: "/api/admin/reports/f47ac10b-58cc-4372-a567-0e02b2c3d479/download",
          status: "ready",
          fileSize: "2.3 MB",
        },
        {
          id: "550e8400-e29b-41d4-a716-446655440000", 
          name: "Signal Effectiveness - November 2024",
          type: "signal_effectiveness",
          generatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          downloadUrl: "/api/admin/reports/550e8400-e29b-41d4-a716-446655440000/download",
          status: "ready",
          fileSize: "1.8 MB",
        },
        {
          id: "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
          name: "Revenue Analytics - Q4 2024", 
          type: "revenue_analytics",
          generatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          downloadUrl: "/api/admin/reports/6ba7b810-9dad-11d1-80b4-00c04fd430c8/download",
          status: "expired",
          fileSize: "3.1 MB",
        },
      ];

      res.json(mockReports);
    } catch (error) {
      console.error("Error fetching reports:", error);
      res.status(500).json({ message: "Failed to fetch reports" });
    }
  });

  app.post("/api/admin/reports/generate", requireAuth, requireAdmin, async (req: any, res) => {
    try {
      const reportConfig = z.object({
        type: z.enum(["user_activity", "signal_effectiveness", "subscription_trends", "revenue_analytics"]),
        dateRange: z.object({
          start: z.string(),
          end: z.string(),
        }),
        format: z.enum(["xlsx", "csv", "pdf"]).default("xlsx"),
      }).parse(req.body);

      // Mock report generation - in production this would trigger background job
      const reportId = crypto.randomUUID();
      const reportName = `${reportConfig.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} - ${new Date().toLocaleDateString()}`;
      
      // Create admin log
      await storage.createAdminLog({
        adminId: req.user.id,
        action: 'GENERATE_REPORT',
        targetTable: 'reports',
        targetId: reportId,
        notes: `Generated ${reportConfig.type} report for period ${reportConfig.dateRange.start} to ${reportConfig.dateRange.end}`,
      });

      const newReport = {
        id: reportId,
        name: reportName,
        type: reportConfig.type,
        generatedAt: new Date().toISOString(),
        downloadUrl: `/api/admin/reports/${reportId}/download`,
        status: "ready",
        fileSize: "1.5 MB",
      };

      res.json(newReport);
    } catch (error) {
      console.error("Error generating report:", error);
      res.status(500).json({ message: "Failed to generate report" });
    }
  });

  app.get("/api/admin/reports/:reportId/download", requireAuth, requireAdmin, async (req: any, res) => {
    try {
      const { reportId } = req.params;
      
      // Mock Excel file generation - in production this would create actual Excel/CSV files
      const mockExcelContent = Buffer.from("Report ID: " + reportId + "\nGenerated: " + new Date().toISOString() + "\n\nSample Report Data\n");
      
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=report-${reportId}.xlsx`);
      res.send(mockExcelContent);
    } catch (error) {
      console.error("Error downloading report:", error);
      res.status(500).json({ message: "Failed to download report" });
    }
  });

  // Advanced Forecasting API Endpoints
  app.get("/api/forecast/models/:ticker", async (req, res) => {
    try {
      const { ticker } = req.params;
      
      // Return model performance metrics
      const modelMetrics = [
        {
          name: "Fourier Transform",
          accuracy: 0.82,
          confidence: 0.75,
          lastCalibrated: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          dominantCycles: [21, 42, 84],
          regime: "bull"
        },
        {
          name: "Elliott Wave",
          accuracy: 0.78,
          confidence: 0.68,
          lastCalibrated: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          currentWave: "3",
          patterns: ["Impulse", "Wave 3 Extension"]
        },
        {
          name: "Gann Analysis",
          accuracy: 0.71,
          confidence: 0.64,
          lastCalibrated: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          supportLevels: [45000, 42500, 40000],
          resistanceLevels: [52000, 55000, 58000]
        },
        {
          name: "Harmonic Patterns",
          accuracy: 0.76,
          confidence: 0.72,
          lastCalibrated: new Date().toISOString(),
          detectedPatterns: ["Gartley", "Butterfly"],
          completion: 0.85
        },
        {
          name: "Fractal Dimension",
          accuracy: 0.69,
          confidence: 0.61,
          lastCalibrated: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
          dimension: 1.47,
          complexity: "High"
        },
        {
          name: "Entropy Analysis",
          accuracy: 0.73,
          confidence: 0.67,
          lastCalibrated: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          entropy: 0.85,
          predictability: "Medium"
        }
      ];

      res.json(modelMetrics);
    } catch (error) {
      console.error("Error fetching model metrics:", error);
      res.status(500).json({ message: "Failed to fetch model metrics" });
    }
  });

  app.post("/api/forecast/advanced/:ticker", async (req, res) => {
    try {
      const { ticker } = req.params;
      const { horizon = 30 } = req.body;
      
      console.log(`Generating advanced forecast for ${ticker} with ${horizon} day horizon`);
      
      // Generate the advanced forecast using the service
      const forecastResult = await cycleForecastingService.generateAdvancedForecast(ticker, horizon);
      
      res.json({
        forecast: forecastResult.forecast,
        overallConfidence: forecastResult.confidence,
        models: forecastResult.models,
        generatedAt: new Date().toISOString(),
        horizon
      });
    } catch (error) {
      console.error("Error generating advanced forecast:", error);
      res.status(500).json({ message: "Failed to generate forecast" });
    }
  });

  app.get("/api/forecast/data/:ticker", async (req, res) => {
    try {
      const { ticker } = req.params;
      const forecastData = await storage.getForecastData(ticker);
      res.json(forecastData);
    } catch (error) {
      console.error("Error fetching forecast data:", error);
      res.status(500).json({ message: "Failed to fetch forecast data" });
    }
  });

  app.get("/api/cycle/data/:ticker", async (req, res) => {
    try {
      const { ticker } = req.params;
      const cycleData = await storage.getCycleData(ticker);
      res.json(cycleData);
    } catch (error) {
      console.error("Error fetching cycle data:", error);
      res.status(500).json({ message: "Failed to fetch cycle data" });
    }
  });

  // Trading API endpoints
  app.get('/api/trading/portfolio', requireAuth, async (req: any, res) => {
    try {
      const portfolio = await storage.getUserPortfolio(req.user.id);
      res.json(portfolio);
    } catch (error) {
      console.error("Error fetching portfolio:", error);
      res.status(500).json({ message: 'Failed to fetch portfolio' });
    }
  });

  app.get('/api/trading/trades', requireAuth, async (req: any, res) => {
    try {
      const { limit } = req.query;
      const trades = await storage.getUserTrades(req.user.id, limit ? parseInt(limit) : undefined);
      res.json(trades);
    } catch (error) {
      console.error("Error fetching trades:", error);
      res.status(500).json({ message: 'Failed to fetch trades' });
    }
  });

  app.post('/api/trading/trade', requireAuth, async (req: any, res) => {
    try {
      const tradeData = {
        userId: req.user.id,
        ticker: req.body.ticker,
        type: req.body.type,
        amount: req.body.amount,
        price: req.body.price,
        mode: req.body.mode || 'paper',
        status: 'EXECUTED',
        signalId: req.body.signalId || null,
      };

      const trade = await storage.createTrade(tradeData);

      // Update portfolio based on the trade
      const portfolio = await storage.getUserPortfolio(req.user.id);
      const existingPosition = portfolio.find(p => p.ticker === req.body.ticker);

      const tradeAmount = parseFloat(req.body.amount);
      const tradePrice = parseFloat(req.body.price);
      const tradeValue = tradeAmount * tradePrice;

      if (req.body.type === 'BUY') {
        if (existingPosition) {
          const currentQuantity = parseFloat(existingPosition.quantity);
          const currentValue = parseFloat(existingPosition.currentValue);
          const newQuantity = currentQuantity + tradeAmount;
          const newAveragePrice = (currentValue + tradeValue) / newQuantity;

          await storage.updatePortfolio(req.user.id, req.body.ticker, {
            quantity: newQuantity.toString(),
            averagePrice: newAveragePrice.toString(),
            currentValue: (newQuantity * tradePrice).toString(),
          });
        } else {
          await storage.updatePortfolio(req.user.id, req.body.ticker, {
            quantity: tradeAmount.toString(),
            averagePrice: tradePrice.toString(),
            currentValue: tradeValue.toString(),
          });
        }
      } else if (req.body.type === 'SELL') {
        if (existingPosition) {
          const currentQuantity = parseFloat(existingPosition.quantity);
          const newQuantity = Math.max(0, currentQuantity - tradeAmount);
          
          await storage.updatePortfolio(req.user.id, req.body.ticker, {
            quantity: newQuantity.toString(),
            currentValue: (newQuantity * tradePrice).toString(),
          });
        }
      }

      // Broadcast trade to WebSocket clients
      broadcast({
        type: 'trade_executed',
        data: trade
      });

      res.json(trade);
    } catch (error) {
      console.error("Error executing trade:", error);
      res.status(500).json({ message: 'Failed to execute trade' });
    }
  });

  app.get('/api/trading/settings', requireAuth, async (req: any, res) => {
    try {
      const settings = await storage.getTradingSettings(req.user.id);
      if (!settings) {
        // Return default settings if none exist
        const defaultSettings = {
          riskLevel: 'moderate',
          maxTradeAmount: '1000',
          autoTrading: false,
          stopLoss: '5',
          takeProfit: '10',
        };
        res.json(defaultSettings);
      } else {
        res.json(settings);
      }
    } catch (error) {
      console.error("Error fetching trading settings:", error);
      res.status(500).json({ message: 'Failed to fetch trading settings' });
    }
  });

  app.put('/api/trading/settings', requireAuth, async (req: any, res) => {
    try {
      const settings = await storage.updateTradingSettings(req.user.id, req.body);
      res.json(settings);
    } catch (error) {
      console.error("Error updating trading settings:", error);
      res.status(500).json({ message: 'Failed to update trading settings' });
    }
  });

  // Notification Dashboard API routes
  app.get('/api/notifications/stats', requireAuth, async (req: any, res) => {
    try {
      const range = req.query.range || '24h';
      const stats = await notificationService.getNotificationStats(range);
      res.json(stats);
    } catch (error: any) {
      console.error('Error fetching notification stats:', error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/notifications/logs', requireAuth, async (req: any, res) => {
    try {
      const channel = req.query.channel || 'all';
      const limit = parseInt(req.query.limit) || 100;
      const logs = notificationService.getNotificationLogs(channel, limit);
      res.json(logs);
    } catch (error: any) {
      console.error('Error fetching notification logs:', error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/notifications/health', requireAuth, async (req: any, res) => {
    try {
      const health = notificationService.getChannelHealth();
      res.json(health);
    } catch (error: any) {
      console.error('Error fetching channel health:', error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/notifications/:id/retry', requireAuth, async (req: any, res) => {
    try {
      const { id } = req.params;
      const success = await notificationService.retryNotification(id);
      res.json({ success });
    } catch (error: any) {
      console.error('Error retrying notification:', error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/notifications/test/:channel', requireAuth, async (req: any, res) => {
    try {
      const { channel } = req.params;
      const success = await notificationService.testChannel(channel);
      res.json({ success });
    } catch (error: any) {
      console.error('Error testing notification channel:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // SMS Configuration and Testing
  app.post('/api/notifications/sms/verify', async (req: any, res) => {
    try {
      const { phoneNumber } = req.body;
      
      if (!phoneNumber || !phoneNumber.startsWith('+')) {
        return res.status(400).json({ 
          error: 'Phone number must include country code (e.g., +1234567890)' 
        });
      }

      // Demo mode for testing without real credentials
      if (!smsService.isConfigured()) {
        // Simulate successful verification in demo mode
        const demoCode = Math.floor(100000 + Math.random() * 900000).toString();
        res.json({ 
          success: true, 
          message: 'Demo verification code generated (SMS service not configured)',
          code: demoCode,
          demo: true
        });
        return;
      }

      const result = await smsService.sendVerificationCode(phoneNumber);
      
      if (result.success) {
        // Store verification code temporarily (in production, use Redis or database)
        // For demo, we'll return the code directly
        res.json({ 
          success: true, 
          message: 'Verification code sent',
          code: result.code // Remove this in production
        });
      } else {
        res.status(400).json({ error: result.error });
      }
    } catch (error: any) {
      console.error('Error sending SMS verification:', error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/notifications/sms/status', async (req: any, res) => {
    try {
      res.json({
        configured: smsService.isConfigured(),
        configStatus: smsService.getConfigStatus(),
        provider: 'Twilio'
      });
    } catch (error: any) {
      console.error('Error getting SMS status:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Telegram Configuration and Testing
  app.post('/api/notifications/telegram/validate', async (req: any, res) => {
    try {
      const { chatId } = req.body;
      
      if (!chatId) {
        return res.status(400).json({ error: 'Chat ID is required' });
      }

      // Demo mode for testing without real credentials
      if (!telegramService.isConfigured()) {
        // Simulate successful validation in demo mode
        if (chatId.match(/^\d+$/)) {
          res.json({ 
            success: true, 
            message: 'Demo validation successful (Telegram service not configured)',
            chatId: chatId,
            demo: true
          });
        } else {
          res.status(400).json({ 
            error: 'Invalid chat ID format. Must be numeric (e.g., 123456789)' 
          });
        }
        return;
      }

      const result = await telegramService.validateChatId(chatId);
      
      if (result.valid) {
        res.json({ 
          success: true, 
          message: 'Chat ID is valid',
          chatId: chatId
        });
      } else {
        res.status(400).json({ error: result.error });
      }
    } catch (error: any) {
      console.error('Error validating Telegram chat ID:', error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/notifications/telegram/status', async (req: any, res) => {
    try {
      const testResult = await telegramService.testConnection();
      
      res.json({
        configured: telegramService.isConfigured(),
        configStatus: telegramService.getConfigStatus(),
        botUsername: telegramService.getBotUsername(),
        setupInstructions: telegramService.getSetupInstructions(),
        botInfo: testResult.success ? testResult.botInfo : null
      });
    } catch (error: any) {
      console.error('Error getting Telegram status:', error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/notifications/telegram/test', async (req: any, res) => {
    try {
      const { chatId } = req.body;
      
      if (!chatId) {
        return res.status(400).json({ error: 'Chat ID is required' });
      }

      // Demo mode for testing without real credentials
      if (!telegramService.isConfigured()) {
        // Simulate successful test message in demo mode
        res.json({ 
          success: true, 
          message: 'Demo test message sent (Telegram service not configured)',
          messageId: `demo_${Date.now()}`,
          demo: true
        });
        return;
      }

      const result = await telegramService.sendMessage({
        chatId: chatId,
        message: '🧪 <b>Test Notification</b>\n\nThis is a test message from CryptoStrategy Pro!\n\n✅ Your Telegram notifications are working correctly.',
        parseMode: 'HTML'
      });

      if (result.success) {
        res.json({ 
          success: true, 
          message: 'Test message sent successfully',
          messageId: result.messageId
        });
      } else {
        res.status(400).json({ error: result.error });
      }
    } catch (error: any) {
      console.error('Error sending Telegram test:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Smart Timing Optimizer Routes
  
  // Get user's timing preferences
  app.get('/api/smart-timing/preferences', async (req, res) => {
    try {
      const { userId } = req.query;
      if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
      }
      
      const preferences = await smartTimingOptimizer.getUserTimingPreferences(userId as string);
      res.json(preferences);
    } catch (error) {
      console.error('Get timing preferences error:', error);
      res.status(500).json({ error: 'Failed to get timing preferences' });
    }
  });

  // Update user's timing preferences
  app.put('/api/smart-timing/preferences', async (req, res) => {
    try {
      const { userId, ...updates } = req.body;
      if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
      }
      
      const preferences = await smartTimingOptimizer.updateTimingPreferences(userId, updates);
      res.json(preferences);
    } catch (error) {
      console.error('Update timing preferences error:', error);
      res.status(500).json({ error: 'Failed to update timing preferences' });
    }
  });

  // Get timing optimization suggestions
  app.get('/api/smart-timing/suggestions', async (req, res) => {
    try {
      const { userId } = req.query;
      if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
      }
      
      const suggestions = await smartTimingOptimizer.generateOptimizationSuggestions(userId as string);
      res.json(suggestions);
    } catch (error) {
      console.error('Get timing suggestions error:', error);
      res.status(500).json({ error: 'Failed to get timing suggestions' });
    }
  });

  // Apply timing optimization
  app.post('/api/smart-timing/apply-optimization', async (req, res) => {
    try {
      const { optimizationId } = req.body;
      if (!optimizationId) {
        return res.status(400).json({ error: 'Optimization ID is required' });
      }
      
      const success = await smartTimingOptimizer.applyOptimization(optimizationId);
      res.json({ success });
    } catch (error) {
      console.error('Apply optimization error:', error);
      res.status(500).json({ error: 'Failed to apply optimization' });
    }
  });

  // Check if notification should be sent
  app.post('/api/smart-timing/should-send', async (req, res) => {
    try {
      const { userId, signalConfidence } = req.body;
      if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
      }
      
      const result = await smartTimingOptimizer.shouldSendNotification(userId, signalConfidence);
      res.json(result);
    } catch (error) {
      console.error('Should send notification error:', error);
      res.status(500).json({ error: 'Failed to check notification timing' });
    }
  });

  // Get timing analytics summary
  app.get('/api/smart-timing/analytics', async (req, res) => {
    try {
      const { userId, days } = req.query;
      if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
      }
      
      const analytics = await smartTimingOptimizer.getTimingAnalyticsSummary(
        userId as string, 
        days ? parseInt(days as string) : 30
      );
      res.json(analytics);
    } catch (error) {
      console.error('Get timing analytics error:', error);
      res.status(500).json({ error: 'Failed to get timing analytics' });
    }
  });

  // Record notification interaction
  app.post('/api/smart-timing/record-interaction', async (req, res) => {
    try {
      const analyticsData = req.body;
      await smartTimingOptimizer.recordNotificationAnalytics(analyticsData);
      res.json({ success: true });
    } catch (error) {
      console.error('Record interaction error:', error);
      res.status(500).json({ error: 'Failed to record interaction' });
    }
  });

  // Get optimal timing analysis
  app.get('/api/smart-timing/optimal-analysis', async (req, res) => {
    try {
      const { userId } = req.query;
      if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
      }
      
      const analysis = await smartTimingOptimizer.calculateOptimalTiming(userId as string);
      res.json(analysis);
    } catch (error) {
      console.error('Get optimal analysis error:', error);
      res.status(500).json({ error: 'Failed to get optimal timing analysis' });
    }
  });

  return httpServer;
}
