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
  CERVEZAS = 'CERVEZAS',
  BEBIDAS = 'BEBIDAS',
  LICORES = 'LICORES',
  SNACKS = 'SNACKS',
  OTROS = 'OTROS',
  AGUA = 'AGUA',
  GOLOSINAS = 'GOLOSINAS',
  JUEGOS = 'JUEGOS',
  COCTELES = 'COCTELES',
  HIELO = 'HIELO',
  INSUMOS = 'INSUMOS',
  MENAJES = 'MENAJES',
  PACKING = 'PACKING',
  TABACO = 'TABACO'
}

export enum ProductSupplier {
  BACKUS = 'Backus',
  GLORIA = 'Gloria',
  PEPSICO = 'PepsiCo',
  COCA_COLA = 'Coca-Cola',
  KR = 'KR',
  LAYS = 'Lays',
  LOA = 'Loa',
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
  esCumpleañosHoy: boolean;
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

// Payment type - para el array de pagos en ventas
export interface Payment {
  id: number;
  ventaId: number;
  metodoPago: PaymentMethod;
  monto: number;
  referencia?: string | null;
  estado: string;
  notas?: string | null;
  fechaRegistro: string;
  registradoPor: string;
  secuencia: number;
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
  // Compatibilidad retroactiva: mantener metodoPago para ventas antiguas
  metodoPago?: PaymentMethod;
  // Nueva estructura: array de pagos para múltiples métodos
  pagos?: Payment[];
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

// Tipos para el flujo de preview de ventas
export interface SalePreviewRequest {
  items: {
    productoId: number;
    cantidad: number;
  }[];
  clienteId?: number;
  puntosAUsar?: number;
  descuento?: number;
  recargoExtra?: number;
  montoRecibido?: number;
}

export interface SalePreviewResponse {
  subtotal: number;
  descuentoPromos: number;
  descuentoPuntos: number;
  ajusteRedondeo: number;
  total: number;
  totalCobrado: number;
  vuelto: number;
  puntosOtorgados: number;
  detalleItems: {
    productoId: number;
    nombre: string;
    precio: number;
    cantidad: number;
    subtotal: number;
  }[];
  validaciones: {
    stockSuficiente: boolean;
    puntosValidos: boolean;
    mensajes: string[];
  };
}

// Helper para validar preview response
export const isPreviewValid = (preview: SalePreviewResponse | null): boolean => {
  if (!preview) return false;
  return preview.validaciones.stockSuficiente && preview.validaciones.puntosValidos;
};

// Tipos para estado de caja
export interface CashRegisterState {
  abierta: boolean;
  cajaId?: number;
  usuario?: string;
  fechaApertura?: string;
  montoInicial?: number;
  totalVentas?: number;
  totalGastos?: number;
  montoEsperado?: number;
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
  cajero: string;
  fechaApertura: string;
  fechaCierre?: string;
  montoInicial: number;
  montoFinal?: number;
  totalVentas: number;
  totalGastos: number;
  diferencia?: number;
  estado: CashRegisterStatus;
  observaciones?: string;
  desglosePorMetodo: {
    efectivo: number;
    yape: number;
    plin: number;
    tarjeta: number;
  };
  fechaCreacion?: string;
  fechaActualizacion?: string;
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

// Interface para el corte de ventas
export interface VentasCorte {
  fechaInicio: string;
  fechaFin: string;
  totalVentas: number;
  numeroTransacciones: number;
  ticketPromedio: number;
  totalDescuentos: number;
  puntosOtorgados: number;
  puntosCanjeados: number;
  desgloseMetodosPago: {
    [key in PaymentMethod]: {
      cantidad: number;
      monto: number;
    };
  };
  desgloseTipoCompra: {
    LOCAL: { cantidad: number; monto: number };
    DELIVERY: { cantidad: number; monto: number };
  };
  topProductos: Array<{
    productoId: number;
    descripcion: string;
    cantidad: number;
    monto: number;
  }>;
  ventasPorDia: Array<{
    fecha: string;
    cantidad: number;
    monto: number;
  }>;
  ventasAnuladas: number;
  montoVentasAnuladas: number;
}

// Nueva interface para estadísticas de ventas del backend (estructura actualizada)
export interface VentasEstadisticasBackend {
  totalVentas: number;
  totalMonto: number;
  promedioVenta: number;
  totalDescuentos: number;
  totalRecargos: number;
  totalPuntosOtorgados: number;
  totalPuntosUsados: number;
  ventasPorMetodo: {
    [metodo: string]: {
      cantidadVentas: number;
      montoTotal: number;
    };
  };
  ventasPorTipo: {
    [tipo: string]: {
      cantidadVentas: number;
      montoTotal: number;
    };
  };
  topProductos: Array<{
    codigoBarra: string;
    descripcion: string;
    cantidad: number;
    monto: number;
  }>;
  fechaInicio: string;
  fechaFin: string;
  fechaGeneracion: string;
}

// Interfaces para estadísticas de gastos (Requerimiento 4)
export interface GastosEstadisticas {
  totalGastos: number;
  totalMonto: number;
  promedioGasto: number;
  gastosPorCategoria: {
    [categoria: string]: number;
  };
  gastosPorMetodo: {
    [metodo: string]: number;
  };
  topProveedores: Array<{
    id: number;
    nombre: string;
    totalGastos: number;
    montoTotal: number;
  }>;
  fechaInicio?: string;
  fechaFin?: string;
  fechaGeneracion?: string;
}

// Interfaces para clientes top (Requerimiento 5)
export interface ClienteTop {
  id: number;
  nombres: string;
  apellidos: string;
  dni: string;
  fechaNacimiento: string;
  telefono: string;
  fechaRegistro: string;
  puntosAcumulados: number;
  historialCompras: Array<{
    fecha: string;
    monto: number;
    ventaId: number;
    puntosGanados: number;
  }>;
  historialCanjes: Array<{
    fecha: string;
    ventaId: number;
    descripcion: string;
    puntosUsados: number;
  }>;
  codigoCorto: string;
  direccion: string;
  activo: boolean;
  fechaCreacion: string;
  fechaActualizacion: string;
}

export interface TopClientesResponse {
  clientes: ClienteTop[];
  total: number;
  limit: number;
}

// Interfaces para clientes cumpleañeros (Requerimiento 6)
export interface ClientesCumpleanosResponse {
  clientes: ClienteTop[];
  pagination: {
    page: number;
    pages: number;
    total: number;
    limit: number;
  };
}

// Interfaces para estadísticas por DNI (Requerimiento 7)
export interface ClienteEstadisticasByDNI {
  cliente: ClienteTop;
  estadisticas: {
    totalCompras: number;
    montoTotalGastado: number;
    promedioCompra: number;
    puntosGanados: number;
    puntosUsados: number;
    ultimaCompra?: string;
    frecuenciaCompras: string; // 'ALTA', 'MEDIA', 'BAJA'
  };
}

// Interfaces para WhatsApp (Requerimiento 2)
export interface WhatsAppWelcomeResponse {
  success: boolean;
  message: string;
  clienteId: number;
  fechaEnvio: string;
}

// Enums para promociones unificadas
export enum TipoPromocion {
  SIMPLE = 'SIMPLE',
  PACK = 'PACK',
  COMBO = 'COMBO'
}

export enum TipoDescuento {
  PORCENTAJE = 'PORCENTAJE',
  MONTO_FIJO = 'MONTO_FIJO',
  PRECIO_FIJO = 'PRECIO_FIJO'
}

// Interfaces para promociones unificadas
export interface PromocionProducto {
  id?: number;
  promocionId?: number;
  productoId: number;
  cantidadExacta?: number;
  cantidadMinima?: number;
  obligatorio?: boolean;
  producto?: Product;
}

export interface UnifiedPromotion {
  id: number;
  nombre: string;
  descripcion: string;
  tipoPromocion: TipoPromocion;
  tipoDescuento: TipoDescuento;
  descuento: string;
  precioCombo?: string;
  fechaInicio: string;
  fechaFin: string;
  maxUsos: number;
  usosActuales: number;
  activo: boolean;
  puntosExtra?: number;
  createdAt: string;
  updatedAt: string;
  productos: PromocionProducto[];
}

export interface CreateUnifiedPromotionRequest {
  nombre: string;
  descripcion: string;
  tipoPromocion: TipoPromocion;
  tipoDescuento: TipoDescuento;
  descuento: number;
  precioCombo?: number;
  fechaInicio: string;
  fechaFin: string;
  maxUsos: number;
  activo: boolean;
  puntosExtra?: number;
  productosAplicables: {
    productoId: number;
    cantidadExacta?: number;
    cantidadMinima?: number;
    obligatorio?: boolean;
  }[];
}

// Tipos para ENTRADAS
export interface Entrada {
  id: number;
  monto: number;
  descripcion: string;
  categoria: string;
  fecha: string;
  observaciones?: string;
  fechaCreacion: string;
  fechaActualizacion: string;
}

export interface CreateEntradaRequest {
  monto: number;
  descripcion: string;
  categoria: string;
  fecha: string;
  observaciones?: string;
}

export interface EntradasEstadisticas {
  resumen: {
    totalEntradas: number;
    totalMonto: number;
    promedioMonto: number;
  };
  porCategoria: {
    [categoria: string]: number;
  };
  porMes: {
    [mes: string]: number;
  };
  periodo: {
    inicio: string;
    fin: string;
  };
}

export interface EntradasListResponse {
  entradas: Entrada[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  resumen: {
    totalMonto: number;
    totalEntradas: number;
  };
}

// ===== INTERFACES PARA LAS 6 TAREAS CRÍTICAS =====

// Tarea 1: Interface para endpoint GET /corte
export interface CorteResponse {
  periodo: {
    fechaInicio: string;
    fechaFin: string;
  };
  ventas: {
    cantidad: number;
    totalBruto: number;
    totalCobrado: number;
    ajustesRedondeo: number;
    desglosePorMetodo: {
      [metodo: string]: number;
    };
  };
  entradas: {
    cantidad: number;
    total: number;
    porCategoria: {
      [categoria: string]: number;
    };
  };
  gastos: {
    cantidad: number;
    total: number;
    porCategoria: {
      [categoria: string]: number;
    };
  };
  rentabilidad: {
    ingresosTotales: number;
    gastosTotales: number;
    utilidadNeta: number;
    margenUtilidad: number;
  };
}

// Tarea 2: Interface para exportación Excel
export interface CorteExportResponse {
  success: boolean;
  message: string;
  filename: string;
  downloadUrl?: string;
}

// Tarea 3: Interface para estadísticas de corte en Dashboard
export interface CorteEstadisticas {
  ingresosTotales: number;
  gastosTotales: number;
  utilidadNeta: number;
  cantidadVentas: number;
  promedioVenta: number;
  fechaInicio?: string;
  fechaFin?: string;
  fechaGeneracion?: string;
}

// Interface obsoleta - usar PointsEvaluationResponse de pointsService.ts
// Eliminada para evitar conflictos

// Tarea 4: Interface para categorías reutilizables
export interface CategoriaOption {
  id?: number;
  nombre: string;
  descripcion?: string;
  activo?: boolean;
}

export interface CategoriasResponse {
  categorias: CategoriaOption[];
  total: number;
}

// Tarea 5: Interface para validación de stock
export interface StockValidationResponse {
  disponible: boolean;
  stockActual: number;
  stockMinimo: number;
  usaInventario: boolean;
  message: string;
}
