import { trpc } from "@/lib/trpc";
import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Search, ExternalLink, GitBranch, Users, Shield, AlertTriangle, XCircle, HelpCircle, Filter
} from "lucide-react";

const statusConfig: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
  healthy: { color: "bg-emerald-500", icon: <Shield className="h-3.5 w-3.5 text-emerald-500" />, label: "Healthy" },
  degraded: { color: "bg-amber-500", icon: <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />, label: "Degraded" },
  down: { color: "bg-red-500", icon: <XCircle className="h-3.5 w-3.5 text-red-500" />, label: "Down" },
  unknown: { color: "bg-muted-foreground", icon: <HelpCircle className="h-3.5 w-3.5 text-muted-foreground" />, label: "Unknown" },
};

const tierColors: Record<string, string> = {
  critical: "bg-red-500/10 text-red-500 border-red-500/20",
  high: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  medium: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  low: "bg-muted text-muted-foreground border-border",
};

export default function ServiceCatalog() {
  const { data: servicesList, isLoading } = trpc.services.list.useQuery();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const services = servicesList ?? [];

  const filtered = useMemo(() => {
    return services.filter(s => {
      const matchesSearch = !search || s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.team?.toLowerCase().includes(search.toLowerCase()) ||
        s.language?.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "all" || s.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [services, search, statusFilter]);

  const statuses = ["all", "healthy", "degraded", "down", "unknown"];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Service Catalog</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {services.length} services registered across your organization
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search services, teams, languages..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-1.5">
          {statuses.map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 text-xs rounded-md border transition-colors capitalize ${
                statusFilter === s
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card text-muted-foreground border-border hover:bg-accent"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Services Grid */}
      {isLoading ? (
        <div className="grid md:grid-cols-2 gap-4">
          {[1,2,3,4].map(i => (
            <div key={i} className="bg-card border rounded-lg p-5 animate-pulse">
              <div className="h-5 bg-muted rounded w-1/3 mb-3" />
              <div className="h-4 bg-muted rounded w-2/3 mb-4" />
              <div className="h-3 bg-muted rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {filtered.map(svc => {
            const sc = statusConfig[svc.status] || statusConfig.unknown;
            const tags = Array.isArray(svc.tags) ? svc.tags as string[] : [];
            return (
              <div key={svc.id} className="bg-card border rounded-lg p-5 hover:border-primary/30 transition-colors group">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`h-2.5 w-2.5 rounded-full ${sc.color}`} />
                    <h3 className="font-semibold text-sm">{svc.name}</h3>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium uppercase tracking-wider ${tierColors[svc.tier]}`}>
                    {svc.tier}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mb-4 line-clamp-2">{svc.description}</p>

                <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                  <span className="flex items-center gap-1">
                    <Users className="h-3 w-3" /> {svc.team}
                  </span>
                  <span className="flex items-center gap-1">
                    <GitBranch className="h-3 w-3" /> {svc.language}
                  </span>
                  {svc.framework && <span>{svc.framework}</span>}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex gap-1.5 flex-wrap">
                    {tags.slice(0, 3).map(tag => (
                      <Badge key={tag} variant="secondary" className="text-[10px] px-1.5 py-0">{tag}</Badge>
                    ))}
                  </div>
                  {svc.repoUrl && (
                    <a
                      href={svc.repoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-primary transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
      {!isLoading && filtered.length === 0 && (
        <div className="text-center py-12 text-muted-foreground text-sm">
          No services match your filters
        </div>
      )}
    </div>
  );
}
