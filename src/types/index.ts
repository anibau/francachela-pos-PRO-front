// Tipos base
export type PaymentMethod = 'EFECTIVO' | 'YAPE' | 'PLIN' | 'TARJETA';

// Enums para categorías y proveedores
export enum ProductCategory {
  BEBIDAS = 'Bebidas',
  SNACKS = 'Snacks',
  LACTEOS = 'Lácteos',
  ABARROTES = 'Abarrotes',
  LIMPIEZA = 'Limpieza',
  HIGIENE = 'Higiene Personal',
  CONFITERIA = 'Confitería',
  PANADERIA = 'Panadería',
  CONGELADOS = 'Congelados',
  OTROS = 'Otros',
}

export enum ProductSupplier {
  ALICORP = 'Alicorp',
  GLORIA = 'Gloria',
  NESTLE = 'Nestlé',
  PEPSICO = 'PepsiCo',
  BACKUS = 'Backus',
  COCA_COLA = 'Coca-Cola',
  SAN_FERNANDO = 'San Fernando',
  LAIVE = 'Laive',
  ARCOR = 'Arcor',
  MONDELEZ = 'Mondelez',
  OTRO = 'Otro',
}

export interface Product {
  id: number;
  name: string;
  barcode: string;
  category: string;
  price: number;
  cost: number;
  stock: number;
  minStock: number;
  supplier: string;
  description?: string;
  image?: string;
  wholesalePrice?: number;
  pointsValue?: number;
  showInCatalog?: boolean;
  useInventory?: boolean;
  
  // Campos adicionales del backend
  fechaCreacion?: string;
  fechaActualizacion?: string;
}

export interface Client {
  id: number;
  name: string;
  nombres: string;
  apellidos: string;
  dni: string;
  telefono: string;
  direccion?: string;
  birthday?: string;
  points: number;
  
  // Campos adicionales del backend
  fechaRegistro?: string;
  codigoCorto?: string;
  activo?: boolean;
  historialCompras?: any[];
  historialCanjes?: any[];
  fechaCreacion?: string;
  fechaActualizacion?: string;
}

export interface SaleItem {
  id: number;
  productId: number;
  name: string;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface Sale {
  id: number;
  date: string;
  client?: Client;
  clientId?: number;
  items: SaleItem[];
  subtotal: number;
  discount: number;
  total: number;
  paymentMethod: PaymentMethod;
  notes?: string;
  cashier: string;
  status: string;
  pointsEarned: number;
  pointsUsed: number;
  ticketId?: string | null;
  
  // Campos adicionales del backend
  saleType?: string;
  amountReceived?: number;
  change?: number;
  fechaCreacion?: string;
  fechaActualizacion?: string;
}

export interface Promotion {
  id: number;
  name: string;
  description: string;
  type: 'percentage' | 'fixed';
  value: number;
  startDate: string;
  endDate: string;
  active: boolean;
  productIds?: number[];
}

export interface Combo {
  id: number;
  name: string;
  description: string;
  products: {
    productId: number;
    quantity: number;
  }[];
  originalPrice: number;
  comboPrice: number;
  active: boolean;
}

export interface CashRegister {
  id: number;
  cashier: string;
  openedAt: string;
  closedAt?: string;
  initialCash: number;
  finalCash?: number;
  totalSales: number;
  totalExpenses: number;
  status: 'open' | 'closed';
  paymentBreakdown: {
    efectivo: number;
    yape: number;
    plin: number;
    tarjeta: number;
  };
}

export interface Expense {
  id: number;
  date: string;
  description: string;
  amount: number;
  category: string;
  paymentMethod: PaymentMethod;
}

export interface DeliveryOrder {
  id: number;
  client: Client;
  address: string;
  phone: string;
  products: {
    product: Product;
    quantity: number;
  }[];
  total: number;
  status: 'pending' | 'in-transit' | 'delivered' | 'cancelled';
  deliveryFee: number;
  driver?: string;
  notes?: string;
}

export interface Settings {
  storeName: string;
  address: string;
  phone: string;
  email: string;
  ruc: string;
  pointsPerSole: number;
  solesPerPoint: number;
  deliveryFee: number;
  general: {
    businessName: string;
    ruc: string;
    address: string;
    phone: string;
    email: string;
  };
  payments: {
    acceptCash: boolean;
    acceptYape: boolean;
    acceptPlin: boolean;
    acceptCard: boolean;
  };
  points: {
    enabled: boolean;
    pointsPerSol: number;
    solsPerPoint: number;
  };
  notifications: {
    lowStock: boolean;
    dailyReport: boolean;
    emailNotifications: boolean;
  };
}

export interface InventoryMovement {
  id: number;
  TIPO: 'entrada' | 'salida' | 'ajuste';
  PRODUCTO_ID: number;
  PRODUCTO_NOMBRE?: string;
  CANTIDAD: number;
  HORA: string;
  DESCRIPCION?: string;
  CAJERO: string;
}
