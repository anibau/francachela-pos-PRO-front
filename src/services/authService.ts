import { API_CONFIG, API_ENDPOINTS } from '@/config/api';
import { httpClient, simulateDelay } from './httpClient';
import { storageService } from './storageService';
import type { LoginRequest, LoginResponse } from '@/types/api';
import type { User } from '@/contexts/AuthContext';

// Mock users para desarrollo (alineados con el backend)
// El backend espera credenciales: { username: string, password: string }
const mockUsers = [
  {
    id: 1,
    email: 'admin@francachela.com',
    username: 'admin',
    role: 'ADMIN' as const,
    nombre: 'Administrador',
    password: 'admin123', // Alineado con documentación de endpoint
  },
  {
    id: 2,
    email: 'supervisor@francachela.com',
    username: 'supervisor',
    role: 'ADMIN' as const,
    nombre: 'Supervisor',
    password: 'password123', // Alineado con documentación de endpoint
  },
  {
    id: 3,
    email: 'cajero@francachela.com',
    username: 'cajero',
    role: 'CAJERO' as const,
    nombre: 'Cajero Principal',
    password: 'password123', // Alineado con documentación de endpoint
  },
  {
    id: 4,
    email: 'inventario@francachela.com',
    username: 'inventario',
    role: 'INVENTARIOS' as const,
    nombre: 'Encargado de Inventario',
    password: 'password123', // Alineado con documentación de endpoint
  },
];

/**
 * Generar un JWT mock para desarrollo
 */
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

/**
 * Mapear roles del backend a roles del frontend
 */
const mapBackendRole = (backendRole: string): User['role'] => {
  switch (backendRole) {
    case 'ADMIN':
      return 'ADMIN';
    case 'CAJERO':
      return 'CAJERO';
    case 'INVENTARIOS':
      return 'SUPERVISOR'; // Mapear inventarios a supervisor en el frontend
    default:
      return 'CAJERO';
  }
};

/**
 * AuthService - Servicio centralizado de autenticación
 * 
 * Propósito:
 * - Manejar login/logout
 * - Persistencia de sesión con validación
 * - Gestión de tokens JWT
 * - Recuperación de usuario del storage
 * - Validación de expiración de tokens
 */
