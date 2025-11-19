// Actualización del archivo api.ts con métodos update y delete
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
import {
  mockProducts,
  mockClients,
  mockSales,
  mockPromotions,
  mockCombos,
  mockCashRegisters,
  mockExpenses,
  mockDeliveryOrders,
  mockSettings
} from './mockData';
import {
  googleSheetsProducts,
  googleSheetsClients,
  googleSheetsSales,
  googleSheetsPromotions,
  googleSheetsCombos,
  googleSheetsCashRegister,
  googleSheetsExpenses,
  googleSheetsDelivery,
  googleSheetsSettings,
  googleSheetsInventory,
} from './googleSheets';

// Helper function para manejar errores
const handleApiError = (error: any): never => {
  console.error('API Error:', error);
  throw new Error(error.message || 'Error de carga');
};

// Productos
export const productsAPI = {
  getAll: async (): Promise<Product[]> => {
    try {
      if (API_CONFIG.USE_GOOGLE_SHEETS) {
        return await googleSheetsProducts.getAll();
      }
      return mockProducts;
    } catch (error) {
      return handleApiError(error);
    }
  },

  getById: async (id: number): Promise<Product> => {
    try {
      if (API_CONFIG.USE_GOOGLE_SHEETS) {
        return await googleSheetsProducts.getById(id);
      }
      const product = mockProducts.find(p => p.id === id);
      if (!product) throw new Error('Producto no encontrado');
      return product;
    } catch (error) {
      return handleApiError(error);
    }
  },

  create: async (product: Omit<Product, 'id'>): Promise<Product> => {
    try {
      if (API_CONFIG.USE_GOOGLE_SHEETS) {
        return await googleSheetsProducts.create(product);
      }
      const newProduct = {
        ...product,
        id: Math.max(...mockProducts.map(p => p.id)) + 1
      };
      mockProducts.push(newProduct);
      return newProduct;
    } catch (error) {
      return handleApiError(error);
    }
  },

  update: async (id: number, product: Partial<Product>): Promise<Product> => {
    try {
      if (API_CONFIG.USE_GOOGLE_SHEETS) {
        return await googleSheetsProducts.update(id, product);
      }
      const index = mockProducts.findIndex(p => p.id === id);
      if (index === -1) throw new Error('Producto no encontrado');
      mockProducts[index] = { ...mockProducts[index], ...product };
      return mockProducts[index];
    } catch (error) {
      return handleApiError(error);
    }
  },

  delete: async (id: number): Promise<void> => {
    try {
      if (API_CONFIG.USE_GOOGLE_SHEETS) {
        await googleSheetsProducts.delete(id);
        return;
      }
      const index = mockProducts.findIndex(p => p.id === id);
      if (index === -1) throw new Error('Producto no encontrado');
      mockProducts.splice(index, 1);
    } catch (error) {
      return handleApiError(error);
    }
  }
};

// Clientes
export const clientsAPI = {
  getAll: async (): Promise<Client[]> => {
    try {
      if (API_CONFIG.USE_GOOGLE_SHEETS) {
        return await googleSheetsClients.getAll();
      }
      return mockClients;
    } catch (error) {
      return handleApiError(error);
    }
  },

  getById: async (id: number): Promise<Client> => {
    try {
      if (API_CONFIG.USE_GOOGLE_SHEETS) {
        return await googleSheetsClients.getById(id);
      }
      const client = mockClients.find(c => c.id === id);
      if (!client) throw new Error('Cliente no encontrado');
      return client;
    } catch (error) {
      return handleApiError(error);
    }
  },

  create: async (client: Omit<Client, 'id'>): Promise<Client> => {
    try {
      if (API_CONFIG.USE_GOOGLE_SHEETS) {
        return await googleSheetsClients.create(client);
      }
      const newClient = {
        ...client,
        id: Math.max(...mockClients.map(c => c.id)) + 1,
        points: 0
      };
      mockClients.push(newClient);
      return newClient;
    } catch (error) {
      return handleApiError(error);
    }
  },

  update: async (id: number, client: Partial<Client>): Promise<Client> => {
    try {
      if (API_CONFIG.USE_GOOGLE_SHEETS) {
        return await googleSheetsClients.update(id, client);
      }
      const index = mockClients.findIndex(c => c.id === id);
      if (index === -1) throw new Error('Cliente no encontrado');
      mockClients[index] = { ...mockClients[index], ...client };
      return mockClients[index];
    } catch (error) {
      return handleApiError(error);
    }
  },

  delete: async (id: number): Promise<void> => {
    try {
      if (API_CONFIG.USE_GOOGLE_SHEETS) {
        await googleSheetsClients.delete(id);
        return;
      }
      const index = mockClients.findIndex(c => c.id === id);
      if (index === -1) throw new Error('Cliente no encontrado');
      mockClients.splice(index, 1);
    } catch (error) {
      return handleApiError(error);
    }
  }
};

