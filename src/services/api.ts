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
import type {
  ProductStockUpdateRequest,
  SalesStatistics,
  ClientStatistics,
  CashRegisterStatistics,
  FilterParams,
  DateRangeFilterParams,
  GenericStatistics,
  SaleCreateRequest,
  CashRegisterOpenRequest,
  CashRegisterCloseRequest,
  ExpenseCreateRequest,
  InventoryMovementCreateRequest,
} from '@/types/api';

// Importar los nuevos servicios especializados
import { productsService } from './productsService';
import { clientsService } from './clientsService';
import { salesService } from './salesService';
import { unifiedPromotionsService, TipoPromocion } from './unifiedPromotionsService';
import { deliveryService } from './deliveryService';
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
const handleApiError = (error: unknown): never => {
  console.error('API Error:', error);
  const errorMessage = error instanceof Error ? error.message : 'Error de carga';
  throw new Error(errorMessage);
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

  updateStock: async (id: number, stockData: ProductStockUpdateRequest): Promise<Product> => {
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

  create: async (sale: SaleCreateRequest): Promise<Sale> => {
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
  // TODO: Implementar estos métodos en salesService
  // search: async (query: string): Promise<Sale[]> => {
  //   try {
  //     return await salesService.search(query);
  //   } catch (error) {
  //     return handleApiError(error);
  //   }
  // },

  getToday: async (): Promise<Sale[]> => {
    try {
      return await salesService.getToday();
    } catch (error) {
      return handleApiError(error);
    }
  },

  // getByClient: async (clientId: number): Promise<Sale[]> => {
  //   try {
  //     return await salesService.getByClient(clientId);
  //   } catch (error) {
  //     return handleApiError(error);
  //   }
  // },

  // getStatistics: async (filters?: FilterParams): Promise<SalesStatistics> => {
  //   try {
  //     return await salesService.getStatistics(filters);
  //   } catch (error) {
  //     return handleApiError(error);
  //   }
  // },
};

// ============================================================================
// PROMOCIONES / COMBOS — servicio unificado
// ============================================================================
const mapUnifiedToPromotion = (p: Awaited<ReturnType<typeof unifiedPromotionsService.getAll>>[number]): Promotion => ({
  id: p.id,
  name: p.nombre,
  description: p.descripcion,
  discount: parseFloat(p.descuento) || 0,
  startDate: p.fechaInicio,
  endDate: p.fechaFin,
  active: p.activo,
  type: p.tipoPromocion,
});

const mapUnifiedToCombo = (p: Awaited<ReturnType<typeof unifiedPromotionsService.getAll>>[number]): Combo => ({
  id: p.id,
  name: p.nombre,
  description: p.descripcion,
  price: parseFloat(p.precioCombo || p.descuento) || 0,
  products: p.productos.map((pp) => ({
    productId: pp.productoId,
    quantity: pp.cantidadExacta || pp.cantidadMinima || 1,
  })),
  active: p.activo,
  savings: parseFloat(p.descuento) || 0,
});

export const promotionsAPI = {
  getAll: async (): Promise<Promotion[]> => {
    try {
      const list = await unifiedPromotionsService.getAll();
      return list.map(mapUnifiedToPromotion);
    } catch (error) {
      return handleApiError(error);
    }
  },
  getById: async (id: number) => {
    const p = await unifiedPromotionsService.getById(id);
    return mapUnifiedToPromotion(p);
  },
  getActive: async (): Promise<Promotion[]> => {
    const list = await unifiedPromotionsService.getActive();
    return list.map(mapUnifiedToPromotion);
  },
  activate: async (id: number) => mapUnifiedToPromotion(await unifiedPromotionsService.activate(id)),
  deactivate: async (id: number) => mapUnifiedToPromotion(await unifiedPromotionsService.deactivate(id)),
  create: async () => { throw new Error('Usar unifiedPromotionsService.create'); },
  update: async () => { throw new Error('Usar unifiedPromotionsService.update'); },
  delete: async (id: number) => unifiedPromotionsService.delete(id),
};

export const combosAPI = {
  getAll: async (): Promise<Combo[]> => {
    try {
      const list = await unifiedPromotionsService.getAll();
      return list.filter((p) => p.tipoPromocion === TipoPromocion.COMBO).map(mapUnifiedToCombo);
    } catch (error) {
      return handleApiError(error);
    }
  },
  getActive: async (): Promise<Combo[]> => {
    const list = await unifiedPromotionsService.getActive();
    return list.filter((p) => p.tipoPromocion === TipoPromocion.COMBO).map(mapUnifiedToCombo);
  },
  getById: async (id: number) => mapUnifiedToCombo(await unifiedPromotionsService.getById(id)),
  activate: async (id: number) => mapUnifiedToCombo(await unifiedPromotionsService.activate(id)),
  deactivate: async (id: number) => mapUnifiedToCombo(await unifiedPromotionsService.deactivate(id)),
  create: async () => { throw new Error('Usar unifiedPromotionsService.create con tipo COMBO'); },
  update: async () => { throw new Error('Usar unifiedPromotionsService.update'); },
  delete: async (id: number) => unifiedPromotionsService.delete(id),
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

  getHistory: async (filters?: FilterParams): Promise<CashRegister[]> => {
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

  open: async (openData: CashRegisterOpenRequest): Promise<CashRegister> => {
    try {
      return await cashRegisterService.open(openData);
    } catch (error) {
      return handleApiError(error);
    }
  },

  close: async (id: number, closeData: CashRegisterCloseRequest): Promise<CashRegister> => {
    try {
      return await cashRegisterService.close(id, closeData);
    } catch (error) {
      return handleApiError(error);
    }
  },

  getSummary: async (id: number): Promise<CashRegisterStatistics> => {
    try {
      return await cashRegisterService.getSummary(id);
    } catch (error) {
      return handleApiError(error);
    }
  },

  getStatistics: async (filters?: FilterParams): Promise<CashRegisterStatistics> => {
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
  getAll: async (params?: FilterParams): Promise<Expense[]> => {
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

  getByDateRange: async (filters: DateRangeFilterParams): Promise<Expense[]> => {
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

  getStatistics: async (filters?: FilterParams): Promise<GenericStatistics> => {
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
  getMovements: async (params?: FilterParams): Promise<InventoryMovement[]> => {
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

  getByDateRange: async (filters: DateRangeFilterParams): Promise<InventoryMovement[]> => {
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

  createEntry: async (entryData: InventoryMovementCreateRequest): Promise<InventoryMovement> => {
    try {
      return await inventoryService.createEntry(entryData);
    } catch (error) {
      return handleApiError(error);
    }
  },

  createAdjustment: async (adjustmentData: InventoryMovementCreateRequest): Promise<InventoryMovement> => {
    try {
      return await inventoryService.createAdjustment(adjustmentData);
    } catch (error) {
      return handleApiError(error);
    }
  },

  createSaleMovement: async (saleData: SaleCreateRequest): Promise<InventoryMovement> => {
    try {
      // El servicio de inventario espera InventoryMovementCreateRequest
      // Aquí hacemos la conversión si es necesaria
      return await inventoryService.createSaleMovement(saleData as unknown as InventoryMovementCreateRequest);
    } catch (error) {
      return handleApiError(error);
    }
  },

  getStatistics: async (filters?: FilterParams): Promise<GenericStatistics> => {
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

export const deliveryAPI = {
  getAll: async (): Promise<DeliveryOrder[]> => {
    try {
      const list = await deliveryService.getAll();
      return list.map((d) => ({
        id: d.id,
        client: d.cliente as unknown as Client,
        address: d.direccion,
        phone: d.phone || d.cliente?.telefono || '',
        products: [],
        total: Number(d.deliveryFee) || 0,
        status: (d.estado?.toLowerCase() || 'pending') as DeliveryOrder['status'],
        deliveryFee: Number(d.deliveryFee) || 0,
        driver: d.repartidor,
        notes: d.notes,
      }));
    } catch (error) {
      return handleApiError(error);
    }
  },
  create: async (order: Omit<DeliveryOrder, 'id'>): Promise<DeliveryOrder> => {
    throw new Error('Usar deliveryService — creación pendiente de UI');
  },
  update: async (id: number, order: Partial<DeliveryOrder>): Promise<DeliveryOrder> => {
    return { id, ...order } as DeliveryOrder;
  },
};
