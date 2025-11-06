export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || '',
  USE_MOCKS: import.meta.env.VITE_USE_MOCKS === 'true',
  USE_GOOGLE_SHEETS: import.meta.env.VITE_USE_GOOGLE_SHEETS === 'true',
  GOOGLE_SHEETS_SCRIPT_URL: import.meta.env.VITE_GOOGLE_SHEETS_SCRIPT_URL || '',
};

export const API_ENDPOINTS = {
  // Productos
  PRODUCTS: '/products',
  PRODUCT_BY_ID: (id: number) => `/products/${id}`,
  
  // Clientes
  CLIENTS: '/clients',
  CLIENT_BY_ID: (id: number) => `/clients/${id}`,
  
  // Ventas
  SALES: '/sales',
  SALE_BY_ID: (id: number) => `/sales/${id}`,
  
  // Inventario
  INVENTORY: '/inventory',
  INVENTORY_STATS: '/inventory/stats',
  
  // Promociones
  PROMOTIONS: '/promotions',
  PROMOTION_BY_ID: (id: number) => `/promotions/${id}`,
  
  // Combos
  COMBOS: '/combos',
  COMBO_BY_ID: (id: number) => `/combos/${id}`,
  
  // Caja
  CASH_REGISTER: '/cash-register',
  CASH_REGISTER_CLOSE: '/cash-register/close',
  CASH_REGISTER_HISTORY: '/cash-register/history',
  
  // Gastos
  EXPENSES: '/expenses',
  EXPENSE_BY_ID: (id: number) => `/expenses/${id}`,
  
  // Puntos
  POINTS: '/points',
  POINTS_HISTORY: (clientId: number) => `/points/history/${clientId}`,
  
  // Delivery
  DELIVERY: '/delivery',
  DELIVERY_BY_ID: (id: number) => `/delivery/${id}`,
  
  // Configuraciones
  SETTINGS: '/settings',
};