// ... (resto del código igual, agregando métodos update y delete donde sea necesario)

// Inventario
export const inventoryAPI = {
  getMovements: async (): Promise<InventoryMovement[]> => {
    try {
      if (API_CONFIG.USE_GOOGLE_SHEETS) {
        return await googleSheetsInventory.getMovements();
      }
      return [];
    } catch (error) {
      return handleApiError(error);
    }
  },

  createMovement: async (movement: Omit<InventoryMovement, 'id'>): Promise<InventoryMovement> => {
    try {
      if (API_CONFIG.USE_GOOGLE_SHEETS) {
        return await googleSheetsInventory.createMovement(movement);
      }
      return { ...movement, id: Date.now() };
    } catch (error) {
      return handleApiError(error);
    }
  },
};

// Ventas
export const salesAPI = {
  getAll: async (): Promise<Sale[]> => {
    try {
      if (API_CONFIG.USE_GOOGLE_SHEETS) {
        console.log('Fetching sales from Google Sheets');
        const sales = await googleSheetsSales.getAll();
        console.log('Sales fetched:', sales);
        return sales;
      }
      return mockSales;
    } catch (error) {
      return handleApiError(error);
    }
  },

  getById: async (id: number): Promise<Sale> => {
    try {
      if (API_CONFIG.USE_GOOGLE_SHEETS) {
        return await googleSheetsSales.getById(id);
      }
      const sale = mockSales.find(s => s.id === id);
      if (!sale) throw new Error('Venta no encontrada');
      return sale;
    } catch (error) {
      return handleApiError(error);
    }
  },

  create: async (sale: Omit<Sale, 'id'>): Promise<Sale> => {
    try {
      if (API_CONFIG.USE_GOOGLE_SHEETS) {
        return await googleSheetsSales.create(sale);
      }
      return { ...sale, id: Math.max(...mockSales.map(s => s.id)) + 1 } as Sale;
    } catch (error) {
      return handleApiError(error);
    }
  },

  cancel: async (id: number): Promise<Sale> => {
    try {
      if (API_CONFIG.USE_GOOGLE_SHEETS) {
        return await googleSheetsSales.cancel(id);
      }
      const index = mockSales.findIndex(s => s.id === id);
      if (index === -1) throw new Error('Venta no encontrada');
      mockSales[index] = { ...mockSales[index], status: 'anulada' };
      return mockSales[index];
    } catch (error) {
      return handleApiError(error);
    }
  },
};


