import { API_CONFIG, API_ENDPOINTS } from '@/config/api';
import { httpClient, simulateDelay } from './httpClient';
import { mockExpensesAligned, mockExpenseCategories } from './mockDataAligned';
import { ensureArray } from '@/utils/apiValidators';
import { extractErrorMessage } from '@/utils/errorHandler';
import type { Expense } from '@/types';
import type { 
  ExpenseCreateRequest,
  PaginationParams,
  DateRangeFilter, 
  ExpenseCategory
} from '@/types/api';

// Mapear gastos del backend al formato frontend
const mapExpenseFromBackend = (expense: any): Expense => ({
  id: expense.id,
  date: expense.fecha || expense.date,
  description: expense.descripcion || expense.description,
  amount: parseFloat(expense.monto || expense.amount || 0),
  category: expense.categoria || expense.category,
  cashier: expense.cajero || expense.cashier,
  paymentMethod: expense.metodoPago || expense.paymentMethod,
  provider: expense.proveedor || expense.provider,
  receiptNumber: expense.numeroComprobante || expense.receiptNumber,
  receipt: expense.comprobante || expense.receipt,
  notes: expense.observaciones || expense.notes,
  creationDate: expense.fechaCreacion || expense.creationDate,
});

const mapExpensesFromBackend = (expenses: any[]): Expense[] => {
  if (!Array.isArray(expenses)) return [];
  return expenses.map(mapExpenseFromBackend);
};

