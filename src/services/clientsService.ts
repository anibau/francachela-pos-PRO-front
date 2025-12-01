import { API_CONFIG, API_ENDPOINTS } from '@/config/api';
import { httpClient, simulateDelay } from './httpClient';
import type { Client } from '@/types';
import type { ClienteQueryParams } from '@/types/backend';

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
      const response = await httpClient.get<any>(url);
      
      return response.data || response;
    } catch (error) {
      console.error('Error getting clients:', error);
      throw new Error('Error al cargar los clientes');
    }
  },

  /**
   * Obtener cliente por ID
   */
  getById: async (id: number): Promise<Client> => {
    try {
      return await httpClient.get<Client>(API_ENDPOINTS.CLIENTS.BY_ID(id));
    } catch (error) {
      console.error('Error getting client by ID:', error);
      throw new Error('Error al cargar el cliente');
    }
  },

  /**
   * Buscar clientes
   */
  search: async (query: string): Promise<Client[]> => {
    try {
      return await this.getAll({ search: query });
    } catch (error) {
      console.error('Error searching clients:', error);
      throw new Error('Error al buscar clientes');
    }
  },

  /**
   * Obtener clientes que cumplen años hoy
   */
  getBirthdays: async (): Promise<Client[]> => {
    try {
      const response = await httpClient.get<any>(API_ENDPOINTS.CLIENTS.BIRTHDAYS);
      return response.data || response || [];
    } catch (error) {
      console.error('Error getting birthday clients:', error);
      throw new Error('Error al cargar clientes con cumpleaños');
    }
  },

  /**
   * Obtener clientes con más puntos
   */
  getTopClients: async (limit: number = 10): Promise<Client[]> => {
    try {
      const queryParams = new URLSearchParams({ limit: limit.toString() });
      const response = await httpClient.get<any>(`${API_ENDPOINTS.CLIENTS.TOP}?${queryParams}`);
      return response.data || response || [];
    } catch (error) {
      console.error('Error getting top clients:', error);
      throw new Error('Error al cargar clientes top');
    }
  },

  /**
   * Obtener cliente por DNI
   */
  getByDni: async (dni: string): Promise<Client | null> => {
    try {
      return await httpClient.get<Client>(API_ENDPOINTS.CLIENTS.BY_DNI(dni));
    } catch (error) {
      console.error('Error getting client by DNI:', error);
      return null;
    }
  },

  /**
   * Crear nuevo cliente
   */
  create: async (clientData: Omit<Client, 'id'>): Promise<Client> => {
    try {
      return await httpClient.post<Client>(API_ENDPOINTS.CLIENTS.BASE, clientData);
    } catch (error) {
      console.error('Error creating client:', error);
      throw new Error('Error al crear el cliente');
    }
  },

  /**
   * Actualizar cliente
   */
  update: async (id: number, clientData: Partial<Client>): Promise<Client> => {
    try {
      return await httpClient.patch<Client>(API_ENDPOINTS.CLIENTS.BY_ID(id), clientData);
    } catch (error) {
      console.error('Error updating client:', error);
      throw new Error('Error al actualizar el cliente');
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
      throw new Error('Error al eliminar el cliente');
    }
  },

  /**
   * Validar DNI único
   */
  validateDni: async (dni: string, excludeId?: number): Promise<boolean> => {
    try {
      const existingClient = await this.getByDni(dni);
      if (existingClient && existingClient.id !== excludeId) {
        return false; // DNI ya existe
      }
      return true; // DNI disponible
    } catch (error) {
      console.error('Error validating DNI:', error);
      return false;
    }
  },
};
