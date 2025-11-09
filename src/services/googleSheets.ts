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
 * Mapea datos de Sheet a formato TypeScript
 */
function mapSheetToProduct(sheetData: any): Product {
  return {
    id: sheetData.ID || sheetData.id,
    name: sheetData.PRODUCTO_DESCRIPCION || sheetData.name || '',
    barcode: sheetData.CODIGO_BARRA || sheetData.barcode || '',
    description: sheetData.DESCRIPCION || sheetData.description,
    image: sheetData.IMAGEN || sheetData.image,
    cost: parseFloat(sheetData.COSTO || sheetData.cost || 0),
    price: parseFloat(sheetData.PRECIO || sheetData.price || 0),
    wholesalePrice: parseFloat(sheetData.PRECIO_MAYOREO || sheetData.wholesalePrice || 0),
    stock: parseInt(sheetData.CANTIDAD_ACTUAL || sheetData.stock || 0),
    minStock: parseInt(sheetData.CANTIDAD_MINIMA || sheetData.minStock || 0),
    supplier: sheetData.PROVEEDOR || sheetData.supplier,
    category: sheetData.CATEGORIA || sheetData.category || '',
    pointsValue: parseInt(sheetData.VALOR_PUNTOS || sheetData.pointsValue || 0),
    showInCatalog: sheetData.MOSTRAR === 'TRUE' || sheetData.MOSTRAR === 'SI' || sheetData.MOSTRAR === true || sheetData.showInCatalog === true,
    useInventory: sheetData.USA_INVENTARIO === 'TRUE' || sheetData.USA_INVENTARIO === 'SI' || sheetData.USA_INVENTARIO === true || sheetData.useInventory === true,
  };
}

function mapSheetToClient(sheetData: any): Client {
  // Manejar nombres y apellidos separados o nombre completo
  const fullName = sheetData.NOMBRES && sheetData.APELLIDOS 
    ? `${sheetData.NOMBRES} ${sheetData.APELLIDOS}`.trim()
    : (sheetData.NOMBRE || sheetData.name || '');

  return {
    id: sheetData.ID || sheetData.id,
    name: fullName,
    dni: String(sheetData.DNI || sheetData.dni || ''),
    phone: String(sheetData.TELEFONO || sheetData.phone || ''),
    email: sheetData.EMAIL || sheetData.email,
    address: sheetData.DIRECCION || sheetData.address,
    birthday: sheetData.FECHA_NACIMIENTO || sheetData.birthday,
    points: parseInt(sheetData.PUNTOS_ACUMULADOS || sheetData.points || 0),
  };
}

function mapSheetToSale(sheetData: any): Sale {
  let items = [];
  try {
    items = typeof sheetData.LISTA_PRODUCTOS === 'string' 
      ? JSON.parse(sheetData.LISTA_PRODUCTOS)
      : sheetData.LISTA_PRODUCTOS || sheetData.items || [];
  } catch (e) {
    console.error('Error parsing sale items:', e);
  }

  // Manejar campos con espacios en blanco (trim all keys)
  const cleanData: any = {};
  Object.keys(sheetData).forEach(key => {
    cleanData[key.trim()] = sheetData[key];
  });

  return {
    id: cleanData.ID || cleanData.id,
    ticketNumber: cleanData.TICKET_ID || cleanData.ticketNumber || '',
    date: cleanData.FECHA || cleanData.date || new Date().toISOString(),
    clientId: cleanData.CLIENTE_ID || cleanData.clientId,
    clientName: cleanData.CLIENTE_NOMBRE || cleanData.clientName,
    items: items,
    subtotal: parseFloat(cleanData.SUB_TOTAL || cleanData.subtotal || 0),
    discount: parseFloat(cleanData.DESCUENTO || cleanData.discount || 0),
    total: parseFloat(cleanData.TOTAL || cleanData.total || 0),
    paymentMethod: (cleanData.METODO_PAGO || cleanData.paymentMethod || 'Efectivo').trim(),
    notes: cleanData.COMENTARIO || cleanData.notes,
    cashier: (cleanData.CAJERO || cleanData.cashier || '').trim(),
    status: (cleanData.ESTADO || cleanData.status || 'completada').trim() as 'completada' | 'cancelada',
    pointsEarned: parseInt(cleanData.PUNTOS_OTORGADOS || cleanData.pointsEarned || 0),
    pointsUsed: parseInt(cleanData.PUNTOS_USADOS || cleanData.pointsUsed || 0),
  };
}

