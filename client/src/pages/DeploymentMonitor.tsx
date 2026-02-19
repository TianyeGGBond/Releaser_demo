import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  CheckCircle2, XCircle, Clock, Loader2, RotateCcw, GitCommit, User, ChevronDown, ChevronUp, Terminal
} from "lucide-react";

const statusConfig: Record<string, { icon: React.ReactNode; label: string; badge: string }> = {
  success: { icon: <CheckCircle2 className="h-4 w-4 text-emerald-500" />, label: "Success", badge: "bg-emerald-500/10 text-emerald-500" },
  failed: { icon: <XCircle className="h-4 w-4 text-red-500" />, label: "Failed", badge: "bg-red-500/10 text-red-500" },
  deploying: { icon: <Loader2 className="h-4 w-4 text-amber-500 animate-spin" />, label: "Deploying", badge: "bg-amber-500/10 text-amber-500" },
  building: { icon: <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />, label: "Building", badge: "bg-blue-500/10 text-blue-500" },
  pending: { icon: <Clock className="h-4 w-4 text-muted-foreground" />, label: "Pending", badge: "bg-muted text-muted-foreground" },
  rolled_back: { icon: <RotateCcw className="h-4 w-4 text-orange-500" />, label: "Rolled Back", badge: "bg-orange-500/10 text-orange-500" },
};

const envColors: Record<string, string> = {
  production: "bg-red-500/10 text-red-500",
  staging: "bg-amber-500/10 text-amber-500",
  development: "bg-blue-500/10 text-blue-500",
};

export default function DeploymentMonitor() {
  const { data: deploymentsList, isLoading } = trpc.deployments.recent.useQuery({ limit: 20 });
  const { data: servicesList } = trpc.services.list.useQuery();
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const deployments = deploymentsList ?? [];
  const services = servicesList ?? [];

  const getServiceName = (serviceId: number) => {
    return services.find(s => s.id === serviceId)?.name || `Service #${serviceId}`;
  };

  const formatTime = (date: Date | string) => {
    const d = new Date(date);
    const now = new Date();
    const diff = Math.floor((now.getTime() - d.getTime()) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return d.toLocaleDateString();
  };

  const activeCount = deployments.filter(d => d.status === "deploying" || d.status === "building").length;
  const failedCount = deployments.filter(d => d.status === "failed").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Deployment Monitor</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Real-time deployment status across all services
        </p>
      </div>

      {/* Summary */}
      <div className="flex gap-4">
        {activeCount > 0 && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 rounded-md border border-amber-500/20">
            <Loader2 className="h-3.5 w-3.5 text-amber-500 animate-spin" />
            <span className="text-xs font-medium text-amber-500">{activeCount} active</span>
          </div>
        )}
        {failedCount > 0 && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 rounded-md border border-red-500/20">
            <XCircle className="h-3.5 w-3.5 text-red-500" />
            <span className="text-xs font-medium text-red-500">{failedCount} failed</span>
          </div>
        )}
      </div>

      {/* Deployment List */}
      <div className="bg-card border rounded-lg divide-y">
        {isLoading ? (
          <div className="p-8 text-center">
            <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
          </div>
        ) : deployments.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">No deployments found</div>
        ) : (
          deployments.map(d => {
            const sc = statusConfig[d.status] || statusConfig.pending;
            const isExpanded = expandedId === d.id;
            return (
              <div key={d.id}>
                <button
                  onClick={() => setExpandedId(isExpanded ? null : d.id)}
                  className="w-full flex items-center gap-4 p-4 hover:bg-accent/30 transition-colors text-left"
                >
                  {sc.icon}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium">{getServiceName(d.serviceId)}</span>
                      <span className="text-xs font-mono text-muted-foreground">{d.version}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${envColors[d.environment]}`}>{d.environment}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      {d.commitHash && (
                        <span className="flex items-center gap-1">
                          <GitCommit className="h-3 w-3" />
                          <span className="font-mono">{d.commitHash.slice(0, 7)}</span>
                        </span>
                      )}
                      {d.triggeredBy && (
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" /> {d.triggeredBy}
                        </span>
                      )}
                      <span>{formatTime(d.createdAt)}</span>
                      {d.duration && <span>{d.duration}s</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${sc.badge}`}>{sc.label}</span>
                    {isExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                  </div>
                </button>
                {isExpanded && d.logs && (
                  <div className="px-4 pb-4">
                    <div className="bg-background rounded-lg border p-1">
                      <div className="flex items-center gap-2 px-3 py-1.5 border-b">
                        <Terminal className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-xs font-medium text-muted-foreground">Build Logs</span>
                      </div>
                      <ScrollArea className="h-48">
                        <pre className="p-3 text-xs font-mono text-muted-foreground leading-relaxed whitespace-pre-wrap">
                          {d.logs}
                        </pre>
                      </ScrollArea>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
