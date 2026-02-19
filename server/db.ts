import { eq, desc, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser, users,
  plugins, Plugin,
  services, Service, InsertService,
  deployments, Deployment, InsertDeployment,
  onboardingTemplates, OnboardingTemplate,
  aiSessions, AiSession, InsertAiSession,
} from "../drizzle/schema";
import { ENV } from './_core/env';
import {
  mockPlugins, mockServices, mockDeployments, mockTemplates,
} from './mock-data';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) { console.warn("[Database] Cannot upsert user: database not available"); return; }
  try {
    const values: InsertUser = { openId: user.openId };
    const updateSet: Record<string, unknown> = {};
    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];
    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };
    textFields.forEach(assignNullable);
    if (user.lastSignedIn !== undefined) { values.lastSignedIn = user.lastSignedIn; updateSet.lastSignedIn = user.lastSignedIn; }
    if (user.role !== undefined) { values.role = user.role; updateSet.role = user.role; } else if (user.openId === ENV.ownerOpenId) { values.role = 'admin'; updateSet.role = 'admin'; }
    if (!values.lastSignedIn) values.lastSignedIn = new Date();
    if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();
    await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
  } catch (error) { console.error("[Database] Failed to upsert user:", error); throw error; }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) { console.warn("[Database] Cannot get user: database not available"); return undefined; }
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ── Plugin queries ──
export async function getAllPlugins() {
  const db = await getDb();
  if (!db) return mockPlugins as unknown as Plugin[];
  return db.select().from(plugins);
}

export async function getPluginBySlug(slug: string) {
  const db = await getDb();
  if (!db) return mockPlugins.find(p => p.slug === slug) as unknown as Plugin | undefined;
  const result = await db.select().from(plugins).where(eq(plugins.slug, slug)).limit(1);
  return result[0];
}

export async function togglePlugin(id: number, enabled: boolean) {
  const db = await getDb();
  if (!db) return;
  await db.update(plugins).set({ enabled }).where(eq(plugins.id, id));
}

export async function updatePluginConfig(id: number, config: unknown) {
  const db = await getDb();
  if (!db) return;
  await db.update(plugins).set({ config }).where(eq(plugins.id, id));
}

// ── Service queries ──
export async function getAllServices() {
  const db = await getDb();
  if (!db) return mockServices as unknown as Service[];
  return db.select().from(services);
}

export async function getServiceById(id: number) {
  const db = await getDb();
  if (!db) return mockServices.find(s => s.id === id) as unknown as Service | undefined;
  const result = await db.select().from(services).where(eq(services.id, id)).limit(1);
  return result[0];
}

export async function createService(data: InsertService) {
  const db = await getDb();
  if (!db) return;
  await db.insert(services).values(data);
}

export async function updateServiceStatus(id: number, status: "healthy" | "degraded" | "down" | "unknown") {
  const db = await getDb();
  if (!db) return;
  await db.update(services).set({ status }).where(eq(services.id, id));
}

// ── Deployment queries ──
export async function getRecentDeployments(limit = 20) {
  const db = await getDb();
  if (!db) return mockDeployments.slice(0, limit) as unknown as Deployment[];
  return db.select().from(deployments).orderBy(desc(deployments.createdAt)).limit(limit);
}

export async function getDeploymentsByService(serviceId: number) {
  const db = await getDb();
  if (!db) return mockDeployments.filter(d => d.serviceId === serviceId).slice(0, 10) as unknown as Deployment[];
  return db.select().from(deployments).where(eq(deployments.serviceId, serviceId)).orderBy(desc(deployments.createdAt)).limit(10);
}

export async function getDeploymentById(id: number) {
  const db = await getDb();
  if (!db) return mockDeployments.find(d => d.id === id) as unknown as Deployment | undefined;
  const result = await db.select().from(deployments).where(eq(deployments.id, id)).limit(1);
  return result[0];
}

export async function createDeployment(data: InsertDeployment) {
  const db = await getDb();
  if (!db) return;
  await db.insert(deployments).values(data);
}

// ── Onboarding queries ──
export async function getAllTemplates() {
  const db = await getDb();
  if (!db) return [...mockTemplates].sort((a, b) => b.popularity - a.popularity) as unknown as OnboardingTemplate[];
  return db.select().from(onboardingTemplates).orderBy(desc(onboardingTemplates.popularity));
}

// ── AI Session queries ──
export async function getUserSessions(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(aiSessions).where(eq(aiSessions.userId, userId)).orderBy(desc(aiSessions.updatedAt)).limit(20);
}

export async function getSessionById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(aiSessions).where(eq(aiSessions.id, id)).limit(1);
  return result[0];
}

export async function createSession(data: InsertAiSession) {
  const db = await getDb();
  if (!db) return;
  const result = await db.insert(aiSessions).values(data);
  return result[0].insertId;
}

export async function updateSessionMessages(id: number, messages: unknown, title?: string) {
  const db = await getDb();
  if (!db) return;
  const set: Record<string, unknown> = { messages };
  if (title) set.title = title;
  await db.update(aiSessions).set(set).where(eq(aiSessions.id, id));
}

// ── Metrics helpers (computed from deployments) ──
export async function getDeploymentStats() {
  const db = await getDb();
  if (!db) {
    const total = mockDeployments.length;
    const success = mockDeployments.filter(d => d.status === "success").length;
    const failed = mockDeployments.filter(d => d.status === "failed").length;
    const durations = mockDeployments.map(d => d.duration).filter((d): d is number => d !== null);
    const avgDuration = durations.length ? durations.reduce((a, b) => a + b, 0) / durations.length : 0;
    return { total, success, failed, avgDuration };
  }
  const result = await db.select({
    total: sql<number>`COUNT(*)`,
    success: sql<number>`SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END)`,
    failed: sql<number>`SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END)`,
    avgDuration: sql<number>`AVG(duration)`,
  }).from(deployments);
  return result[0] || { total: 0, success: 0, failed: 0, avgDuration: 0 };
}