function mapSheetToPromotion(sheetData: any): Promotion {
  let productIds = [];
  try {
    productIds = typeof sheetData.PRODUCTOS_ID === 'string'
      ? JSON.parse(sheetData.PRODUCTOS_ID)
      : sheetData.PRODUCTOS_ID || sheetData.productIds || [];
  } catch (e) {
    console.error('Error parsing promotion productIds:', e);
  }

  // El sheet usa DESCUENTO en lugar de VALOR
  const value = parseFloat(sheetData.DESCUENTO || sheetData.VALOR || sheetData.value || 0);

  return {
    id: sheetData.ID || sheetData.id,
    name: sheetData.NOMBRE || sheetData.name || '',
    description: sheetData.DESCRIPCION || sheetData.description || '',
    type: (sheetData.TIPO || sheetData.type || 'percentage') as Promotion['type'],
    value: value,
    productIds: productIds,
    startDate: sheetData.FECHA_INICIO || sheetData.startDate || new Date().toISOString(),
    endDate: sheetData.FECHA_FIN || sheetData.endDate || new Date().toISOString(),
    active: sheetData.ACTIVO === 'SI' || sheetData.ACTIVO === true || sheetData.active === true,
  };
}

function mapSheetToCombo(sheetData: any): Combo {
  let products = [];
  try {
    products = typeof sheetData.PRODUCTOS === 'string'
      ? JSON.parse(sheetData.PRODUCTOS)
      : sheetData.PRODUCTOS || sheetData.products || [];
  } catch (e) {
    console.error('Error parsing combo products:', e);
  }

  // El sheet usa COMBO_PRECIO (con guion bajo) y ACTIVE en lugar de ACTIVO
  const comboPrice = parseFloat(sheetData.COMBO_PRECIO || sheetData.PRECIO_COMBO || sheetData.comboPrice || 0);
  const isActive = sheetData.ACTIVE === 'SI' || sheetData.ACTIVE === true || 
                   sheetData.ACTIVO === 'SI' || sheetData.ACTIVO === true || 
                   sheetData.active === true;

  return {
    id: sheetData.ID || sheetData.id,
    name: sheetData.NOMBRE || sheetData.name || '',
    description: sheetData.DESCRIPCION || sheetData.description || '',
    products: products,
    originalPrice: parseFloat(sheetData.PRECIO_ORIGINAL || sheetData.originalPrice || 0),
    comboPrice: comboPrice,
    active: isActive,
  };
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
  getAll: async () => {
    const data = await executeSheetOperation<any[]>({
      action: 'read',
      sheet: 'Productos',
    });
    return data.map(mapSheetToProduct);
  },

  getById: (id: number) => executeSheetOperation<Product>({
    action: 'read',
    sheet: 'Productos',
    id,
  }),

  create: (product: Omit<Product, 'id'>) => {
    return executeSheetOperation<Product>({
      action: 'write',
      sheet: 'Productos',
      data: {
        PRODUCTO_DESCRIPCION: product.name,
        CODIGO_BARRA: product.barcode,
        IMAGEN: product.image || '',
        COSTO: product.cost,
        PRECIO: product.price,
        PRECIO_MAYOREO: product.wholesalePrice || 0,
        CANTIDAD_ACTUAL: product.stock,
        CANTIDAD_MINIMA: product.minStock,
        PROVEEDOR: product.supplier,
        CATEGORIA: product.category,
        VALOR_PUNTOS: product.pointsValue || 0,
        MOSTRAR: product.showInCatalog ? 'TRUE' : 'FALSE',
        USA_INVENTARIO: product.useInventory ? 'TRUE' : 'FALSE',
      },
    });
  },

  update: (id: number, product: Partial<Product>) => {
    const updateData: any = {};
    
    if (product.name) updateData.PRODUCTO_DESCRIPCION = product.name;
    if (product.barcode) updateData.CODIGO_BARRA = product.barcode;
    if (product.image !== undefined) updateData.IMAGEN = product.image;
    if (product.cost !== undefined) updateData.COSTO = product.cost;
    if (product.price !== undefined) updateData.PRECIO = product.price;
    if (product.wholesalePrice !== undefined) updateData.PRECIO_MAYOREO = product.wholesalePrice;
    if (product.stock !== undefined) updateData.CANTIDAD_ACTUAL = product.stock;
    if (product.minStock !== undefined) updateData.CANTIDAD_MINIMA = product.minStock;
    if (product.supplier) updateData.PROVEEDOR = product.supplier;
    if (product.category) updateData.CATEGORIA = product.category;
    if (product.pointsValue !== undefined) updateData.VALOR_PUNTOS = product.pointsValue;
    if (product.showInCatalog !== undefined) updateData.MOSTRAR = product.showInCatalog ? 'TRUE' : 'FALSE';
    if (product.useInventory !== undefined) updateData.USA_INVENTARIO = product.useInventory ? 'TRUE' : 'FALSE';
    
    return executeSheetOperation<Product>({
      action: 'update',
      sheet: 'Productos',
      id,
      data: updateData,
    });
  },

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
  getAll: async () => {
    const data = await executeSheetOperation<any[]>({
      action: 'read',
      sheet: 'Clientes',
    });
    return data.map(mapSheetToClient);
  },

  getById: (id: number) => executeSheetOperation<Client>({
    action: 'read',
    sheet: 'Clientes',
    id,
  }),

  create: (client: Omit<Client, 'id'>) => {
    // Separar nombre completo en NOMBRES y APELLIDOS
    const nameParts = (client.name || '').trim().split(' ');
    const apellidos = nameParts.length > 1 ? nameParts.slice(-1).join(' ') : '';
    const nombres = nameParts.length > 1 ? nameParts.slice(0, -1).join(' ') : nameParts[0] || '';
    
    // Asegurar que el teléfono tenga el prefijo +51
    const phoneWithPrefix = client.phone.startsWith('+51') || client.phone.startsWith('51') 
      ? client.phone 
      : `+51${client.phone}`;
    
    return executeSheetOperation<Client>({
      action: 'write',
      sheet: 'Clientes',
      data: {
        NOMBRES: nombres,
        APELLIDOS: apellidos,
        DNI: client.dni,
        TELEFONO: phoneWithPrefix,
        EMAIL: client.email || '',
        DIRECCION: client.address || '',
        FECHA_NACIMIENTO: client.birthday || '',
        FECHA_REGISTRO: new Date().toISOString(),
        PUNTOS_ACUMULADOS: (client as any).points || 0,
        HISTORIAL_COMPRAS: '',
        HISTORIAL_CANJES: '',
      },
    });
  },

  update: (id: number, client: Partial<Client>) => {
    // Separar nombre completo en NOMBRES y APELLIDOS si viene
    const updateData: any = {};
    
    if (client.name) {
      const nameParts = client.name.trim().split(' ');
      updateData.APELLIDOS = nameParts.length > 1 ? nameParts.slice(-1).join(' ') : '';
      updateData.NOMBRES = nameParts.length > 1 ? nameParts.slice(0, -1).join(' ') : nameParts[0] || '';
    }
    
    if (client.dni) updateData.DNI = client.dni;
    if (client.phone) {
      // Asegurar que el teléfono tenga el prefijo +51
      updateData.TELEFONO = client.phone.startsWith('+51') || client.phone.startsWith('51') 
        ? client.phone 
        : `+51${client.phone}`;
    }
    if (client.email !== undefined) updateData.EMAIL = client.email;
    if (client.address !== undefined) updateData.DIRECCION = client.address;
    if (client.birthday !== undefined) updateData.FECHA_NACIMIENTO = client.birthday;
    if (client.points !== undefined) updateData.PUNTOS_ACUMULADOS = client.points;
    
    return executeSheetOperation<Client>({
      action: 'update',
      sheet: 'Clientes',
      id,
      data: updateData,
    });
  },

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
  getAll: async () => {
    const data = await executeSheetOperation<any[]>({
      action: 'read',
      sheet: 'Ventas',
    });
    return data.map(mapSheetToSale);
  },

  getById: (id: number) => executeSheetOperation<Sale>({
    action: 'read',
    sheet: 'Ventas',
    id,
  }),

  create: (sale: Omit<Sale, 'id'>) => {
    const formattedSale = {
      'FECHA ': sale.date || new Date().toISOString(),
      CLIENTE_ID: sale.clientId || '',
      CLIENTE_NOMBRE: sale.clientName || '',
      LISTA_PRODUCTOS: JSON.stringify(sale.items),
      SUB_TOTAL: sale.subtotal || 0,
      'DESCUENTO ': sale.discount || 0,
      'TOTAL ': sale.total || 0,
      METODO_PAGO: sale.paymentMethod || 'Efectivo',
      'COMENTARIO ': sale.notes || '',
      'CAJERO ': sale.cashier || 'Sistema',
      'ESTADO ': sale.status || 'completada',
      PUNTOS_OTORGADOS: sale.pointsEarned || 0,
      PUNTOS_USADOS: sale.pointsUsed || 0,
      TICKET_ID: sale.ticketNumber || `T-${Date.now()}`,
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
  getAll: async () => {
    const data = await executeSheetOperation<any[]>({
      action: 'read',
      sheet: 'Promociones',
    });
    return data.map(mapSheetToPromotion);
  },

  create: (promotion: Omit<Promotion, 'id'>) => executeSheetOperation<Promotion>({
    action: 'write',
    sheet: 'Promociones',
    data: {
      NOMBRE: promotion.name,
      DESCRIPCION: promotion.description,
      TIPO: promotion.type,
      DESCUENTO: promotion.value,
      PRODUCTOS_ID: promotion.productIds ? JSON.stringify(promotion.productIds) : '[]',
      FECHA_INICIO: promotion.startDate,
      FECHA_FIN: promotion.endDate,
      ACTIVO: promotion.active ? 'SI' : 'NO',
    },
  }),

  update: (id: number, promotion: Partial<Promotion>) => {
    const updateData: any = {};
    
    if (promotion.name) updateData.NOMBRE = promotion.name;
    if (promotion.description) updateData.DESCRIPCION = promotion.description;
    if (promotion.type) updateData.TIPO = promotion.type;
    if (promotion.value !== undefined) updateData.DESCUENTO = promotion.value;
    if (promotion.productIds) updateData.PRODUCTOS_ID = JSON.stringify(promotion.productIds);
    if (promotion.startDate) updateData.FECHA_INICIO = promotion.startDate;
    if (promotion.endDate) updateData.FECHA_FIN = promotion.endDate;
    if (promotion.active !== undefined) updateData.ACTIVO = promotion.active ? 'SI' : 'NO';
    
    return executeSheetOperation<Promotion>({
      action: 'update',
      sheet: 'Promociones',
      id,
      data: updateData,
    });
  },

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
  getAll: async () => {
    const data = await executeSheetOperation<any[]>({
      action: 'read',
      sheet: 'Combos',
    });
    return data.map(mapSheetToCombo);
  },

  create: (combo: Omit<Combo, 'id'>) => executeSheetOperation<Combo>({
    action: 'write',
    sheet: 'Combos',
    data: {
      NOMBRE: combo.name,
      DESCRIPCION: combo.description,
      PRODUCTOS: JSON.stringify(combo.products),
      PRECIO_ORIGINAL: combo.originalPrice,
      COMBO_PRECIO: combo.comboPrice,
      ACTIVE: combo.active ? 'SI' : 'NO',
    },
  }),

  update: (id: number, combo: Partial<Combo>) => {
    const updateData: any = {};
    
    if (combo.name) updateData.NOMBRE = combo.name;
    if (combo.description) updateData.DESCRIPCION = combo.description;
    if (combo.products) updateData.PRODUCTOS = JSON.stringify(combo.products);
    if (combo.originalPrice !== undefined) updateData.PRECIO_ORIGINAL = combo.originalPrice;
    if (combo.comboPrice !== undefined) updateData.COMBO_PRECIO = combo.comboPrice;
    if (combo.active !== undefined) updateData.ACTIVE = combo.active ? 'SI' : 'NO';
    
    return executeSheetOperation<Combo>({
      action: 'update',
      sheet: 'Combos',
      id,
      data: updateData,
    });
  },

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
