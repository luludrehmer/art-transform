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
import StyleLandingPage from "@/pages/style-landing";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/tools/convert-photo-to-painting-online-free" component={Dashboard} />
      <Route path="/tools/convert-photo-to-oil-painting-online-free">
        {() => <StyleLandingPage style="oil" />}
      </Route>
      <Route path="/tools/photo-to-watercolor-painting-converter">
        {() => <StyleLandingPage style="watercolor" />}
      </Route>
      <Route path="/tools/photo-to-pencil-sketch-converter">
        {() => <StyleLandingPage style="sketch" />}
      </Route>
      <Route path="/tools/photo-to-acrylic-painting-converter">
        {() => <StyleLandingPage style="acrylic" />}
      </Route>
      <Route path="/tools/photo-to-charcoal-drawing-converter">
        {() => <StyleLandingPage style="charcoal" />}
      </Route>
      <Route path="/tools/photo-to-pastel-art-converter">
        {() => <StyleLandingPage style="pastel" />}
      </Route>
      <Route path="/result" component={Result} />
      {/* Legacy route redirect */}
      <Route path="/dashboard">
        {() => { window.location.href = "/tools/convert-photo-to-painting-online-free"; return null; }}
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