export const authService = {
  /**
   * Iniciar sesión con username y contraseña
   * 
   * @param usernameOrEmail - El username del usuario o email (para compatibilidad)
   * @param password - La contraseña del usuario
   * @returns Usuario autenticado con su información y token
   * @throws Error con mensaje descriptivo si las credenciales son inválidas
   * 
   * El endpoint /auth/login espera: { username: string, password: string }
   */
  login: async (usernameOrEmail: string, password: string): Promise<User> => {
    try {
      if (API_CONFIG.USE_MOCKS) {
        // Validar entrada
        if (!usernameOrEmail || usernameOrEmail.trim().length === 0) {
          throw new Error('El nombre de usuario no puede estar vacío');
        }
        if (!password || password.trim().length === 0) {
          throw new Error('La contraseña no puede estar vacía');
        }
        
        // Simular delay de red
        await simulateDelay();
        
        // Buscar usuario en mocks (soporta tanto email como username para flexibilidad)
        const mockUser = mockUsers.find(u => 
          (u.email === usernameOrEmail || u.username === usernameOrEmail) && u.password === password
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
        
        // Guardar token y usuario SEPARADOS para evitar doble serialización
        storageService.set('AUTH_TOKEN', token);
        storageService.set('USER_DATA', user);
        
        console.log('[AuthService] Login exitoso (mock):', user.username);
        return user;
      }
      
      // Validar entrada
      if (!usernameOrEmail || usernameOrEmail.trim().length === 0) {
        throw new Error('El nombre de usuario no puede estar vacío');
      }
      if (!password || password.trim().length === 0) {
        throw new Error('La contraseña no puede estar vacía');
      }
      
      // Usar backend real - enviar username (NO email)
      // El endpoint /auth/login espera: { username: string, password: string }
      const loginRequest: LoginRequest = { 
        username: usernameOrEmail.trim(),
        password 
      };
      const response = await httpClient.post<any>(
        API_ENDPOINTS.AUTH.LOGIN,
        loginRequest,
        { requiresAuth: false }
      );
      
      // DEBUG: Mostrar estructura completa de la respuesta
      console.log('[AuthService] Respuesta completa del backend:', response);
      
      // Normalizar la respuesta del backend a un formato estándar
      let normalizedResponse: { user: any; token: string };
      
      // Formato 1: { user: {...}, token: "..." }
      if (response.user && response.token) {
        console.log('[AuthService] Formato detectado: { user, token }');
        normalizedResponse = {
          user: response.user,
          token: response.token
        };
      }
      // Formato 2: { user: {...}, access_token: "..." }
      else if (response.user && response.access_token) {
        console.log('[AuthService] Formato detectado: { user, access_token }');
        normalizedResponse = {
          user: response.user,
          token: response.access_token
        };
      }
      // Formato 3: Datos directos { id, username, ..., token }
      else if (response.id && response.username && response.token) {
        console.log('[AuthService] Formato detectado: datos directos');
        normalizedResponse = {
          user: {
            id: response.id,
            email: response.email,
            username: response.username,
            role: response.role,
            nombre: response.nombre
          },
          token: response.token
        };
      }
      // Formato 4: Respuesta envuelta en data
      else if (response.data) {
        console.log('[AuthService] Formato detectado: envuelto en data');
        return authService.login(usernameOrEmail, password); // Recursivo con response.data
      }
      else {
        console.error('[AuthService] Formato de respuesta no reconocido:', response);
        throw new Error('Error de autenticación: formato de respuesta inválido');
      }
      
      console.log('[AuthService] Token recibido:', normalizedResponse.token);
      console.log('[AuthService] Usuario recibido:', normalizedResponse.user);
      
      // Validar que la respuesta normalizada tenga la estructura esperada
      if (!normalizedResponse.token) {
        console.error('[AuthService] No se recibió token en la respuesta');
        throw new Error('Error de autenticación: token no recibido');
      }
      
      if (!normalizedResponse.user) {
        console.error('[AuthService] No se recibió información de usuario');
        throw new Error('Error de autenticación: datos de usuario no recibidos');
      }
      
      // Mapear respuesta del backend al formato del frontend
      const user: User = {
        id: normalizedResponse.user.id,
        username: normalizedResponse.user.username,
        role: mapBackendRole(normalizedResponse.user.role),
        nombre: normalizedResponse.user.nombre,
      };
      
      // Validar token antes de guardarlo (solo si parece ser JWT)
      const token = normalizedResponse.token;
      const tokenParts = token.split('.');
      
      // Si tiene 3 partes, es probablemente un JWT
      if (tokenParts.length === 3) {
        console.log('[AuthService] Token JWT válido detectado');
        try {
          // Intentar decodificar para validar
          const payload = JSON.parse(atob(tokenParts[1]));
          console.log('[AuthService] Payload del JWT:', payload);
        } catch (decodeError) {
          console.warn('[AuthService] Error decodificando JWT, pero continuando:', decodeError);
        }
      } else {
        console.log('[AuthService] Token no es JWT (partes:', tokenParts.length, ') - usando como token simple');
      }
      
      // Guardar token y usuario SEPARADOS para evitar doble serialización
      storageService.set('AUTH_TOKEN', token);
      storageService.set('USER_DATA', user);
      
      console.log('[AuthService] Login exitoso:', user.username);
      console.log('[AuthService] Token guardado correctamente');
      return user;
    } catch (error) {
      console.error('[AuthService] Login error:', error);
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
        const savedUser = storageService.get<any>('USER_DATA');
        if (!savedUser) {
          throw new Error('No hay sesión activa');
        }
        
        return {
          id: savedUser.id,
          username: savedUser.username,
          role: savedUser.role,
          nombre: savedUser.nombre,
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
      console.error('[AuthService] Get profile error:', error);
      throw new Error('Error al obtener el perfil del usuario');
    }
  },

  /**
   * Cerrar sesión - Limpiar storage
   */
  logout: (): void => {
    console.log('[AuthService] Cerrando sesión...');
    storageService.clearAuth();
  },

  /**
   * Verificar si hay una sesión activa
   */
  isAuthenticated: (): boolean => {
    const token = storageService.get<string>('AUTH_TOKEN');
    const user = storageService.get<any>('USER_DATA');
    
    // Ambos deben existir y el token no debe estar expirado
    return !!(token && user && !authService.isTokenExpired());
  },

  /**
   * Obtener el token de autenticación
   */
  getToken: (): string | null => {
    return storageService.get<string>('AUTH_TOKEN');
  },

  /**
   * Obtener el usuario actual del storage
   */
  getCurrentUser: (): User | null => {
    try {
      const savedUser = storageService.get<any>('USER_DATA');
      if (!savedUser) return null;
      
      return {
        id: savedUser.id,
        username: savedUser.username,
        role: savedUser.role,
        nombre: savedUser.nombre,
      };
    } catch (error) {
      console.error('[AuthService] Error getting current user:', error);
      return null;
    }
  },

  /**
   * Verificar si el token ha expirado (solo para tokens reales)
   */
  isTokenExpired: (): boolean => {
    try {
      const token = storageService.get<string>('AUTH_TOKEN');
      if (!token) {
        console.log('[AuthService] No hay token - considerando expirado');
        return true;
      }
      
      // Si estamos usando mocks, el token es siempre válido
      if (API_CONFIG.USE_MOCKS) {
        console.log('[AuthService] Usando mocks - token siempre válido');
        return false;
      }
      
      // Validar estructura del token
      const parts = token.split('.');
      
      // Si no es un JWT (no tiene 3 partes), tratarlo como token simple válido
      if (parts.length !== 3) {
        console.log('[AuthService] Token no es JWT (partes:', parts.length, ') - tratando como token simple válido');
        return false; // Token simple siempre válido
      }
      
      try {
        // Decodificar el payload del JWT
        const payload = JSON.parse(atob(parts[1]));
        console.log('[AuthService] Payload del token:', payload);
        
        // Si no tiene exp, asumir que es válido (algunos backends no usan exp)
        if (!payload.exp) {
          console.log('[AuthService] Token sin expiración - considerando válido');
          return false;
        }
        
        const currentTime = Math.floor(Date.now() / 1000);
        const isExpired = payload.exp < currentTime;
        
        if (isExpired) {
          console.warn('[AuthService] Token expirado. Exp:', payload.exp, 'Current:', currentTime);
        } else {
          console.log('[AuthService] Token válido. Exp:', payload.exp, 'Current:', currentTime);
        }
        
        return isExpired;
      } catch (decodeError) {
        console.error('[AuthService] Error decodificando payload del token:', decodeError);
        console.error('[AuthService] Token problemático:', token);
        return true;
      }
    } catch (error) {
      // Si hay error al decodificar, asumir que está expirado
      console.error('[AuthService] Error verificando expiración del token:', error);
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
