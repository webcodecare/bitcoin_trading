import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { eq, desc, and } from "drizzle-orm";
import * as schema from "@shared/schema";
import type {
  User,
  InsertUser,
  UserSettings,
  InsertUserSettings,
  AvailableTicker,
  InsertTicker,
  AlertSignal,
  InsertSignal,
  OhlcData,
  InsertOhlc,
  HeatmapData,
  InsertHeatmap,
  CycleData,
  InsertCycle,
  ForecastData,
  InsertForecast,
  AdminLog,
  InsertAdminLog,
  SubscriptionPlan,
  InsertSubscriptionPlan,
  UserSubscription,
  InsertUserSubscription,
  UserTrade,
  InsertUserTrade,
  UserPortfolio,
  InsertUserPortfolio,
  TradingSettings,
  InsertTradingSettings,
  UserAlert,
  InsertUserAlert,
  DashboardLayout,
  InsertDashboardLayout,
} from "@shared/schema";

// Initialize database connection if URL is provided
let db: any = null;
if (process.env.DATABASE_URL) {
  const sql = neon(process.env.DATABASE_URL);
  db = drizzle(sql, { schema });
}

export interface IStorage {
  // User management
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  
  // User settings
  getUserSettings(userId: string): Promise<UserSettings | undefined>;
  createUserSettings(settings: InsertUserSettings): Promise<UserSettings>;
  updateUserSettings(userId: string, updates: Partial<UserSettings>): Promise<UserSettings | undefined>;
  
  // Tickers
  getAllTickers(): Promise<AvailableTicker[]>;
  getEnabledTickers(): Promise<AvailableTicker[]>;
  createTicker(ticker: InsertTicker): Promise<AvailableTicker>;
  updateTicker(id: string, updates: Partial<AvailableTicker>): Promise<AvailableTicker | undefined>;
  deleteTicker(id: string): Promise<boolean>;
  
  // Signals
  getSignals(limit?: number): Promise<AlertSignal[]>;
  getSignalsByTicker(ticker: string, limit?: number): Promise<AlertSignal[]>;
  getSignalsByUser(userId: string, limit?: number): Promise<AlertSignal[]>;
  createSignal(signal: InsertSignal): Promise<AlertSignal>;
  
  // OHLC Data
  getOhlcData(ticker: string, interval: string, limit?: number): Promise<OhlcData[]>;
  createOhlcData(data: InsertOhlc): Promise<OhlcData>;
  
  // Heatmap Data
  getHeatmapData(ticker: string): Promise<HeatmapData[]>;
  createHeatmapData(data: InsertHeatmap): Promise<HeatmapData>;
  
  // Cycle Data
  getCycleData(ticker: string): Promise<CycleData[]>;
  createCycleData(data: InsertCycle): Promise<CycleData>;
  
  // Forecast Data
  getForecastData(ticker: string): Promise<ForecastData[]>;
  createForecastData(data: InsertForecast): Promise<ForecastData>;
  
  // Admin logs
  getAdminLogs(limit?: number): Promise<AdminLog[]>;
  createAdminLog(log: InsertAdminLog): Promise<AdminLog>;
  
  // Subscription Plans
  getSubscriptionPlans(): Promise<SubscriptionPlan[]>;
  getSubscriptionPlan(tier: string): Promise<SubscriptionPlan | undefined>;
  createSubscriptionPlan(plan: InsertSubscriptionPlan): Promise<SubscriptionPlan>;
  
  // User Subscriptions
  updateUserSubscription(userId: string, updates: Partial<User>): Promise<User | undefined>;
  
  // Trading System
  getUserTrades(userId: string, limit?: number): Promise<UserTrade[]>;
  createTrade(trade: InsertUserTrade): Promise<UserTrade>;
  getUserPortfolio(userId: string): Promise<UserPortfolio[]>;
  updatePortfolio(userId: string, ticker: string, updates: Partial<UserPortfolio>): Promise<UserPortfolio | undefined>;
  getTradingSettings(userId: string): Promise<TradingSettings | undefined>;
  updateTradingSettings(userId: string, settings: Partial<TradingSettings>): Promise<TradingSettings>;
  
