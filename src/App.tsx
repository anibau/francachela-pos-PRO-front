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
import Login from "./pages/Login";
import Landing from "./pages/Landing";
import Home from "./pages/Home";
import POS from "./pages/POS";
import Dashboard from "./pages/Dashboard";
import Productos from "./pages/Productos";
import Clientes from "./pages/Clientes";
import Ventas from "./pages/Ventas";
import Promociones from "./pages/Promociones";
import Inventario from "./pages/Inventario";
import Gastos from "./pages/Gastos";
import Caja from "./pages/Caja";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

/**
 * ProtectedRoute - Componente que protege rutas que requieren autenticación
 * 
 * Características:
 * - Verifica si hay usuario autenticado
 * - Valida que el token no esté expirado
 * - Muestra pantalla de carga mientras se verifica autenticación
 * - Redirige a login si no está autenticado
 */
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    console.warn('[App] Usuario no autenticado - redirigiendo a login');
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <AuthProvider>
          <RouteValidator>
            <POSProvider>
              <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/login" element={<Login />} />
                <Route path="/landing" element={<Landing />} />
                <Route
                  path="/home"
                  element={
                    <ProtectedRoute>
                      <AppLayout>
                        <Home />
                      </AppLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/pos"
                  element={
                    <ProtectedRoute>
                      <AppLayout>
                        <POS />
                      </AppLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <AppLayout>
                        <Dashboard />
                      </AppLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/productos"
                  element={
                    <ProtectedRoute>
                      <AppLayout>
                        <Productos />
                      </AppLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/clientes"
                  element={
                    <ProtectedRoute>
                      <AppLayout>
                        <Clientes />
                      </AppLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/ventas"
                  element={
                    <ProtectedRoute>
                      <AppLayout>
                        <Ventas />
                      </AppLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/promociones"
                  element={
                    <ProtectedRoute>
                      <AppLayout>
                        <Promociones />
                      </AppLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/inventario"
                  element={
                    <ProtectedRoute>
                      <AppLayout>
                        <Inventario />
                      </AppLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/gastos"
                  element={
                    <ProtectedRoute>
                      <AppLayout>
                        <Gastos />
                      </AppLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/caja"
                  element={
                    <ProtectedRoute>
                      <AppLayout>
                        <Caja />
                      </AppLayout>
                    </ProtectedRoute>
                  }
                />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </POSProvider>
          </RouteValidator>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
