import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { TransformationProvider } from "@/lib/transformation-context";
import { Header } from "@/components/header";
import Home from "@/pages/home";
import Dashboard from "@/pages/dashboard";
import Result from "@/pages/result";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/result" component={Result} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <TransformationProvider>
          <div className="min-h-screen flex flex-col">
            <Header />
            <Router />
          </div>
          <Toaster />
        </TransformationProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