export const expensesService = {
  /**
   * Obtener todos los gastos
   */
  getAll: async (params?: PaginationParams): Promise<Expense[]> => {
    try {
      if (API_CONFIG.USE_MOCKS) {
        await simulateDelay();
        
        let expenses = [...mockExpensesAligned];
        
        // Aplicar filtro de búsqueda si existe
        if (params?.search) {
          const searchTerm = params.search.toLowerCase();
          expenses = expenses.filter(expense => 
            expense.description.toLowerCase().includes(searchTerm) ||
            expense.category.toLowerCase().includes(searchTerm)
          );
        }
        
        return expenses.sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );
      }
      
      // Usar backend real
      const queryParams = new URLSearchParams();
      if (params?.search) queryParams.append('search', params.search);
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      
      const url = `${API_ENDPOINTS.EXPENSES.BASE}${queryParams.toString() ? `?${queryParams}` : ''}`;
      const result = await httpClient.get<any>(url);
      
      // El endpoint puede retornar { data: [], total, page, ... } o un array directo
      if (result && result.data) {
        return mapExpensesFromBackend(result.data);
      }
      
      return mapExpensesFromBackend(ensureArray(result, []));
    } catch (error) {
      console.error('Error getting expenses:', error);
      // Retornar array vacío en lugar de lanzar error
      return [];
    }
  },

  /**
   * Obtener gasto por ID
   */
  getById: async (id: number): Promise<Expense> => {
    try {
      if (API_CONFIG.USE_MOCKS) {
        await simulateDelay();
        
        const expense = mockExpensesAligned.find(e => e.id === id);
        if (!expense) {
          throw new Error('Gasto no encontrado');
        }
        return expense;
      }
      
      return await httpClient.get<Expense>(API_ENDPOINTS.EXPENSES.BY_ID(id));
    } catch (error) {
      console.error('Error getting expense by ID:', error);
      throw new Error(extractErrorMessage(error));
    }
  },

  /**
   * Obtener gastos del día actual
   * Response format: { gastos: [], totalGastos: number, totalMonto: number }
   */
  getToday: async (): Promise<Expense[]> => {
    try {
      if (API_CONFIG.USE_MOCKS) {
        await simulateDelay();
        
        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];
        
        return mockExpensesAligned.filter(expense => 
          expense.date.startsWith(todayStr)
        );
      }
      
      const result = await httpClient.get<any>(API_ENDPOINTS.EXPENSES.TODAY);
      
      // El endpoint retorna { gastos: [], totalGastos: number, totalMonto: number }
      if (result && result.gastos) {
        return mapExpensesFromBackend(result.gastos);
      }
      
      // Fallback si es un array directo
      return ensureArray(result, []);
    } catch (error) {
      console.error('Error getting today expenses:', error);
      return [];
    }
  },

  /**
   * Obtener gastos por rango de fechas
   */
  getByDateRange: async (filters: DateRangeFilter): Promise<Expense[]> => {
    try {
      if (API_CONFIG.USE_MOCKS) {
        await simulateDelay();
        
        const fromDate = new Date(filters.startDate);
        const toDate = new Date(filters.endDate);
        
        return mockExpensesAligned.filter(expense => {
          const expenseDate = new Date(expense.date);
          return expenseDate >= fromDate && expenseDate <= toDate;
        });
      }
      
      const queryParams = new URLSearchParams({
        from: filters.startDate,
        to: filters.endDate,
      });
      
      const result = await httpClient.get<Expense[]>(`${API_ENDPOINTS.EXPENSES.BY_RANGE}?${queryParams}`);
      // Asegurar que siempre retorna un array
      return ensureArray(result, []);
    } catch (error) {
      console.error('Error getting expenses by date range:', error);
      // Retornar array vacío en lugar de lanzar error
      return [];
    }
  },

  /**
   * Obtener gastos por categoría
   */
  getByCategory: async (categoria: string): Promise<Expense[]> => {
    try {
      if (API_CONFIG.USE_MOCKS) {
        await simulateDelay();
        
        return mockExpensesAligned.filter(expense => 
          expense.category.toLowerCase() === categoria.toLowerCase()
        );
      }
      
      const result = await httpClient.get<Expense[]>(API_ENDPOINTS.EXPENSES.BY_CATEGORY(categoria));
      // Asegurar que siempre retorna un array
      return ensureArray(result, []);
    } catch (error) {
      console.error('Error getting expenses by category:', error);
      // Retornar array vacío en lugar de lanzar error
      return [];
    }
  },

  /**
   * Obtener gastos por cajero
   */
  getByCashier: async (cajero: string): Promise<Expense[]> => {
    try {
      if (API_CONFIG.USE_MOCKS) {
        await simulateDelay();
        
        return mockExpensesAligned.filter(expense => 
          expense.cashier && expense.cashier.toLowerCase().includes(cajero.toLowerCase())
        );
      }
      
      const result = await httpClient.get<Expense[]>(API_ENDPOINTS.EXPENSES.BY_CASHIER(cajero));
      // Asegurar que siempre retorna un array
      return ensureArray(result, []);
    } catch (error) {
      console.error('Error getting expenses by cashier:', error);
      // Retornar array vacío en lugar de lanzar error
      return [];
    }
  },

  /**
   * Crear nuevo gasto
   */
  create: async (expenseData: Omit<Expense, 'id'>): Promise<Expense> => {
    try {
      if (API_CONFIG.USE_MOCKS) {
        await simulateDelay();
        
        const newExpense: Expense = {
          ...expenseData,
          id: Math.max(...mockExpensesAligned.map(e => e.id)) + 1,
          date: new Date().toISOString(),
        };
        
        mockExpensesAligned.push(newExpense);
        return newExpense;
      }
      
      // Mapear datos del frontend al formato del backend
      const createRequest: ExpenseCreateRequest = {
        descripcion: expenseData.description,
        monto: expenseData.amount,
        categoria: expenseData.category as ExpenseCategory,
        metodoPago: expenseData.paymentMethod,
        cajero: expenseData.cashier,
        observaciones: expenseData.notes,
      };
      
      return await httpClient.post<Expense>(API_ENDPOINTS.EXPENSES.BASE, createRequest);
    } catch (error) {
      console.error('Error creating expense:', error);
      throw new Error(extractErrorMessage(error));
    }
  },

  /**
   * Actualizar gasto
   */
  update: async (id: number, expenseData: Partial<Expense>): Promise<Expense> => {
    try {
      if (API_CONFIG.USE_MOCKS) {
        await simulateDelay();
        
        const index = mockExpensesAligned.findIndex(e => e.id === id);
        if (index === -1) {
          throw new Error('Gasto no encontrado');
        }
        
        mockExpensesAligned[index] = {
          ...mockExpensesAligned[index],
          ...expenseData,
        };
        
        return mockExpensesAligned[index];
      }
      
      // Mapear datos del frontend al formato del backend
      const updateRequest: Partial<ExpenseCreateRequest> = {};
      if (expenseData.description) updateRequest.descripcion = expenseData.description;
      if (expenseData.amount !== undefined) updateRequest.monto = expenseData.amount;
      if (expenseData.category) updateRequest.categoria = expenseData.category as ExpenseCategory;
      if (expenseData.paymentMethod) updateRequest.metodoPago = expenseData.paymentMethod;
      if (expenseData.cashier) updateRequest.cajero = expenseData.cashier;
      if (expenseData.notes !== undefined) updateRequest.observaciones = expenseData.notes;
      
      return await httpClient.patch<Expense>(API_ENDPOINTS.EXPENSES.BY_ID(id), updateRequest);
    } catch (error) {
      console.error('Error updating expense:', error);
      throw new Error(extractErrorMessage(error));
    }
  },

  /**
   * Eliminar gasto
   */
  delete: async (id: number): Promise<void> => {
    try {
      if (API_CONFIG.USE_MOCKS) {
        await simulateDelay();
        
        const index = mockExpensesAligned.findIndex(e => e.id === id);
        if (index === -1) {
          throw new Error('Gasto no encontrado');
        }
        
        mockExpensesAligned.splice(index, 1);
        return;
      }
      
      await httpClient.delete(API_ENDPOINTS.EXPENSES.BY_ID(id));
    } catch (error) {
      console.error('Error deleting expense:', error);
      throw new Error(extractErrorMessage(error));
    }
  },

  /**
   * Buscar gastos
   */
  search: async (query: string): Promise<Expense[]> => {
    try {
      if (API_CONFIG.USE_MOCKS) {
        await simulateDelay();
        
        const searchTerm = query.toLowerCase();
        return mockExpensesAligned.filter(expense => 
          expense.description.toLowerCase().includes(searchTerm) ||
          expense.category.toLowerCase().includes(searchTerm) ||
          (expense.cashier && expense.cashier.toLowerCase().includes(searchTerm))
        );
      }
      
      const queryParams = new URLSearchParams({ q: query });
      const result = await httpClient.get<Expense[]>(`${API_ENDPOINTS.EXPENSES.SEARCH}?${queryParams}`);
      // Asegurar que siempre retorna un array
      return ensureArray(result, []);
    } catch (error) {
      console.error('Error searching expenses:', error);
      // Retornar array vacío en lugar de lanzar error
      return [];
    }
  },

  /**
   * Obtener categorías de gastos
   */
  getCategories: async (): Promise<string[]> => {
    try {
      if (API_CONFIG.USE_MOCKS) {
        await simulateDelay();
        return mockExpenseCategories;
      }
      
      const result = await httpClient.get<string[]>(API_ENDPOINTS.EXPENSES.CATEGORIES);
      // Asegurar que siempre retorna un array
      return ensureArray(result, mockExpenseCategories);
    } catch (error) {
      console.error('Error getting expense categories:', error);
      // Retornar categorías por defecto en lugar de lanzar error
      return mockExpenseCategories;
    }
  },

  /**
   * Obtener estadísticas de gastos
   */
  getStatistics: async (filters?: DateRangeFilter): Promise<any> => {
    try {
      if (API_CONFIG.USE_MOCKS) {
        await simulateDelay();
        
        let expenses = [...mockExpensesAligned];
        
        if (filters) {
          const fromDate = new Date(filters.startDate);
          const toDate = new Date(filters.endDate);
          
          expenses = expenses.filter(expense => {
            const expenseDate = new Date(expense.date);
            return expenseDate >= fromDate && expenseDate <= toDate;
          });
        }
        
        const totalGastos = expenses.reduce((sum, e) => sum + e.amount, 0);
        const gastosPorCategoria: Record<string, number> = {};
        const gastosPorMetodoPago: Record<string, number> = {};
        
        expenses.forEach(expense => {
          gastosPorCategoria[expense.category] = (gastosPorCategoria[expense.category] || 0) + expense.amount;
          gastosPorMetodoPago[expense.paymentMethod] = (gastosPorMetodoPago[expense.paymentMethod] || 0) + expense.amount;
        });
        
        return {
          totalGastos,
          cantidadGastos: expenses.length,
          promedioGasto: expenses.length > 0 ? totalGastos / expenses.length : 0,
          gastosPorCategoria,
          gastosPorMetodoPago,
          gastosHoy: expenses.filter(e => 
            e.date.startsWith(new Date().toISOString().split('T')[0])
          ).length,
          categoriaConMasGastos: Object.entries(gastosPorCategoria)
            .sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A',
        };
      }
      
      const queryParams = new URLSearchParams();
      if (filters?.startDate) queryParams.append('from', filters.startDate);
      if (filters?.endDate) queryParams.append('to', filters.endDate);
      
      const url = `${API_ENDPOINTS.EXPENSES.STATISTICS}${queryParams.toString() ? `?${queryParams}` : ''}`;
      return await httpClient.get<any>(url);
    } catch (error) {
      console.error('Error getting expense statistics:', error);
      throw new Error(extractErrorMessage(error));
    }
  },

  /**
   * Obtener estadísticas de gastos con filtros de fecha
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

      const url = `${API_ENDPOINTS.EXPENSES.STATISTICS}?${params.toString()}`;
      const response = await httpClient.get<any>(url);
      
      return response;
    } catch (error) {
      console.error('Error getting expenses statistics:', error);
      throw new Error(extractErrorMessage(error));
    }
  }
};
