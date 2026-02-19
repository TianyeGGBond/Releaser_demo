import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import {
  Activity, BookOpen, Bot, Rocket, BarChart3,
  CheckCircle2, XCircle, AlertTriangle, Clock, ArrowRight
} from "lucide-react";
import { useLocation } from "wouter";

const statusIcon = (status: string) => {
  switch (status) {
    case "success": return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
    case "failed": return <XCircle className="h-4 w-4 text-red-500" />;
    case "deploying": case "building": return <Clock className="h-4 w-4 text-amber-500 animate-pulse" />;
    default: return <Clock className="h-4 w-4 text-muted-foreground" />;
  }
};

const serviceStatusColor = (status: string) => {
  switch (status) {
    case "healthy": return "bg-emerald-500";
    case "degraded": return "bg-amber-500";
    case "down": return "bg-red-500";
    default: return "bg-muted-foreground";
  }
};

export default function Home() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { data: servicesList } = trpc.services.list.useQuery();
  const { data: deploymentsList } = trpc.deployments.recent.useQuery({ limit: 5 });
  const { data: stats } = trpc.metrics.deploymentStats.useQuery();

  const services = servicesList ?? [];
  const deployments = deploymentsList ?? [];

  const healthyCount = services.filter(s => s.status === "healthy").length;
  const degradedCount = services.filter(s => s.status === "degraded").length;
  const downCount = services.filter(s => s.status === "down").length;

  const quickActions = [
    { icon: BookOpen, label: "Service Catalog", desc: "Browse services", path: "/services", color: "text-blue-500" },
    { icon: Bot, label: "AI Assistant", desc: "Troubleshoot issues", path: "/ai-assistant", color: "text-violet-500" },
    { icon: Rocket, label: "New Project", desc: "Scaffold from template", path: "/onboarding", color: "text-emerald-500" },
    { icon: BarChart3, label: "Metrics", desc: "DORA & SPACE", path: "/metrics", color: "text-amber-500" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Welcome back, {user?.name?.split(" ")[0] || "Developer"}
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Here's what's happening across your platform
        </p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Total Services</span>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </div>
          <p className="text-2xl font-bold mt-2">{services.length}</p>
          <div className="flex items-center gap-2 mt-2 text-xs">
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-500" />{healthyCount} healthy</span>
            {degradedCount > 0 && <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-amber-500" />{degradedCount}</span>}
            {downCount > 0 && <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-red-500" />{downCount}</span>}
          </div>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Deployments</span>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </div>
          <p className="text-2xl font-bold mt-2">{Number(stats?.total ?? 0)}</p>
          <p className="text-xs text-muted-foreground mt-2">
            {Number(stats?.success ?? 0)} successful, {Number(stats?.failed ?? 0)} failed
          </p>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Success Rate</span>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </div>
          <p className="text-2xl font-bold mt-2">
            {Number(stats?.total) ? Math.round((Number(stats?.success ?? 0) / Number(stats?.total ?? 1)) * 100) : 0}%
          </p>
          <p className="text-xs text-muted-foreground mt-2">Change failure rate</p>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Avg Deploy Time</span>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </div>
          <p className="text-2xl font-bold mt-2">{Math.round(Number(stats?.avgDuration ?? 0))}s</p>
          <p className="text-xs text-muted-foreground mt-2">Lead time for changes</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Deployments */}
        <div className="lg:col-span-2 bg-card border rounded-lg">
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="font-semibold text-sm">Recent Deployments</h2>
            <button onClick={() => setLocation("/deployments")} className="text-xs text-primary hover:underline flex items-center gap-1">
              View all <ArrowRight className="h-3 w-3" />
            </button>
          </div>
          <div className="divide-y">
            {deployments.map(d => {
              const svc = services.find(s => s.id === d.serviceId);
              return (
                <div key={d.id} className="flex items-center gap-3 p-3 px-4 hover:bg-accent/50 transition-colors">
                  {statusIcon(d.status)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium truncate">{svc?.name || `Service #${d.serviceId}`}</span>
                      <span className="text-xs font-mono text-muted-foreground">{d.version}</span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{d.commitMessage}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      d.environment === "production" ? "bg-red-500/10 text-red-500" :
                      d.environment === "staging" ? "bg-amber-500/10 text-amber-500" :
                      "bg-blue-500/10 text-blue-500"
                    }`}>{d.environment}</span>
                    {d.duration && <p className="text-xs text-muted-foreground mt-1">{d.duration}s</p>}
                  </div>
                </div>
              );
            })}
            {deployments.length === 0 && (
              <div className="p-8 text-center text-sm text-muted-foreground">No deployments yet</div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-4">
          <h2 className="font-semibold text-sm">Quick Actions</h2>
          <div className="space-y-2">
            {quickActions.map(action => (
              <button
                key={action.path}
                onClick={() => setLocation(action.path)}
                className="w-full flex items-center gap-3 p-3 bg-card border rounded-lg hover:bg-accent/50 transition-colors text-left"
              >
                <div className={`h-9 w-9 rounded-md bg-accent flex items-center justify-center shrink-0`}>
                  <action.icon className={`h-4 w-4 ${action.color}`} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium">{action.label}</p>
                  <p className="text-xs text-muted-foreground">{action.desc}</p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground ml-auto shrink-0" />
              </button>
            ))}
          </div>

          {/* Service Health */}
          <div className="bg-card border rounded-lg p-4">
            <h3 className="font-semibold text-sm mb-3">Service Health</h3>
            <div className="space-y-2">
              {services.slice(0, 5).map(svc => (
                <div key={svc.id} className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${serviceStatusColor(svc.status)}`} />
                  <span className="text-xs truncate flex-1">{svc.name}</span>
                  <span className="text-xs text-muted-foreground capitalize">{svc.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
