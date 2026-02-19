import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import DashboardLayout from "./components/DashboardLayout";
import Home from "./pages/Home";
import ServiceCatalog from "./pages/ServiceCatalog";
import DeploymentMonitor from "./pages/DeploymentMonitor";
import AIAssistant from "./pages/AIAssistant";
import Onboarding from "./pages/Onboarding";
import Metrics from "./pages/Metrics";
import Marketplace from "./pages/Marketplace";
import PluginManager from "./pages/PluginManager";

function Router() {
  return (
    <DashboardLayout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/services" component={ServiceCatalog} />
        <Route path="/deployments" component={DeploymentMonitor} />
        <Route path="/ai-assistant" component={AIAssistant} />
        <Route path="/onboarding" component={Onboarding} />
        <Route path="/metrics" component={Metrics} />
        <Route path="/marketplace" component={Marketplace} />
        <Route path="/plugins" component={PluginManager} />
        <Route component={NotFound} />
      </Switch>
    </DashboardLayout>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
