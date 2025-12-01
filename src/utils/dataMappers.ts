// Funciones de mapeo entre tipos del backend y frontend

import type { Client, Product, Sale, SaleItem } from '@/types';
import type { 
  ClienteBackend, 
  ProductoBackend, 
  VentaBackend, 
  ProductoVentaBackend,
  BackendPaginatedResponse 
} from '@/types/backend';

// Mapeo de Cliente: Backend → Frontend
export function mapClienteFromBackend(clienteBackend: ClienteBackend): Client {
  return {
    id: clienteBackend.id,
    nombres: clienteBackend.nombres,
    apellidos: clienteBackend.apellidos,
    dni: clienteBackend.dni,
    fechaNacimiento: clienteBackend.fechaNacimiento,
    telefono: clienteBackend.telefono,
    direccion: clienteBackend.direccion,
    puntosAcumulados: clienteBackend.puntosAcumulados,
    fechaRegistro: clienteBackend.fechaRegistro,
    codigoCorto: clienteBackend.codigoCorto,
    activo: clienteBackend.activo,
    historialCompras: clienteBackend.historialCompras,
    historialCanjes: clienteBackend.historialCanjes,
    fechaCreacion: clienteBackend.fechaCreacion,
    fechaActualizacion: clienteBackend.fechaActualizacion
  };
}

// Mapeo de Cliente: Frontend → Backend
export function mapClienteToBackend(client: Partial<Client>): Partial<ClienteBackend> {
  return {
    nombres: client.nombres,
    apellidos: client.apellidos,
    dni: client.dni,
    fechaNacimiento: client.fechaNacimiento,
    telefono: client.telefono,
    direccion: client.direccion,
    puntosAcumulados: client.puntosAcumulados,
    activo: client.activo
  };
}

// Mapeo de Producto: Backend → Frontend
export function mapProductoFromBackend(productoBackend: ProductoBackend): Product {
  return {
    id: productoBackend.id,
    productoDescripcion: productoBackend.productoDescripcion,
    codigoBarra: productoBackend.codigoBarra,
    categoria: productoBackend.categoria,
    precio: parseFloat(productoBackend.precio),
    costo: parseFloat(productoBackend.costo),
    precioMayoreo: parseFloat(productoBackend.precioMayoreo),
    cantidadActual: productoBackend.cantidadActual,
    cantidadMinima: productoBackend.cantidadMinima,
    proveedor: productoBackend.proveedor,
    imagen: productoBackend.imagen || undefined,
    valorPuntos: productoBackend.valorPuntos,
    mostrar: productoBackend.mostrar,
    usaInventario: productoBackend.usaInventario,
    fechaCreacion: productoBackend.fechaCreacion,
    fechaActualizacion: productoBackend.fechaActualizacion
  };
}

// Mapeo de Producto: Frontend → Backend
export function mapProductoToBackend(product: Partial<Product>): Partial<ProductoBackend> {
  return {
    productoDescripcion: product.productoDescripcion,
    codigoBarra: product.codigoBarra,
    categoria: product.categoria,
    precio: product.precio?.toString(),
    costo: product.costo?.toString(),
    precioMayoreo: product.precioMayoreo?.toString(),
    cantidadActual: product.cantidadActual,
    cantidadMinima: product.cantidadMinima,
    proveedor: product.proveedor,
    imagen: product.imagen,
    valorPuntos: product.valorPuntos,
    mostrar: product.mostrar,
    usaInventario: product.usaInventario
  };
}

// Mapeo de Venta: Backend → Frontend
export function mapVentaFromBackend(ventaBackend: VentaBackend): Sale {
  return {
    id: ventaBackend.id,
    fecha: ventaBackend.fecha,
    cliente: ventaBackend.cliente ? mapClienteFromBackend(ventaBackend.cliente) : undefined,
    clienteId: ventaBackend.clienteId,
    listaProductos: ventaBackend.listaProductos.map(mapProductoVentaFromBackend),
    subTotal: parseFloat(ventaBackend.subTotal),
    descuento: parseFloat(ventaBackend.descuento),
    total: parseFloat(ventaBackend.total),
    metodoPago: ventaBackend.metodoPago as any,
    comentario: ventaBackend.comentario,
    cajero: ventaBackend.cajero,
    estado: ventaBackend.estado,
    puntosOtorgados: ventaBackend.puntosOtorgados,
    puntosUsados: ventaBackend.puntosUsados,
    ticketId: ventaBackend.ticketId,
    tipoCompra: ventaBackend.tipoCompra,
    montoRecibido: parseFloat(ventaBackend.montoRecibido),
    vuelto: parseFloat(ventaBackend.vuelto),
    fechaCreacion: ventaBackend.fechaCreacion,
    fechaActualizacion: ventaBackend.fechaActualizacion
  };
}

// Mapeo de ProductoVenta: Backend → Frontend
export function mapProductoVentaFromBackend(productoVentaBackend: ProductoVentaBackend): SaleItem {
  return {
    id: productoVentaBackend.id,
    precio: productoVentaBackend.precio,
    cantidad: productoVentaBackend.cantidad,
    subtotal: productoVentaBackend.subtotal,
    descripcion: productoVentaBackend.descripcion
  };
}

// Mapeo de Venta: Frontend → Backend (para crear ventas)
export function mapVentaToBackend(sale: Partial<Sale>): any {
  return {
    clienteId: sale.clienteId,
    listaProductos: sale.listaProductos?.map(item => ({
      productoId: item.id,
      cantidad: item.cantidad,
      precioUnitario: item.precio
    })),
    descuento: sale.descuento || 0,
    metodoPago: sale.metodoPago,
    comentario: sale.comentario || '',
    tipoCompra: sale.tipoCompra || 'LOCAL',
    montoRecibido: sale.montoRecibido || 0,
    puntosUsados: sale.puntosUsados || 0
  };
}

// Función utilitaria para extraer datos de respuesta paginada
export function extractDataFromPaginatedResponse<T>(
  response: BackendPaginatedResponse<T>
): T[] {
  return response.data || [];
}

// Función utilitaria para extraer metadatos de paginación
export function extractPaginationMeta(
  response: BackendPaginatedResponse<any>
): {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
} {
  return {
    total: response.total,
    page: response.page,
    limit: response.limit,
    totalPages: response.totalPages,
    hasNextPage: response.hasNextPage,
    hasPrevPage: response.hasPrevPage
  };
}

// Función para mapear arrays completos
export function mapClientesFromBackend(clientesBackend: ClienteBackend[]): Client[] {
  return clientesBackend.map(mapClienteFromBackend);
}

export function mapProductosFromBackend(productosBackend: ProductoBackend[]): Product[] {
  return productosBackend.map(mapProductoFromBackend);
}

export function mapVentasFromBackend(ventasBackend: VentaBackend[]): Sale[] {
  return ventasBackend.map(mapVentaFromBackend);
}