// Promociones
export const promotionsAPI = {
  getAll: async (): Promise<Promotion[]> => {
    try {
      if (API_CONFIG.USE_GOOGLE_SHEETS) {
        console.log('Fetching promotions from Google Sheets');
        const promotions = await googleSheetsPromotions.getAll();
        console.log('Promotions fetched:', promotions);
        return promotions;
      }
      return mockPromotions;
    } catch (error) {
      return handleApiError(error);
    }
  },

  create: async (promotion: Omit<Promotion, 'id'>): Promise<Promotion> => {
    try {
      if (API_CONFIG.USE_GOOGLE_SHEETS) {
        return await googleSheetsPromotions.create(promotion);
      }
      return { ...promotion, id: Math.max(...mockPromotions.map(p => p.id)) + 1 } as Promotion;
    } catch (error) {
      return handleApiError(error);
    }
  },

  update: async (id: number, promotion: Partial<Promotion>): Promise<Promotion> => {
    try {
      if (API_CONFIG.USE_GOOGLE_SHEETS) {
        return await googleSheetsPromotions.update(id, promotion);
      }
      const index = mockPromotions.findIndex(p => p.id === id);
      if (index === -1) throw new Error('Promoción no encontrada');
      mockPromotions[index] = { ...mockPromotions[index], ...promotion };
      return mockPromotions[index];
    } catch (error) {
      return handleApiError(error);
    }
  },

  delete: async (id: number): Promise<void> => {
    try {
      if (API_CONFIG.USE_GOOGLE_SHEETS) {
        await googleSheetsPromotions.delete(id);
        return;
      }
      const index = mockPromotions.findIndex(p => p.id === id);
      if (index === -1) throw new Error('Promoción no encontrada');
      mockPromotions.splice(index, 1);
    } catch (error) {
      return handleApiError(error);
    }
  },
};

// Combos
export const combosAPI = {
  getAll: async (): Promise<Combo[]> => {
    try {
      if (API_CONFIG.USE_GOOGLE_SHEETS) {
        console.log('Fetching combos from Google Sheets');
        const combos = await googleSheetsCombos.getAll();
        console.log('Combos fetched:', combos);
        return combos;
      }
      return mockCombos;
    } catch (error) {
      return handleApiError(error);
    }
  },

  create: async (combo: Omit<Combo, 'id'>): Promise<Combo> => {
    try {
      if (API_CONFIG.USE_GOOGLE_SHEETS) {
        return await googleSheetsCombos.create(combo);
      }
      return { ...combo, id: Math.max(...mockCombos.map(c => c.id)) + 1 } as Combo;
    } catch (error) {
      return handleApiError(error);
    }
  },

  update: async (id: number, combo: Partial<Combo>): Promise<Combo> => {
    try {
      if (API_CONFIG.USE_GOOGLE_SHEETS) {
        return await googleSheetsCombos.update(id, combo);
      }
      const index = mockCombos.findIndex(c => c.id === id);
      if (index === -1) throw new Error('Combo no encontrado');
      mockCombos[index] = { ...mockCombos[index], ...combo };
      return mockCombos[index];
    } catch (error) {
      return handleApiError(error);
    }
  },

  delete: async (id: number): Promise<void> => {
    try {
      if (API_CONFIG.USE_GOOGLE_SHEETS) {
        await googleSheetsCombos.delete(id);
        return;
      }
      const index = mockCombos.findIndex(c => c.id === id);
      if (index === -1) throw new Error('Combo no encontrado');
      mockCombos.splice(index, 1);
    } catch (error) {
      return handleApiError(error);
    }
  },
};

// CashRegister
export const cashRegisterAPI = {
  getCurrent: async (): Promise<CashRegister | null> => {
    try {
      if (API_CONFIG.USE_GOOGLE_SHEETS) {
        return await googleSheetsCashRegister.getCurrent();
      }
      return mockCashRegisters.find(r => r.status === 'open') || null;
    } catch (error) {
      return handleApiError(error);
    }
  },

  getHistory: async (): Promise<CashRegister[]> => {
    try {
      if (API_CONFIG.USE_GOOGLE_SHEETS) {
        return await googleSheetsCashRegister.getHistory();
      }
      return mockCashRegisters;
    } catch (error) {
      return handleApiError(error);
    }
  },

  open: async (initialCash: number, cashier: string): Promise<CashRegister> => {
    try {
      if (API_CONFIG.USE_GOOGLE_SHEETS) {
        return await googleSheetsCashRegister.open(initialCash, cashier);
      }
      const newRegister: CashRegister = {
        id: Math.max(...mockCashRegisters.map(r => r.id)) + 1,
        cashier,
        openedAt: new Date().toISOString(),
        initialCash,
        totalSales: 0,
        totalExpenses: 0,
        status: 'open',
        paymentBreakdown: { efectivo: 0, yape: 0, plin: 0, tarjeta: 0 },
      };
      mockCashRegisters.push(newRegister);
      return newRegister;
    } catch (error) {
      return handleApiError(error);
    }
  },

  close: async (id: number, finalCash: number): Promise<CashRegister> => {
    try {
      if (API_CONFIG.USE_GOOGLE_SHEETS) {
        return await googleSheetsCashRegister.close(id, finalCash);
      }
      const index = mockCashRegisters.findIndex(r => r.id === id);
      if (index === -1) throw new Error('Caja no encontrada');
      mockCashRegisters[index] = {
        ...mockCashRegisters[index],
        closedAt: new Date().toISOString(),
        finalCash,
        status: 'closed',
      };
      return mockCashRegisters[index];
    } catch (error) {
      return handleApiError(error);
    }
  },
};

