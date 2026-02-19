import { trpc } from "@/lib/trpc";
import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Store, Search, Check, Download, BookOpen, Bot, Rocket, BarChart3, Activity, Blocks,
  Shield, GitBranch, Bell, Webhook, TestTube, FileSearch
} from "lucide-react";
import { toast } from "sonner";

// Marketplace includes both installed plugins and "available" ones
const marketplaceExtras = [
  { slug: "security-scanner", name: "Security Scanner", description: "Automated vulnerability scanning and dependency audit for all services.", icon: "Shield", category: "Security", version: "1.0.0", author: "Security Team", installed: false },
  { slug: "git-insights", name: "Git Insights", description: "Advanced Git analytics with PR cycle time, review bottlenecks, and contributor graphs.", icon: "GitBranch", category: "Analytics", version: "0.9.0", author: "Community", installed: false },
  { slug: "incident-alerts", name: "Incident Alerts", description: "PagerDuty and Slack integration for automated incident response workflows.", icon: "Bell", category: "Operations", version: "2.1.0", author: "SRE Team", installed: false },
  { slug: "webhook-manager", name: "Webhook Manager", description: "Centralized webhook configuration and delivery monitoring across services.", icon: "Webhook", category: "Integration", version: "1.2.0", author: "Platform Team", installed: false },
  { slug: "test-coverage", name: "Test Coverage", description: "Aggregate test coverage reports across all repositories with trend analysis.", icon: "TestTube", category: "Quality", version: "1.0.0", author: "QA Team", installed: false },
  { slug: "api-docs", name: "API Documentation", description: "Auto-generated API documentation hub with interactive playground and versioning.", icon: "FileSearch", category: "Developer Experience", version: "1.5.0", author: "Platform Team", installed: false },
];

const iconMap: Record<string, React.ReactNode> = {
  BookOpen: <BookOpen className="h-5 w-5" />,
  Bot: <Bot className="h-5 w-5" />,
  Rocket: <Rocket className="h-5 w-5" />,
  BarChart3: <BarChart3 className="h-5 w-5" />,
  Activity: <Activity className="h-5 w-5" />,
  Store: <Store className="h-5 w-5" />,
  Shield: <Shield className="h-5 w-5" />,
  GitBranch: <GitBranch className="h-5 w-5" />,
  Bell: <Bell className="h-5 w-5" />,
  Webhook: <Webhook className="h-5 w-5" />,
  TestTube: <TestTube className="h-5 w-5" />,
  FileSearch: <FileSearch className="h-5 w-5" />,
  Blocks: <Blocks className="h-5 w-5" />,
};

export default function Marketplace() {
  const { data: pluginsList } = trpc.plugins.list.useQuery();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const installedPlugins = (pluginsList ?? []).map(p => ({
    ...p,
    installed: true,
  }));

  const allPlugins = [...installedPlugins, ...marketplaceExtras];

  const categories = useMemo(() => {
    const cats = new Set(allPlugins.map(p => p.category).filter((c): c is string => c !== null && c !== undefined));
    return ["all", ...Array.from(cats)];
  }, [allPlugins]);

  const filtered = useMemo(() => {
    return allPlugins.filter(p => {
      const matchesSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.description?.toLowerCase().includes(search.toLowerCase());
      const matchesCat = categoryFilter === "all" || p.category === categoryFilter;
      return matchesSearch && matchesCat;
    });
  }, [allPlugins, search, categoryFilter]);

  const handleInstall = (name: string) => {
    toast.success(`Installing "${name}"...`, {
      description: "Plugin would be downloaded and registered in production.",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Store className="h-6 w-6 text-primary" />
          Plugin Marketplace
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Discover and install plugins to extend your developer platform
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search plugins..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {categories.map(c => (
            <button
              key={c}
              onClick={() => setCategoryFilter(c)}
              className={`px-3 py-1.5 text-xs rounded-md border transition-colors capitalize ${
                categoryFilter === c
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card text-muted-foreground border-border hover:bg-accent"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Plugins Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(plugin => (
          <div key={plugin.slug} className="bg-card border rounded-lg p-5 flex flex-col hover:border-primary/30 transition-colors">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-accent flex items-center justify-center text-primary shrink-0">
                  {iconMap[plugin.icon || "Blocks"] || <Blocks className="h-5 w-5" />}
                </div>
                <div>
                  <h3 className="font-semibold text-sm">{plugin.name}</h3>
                  <span className="text-[10px] text-muted-foreground">v{plugin.version} by {plugin.author}</span>
                </div>
              </div>
            </div>

            <p className="text-xs text-muted-foreground mb-4 flex-1">{plugin.description}</p>

            <div className="flex items-center justify-between">
              <Badge variant="secondary" className="text-[10px]">{plugin.category}</Badge>
              {plugin.installed ? (
                <span className="flex items-center gap-1 text-xs text-emerald-500">
                  <Check className="h-3.5 w-3.5" /> Installed
                </span>
              ) : (
                <Button size="sm" variant="outline" className="text-xs h-7" onClick={() => handleInstall(plugin.name)}>
                  <Download className="h-3 w-3 mr-1" /> Install
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
