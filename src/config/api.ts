export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
  USE_MOCKS: import.meta.env.VITE_USE_MOCKS === 'true',
  USE_BACKEND: import.meta.env.VITE_USE_BACKEND === 'true',
  ENABLE_LOGGING: import.meta.env.VITE_ENABLE_LOGGING === 'true',
  MOCK_DELAY: parseInt(import.meta.env.VITE_MOCK_DELAY || '500'),
  JWT_SECRET: import.meta.env.VITE_JWT_SECRET || 'francachela_pos_secret_key',
  JWT_EXPIRES_IN: import.meta.env.VITE_JWT_EXPIRES_IN || '24h',
};

export const API_ENDPOINTS = {
  // App
  HEALTH_CHECK: '/',
  
  // Autenticación
  AUTH: {
    LOGIN: '/auth/login',
    PROFILE: '/auth/profile',
  },
  
  // Usuarios
  USERS: {
    BASE: '/users',
    BY_ID: (id: number) => `/users/${id}`,
    ACTIVATE: (id: number) => `/users/${id}/activate`,
  },
  
  // Productos
  PRODUCTS: {
    BASE: '/productos',
    BY_ID: (id: number) => `/productos/${id}`,
    SEARCH: '/productos/search',
    CATEGORIES: '/productos/categorias',
    LOW_STOCK: '/productos/stock-bajo',
    BY_CATEGORY: (categoria: string) => `/productos/categoria/${categoria}`,
    BY_PROVIDER: (proveedor: string) => `/productos/proveedor/${proveedor}`,
    MOVEMENTS: '/productos/movimientos',
    UPDATE_STOCK: (id: number) => `/productos/${id}/stock`,
    ACTIVATE: (id: number) => `/productos/${id}/activate`,
  },
  
  // Ventas
  SALES: {
    BASE: '/ventas',
    BY_ID: (id: number) => `/ventas/${id}`,
    BY_CLIENT: (clientId: number) => `/ventas/cliente/${clientId}`,
    STATISTICS: '/ventas/estadisticas',
    BY_RANGE: '/ventas/rango',
    BY_TICKET: (ticketId: string) => `/ventas/ticket/${ticketId}`,
    CANCEL: (id: number) => `/ventas/${id}/anular`,
    RETURN: (id: number) => `/ventas/devolucion/${id}`,
    TODAY: '/ventas/hoy',
    CORTE: '/ventas/corte',
  },
  
  // Clientes
  CLIENTS: {
    BASE: '/clientes',
    BY_ID: (id: number) => `/clientes/${id}`,
    SEARCH: '/clientes/search',
    BIRTHDAYS: '/clientes/cumpleaneros',
    TOP: '/clientes/top',
    BY_DNI: (dni: string) => `/clientes/dni/${dni}`,
    BY_CODE: (codigo: string) => `/clientes/codigo/${codigo}`,
    STATISTICS: (dni: string) => `/clientes/${dni}/estadisticas`,
    ACTIVATE: (id: number) => `/clientes/${id}/activate`,
  },
  
  // Promociones
  PROMOTIONS: {
    BASE: '/promociones',
    BY_ID: (id: number) => `/promociones/${id}`,
    ACTIVE: '/promociones/activas',
    VALIDATE: '/promociones/validar',
    ACTIVATE: (id: number) => `/promociones/${id}/activate`,
    DEACTIVATE: (id: number) => `/promociones/${id}/deactivate`,
  },
  
  // Combos
  COMBOS: {
    BASE: '/combos',
    BY_ID: (id: number) => `/combos/${id}`,
    ACTIVE: '/combos/activos',
    POPULAR: '/combos/populares',
    AVAILABILITY: (id: number) => `/combos/${id}/disponibilidad`,
    SAVINGS: (id: number) => `/combos/${id}/ahorro`,
    ACTIVATE: (id: number) => `/combos/${id}/activate`,
    DEACTIVATE: (id: number) => `/combos/${id}/deactivate`,
  },
  
  // Caja
  CASH_REGISTER: {
    BASE: '/caja',
    OPEN: '/caja/abrir',
    CLOSE: (id: number) => `/caja/${id}/cerrar`,
    CURRENT: '/caja/actual',
    SUMMARY: '/caja/resumen',
    STATISTICS: '/caja/estadisticas',
    BY_ID: (id: number) => `/caja/${id}`,
    BY_RANGE: '/caja/rango',
  },
  
  // Gastos
  EXPENSES: {
    BASE: '/gastos',
    BY_ID: (id: number) => `/gastos/${id}`,
    TODAY: '/gastos/hoy',
    CATEGORIES: '/gastos/categorias',
    STATISTICS: '/gastos/estadisticas',
    SEARCH: '/gastos/search',
    BY_RANGE: '/gastos/rango',
    BY_CATEGORY: (categoria: string) => `/gastos/categoria/${categoria}`,
    BY_CASHIER: (cajero: string) => `/gastos/cajero/${cajero}`,
  },
  
  // Delivery
  DELIVERY: {
    BASE: '/delivery',
    BY_ID: (id: number) => `/delivery/${id}`,
    TODAY: '/delivery/hoy',
    DRIVERS: '/delivery/repartidores',
    STATISTICS: '/delivery/estadisticas',
    BY_STATUS: (estado: string) => `/delivery/estado/${estado}`,
    BY_DRIVER: (repartidor: string) => `/delivery/repartidor/${repartidor}`,
    BY_RANGE: '/delivery/rango',
    ASSIGN: (id: number) => `/delivery/${id}/asignar`,
    IN_TRANSIT: (id: number) => `/delivery/${id}/en-camino`,
    DELIVERED: (id: number) => `/delivery/${id}/entregado`,
    CANCEL: (id: number) => `/delivery/${id}/cancelar`,
  },
  
  // Movimiento Inventario
  INVENTORY_MOVEMENTS: {
    BASE: '/movimiento-inventario',
    BY_ID: (id: number) => `/movimiento-inventario/${id}`,
    TODAY: '/movimiento-inventario/hoy',
    STATISTICS: '/movimiento-inventario/estadisticas',
    BY_TYPE: (tipo: string) => `/movimiento-inventario/tipo/${tipo}`,
    BY_CASHIER: (cajero: string) => `/movimiento-inventario/cajero/${cajero}`,
    BY_RANGE: '/movimiento-inventario/rango',
    ENTRY: '/movimiento-inventario/entrada',
    ADJUSTMENT: '/movimiento-inventario/ajuste',
    SALE: '/movimiento-inventario/venta',
  },
  
  // WhatsApp
  WHATSAPP: {
    SEND: '/whatsapp/send',
    STATUS: '/whatsapp/status',
    QR: '/whatsapp/qr',
    RECONNECT: '/whatsapp/reconnect',
    LOGOUT: '/whatsapp/logout',
    SEND_CLIENT_INFO: '/whatsapp/send-client-info',
    BIRTHDAY: '/whatsapp/birthday',
    SEND_WELCOME: '/whatsapp/send-welcome/',
  },
  
  // Exportación Excel
  EXCEL: {
    SALES: '/excel/export-ventas',
    SALES_PAYMENTS: '/excel/export-venta-pagos',
    PRODUCTS: '/excel/export-productos',
    CLIENTS: '/excel/export-clientes',
    INVENTORY: '/excel/export-inventario',
    DELIVERY: '/excel/export-delivery',
  },
};
