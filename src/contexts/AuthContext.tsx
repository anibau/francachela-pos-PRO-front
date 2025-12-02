import React, { createContext, useState, useEffect, useCallback } from 'react';
import { authService } from '@/services/authService';

export type UserRole = 'ADMIN' | 'SUPERVISOR' | 'CAJERO';

export interface User {
  id: number;
  username: string;
  role: UserRole;
  nombre: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  hasPermission: (requiredRole: UserRole[]) => boolean;
  recoverSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export { AuthContext };

/**
 * AuthProvider - Gestiona el estado de autenticación de la aplicación
 * 
 * Características:
 * - Persistencia de sesión en localStorage
 * - Validación automática de token en cambios de ruta
 * - Recuperación automática de sesión si el localStorage tiene datos
 * - Manejo seguro de errores de autenticación
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Recuperar sesión desde localStorage
   */
  const recoverSession = useCallback(async () => {
    try {
      const savedUser = authService.getCurrentUser();
      const token = authService.getToken();

      // Verificar si token está expirado
      if (token && authService.isTokenExpired()) {
        console.warn('[Auth] Token expirado - limpiando sesión');
        authService.logout();
        setUser(null);
        return;
      }

      if (savedUser && token) {
        setUser(savedUser);
        console.log('[Auth] Sesión recuperada:', savedUser.username);
      } else if (savedUser || token) {
        // Si hay datos inconsistentes, limpiar todo
        console.warn('[Auth] Datos inconsistentes en storage - limpiando');
        authService.logout();
        setUser(null);
      }
    } catch (error) {
      console.error('[Auth] Error recuperando sesión:', error);
      authService.logout();
      setUser(null);
    }
  }, []);

  /**
   * Inicializar la sesión al montar el componente
   */
  useEffect(() => {
    const initializeAuth = async () => {
      setIsLoading(true);
      await recoverSession();
      setIsLoading(false);
    };

    initializeAuth();
  }, [recoverSession]);

  /**
   * Validar sesión periódicamente (cada 5 segundos)
   * Esto detecta cambios sin depender de useLocation() que requiere estar dentro del Router
   */
  useEffect(() => {
    const validateInterval = setInterval(() => {
      if (user && !isLoading) {
        // Verificar que el token sigue siendo válido
        if (authService.isTokenExpired()) {
          console.warn('[Auth] Token expirado - limpiando sesión');
          authService.logout();
          setUser(null);
        }
      }
    }, 5000);

    return () => clearInterval(validateInterval);
  }, [user, isLoading]);

  const login = async (username: string, password: string) => {
    try {
      setIsLoading(true);
      const authenticatedUser = await authService.login(username, password);
      setUser(authenticatedUser);
      console.log('[Auth] Login exitoso:', authenticatedUser.username);
    } catch (error) {
      console.error('[Auth] Error en login:', error);
      setUser(null);
      throw new Error('Usuario o contraseña incorrectos');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    console.log('[Auth] Cerrando sesión...');
    setUser(null);
    authService.logout();
  };

  const hasPermission = (requiredRoles: UserRole[]): boolean => {
    if (!user) return false;
    return requiredRoles.includes(user.role);
  };

  const isAuthenticated = user !== null && !authService.isTokenExpired();

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated,
        login,
        logout,
        hasPermission,
        recoverSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