// Expenses
export const expensesAPI = {
  getAll: async (): Promise<Expense[]> => {
    try {
      if (API_CONFIG.USE_GOOGLE_SHEETS) {
        return await googleSheetsExpenses.getAll();
      }
      return mockExpenses;
    } catch (error) {
      return handleApiError(error);
    }
  },

  create: async (expense: Omit<Expense, 'id'>): Promise<Expense> => {
    try {
      if (API_CONFIG.USE_GOOGLE_SHEETS) {
        return await googleSheetsExpenses.create(expense);
      }
      const newExpense = { ...expense, id: Math.max(...mockExpenses.map(e => e.id)) + 1 };
      mockExpenses.push(newExpense);
      return newExpense;
    } catch (error) {
      return handleApiError(error);
    }
  },

  delete: async (id: number): Promise<void> => {
    try {
      if (API_CONFIG.USE_GOOGLE_SHEETS) {
        await googleSheetsExpenses.delete(id);
        return;
      }
      const index = mockExpenses.findIndex(e => e.id === id);
      if (index === -1) throw new Error('Gasto no encontrado');
      mockExpenses.splice(index, 1);
    } catch (error) {
      return handleApiError(error);
    }
  },
};

// Delivery
export const deliveryAPI = {
  getAll: async (): Promise<DeliveryOrder[]> => {
    try {
      if (API_CONFIG.USE_GOOGLE_SHEETS) {
        return await googleSheetsDelivery.getAll();
      }
      return mockDeliveryOrders;
    } catch (error) {
      return handleApiError(error);
    }
  },

  create: async (order: Omit<DeliveryOrder, 'id'>): Promise<DeliveryOrder> => {
    try {
      if (API_CONFIG.USE_GOOGLE_SHEETS) {
        return await googleSheetsDelivery.create(order);
      }
      const newOrder = { ...order, id: Math.max(...mockDeliveryOrders.map(o => o.id)) + 1 };
      mockDeliveryOrders.push(newOrder);
      return newOrder;
    } catch (error) {
      return handleApiError(error);
    }
  },

  update: async (id: number, order: Partial<DeliveryOrder>): Promise<DeliveryOrder> => {
    try {
      if (API_CONFIG.USE_GOOGLE_SHEETS) {
        return await googleSheetsDelivery.update(id, order);
      }
      const index = mockDeliveryOrders.findIndex(o => o.id === id);
      if (index === -1) throw new Error('Pedido no encontrado');
      mockDeliveryOrders[index] = { ...mockDeliveryOrders[index], ...order };
      return mockDeliveryOrders[index];
    } catch (error) {
      return handleApiError(error);
    }
  },
};

// Settings
export const settingsAPI = {
  get: async (): Promise<Settings> => {
    try {
      if (API_CONFIG.USE_GOOGLE_SHEETS) {
        return await googleSheetsSettings.get();
      }
      return mockSettings;
    } catch (error) {
      return handleApiError(error);
    }
  },

  update: async (settings: Partial<Settings>): Promise<Settings> => {
    try {
      if (API_CONFIG.USE_GOOGLE_SHEETS) {
        return await googleSheetsSettings.update(settings);
      }
      Object.assign(mockSettings, settings);
      return mockSettings;
    } catch (error) {
      return handleApiError(error);
    }
  },
};