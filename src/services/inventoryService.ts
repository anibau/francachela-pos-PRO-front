import { API_CONFIG, API_ENDPOINTS } from '@/config/api';
import { httpClient, simulateDelay } from './httpClient';
import type { InventoryMovement } from '@/types';
import type { 
  InventoryMovementCreateRequest,
  PaginationParams,
  DateRangeFilter 
} from '@/types/api';

export const inventoryService = {
  /**
   * Obtener todos los movimientos de inventario
   */
  getMovements: async (params?: PaginationParams): Promise<InventoryMovement[]> => {
    try {
      if (API_CONFIG.USE_MOCKS) {
        await simulateDelay();
        
        // Mock de movimientos de inventario
        let movements: InventoryMovement[] = [
          {
            id: 1,
            TIPO: 'entrada',
            PRODUCTO_ID: 1,
            PRODUCTO_NOMBRE: 'Cerveza Pilsen 650ml',
            CANTIDAD: 50,
            HORA: '2024-12-01T09:00:00Z',
            DESCRIPCION: 'Compra de mercancía',
            CAJERO: 'Juan Cajero',
          },
          {
            id: 2,
            TIPO: 'salida',
            PRODUCTO_ID: 4,
            PRODUCTO_NOMBRE: 'Leche Gloria 1L',
            CANTIDAD: 10,
            HORA: '2024-12-01T14:30:00Z',
            DESCRIPCION: 'Venta',
            CAJERO: 'Juan Cajero',
          },
          {
            id: 3,
            TIPO: 'ajuste',
            PRODUCTO_ID: 2,
            PRODUCTO_NOMBRE: 'Inca Kola 500ml',
            CANTIDAD: 5,
            HORA: '2024-12-01T16:15:00Z',
            DESCRIPCION: 'Ajuste por inventario físico',
            CAJERO: 'Supervisor',
          },
          {
            id: 4,
            TIPO: 'entrada',
            PRODUCTO_ID: 3,
            PRODUCTO_NOMBRE: 'Chips Lays 180g',
            CANTIDAD: 30,
            HORA: '2024-12-01T11:20:00Z',
            DESCRIPCION: 'Reposición de stock',
            CAJERO: 'Juan Cajero',
          },
        ];
        
        // Aplicar filtro de búsqueda si existe
        if (params?.search) {
          const searchTerm = params.search.toLowerCase();
          movements = movements.filter(movement => 
            movement.PRODUCTO_NOMBRE.toLowerCase().includes(searchTerm) ||
            movement.DESCRIPCION.toLowerCase().includes(searchTerm) ||
            movement.CAJERO.toLowerCase().includes(searchTerm)
          );
        }
        
        return movements.sort((a, b) => 
          new Date(b.HORA).getTime() - new Date(a.HORA).getTime()
        );
      }
      
      // Usar backend real
      const queryParams = new URLSearchParams();
      if (params?.search) queryParams.append('search', params.search);
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      
      const url = `${API_ENDPOINTS.INVENTORY_MOVEMENTS.BASE}${queryParams.toString() ? `?${queryParams}` : ''}`;
      return await httpClient.get<InventoryMovement[]>(url);
    } catch (error) {
      console.error('Error getting inventory movements:', error);
      throw new Error('Error al cargar los movimientos de inventario');
    }
  },

  /**
   * Obtener movimiento por ID
   */
  getById: async (id: number): Promise<InventoryMovement> => {
    try {
      if (API_CONFIG.USE_MOCKS) {
        await simulateDelay();
        
        // Mock simple para obtener por ID
        const movement: InventoryMovement = {
          id,
          TIPO: 'entrada',
          PRODUCTO_ID: 1,
          PRODUCTO_NOMBRE: 'Producto Mock',
          CANTIDAD: 10,
          HORA: new Date().toISOString(),
          DESCRIPCION: 'Movimiento mock',
          CAJERO: 'Cajero Mock',
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
        
        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];
        
        const allMovements = await this.getMovements();
        return allMovements.filter(movement => 
          movement.HORA.startsWith(todayStr)
        );
      }
      
      return await httpClient.get<InventoryMovement[]>(API_ENDPOINTS.INVENTORY_MOVEMENTS.TODAY);
    } catch (error) {
      console.error('Error getting today inventory movements:', error);
      throw new Error('Error al cargar los movimientos del día');
    }
  },

  /**
   * Obtener movimientos por rango de fechas
   */
  getByDateRange: async (filters: DateRangeFilter): Promise<InventoryMovement[]> => {
    try {
      if (API_CONFIG.USE_MOCKS) {
        await simulateDelay();
        
        const fromDate = new Date(filters.from);
        const toDate = new Date(filters.to);
        
        const allMovements = await this.getMovements();
        return allMovements.filter(movement => {
          const movementDate = new Date(movement.HORA);
          return movementDate >= fromDate && movementDate <= toDate;
        });
      }
      
      const queryParams = new URLSearchParams({
        from: filters.from,
        to: filters.to,
      });
      
      return await httpClient.get<InventoryMovement[]>(`${API_ENDPOINTS.INVENTORY_MOVEMENTS.BY_RANGE}?${queryParams}`);
    } catch (error) {
      console.error('Error getting inventory movements by date range:', error);
      throw new Error('Error al cargar los movimientos por fecha');
    }
  },

  /**
   * Obtener movimientos por tipo
   */
  getByType: async (tipo: string): Promise<InventoryMovement[]> => {
    try {
      if (API_CONFIG.USE_MOCKS) {
        await simulateDelay();
        
        const allMovements = await this.getMovements();
        return allMovements.filter(movement => 
          movement.TIPO.toLowerCase() === tipo.toLowerCase()
        );
      }
      
      return await httpClient.get<InventoryMovement[]>(API_ENDPOINTS.INVENTORY_MOVEMENTS.BY_TYPE(tipo));
    } catch (error) {
      console.error('Error getting inventory movements by type:', error);
      throw new Error('Error al cargar los movimientos por tipo');
    }
  },

  /**
   * Obtener movimientos por cajero
   */
  getByCashier: async (cajero: string): Promise<InventoryMovement[]> => {
    try {
      if (API_CONFIG.USE_MOCKS) {
        await simulateDelay();
        
        const allMovements = await this.getMovements();
        return allMovements.filter(movement => 
          movement.CAJERO.toLowerCase().includes(cajero.toLowerCase())
        );
      }
      
      return await httpClient.get<InventoryMovement[]>(API_ENDPOINTS.INVENTORY_MOVEMENTS.BY_CASHIER(cajero));
    } catch (error) {
      console.error('Error getting inventory movements by cashier:', error);
      throw new Error('Error al cargar los movimientos por cajero');
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
          TIPO: 'entrada',
          PRODUCTO_ID: entryData.productoId,
          PRODUCTO_NOMBRE: entryData.productoNombre || `Producto ${entryData.productoId}`,
          CANTIDAD: entryData.cantidad,
          HORA: new Date().toISOString(),
          DESCRIPCION: entryData.descripcion || 'Entrada de mercancía',
          CAJERO: entryData.cajero || 'Sistema',
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
          TIPO: 'ajuste',
          PRODUCTO_ID: adjustmentData.productoId,
          PRODUCTO_NOMBRE: adjustmentData.productoNombre || `Producto ${adjustmentData.productoId}`,
          CANTIDAD: adjustmentData.cantidad,
          HORA: new Date().toISOString(),
          DESCRIPCION: adjustmentData.descripcion || 'Ajuste de inventario',
          CAJERO: adjustmentData.cajero || 'Sistema',
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
          TIPO: 'salida',
          PRODUCTO_ID: saleData.productoId,
          PRODUCTO_NOMBRE: saleData.productoNombre || `Producto ${saleData.productoId}`,
          CANTIDAD: saleData.cantidad,
          HORA: new Date().toISOString(),
          DESCRIPCION: saleData.descripcion || 'Venta',
          CAJERO: saleData.cajero || 'Sistema',
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
  createMovement: async (movementData: Omit<InventoryMovement, 'id'>): Promise<InventoryMovement> => {
    try {
      if (API_CONFIG.USE_MOCKS) {
        await simulateDelay();
        
        const newMovement: InventoryMovement = {
          ...movementData,
          id: Date.now(),
          HORA: new Date().toISOString(),
        };
        
        return newMovement;
      }
      
      // Mapear datos del frontend al formato del backend
      const createRequest: InventoryMovementCreateRequest = {
        productoId: movementData.PRODUCTO_ID,
        productoNombre: movementData.PRODUCTO_NOMBRE,
        tipo: movementData.TIPO.toUpperCase() as 'ENTRADA' | 'SALIDA' | 'AJUSTE',
        cantidad: movementData.CANTIDAD,
        descripcion: movementData.DESCRIPCION,
        cajero: movementData.CAJERO,
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
  getStatistics: async (filters?: DateRangeFilter): Promise<any> => {
    try {
      if (API_CONFIG.USE_MOCKS) {
        await simulateDelay();
        
        let movements = await this.getMovements();
        
        if (filters) {
          const fromDate = new Date(filters.from);
          const toDate = new Date(filters.to);
          
          movements = movements.filter(movement => {
            const movementDate = new Date(movement.HORA);
            return movementDate >= fromDate && movementDate <= toDate;
          });
        }
        
        const entradas = movements.filter(m => m.TIPO === 'entrada');
        const salidas = movements.filter(m => m.TIPO === 'salida');
        const ajustes = movements.filter(m => m.TIPO === 'ajuste');
        
        const totalEntradas = entradas.reduce((sum, m) => sum + m.CANTIDAD, 0);
        const totalSalidas = salidas.reduce((sum, m) => sum + m.CANTIDAD, 0);
        const totalAjustes = ajustes.reduce((sum, m) => sum + Math.abs(m.CANTIDAD), 0);
        
        return {
          totalMovimientos: movements.length,
          entradas: {
            cantidad: entradas.length,
            total: totalEntradas,
          },
          salidas: {
            cantidad: salidas.length,
            total: totalSalidas,
          },
          ajustes: {
            cantidad: ajustes.length,
            total: totalAjustes,
          },
          movimientosHoy: movements.filter(m => 
            m.HORA.startsWith(new Date().toISOString().split('T')[0])
          ).length,
          productoConMasMovimientos: 'Cerveza Pilsen 650ml', // Mock
          cajeroMasActivo: 'Juan Cajero', // Mock
        };
      }
      
      const queryParams = new URLSearchParams();
      if (filters?.from) queryParams.append('from', filters.from);
      if (filters?.to) queryParams.append('to', filters.to);
      
      const url = `${API_ENDPOINTS.INVENTORY_MOVEMENTS.STATISTICS}${queryParams.toString() ? `?${queryParams}` : ''}`;
      return await httpClient.get<any>(url);
    } catch (error) {
      console.error('Error getting inventory statistics:', error);
      throw new Error('Error al cargar las estadísticas de inventario');
    }
  },
};
