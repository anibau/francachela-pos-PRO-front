import { httpClient } from '@/lib/httpClient';
import { API_ENDPOINTS } from '@/config/api';
import { extractErrorMessage } from '@/lib/utils';
import type { 
  Entrada, 
  CreateEntradaRequest, 
  EntradasEstadisticas,
  EntradasListResponse 
} from '@/types';

export const entradasService = {
  /**
   * Crear nueva entrada
   */
  create: async (entradaData: CreateEntradaRequest): Promise<Entrada> => {
    try {
      const response = await httpClient.post<Entrada>(
        API_ENDPOINTS.ENTRADAS.BASE,
        entradaData
      );
      return response;
    } catch (error) {
      console.error('Error creating entrada:', error);
      throw new Error(extractErrorMessage(error));
    }
  },

  /**
   * Obtener entradas con paginación
   */
  getAll: async (page: number = 1, limit: number = 10): Promise<EntradasListResponse> => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      });

      const url = `${API_ENDPOINTS.ENTRADAS.BASE}?${params.toString()}`;
      const response = await httpClient.get<EntradasListResponse>(url);
      
      return response;
    } catch (error) {
      console.error('Error getting entradas:', error);
      throw new Error(extractErrorMessage(error));
    }
  },

  /**
   * Obtener entrada por ID
   */
  getById: async (id: number): Promise<Entrada> => {
    try {
      const response = await httpClient.get<Entrada>(
        API_ENDPOINTS.ENTRADAS.BY_ID(id)
      );
      return response;
    } catch (error) {
      console.error('Error getting entrada by ID:', error);
      throw new Error(extractErrorMessage(error));
    }
  },

  /**
   * Obtener entradas por rango de fechas
   */
  getByRange: async (fechaInicio: string, fechaFin: string): Promise<Entrada[]> => {
    try {
      const params = new URLSearchParams({
        fechaInicio,
        fechaFin
      });

      const url = `${API_ENDPOINTS.ENTRADAS.BY_RANGE}?${params.toString()}`;
      const response = await httpClient.get<Entrada[]>(url);
      
      return response;
    } catch (error) {
      console.error('Error getting entradas by range:', error);
      throw new Error(extractErrorMessage(error));
    }
  },

  /**
   * Obtener total de entradas por rango de fechas
   */
  getTotalByRange: async (fechaInicio: string, fechaFin: string): Promise<{ total: number }> => {
    try {
      const params = new URLSearchParams({
        fechaInicio,
        fechaFin
      });

      const url = `${API_ENDPOINTS.ENTRADAS.TOTAL_RANGE}?${params.toString()}`;
      const response = await httpClient.get<{ total: number }>(url);
      
      return response;
    } catch (error) {
      console.error('Error getting total entradas by range:', error);
      throw new Error(extractErrorMessage(error));
    }
  },

  /**
   * Obtener estadísticas de entradas
   */
  getEstadisticas: async (fechaInicio: string, fechaFin: string): Promise<EntradasEstadisticas> => {
    try {
      const params = new URLSearchParams({
        fechaInicio,
        fechaFin
      });

      const url = `${API_ENDPOINTS.ENTRADAS.STATISTICS}?${params.toString()}`;
      const response = await httpClient.get<EntradasEstadisticas>(url);
      
      return response;
    } catch (error) {
      console.error('Error getting entradas statistics:', error);
      throw new Error(extractErrorMessage(error));
    }
  },

  /**
   * Actualizar entrada por ID
   */
  update: async (id: number, entradaData: Partial<CreateEntradaRequest>): Promise<Entrada> => {
    try {
      const response = await httpClient.patch<Entrada>(
        API_ENDPOINTS.ENTRADAS.BY_ID(id),
        entradaData
      );
      return response;
    } catch (error) {
      console.error('Error updating entrada:', error);
      throw new Error(extractErrorMessage(error));
    }
  },

  /**
   * Eliminar entrada por ID
   */
  delete: async (id: number): Promise<void> => {
    try {
      await httpClient.delete(API_ENDPOINTS.ENTRADAS.BY_ID(id));
    } catch (error) {
      console.error('Error deleting entrada:', error);
      throw new Error(extractErrorMessage(error));
    }
  },
};
