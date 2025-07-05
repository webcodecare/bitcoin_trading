import { pgTable, text, serial, integer, boolean, timestamp, uuid, decimal, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  hashedPassword: text("hashed_password").notNull(),
  role: text("role", { enum: ["admin", "user"] }).notNull().default("user"),
  firstName: text("first_name"),
  lastName: text("last_name"),
  isActive: boolean("is_active").notNull().default(true),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  subscriptionTier: text("subscription_tier", { enum: ["free", "basic", "premium", "pro"] }).notNull().default("free"),
  subscriptionStatus: text("subscription_status", { enum: ["active", "canceled", "past_due", "trialing", "incomplete"] }),
  subscriptionEndsAt: timestamp("subscription_ends_at"),
  lastLoginAt: timestamp("last_login_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const userSettings = pgTable("user_settings", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id),
  notificationEmail: boolean("notification_email").notNull().default(true),
  notificationSms: boolean("notification_sms").notNull().default(false),
  notificationPush: boolean("notification_push").notNull().default(true),
  theme: text("theme", { enum: ["light", "dark"] }).notNull().default("dark"),
  language: text("language").notNull().default("en"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const availableTickers = pgTable("available_tickers", {
  id: uuid("id").primaryKey().defaultRandom(),
  symbol: text("symbol").notNull().unique(),
  description: text("description").notNull(),
  isEnabled: boolean("is_enabled").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const userSubscriptions = pgTable("user_subscriptions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id),
  tickerSymbol: text("ticker_symbol").notNull().references(() => availableTickers.symbol),
  subscribedAt: timestamp("subscribed_at").notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const subscriptionPlans = pgTable("subscription_plans", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  tier: text("tier", { enum: ["free", "basic", "premium", "pro"] }).notNull().unique(),
  stripePriceId: text("stripe_price_id").notNull(),
  monthlyPrice: integer("monthly_price").notNull(), // in cents
  yearlyPrice: integer("yearly_price"), // in cents
  features: text("features").array(),
  maxSignals: integer("max_signals"),
  maxTickers: integer("max_tickers"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const alertSignals = pgTable("alert_signals", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id),
  ticker: text("ticker").notNull(),
  signalType: text("signal_type", { enum: ["buy", "sell"] }).notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  timestamp: timestamp("timestamp").notNull(),
  source: text("source").notNull().default("webhook"),
  note: text("note"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const ohlcCache = pgTable("ohlc_cache", {
  id: uuid("id").primaryKey().defaultRandom(),
  tickerSymbol: text("ticker_symbol").notNull(),
  interval: text("interval").notNull(),
  time: timestamp("time").notNull(),
  open: decimal("open", { precision: 10, scale: 2 }).notNull(),
  high: decimal("high", { precision: 10, scale: 2 }).notNull(),
  low: decimal("low", { precision: 10, scale: 2 }).notNull(),
  close: decimal("close", { precision: 10, scale: 2 }).notNull(),
  volume: decimal("volume", { precision: 15, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const heatmapData = pgTable("heatmap_data", {
  id: uuid("id").primaryKey().defaultRandom(),
  ticker: text("ticker").notNull(),
  week: timestamp("week").notNull(),
  sma200w: decimal("sma_200w", { precision: 10, scale: 2 }).notNull(),
  deviationPercent: decimal("deviation_percent", { precision: 5, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const cycleIndicatorData = pgTable("cycle_indicator_data", {
  id: uuid("id").primaryKey().defaultRandom(),
  ticker: text("ticker").notNull(),
  date: timestamp("date").notNull(),
  ma2y: decimal("ma_2y", { precision: 10, scale: 2 }).notNull(),
  deviation: decimal("deviation", { precision: 5, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const forecastData = pgTable("forecast_data", {
  id: uuid("id").primaryKey().defaultRandom(),
  ticker: text("ticker").notNull(),
  date: timestamp("date").notNull(),
  predictedPrice: decimal("predicted_price", { precision: 10, scale: 2 }).notNull(),
  confidenceLow: decimal("confidence_low", { precision: 10, scale: 2 }).notNull(),
  confidenceHigh: decimal("confidence_high", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const adminActivityLog = pgTable("admin_activity_log", {
  id: uuid("id").primaryKey().defaultRandom(),
  adminId: uuid("admin_id").notNull().references(() => users.id),
  action: text("action").notNull(),
  targetTable: text("target_table"),
  targetId: uuid("target_id"),
  notes: text("notes"),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const userRoles = pgTable("user_roles", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id),
  roleName: text("role_name").notNull(),
  permissions: jsonb("permissions"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  lastLoginAt: true,
});

export const insertUserSettingsSchema = createInsertSchema(userSettings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTickerSchema = createInsertSchema(availableTickers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSignalSchema = createInsertSchema(alertSignals).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertOhlcSchema = createInsertSchema(ohlcCache).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertHeatmapSchema = createInsertSchema(heatmapData).omit({
  id: true,
  createdAt: true,
});

export const insertCycleSchema = createInsertSchema(cycleIndicatorData).omit({
  id: true,
  createdAt: true,
});

export const insertForecastSchema = createInsertSchema(forecastData).omit({
  id: true,
  createdAt: true,
});

export const insertAdminLogSchema = createInsertSchema(adminActivityLog).omit({
  id: true,
  createdAt: true,
});

export const insertSubscriptionPlanSchema = createInsertSchema(subscriptionPlans).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertUserSubscriptionSchema = createInsertSchema(userSubscriptions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type UserSettings = typeof userSettings.$inferSelect;
export type InsertUserSettings = z.infer<typeof insertUserSettingsSchema>;
export type AvailableTicker = typeof availableTickers.$inferSelect;
export type InsertTicker = z.infer<typeof insertTickerSchema>;
export type AlertSignal = typeof alertSignals.$inferSelect;
export type InsertSignal = z.infer<typeof insertSignalSchema>;
export type OhlcData = typeof ohlcCache.$inferSelect;
export type InsertOhlc = z.infer<typeof insertOhlcSchema>;
export type HeatmapData = typeof heatmapData.$inferSelect;
export type InsertHeatmap = z.infer<typeof insertHeatmapSchema>;
export type CycleData = typeof cycleIndicatorData.$inferSelect;
export type InsertCycle = z.infer<typeof insertCycleSchema>;
export type ForecastData = typeof forecastData.$inferSelect;
export type InsertForecast = z.infer<typeof insertForecastSchema>;
export type AdminLog = typeof adminActivityLog.$inferSelect;
export type InsertAdminLog = z.infer<typeof insertAdminLogSchema>;
export type SubscriptionPlan = typeof subscriptionPlans.$inferSelect;
export type InsertSubscriptionPlan = z.infer<typeof insertSubscriptionPlanSchema>;
export type UserSubscription = typeof userSubscriptions.$inferSelect;
export type InsertUserSubscription = z.infer<typeof insertUserSubscriptionSchema>;
