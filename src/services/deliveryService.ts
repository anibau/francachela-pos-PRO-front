import { API_CONFIG, API_ENDPOINTS } from '@/config/api';
import { DEFAULT_LIST_PARAMS } from '@/constants/apiDefaults';
import { httpClient, simulateDelay } from './httpClient';
import { extractErrorMessage } from '@/utils/errorHandler';
import type { PaginatedResponse } from '@/types/backend';

export interface BackendDelivery {
  id: number;
  fecha: string;
  clienteId?: number;
  cliente?: {
    id: number;
    nombres: string;
    apellidos: string;
    telefono?: string;
  };
  pedidoId: number;
  direccion: string;
  estado: string;
  repartidor: string;
  phone?: string;
  deliveryFee: number;
  notes?: string;
  tiempoEstimado?: number;
}

function unwrapList<T>(response: PaginatedResponse<T> | T[]): T[] {
  if (Array.isArray(response)) return response;
  if (response && typeof response === 'object' && 'data' in response) {
    return (response as PaginatedResponse<T>).data;
  }
  return [];
}

export const deliveryService = {
  getAll: async (params = DEFAULT_LIST_PARAMS): Promise<BackendDelivery[]> => {
    try {
      if (API_CONFIG.USE_MOCKS) {
        await simulateDelay();
        return [];
      }
      const query = new URLSearchParams({
        page: String(params.page),
        limit: String(params.limit),
      });
      const response = await httpClient.get<PaginatedResponse<BackendDelivery> | BackendDelivery[]>(
        `${API_ENDPOINTS.DELIVERY.BASE}?${query}`,
      );
      return unwrapList(response);
    } catch (error) {
      console.error('Error getting deliveries:', error);
      throw new Error(extractErrorMessage(error));
    }
  },

  getToday: async (): Promise<BackendDelivery[]> => {
    try {
      if (API_CONFIG.USE_MOCKS) {
        await simulateDelay();
        return [];
      }
      const response = await httpClient.get<BackendDelivery[] | { deliveries: BackendDelivery[] }>(
        API_ENDPOINTS.DELIVERY.TODAY,
      );
      if (Array.isArray(response)) return response;
      if (response && 'deliveries' in response) return response.deliveries;
      return [];
    } catch (error) {
      console.error('Error getting today deliveries:', error);
      throw new Error(extractErrorMessage(error));
    }
  },

  getById: async (id: number): Promise<BackendDelivery> => {
    return httpClient.get<BackendDelivery>(API_ENDPOINTS.DELIVERY.BY_ID(id));
  },
};
