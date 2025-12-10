import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route } from "react-router-dom";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ErrorFallback } from "@/components/ErrorFallback";
import { TussTablesService } from "@/lib/services/tuss-tables.service";
import { CBOService } from "@/lib/services/cbo.service";
import { useEffect } from "react";
import Index from "./pages/Index";
import Validar from "./pages/Validar";
import Dashboard from "./pages/Dashboard";
import Historico from "./pages/Historico";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Inicializar tabelas TUSS e CBO no carregamento do app
Promise.all([
  TussTablesService.initializeAll(),
  CBOService.initialize()
]).catch((error) => {
  console.error('Erro ao inicializar tabelas:', error);
});

const App = () => (
  <ErrorBoundary fallback={<ErrorFallback />}>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        {/* ADICIONE O BASENAME AQUI ABAIXO 👇 */}
        <HashRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/validar" element={<Validar />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/historico" element={<Historico />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </HashRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);




export default App;