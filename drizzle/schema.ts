import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, json } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Plugin registry
export const plugins = mysqlTable("plugins", {
  id: int("id").autoincrement().primaryKey(),
  slug: varchar("slug", { length: 64 }).notNull().unique(),
  name: varchar("name", { length: 128 }).notNull(),
  description: text("description"),
  icon: varchar("icon", { length: 64 }),
  category: varchar("category", { length: 64 }),
  version: varchar("version", { length: 32 }).default("1.0.0"),
  enabled: boolean("enabled").default(false).notNull(),
  config: json("config"),
  author: varchar("author", { length: 128 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Plugin = typeof plugins.$inferSelect;
export type InsertPlugin = typeof plugins.$inferInsert;

// Services for the service catalog
export const services = mysqlTable("services", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 128 }).notNull(),
  slug: varchar("slug", { length: 128 }).notNull().unique(),
  description: text("description"),
  owner: varchar("owner", { length: 128 }),
  team: varchar("team", { length: 128 }),
  language: varchar("language", { length: 64 }),
  framework: varchar("framework", { length: 64 }),
  repoUrl: varchar("repoUrl", { length: 512 }),
  status: mysqlEnum("status", ["healthy", "degraded", "down", "unknown"]).default("unknown").notNull(),
  tier: mysqlEnum("tier", ["critical", "high", "medium", "low"]).default("medium").notNull(),
  tags: json("tags"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Service = typeof services.$inferSelect;
export type InsertService = typeof services.$inferInsert;

// Deployments for monitoring
export const deployments = mysqlTable("deployments", {
  id: int("id").autoincrement().primaryKey(),
  serviceId: int("serviceId").notNull(),
  version: varchar("version", { length: 64 }),
  environment: mysqlEnum("environment", ["production", "staging", "development"]).default("development").notNull(),
  status: mysqlEnum("status", ["pending", "building", "deploying", "success", "failed", "rolled_back"]).default("pending").notNull(),
  triggeredBy: varchar("triggeredBy", { length: 128 }),
  commitHash: varchar("commitHash", { length: 64 }),
  commitMessage: text("commitMessage"),
  duration: int("duration"),
  logs: text("logs"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Deployment = typeof deployments.$inferSelect;
export type InsertDeployment = typeof deployments.$inferInsert;

// Onboarding templates
export const onboardingTemplates = mysqlTable("onboarding_templates", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 128 }).notNull(),
  description: text("description"),
  language: varchar("language", { length: 64 }),
  framework: varchar("framework", { length: 64 }),
  category: varchar("category", { length: 64 }),
  features: json("features"),
  popularity: int("popularity").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type OnboardingTemplate = typeof onboardingTemplates.$inferSelect;
export type InsertOnboardingTemplate = typeof onboardingTemplates.$inferInsert;

// AI chat sessions
export const aiSessions = mysqlTable("ai_sessions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  title: varchar("title", { length: 256 }),
  messages: json("messages"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AiSession = typeof aiSessions.$inferSelect;
export type InsertAiSession = typeof aiSessions.$inferInsert;
