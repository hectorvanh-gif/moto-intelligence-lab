import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NewsArticlePage from "./pages/NewsArticlePage";
import NewsArchivePage from "./pages/NewsArchivePage";
import NotFound from "./pages/NotFound";
import HubPage from "./pages/HubPage";
import Nosotros from "./pages/Nosotros";
import CalendarioMotoGP from "./pages/CalendarioMotoGP";
import Analytics from "./components/Analytics";
import ScrollToTop from "./components/ScrollToTop";
import { HUBS } from "@/lib/hubs";

const queryClient = new QueryClient();

const App = () => (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
          <Analytics />
          <Routes>
            <Route path="/" element={<Index />} />
            {HUBS.map((hub) => (
              <Route
                key={hub.slug}
                path={`/${hub.slug}`}
                element={<HubPage slug={hub.slug} />}
              />
            ))}
            <Route path="/noticias" element={<NewsArchivePage />} />
            <Route path="/categoria/:slug" element={<NewsArchivePage />} />
            <Route path="/noticias/:id" element={<NewsArticlePage />} />
            <Route path="/nosotros" element={<Nosotros />} />
            <Route path="/calendario-motogp" element={<CalendarioMotoGP />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
);

export default App;
