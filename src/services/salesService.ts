import { API_CONFIG, API_ENDPOINTS } from '@/config/api';
import { httpClient, simulateDelay } from './httpClient';
import { mockSalesAligned } from './mockDataAligned';
import type { Sale } from '@/types';
import type { 
  SaleCreateRequest,
  PaginationParams,
  DateRangeFilter,
  SalesStatistics 
} from '@/types/api';

export const salesService = {
  /**
   * Obtener todas las ventas
   */
  getAll: async (params?: PaginationParams): Promise<Sale[]> => {
    try {
      if (API_CONFIG.USE_MOCKS) {
        await simulateDelay();
        
        let sales = [...mockSalesAligned];
        
        // Aplicar filtro de búsqueda si existe
        if (params?.search) {
          const searchTerm = params.search.toLowerCase();
          sales = sales.filter(sale => 
            sale.ticketId.toLowerCase().includes(searchTerm) ||
            (sale.client?.name && sale.client.name.toLowerCase().includes(searchTerm)) ||
            sale.cashier.toLowerCase().includes(searchTerm)
          );
        }
        
        return sales;
      }
      
      // Usar backend real
      const queryParams = new URLSearchParams();
      if (params?.search) queryParams.append('search', params.search);
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      
      const url = `${API_ENDPOINTS.SALES.BASE}${queryParams.toString() ? `?${queryParams}` : ''}`;
      return await httpClient.get<Sale[]>(url);
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
      if (API_CONFIG.USE_MOCKS) {
        await simulateDelay();
        
        const sale = mockSalesAligned.find(s => s.id === id);
        if (!sale) {
          throw new Error('Venta no encontrada');
        }
        return sale;
      }
      
      return await httpClient.get<Sale>(API_ENDPOINTS.SALES.BY_ID(id));
    } catch (error) {
      console.error('Error getting sale by ID:', error);
      throw new Error('Error al cargar la venta');
    }
  },

  /**
   * Obtener ventas por cliente
   */
  getByClient: async (clientId: number): Promise<Sale[]> => {
    try {
      if (API_CONFIG.USE_MOCKS) {
        await simulateDelay();
        
        return mockSalesAligned.filter(sale => sale.clientId === clientId);
      }
      
      return await httpClient.get<Sale[]>(API_ENDPOINTS.SALES.BY_CLIENT(clientId));
    } catch (error) {
      console.error('Error getting sales by client:', error);
      throw new Error('Error al cargar las ventas del cliente');
    }
  },

  /**
   * Obtener estadísticas de ventas
   */
  getStatistics: async (filters?: DateRangeFilter): Promise<SalesStatistics> => {
    try {
      if (API_CONFIG.USE_MOCKS) {
        await simulateDelay();
        
        // Mock de estadísticas
        return {
          totalVentas: mockSalesAligned.length,
          ventasHoy: 2,
          ventasSemana: 15,
          ventasMes: 45,
          promedioVenta: 16.05,
          productosVendidos: 8,
        };
      }
      
      const queryParams = new URLSearchParams();
      if (filters?.from) queryParams.append('from', filters.from);
      if (filters?.to) queryParams.append('to', filters.to);
      
      const url = `${API_ENDPOINTS.SALES.STATISTICS}${queryParams.toString() ? `?${queryParams}` : ''}`;
      return await httpClient.get<SalesStatistics>(url);
    } catch (error) {
      console.error('Error getting sales statistics:', error);
      throw new Error('Error al cargar las estadísticas de ventas');
    }
  },

  /**
   * Obtener ventas por rango de fechas
   */
  getByDateRange: async (filters: DateRangeFilter): Promise<Sale[]> => {
    try {
      if (API_CONFIG.USE_MOCKS) {
        await simulateDelay();
        
        const fromDate = new Date(filters.from);
        const toDate = new Date(filters.to);
        
        return mockSalesAligned.filter(sale => {
          const saleDate = new Date(sale.date);
          return saleDate >= fromDate && saleDate <= toDate;
        });
      }
      
      const queryParams = new URLSearchParams({
        from: filters.from,
        to: filters.to,
      });
      
      return await httpClient.get<Sale[]>(`${API_ENDPOINTS.SALES.BY_RANGE}?${queryParams}`);
    } catch (error) {
      console.error('Error getting sales by date range:', error);
      throw new Error('Error al cargar las ventas por fecha');
    }
  },

  /**
   * Obtener venta por ticket ID
   */
  getByTicket: async (ticketId: string): Promise<Sale | null> => {
    try {
      if (API_CONFIG.USE_MOCKS) {
        await simulateDelay();
        
        const sale = mockSalesAligned.find(s => s.ticketId === ticketId);
        return sale || null;
      }
      
      return await httpClient.get<Sale>(API_ENDPOINTS.SALES.BY_TICKET(ticketId));
    } catch (error) {
      console.error('Error getting sale by ticket:', error);
      return null;
    }
  },

  /**
   * Obtener ventas del día actual
   */
  getToday: async (): Promise<Sale[]> => {
    try {
      if (API_CONFIG.USE_MOCKS) {
        await simulateDelay();
        
        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];
        
        return mockSalesAligned.filter(sale => 
          sale.date.startsWith(todayStr)
        );
      }
      
      return await httpClient.get<Sale[]>(API_ENDPOINTS.SALES.TODAY);
    } catch (error) {
      console.error('Error getting today sales:', error);
      throw new Error('Error al cargar las ventas del día');
    }
  },

  /**
   * Crear nueva venta
   */
  create: async (saleData: SaleCreateRequest): Promise<Sale> => {
    try {
      if (API_CONFIG.USE_MOCKS) {
        await simulateDelay();
        
        // Calcular totales
        const subtotal = saleData.listaProductos.reduce((sum, item) => 
          sum + (item.cantidad * item.precioUnitario), 0
        );
        const descuento = saleData.descuento || 0;
        const total = subtotal - descuento;
        
        // Generar ticket ID
        const ticketId = `T-${String(mockSalesAligned.length + 1).padStart(3, '0')}-2024`;
        
        const newSale: Sale = {
          id: Math.max(...mockSalesAligned.map(s => s.id)) + 1,
          ticketId,
          date: new Date().toISOString(),
          clientId: saleData.clienteId,
          client: saleData.clienteId ? { id: saleData.clienteId, name: 'Cliente Mock', email: '', phone: '', address: '', dni: '', points: 0, isActive: true } : undefined,
          items: saleData.listaProductos.map(item => ({
            productId: item.productoId,
            productName: `Producto ${item.productoId}`,
            quantity: item.cantidad,
            price: item.precioUnitario,
            subtotal: item.cantidad * item.precioUnitario,
          })),
          subtotal: subtotal,
          discount: descuento,
          total,
          paymentMethod: saleData.metodoPago,
          notes: saleData.comentario,
          cashier: 'Cajero Mock',
          status: 'COMPLETADA',
          pointsEarned: Math.floor(total),
          pointsUsed: saleData.puntosUsados || 0,
          tipoCompra: saleData.tipoCompra || 'LOCAL',
          montoRecibido: saleData.montoRecibido,
          vuelto: saleData.montoRecibido ? saleData.montoRecibido - total : 0,
          // Getters para compatibilidad
          get date() { return this.fecha; },
          get clientId() { return this.clienteId; },
          get clientName() { return this.clienteNombre; },
          get items() { return this.listaProductos; },
          get subtotal() { return this.subTotal; },
          get discount() { return this.descuento; },
          get paymentMethod() { return this.metodoPago; },
          get notes() { return this.comentario; },
          get cashier() { return this.cajero; },
          get status() { return this.estado.toLowerCase() as 'completada' | 'anulada'; },
          get pointsEarned() { return this.puntosOtorgados; },
          get pointsUsed() { return this.puntosUsados; },
          get ticketNumber() { return this.ticketId; },
        };
        
        mockSalesAligned.push(newSale);
        return newSale;
      }
      
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
      if (API_CONFIG.USE_MOCKS) {
        await simulateDelay();
        
        const index = mockSalesAligned.findIndex(s => s.id === id);
        if (index === -1) {
          throw new Error('Venta no encontrada');
        }
        
        mockSalesAligned[index].status = 'ANULADA';
        return mockSalesAligned[index];
      }
      
      return await httpClient.patch<Sale>(API_ENDPOINTS.SALES.CANCEL(id));
    } catch (error) {
      console.error('Error canceling sale:', error);
      throw new Error('Error al anular la venta');
    }
  },

  /**
   * Procesar devolución
   */
  processReturn: async (id: number, returnData: { items: Array<{ productId: number; quantity: number; reason: string }> }): Promise<Sale> => {
    try {
      if (API_CONFIG.USE_MOCKS) {
        await simulateDelay();
        
        const index = mockSalesAligned.findIndex(s => s.id === id);
        if (index === -1) {
          throw new Error('Venta no encontrada');
        }
        
        // Mock de devolución - crear nueva venta con valores negativos
        const originalSale = mockSalesAligned[index];
        const returnSale: Sale = {
          ...originalSale,
          id: Math.max(...mockSalesAligned.map(s => s.id)) + 1,
          ticketId: `DEV-${originalSale.ticketId}`,
          date: new Date().toISOString(),
          total: -originalSale.total,
          subtotal: -originalSale.subtotal,
          notes: `Devolución de ${originalSale.ticketId}`,
        };
        
        mockSalesAligned.push(returnSale);
        return returnSale;
      }
      
      return await httpClient.post<Sale>(API_ENDPOINTS.SALES.RETURN(id), returnData);
    } catch (error) {
      console.error('Error processing return:', error);
      throw new Error('Error al procesar la devolución');
    }
  },

  /**
   * Buscar ventas
   */
  search: async (query: string): Promise<Sale[]> => {
    try {
      if (API_CONFIG.USE_MOCKS) {
        await simulateDelay();
        
        const searchTerm = query.toLowerCase();
        return mockSalesAligned.filter(sale => 
          sale.ticketId.toLowerCase().includes(searchTerm) ||
          (sale.client?.name && sale.client.name.toLowerCase().includes(searchTerm)) ||
          sale.cashier.toLowerCase().includes(searchTerm)
        );
      }
      
      // Para el backend real, usar el endpoint de getAll con parámetro search
      return await this.getAll({ search: query });
    } catch (error) {
      console.error('Error searching sales:', error);
      throw new Error('Error al buscar ventas');
    }
  },

  /**
   * Obtener resumen de ventas por método de pago
   */
  getPaymentMethodSummary: async (filters?: DateRangeFilter): Promise<Record<string, number>> => {
    try {
      if (API_CONFIG.USE_MOCKS) {
        await simulateDelay();
        
        let sales = [...mockSalesAligned];
        
        if (filters) {
          const fromDate = new Date(filters.from);
          const toDate = new Date(filters.to);
          
          sales = sales.filter(sale => {
            const saleDate = new Date(sale.date);
            return saleDate >= fromDate && saleDate <= toDate;
          });
        }
        
        const summary: Record<string, number> = {};
        sales.forEach(sale => {
          summary[sale.paymentMethod] = (summary[sale.paymentMethod] || 0) + sale.total;
        });
        
        return summary;
      }
      
      // Para el backend real, esto podría ser parte de las estadísticas
      const stats = await this.getStatistics(filters);
      return {
        'EFECTIVO': stats.totalVentas * 0.6, // Mock distribution
        'YAPE': stats.totalVentas * 0.25,
        'PLIN': stats.totalVentas * 0.10,
        'TARJETA': stats.totalVentas * 0.05,
      };
    } catch (error) {
      console.error('Error getting payment method summary:', error);
      throw new Error('Error al cargar el resumen por método de pago');
    }
  },
};
