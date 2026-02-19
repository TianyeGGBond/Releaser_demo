import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

function createAuthContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user-001",
    email: "dev@example.com",
    name: "Test Developer",
    loginMethod: "oauth",
    role: "admin",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };
  return {
    user,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

// Mock the db module
vi.mock("./db", () => ({
  getAllPlugins: vi.fn().mockResolvedValue([
    { id: 1, slug: "service-catalog", name: "Service Catalog", description: "Service registry", icon: "BookOpen", category: "Core", version: "1.0.0", enabled: true, config: null, author: "Platform Team", createdAt: new Date(), updatedAt: new Date() },
    { id: 2, slug: "ai-assistant", name: "AI Assistant", description: "AI troubleshooting", icon: "Bot", category: "AI", version: "1.0.0", enabled: false, config: null, author: "Platform Team", createdAt: new Date(), updatedAt: new Date() },
  ]),
  getPluginBySlug: vi.fn().mockImplementation((slug: string) => {
    if (slug === "service-catalog") return Promise.resolve({ id: 1, slug: "service-catalog", name: "Service Catalog", enabled: true });
    return Promise.resolve(undefined);
  }),
  togglePlugin: vi.fn().mockResolvedValue(undefined),
  updatePluginConfig: vi.fn().mockResolvedValue(undefined),
  getAllServices: vi.fn().mockResolvedValue([
    { id: 1, name: "Auth Service", slug: "auth-svc", status: "healthy", tier: "critical", description: "Auth", owner: "Alice", team: "Identity", language: "TypeScript", framework: "Express", repoUrl: "", tags: [], createdAt: new Date(), updatedAt: new Date() },
    { id: 2, name: "Payment API", slug: "payment-api", status: "degraded", tier: "high", description: "Payments", owner: "Bob", team: "Payments", language: "Go", framework: "gRPC", repoUrl: "", tags: [], createdAt: new Date(), updatedAt: new Date() },
  ]),
  getServiceById: vi.fn().mockImplementation((id: number) => {
    if (id === 1) return Promise.resolve({ id: 1, name: "Auth Service", slug: "auth-svc", status: "healthy" });
    return Promise.resolve(undefined);
  }),
  createService: vi.fn().mockResolvedValue(undefined),
  updateServiceStatus: vi.fn().mockResolvedValue(undefined),
  getRecentDeployments: vi.fn().mockResolvedValue([
    { id: 1, serviceId: 1, version: "v1.0.0", environment: "production", status: "success", triggeredBy: "Alice", commitHash: "abc123", commitMessage: "fix: bug", duration: 45, logs: "Build OK", createdAt: new Date(), updatedAt: new Date() },
    { id: 2, serviceId: 2, version: "v2.0.0", environment: "staging", status: "failed", triggeredBy: "Bob", commitHash: "def456", commitMessage: "feat: new", duration: 30, logs: "Build FAILED", createdAt: new Date(), updatedAt: new Date() },
  ]),
  getDeploymentsByService: vi.fn().mockResolvedValue([]),
  getDeploymentById: vi.fn().mockResolvedValue({ id: 1, serviceId: 1, version: "v1.0.0", status: "success" }),
  getAllTemplates: vi.fn().mockResolvedValue([
    { id: 1, name: "React Starter", description: "React app", language: "TypeScript", framework: "React", category: "Frontend", features: ["TS", "Tailwind"], popularity: 100, createdAt: new Date() },
  ]),
  getDeploymentStats: vi.fn().mockResolvedValue({ total: 10, success: 7, failed: 3, avgDuration: 55 }),
  getUserSessions: vi.fn().mockResolvedValue([]),
  getSessionById: vi.fn().mockResolvedValue(null),
  createSession: vi.fn().mockResolvedValue(1),
  updateSessionMessages: vi.fn().mockResolvedValue(undefined),
  upsertUser: vi.fn().mockResolvedValue(undefined),
  getUserByOpenId: vi.fn().mockResolvedValue(undefined),
}));

describe("Plugin Management", () => {
  it("lists all plugins", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.plugins.list();
    expect(result).toHaveLength(2);
    expect(result[0].slug).toBe("service-catalog");
    expect(result[1].slug).toBe("ai-assistant");
  });

  it("gets a plugin by slug", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.plugins.getBySlug({ slug: "service-catalog" });
    expect(result).toBeDefined();
    expect(result?.name).toBe("Service Catalog");
  });

  it("returns undefined for unknown plugin slug", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.plugins.getBySlug({ slug: "nonexistent" });
    expect(result).toBeUndefined();
  });

  it("toggles a plugin (requires auth)", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    const result = await caller.plugins.toggle({ id: 1, enabled: false });
    expect(result).toEqual({ success: true });
  });

  it("rejects toggle without auth", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(caller.plugins.toggle({ id: 1, enabled: false })).rejects.toThrow();
  });
});

describe("Service Catalog", () => {
  it("lists all services", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.services.list();
    expect(result).toHaveLength(2);
    expect(result[0].name).toBe("Auth Service");
  });

  it("gets a service by id", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.services.getById({ id: 1 });
    expect(result).toBeDefined();
    expect(result?.name).toBe("Auth Service");
  });

  it("creates a service (requires auth)", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    const result = await caller.services.create({
      name: "New Service",
      slug: "new-svc",
      description: "A new service",
      tier: "medium",
    });
    expect(result).toEqual({ success: true });
  });

  it("updates service status (requires auth)", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    const result = await caller.services.updateStatus({ id: 1, status: "degraded" });
    expect(result).toEqual({ success: true });
  });
});

describe("Deployments", () => {
  it("lists recent deployments", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.deployments.recent({ limit: 10 });
    expect(result).toHaveLength(2);
    expect(result[0].status).toBe("success");
  });

  it("gets deployment by id", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.deployments.getById({ id: 1 });
    expect(result).toBeDefined();
    expect(result?.version).toBe("v1.0.0");
  });
});

describe("Onboarding Templates", () => {
  it("lists all templates", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.templates.list();
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("React Starter");
  });
});

describe("Metrics", () => {
  it("returns deployment stats", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.metrics.deploymentStats();
    expect(result.total).toBe(10);
    expect(result.success).toBe(7);
    expect(result.failed).toBe(3);
  });

  it("returns DORA metrics", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.metrics.doraMetrics();
    expect(result).toHaveProperty("deploymentFrequency");
    expect(result).toHaveProperty("leadTimeForChanges");
    expect(result).toHaveProperty("changeFailureRate");
    expect(result).toHaveProperty("timeToRestore");
    expect(result.deploymentFrequency.value).toBe(10);
    expect(result.changeFailureRate.value).toBe(30); // 3/10 * 100
  });

  it("returns SPACE metrics", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.metrics.spaceMetrics();
    expect(result).toHaveProperty("satisfaction");
    expect(result).toHaveProperty("performance");
    expect(result).toHaveProperty("activity");
    expect(result).toHaveProperty("communication");
    expect(result).toHaveProperty("efficiency");
    expect(result.satisfaction.score).toBe(4.2);
  });
});

describe("Auth", () => {
  it("returns null for unauthenticated user", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.auth.me();
    expect(result).toBeNull();
  });

  it("returns user for authenticated request", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    const result = await caller.auth.me();
    expect(result).toBeDefined();
    expect(result?.name).toBe("Test Developer");
  });
});
