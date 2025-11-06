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
};