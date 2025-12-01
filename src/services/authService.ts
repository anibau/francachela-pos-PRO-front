import { API_CONFIG, API_ENDPOINTS } from '@/config/api';
import { httpClient, simulateDelay } from './httpClient';
import type { LoginRequest, LoginResponse } from '@/types/api';
import type { User } from '@/contexts/AuthContext';

// Mock users para desarrollo (alineados con el backend)
const mockUsers = [
  {
    id: 1,
    email: 'admin@francachela.com',
    username: 'admin',
    role: 'ADMIN' as const,
    nombre: 'Administrador',
    password: 'admin123', // Solo para mock
  },
  {
    id: 2,
    email: 'supervisor@francachela.com',
    username: 'supervisor',
    role: 'ADMIN' as const,
    nombre: 'Supervisor',
    password: 'super123', // Solo para mock
  },
  {
    id: 3,
    email: 'cajero@francachela.com',
    username: 'cajero',
    role: 'CAJERO' as const,
    nombre: 'Cajero Principal',
    password: 'caja123', // Solo para mock
  },
  {
    id: 4,
    email: 'inventario@francachela.com',
    username: 'inventario',
    role: 'INVENTARIOS' as const,
    nombre: 'Encargado de Inventario',
    password: 'inv123', // Solo para mock
  },
];

// Función para generar un JWT mock
const generateMockJWT = (user: typeof mockUsers[0]): string => {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(JSON.stringify({
    sub: user.id,
    email: user.email,
    username: user.username,
    role: user.role,
    nombre: user.nombre,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // 24 horas
  }));
  const signature = btoa('mock-signature');
  
  return `${header}.${payload}.${signature}`;
};

// Mapear roles del backend a roles del frontend
const mapBackendRole = (backendRole: string): User['role'] => {
  switch (backendRole) {
    case 'ADMIN':
      return 'administrador';
    case 'CAJERO':
      return 'cajero';
    case 'INVENTARIOS':
      return 'supervisor'; // Mapear inventarios a supervisor en el frontend
    default:
      return 'cajero';
  }
};

export const authService = {
  /**
   * Iniciar sesión con email y contraseña
   */
  login: async (email: string, password: string): Promise<User> => {
    try {
      if (API_CONFIG.USE_MOCKS) {
        // Simular delay de red
        await simulateDelay();
        
        // Buscar usuario en mocks
        const mockUser = mockUsers.find(u => 
          (u.email === email || u.username === email) && u.password === password
        );
        
        if (!mockUser) {
          throw new Error('Usuario o contraseña incorrectos');
        }
        
        // Generar token mock
        const token = generateMockJWT(mockUser);
        
        // Crear respuesta mock
        const loginResponse: LoginResponse = {
          user: {
            id: mockUser.id,
            email: mockUser.email,
            username: mockUser.username,
            role: mockUser.role,
            nombre: mockUser.nombre,
          },
          token,
        };
        
        // Mapear al formato del frontend
        const user: User = {
          id: loginResponse.user.id,
          username: loginResponse.user.username,
          role: mapBackendRole(loginResponse.user.role),
          nombre: loginResponse.user.nombre,
        };
        
        // Guardar token y usuario
        localStorage.setItem('auth_token', token);
        localStorage.setItem('user', JSON.stringify({ ...user, token }));
        
        return user;
      }
      
      // Usar backend real
      const loginRequest: LoginRequest = { email, password };
      const response = await httpClient.post<LoginResponse>(
        API_ENDPOINTS.AUTH.LOGIN,
        loginRequest,
        { requiresAuth: false }
      );
      
      // Mapear respuesta del backend al formato del frontend
      const user: User = {
        id: response.user.id,
        username: response.user.username,
        role: mapBackendRole(response.user.role),
        nombre: response.user.nombre,
      };
      
      // Guardar token y usuario
      localStorage.setItem('auth_token', response.token);
      localStorage.setItem('user', JSON.stringify({ ...user, token: response.token }));
      
      return user;
    } catch (error) {
      console.error('Login error:', error);
      throw new Error('Usuario o contraseña incorrectos');
    }
  },

  /**
   * Obtener perfil del usuario autenticado
   */
  getProfile: async (): Promise<User> => {
    try {
      if (API_CONFIG.USE_MOCKS) {
        await simulateDelay();
        
        // Obtener usuario del localStorage
        const savedUser = localStorage.getItem('user');
        if (!savedUser) {
          throw new Error('No hay sesión activa');
        }
        
        const userData = JSON.parse(savedUser);
        return {
          id: userData.id,
          username: userData.username,
          role: userData.role,
          nombre: userData.nombre,
        };
      }
      
      // Usar backend real
      const response = await httpClient.get<LoginResponse['user']>(
        API_ENDPOINTS.AUTH.PROFILE
      );
      
      return {
        id: response.id,
        username: response.username,
        role: mapBackendRole(response.role),
        nombre: response.nombre,
      };
    } catch (error) {
      console.error('Get profile error:', error);
      throw new Error('Error al obtener el perfil del usuario');
    }
  },

  /**
   * Cerrar sesión
   */
  logout: (): void => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
  },

  /**
   * Verificar si hay una sesión activa
   */
  isAuthenticated: (): boolean => {
    const token = localStorage.getItem('auth_token');
    const user = localStorage.getItem('user');
    return !!(token && user);
  },

  /**
   * Obtener el token de autenticación
   */
  getToken: (): string | null => {
    return localStorage.getItem('auth_token');
  },

  /**
   * Obtener el usuario actual del localStorage
   */
  getCurrentUser: (): User | null => {
    try {
      const savedUser = localStorage.getItem('user');
      if (!savedUser) return null;
      
      const userData = JSON.parse(savedUser);
      return {
        id: userData.id,
        username: userData.username,
        role: userData.role,
        nombre: userData.nombre,
      };
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  },

  /**
   * Verificar si el token ha expirado (solo para tokens reales)
   */
  isTokenExpired: (): boolean => {
    const token = localStorage.getItem('auth_token');
    if (!token) return true;
    
    try {
      // Decodificar el payload del JWT
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      
      return payload.exp < currentTime;
    } catch (error) {
      // Si no se puede decodificar, asumir que está expirado
      return true;
    }
  },

  /**
   * Refrescar el token (placeholder para implementación futura)
   */
  refreshToken: async (): Promise<string> => {
    // TODO: Implementar refresh token cuando el backend lo soporte
    throw new Error('Refresh token no implementado');
  },
};
