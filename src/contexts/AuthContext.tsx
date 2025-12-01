import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '@/services/authService';

export type UserRole = 'administrador' | 'supervisor' | 'cajero';

export interface User {
  id: number;
  username: string;
  role: UserRole;
  nombre: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  hasPermission: (requiredRole: UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Verificar si hay sesión guardada
    const initializeAuth = async () => {
      try {
        if (authService.isAuthenticated() && !authService.isTokenExpired()) {
          const currentUser = authService.getCurrentUser();
          if (currentUser) {
            setUser(currentUser);
          } else {
            // Si no se puede obtener el usuario, limpiar la sesión
            authService.logout();
          }
        } else {
          // Token expirado o no existe, limpiar la sesión
          authService.logout();
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        authService.logout();
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (username: string, password: string) => {
    try {
      const authenticatedUser = await authService.login(username, password);
      setUser(authenticatedUser);
    } catch (error) {
      throw new Error('Usuario o contraseña incorrectos');
    }
  };

  const logout = () => {
    setUser(null);
    authService.logout();
  };

  const hasPermission = (requiredRoles: UserRole[]): boolean => {
    if (!user) return false;
    return requiredRoles.includes(user.role);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
