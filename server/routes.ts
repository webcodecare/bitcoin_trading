import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import bcrypt from "bcryptjs";
import Stripe from "stripe";
import { storage } from "./storage";
import { insertUserSchema, insertSignalSchema, insertTickerSchema } from "@shared/schema";
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
      // In a real app, you'd verify JWT token here
      // For simplicity, we'll use the token as user ID
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

  app.put('/api/user/settings', requireAuth, async (req: any, res) => {
    try {
      const updates = z.object({
        notificationEmail: z.boolean().optional(),
        notificationSms: z.boolean().optional(),
        notificationPush: z.boolean().optional(),
        theme: z.enum(['light', 'dark']).optional(),
        language: z.string().optional(),
      }).parse(req.body);

      const settings = await storage.updateUserSettings(req.user.id, updates);
      res.json(settings);
    } catch (error) {
      res.status(400).json({ message: 'Failed to update settings' });
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
      const { ticker, limit } = req.query;
      let signals;
      
      if (ticker) {
        signals = await storage.getSignalsByTicker(ticker, limit ? parseInt(limit) : undefined);
      } else {
        signals = await storage.getSignals(limit ? parseInt(limit) : undefined);
      }
      
      res.json(signals);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get signals' });
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

  // Webhook for TradingView signals
  app.post('/api/webhook/signal', async (req, res) => {
    try {
      const { token, symbol, price, type, time, note } = z.object({
        token: z.string(),
        symbol: z.string(),
        price: z.number(),
        type: z.enum(['buy', 'sell']),
        time: z.string(),
        note: z.string().optional(),
      }).parse(req.body);

      // Validate webhook token
      const expectedToken = process.env.WEBHOOK_SECRET || 'default_secret';
      if (token !== expectedToken) {
        return res.status(401).json({ message: 'Invalid webhook token' });
      }

      const signal = await storage.createSignal({
        ticker: symbol,
        signalType: type,
        price: price.toString(),
        timestamp: new Date(time),
        source: 'tradingview_webhook',
        note,
        userId: null, // System-generated signal
      });

      // Broadcast to all connected clients
      broadcast({
        type: 'new_signal',
        signal,
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
      res.json(data);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get cycle data' });
    }
  });

  app.get('/api/chart/forecast/:ticker', async (req, res) => {
    try {
      const { ticker } = req.params;
      const data = await storage.getForecastData(ticker);
      res.json(data);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get forecast data' });
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

  app.put('/api/admin/users/:id', requireAuth, requireAdmin, async (req: any, res) => {
    try {
      const { id } = req.params;
      const updates = z.object({
        isActive: z.boolean().optional(),
        role: z.enum(['admin', 'user']).optional(),
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

  // External API integration for live prices (Binance)
  app.get('/api/market/price/:symbol', async (req, res) => {
    try {
      const { symbol } = req.params;
      const response = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${symbol}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch price from Binance');
      }
      
      const data = await response.json();
      res.json(data);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get market price' });
    }
  });

  app.get('/api/market/klines/:symbol', async (req, res) => {
    try {
      const { symbol } = req.params;
      const { interval = '1h', limit = 100 } = req.query;
      
      const response = await fetch(
        `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch klines from Binance');
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
    } catch (error) {
      res.status(500).json({ message: 'Failed to get market data' });
    }
  });

  // Subscription Management Routes
  app.get("/api/subscription-plans", async (req, res) => {
    try {
      const plans = await storage.getSubscriptionPlans();
      res.json(plans);
    } catch (error) {
      console.error("Error fetching subscription plans:", error);
      res.status(500).json({ message: "Failed to fetch subscription plans" });
    }
  });

  // Create Stripe Checkout Session for Subscription
  app.post("/api/create-subscription", async (req, res) => {
    try {
      const { planTier, billingInterval = "monthly" } = req.body;
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

  return httpServer;
}
