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
import OilPaintingPage from "@/pages/tools/oil-painting";
import AcrylicPage from "@/pages/tools/acrylic";
import PencilSketchPage from "@/pages/tools/pencil-sketch";
import WatercolorPage from "@/pages/tools/watercolor";
import CharcoalPage from "@/pages/tools/charcoal";
import PastelPage from "@/pages/tools/pastel";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/tools/dashboard" component={Dashboard} />
      <Route path="/tools/photo-to-oil-painting-converter" component={OilPaintingPage} />
      <Route path="/tools/photo-to-acrylic-painting-converter" component={AcrylicPage} />
      <Route path="/tools/photo-to-pencil-sketch-converter" component={PencilSketchPage} />
      <Route path="/tools/photo-to-watercolor-painting-converter" component={WatercolorPage} />
      <Route path="/tools/photo-to-charcoal-drawing-converter" component={CharcoalPage} />
      <Route path="/tools/photo-to-pastel-painting-converter" component={PastelPage} />
      <Route path="/result" component={Result} />
      {/* Legacy redirects */}
      <Route path="/tools/convert-photo-to-painting-online-free">
        {() => { window.location.href = "/tools/dashboard"; return null; }}
      </Route>
      <Route path="/dashboard">
        {() => { window.location.href = "/tools/dashboard"; return null; }}
      </Route>
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
