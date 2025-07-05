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
}

export class MemoryStorage implements IStorage {
  private users: User[] = [];
  private userSettings: UserSettings[] = [];
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
  private signals: AlertSignal[] = [];
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
}

export const storage = db ? new DatabaseStorage() : new MemoryStorage();
