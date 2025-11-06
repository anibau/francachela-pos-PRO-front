// Tipos base
export type PaymentMethod = 'efectivo' | 'yape' | 'plin' | 'tarjeta';

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
}

export interface Client {
  id: number;
  name: string;
  dni: string;
  phone: string;
  email?: string;
  address?: string;
  birthday?: string;
  points: number;
}

export interface Sale {
  id: number;
  date: string;
  client?: Client;
  products: {
    product: Product;
    quantity: number;
  }[];
  total: number;
  paymentMethod: 'efectivo' | 'yape' | 'plin' | 'tarjeta';
  status: 'completed' | 'cancelled';
}

export interface Promotion {
  id: number;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  discount: number;
  products: Product[];
}

export interface Combo {
  id: number;
  name: string;
  products: {
    product: Product;
    quantity: number;
  }[];
  price: number;
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
  paymentMethod: 'efectivo' | 'yape' | 'plin' | 'tarjeta';
}

export interface DeliveryOrder {
  id: number;
  client: Client;
  address: string;
  products: {
    product: Product;
    quantity: number;
  }[];
  total: number;
  status: 'pending' | 'delivered' | 'cancelled';
  deliveryFee: number;
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
}

export interface InventoryMovement {
  id: number;
  type: 'entrada' | 'salida' | 'ajuste';
  product: Product;
  quantity: number;
  date: string;
  notes?: string;
  user: string;
}