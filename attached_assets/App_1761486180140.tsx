import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import ToolPage from "./pages/ToolPage";
import ResultPage from "./pages/ResultPage";
import NotFound from "./pages/NotFound";
import OilPaintingPage from "./pages/styles/OilPaintingPage";
import AcrylicPaintingPage from "./pages/styles/AcrylicPaintingPage";
import PencilSketchPage from "./pages/styles/PencilSketchPage";
import WatercolorPage from "./pages/styles/WatercolorPage";
import CharcoalPage from "./pages/styles/CharcoalPage";
import PastelPage from "./pages/styles/PastelPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/tool/:toolId" element={<ToolPage />} />
          <Route path="/result" element={<ResultPage />} />
          <Route path="/styles/oil-painting" element={<OilPaintingPage />} />
          <Route path="/styles/acrylic-painting" element={<AcrylicPaintingPage />} />
          <Route path="/styles/pencil-sketch" element={<PencilSketchPage />} />
          <Route path="/styles/watercolor" element={<WatercolorPage />} />
          <Route path="/styles/charcoal" element={<CharcoalPage />} />
          <Route path="/styles/pastel" element={<PastelPage />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
