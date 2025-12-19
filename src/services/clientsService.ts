import { API_CONFIG, API_ENDPOINTS } from '@/config/api';
import { httpClient, simulateDelay } from './httpClient';
import type { Client } from '@/types';
import type { ClienteQueryParams, PaginatedResponse } from '@/types/backend';
import { normalizeClient, normalizeClients } from '@/utils/dataTransform';
import { extractErrorMessage } from '@/utils/errorHandler';

export const clientsService = {
  /**
   * Obtener todos los clientes con filtros opcionales
   */
  getAll: async (params?: ClienteQueryParams): Promise<Client[]> => {
    try {
      if (API_CONFIG.USE_MOCKS) {
        await simulateDelay();
        return [];
      }
      
      // Usar backend real
      const queryParams = new URLSearchParams();
      if (params?.search) queryParams.append('search', params.search);
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.activo !== undefined) queryParams.append('activo', params.activo.toString());
      
      const url = `${API_ENDPOINTS.CLIENTS.BASE}${queryParams.toString() ? `?${queryParams}` : ''}`;
      const response = await httpClient.get<PaginatedResponse<Client> | Client[]>(url);
      
      if (response && typeof response === 'object' && 'data' in response) {
        return normalizeClients((response as PaginatedResponse<Client>).data);
      }
      return normalizeClients(Array.isArray(response) ? response : []);
    } catch (error) {
      console.error('Error getting clients:', error);
      throw new Error(extractErrorMessage(error));
    }
  },

  /**
   * Obtener cliente por ID
   */
  getById: async (id: number): Promise<Client> => {
    try {
      const client = await httpClient.get<Client>(API_ENDPOINTS.CLIENTS.BY_ID(id));
      return normalizeClient(client);
    } catch (error) {
      console.error('Error getting client by ID:', error);
      throw new Error(extractErrorMessage(error));
    }
  },

  /**
   * Buscar clientes
   */
  search: async (query: string): Promise<Client[]> => {
    try {
      if (!query || query.length < 2) {
        return [];
      }
      
      const queryParams = new URLSearchParams({ q: query });
      const response = await httpClient.get<PaginatedResponse<Client> | Client[]>(
        `${API_ENDPOINTS.CLIENTS.SEARCH}?${queryParams}`
      );
      
      if (response && typeof response === 'object' && 'data' in response) {
        return normalizeClients((response as PaginatedResponse<Client>).data);
      }
      return normalizeClients(Array.isArray(response) ? response : []);
    } catch (error) {
      console.error('Error searching clients:', error);
      return [];
    }
  },

  /**
   * Obtener clientes que cumplen años hoy
   */
  getBirthdays: async (): Promise<Client[]> => {
    try {
      const response = await httpClient.get<PaginatedResponse<Client> | Client[]>(API_ENDPOINTS.CLIENTS.BIRTHDAYS);
      if (response && typeof response === 'object' && 'data' in response) {
        return normalizeClients((response as PaginatedResponse<Client>).data);
      }
      return normalizeClients(Array.isArray(response) ? response : []);
    } catch (error) {
      console.error('Error getting birthday clients:', error);
      throw new Error(extractErrorMessage(error));
    }
  },

  /**
   * Obtener clientes con más puntos
   */
  getTopClients: async (limit: number = 10): Promise<Client[]> => {
    try {
      const queryParams = new URLSearchParams({ limit: limit.toString() });
      const response = await httpClient.get<PaginatedResponse<Client> | Client[]>(`${API_ENDPOINTS.CLIENTS.TOP}?${queryParams}`);
      if (response && typeof response === 'object' && 'data' in response) {
        return normalizeClients((response as PaginatedResponse<Client>).data);
      }
      return normalizeClients(Array.isArray(response) ? response : []);
    } catch (error) {
      console.error('Error getting top clients:', error);
      throw new Error(extractErrorMessage(error));
    }
  },

  /**
   * Obtener cliente por DNI
   */
  getByDni: async (dni: string): Promise<Client | null> => {
    try {
      const client = await httpClient.get<Client>(API_ENDPOINTS.CLIENTS.BY_DNI(dni));
      return normalizeClient(client);
    } catch (error) {
      console.error('Error getting client by DNI:', error);
      return null;
    }
  },

  /**
   * Obtener estadísticas de un cliente específico
   */
  getEstadisticas: async (clienteId: number): Promise<any> => {
    try {
      const response = await httpClient.get<any>(`${API_ENDPOINTS.CLIENTS.BASE}/${clienteId}/estadisticas`);
      return response;
    } catch (error) {
      console.error('Error getting client statistics:', error);
      throw new Error(extractErrorMessage(error));
    }
  },

  /**
   * Crear nuevo cliente
   */
  create: async (clientData: Omit<Client, 'id'>): Promise<Client> => {
    try {
      const client = await httpClient.post<Client>(API_ENDPOINTS.CLIENTS.BASE, clientData);
      return normalizeClient(client);
    } catch (error) {
      console.error('Error creating client:', error);
      throw new Error(extractErrorMessage(error));
    }
  },

  /**
   * Actualizar cliente
   */
  update: async (id: number, clientData: Partial<Client>): Promise<Client> => {
    try {
      const client = await httpClient.patch<Client>(API_ENDPOINTS.CLIENTS.BY_ID(id), clientData);
      return normalizeClient(client);
    } catch (error) {
      console.error('Error updating client:', error);
      throw new Error(extractErrorMessage(error));
    }
  },

  /**
   * Eliminar cliente (soft delete)
   */
  delete: async (id: number): Promise<void> => {
    try {
      await httpClient.delete(API_ENDPOINTS.CLIENTS.BY_ID(id));
    } catch (error) {
      console.error('Error deleting client:', error);
      throw new Error(extractErrorMessage(error));
    }
  },

  /**
   * Validar DNI único
   */
  validateDni: async (dni: string, excludeId?: number): Promise<boolean> => {
    try {
      const existingClient = await clientsService.getByDni(dni);
      if (existingClient && existingClient.id !== excludeId) {
        return false;
      }
      return true;
    } catch (error) {
      console.error('Error validating DNI:', error);
      return false;
    }
  },
};
