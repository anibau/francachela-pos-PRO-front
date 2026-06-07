import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppLayout } from "./components/layout/AppLayout";
import { RouteValidator } from "./components/layout/RouteValidator";
import { POSProvider } from "./contexts/POSContext";
import { AuthProvider } from "./contexts/AuthContext";
import { useAuth } from "./hooks/useAuth";
import { LoadingState } from "./components/ui/state-views";

const Login = lazy(() => import("./pages/Login"));
const Landing = lazy(() => import("./pages/Landing"));
const Home = lazy(() => import("./pages/Home"));
const POS = lazy(() => import("./pages/POS"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Productos = lazy(() => import("./pages/Productos"));
const Clientes = lazy(() => import("./pages/Clientes"));
const Caja = lazy(() => import("./pages/Caja"));
const Gastos = lazy(() => import("./pages/Gastos"));
const Ventas = lazy(() => import("./pages/Ventas"));
const Promociones = lazy(() => import("./pages/Promociones"));
const Delivery = lazy(() => import("./pages/Delivery"));
const Puntos = lazy(() => import("./pages/Puntos"));
const VentasCortePage = lazy(() => import("./pages/VentasCorte"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

function PageLoader() {
  return <LoadingState message="Cargando módulo..." />;
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return <LoadingState message="Verificando autenticación..." />;
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function LayoutRoute({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <AppLayout>{children}</AppLayout>
    </ProtectedRoute>
  );
}

function POSRoute() {
  return (
    <ProtectedRoute>
      <POSProvider>
        <AppLayout>
          <POS />
        </AppLayout>
      </POSProvider>
    </ProtectedRoute>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <AuthProvider>
          <RouteValidator>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/login" element={<Login />} />
                <Route path="/landing" element={<Landing />} />
                <Route path="/home" element={<LayoutRoute><Home /></LayoutRoute>} />
                <Route path="/pos" element={<POSRoute />} />
                <Route path="/dashboard" element={<LayoutRoute><Dashboard /></LayoutRoute>} />
                <Route path="/productos" element={<LayoutRoute><Productos /></LayoutRoute>} />
                <Route path="/clientes" element={<LayoutRoute><Clientes /></LayoutRoute>} />
                <Route path="/ventas" element={<LayoutRoute><Ventas /></LayoutRoute>} />
                <Route path="/ventas-corte" element={<LayoutRoute><VentasCortePage /></LayoutRoute>} />
                <Route path="/promociones" element={<LayoutRoute><Promociones /></LayoutRoute>} />
                <Route path="/delivery" element={<LayoutRoute><Delivery /></LayoutRoute>} />
                <Route path="/puntos" element={<LayoutRoute><Puntos /></LayoutRoute>} />
                <Route path="/gastos" element={<LayoutRoute><Gastos /></LayoutRoute>} />
                <Route path="/caja" element={<LayoutRoute><Caja /></LayoutRoute>} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </RouteValidator>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
