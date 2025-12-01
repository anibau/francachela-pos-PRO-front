/**
 * API Services - Refactorizado para integración con backend
 * 
 * Este archivo actúa como un proxy que redirige a los servicios específicos
 * manteniendo compatibilidad con el código existente mientras migra gradualmente
 * a los nuevos servicios especializados.
 */

import { API_CONFIG } from '@/config/api';
import type {
  Product,
  Client,
  Sale,
  Promotion,
  Combo,
  CashRegister,
  Expense,
  DeliveryOrder,
  Settings,
  InventoryMovement
} from '@/types';

// Importar los nuevos servicios especializados
import { productsService } from './productsService';
import { clientsService } from './clientsService';
import { salesService } from './salesService';
import { promotionsService } from './promotionsService';
import { cashRegisterService } from './cashRegisterService';
import { expensesService } from './expensesService';
import { inventoryService } from './inventoryService';

// Importar mocks alineados con el backend
import {
  mockProductsAligned,
  mockClientsAligned,
  mockSalesAligned,
  mockPromotionsAligned,
  mockCombosAligned,
  mockCashRegistersAligned,
  mockExpensesAligned,
  mockSettingsAligned
} from './mockDataAligned';

// Helper function para manejar errores
const handleApiError = (error: any): never => {
  console.error('API Error:', error);
  throw new Error(error.message || 'Error de carga');
};

