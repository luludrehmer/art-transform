import { useState } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { TransformationProvider } from "@/lib/transformation-context";
import { CategoryProvider } from "@/lib/category-context";
import { Header } from "@/components/header";
import { AnnouncementBar } from "@/components/announcement-bar";
import { NavigationDrawer } from "@/components/navigation-drawer";
import Home from "@/pages/home";
import Dashboard from "@/pages/dashboard";
import Result from "@/pages/result";
import About from "@/pages/about";
import Support from "@/pages/support";
import Privacy from "@/pages/privacy";
import Terms from "@/pages/terms";
import Refunds from "@/pages/refunds";
import SignIn from "@/pages/signin";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/pets/:style/:mood" component={Home} />
      <Route path="/pets/:style" component={Home} />
      <Route path="/pets" component={Home} />
      <Route path="/family/:style/:mood" component={Home} />
      <Route path="/family/:style" component={Home} />
      <Route path="/family" component={Home} />
      <Route path="/kids/:style/:mood" component={Home} />
      <Route path="/kids/:style" component={Home} />
      <Route path="/kids" component={Home} />
      <Route path="/couples/:style/:mood" component={Home} />
      <Route path="/couples/:style" component={Home} />
      <Route path="/couples" component={Home} />
      <Route path="/self-portrait/:style/:mood" component={Home} />
      <Route path="/self-portrait/:style" component={Home} />
      <Route path="/self-portrait" component={Home} />
      <Route path="/about" component={About} />
      <Route path="/support" component={Support} />
      <Route path="/privacy" component={Privacy} />
      <Route path="/terms" component={Terms} />
      <Route path="/refunds" component={Refunds} />
      <Route path="/signin" component={SignIn} />
      <Route path="/tools/dashboard" component={Dashboard} />
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
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <CategoryProvider>
          <TransformationProvider>
            <div
              className="min-h-screen flex flex-col"
              style={{
                backgroundImage: "url('/bg-clouds.png')",
                backgroundSize: "cover",
                backgroundPosition: "center top",
                backgroundRepeat: "no-repeat",
                backgroundAttachment: "fixed",
              }}
            >
              <AnnouncementBar />
              <Header onMenuClick={() => setDrawerOpen(true)} />
              <main className="flex-1 w-full max-w-5xl mx-auto px-4">
                <Router />
              </main>
            </div>
            <NavigationDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} />
            <Toaster />
          </TransformationProvider>
        </CategoryProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
