import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { invokeLLM } from "./_core/llm";
import * as db from "./db";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // ── Plugin Management ──
  plugins: router({
    list: publicProcedure.query(async () => {
      return db.getAllPlugins();
    }),
    toggle: publicProcedure
      .input(z.object({ id: z.number(), enabled: z.boolean() }))
      .mutation(async ({ input }) => {
        await db.togglePlugin(input.id, input.enabled);
        return { success: true };
      }),
    updateConfig: publicProcedure
      .input(z.object({ id: z.number(), config: z.any() }))
      .mutation(async ({ input }) => {
        await db.updatePluginConfig(input.id, input.config);
        return { success: true };
      }),
    getBySlug: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(async ({ input }) => {
        return db.getPluginBySlug(input.slug);
      }),
  }),

  // ── Service Catalog ──
  services: router({
    list: publicProcedure.query(async () => {
      return db.getAllServices();
    }),
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return db.getServiceById(input.id);
      }),
    create: publicProcedure
      .input(z.object({
        name: z.string(),
        slug: z.string(),
        description: z.string().optional(),
        owner: z.string().optional(),
        team: z.string().optional(),
        language: z.string().optional(),
        framework: z.string().optional(),
        repoUrl: z.string().optional(),
        tier: z.enum(["critical", "high", "medium", "low"]).optional(),
      }))
      .mutation(async ({ input }) => {
        await db.createService(input);
        return { success: true };
      }),
    updateStatus: publicProcedure
      .input(z.object({ id: z.number(), status: z.enum(["healthy", "degraded", "down", "unknown"]) }))
      .mutation(async ({ input }) => {
        await db.updateServiceStatus(input.id, input.status);
        return { success: true };
      }),
  }),

  // ── Deployments ──
  deployments: router({
    recent: publicProcedure
      .input(z.object({ limit: z.number().optional() }).optional())
      .query(async ({ input }) => {
        return db.getRecentDeployments(input?.limit ?? 20);
      }),
    byService: publicProcedure
      .input(z.object({ serviceId: z.number() }))
      .query(async ({ input }) => {
        return db.getDeploymentsByService(input.serviceId);
      }),
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return db.getDeploymentById(input.id);
      }),
  }),

  // ── Onboarding Templates ──
  templates: router({
    list: publicProcedure.query(async () => {
      return db.getAllTemplates();
    }),
  }),

  // ── Metrics ──
  metrics: router({
    deploymentStats: publicProcedure.query(async () => {
      return db.getDeploymentStats();
    }),
    doraMetrics: publicProcedure.query(async () => {
      // Computed DORA metrics from deployment data
      const stats = await db.getDeploymentStats();
      const total = Number(stats.total) || 1;
      const success = Number(stats.success) || 0;
      const failed = Number(stats.failed) || 0;
      return {
        deploymentFrequency: { value: total, unit: "per week", rating: total >= 7 ? "Elite" : total >= 1 ? "High" : "Low" },
        leadTimeForChanges: { value: Math.round(Number(stats.avgDuration) || 60), unit: "seconds", rating: (Number(stats.avgDuration) || 60) < 60 ? "Elite" : "High" },
        changeFailureRate: { value: Math.round((failed / total) * 100), unit: "%", rating: (failed / total) < 0.15 ? "Elite" : "Medium" },
        timeToRestore: { value: 15, unit: "minutes", rating: "High" },
      };
    }),
    spaceMetrics: publicProcedure.query(async () => {
      return {
        satisfaction: { score: 4.2, max: 5, trend: "up" },
        performance: { score: 87, max: 100, trend: "up" },
        activity: { score: 156, label: "PRs merged this week", trend: "stable" },
        communication: { score: 92, max: 100, trend: "up" },
        efficiency: { score: 78, max: 100, trend: "down" },
      };
    }),
  }),

  // ── AI Assistant ──
  ai: router({
    chat: publicProcedure
      .input(z.object({
        messages: z.array(z.object({
          role: z.enum(["system", "user", "assistant"]),
          content: z.string(),
        })),
        sessionId: z.number().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const systemPrompt = `You are an AI DevOps assistant integrated into an Internal Developer Platform. You specialize in:
1. Analyzing deployment logs and identifying root causes of failures
2. Suggesting fixes for build errors, test failures, and deployment issues
3. Explaining error messages in plain language
4. Recommending best practices for CI/CD pipelines
5. Helping with Kubernetes, Docker, and cloud infrastructure issues

When analyzing logs, be specific about:
- The exact error and its location
- The root cause
- Step-by-step fix instructions
- Prevention strategies

Format your responses with clear headings and code blocks where appropriate.`;

        const llmMessages = [
          { role: "system" as const, content: systemPrompt },
          ...input.messages.filter(m => m.role !== "system"),
        ];

        const response = await invokeLLM({ messages: llmMessages });
        const assistantMessage = response.choices[0]?.message?.content || "I couldn't generate a response. Please try again.";
        const contentStr = typeof assistantMessage === "string" ? assistantMessage : JSON.stringify(assistantMessage);

        // Save to session (only when user is authenticated)
        const allMessages = [...input.messages, { role: "assistant" as const, content: contentStr }];
        if (ctx.user) {
          if (input.sessionId) {
            await db.updateSessionMessages(input.sessionId, allMessages);
          } else {
            const title = input.messages.find(m => m.role === "user")?.content?.slice(0, 100) || "New Chat";
            await db.createSession({
              userId: ctx.user.id,
              title,
              messages: allMessages as any,
            });
          }
        }

        return { content: contentStr };
      }),
    sessions: publicProcedure.query(async ({ ctx }) => {
      if (!ctx.user) return [];
      return db.getUserSessions(ctx.user.id);
    }),
    getSession: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return db.getSessionById(input.id);
      }),
  }),
});

export type AppRouter = typeof appRouter;
