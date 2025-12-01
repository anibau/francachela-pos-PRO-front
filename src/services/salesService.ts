import { API_CONFIG, API_ENDPOINTS } from '@/config/api';
import { httpClient, simulateDelay } from './httpClient';
import type { Sale } from '@/types';

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
      
      return response.data || response;
    } catch (error) {
      console.error('Error getting sales:', error);
      throw new Error('Error al cargar las ventas');
    }
  },

  /**
   * Obtener venta por ID
   */
  getById: async (id: number): Promise<Sale> => {
    try {
      return await httpClient.get<Sale>(API_ENDPOINTS.SALES.BY_ID(id));
    } catch (error) {
      console.error('Error getting sale by ID:', error);
      throw new Error('Error al cargar la venta');
    }
  },

  /**
   * Obtener ventas del día actual
   */
  getToday: async (): Promise<Sale[]> => {
    try {
      const response = await httpClient.get<any>(API_ENDPOINTS.SALES.TODAY);
      return response.data || response;
    } catch (error) {
      console.error('Error getting today sales:', error);
      throw new Error('Error al cargar las ventas del día');
    }
  },

  /**
   * Crear nueva venta
   */
  create: async (saleData: any): Promise<Sale> => {
    try {
      return await httpClient.post<Sale>(API_ENDPOINTS.SALES.BASE, saleData);
    } catch (error) {
      console.error('Error creating sale:', error);
      throw new Error('Error al crear la venta');
    }
  },

  /**
   * Anular venta
   */
  cancel: async (id: number): Promise<Sale> => {
    try {
      return await httpClient.patch<Sale>(API_ENDPOINTS.SALES.CANCEL(id), {});
    } catch (error) {
      console.error('Error canceling sale:', error);
      throw new Error('Error al anular la venta');
    }
  },
};
