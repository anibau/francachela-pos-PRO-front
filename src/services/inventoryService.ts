import { API_CONFIG, API_ENDPOINTS } from '@/config/api';
import { httpClient, simulateDelay } from './httpClient';
import type { InventoryMovement } from '@/types';
import type { 
  InventoryMovementCreateRequest,
  PaginationParams,
  DateRangeFilterParams 
} from '@/types/api';

// Interface para la respuesta paginada del backend
interface PaginatedMovementsResponse {
  data: InventoryMovement[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export const inventoryService = {
  /**
   * Obtener todos los movimientos de inventario
   */
  getMovements: async (params?: PaginationParams): Promise<InventoryMovement[]> => {
    try {
      if (API_CONFIG.USE_MOCKS) {
        await simulateDelay();
        
        // Mock de movimientos de inventario
        const movements: InventoryMovement[] = [
          {
            id: 1,
            hora: '2024-12-01T09:00:00Z',
            codigoBarra: '7751271001234',
            descripcion: 'Cerveza Pilsen 650ml',
            costo: '2.80',
            precioVenta: '4.50',
            existenciaAnterior: 100,
            existenciaNueva: 150,
            existencia: 150,
            invMinimo: 20,
            tipo: 'ENTRADA',
            cantidad: 50,
            cajero: 'Juan Cajero',
            proveedor: 'Backus',
            observaciones: 'Compra de mercancía',
          },
          {
            id: 2,
            hora: '2024-12-01T14:30:00Z',
            codigoBarra: '7750670003057',
            descripcion: 'Leche Gloria 1L',
            costo: '3.20',
            precioVenta: '4.80',
            existenciaAnterior: 15,
            existenciaNueva: 5,
            existencia: 5,
            invMinimo: 15,
            tipo: 'VENTA',
            cantidad: 10,
            cajero: 'Juan Cajero',
          },
        ];
        
        return movements;
      }
      
      // Usar backend real
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      
      const url = `${API_ENDPOINTS.INVENTORY_MOVEMENTS.BASE}${queryParams.toString() ? `?${queryParams}` : ''}`;
      const response = await httpClient.get<PaginatedMovementsResponse | InventoryMovement[]>(url);
      
      // El backend devuelve { data: [], total, page, etc }
      if (response && typeof response === 'object' && 'data' in response) {
        return (response as PaginatedMovementsResponse).data;
      }
      return Array.isArray(response) ? response : [];
    } catch (error) {
      console.error('Error getting inventory movements:', error);
      return [];
    }
  },

  /**
   * Obtener movimiento por ID
   */
  getById: async (id: number): Promise<InventoryMovement> => {
    try {
      if (API_CONFIG.USE_MOCKS) {
        await simulateDelay();
        
        const movement: InventoryMovement = {
          id,
          hora: new Date().toISOString(),
          codigoBarra: '7751271001234',
          descripcion: 'Producto Mock',
          costo: '0.00',
          precioVenta: '0.00',
          existenciaAnterior: 0,
          existenciaNueva: 0,
          existencia: 0,
          invMinimo: 0,
          tipo: 'ENTRADA',
          cantidad: 10,
          cajero: 'Cajero Mock',
        };
        
        return movement;
      }
      
      return await httpClient.get<InventoryMovement>(API_ENDPOINTS.INVENTORY_MOVEMENTS.BY_ID(id));
    } catch (error) {
      console.error('Error getting inventory movement by ID:', error);
      throw new Error('Error al cargar el movimiento de inventario');
    }
  },

  /**
   * Obtener movimientos del día actual
   */
  getToday: async (): Promise<InventoryMovement[]> => {
    try {
      if (API_CONFIG.USE_MOCKS) {
        await simulateDelay();
        return [];
      }
      
      const response = await httpClient.get<PaginatedMovementsResponse | InventoryMovement[]>(API_ENDPOINTS.INVENTORY_MOVEMENTS.TODAY);
      if (response && typeof response === 'object' && 'data' in response) {
        return (response as PaginatedMovementsResponse).data;
      }
      return Array.isArray(response) ? response : [];
    } catch (error) {
      console.error('Error getting today inventory movements:', error);
      return [];
    }
  },

  /**
   * Obtener movimientos por rango de fechas
   */
  getByDateRange: async (filters: DateRangeFilterParams): Promise<InventoryMovement[]> => {
    try {
      if (API_CONFIG.USE_MOCKS) {
        await simulateDelay();
        return [];
      }
      
      const queryParams = new URLSearchParams();
      if (filters.startDate) queryParams.append('startDate', filters.startDate);
      if (filters.endDate) queryParams.append('endDate', filters.endDate);
      
      const response = await httpClient.get<PaginatedMovementsResponse | InventoryMovement[]>(
        `${API_ENDPOINTS.INVENTORY_MOVEMENTS.BY_RANGE}?${queryParams}`
      );
      if (response && typeof response === 'object' && 'data' in response) {
        return (response as PaginatedMovementsResponse).data;
      }
      return Array.isArray(response) ? response : [];
    } catch (error) {
      console.error('Error getting inventory movements by date range:', error);
      return [];
    }
  },

  /**
   * Obtener movimientos por tipo
   */
  getByType: async (tipo: string): Promise<InventoryMovement[]> => {
    try {
      if (API_CONFIG.USE_MOCKS) {
        await simulateDelay();
        return [];
      }
      
      const response = await httpClient.get<PaginatedMovementsResponse | InventoryMovement[]>(
        API_ENDPOINTS.INVENTORY_MOVEMENTS.BY_TYPE(tipo)
      );
      if (response && typeof response === 'object' && 'data' in response) {
        return (response as PaginatedMovementsResponse).data;
      }
      return Array.isArray(response) ? response : [];
    } catch (error) {
      console.error('Error getting inventory movements by type:', error);
      return [];
    }
  },

  /**
   * Obtener movimientos por cajero
   */
  getByCashier: async (cajero: string): Promise<InventoryMovement[]> => {
    try {
      if (API_CONFIG.USE_MOCKS) {
        await simulateDelay();
        return [];
      }
      
      const response = await httpClient.get<PaginatedMovementsResponse | InventoryMovement[]>(
        API_ENDPOINTS.INVENTORY_MOVEMENTS.BY_CASHIER(cajero)
      );
      if (response && typeof response === 'object' && 'data' in response) {
        return (response as PaginatedMovementsResponse).data;
      }
      return Array.isArray(response) ? response : [];
    } catch (error) {
      console.error('Error getting inventory movements by cashier:', error);
      return [];
    }
  },

  /**
   * Crear movimiento de entrada
   */
  createEntry: async (entryData: InventoryMovementCreateRequest): Promise<InventoryMovement> => {
    try {
      if (API_CONFIG.USE_MOCKS) {
        await simulateDelay();
        
        const newMovement: InventoryMovement = {
          id: Date.now(),
          hora: new Date().toISOString(),
          codigoBarra: entryData.codigoBarra,
          descripcion: 'Producto',
          costo: '0.00',
          precioVenta: '0.00',
          existenciaAnterior: 0,
          existenciaNueva: entryData.cantidad,
          existencia: entryData.cantidad,
          invMinimo: 0,
          tipo: 'ENTRADA',
          cantidad: entryData.cantidad,
          cajero: entryData.cajero || 'Sistema',
          proveedor: entryData.proveedor,
        };
        
        return newMovement;
      }
      
      return await httpClient.post<InventoryMovement>(API_ENDPOINTS.INVENTORY_MOVEMENTS.ENTRY, entryData);
    } catch (error) {
      console.error('Error creating inventory entry:', error);
      throw new Error('Error al crear la entrada de inventario');
    }
  },

  /**
   * Crear movimiento de ajuste
   */
  createAdjustment: async (adjustmentData: InventoryMovementCreateRequest): Promise<InventoryMovement> => {
    try {
      if (API_CONFIG.USE_MOCKS) {
        await simulateDelay();
        
        const newMovement: InventoryMovement = {
          id: Date.now(),
          hora: new Date().toISOString(),
          codigoBarra: adjustmentData.codigoBarra,
          descripcion: 'Producto',
          costo: '0.00',
          precioVenta: '0.00',
          existenciaAnterior: 0,
          existenciaNueva: adjustmentData.cantidad,
          existencia: adjustmentData.cantidad,
          invMinimo: 0,
          tipo: 'AJUSTE',
          cantidad: adjustmentData.cantidad,
          cajero: adjustmentData.cajero || 'Sistema',
        };
        
        return newMovement;
      }
      
      return await httpClient.post<InventoryMovement>(API_ENDPOINTS.INVENTORY_MOVEMENTS.ADJUSTMENT, adjustmentData);
    } catch (error) {
      console.error('Error creating inventory adjustment:', error);
      throw new Error('Error al crear el ajuste de inventario');
    }
  },

  /**
   * Crear movimiento de venta (automático)
   */
  createSaleMovement: async (saleData: InventoryMovementCreateRequest): Promise<InventoryMovement> => {
    try {
      if (API_CONFIG.USE_MOCKS) {
        await simulateDelay();
        
        const newMovement: InventoryMovement = {
          id: Date.now(),
          hora: new Date().toISOString(),
          codigoBarra: saleData.codigoBarra,
          descripcion: 'Producto',
          costo: '0.00',
          precioVenta: '0.00',
          existenciaAnterior: 0,
          existenciaNueva: 0,
          existencia: 0,
          invMinimo: 0,
          tipo: 'VENTA',
          cantidad: saleData.cantidad,
          cajero: saleData.cajero || 'Sistema',
        };
        
        return newMovement;
      }
      
      return await httpClient.post<InventoryMovement>(API_ENDPOINTS.INVENTORY_MOVEMENTS.SALE, saleData);
    } catch (error) {
      console.error('Error creating sale movement:', error);
      throw new Error('Error al crear el movimiento de venta');
    }
  },

  /**
   * Crear movimiento general
   */
  createMovement: async (movementData: Partial<InventoryMovement>): Promise<InventoryMovement> => {
    try {
      if (API_CONFIG.USE_MOCKS) {
        await simulateDelay();
        
        const newMovement: InventoryMovement = {
          id: Date.now(),
          hora: new Date().toISOString(),
          codigoBarra: movementData.codigoBarra || '',
          descripcion: movementData.descripcion || '',
          costo: movementData.costo || '0.00',
          precioVenta: movementData.precioVenta || '0.00',
          existenciaAnterior: movementData.existenciaAnterior || 0,
          existenciaNueva: movementData.existenciaNueva || 0,
          existencia: movementData.existencia || 0,
          invMinimo: movementData.invMinimo || 0,
          tipo: movementData.tipo || 'ENTRADA',
          cantidad: movementData.cantidad || 0,
          cajero: movementData.cajero || 'Sistema',
          proveedor: movementData.proveedor,
        };
        
        return newMovement;
      }
      
      // Mapear datos del frontend al formato del backend
      const createRequest: InventoryMovementCreateRequest = {
        codigoBarra: movementData.codigoBarra || '',
        tipo: (movementData.tipo?.toUpperCase() || 'ENTRADA') as 'ENTRADA' | 'SALIDA' | 'AJUSTE',
        cantidad: movementData.cantidad || 0,
        cajero: movementData.cajero || 'Sistema',
        proveedor: movementData.proveedor || undefined,
      };
      
      return await httpClient.post<InventoryMovement>(API_ENDPOINTS.INVENTORY_MOVEMENTS.BASE, createRequest);
    } catch (error) {
      console.error('Error creating inventory movement:', error);
      throw new Error('Error al crear el movimiento de inventario');
    }
  },

  /**
   * Obtener estadísticas de inventario
   */
  getStatistics: async (filters?: DateRangeFilterParams): Promise<Record<string, unknown>> => {
    try {
      if (API_CONFIG.USE_MOCKS) {
        await simulateDelay();
        
        return {
          totalMovimientos: 0,
          entradas: { cantidad: 0, total: 0 },
          salidas: { cantidad: 0, total: 0 },
          ajustes: { cantidad: 0, total: 0 },
          movimientosHoy: 0,
        };
      }
      
      const queryParams = new URLSearchParams();
      if (filters?.startDate) queryParams.append('startDate', filters.startDate);
      if (filters?.endDate) queryParams.append('endDate', filters.endDate);
      
      const url = `${API_ENDPOINTS.INVENTORY_MOVEMENTS.STATISTICS}${queryParams.toString() ? `?${queryParams}` : ''}`;
      return await httpClient.get<Record<string, unknown>>(url);
    } catch (error) {
      console.error('Error getting inventory statistics:', error);
      throw new Error('Error al cargar las estadísticas de inventario');
    }
  },
};
