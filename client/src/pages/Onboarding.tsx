import { trpc } from "@/lib/trpc";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Rocket, Star, Download, Code, FileCode, Database, Globe, Puzzle } from "lucide-react";
import { toast } from "sonner";

const categoryIcons: Record<string, React.ReactNode> = {
  Frontend: <Globe className="h-5 w-5 text-blue-500" />,
  Backend: <Code className="h-5 w-5 text-emerald-500" />,
  Data: <Database className="h-5 w-5 text-violet-500" />,
  Extension: <Puzzle className="h-5 w-5 text-amber-500" />,
};

export default function Onboarding() {
  const { data: templatesList, isLoading } = trpc.templates.list.useQuery();
  const templates = templatesList ?? [];

  const handleScaffold = (name: string) => {
    toast.success(`Scaffolding "${name}"...`, {
      description: "Project template is being generated. This would trigger a CLI workflow in production.",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Rocket className="h-6 w-6 text-primary" />
          Onboarding Workflows
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Scaffold new projects from production-ready templates with CI/CD, testing, and best practices built in
        </p>
      </div>

      {/* Templates Grid */}
      {isLoading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3].map(i => (
            <div key={i} className="bg-card border rounded-lg p-5 animate-pulse">
              <div className="h-5 bg-muted rounded w-1/2 mb-3" />
              <div className="h-4 bg-muted rounded w-3/4 mb-4" />
              <div className="h-8 bg-muted rounded w-full" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map(tmpl => {
            const features = Array.isArray(tmpl.features) ? tmpl.features as string[] : [];
            return (
              <div key={tmpl.id} className="bg-card border rounded-lg p-5 flex flex-col hover:border-primary/30 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {categoryIcons[tmpl.category || "Backend"] || <FileCode className="h-5 w-5 text-muted-foreground" />}
                    <h3 className="font-semibold text-sm">{tmpl.name}</h3>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                    {tmpl.popularity}
                  </div>
                </div>

                <p className="text-xs text-muted-foreground mb-3 flex-1">{tmpl.description}</p>

                <div className="flex items-center gap-2 mb-4 text-xs">
                  <Badge variant="secondary" className="text-[10px]">{tmpl.language}</Badge>
                  <Badge variant="secondary" className="text-[10px]">{tmpl.framework}</Badge>
                </div>

                <div className="flex flex-wrap gap-1 mb-4">
                  {features.slice(0, 4).map(f => (
                    <span key={f} className="text-[10px] px-1.5 py-0.5 bg-accent rounded text-muted-foreground">{f}</span>
                  ))}
                  {features.length > 4 && (
                    <span className="text-[10px] px-1.5 py-0.5 text-muted-foreground">+{features.length - 4} more</span>
                  )}
                </div>

                <Button
                  size="sm"
                  variant="outline"
                  className="w-full text-xs"
                  onClick={() => handleScaffold(tmpl.name)}
                >
                  <Download className="h-3.5 w-3.5 mr-1.5" />
                  Scaffold Project
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
