import { trpc } from "@/lib/trpc";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Blocks, BookOpen, Bot, Rocket, BarChart3, Activity, Store, Settings, Loader2
} from "lucide-react";
import { toast } from "sonner";

const iconMap: Record<string, React.ReactNode> = {
  BookOpen: <BookOpen className="h-5 w-5" />,
  Bot: <Bot className="h-5 w-5" />,
  Rocket: <Rocket className="h-5 w-5" />,
  BarChart3: <BarChart3 className="h-5 w-5" />,
  Activity: <Activity className="h-5 w-5" />,
  Store: <Store className="h-5 w-5" />,
};

export default function PluginManager() {
  const { data: pluginsList, isLoading } = trpc.plugins.list.useQuery();
  const utils = trpc.useUtils();

  const toggleMutation = trpc.plugins.toggle.useMutation({
    onSuccess: () => {
      utils.plugins.list.invalidate();
    },
    onError: (error) => {
      toast.error(`Failed to toggle plugin: ${error.message}`);
    },
  });

  const plugins = pluginsList ?? [];

  const handleToggle = (id: number, currentEnabled: boolean, name: string) => {
    toggleMutation.mutate({ id, enabled: !currentEnabled });
    toast.success(`${name} ${currentEnabled ? "disabled" : "enabled"}`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Blocks className="h-6 w-6 text-primary" />
          Plugin Manager
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Enable, disable, and configure platform plugins. Changes take effect immediately.
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="space-y-3">
          {plugins.map(plugin => (
            <div
              key={plugin.id}
              className={`bg-card border rounded-lg p-5 flex items-center gap-4 transition-colors ${
                plugin.enabled ? "border-border" : "border-border opacity-60"
              }`}
            >
              <div className={`h-11 w-11 rounded-lg flex items-center justify-center shrink-0 ${
                plugin.enabled ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
              }`}>
                {iconMap[plugin.icon || "Blocks"] || <Blocks className="h-5 w-5" />}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <h3 className="font-semibold text-sm">{plugin.name}</h3>
                  <Badge variant="secondary" className="text-[10px]">v{plugin.version}</Badge>
                  <Badge variant="outline" className="text-[10px]">{plugin.category}</Badge>
                </div>
                <p className="text-xs text-muted-foreground truncate">{plugin.description}</p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <span className="text-xs text-muted-foreground">{plugin.author}</span>
                <Switch
                  checked={plugin.enabled}
                  onCheckedChange={() => handleToggle(plugin.id, plugin.enabled, plugin.name)}
                  disabled={toggleMutation.isPending}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="bg-accent/50 border border-dashed rounded-lg p-6 text-center">
        <Settings className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">
          Plugin configuration and advanced settings are available per-plugin.
          <br />
          Toggle plugins to show or hide them from the sidebar navigation.
        </p>
      </div>
    </div>
  );
}
