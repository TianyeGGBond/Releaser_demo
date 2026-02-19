import { trpc } from "@/lib/trpc";
import { BarChart3, TrendingUp, TrendingDown, Minus, Zap, Clock, AlertTriangle, RotateCcw, Smile, Target, Keyboard, MessageCircle, Timer } from "lucide-react";
import { Progress } from "@/components/ui/progress";

const trendIcon = (trend: string) => {
  if (trend === "up") return <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />;
  if (trend === "down") return <TrendingDown className="h-3.5 w-3.5 text-red-500" />;
  return <Minus className="h-3.5 w-3.5 text-muted-foreground" />;
};

const ratingColor = (rating: string) => {
  switch (rating) {
    case "Elite": return "text-emerald-500 bg-emerald-500/10";
    case "High": return "text-blue-500 bg-blue-500/10";
    case "Medium": return "text-amber-500 bg-amber-500/10";
    default: return "text-red-500 bg-red-500/10";
  }
};

const doraIcons: Record<string, React.ReactNode> = {
  deploymentFrequency: <Zap className="h-5 w-5 text-blue-500" />,
  leadTimeForChanges: <Clock className="h-5 w-5 text-violet-500" />,
  changeFailureRate: <AlertTriangle className="h-5 w-5 text-amber-500" />,
  timeToRestore: <RotateCcw className="h-5 w-5 text-emerald-500" />,
};

const doraLabels: Record<string, string> = {
  deploymentFrequency: "Deployment Frequency",
  leadTimeForChanges: "Lead Time for Changes",
  changeFailureRate: "Change Failure Rate",
  timeToRestore: "Time to Restore",
};

const spaceIcons: Record<string, React.ReactNode> = {
  satisfaction: <Smile className="h-5 w-5 text-amber-500" />,
  performance: <Target className="h-5 w-5 text-emerald-500" />,
  activity: <Keyboard className="h-5 w-5 text-blue-500" />,
  communication: <MessageCircle className="h-5 w-5 text-violet-500" />,
  efficiency: <Timer className="h-5 w-5 text-red-500" />,
};

const spaceLabels: Record<string, string> = {
  satisfaction: "Satisfaction & Well-being",
  performance: "Performance (Outcomes)",
  activity: "Activity (Volume)",
  communication: "Communication & Collaboration",
  efficiency: "Efficiency & Flow",
};

export default function Metrics() {
  const { data: dora, isLoading: doraLoading } = trpc.metrics.doraMetrics.useQuery();
  const { data: space, isLoading: spaceLoading } = trpc.metrics.spaceMetrics.useQuery();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-primary" />
          Developer Productivity Metrics
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          DORA and SPACE framework metrics for measuring engineering effectiveness
        </p>
      </div>

      {/* DORA Metrics */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-lg font-semibold">DORA Metrics</h2>
          <span className="text-xs text-muted-foreground px-2 py-0.5 bg-accent rounded">Google Cloud Research</span>
        </div>
        {doraLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1,2,3,4].map(i => (
              <div key={i} className="bg-card border rounded-lg p-5 animate-pulse">
                <div className="h-5 bg-muted rounded w-1/2 mb-3" />
                <div className="h-8 bg-muted rounded w-1/3 mb-2" />
                <div className="h-4 bg-muted rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : dora ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(dora).map(([key, metric]) => (
              <div key={key} className="bg-card border rounded-lg p-5">
                <div className="flex items-center gap-2 mb-3">
                  {doraIcons[key]}
                  <span className="text-xs text-muted-foreground font-medium">{doraLabels[key]}</span>
                </div>
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-3xl font-bold">{metric.value}</span>
                  <span className="text-xs text-muted-foreground">{metric.unit}</span>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${ratingColor(metric.rating)}`}>
                  {metric.rating} Performer
                </span>
              </div>
            ))}
          </div>
        ) : null}
      </div>

      {/* SPACE Metrics */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-lg font-semibold">SPACE Framework</h2>
          <span className="text-xs text-muted-foreground px-2 py-0.5 bg-accent rounded">Microsoft Research</span>
        </div>
        {spaceLoading ? (
          <div className="grid md:grid-cols-2 gap-4">
            {[1,2,3,4,5].map(i => (
              <div key={i} className="bg-card border rounded-lg p-5 animate-pulse">
                <div className="h-5 bg-muted rounded w-1/2 mb-3" />
                <div className="h-4 bg-muted rounded w-full" />
              </div>
            ))}
          </div>
        ) : space ? (
          <div className="grid md:grid-cols-2 gap-4">
            {Object.entries(space).map(([key, metric]) => {
              const m = metric as { score: number; max?: number; label?: string; trend: string };
              const percentage = m.max ? (m.score / m.max) * 100 : undefined;
              return (
                <div key={key} className="bg-card border rounded-lg p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {spaceIcons[key]}
                      <span className="text-sm font-medium">{spaceLabels[key]}</span>
                    </div>
                    {trendIcon(m.trend)}
                  </div>
                  {percentage !== undefined ? (
                    <div className="space-y-2">
                      <div className="flex items-baseline justify-between">
                        <span className="text-2xl font-bold">{m.score}</span>
                        <span className="text-xs text-muted-foreground">/ {m.max}</span>
                      </div>
                      <Progress value={percentage} className="h-2" />
                    </div>
                  ) : (
                    <div>
                      <span className="text-2xl font-bold">{m.score}</span>
                      <span className="text-xs text-muted-foreground ml-2">{m.label}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : null}
      </div>
    </div>
  );
}
