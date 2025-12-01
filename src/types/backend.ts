// Tipos para las respuestas del backend real

// Estructura común de respuesta paginada del backend
export interface BackendPaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

// Tipos específicos del backend para Clientes
export interface ClienteBackend {
  id: number;
  nombres: string;
  apellidos: string;
  dni: string;
  fechaNacimiento: string;
  telefono: string;
  fechaRegistro: string;
  puntosAcumulados: number;
  historialCompras: any[];
  historialCanjes: any[];
  codigoCorto: string;
  direccion: string;
  activo: boolean;
  fechaCreacion: string;
  fechaActualizacion: string;
}

// Tipos específicos del backend para Productos
export interface ProductoBackend {
  id: number;
  productoDescripcion: string;
  codigoBarra: string;
  imagen: string | null;
  costo: string; // El backend devuelve como string
  precio: string; // El backend devuelve como string
  precioMayoreo: string; // El backend devuelve como string
  cantidadActual: number;
  cantidadMinima: number;
  proveedor: string;
  categoria: string;
  valorPuntos: number;
  mostrar: boolean;
  usaInventario: boolean;
  fechaCreacion: string;
  fechaActualizacion: string;
}

// Tipos específicos del backend para Ventas
export interface VentaBackend {
  id: number;
  fecha: string;
  cliente: ClienteBackend;
  clienteId: number;
  listaProductos: ProductoVentaBackend[];
  subTotal: string; // El backend devuelve como string
  descuento: string; // El backend devuelve como string
  total: string; // El backend devuelve como string
  metodoPago: string;
  comentario: string | null;
  cajero: string;
  estado: string;
  puntosOtorgados: number;
  puntosUsados: number;
  ticketId: string | null;
  tipoCompra: string;
  montoRecibido: string; // El backend devuelve como string
  vuelto: string; // El backend devuelve como string
  fechaCreacion: string;
  fechaActualizacion: string;
}

export interface ProductoVentaBackend {
  id: number;
  precio: number;
  cantidad: number;
  subtotal: number;
  descripcion: string;
}

// Tipos para query parameters
export interface ClienteQueryParams {
  search?: string;
  page?: number;
  limit?: number;
  activo?: boolean;
}

export interface ProductoQueryParams {
  search?: string;
  page?: number;
  limit?: number;
  categoria?: string;
  mostrar?: boolean;
}

export interface VentaQueryParams {
  search?: string;
  page?: number;
  limit?: number;
  fechaInicio?: string;
  fechaFin?: string;
  estado?: string;
  metodoPago?: string;
}
