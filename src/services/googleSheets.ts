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
import type { User } from '@/contexts/AuthContext';
import { mockUsers, mockProducts, mockClients, mockSales } from './mockData';

const GOOGLE_SHEETS_CONFIG = {
  SCRIPT_URL: (import.meta.env.VITE_GOOGLE_SHEETS_SCRIPT_URL || '').trim(),
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
  // If Google Sheets integration is disabled, use local mocks for common reads
  if (!GOOGLE_SHEETS_CONFIG.USE_SHEETS) {
    // Provide a small set of mock fallbacks commonly used by the app
    if (operation.action === 'read') {
      switch (operation.sheet) {
        case 'Usuarios':
          return (mockUsers as unknown) as T;
        case 'Productos':
          return (mockProducts as unknown) as T;
        case 'Clientes':
          return (mockClients as unknown) as T;
        case 'Ventas':
          return (mockSales as unknown) as T;
        default:
          throw new Error(`Mock for sheet ${operation.sheet} not implemented`);
      }
    }

    // For write/update/delete in mock mode, return a generic successful response
    return ({ success: true, message: 'Operación simulada (mock)' } as unknown) as T;
  }

  if (!GOOGLE_SHEETS_CONFIG.SCRIPT_URL) {
    throw new Error('Google Sheets SCRIPT_URL not configured');
  }

  // Para evitar problemas de CORS, enviamos todos los parámetros directamente en el body
  const params = new URLSearchParams();
  
  // Convertir la operación en parámetros planos
  params.append('action', operation.action);
  params.append('sheet', operation.sheet);
  if (operation.data) {
    params.append('data', JSON.stringify(operation.data));
  }
  if (operation.id) {
    params.append('id', operation.id.toString());
  }
  if (operation.range) {
    params.append('range', operation.range);
  }

  console.log('Sending request to sheets:', {
    url: GOOGLE_SHEETS_CONFIG.SCRIPT_URL,
    params: Object.fromEntries(params)
  });

  const response = await fetch(GOOGLE_SHEETS_CONFIG.SCRIPT_URL, {
    method: 'POST',
    mode: 'cors',
    redirect: 'follow',
    body: params
  });

  if (!response.ok) {
    console.error('API Error:', response.status, response.statusText);
    throw new Error(`Google Sheets API Error: ${response.status} ${response.statusText}`);
  }

  const result = await response.json();
  console.log('Sheet operation response:', result);

  // Manejar el formato de respuesta estándar
  if (result.ok === false) {
    throw new Error(result.error || 'Error en la operación');
  }

  // Si hay datos en la respuesta, devolverlos
  if (result.data) {
    return result.data as T;
  }

  // Si no hay datos pero la operación fue exitosa
  if (result.ok) {
    return result as T;
  }

  return result;
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
    const formattedSale = {
      FECHA: sale.date,
      CLIENTE_ID: sale.clientId || '',
      LISTA_PRODUCTOS: JSON.stringify(sale.items),
      SUB_TOTAL: sale.subtotal,
      DESCUENTO: sale.discount,
      TOTAL: sale.total,
      METODO_PAGO: sale.paymentMethod,
      COMENTARIO: sale.notes || '',
      CAJERO: sale.cashier,
      ESTADO: sale.status,
      PUNTOS_OTORGADOS: sale.pointsEarned,
      PUNTOS_USADOS: sale.pointsUsed,
      TICKET_ID: sale.ticketNumber,
    };
    
    return executeSheetOperation<Sale>({
      action: 'write',
      sheet: 'Ventas',
      data: formattedSale,
    });
  },

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

/**
 * Servicio de autenticación con Google Sheets
 */
export const googleSheetsAuth = {
  login: async (username: string, password: string): Promise<User> => {
    console.log('Attempting login for user:', username);
    
    try {
      if (!GOOGLE_SHEETS_CONFIG.USE_SHEETS) {
        // Mock login
        const mockUsersWithPass = [
          { ...mockUsers[0], password: 'admin123' },
          { ...mockUsers[1], password: 'super123' },
          { ...mockUsers[2], password: 'caja123' },
        ];
        
        const user = mockUsersWithPass.find(u => 
          u.username === username && u.password === password
        );
        
        if (!user) {
          console.error('Mock login failed: Invalid credentials');
          throw new Error('Usuario o contraseña incorrectos');
        }
        
        const { password: _, ...userWithoutPassword } = user;
        console.log('Mock login successful for:', userWithoutPassword);
        return userWithoutPassword;
      }
      
      // Login usando el executeSheetOperation para mantener consistencia
      const loginOperation = {
        action: 'read' as const,
        sheet: 'Usuarios',
        data: { username, password }
      };

      const response = await executeSheetOperation<{ users?: User[] }>(loginOperation);
      console.log('Auth response:', response);

      if (!response || !Array.isArray(response.users)) {
        throw new Error('Formato de respuesta inválido');
      }

      const user = response.users.find(u => u.username === username);
      if (!user) {
        throw new Error('Usuario o contraseña incorrectos');
      }

      return user;
    } catch (error) {
      console.error('Login error:', error);
      throw new Error('Usuario o contraseña incorrectos');
    }
  }
};
