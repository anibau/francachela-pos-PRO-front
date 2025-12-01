import { API_CONFIG, API_ENDPOINTS } from '@/config/api';
import { httpClient, simulateDelay } from './httpClient';
import { mockExpensesAligned, mockExpenseCategories } from './mockDataAligned';
import type { Expense } from '@/types';
import type { 
  ExpenseCreateRequest,
  PaginationParams,
  DateRangeFilter 
} from '@/types/api';

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
      return await httpClient.get<Expense[]>(url);
    } catch (error) {
      console.error('Error getting expenses:', error);
      throw new Error('Error al cargar los gastos');
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
      throw new Error('Error al cargar el gasto');
    }
  },

  /**
   * Obtener gastos del día actual
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
      
      return await httpClient.get<Expense[]>(API_ENDPOINTS.EXPENSES.TODAY);
    } catch (error) {
      console.error('Error getting today expenses:', error);
      throw new Error('Error al cargar los gastos del día');
    }
  },

  /**
   * Obtener gastos por rango de fechas
   */
  getByDateRange: async (filters: DateRangeFilter): Promise<Expense[]> => {
    try {
      if (API_CONFIG.USE_MOCKS) {
        await simulateDelay();
        
        const fromDate = new Date(filters.from);
        const toDate = new Date(filters.to);
        
        return mockExpensesAligned.filter(expense => {
          const expenseDate = new Date(expense.date);
          return expenseDate >= fromDate && expenseDate <= toDate;
        });
      }
      
      const queryParams = new URLSearchParams({
        from: filters.from,
        to: filters.to,
      });
      
      return await httpClient.get<Expense[]>(`${API_ENDPOINTS.EXPENSES.BY_RANGE}?${queryParams}`);
    } catch (error) {
      console.error('Error getting expenses by date range:', error);
      throw new Error('Error al cargar los gastos por fecha');
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
      
      return await httpClient.get<Expense[]>(API_ENDPOINTS.EXPENSES.BY_CATEGORY(categoria));
    } catch (error) {
      console.error('Error getting expenses by category:', error);
      throw new Error('Error al cargar los gastos por categoría');
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
      
      return await httpClient.get<Expense[]>(API_ENDPOINTS.EXPENSES.BY_CASHIER(cajero));
    } catch (error) {
      console.error('Error getting expenses by cashier:', error);
      throw new Error('Error al cargar los gastos por cajero');
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
        categoria: expenseData.category,
        metodoPago: expenseData.paymentMethod,
        cajero: expenseData.cashier,
        observaciones: expenseData.notes,
      };
      
      return await httpClient.post<Expense>(API_ENDPOINTS.EXPENSES.BASE, createRequest);
    } catch (error) {
      console.error('Error creating expense:', error);
      throw new Error('Error al crear el gasto');
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
      if (expenseData.category) updateRequest.categoria = expenseData.category;
      if (expenseData.paymentMethod) updateRequest.metodoPago = expenseData.paymentMethod;
      if (expenseData.cashier) updateRequest.cajero = expenseData.cashier;
      if (expenseData.notes !== undefined) updateRequest.observaciones = expenseData.notes;
      
      return await httpClient.patch<Expense>(API_ENDPOINTS.EXPENSES.BY_ID(id), updateRequest);
    } catch (error) {
      console.error('Error updating expense:', error);
      throw new Error('Error al actualizar el gasto');
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
      throw new Error('Error al eliminar el gasto');
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
      return await httpClient.get<Expense[]>(`${API_ENDPOINTS.EXPENSES.SEARCH}?${queryParams}`);
    } catch (error) {
      console.error('Error searching expenses:', error);
      throw new Error('Error al buscar gastos');
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
      
      return await httpClient.get<string[]>(API_ENDPOINTS.EXPENSES.CATEGORIES);
    } catch (error) {
      console.error('Error getting expense categories:', error);
      throw new Error('Error al cargar las categorías de gastos');
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
          const fromDate = new Date(filters.from);
          const toDate = new Date(filters.to);
          
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
      if (filters?.from) queryParams.append('from', filters.from);
      if (filters?.to) queryParams.append('to', filters.to);
      
      const url = `${API_ENDPOINTS.EXPENSES.STATISTICS}${queryParams.toString() ? `?${queryParams}` : ''}`;
      return await httpClient.get<any>(url);
    } catch (error) {
      console.error('Error getting expense statistics:', error);
      throw new Error('Error al cargar las estadísticas de gastos');
    }
  },
};
