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
    name: `${clienteBackend.nombres} ${clienteBackend.apellidos}`.trim(),
    nombres: clienteBackend.nombres,
    apellidos: clienteBackend.apellidos,
    dni: clienteBackend.dni,
    birthday: clienteBackend.fechaNacimiento,
    telefono: clienteBackend.telefono,
    direccion: clienteBackend.direccion,
    points: clienteBackend.puntosAcumulados,
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
  const nombres = client.nombres || client.name?.split(' ')[0] || '';
  const apellidos = client.apellidos || client.name?.split(' ').slice(1).join(' ') || '';
  
  return {
    nombres,
    apellidos,
    dni: client.dni,
    fechaNacimiento: client.birthday,
    telefono: client.telefono,
    direccion: client.direccion,
    puntosAcumulados: client.points,
    activo: client.activo
  };
}

// Mapeo de Producto: Backend → Frontend
export function mapProductoFromBackend(productoBackend: ProductoBackend): Product {
  return {
    id: productoBackend.id,
    name: productoBackend.productoDescripcion,
    barcode: productoBackend.codigoBarra,
    category: productoBackend.categoria,
    price: parseFloat(productoBackend.precio),
    cost: parseFloat(productoBackend.costo),
    wholesalePrice: parseFloat(productoBackend.precioMayoreo),
    stock: productoBackend.cantidadActual,
    minStock: productoBackend.cantidadMinima,
    supplier: productoBackend.proveedor,
    description: productoBackend.productoDescripcion,
    image: productoBackend.imagen || '',
    pointsValue: productoBackend.valorPuntos,
    showInCatalog: productoBackend.mostrar,
    useInventory: productoBackend.usaInventario,
    fechaCreacion: productoBackend.fechaCreacion,
    fechaActualizacion: productoBackend.fechaActualizacion
  };
}

// Mapeo de Producto: Frontend → Backend
export function mapProductoToBackend(product: Partial<Product>): Partial<ProductoBackend> {
  return {
    productoDescripcion: product.name || product.description,
    codigoBarra: product.barcode,
    categoria: product.category,
    precio: product.price?.toString(),
    costo: product.cost?.toString(),
    precioMayoreo: product.wholesalePrice?.toString(),
    cantidadActual: product.stock,
    cantidadMinima: product.minStock,
    proveedor: product.supplier,
    imagen: product.image,
    valorPuntos: product.pointsValue,
    mostrar: product.showInCatalog,
    usaInventario: product.useInventory
  };
}

// Mapeo de Venta: Backend → Frontend
export function mapVentaFromBackend(ventaBackend: VentaBackend): Sale {
  return {
    id: ventaBackend.id,
    date: ventaBackend.fecha,
    client: mapClienteFromBackend(ventaBackend.cliente),
    clientId: ventaBackend.clienteId,
    items: ventaBackend.listaProductos.map(mapProductoVentaFromBackend),
    subtotal: parseFloat(ventaBackend.subTotal),
    discount: parseFloat(ventaBackend.descuento),
    total: parseFloat(ventaBackend.total),
    paymentMethod: ventaBackend.metodoPago,
    notes: ventaBackend.comentario || '',
    cashier: ventaBackend.cajero,
    status: ventaBackend.estado,
    pointsEarned: ventaBackend.puntosOtorgados,
    pointsUsed: ventaBackend.puntosUsados,
    ticketId: ventaBackend.ticketId,
    saleType: ventaBackend.tipoCompra,
    amountReceived: parseFloat(ventaBackend.montoRecibido),
    change: parseFloat(ventaBackend.vuelto),
    fechaCreacion: ventaBackend.fechaCreacion,
    fechaActualizacion: ventaBackend.fechaActualizacion
  };
}

// Mapeo de ProductoVenta: Backend → Frontend
export function mapProductoVentaFromBackend(productoVentaBackend: ProductoVentaBackend): SaleItem {
  return {
    id: productoVentaBackend.id,
    productId: productoVentaBackend.id,
    name: productoVentaBackend.descripcion,
    price: productoVentaBackend.precio,
    quantity: productoVentaBackend.cantidad,
    subtotal: productoVentaBackend.subtotal
  };
}

// Mapeo de Venta: Frontend → Backend
export function mapVentaToBackend(sale: Partial<Sale>): Partial<VentaBackend> {
  return {
    fecha: sale.date,
    clienteId: sale.clientId,
    listaProductos: sale.items?.map(item => ({
      id: item.productId || item.id,
      precio: item.price,
      cantidad: item.quantity,
      subtotal: item.subtotal,
      descripcion: item.name
    })),
    subTotal: sale.subtotal?.toString(),
    descuento: sale.discount?.toString(),
    total: sale.total?.toString(),
    metodoPago: sale.paymentMethod,
    comentario: sale.notes,
    cajero: sale.cashier,
    estado: sale.status,
    puntosOtorgados: sale.pointsEarned,
    puntosUsados: sale.pointsUsed,
    tipoCompra: sale.saleType,
    montoRecibido: sale.amountReceived?.toString(),
    vuelto: sale.change?.toString()
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
