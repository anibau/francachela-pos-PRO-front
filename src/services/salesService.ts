import { API_CONFIG, API_ENDPOINTS } from '@/config/api';
import { httpClient, simulateDelay } from './httpClient';
import type { Sale } from '@/types';
import { normalizeSale, normalizeSales } from '@/utils/dataTransform';
import { extractErrorMessage } from '@/utils/errorHandler';

export const salesService = {
  /**
   * Obtener todas las ventas
   */
  getAll: async (params?: any): Promise<Sale[]> => {
    try {
      if (API_CONFIG.USE_MOCKS) {
        await simulateDelay();
        return [];
      }
      
      const queryParams = new URLSearchParams();
      if (params?.search) queryParams.append('search', params.search);
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      
      const url = `${API_ENDPOINTS.SALES.BASE}${queryParams.toString() ? `?${queryParams}` : ''}`;
      const response = await httpClient.get<any>(url);
      
      return normalizeSales(Array.isArray(response) ? response : response?.data ? response.data : []);
    } catch (error) {
      console.error('Error getting sales:', error);
      throw new Error(extractErrorMessage(error));
    }
  },

  /**
   * Obtener venta por ID
   */
  getById: async (id: number): Promise<Sale> => {
    try {
      const sale = await httpClient.get<Sale>(API_ENDPOINTS.SALES.BY_ID(id));
      return normalizeSale(sale);
    } catch (error) {
      console.error('Error getting sale by ID:', error);
      throw new Error(extractErrorMessage(error));
    }
  },

  /**
   * Obtener ventas del día actual
   */
  getToday: async (): Promise<Sale[]> => {
    try {
      const response = await httpClient.get<any>(API_ENDPOINTS.SALES.TODAY);
      return normalizeSales(Array.isArray(response) ? response : response?.data ? response.data : []);
    } catch (error) {
      console.error('Error getting today sales:', error);
      throw new Error(extractErrorMessage(error));
    }
  },

  /**
   * Crear nueva venta
   */
  create: async (saleData: any): Promise<Sale> => {
    try {
      const sale = await httpClient.post<Sale>(API_ENDPOINTS.SALES.BASE, saleData);
      return normalizeSale(sale);
    } catch (error) {
      console.error('Error creating sale:', error);
      throw new Error(extractErrorMessage(error));
    }
  },

  /**
   * Anular venta
   */
  cancel: async (id: number): Promise<Sale> => {
    try {
      const sale = await httpClient.patch<Sale>(API_ENDPOINTS.SALES.CANCEL(id), {});
      return normalizeSale(sale);
    } catch (error) {
      console.error('Error canceling sale:', error);
      throw new Error(extractErrorMessage(error));
    }
  },

  /**
   * Obtener estadísticas de ventas con filtros de fecha
   * @param fechaInicio - Fecha de inicio en formato YYYY-MM-DD HH:mm:ss
   * @param fechaFin - Fecha de fin en formato YYYY-MM-DD HH:mm:ss
   */
  getEstadisticas: async (fechaInicio: string, fechaFin: string): Promise<any> => {
    try {
      // URLSearchParams maneja el encoding automáticamente
      const params = new URLSearchParams({
        fechaInicio: fechaInicio,
        fechaFin: fechaFin
      });

      const url = `/ventas/estadisticas?${params.toString()}`;
      const response = await httpClient.get<any>(url);
      
      return response;
    } catch (error) {
      console.error('Error getting sales statistics:', error);
      throw new Error(extractErrorMessage(error));
    }
  }
};
