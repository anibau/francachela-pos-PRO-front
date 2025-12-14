// Tipos base
/**
 * Métodos de pago soportados
 * IMPORTANTE: Estos valores DEBEN concordar exactamente con los valores del backend
 * No cambiar sin actualizar el backend correspondiente
 * 
 * @example
 * const paymentMethod: PaymentMethod = 'EFECTIVO';
 */
export type PaymentMethod = 'EFECTIVO' | 'YAPE' | 'PLIN' | 'TARJETA';

// Enums para categorías y proveedores
export enum ProductCategory {
  CERVEZAS = 'Cervezas',
  BEBIDAS = 'Bebidas',
  LICORES = 'Licores',
  SNACKS = 'Snacks',
  COMIDA = 'Comida',
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
  BACKUS = 'Backus',
  ALICORP = 'Alicorp',
  GLORIA = 'Gloria',
  NESTLE = 'Nestlé',
  PEPSICO = 'PepsiCo',
  COCA_COLA = 'Coca-Cola',
  SAN_FERNANDO = 'San Fernando',
  LAIVE = 'Laive',
  ARCOR = 'Arcor',
  MONDELEZ = 'Mondelez',
  SAN_LUIS = 'San Luis',
  VINAS_PERUANAS = 'Viñas Peruanas',
  COCINA_LOCAL = 'Cocina Local',
  OTRO = 'Otro',
}

// Product type - nombres en español para coincidir con backend
export interface Product {
  id: number;
  productoDescripcion: string;
  codigoBarra: string;
  imagen?: string | null;
  costo: number;
  precio: number;
  precioMayoreo: number;
  cantidadActual: number;
  cantidadMinima: number;
  proveedor: string;
  categoria: string;
  valorPuntos: number;
  mostrar: boolean;
  usaInventario: boolean;
  fechaCreacion?: string;
  fechaActualizacion?: string;
  activo?: boolean;
}

// Client type - nombres en español para coincidir con backend
export interface Client {
  id: number;
  nombres: string;
  apellidos: string;
  dni: string;
  telefono: string;
  direccion?: string;
  fechaNacimiento?: string;
  puntosAcumulados: number;
  email?: string;
  fechaRegistro?: string;
  codigoCorto?: string;
  activo?: boolean;
  historialCompras?: unknown[];
  historialCanjes?: unknown[];
  fechaCreacion?: string;
  fechaActualizacion?: string;
  // Helper para obtener nombre completo
  readonly name?: string;
}

// Sale Item type - nombres en español
export interface SaleItem {
  id: number;
  precio: number;
  cantidad: number;
  subtotal: number;
  descripcion: string;
}

// Sale type - nombres en español para coincidir con backend
export interface Sale {
  id: number;
  fecha: string;
  cliente?: Client;
  clienteId?: number;
  listaProductos: SaleItem[];
  subTotal: number;
  descuento: number;
  total: number;
  metodoPago: PaymentMethod;
  comentario?: string | null;
  cajero: string;
  estado: string;
  puntosOtorgados: number;
  puntosUsados: number;
  ticketId?: string | null;
  tipoCompra?: string;
  montoRecibido?: number;
  vuelto?: number;
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
    productoId?: number;
    cantidad?: number;
  }[];
  originalPrice: number;
  comboPrice: number;
  active: boolean;
}

// CashRegister status type alineado con backend
export type CashRegisterStatus = 'ABIERTA' | 'CERRADA';

export interface CashRegister {
  id: number;
  cashier: string;
  openedAt: string;
  closedAt?: string;
  initialCash: number;
  finalCash?: number;
  totalSales: number;
  totalExpenses: number;
  status: CashRegisterStatus;
  notes?: string;
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
  cashier?: string;
  notes?: string;
  provider?: string;
  receiptNumber?: string;
  receipt?: string;
  creationDate?: string;
  voucherNumber?: string
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

// Inventory Movement type alineado con backend response
export interface InventoryMovement {
  id: number;
  hora?: string;
  codigoBarra?: string;
  descripcion?: string;
  costo?: string;
  precioVenta?: string;
  existenciaAnterior?: number;
  existenciaNueva?: number;
  existencia?: number;
  invMinimo?: number;
  tipo?: string;
  cantidad?: number;
  cajero?: string;
  proveedor?: string | null;
  numeroFactura?: string | null;
  observaciones?: string | null;
  ventaId?: number | null;
  fechaCreacion?: string;
  fechaActualizacion?: string;
 
}
