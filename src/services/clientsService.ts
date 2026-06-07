import { API_CONFIG, API_ENDPOINTS } from '@/config/api';
import { DEFAULT_LIST_PARAMS } from '@/constants/apiDefaults';
import { httpClient, simulateDelay } from './httpClient';
import type { Client, ClienteTop, ClientesCumpleanosResponse, TopClientesResponse, ClienteEstadisticasByDNI } from '@/types';
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
      
      const merged = { ...DEFAULT_LIST_PARAMS, ...params };
      const queryParams = new URLSearchParams();
      if (merged.search) queryParams.append('search', merged.search);
      queryParams.append('page', merged.page.toString());
      queryParams.append('limit', merged.limit.toString());
      if (params?.activo !== undefined) queryParams.append('activo', params.activo.toString());
      
      const url = `${API_ENDPOINTS.CLIENTS.BASE}${queryParams.toString() ? `?${queryParams}` : ''}`;
      const response = await httpClient.get<PaginatedResponse<Client> | Client[]>(url);
      
      if (response && typeof response === 'object' && 'data' in response) {
        return normalizeClients((response as PaginatedResponse<Client>).data);
      }
      return normalizeClients(Array.isArray(response) ? response : []);
    } catch (error) {
      // Retornar array vacío en lugar de lanzar error (ej: cuando 404 - No se encontraron clientes)
      console.warn('No clients found or error fetching clients:', extractErrorMessage(error));
      return [];
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
   * Obtener clientes con más puntos (Requerimiento 5)
   */
  getTopClients: async (limit: number = 10): Promise<TopClientesResponse> => {
    try {
      const queryParams = new URLSearchParams({ limit: limit.toString() });
      const response = await httpClient.get<ClienteTop[]>(`${API_ENDPOINTS.CLIENTS.TOP}?${queryParams}`);
      
      // Adaptar respuesta al formato esperado
      const clientes = Array.isArray(response) ? response : [];
      return {
        clientes,
        total: clientes.length,
        limit
      };
    } catch (error) {
      console.error('Error getting top clients:', error);
      throw new Error(extractErrorMessage(error));
    }
  },

  /**
   * Obtener clientes cumpleañeros (Requerimiento 6)
   */
  getCumpleaneros: async (page: number = 1, limit: number = 10): Promise<ClientesCumpleanosResponse> => {
    try {
      const queryParams = new URLSearchParams({ 
        page: page.toString(),
        limit: limit.toString()
      });
      const response = await httpClient.get<ClienteTop[]>(`${API_ENDPOINTS.CLIENTS.BIRTHDAYS}?${queryParams}`);
      
      // Adaptar respuesta al formato esperado con paginación
      const clientes = Array.isArray(response) ? response : [];
      const total = clientes.length;
      const pages = Math.ceil(total / limit);
      
      return {
        clientes,
        pagination: {
          page,
          pages,
          total,
          limit
        }
      };
    } catch (error) {
      console.error('Error getting birthday clients:', error);
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
   * Obtener estadísticas de un cliente específico por DNI (Requerimiento 7)
   */
  getEstadisticas: async (dni: string): Promise<ClienteEstadisticasByDNI> => {
    try {
      const response = await httpClient.get<ClienteEstadisticasByDNI>(API_ENDPOINTS.CLIENTS.STATISTICS(dni));
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

  /**
   * Enviar mensaje de bienvenida por WhatsApp
   */
  sendWelcomeMessage: async (idCliente: number): Promise<void> => {
    try {
      await httpClient.post(API_ENDPOINTS.WHATSAPP.SEND_WELCOME(idCliente), {});
    } catch (error) {
      console.error('Error sending welcome message:', error);
      throw new Error(extractErrorMessage(error));
    }
  },
};
