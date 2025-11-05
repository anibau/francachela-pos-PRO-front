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
  image?: string;
}

export interface Client {
  id: number;
  name: string;
  dni: string;
  phone: string;
  email?: string;
  address?: string;
  points: number;
  debt: number;
  birthday?: string;
  createdAt: string;
}

export type PaymentMethod = 'Efectivo' | 'Yape' | 'Plin' | 'Tarjeta';

export interface SaleItem {
  productId: number;
  productName: string;
  quantity: number;
  price: number;
  subtotal: number;
  pointsValue: number;
}

export interface Sale {
  id: number;
  ticketNumber: string;
  ticketId?: string;
  date: string;
  clientId?: number;
  clientName?: string;
  items: SaleItem[];
  subtotal: number;
  discount: number;
  total: number;
  paymentMethod: PaymentMethod;
  cashier: string;
  notes?: string;
  pointsEarned?: number;
  pointsUsed?: number;
  status: 'completada' | 'cancelada';
}

export interface Promotion {
  id: number;
  name: string;
  description: string;
  type: 'percentage' | 'fixed' | '2x1' | '3x2';
  value: number;
  startDate: string;
  endDate: string;
  active: boolean;
  applicableProducts?: number[];
}

export interface Combo {
  id: number;
  name: string;
  description: string;
  products: { productId: number; quantity: number }[];
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
  status: 'open' | 'closed' | 'pending';
  paymentBreakdown?: {
    efectivo: number;
    yape: number;
    plin: number;
    tarjeta: number;
  };
}

export interface Expense {
  id: number;
  date: string;
  category: string;
  description: string;
  amount: number;
  paymentMethod: PaymentMethod;
  cashRegisterId?: number;
}

export interface PointTransaction {
  id: number;
  clientId: number;
  date: string;
  points: number;
  type: 'earned' | 'redeemed';
  saleId?: number;
  description: string;
}

export interface DeliveryOrder {
  id: number;
  saleId: number;
  clientId: number;
  address: string;
  phone: string;
  status: 'pending' | 'in-transit' | 'delivered' | 'cancelled';
  driver?: string;
  deliveryFee: number;
  estimatedTime?: string;
  notes?: string;
}

export interface Settings {
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

export interface InventoryStats {
  totalProducts: number;
  totalValue: number;
  lowStock: number;
  outOfStock: number;
  toReorder: number;
}

export interface InventoryMovement {
  id: number;
  HORA: string;
  CODIGO_BARRA?: string;
  DESCRIPCION: string;
  COSTO: number;
  PRECIO_VENTA: number;
  EXISTENCIA: number;
  INV_MINIMO: number;
  TIPO: 'salida' | 'ajuste' | 'entrada';
  CANTIDAD: number;
  CAJERO: string;
  PROVEEDOR?: string;
}

export interface SalesStats {
  today: number;
  transactions: number;
  averageTicket: number;
  clientsServed: number;
}
