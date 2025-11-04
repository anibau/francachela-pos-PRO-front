import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "./components/layout/AppLayout";
import { POSProvider } from "./contexts/POSContext";
import Landing from "./pages/Landing";
import Home from "./pages/Home";
import POS from "./pages/POS";
import Dashboard from "./pages/Dashboard";
import Productos from "./pages/Productos";
import Clientes from "./pages/Clientes";
import Ventas from "./pages/Ventas";
import Promociones from "./pages/Promociones";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <POSProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/home" element={<AppLayout><Home /></AppLayout>} />
            <Route path="/pos" element={<AppLayout><POS /></AppLayout>} />
            <Route path="/dashboard" element={<AppLayout><Dashboard /></AppLayout>} />
            <Route path="/productos" element={<AppLayout><Productos /></AppLayout>} />
            <Route path="/clientes" element={<AppLayout><Clientes /></AppLayout>} />
            <Route path="/ventas" element={<AppLayout><Ventas /></AppLayout>} />
            <Route path="/promociones" element={<AppLayout><Promociones /></AppLayout>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </POSProvider>
  </QueryClientProvider>
);

export default App;
