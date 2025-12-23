import { API_CONFIG, API_ENDPOINTS } from '@/config/api';
import { httpClient, simulateDelay } from './httpClient';
import { mockCashRegistersAligned } from './mockDataAligned';
import { ensureArray } from '@/utils/apiValidators';
import { extractErrorMessage } from '@/utils/errorHandler';
import type { CashRegister, CashRegisterStatus } from '@/types';
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
        
        const openRegister = mockCashRegistersAligned.find(cr => cr.estado === 'ABIERTA');
        return openRegister || null;
      }
      
      return await httpClient.get<CashRegister>(API_ENDPOINTS.CASH_REGISTER.CURRENT);
    } catch (error) {
      console.error('Error getting current cash register:', error);
      return null;
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
        
        if (filters?.startDate && filters?.endDate) {
          const fromDate = new Date(filters.startDate);
          const toDate = new Date(filters.endDate);
          
          registers = registers.filter(register => {
            const openDate = new Date(register.fechaApertura);
            return openDate >= fromDate && openDate <= toDate;
          });
        }
        
        return registers.sort((a, b) => 
          new Date(b.fechaApertura).getTime() - new Date(a.fechaApertura).getTime()
        );
      }
      
      const queryParams = new URLSearchParams();
      if (filters?.startDate) queryParams.append('fechaInicio', filters.startDate);
      if (filters?.endDate) queryParams.append('fechaFin', filters.endDate);
      
      const url = `${API_ENDPOINTS.CASH_REGISTER.BY_RANGE}${queryParams.toString() ? `?${queryParams}` : ''}`;
      const result = await httpClient.get<CashRegister[]>(url);
      // Asegurar que siempre retorna un array
      return ensureArray(result, []);
    } catch (error) {
      console.error('Error getting cash register history:', error);
      // Retornar array vacío en lugar de lanzar error
      return [];
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
      throw new Error(extractErrorMessage(error));
    }
  },

  /**
   * Abrir caja registradora
   */
  open: async (openData: CashRegisterOpenRequest): Promise<CashRegister> => {
    try {
      if (API_CONFIG.USE_MOCKS) {
        await simulateDelay();
        
        const existingOpen = mockCashRegistersAligned.find(cr => cr.estado === 'ABIERTA');
        if (existingOpen) {
          throw new Error('Ya hay una caja registradora abierta');
        }
        
        const newRegister: CashRegister = {
          id: Math.max(...mockCashRegistersAligned.map(cr => cr.id)) + 1,
          cajero: openData.cajero || 'Sistema',
          fechaApertura: new Date().toISOString(),
          montoInicial: openData.montoInicial,
          totalVentas: 0,
          totalGastos: 0,
          estado: 'ABIERTA',
          desglosePorMetodo: {
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
      throw new Error(extractErrorMessage(error));
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
        
        if (mockCashRegistersAligned[index].estado !== 'ABIERTA') {
          throw new Error('La caja registradora no está abierta');
        }
        
        mockCashRegistersAligned[index] = {
          ...mockCashRegistersAligned[index],
          fechaCierre: new Date().toISOString(),
          montoFinal: closeData.montoFinal,
          estado: 'CERRADA',
          observaciones: closeData.observaciones,
        };
        
        return mockCashRegistersAligned[index];
      }
      
      return await httpClient.patch<CashRegister>(
        API_ENDPOINTS.CASH_REGISTER.CLOSE(id), 
        closeData
      );
    } catch (error) {
      console.error('Error closing cash register:', error);
      throw new Error(extractErrorMessage(error));
    }
  },

  /**
   * Obtener resumen de caja registradora
   */
  getSummary: async (id: number): Promise<CashRegisterStatistics> => {
    try {
      if (API_CONFIG.USE_MOCKS) {
        await simulateDelay();
        
        const register = mockCashRegistersAligned.find(cr => cr.id === id);
        if (!register) {
          throw new Error('Caja registradora no encontrada');
        }
        
        return {
          ventasEfectivo: register.desglosePorMetodo?.efectivo || 0,
          ventasYape: register.desglosePorMetodo?.yape || 0,
          ventasPlin: register.desglosePorMetodo?.plin || 0,
          ventasTarjeta: register.desglosePorMetodo?.tarjeta || 0,
          totalVentas: register.totalVentas,
          totalGastos: register.totalGastos,
          diferencia: register.totalVentas - register.totalGastos,
          totalCajas: 1,
          cajasAbiertas: register.estado === 'ABIERTA' ? 1 : 0,
          cajasCerradas: register.estado === 'CERRADA' ? 1 : 0,
        };
      }
      
      return await httpClient.get<CashRegisterStatistics>(API_ENDPOINTS.CASH_REGISTER.SUMMARY);
    } catch (error) {
      console.error('Error getting cash register summary:', error);
      throw new Error(extractErrorMessage(error));
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
        
        if (filters?.startDate && filters?.endDate) {
          const fromDate = new Date(filters.startDate);
          const toDate = new Date(filters.endDate);
          
          registers = registers.filter(register => {
            const openDate = new Date(register.fechaApertura);
            return openDate >= fromDate && openDate <= toDate;
          });
        }
        
        const closedRegisters = registers.filter(r => r.estado === 'CERRADA');
        const totalVentas = closedRegisters.reduce((sum, r) => sum + r.totalVentas, 0);
        const totalGastos = closedRegisters.reduce((sum, r) => sum + r.totalGastos, 0);
        
        return {
          ventasEfectivo: closedRegisters.reduce((sum, r) => sum + (r.desglosePorMetodo?.efectivo || 0), 0),
          ventasYape: closedRegisters.reduce((sum, r) => sum + (r.desglosePorMetodo?.yape || 0), 0),
          ventasPlin: closedRegisters.reduce((sum, r) => sum + (r.desglosePorMetodo?.plin || 0), 0),
          ventasTarjeta: closedRegisters.reduce((sum, r) => sum + (r.desglosePorMetodo?.tarjeta || 0), 0),
          totalVentas,
          totalGastos,
          diferencia: totalVentas - totalGastos,
          totalCajas: registers.length,
          cajasAbiertas: registers.filter(r => r.estado === 'ABIERTA').length,
          cajasCerradas: closedRegisters.length,
          promedioVentasPorCaja: closedRegisters.length > 0 ? totalVentas / closedRegisters.length : 0,
          cajeroMasActivo: 'Juan Cajero',
        };
      }
      
      const queryParams = new URLSearchParams();
      if (filters?.startDate) queryParams.append('from', filters.startDate);
      if (filters?.endDate) queryParams.append('to', filters.endDate);
      
      const url = `${API_ENDPOINTS.CASH_REGISTER.STATISTICS}${queryParams.toString() ? `?${queryParams}` : ''}`;
      return await httpClient.get<CashRegisterStatistics>(url);
    } catch (error) {
      console.error('Error getting cash register statistics:', error);
      throw new Error(extractErrorMessage(error));
    }
  },

  /**
   * Actualizar totales de caja
   */
  updateTotals: async (id: number, totals: { totalSales?: number; totalExpenses?: number; paymentBreakdown?: CashRegister['desglosePorMetodo'] }): Promise<CashRegister> => {
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
      
      return await httpClient.patch<CashRegister>(
        API_ENDPOINTS.CASH_REGISTER.BY_ID(id), 
        totals
      );
    } catch (error) {
      console.error('Error updating cash register totals:', error);
      throw new Error(extractErrorMessage(error));
    }
  },
};