  // User Alerts
  getUserAlerts(userId: string): Promise<UserAlert[]>;
  createUserAlert(alert: InsertUserAlert): Promise<UserAlert>;
  updateUserAlert(id: string, updates: Partial<UserAlert>): Promise<UserAlert | undefined>;
  deleteUserAlert(id: string): Promise<boolean>;
  
  // Dashboard Layouts
  getDashboardLayout(userId: string): Promise<DashboardLayout | undefined>;
  saveDashboardLayout(layout: InsertDashboardLayout): Promise<DashboardLayout>;
  updateDashboardLayout(id: string, updates: Partial<DashboardLayout>): Promise<DashboardLayout | undefined>;
}

export class MemoryStorage implements IStorage {
  private users: User[] = [
    {
      id: "test-user-123",
      email: "demo@test.com",
      hashedPassword: "$2b$10$AsIHwrKU6nwX.JLjCBHNvOXNcFjdllyiqNKDfcAfwjw49Z.wjd8qC", // password: "demo123"
      role: "user",
      firstName: "Demo",
      lastName: "User",
      isActive: true,
      stripeCustomerId: null,
      stripeSubscriptionId: null,
      subscriptionTier: "free",
      subscriptionStatus: null,
      subscriptionEndsAt: null,
      lastLoginAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "admin-user-456",
      email: "admin@test.com", 
      hashedPassword: "$2b$10$0YvgN82b48qyNveCIHrMwOMtItAXXaL51YolHUIpMJWrHPr6965/m", // password: "admin123"
      role: "admin",
      firstName: "Admin",
      lastName: "User", 
      isActive: true,
      stripeCustomerId: null,
      stripeSubscriptionId: null,
      subscriptionTier: "pro",
      subscriptionStatus: "active",
      subscriptionEndsAt: null,
      lastLoginAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  ];
  private userSettings: UserSettings[] = [
    {
      id: "settings-test-123",
      userId: "test-user-123",
      notificationEmail: true,
      notificationSms: false,
      notificationPush: true,
      theme: "dark",
      language: "en",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "settings-admin-456",
      userId: "admin-user-456",
      notificationEmail: true,
      notificationSms: true,
      notificationPush: true,
      theme: "dark",
      language: "en",
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  ];
  private tickers: AvailableTicker[] = [
    {
      id: "1",
      symbol: "BTCUSDT",
      description: "Bitcoin / USD Tether",
      isEnabled: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "2", 
      symbol: "ETHUSDT",
      description: "Ethereum / USD Tether",
      isEnabled: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "3",
      symbol: "ADAUSDT", 
      description: "Cardano / USD Tether",
      isEnabled: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];
  private signals: AlertSignal[] = [
    {
      id: "signal-1",
      userId: "test-user-123",
      ticker: "BTCUSDT",
      signalType: "buy",
      price: "67500.00",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      source: "algorithm",
      note: "Strong upward momentum detected",
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    },
    {
      id: "signal-2",
      userId: "test-user-123",
      ticker: "ETHUSDT",
      signalType: "sell",
      price: "3420.50",
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
      source: "technical_analysis",
      note: "Resistance level reached",
      createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
    },
    {
      id: "signal-3",
      userId: "test-user-123",
      ticker: "ADAUSDT",
      signalType: "buy",
      price: "0.4567",
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
      source: "webhook",
      note: "Oversold conditions detected",
      createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
    }
  ];
  private ohlcData: OhlcData[] = [];
  private heatmapData: HeatmapData[] = [];
  private cycleData: CycleData[] = [];
  private forecastData: ForecastData[] = [];
  private adminLogs: AdminLog[] = [];

  async getUser(id: string): Promise<User | undefined> {
    return this.users.find(u => u.id === id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return this.users.find(u => u.email === email);
  }

  async createUser(user: InsertUser): Promise<User> {
    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      email: user.email,
      hashedPassword: user.hashedPassword,
      role: user.role ?? "user",
      firstName: user.firstName ?? null,
      lastName: user.lastName ?? null,
      isActive: user.isActive ?? true,
      stripeCustomerId: null,
      stripeSubscriptionId: null,
      subscriptionTier: "free",
      subscriptionStatus: null,
      subscriptionEndsAt: null,
      lastLoginAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.push(newUser);
    return newUser;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const index = this.users.findIndex(u => u.id === id);
    if (index === -1) return undefined;
    this.users[index] = { ...this.users[index], ...updates, updatedAt: new Date() };
    return this.users[index];
  }

  async getAllUsers(): Promise<User[]> {
    return [...this.users].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getUserSettings(userId: string): Promise<UserSettings | undefined> {
    return this.userSettings.find(s => s.userId === userId);
  }

  async createUserSettings(settings: InsertUserSettings): Promise<UserSettings> {
    const newSettings: UserSettings = {
      userId: settings.userId,
      notificationEmail: settings.notificationEmail ?? true,
      notificationSms: settings.notificationSms ?? false,
      notificationPush: settings.notificationPush ?? true,
      theme: settings.theme ?? "dark",
      language: settings.language ?? "en",
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.userSettings.push(newSettings);
    return newSettings;
  }

  async updateUserSettings(userId: string, updates: Partial<UserSettings>): Promise<UserSettings | undefined> {
    const index = this.userSettings.findIndex(s => s.userId === userId);
    if (index === -1) return undefined;
    this.userSettings[index] = { ...this.userSettings[index], ...updates, updatedAt: new Date() };
    return this.userSettings[index];
  }

  async getAllTickers(): Promise<AvailableTicker[]> {
    return [...this.tickers].sort((a, b) => a.symbol.localeCompare(b.symbol));
  }

  async getEnabledTickers(): Promise<AvailableTicker[]> {
    return this.tickers.filter(t => t.isEnabled).sort((a, b) => a.symbol.localeCompare(b.symbol));
  }

  async createTicker(ticker: InsertTicker): Promise<AvailableTicker> {
    const newTicker: AvailableTicker = {
      id: Math.random().toString(36).substr(2, 9),
      symbol: ticker.symbol,
      description: ticker.description,
      isEnabled: ticker.isEnabled ?? true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.tickers.push(newTicker);
    return newTicker;
  }

  async updateTicker(id: string, updates: Partial<AvailableTicker>): Promise<AvailableTicker | undefined> {
    const index = this.tickers.findIndex(t => t.id === id);
    if (index === -1) return undefined;
    this.tickers[index] = { ...this.tickers[index], ...updates, updatedAt: new Date() };
    return this.tickers[index];
  }

  async deleteTicker(id: string): Promise<boolean> {
    const index = this.tickers.findIndex(t => t.id === id);
    if (index === -1) return false;
    this.tickers.splice(index, 1);
    return true;
  }

  async getSignals(limit = 100): Promise<AlertSignal[]> {
    return [...this.signals]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }

  async getSignalsByTicker(ticker: string, limit = 100): Promise<AlertSignal[]> {
    return this.signals
      .filter(s => s.ticker === ticker)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }

  async getSignalsByUser(userId: string, limit = 100): Promise<AlertSignal[]> {
    return this.signals
      .filter(s => s.userId === userId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }

  async createSignal(signal: InsertSignal): Promise<AlertSignal> {
    const newSignal: AlertSignal = {
      id: Math.random().toString(36).substr(2, 9),
      userId: signal.userId ?? null,
      ticker: signal.ticker,
      signalType: signal.signalType,
      price: signal.price,
      timestamp: signal.timestamp,
      source: signal.source ?? "webhook",
      note: signal.note ?? null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.signals.push(newSignal);
    return newSignal;
  }

  async getOhlcData(ticker: string, interval: string, limit = 1000): Promise<OhlcData[]> {
    return this.ohlcData
      .filter(d => d.tickerSymbol === ticker && d.interval === interval)
      .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
      .slice(0, limit);
  }

  async createOhlcData(data: InsertOhlc): Promise<OhlcData> {
    const newData: OhlcData = {
      ...data,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.ohlcData.push(newData);
    return newData;
  }

  async getHeatmapData(ticker: string): Promise<HeatmapData[]> {
    return this.heatmapData.filter(d => d.ticker === ticker);
  }

  async createHeatmapData(data: InsertHeatmap): Promise<HeatmapData> {
    const newData: HeatmapData = {
      ...data,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date(),
    };
    this.heatmapData.push(newData);
    return newData;
  }

  async getCycleData(ticker: string): Promise<CycleData[]> {
    return this.cycleData.filter(d => d.ticker === ticker);
  }

  async createCycleData(data: InsertCycle): Promise<CycleData> {
    const newData: CycleData = {
      ...data,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date(),
    };
    this.cycleData.push(newData);
    return newData;
  }

  async getForecastData(ticker: string): Promise<ForecastData[]> {
    return this.forecastData.filter(d => d.ticker === ticker);
  }

  async createForecastData(data: InsertForecast): Promise<ForecastData> {
    const newData: ForecastData = {
      ...data,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date(),
    };
    this.forecastData.push(newData);
    return newData;
  }

  async getAdminLogs(limit = 100): Promise<AdminLog[]> {
    return [...this.adminLogs]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  }

  async createAdminLog(log: InsertAdminLog): Promise<AdminLog> {
    const newLog: AdminLog = {
      id: Math.random().toString(36).substr(2, 9),
      adminId: log.adminId,
      action: log.action,
      timestamp: log.timestamp ?? new Date(),
      targetTable: log.targetTable ?? null,
      targetId: log.targetId ?? null,
      notes: log.notes ?? null,
      createdAt: new Date(),
    };
    this.adminLogs.push(newLog);
    return newLog;
  }

  // Subscription Plans
  async getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    // Return mock subscription plans for MemoryStorage
    return [
      {
        id: "plan-free",
        name: "Free Plan",
        tier: "free",
        stripePriceId: "price_free",
        monthlyPrice: 0,
        yearlyPrice: 0,
        features: ["Basic signals", "Limited charts", "3 tickers"],
        maxSignals: 10,
        maxTickers: 3,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "plan-basic",
        name: "Basic Plan",
        tier: "basic",
        stripePriceId: "price_basic_monthly",
        monthlyPrice: 2999,
        yearlyPrice: 29999,
        features: ["Advanced signals", "Full charts", "10 tickers", "Email alerts"],
        maxSignals: 100,
        maxTickers: 10,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
  }

  async getSubscriptionPlan(tier: string): Promise<SubscriptionPlan | undefined> {
    const plans = await this.getSubscriptionPlans();
    return plans.find(p => p.tier === tier);
  }

  async createSubscriptionPlan(plan: InsertSubscriptionPlan): Promise<SubscriptionPlan> {
    const newPlan: SubscriptionPlan = {
      id: Math.random().toString(36).substr(2, 9),
      name: plan.name,
      tier: plan.tier,
      stripePriceId: plan.stripePriceId,
      monthlyPrice: plan.monthlyPrice,
      yearlyPrice: plan.yearlyPrice ?? null,
      features: plan.features ?? null,
      maxSignals: plan.maxSignals ?? null,
      maxTickers: plan.maxTickers ?? null,
      isActive: plan.isActive ?? true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    return newPlan;
  }

  async updateUserSubscription(userId: string, updates: Partial<User>): Promise<User | undefined> {
    const userIndex = this.users.findIndex(u => u.id === userId);
    if (userIndex === -1) return undefined;
    
    this.users[userIndex] = { ...this.users[userIndex], ...updates, updatedAt: new Date() };
    return this.users[userIndex];
  }

  // Trading System implementation
  private trades: UserTrade[] = [];
  private portfolios: UserPortfolio[] = [];
  private tradingSettings: TradingSettings[] = [];
  private userAlerts: UserAlert[] = [];
  private dashboardLayouts: DashboardLayout[] = [];

  async getUserTrades(userId: string, limit = 100): Promise<UserTrade[]> {
    return this.trades
      .filter(trade => trade.userId === userId)
      .sort((a, b) => new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime())
      .slice(0, limit);
  }

  async createTrade(trade: InsertUserTrade): Promise<UserTrade> {
    const newTrade: UserTrade = {
      id: `trade_${Date.now()}`,
      timestamp: new Date(),
      createdAt: new Date(),
      ...trade
    };
    this.trades.push(newTrade);
    return newTrade;
  }

  async getUserPortfolio(userId: string): Promise<UserPortfolio[]> {
    return this.portfolios.filter(portfolio => portfolio.userId === userId);
  }

  async updatePortfolio(userId: string, ticker: string, updates: Partial<UserPortfolio>): Promise<UserPortfolio | undefined> {
    const portfolioIndex = this.portfolios.findIndex(p => p.userId === userId && p.ticker === ticker);
    if (portfolioIndex !== -1) {
      this.portfolios[portfolioIndex] = { 
        ...this.portfolios[portfolioIndex], 
        ...updates,
        updatedAt: new Date()
      };
      return this.portfolios[portfolioIndex];
    }
    
    // Create new portfolio entry if it doesn't exist
    const newPortfolio: UserPortfolio = {
      id: `portfolio_${Date.now()}`,
      userId,
      ticker,
      quantity: "0",
      averagePrice: "0",
      currentValue: "0",
      pnl: "0",
      pnlPercentage: "0",
      createdAt: new Date(),
      updatedAt: new Date(),
      ...updates
    };
    this.portfolios.push(newPortfolio);
    return newPortfolio;
  }

  async getTradingSettings(userId: string): Promise<TradingSettings | undefined> {
    return this.tradingSettings.find(settings => settings.userId === userId);
  }

  async updateTradingSettings(userId: string, settingsUpdate: Partial<TradingSettings>): Promise<TradingSettings> {
    const settingsIndex = this.tradingSettings.findIndex(s => s.userId === userId);
    if (settingsIndex !== -1) {
      this.tradingSettings[settingsIndex] = {
        ...this.tradingSettings[settingsIndex],
        ...settingsUpdate,
        updatedAt: new Date()
      };
      return this.tradingSettings[settingsIndex];
    }
    
    // Create new settings if they don't exist
    const newSettings: TradingSettings = {
      id: `settings_${Date.now()}`,
      userId,
      riskLevel: "moderate",
      maxTradeAmount: "1000",
      autoTrading: false,
      stopLoss: "5",
      takeProfit: "10",
      createdAt: new Date(),
      updatedAt: new Date(),
      ...settingsUpdate
    };
    this.tradingSettings.push(newSettings);
    return newSettings;
  }

  // User Alerts implementation
  async getUserAlerts(userId: string): Promise<UserAlert[]> {
    return this.userAlerts.filter(alert => alert.userId === userId);
  }

  async createUserAlert(alert: InsertUserAlert): Promise<UserAlert> {
    const newAlert: UserAlert = {
      id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...alert,
      triggerCount: 0,
      lastTriggered: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.userAlerts.push(newAlert);
    return newAlert;
  }

  async updateUserAlert(id: string, updates: Partial<UserAlert>): Promise<UserAlert | undefined> {
    const alertIndex = this.userAlerts.findIndex(alert => alert.id === id);
    if (alertIndex === -1) return undefined;

    this.userAlerts[alertIndex] = {
      ...this.userAlerts[alertIndex],
      ...updates,
      updatedAt: new Date(),
    };
    return this.userAlerts[alertIndex];
  }

  async deleteUserAlert(id: string): Promise<boolean> {
    const alertIndex = this.userAlerts.findIndex(alert => alert.id === id);
    if (alertIndex === -1) return false;

    this.userAlerts.splice(alertIndex, 1);
    return true;
  }

  // Dashboard Layout implementation
  async getDashboardLayout(userId: string): Promise<DashboardLayout | undefined> {
    return this.dashboardLayouts.find(layout => layout.userId === userId && layout.isDefault);
  }

  async saveDashboardLayout(layout: InsertDashboardLayout): Promise<DashboardLayout> {
    // Check if user already has a default layout
    const existingIndex = this.dashboardLayouts.findIndex(l => l.userId === layout.userId && l.isDefault);
    
    const newLayout: DashboardLayout = {
      id: `layout-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...layout,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    if (existingIndex !== -1) {
      // Update existing layout
      this.dashboardLayouts[existingIndex] = { ...this.dashboardLayouts[existingIndex], ...newLayout };
      return this.dashboardLayouts[existingIndex];
    } else {
      // Create new layout
      this.dashboardLayouts.push(newLayout);
      return newLayout;
    }
  }

  async updateDashboardLayout(id: string, updates: Partial<DashboardLayout>): Promise<DashboardLayout | undefined> {
    const layoutIndex = this.dashboardLayouts.findIndex(layout => layout.id === id);
    if (layoutIndex === -1) return undefined;

    this.dashboardLayouts[layoutIndex] = {
      ...this.dashboardLayouts[layoutIndex],
      ...updates,
      updatedAt: new Date(),
    };
    return this.dashboardLayouts[layoutIndex];
  }
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(schema.users).where(eq(schema.users.id, id)).limit(1);
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(schema.users).where(eq(schema.users.email, email)).limit(1);
    return result[0];
  }

  async createUser(user: InsertUser): Promise<User> {
    const result = await db.insert(schema.users).values(user).returning();
    return result[0];
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const result = await db.update(schema.users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(schema.users.id, id))
      .returning();
    return result[0];
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(schema.users).orderBy(desc(schema.users.createdAt));
  }

  async getUserSettings(userId: string): Promise<UserSettings | undefined> {
    const result = await db.select().from(schema.userSettings).where(eq(schema.userSettings.userId, userId)).limit(1);
    return result[0];
  }

  async createUserSettings(settings: InsertUserSettings): Promise<UserSettings> {
    const result = await db.insert(schema.userSettings).values(settings).returning();
    return result[0];
  }

  async updateUserSettings(userId: string, updates: Partial<UserSettings>): Promise<UserSettings | undefined> {
    const result = await db.update(schema.userSettings)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(schema.userSettings.userId, userId))
      .returning();
    return result[0];
  }

  async getAllTickers(): Promise<AvailableTicker[]> {
    return await db.select().from(schema.availableTickers).orderBy(schema.availableTickers.symbol);
  }

  async getEnabledTickers(): Promise<AvailableTicker[]> {
    return await db.select().from(schema.availableTickers)
      .where(eq(schema.availableTickers.isEnabled, true))
      .orderBy(schema.availableTickers.symbol);
  }

  async createTicker(ticker: InsertTicker): Promise<AvailableTicker> {
    const result = await db.insert(schema.availableTickers).values(ticker).returning();
    return result[0];
  }

  async updateTicker(id: string, updates: Partial<AvailableTicker>): Promise<AvailableTicker | undefined> {
    const result = await db.update(schema.availableTickers)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(schema.availableTickers.id, id))
      .returning();
    return result[0];
  }

  async deleteTicker(id: string): Promise<boolean> {
    const result = await db.delete(schema.availableTickers).where(eq(schema.availableTickers.id, id));
    return result.rowCount > 0;
  }

  async getSignals(limit = 100): Promise<AlertSignal[]> {
    return await db.select().from(schema.alertSignals)
      .orderBy(desc(schema.alertSignals.timestamp))
      .limit(limit);
  }

  async getSignalsByTicker(ticker: string, limit = 100): Promise<AlertSignal[]> {
    return await db.select().from(schema.alertSignals)
      .where(eq(schema.alertSignals.ticker, ticker))
      .orderBy(desc(schema.alertSignals.timestamp))
      .limit(limit);
  }

  async getSignalsByUser(userId: string, limit = 100): Promise<AlertSignal[]> {
    return await db.select().from(schema.alertSignals)
      .where(eq(schema.alertSignals.userId, userId))
      .orderBy(desc(schema.alertSignals.timestamp))
      .limit(limit);
  }

  async createSignal(signal: InsertSignal): Promise<AlertSignal> {
    const result = await db.insert(schema.alertSignals).values(signal).returning();
    return result[0];
  }

  async getOhlcData(ticker: string, interval: string, limit = 1000): Promise<OhlcData[]> {
    return await db.select().from(schema.ohlcCache)
      .where(and(
        eq(schema.ohlcCache.tickerSymbol, ticker),
        eq(schema.ohlcCache.interval, interval)
      ))
      .orderBy(desc(schema.ohlcCache.time))
      .limit(limit);
  }

  async createOhlcData(data: InsertOhlc): Promise<OhlcData> {
    const result = await db.insert(schema.ohlcCache).values(data).returning();
    return result[0];
  }

  async getHeatmapData(ticker: string): Promise<HeatmapData[]> {
    return await db.select().from(schema.heatmapData)
      .where(eq(schema.heatmapData.ticker, ticker))
      .orderBy(desc(schema.heatmapData.week));
  }

  async createHeatmapData(data: InsertHeatmap): Promise<HeatmapData> {
    const result = await db.insert(schema.heatmapData).values(data).returning();
    return result[0];
  }

  async getCycleData(ticker: string): Promise<CycleData[]> {
    return await db.select().from(schema.cycleIndicatorData)
      .where(eq(schema.cycleIndicatorData.ticker, ticker))
      .orderBy(desc(schema.cycleIndicatorData.date));
  }

  async createCycleData(data: InsertCycle): Promise<CycleData> {
    const result = await db.insert(schema.cycleIndicatorData).values(data).returning();
    return result[0];
  }

  async getForecastData(ticker: string): Promise<ForecastData[]> {
    return await db.select().from(schema.forecastData)
      .where(eq(schema.forecastData.ticker, ticker))
      .orderBy(desc(schema.forecastData.date));
  }

  async createForecastData(data: InsertForecast): Promise<ForecastData> {
    const result = await db.insert(schema.forecastData).values(data).returning();
    return result[0];
  }

  async getAdminLogs(limit = 100): Promise<AdminLog[]> {
    return await db.select().from(schema.adminActivityLog)
      .orderBy(desc(schema.adminActivityLog.timestamp))
      .limit(limit);
  }

  async createAdminLog(log: InsertAdminLog): Promise<AdminLog> {
    const result = await db.insert(schema.adminActivityLog).values(log).returning();
    return result[0];
  }

  async getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    return await db.select().from(schema.subscriptionPlans).where(eq(schema.subscriptionPlans.isActive, true));
  }

  async getSubscriptionPlan(tier: string): Promise<SubscriptionPlan | undefined> {
    const [plan] = await db.select().from(schema.subscriptionPlans).where(eq(schema.subscriptionPlans.tier, tier as any));
    return plan;
  }

  async createSubscriptionPlan(plan: InsertSubscriptionPlan): Promise<SubscriptionPlan> {
    const [newPlan] = await db
      .insert(schema.subscriptionPlans)
      .values(plan)
      .returning();
    return newPlan;
  }

  async updateUserSubscription(userId: string, updates: Partial<User>): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(schema.users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(schema.users.id, userId))
      .returning();
    return updatedUser;
  }

  // Trading System implementation
  async getUserTrades(userId: string, limit = 100): Promise<UserTrade[]> {
    return await db.select()
      .from(schema.userTrades)
      .where(eq(schema.userTrades.userId, userId))
      .orderBy(desc(schema.userTrades.timestamp))
      .limit(limit);
  }

  async createTrade(trade: InsertUserTrade): Promise<UserTrade> {
    const [newTrade] = await db
      .insert(schema.userTrades)
      .values(trade)
      .returning();
    return newTrade;
  }

  async getUserPortfolio(userId: string): Promise<UserPortfolio[]> {
    return await db.select()
      .from(schema.userPortfolio)
      .where(eq(schema.userPortfolio.userId, userId));
  }

  async updatePortfolio(userId: string, ticker: string, updates: Partial<UserPortfolio>): Promise<UserPortfolio | undefined> {
    const [updated] = await db
      .update(schema.userPortfolio)
      .set({ ...updates, updatedAt: new Date() })
      .where(and(
        eq(schema.userPortfolio.userId, userId),
        eq(schema.userPortfolio.ticker, ticker)
      ))
      .returning();
    
    if (!updated) {
      // Create new portfolio entry if it doesn't exist
      const [newPortfolio] = await db
        .insert(schema.userPortfolio)
        .values({
          userId,
          ticker,
          quantity: "0",
          averagePrice: "0",
          currentValue: "0",
          ...updates
        })
        .returning();
      return newPortfolio;
    }
    
    return updated;
  }

  async getTradingSettings(userId: string): Promise<TradingSettings | undefined> {
    const [settings] = await db.select()
      .from(schema.tradingSettings)
      .where(eq(schema.tradingSettings.userId, userId))
      .limit(1);
    return settings;
  }

  async updateTradingSettings(userId: string, settingsUpdate: Partial<TradingSettings>): Promise<TradingSettings> {
    const [updated] = await db
      .update(schema.tradingSettings)
      .set({ ...settingsUpdate, updatedAt: new Date() })
      .where(eq(schema.tradingSettings.userId, userId))
      .returning();
    
    if (!updated) {
      // Create new settings if they don't exist
      const [newSettings] = await db
        .insert(schema.tradingSettings)
        .values({
          userId,
          ...settingsUpdate
        })
        .returning();
      return newSettings;
    }
    
    return updated;
  }

  // User Alerts implementation
  async getUserAlerts(userId: string): Promise<UserAlert[]> {
    const alerts = await db.select().from(schema.userAlerts).where(eq(schema.userAlerts.userId, userId));
    return alerts;
  }

  async createUserAlert(alert: InsertUserAlert): Promise<UserAlert> {
    const [newAlert] = await db
      .insert(schema.userAlerts)
      .values(alert)
      .returning();
    return newAlert;
  }

  async updateUserAlert(id: string, updates: Partial<UserAlert>): Promise<UserAlert | undefined> {
    const [updatedAlert] = await db
      .update(schema.userAlerts)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(schema.userAlerts.id, id))
      .returning();
    return updatedAlert;
  }

  async deleteUserAlert(id: string): Promise<boolean> {
    const result = await db
      .delete(schema.userAlerts)
      .where(eq(schema.userAlerts.id, id));
    return result.rowCount > 0;
  }

  // Dashboard Layout implementation
  async getDashboardLayout(userId: string): Promise<DashboardLayout | undefined> {
    const [layout] = await db.select()
      .from(schema.dashboardLayouts)
      .where(and(
        eq(schema.dashboardLayouts.userId, userId),
        eq(schema.dashboardLayouts.isDefault, true)
      ))
      .limit(1);
    return layout;
  }

  async saveDashboardLayout(layout: InsertDashboardLayout): Promise<DashboardLayout> {
    // Check if user already has a default layout
    const existing = await this.getDashboardLayout(layout.userId);
    
    if (existing) {
      // Update existing layout
      const [updated] = await db
        .update(schema.dashboardLayouts)
        .set({ ...layout, updatedAt: new Date() })
        .where(eq(schema.dashboardLayouts.id, existing.id))
        .returning();
      return updated;
    } else {
      // Create new layout
      const [newLayout] = await db
        .insert(schema.dashboardLayouts)
        .values(layout)
        .returning();
      return newLayout;
    }
  }

  async updateDashboardLayout(id: string, updates: Partial<DashboardLayout>): Promise<DashboardLayout | undefined> {
    const [updated] = await db
      .update(schema.dashboardLayouts)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(schema.dashboardLayouts.id, id))
      .returning();
    return updated;
  }
}

export const storage = db ? new DatabaseStorage() : new MemoryStorage();
