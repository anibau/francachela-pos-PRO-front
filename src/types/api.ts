// Tipos para las respuestas de la API del backend
export interface ApiResponse<T = any> {
  status: boolean;
  message: string;
  data: T;
}

export interface ApiError {
  status: false;
  message: string;
  error?: string;
}

// Tipos para autenticación JWT
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: {
    id: number;
    email: string;
    username: string;
    role: 'ADMIN' | 'CAJERO' | 'INVENTARIOS';
    nombre: string;
  };
  token: string;
}

// Tipos para paginación
export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Tipos para filtros de fecha
export interface DateRangeFilter {
  from: string; // YYYY-MM-DD
  to: string;   // YYYY-MM-DD
}

// Tipos específicos para productos según el backend
export interface ProductCreateRequest {
  productoDescripcion: string;
  codigoBarra: string;
  imagen?: string;
  costo: number;
  precio: number;
  precioMayoreo?: number;
  cantidadActual: number;
  cantidadMinima: number;
  proveedor: string;
  categoria: string;
  valorPuntos?: number;
  mostrar?: boolean;
  usaInventario?: boolean;
}

export interface ProductUpdateRequest extends Partial<ProductCreateRequest> {}

export interface ProductStockUpdateRequest {
  cantidad: number;
  tipo: 'ENTRADA' | 'SALIDA' | 'AJUSTE';
  observaciones?: string;
  proveedor?: string;
  numeroFactura?: string;
}

// Tipos para clientes según el backend
export interface ClientCreateRequest {
  nombres: string;
  apellidos: string;
  dni: string;
  fechaNacimiento?: string;
  telefono: string;
  direccion?: string;
}

export interface ClientUpdateRequest extends Partial<ClientCreateRequest> {}

// Tipos para ventas según el backend
export interface SaleCreateRequest {
  clienteId?: number;
  listaProductos: {
    productoId: number;
    cantidad: number;
    precioUnitario: number;
  }[];
  descuento?: number;
  metodoPago: 'EFECTIVO' | 'YAPE' | 'PLIN' | 'TARJETA';
  comentario?: string;
  tipoCompra?: 'LOCAL' | 'DELIVERY';
  montoRecibido?: number;
  puntosUsados?: number;
}

// Tipos para promociones según el backend
export interface PromotionCreateRequest {
  nombre: string;
  descripcion: string;
  tipo: 'PORCENTAJE' | 'MONTO_FIJO';
  descuento: number;
  fechaInicio: string;
  fechaFin: string;
  productosId?: number[];
  clientesId?: number[];
  montoMinimo?: number;
  cantidadMaxima?: number;
  active?: boolean;
}

// Tipos para combos según el backend
export interface ComboCreateRequest {
  nombre: string;
  descripcion: string;
  productos: {
    productoId: number;
    cantidad: number;
  }[];
  precioOriginal: number;
  precioCombo: number;
  puntosExtra?: number;
  active?: boolean;
}

// Tipos para caja según el backend
export interface CashRegisterOpenRequest {
  montoInicial: number;
  observaciones?: string;
}

export interface CashRegisterCloseRequest {
  montoFinal: number;
  observaciones?: string;
}

// Tipos para gastos según el backend
export interface ExpenseCreateRequest {
  descripcion: string;
  monto: number;
  categoria: 'OPERATIVO' | 'ADMINISTRATIVO' | 'MARKETING' | 'MANTENIMIENTO' | 'OTROS';
  metodoPago: 'EFECTIVO' | 'YAPE' | 'PLIN' | 'TARJETA';
  proveedor?: string;
  numeroComprobante?: string;
  comprobante?: string;
}

// Tipos para delivery según el backend
export interface DeliveryCreateRequest {
  clienteId: number;
  pedidoId: number;
  direccion: string;
  repartidor: string;
  phone: string;
  deliveryFee: number;
  notes?: string;
}

export interface DeliveryUpdateRequest extends Partial<DeliveryCreateRequest> {
  estado?: 'PENDIENTE' | 'ASIGNADO' | 'EN_CAMINO' | 'ENTREGADO' | 'CANCELADO';
  horaSalida?: string;
  horaEntrega?: string;
}

// Tipos para movimientos de inventario según el backend
export interface InventoryMovementCreateRequest {
  codigoBarra: string;
  tipo: 'ENTRADA' | 'SALIDA' | 'AJUSTE';
  cantidad: number;
  costo?: number;
  precioVenta?: number;
  cajero: string;
  proveedor?: string;
}

// Tipos para WhatsApp según el backend
export interface WhatsAppSendRequest {
  phone: string;
  message: string;
  ventaId?: number;
}

// Tipos para estadísticas
export interface SalesStatistics {
  totalVentas: number;
  ventasHoy: number;
  ventasSemana: number;
  ventasMes: number;
  promedioVenta: number;
  productosVendidos: number;
}

export interface ClientStatistics {
  totalCompras: number;
  montoTotal: number;
  ultimaCompra: string;
  puntosAcumulados: number;
  puntosUsados: number;
}

export interface CashRegisterStatistics {
  ventasEfectivo: number;
  ventasYape: number;
  ventasPlin: number;
  ventasTarjeta: number;
  totalVentas: number;
  totalGastos: number;
  diferencia: number;
  // Campos adicionales para el nuevo servicio
  totalCajas?: number;
  cajasAbiertas?: number;
  cajasCerradas?: number;
  promedioVentasPorCaja?: number;
  cajeroMasActivo?: string;
}

// Tipos adicionales para servicios secundarios

// Tipos para Promociones
export interface PromotionCreateRequest {
  nombre: string;
  descripcion: string;
  tipo: 'PORCENTAJE' | 'MONTO_FIJO';
  descuento: number;
  fechaInicio: string;
  fechaFin: string;
  productosId?: number[];
  active: boolean;
}

// Tipos para Caja Registradora
export interface CashRegisterOpenRequest {
  cajero: string;
  montoInicial: number;
  observaciones?: string;
}

export interface CashRegisterCloseRequest {
  montoFinal: number;
  observaciones?: string;
}

// Tipos para Gastos
export interface ExpenseCreateRequest {
  descripcion: string;
  monto: number;
  categoria: string;
  metodoPago: string;
  cajero?: string;
  observaciones?: string;
}

// Tipos para Movimientos de Inventario
export interface InventoryMovementCreateRequest {
  productoId: number;
  productoNombre?: string;
  tipo: 'ENTRADA' | 'SALIDA' | 'AJUSTE';
  cantidad: number;
  descripcion?: string;
  cajero?: string;
}