// ============================================================================
// PRODUCTOS - Redirigir al nuevo servicio especializado
// ============================================================================
export const productsAPI = {
  getAll: async (): Promise<Product[]> => {
    try {
      return await productsService.getAll();
    } catch (error) {
      return handleApiError(error);
    }
  },

  getById: async (id: number): Promise<Product> => {
    try {
      return await productsService.getById(id);
    } catch (error) {
      return handleApiError(error);
    }
  },

  create: async (product: Omit<Product, 'id'>): Promise<Product> => {
    try {
      return await productsService.create(product);
    } catch (error) {
      return handleApiError(error);
    }
  },

  update: async (id: number, product: Partial<Product>): Promise<Product> => {
    try {
      return await productsService.update(id, product);
    } catch (error) {
      return handleApiError(error);
    }
  },

  delete: async (id: number): Promise<void> => {
    try {
      await productsService.delete(id);
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Métodos adicionales del nuevo servicio
  search: async (query: string): Promise<Product[]> => {
    try {
      return await productsService.search(query);
    } catch (error) {
      return handleApiError(error);
    }
  },

  getCategories: async (): Promise<string[]> => {
    try {
      return await productsService.getCategories();
    } catch (error) {
      return handleApiError(error);
    }
  },

  getLowStock: async (): Promise<Product[]> => {
    try {
      return await productsService.getLowStock();
    } catch (error) {
      return handleApiError(error);
    }
  },

  updateStock: async (id: number, stockData: any): Promise<Product> => {
    try {
      return await productsService.updateStock(id, stockData);
    } catch (error) {
      return handleApiError(error);
    }
  },
};

// ============================================================================
// CLIENTES - Redirigir al nuevo servicio especializado
// ============================================================================
export const clientsAPI = {
  getAll: async (): Promise<Client[]> => {
    try {
      return await clientsService.getAll();
    } catch (error) {
      return handleApiError(error);
    }
  },

  getById: async (id: number): Promise<Client> => {
    try {
      return await clientsService.getById(id);
    } catch (error) {
      return handleApiError(error);
    }
  },

  create: async (client: Omit<Client, 'id'>): Promise<Client> => {
    try {
      return await clientsService.create(client);
    } catch (error) {
      return handleApiError(error);
    }
  },

  update: async (id: number, client: Partial<Client>): Promise<Client> => {
    try {
      return await clientsService.update(id, client);
    } catch (error) {
      return handleApiError(error);
    }
  },

  delete: async (id: number): Promise<void> => {
    try {
      await clientsService.delete(id);
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Métodos adicionales del nuevo servicio
  search: async (query: string): Promise<Client[]> => {
    try {
      return await clientsService.search(query);
    } catch (error) {
      return handleApiError(error);
    }
  },

  getByDni: async (dni: string): Promise<Client | null> => {
    try {
      return await clientsService.getByDni(dni);
    } catch (error) {
      console.error('Error getting client by DNI:', error);
      return null;
    }
  },

  getBirthdays: async (): Promise<Client[]> => {
    try {
      return await clientsService.getBirthdays();
    } catch (error) {
      return handleApiError(error);
    }
  },

  getTopClients: async (limit?: number): Promise<Client[]> => {
    try {
      return await clientsService.getTopClients(limit);
    } catch (error) {
      return handleApiError(error);
    }
  },
};

// ============================================================================
// VENTAS - Redirigir al nuevo servicio especializado
// ============================================================================
export const salesAPI = {
  getAll: async (): Promise<Sale[]> => {
    try {
      return await salesService.getAll();
    } catch (error) {
      return handleApiError(error);
    }
  },

  getById: async (id: number): Promise<Sale> => {
    try {
      return await salesService.getById(id);
    } catch (error) {
      return handleApiError(error);
    }
  },

  create: async (sale: any): Promise<Sale> => {
    try {
      return await salesService.create(sale);
    } catch (error) {
      return handleApiError(error);
    }
  },

  cancel: async (id: number): Promise<Sale> => {
    try {
      return await salesService.cancel(id);
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Métodos adicionales del nuevo servicio
  search: async (query: string): Promise<Sale[]> => {
    try {
      return await salesService.search(query);
    } catch (error) {
      return handleApiError(error);
    }
  },

  getToday: async (): Promise<Sale[]> => {
    try {
      return await salesService.getToday();
    } catch (error) {
      return handleApiError(error);
    }
  },

  getByClient: async (clientId: number): Promise<Sale[]> => {
    try {
      return await salesService.getByClient(clientId);
    } catch (error) {
      return handleApiError(error);
    }
  },

  getStatistics: async (filters?: any): Promise<any> => {
    try {
      return await salesService.getStatistics(filters);
    } catch (error) {
      return handleApiError(error);
    }
  },
};

// ============================================================================
// PROMOCIONES - Redirigir al nuevo servicio especializado
// ============================================================================
export const promotionsAPI = {
  getAll: async (): Promise<Promotion[]> => {
    try {
      return await promotionsService.getAll();
    } catch (error) {
      return handleApiError(error);
    }
  },

  getById: async (id: number): Promise<Promotion> => {
    try {
      return await promotionsService.getById(id);
    } catch (error) {
      return handleApiError(error);
    }
  },

  create: async (promotion: Omit<Promotion, 'id'>): Promise<Promotion> => {
    try {
      return await promotionsService.create(promotion);
    } catch (error) {
      return handleApiError(error);
    }
  },

  update: async (id: number, promotion: Partial<Promotion>): Promise<Promotion> => {
    try {
      return await promotionsService.update(id, promotion);
    } catch (error) {
      return handleApiError(error);
    }
  },

  delete: async (id: number): Promise<void> => {
    try {
      await promotionsService.delete(id);
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Métodos adicionales del nuevo servicio
  getActive: async (): Promise<Promotion[]> => {
    try {
      return await promotionsService.getActive();
    } catch (error) {
      return handleApiError(error);
    }
  },

  activate: async (id: number): Promise<Promotion> => {
    try {
      return await promotionsService.activate(id);
    } catch (error) {
      return handleApiError(error);
    }
  },

  deactivate: async (id: number): Promise<Promotion> => {
    try {
      return await promotionsService.deactivate(id);
    } catch (error) {
      return handleApiError(error);
    }
  },
};

// ============================================================================
// SERVICIOS PENDIENTES DE MIGRACIÓN (usando mocks temporalmente)
// ============================================================================

// Combos
export const combosAPI = {
  getAll: async (): Promise<Combo[]> => {
    try {
      if (API_CONFIG.USE_MOCKS) {
        return mockCombosAligned;
      }
      // TODO: Implementar servicio de combos
      return mockCombosAligned;
    } catch (error) {
      return handleApiError(error);
    }
  },

  getById: async (id: number): Promise<Combo> => {
    try {
      const combo = mockCombosAligned.find(c => c.id === id);
      if (!combo) throw new Error('Combo no encontrado');
      return combo;
    } catch (error) {
      return handleApiError(error);
    }
  },

  create: async (combo: Omit<Combo, 'id'>): Promise<Combo> => {
    try {
      const newCombo = {
        ...combo,
        id: Math.max(...mockCombosAligned.map(c => c.id)) + 1
      };
      mockCombosAligned.push(newCombo);
      return newCombo;
    } catch (error) {
      return handleApiError(error);
    }
  },

  update: async (id: number, combo: Partial<Combo>): Promise<Combo> => {
    try {
      const index = mockCombosAligned.findIndex(c => c.id === id);
      if (index === -1) throw new Error('Combo no encontrado');
      mockCombosAligned[index] = { ...mockCombosAligned[index], ...combo };
      return mockCombosAligned[index];
    } catch (error) {
      return handleApiError(error);
    }
  },

  delete: async (id: number): Promise<void> => {
    try {
      const index = mockCombosAligned.findIndex(c => c.id === id);
      if (index === -1) throw new Error('Combo no encontrado');
      mockCombosAligned.splice(index, 1);
    } catch (error) {
      return handleApiError(error);
    }
  },
};

// ============================================================================
// CAJA REGISTRADORA - Redirigir al nuevo servicio especializado
// ============================================================================
export const cashRegisterAPI = {
  getCurrent: async (): Promise<CashRegister | null> => {
    try {
      return await cashRegisterService.getCurrent();
    } catch (error) {
      return handleApiError(error);
    }
  },

  getHistory: async (filters?: any): Promise<CashRegister[]> => {
    try {
      return await cashRegisterService.getHistory(filters);
    } catch (error) {
      return handleApiError(error);
    }
  },

  getById: async (id: number): Promise<CashRegister> => {
    try {
      return await cashRegisterService.getById(id);
    } catch (error) {
      return handleApiError(error);
    }
  },

  open: async (openData: any): Promise<CashRegister> => {
    try {
      return await cashRegisterService.open(openData);
    } catch (error) {
      return handleApiError(error);
    }
  },

  close: async (id: number, closeData: any): Promise<CashRegister> => {
    try {
      return await cashRegisterService.close(id, closeData);
    } catch (error) {
      return handleApiError(error);
    }
  },

  getSummary: async (id: number): Promise<any> => {
    try {
      return await cashRegisterService.getSummary(id);
    } catch (error) {
      return handleApiError(error);
    }
  },

  getStatistics: async (filters?: any): Promise<any> => {
    try {
      return await cashRegisterService.getStatistics(filters);
    } catch (error) {
      return handleApiError(error);
    }
  },
};

// ============================================================================
// GASTOS - Redirigir al nuevo servicio especializado
// ============================================================================
export const expensesAPI = {
  getAll: async (params?: any): Promise<Expense[]> => {
    try {
      return await expensesService.getAll(params);
    } catch (error) {
      return handleApiError(error);
    }
  },

  getById: async (id: number): Promise<Expense> => {
    try {
      return await expensesService.getById(id);
    } catch (error) {
      return handleApiError(error);
    }
  },

  create: async (expense: Omit<Expense, 'id'>): Promise<Expense> => {
    try {
      return await expensesService.create(expense);
    } catch (error) {
      return handleApiError(error);
    }
  },

  update: async (id: number, expense: Partial<Expense>): Promise<Expense> => {
    try {
      return await expensesService.update(id, expense);
    } catch (error) {
      return handleApiError(error);
    }
  },

  delete: async (id: number): Promise<void> => {
    try {
      await expensesService.delete(id);
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Métodos adicionales del nuevo servicio
  getToday: async (): Promise<Expense[]> => {
    try {
      return await expensesService.getToday();
    } catch (error) {
      return handleApiError(error);
    }
  },

  getByDateRange: async (filters: any): Promise<Expense[]> => {
    try {
      return await expensesService.getByDateRange(filters);
    } catch (error) {
      return handleApiError(error);
    }
  },

  getByCategory: async (categoria: string): Promise<Expense[]> => {
    try {
      return await expensesService.getByCategory(categoria);
    } catch (error) {
      return handleApiError(error);
    }
  },

  search: async (query: string): Promise<Expense[]> => {
    try {
      return await expensesService.search(query);
    } catch (error) {
      return handleApiError(error);
    }
  },

  getCategories: async (): Promise<string[]> => {
    try {
      return await expensesService.getCategories();
    } catch (error) {
      return handleApiError(error);
    }
  },

  getStatistics: async (filters?: any): Promise<any> => {
    try {
      return await expensesService.getStatistics(filters);
    } catch (error) {
      return handleApiError(error);
    }
  },
};

// ============================================================================
// INVENTARIO - Redirigir al nuevo servicio especializado
// ============================================================================
export const inventoryAPI = {
  getMovements: async (params?: any): Promise<InventoryMovement[]> => {
    try {
      return await inventoryService.getMovements(params);
    } catch (error) {
      return handleApiError(error);
    }
  },

  getById: async (id: number): Promise<InventoryMovement> => {
    try {
      return await inventoryService.getById(id);
    } catch (error) {
      return handleApiError(error);
    }
  },

  createMovement: async (movement: Omit<InventoryMovement, 'id'>): Promise<InventoryMovement> => {
    try {
      return await inventoryService.createMovement(movement);
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Métodos adicionales del nuevo servicio
  getToday: async (): Promise<InventoryMovement[]> => {
    try {
      return await inventoryService.getToday();
    } catch (error) {
      return handleApiError(error);
    }
  },

  getByDateRange: async (filters: any): Promise<InventoryMovement[]> => {
    try {
      return await inventoryService.getByDateRange(filters);
    } catch (error) {
      return handleApiError(error);
    }
  },

  getByType: async (tipo: string): Promise<InventoryMovement[]> => {
    try {
      return await inventoryService.getByType(tipo);
    } catch (error) {
      return handleApiError(error);
    }
  },

  getByCashier: async (cajero: string): Promise<InventoryMovement[]> => {
    try {
      return await inventoryService.getByCashier(cajero);
    } catch (error) {
      return handleApiError(error);
    }
  },

  createEntry: async (entryData: any): Promise<InventoryMovement> => {
    try {
      return await inventoryService.createEntry(entryData);
    } catch (error) {
      return handleApiError(error);
    }
  },

  createAdjustment: async (adjustmentData: any): Promise<InventoryMovement> => {
    try {
      return await inventoryService.createAdjustment(adjustmentData);
    } catch (error) {
      return handleApiError(error);
    }
  },

  createSaleMovement: async (saleData: any): Promise<InventoryMovement> => {
    try {
      return await inventoryService.createSaleMovement(saleData);
    } catch (error) {
      return handleApiError(error);
    }
  },

  getStatistics: async (filters?: any): Promise<any> => {
    try {
      return await inventoryService.getStatistics(filters);
    } catch (error) {
      return handleApiError(error);
    }
  },
};

// Configuraciones
export const settingsAPI = {
  get: async (): Promise<Settings> => {
    try {
      return mockSettingsAligned;
    } catch (error) {
      return handleApiError(error);
    }
  },

  update: async (settings: Partial<Settings>): Promise<Settings> => {
    try {
      Object.assign(mockSettingsAligned, settings);
      return mockSettingsAligned;
    } catch (error) {
      return handleApiError(error);
    }
  },
};

// Delivery (placeholder)
export const deliveryAPI = {
  getAll: async (): Promise<DeliveryOrder[]> => {
    try {
      return []; // Mock vacío por ahora
    } catch (error) {
      return handleApiError(error);
    }
  },

  create: async (order: Omit<DeliveryOrder, 'id'>): Promise<DeliveryOrder> => {
    try {
      const newOrder = {
        ...order,
        id: Date.now(),
      };
      return newOrder;
    } catch (error) {
      return handleApiError(error);
    }
  },

  update: async (id: number, order: Partial<DeliveryOrder>): Promise<DeliveryOrder> => {
    try {
      // Mock implementation
      return { id, ...order } as DeliveryOrder;
    } catch (error) {
      return handleApiError(error);
    }
  },
};
