import { API_CONFIG, API_ENDPOINTS } from '@/config/api';
import { httpClient, simulateDelay } from './httpClient';
import { mockCashRegistersAligned } from './mockDataAligned';
import type { CashRegister } from '@/types';
import type { 
  CashRegisterOpenRequest,
  CashRegisterCloseRequest,
  CashRegisterStatistics,
  DateRangeFilter 
} from '@/types/api';

export const cashRegisterService = {
  /**
   * Obtener caja registradora actual (abierta)
   */
  getCurrent: async (): Promise<CashRegister | null> => {
    try {
      if (API_CONFIG.USE_MOCKS) {
        await simulateDelay();
        
        const openRegister = mockCashRegistersAligned.find(cr => cr.status === 'open');
        return openRegister || null;
      }
      
      return await httpClient.get<CashRegister>(API_ENDPOINTS.CASH_REGISTER.CURRENT);
    } catch (error) {
      console.error('Error getting current cash register:', error);
      return null; // No lanzar error si no hay caja abierta
    }
  },

  /**
   * Obtener historial de cajas registradoras
   */
  getHistory: async (filters?: DateRangeFilter): Promise<CashRegister[]> => {
    try {
      if (API_CONFIG.USE_MOCKS) {
        await simulateDelay();
        
        let registers = [...mockCashRegistersAligned];
        
        if (filters) {
          const fromDate = new Date(filters.from);
          const toDate = new Date(filters.to);
          
          registers = registers.filter(register => {
            const openDate = new Date(register.openedAt);
            return openDate >= fromDate && openDate <= toDate;
          });
        }
        
        return registers.sort((a, b) => 
          new Date(b.openedAt).getTime() - new Date(a.openedAt).getTime()
        );
      }
      
      const queryParams = new URLSearchParams();
      if (filters?.from) queryParams.append('from', filters.from);
      if (filters?.to) queryParams.append('to', filters.to);
      
      const url = `${API_ENDPOINTS.CASH_REGISTER.BY_RANGE}${queryParams.toString() ? `?${queryParams}` : ''}`;
      return await httpClient.get<CashRegister[]>(url);
    } catch (error) {
      console.error('Error getting cash register history:', error);
      throw new Error('Error al cargar el historial de cajas');
    }
  },

  /**
   * Obtener caja registradora por ID
   */
  getById: async (id: number): Promise<CashRegister> => {
    try {
      if (API_CONFIG.USE_MOCKS) {
        await simulateDelay();
        
        const register = mockCashRegistersAligned.find(cr => cr.id === id);
        if (!register) {
          throw new Error('Caja registradora no encontrada');
        }
        return register;
      }
      
      return await httpClient.get<CashRegister>(API_ENDPOINTS.CASH_REGISTER.BY_ID(id));
    } catch (error) {
      console.error('Error getting cash register by ID:', error);
      throw new Error('Error al cargar la caja registradora');
    }
  },

  /**
   * Abrir caja registradora
   */
  open: async (openData: CashRegisterOpenRequest): Promise<CashRegister> => {
    try {
      if (API_CONFIG.USE_MOCKS) {
        await simulateDelay();
        
        // Verificar que no haya una caja abierta
        const existingOpen = mockCashRegistersAligned.find(cr => cr.status === 'open');
        if (existingOpen) {
          throw new Error('Ya hay una caja registradora abierta');
        }
        
        const newRegister: CashRegister = {
          id: Math.max(...mockCashRegistersAligned.map(cr => cr.id)) + 1,
          cashier: openData.cajero,
          openedAt: new Date().toISOString(),
          initialCash: openData.montoInicial,
          totalSales: 0,
          totalExpenses: 0,
          status: 'open',
          paymentBreakdown: {
            efectivo: openData.montoInicial,
            yape: 0,
            plin: 0,
            tarjeta: 0,
          },
        };
        
        mockCashRegistersAligned.push(newRegister);
        return newRegister;
      }
      
      return await httpClient.post<CashRegister>(API_ENDPOINTS.CASH_REGISTER.OPEN, openData);
    } catch (error) {
      console.error('Error opening cash register:', error);
      throw new Error('Error al abrir la caja registradora');
    }
  },

  /**
   * Cerrar caja registradora
   */
  close: async (id: number, closeData: CashRegisterCloseRequest): Promise<CashRegister> => {
    try {
      if (API_CONFIG.USE_MOCKS) {
        await simulateDelay();
        
        const index = mockCashRegistersAligned.findIndex(cr => cr.id === id);
        if (index === -1) {
          throw new Error('Caja registradora no encontrada');
        }
        
        if (mockCashRegistersAligned[index].status !== 'open') {
          throw new Error('La caja registradora no está abierta');
        }
        
        mockCashRegistersAligned[index] = {
          ...mockCashRegistersAligned[index],
          closedAt: new Date().toISOString(),
          finalCash: closeData.montoFinal,
          status: 'closed',
          notes: closeData.observaciones,
        };
        
        return mockCashRegistersAligned[index];
      }
      
      return await httpClient.patch<CashRegister>(
        API_ENDPOINTS.CASH_REGISTER.CLOSE(id), 
        closeData
      );
    } catch (error) {
      console.error('Error closing cash register:', error);
      throw new Error('Error al cerrar la caja registradora');
    }
  },

  /**
   * Obtener resumen de caja registradora
   */
  getSummary: async (id: number): Promise<any> => {
    try {
      if (API_CONFIG.USE_MOCKS) {
        await simulateDelay();
        
        const register = mockCashRegistersAligned.find(cr => cr.id === id);
        if (!register) {
          throw new Error('Caja registradora no encontrada');
        }
        
        // Mock de resumen detallado
        return {
          cajaId: register.id,
          cajero: register.cashier,
          fechaApertura: register.openedAt,
          fechaCierre: register.closedAt,
          montoInicial: register.initialCash,
          montoFinal: register.finalCash,
          totalVentas: register.totalSales,
          totalGastos: register.totalExpenses,
          diferencia: register.finalCash ? 
            (register.finalCash - register.initialCash - register.totalSales + register.totalExpenses) : 0,
          desglosePagos: register.paymentBreakdown,
          ventasCount: 25, // Mock
          gastosCount: 3,  // Mock
        };
      }
      
      return await httpClient.get<any>(API_ENDPOINTS.CASH_REGISTER.SUMMARY);
    } catch (error) {
      console.error('Error getting cash register summary:', error);
      throw new Error('Error al cargar el resumen de caja');
    }
  },

  /**
   * Obtener estadísticas de cajas registradoras
   */
  getStatistics: async (filters?: DateRangeFilter): Promise<CashRegisterStatistics> => {
    try {
      if (API_CONFIG.USE_MOCKS) {
        await simulateDelay();
        
        let registers = [...mockCashRegistersAligned];
        
        if (filters) {
          const fromDate = new Date(filters.from);
          const toDate = new Date(filters.to);
          
          registers = registers.filter(register => {
            const openDate = new Date(register.openedAt);
            return openDate >= fromDate && openDate <= toDate;
          });
        }
        
        const closedRegisters = registers.filter(r => r.status === 'closed');
        
        return {
          totalCajas: registers.length,
          cajasAbiertas: registers.filter(r => r.status === 'open').length,
          cajasCerradas: closedRegisters.length,
          totalVentas: closedRegisters.reduce((sum, r) => sum + r.totalSales, 0),
          totalGastos: closedRegisters.reduce((sum, r) => sum + r.totalExpenses, 0),
          promedioVentasPorCaja: closedRegisters.length > 0 ? 
            closedRegisters.reduce((sum, r) => sum + r.totalSales, 0) / closedRegisters.length : 0,
          cajeroMasActivo: 'Juan Cajero', // Mock
        };
      }
      
      const queryParams = new URLSearchParams();
      if (filters?.from) queryParams.append('from', filters.from);
      if (filters?.to) queryParams.append('to', filters.to);
      
      const url = `${API_ENDPOINTS.CASH_REGISTER.STATISTICS}${queryParams.toString() ? `?${queryParams}` : ''}`;
      return await httpClient.get<CashRegisterStatistics>(url);
    } catch (error) {
      console.error('Error getting cash register statistics:', error);
      throw new Error('Error al cargar las estadísticas de caja');
    }
  },

  /**
   * Actualizar totales de caja (para sincronización)
   */
  updateTotals: async (id: number, totals: { totalSales?: number; totalExpenses?: number; paymentBreakdown?: any }): Promise<CashRegister> => {
    try {
      if (API_CONFIG.USE_MOCKS) {
        await simulateDelay();
        
        const index = mockCashRegistersAligned.findIndex(cr => cr.id === id);
        if (index === -1) {
          throw new Error('Caja registradora no encontrada');
        }
        
        mockCashRegistersAligned[index] = {
          ...mockCashRegistersAligned[index],
          ...totals,
        };
        
        return mockCashRegistersAligned[index];
      }
      
      // Para el backend real, esto podría ser un endpoint específico o parte del cierre
      return await httpClient.patch<CashRegister>(
        API_ENDPOINTS.CASH_REGISTER.BY_ID(id), 
        totals
      );
    } catch (error) {
      console.error('Error updating cash register totals:', error);
      throw new Error('Error al actualizar los totales de caja');
    }
  },
};
