import { API_CONFIG, API_ENDPOINTS } from '@/config/api';
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
  InventoryStats,
  SalesStats,
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
  mockSettings,
} from './mockData';

// Utility function to simulate API delay
const delay = (ms: number = 300) => new Promise(resolve => setTimeout(resolve, ms));

// Generic API call function
async function apiCall<T>(
  endpoint: string,
  options?: RequestInit,
  mockData?: T
): Promise<T> {
  if (API_CONFIG.USE_MOCKS) {
    await delay();
    if (mockData === undefined) {
      throw new Error('Mock data not provided');
    }
    return mockData;
  }

  const response = await fetch(`${API_CONFIG.BASE_URL}${endpoint}`, options);
  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`);
  }
  return response.json();
}

// Products API
export const productsAPI = {
  getAll: () => apiCall<Product[]>(API_ENDPOINTS.PRODUCTS, {}, mockProducts),
  
  getById: (id: number) =>
    apiCall<Product>(
      API_ENDPOINTS.PRODUCT_BY_ID(id),
      {},
      mockProducts.find(p => p.id === id)
    ),
  
  create: (product: Omit<Product, 'id'>) =>
    apiCall<Product>(
      API_ENDPOINTS.PRODUCTS,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product),
      },
      { ...product, id: Math.max(...mockProducts.map(p => p.id)) + 1 } as Product
    ),
  
  update: (id: number, product: Partial<Product>) =>
    apiCall<Product>(
      API_ENDPOINTS.PRODUCT_BY_ID(id),
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product),
      },
      { ...mockProducts.find(p => p.id === id), ...product } as Product
    ),
  
  delete: (id: number) =>
    apiCall<{ success: boolean }>(
      API_ENDPOINTS.PRODUCT_BY_ID(id),
      { method: 'DELETE' },
      { success: true }
    ),
};

// Clients API
export const clientsAPI = {
  getAll: () => apiCall<Client[]>(API_ENDPOINTS.CLIENTS, {}, mockClients),
  
  getById: (id: number) =>
    apiCall<Client>(
      API_ENDPOINTS.CLIENT_BY_ID(id),
      {},
      mockClients.find(c => c.id === id)
    ),
  
  create: (client: Omit<Client, 'id' | 'createdAt'>) =>
    apiCall<Client>(
      API_ENDPOINTS.CLIENTS,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(client),
      },
      {
        ...client,
        id: Math.max(...mockClients.map(c => c.id)) + 1,
        createdAt: new Date().toISOString(),
      } as Client
    ),
  
  update: (id: number, client: Partial<Client>) =>
    apiCall<Client>(
      API_ENDPOINTS.CLIENT_BY_ID(id),
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(client),
      },
      { ...mockClients.find(c => c.id === id), ...client } as Client
    ),
  
  delete: (id: number) =>
    apiCall<{ success: boolean }>(
      API_ENDPOINTS.CLIENT_BY_ID(id),
      { method: 'DELETE' },
      { success: true }
    ),
};

// Sales API
export const salesAPI = {
  getAll: () => apiCall<Sale[]>(API_ENDPOINTS.SALES, {}, mockSales),
  
  getById: (id: number) =>
    apiCall<Sale>(
      API_ENDPOINTS.SALE_BY_ID(id),
      {},
      mockSales.find(s => s.id === id)
    ),
  
  create: (sale: Omit<Sale, 'id' | 'ticketNumber'>) =>
    apiCall<Sale>(
      API_ENDPOINTS.SALES,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sale),
      },
      {
        ...sale,
        id: Math.max(...mockSales.map(s => s.id)) + 1,
        ticketNumber: `T-${String(mockSales.length + 1).padStart(3, '0')}`,
      } as Sale
    ),
  
  cancel: (id: number) =>
    apiCall<Sale>(
      `/sales/${id}/cancel`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
      },
      { ...mockSales.find(s => s.id === id), status: 'cancelada' } as Sale
    ),
  
  getStats: () =>
    apiCall<SalesStats>(
      '/sales/stats',
      {},
      {
        today: 450.00,
        transactions: 12,
        averageTicket: 37.50,
        clientsServed: 10,
      }
    ),
};

// Inventory API
export const inventoryAPI = {
  getAll: () => apiCall<Product[]>(API_ENDPOINTS.INVENTORY, {}, mockProducts),
  
  getStats: () =>
    apiCall<InventoryStats>(
      API_ENDPOINTS.INVENTORY_STATS,
      {},
      {
        totalProducts: mockProducts.length,
        totalValue: mockProducts.reduce((sum, p) => sum + p.cost * p.stock, 0),
        lowStock: mockProducts.filter(p => p.stock <= p.minStock && p.stock > 0).length,
        outOfStock: mockProducts.filter(p => p.stock === 0).length,
        toReorder: mockProducts.filter(p => p.stock < p.minStock).length,
      }
    ),
  
  getMovements: () => apiCall<any[]>('/inventory/movements', {}, []),
  
  createMovement: (movement: any) =>
    apiCall<any>(
      '/inventory/movements',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(movement),
      },
      { ...movement, id: Date.now() }
    ),
};

// Promotions API
export const promotionsAPI = {
  getAll: () => apiCall<Promotion[]>(API_ENDPOINTS.PROMOTIONS, {}, mockPromotions),
  
  getById: (id: number) =>
    apiCall<Promotion>(
      API_ENDPOINTS.PROMOTION_BY_ID(id),
      {},
      mockPromotions.find(p => p.id === id)
    ),
  
  create: (promotion: Omit<Promotion, 'id'>) =>
    apiCall<Promotion>(
      API_ENDPOINTS.PROMOTIONS,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(promotion),
      },
      { ...promotion, id: Math.max(...mockPromotions.map(p => p.id)) + 1 } as Promotion
    ),
  
  update: (id: number, promotion: Partial<Promotion>) =>
    apiCall<Promotion>(
      API_ENDPOINTS.PROMOTION_BY_ID(id),
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(promotion),
      },
      { ...mockPromotions.find(p => p.id === id), ...promotion } as Promotion
    ),
  
  delete: (id: number) =>
    apiCall<{ success: boolean }>(
      API_ENDPOINTS.PROMOTION_BY_ID(id),
      { method: 'DELETE' },
      { success: true }
    ),
};

// Combos API
export const combosAPI = {
  getAll: () => apiCall<Combo[]>(API_ENDPOINTS.COMBOS, {}, mockCombos),
  
  getById: (id: number) =>
    apiCall<Combo>(
      API_ENDPOINTS.COMBO_BY_ID(id),
      {},
      mockCombos.find(c => c.id === id)
    ),
  
  create: (combo: Omit<Combo, 'id'>) =>
    apiCall<Combo>(
      API_ENDPOINTS.COMBOS,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(combo),
      },
      { ...combo, id: Math.max(...mockCombos.map(c => c.id)) + 1 } as Combo
    ),
  
  update: (id: number, combo: Partial<Combo>) =>
    apiCall<Combo>(
      API_ENDPOINTS.COMBO_BY_ID(id),
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(combo),
      },
      { ...mockCombos.find(c => c.id === id), ...combo } as Combo
    ),
  
  delete: (id: number) =>
    apiCall<{ success: boolean }>(
      API_ENDPOINTS.COMBO_BY_ID(id),
      { method: 'DELETE' },
      { success: true }
    ),
};

// Cash Register API
export const cashRegisterAPI = {
  getCurrent: () =>
    apiCall<CashRegister>(
      API_ENDPOINTS.CASH_REGISTER,
      {},
      mockCashRegisters.find(cr => cr.status === 'open')
    ),
  
  getHistory: () =>
    apiCall<CashRegister[]>(
      API_ENDPOINTS.CASH_REGISTER_HISTORY,
      {},
      mockCashRegisters
    ),
  
  open: (initialCash: number, cashier: string) =>
    apiCall<CashRegister>(
      API_ENDPOINTS.CASH_REGISTER,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ initialCash, cashier }),
      },
      {
        id: Math.max(...mockCashRegisters.map(cr => cr.id)) + 1,
        cashier,
        openedAt: new Date().toISOString(),
        initialCash,
        totalSales: 0,
        totalExpenses: 0,
        status: 'open',
        paymentBreakdown: { efectivo: 0, yape: 0, plin: 0, tarjeta: 0 },
      } as CashRegister
    ),
  
  close: (id: number, finalCash: number) =>
    apiCall<CashRegister>(
      API_ENDPOINTS.CASH_REGISTER_CLOSE,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, finalCash }),
      },
      {
        ...mockCashRegisters.find(cr => cr.id === id),
        closedAt: new Date().toISOString(),
        finalCash,
        status: 'closed',
      } as CashRegister
    ),
};

// Expenses API
export const expensesAPI = {
  getAll: () => apiCall<Expense[]>(API_ENDPOINTS.EXPENSES, {}, mockExpenses),
  
  create: (expense: Omit<Expense, 'id'>) =>
    apiCall<Expense>(
      API_ENDPOINTS.EXPENSES,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(expense),
      },
      { ...expense, id: Math.max(...mockExpenses.map(e => e.id)) + 1 } as Expense
    ),
  
  delete: (id: number) =>
    apiCall<{ success: boolean }>(
      API_ENDPOINTS.EXPENSE_BY_ID(id),
      { method: 'DELETE' },
      { success: true }
    ),
};

// Delivery API
export const deliveryAPI = {
  getAll: () => apiCall<DeliveryOrder[]>(API_ENDPOINTS.DELIVERY, {}, mockDeliveryOrders),
  
  getById: (id: number) =>
    apiCall<DeliveryOrder>(
      API_ENDPOINTS.DELIVERY_BY_ID(id),
      {},
      mockDeliveryOrders.find(d => d.id === id)
    ),
  
  create: (order: Omit<DeliveryOrder, 'id'>) =>
    apiCall<DeliveryOrder>(
      API_ENDPOINTS.DELIVERY,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(order),
      },
      { ...order, id: Math.max(...mockDeliveryOrders.map(d => d.id)) + 1 } as DeliveryOrder
    ),
  
  update: (id: number, order: Partial<DeliveryOrder>) =>
    apiCall<DeliveryOrder>(
      API_ENDPOINTS.DELIVERY_BY_ID(id),
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(order),
      },
      { ...mockDeliveryOrders.find(d => d.id === id), ...order } as DeliveryOrder
    ),
};

// Settings API
export const settingsAPI = {
  get: () => apiCall<Settings>(API_ENDPOINTS.SETTINGS, {}, mockSettings),
  
  update: (settings: Partial<Settings>) =>
    apiCall<Settings>(
      API_ENDPOINTS.SETTINGS,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      },
      { ...mockSettings, ...settings }
    ),
};
