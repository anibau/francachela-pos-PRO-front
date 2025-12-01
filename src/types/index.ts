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
  productoDescripcion: string; // name en el frontend
  codigoBarra: string; // barcode en el frontend
  categoria: string; // category en el frontend
  precio: number; // price en el frontend
  costo: number; // cost en el frontend
  cantidadActual: number; // stock en el frontend
  cantidadMinima: number; // minStock en el frontend
  proveedor: string; // supplier en el frontend
  descripcion?: string; // description en el frontend
  imagen?: string; // image en el frontend
  precioMayoreo?: number; // wholesalePrice en el frontend
  valorPuntos?: number; // pointsValue en el frontend
  mostrar?: boolean; // showInCatalog en el frontend
  usaInventario?: boolean; // useInventory en el frontend
  
  // Campos adicionales del backend
  fechaCreacion?: string;
  fechaActualizacion?: string;
  activo?: boolean;
  
  // Propiedades computadas para compatibilidad con el frontend
  get name(): string;
  get barcode(): string;
  get category(): string;
  get price(): number;
  get cost(): number;
  get stock(): number;
  get minStock(): number;
  get supplier(): string;
  get description(): string | undefined;
  get image(): string | undefined;
  get wholesalePrice(): number | undefined;
  get pointsValue(): number | undefined;
  get showInCatalog(): boolean | undefined;
  get useInventory(): boolean | undefined;
}

export interface Client {
  id: number;
  nombres: string;
  apellidos: string;
  dni: string;
  telefono: string;
  email?: string;
  direccion?: string;
  fechaNacimiento?: string;
  puntosAcumulados: number;
  
  // Campos adicionales del backend
  codigoCorto?: string;
  fechaCreacion?: string;
  fechaActualizacion?: string;
  activo?: boolean;
  
  // Propiedades computadas para compatibilidad con el frontend
  get name(): string;
  get phone(): string;
  get address(): string | undefined;
  get birthday(): string | undefined;
  get points(): number;
}

export interface SaleItem {
  productId: number;
  productName: string;
  quantity: number;
  price: number;
  subtotal: number;
  pointsValue?: number;
}

export interface Sale {
  id: number;
  fecha: string; // date en el frontend
  clienteId?: number; // clientId en el frontend
  clienteNombre?: string; // clientName en el frontend
  listaProductos: SaleItem[]; // items en el frontend
  subTotal: number; // subtotal en el frontend
  descuento: number; // discount en el frontend
  total: number;
  metodoPago: PaymentMethod; // paymentMethod en el frontend
  comentario?: string; // notes en el frontend
  cajero: string; // cashier en el frontend
  estado: 'COMPLETADA' | 'ANULADA'; // status en el frontend
  puntosOtorgados: number; // pointsEarned en el frontend
  puntosUsados: number; // pointsUsed en el frontend
  ticketId: string; // ticketNumber en el frontend
  
  // Campos adicionales del backend
  tipoCompra?: 'LOCAL' | 'DELIVERY';
  montoRecibido?: number;
  vuelto?: number;
  
  // Propiedades computadas para compatibilidad con el frontend
  get date(): string;
  get clientId(): number | undefined;
  get clientName(): string | undefined;
  get items(): SaleItem[];
  get subtotal(): number;
  get discount(): number;
  get paymentMethod(): PaymentMethod;
  get notes(): string | undefined;
  get cashier(): string;
  get status(): 'completada' | 'anulada';
  get pointsEarned(): number;
  get pointsUsed(): number;
  get ticketNumber(): string;
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
