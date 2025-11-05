/**
 * Google Sheets Integration Service
 * 
 * Este servicio maneja la conexión bidireccional con Google Sheets como base de datos.
 * Usa Google Apps Script como backend para leer/escribir datos en tiempo real.
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
  InventoryMovement,
} from '@/types';

const GOOGLE_SHEETS_CONFIG = {
  SCRIPT_URL: import.meta.env.VITE_GOOGLE_SHEETS_SCRIPT_URL || '',
  USE_SHEETS: import.meta.env.VITE_USE_GOOGLE_SHEETS === 'true',
};

interface SheetOperation {
  action: 'read' | 'write' | 'update' | 'delete';
  sheet: string;
  data?: any;
  id?: number;
  range?: string;
}

/**
 * Ejecuta una operación en Google Sheets
 */
async function executeSheetOperation<T>(operation: SheetOperation): Promise<T> {
  if (!GOOGLE_SHEETS_CONFIG.USE_SHEETS || !GOOGLE_SHEETS_CONFIG.SCRIPT_URL) {
    throw new Error('Google Sheets integration not configured');
  }

  const response = await fetch(GOOGLE_SHEETS_CONFIG.SCRIPT_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(operation),
  });

  if (!response.ok) {
    throw new Error(`Google Sheets API Error: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Servicio de productos en Google Sheets
 */
export const googleSheetsProducts = {
  getAll: () => executeSheetOperation<Product[]>({
    action: 'read',
    sheet: 'Productos',
  }),

  getById: (id: number) => executeSheetOperation<Product>({
    action: 'read',
    sheet: 'Productos',
    id,
  }),

  create: (product: Omit<Product, 'id'>) => executeSheetOperation<Product>({
    action: 'write',
    sheet: 'Productos',
    data: product,
  }),

  update: (id: number, product: Partial<Product>) => executeSheetOperation<Product>({
    action: 'update',
    sheet: 'Productos',
    id,
    data: product,
  }),

  delete: (id: number) => executeSheetOperation<{ success: boolean }>({
    action: 'delete',
    sheet: 'Productos',
    id,
  }),
};

/**
 * Servicio de clientes en Google Sheets
 */
export const googleSheetsClients = {
  getAll: () => executeSheetOperation<Client[]>({
    action: 'read',
    sheet: 'Clientes',
  }),

  getById: (id: number) => executeSheetOperation<Client>({
    action: 'read',
    sheet: 'Clientes',
    id,
  }),

  create: (client: Omit<Client, 'id' | 'FECHA_REGISTRO'>) => executeSheetOperation<Client>({
    action: 'write',
    sheet: 'Clientes',
    data: {
      ...client,
      FECHA_REGISTRO: new Date().toISOString(),
      PUNTOS_ACUMULADOS: 0,
    },
  }),

  update: (id: number, client: Partial<Client>) => executeSheetOperation<Client>({
    action: 'update',
    sheet: 'Clientes',
    id,
    data: client,
  }),

  delete: (id: number) => executeSheetOperation<{ success: boolean }>({
    action: 'delete',
    sheet: 'Clientes',
    id,
  }),
};

/**
 * Servicio de ventas en Google Sheets
 */
export const googleSheetsSales = {
  getAll: () => executeSheetOperation<Sale[]>({
    action: 'read',
    sheet: 'Ventas',
  }),

  getById: (id: number) => executeSheetOperation<Sale>({
    action: 'read',
    sheet: 'Ventas',
    id,
  }),

  create: (sale: Omit<Sale, 'id'>) => {
    // Formatear datos según estructura de Google Sheets
    // Campos: ID, FECHA, CLIENTE_ID, LISTA_PRODUCTOS, SUB_TOTAL, DESCUENTO, 
    // TOTAL, METODO_PAGO, COMENTARIO, CAJERO, ESTADO, PUNTOS_OTORGADOS, PUNTOS_USADOS, TICKET_ID
    const subTotal = sale.items.reduce((sum, item) => sum + item.subtotal, 0);
    
    const formattedSale = {
      FECHA: sale.date,
      CLIENTE_ID: sale.clientId || '',
      LISTA_PRODUCTOS: JSON.stringify(sale.items.map(item => ({
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        price: item.price,
        subtotal: item.subtotal,
        pointsValue: item.pointsValue,
      }))),
      SUB_TOTAL: subTotal,
      DESCUENTO: sale.discount || 0,
      TOTAL: sale.total,
      METODO_PAGO: sale.paymentMethod,
      COMENTARIO: sale.notes || '',
      CAJERO: sale.cashier || 'Sistema',
      ESTADO: sale.status,
      PUNTOS_OTORGADOS: sale.pointsEarned || 0,
      PUNTOS_USADOS: sale.pointsUsed || 0,
      TICKET_ID: sale.ticketId || '',
    };
    
    return executeSheetOperation<Sale>({
      action: 'write',
      sheet: 'Ventas',
      data: formattedSale,
    });
  },

  // Anular venta (actualiza estado y revierte inventario)
  cancel: (id: number) => executeSheetOperation<Sale>({
    action: 'update',
    sheet: 'Ventas',
    id,
    data: { ESTADO: 'cancelada' },
  }),
};

/**
 * Servicio de movimientos de inventario
 */
export const googleSheetsInventory = {
  getMovements: () => executeSheetOperation<InventoryMovement[]>({
    action: 'read',
    sheet: 'Movimientos_Inventario',
  }),

  createMovement: (movement: Omit<InventoryMovement, 'id'>) => executeSheetOperation<InventoryMovement>({
    action: 'write',
    sheet: 'Movimientos_Inventario',
    data: {
      ...movement,
      HORA: new Date().toISOString(),
    },
  }),
};

/**
 * Servicio de promociones en Google Sheets
 */
export const googleSheetsPromotions = {
  getAll: () => executeSheetOperation<Promotion[]>({
    action: 'read',
    sheet: 'Promociones',
  }),

  create: (promotion: Omit<Promotion, 'id'>) => executeSheetOperation<Promotion>({
    action: 'write',
    sheet: 'Promociones',
    data: promotion,
  }),

  update: (id: number, promotion: Partial<Promotion>) => executeSheetOperation<Promotion>({
    action: 'update',
    sheet: 'Promociones',
    id,
    data: promotion,
  }),

  delete: (id: number) => executeSheetOperation<{ success: boolean }>({
    action: 'delete',
    sheet: 'Promociones',
    id,
  }),
};

/**
 * Servicio de combos en Google Sheets
 */
export const googleSheetsCombos = {
  getAll: () => executeSheetOperation<Combo[]>({
    action: 'read',
    sheet: 'Combos',
  }),

  create: (combo: Omit<Combo, 'id'>) => executeSheetOperation<Combo>({
    action: 'write',
    sheet: 'Combos',
    data: combo,
  }),

  update: (id: number, combo: Partial<Combo>) => executeSheetOperation<Combo>({
    action: 'update',
    sheet: 'Combos',
    id,
    data: combo,
  }),

  delete: (id: number) => executeSheetOperation<{ success: boolean }>({
    action: 'delete',
    sheet: 'Combos',
    id,
  }),
};

/**
 * Servicio de caja registradora en Google Sheets
 */
export const googleSheetsCashRegister = {
  getCurrent: () => executeSheetOperation<CashRegister>({
    action: 'read',
    sheet: 'Caja',
    range: 'current',
  }),

  getHistory: () => executeSheetOperation<CashRegister[]>({
    action: 'read',
    sheet: 'Caja',
  }),

  open: (initialCash: number, cashier: string) => executeSheetOperation<CashRegister>({
    action: 'write',
    sheet: 'Caja',
    data: {
      cashier,
      openedAt: new Date().toISOString(),
      initialCash,
      totalSales: 0,
      totalExpenses: 0,
      status: 'open',
      paymentBreakdown: { efectivo: 0, yape: 0, plin: 0, tarjeta: 0 },
    },
  }),

  close: (id: number, finalCash: number) => executeSheetOperation<CashRegister>({
    action: 'update',
    sheet: 'Caja',
    id,
    data: {
      closedAt: new Date().toISOString(),
      finalCash,
      status: 'closed',
    },
  }),
};

/**
 * Servicio de gastos en Google Sheets
 */
export const googleSheetsExpenses = {
  getAll: () => executeSheetOperation<Expense[]>({
    action: 'read',
    sheet: 'Gastos',
  }),

  create: (expense: Omit<Expense, 'id'>) => executeSheetOperation<Expense>({
    action: 'write',
    sheet: 'Gastos',
    data: {
      ...expense,
      date: new Date().toISOString(),
    },
  }),

  delete: (id: number) => executeSheetOperation<{ success: boolean }>({
    action: 'delete',
    sheet: 'Gastos',
    id,
  }),
};

/**
 * Servicio de delivery en Google Sheets
 */
export const googleSheetsDelivery = {
  getAll: () => executeSheetOperation<DeliveryOrder[]>({
    action: 'read',
    sheet: 'Delivery',
  }),

  create: (order: Omit<DeliveryOrder, 'id'>) => executeSheetOperation<DeliveryOrder>({
    action: 'write',
    sheet: 'Delivery',
    data: order,
  }),

  update: (id: number, order: Partial<DeliveryOrder>) => executeSheetOperation<DeliveryOrder>({
    action: 'update',
    sheet: 'Delivery',
    id,
    data: order,
  }),
};

/**
 * Servicio de configuración en Google Sheets
 */
export const googleSheetsSettings = {
  get: () => executeSheetOperation<Settings>({
    action: 'read',
    sheet: 'Configuracion',
  }),

  update: (settings: Partial<Settings>) => executeSheetOperation<Settings>({
    action: 'update',
    sheet: 'Configuracion',
    data: settings,
  }),
};
