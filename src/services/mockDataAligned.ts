/**
 * Mock data alineado con la estructura del backend
 * Este archivo reemplazará gradualmente a mockData.ts
 */

import type {
  Product,
  Client,
  Sale,
  Promotion,
  Combo,
  CashRegister,
  Expense,
  Settings,
  SaleItem,
} from '@/types';

// Productos mock alineados con el backend
export const mockProductsAligned: Product[] = [
  {
    id: 1,
    productoDescripcion: 'Cerveza Pilsen 650ml',
    codigoBarra: '7751271001234',
    categoria: 'Bebidas',
    precio: 4.50,
    costo: 2.80,
    cantidadActual: 120,
    cantidadMinima: 20,
    proveedor: 'Backus',
    imagen: '/images/products/pilsen.jpg',
    precioMayoreo: 4.00,
    valorPuntos: 5,
    mostrar: true,
    usaInventario: true,
    fechaCreacion: '2024-01-15T10:00:00Z',
    fechaActualizacion: '2024-01-15T10:00:00Z',
    activo: true,
  },
  {
    id: 2,
    productoDescripcion: 'Inca Kola 500ml',
    codigoBarra: '7750885005609',
    categoria: 'Bebidas',
    precio: 3.50,
    costo: 2.00,
    cantidadActual: 150,
    cantidadMinima: 20,
    proveedor: 'Lindley',
    imagen: '/images/products/inca-kola.jpg',
    precioMayoreo: 3.00,
    valorPuntos: 3,
    mostrar: true,
    usaInventario: true,
    fechaCreacion: '2024-01-15T10:00:00Z',
    fechaActualizacion: '2024-01-15T10:00:00Z',
    activo: true,
  },
  {
    id: 3,
    productoDescripcion: 'Chips Lays 180g',
    codigoBarra: '7750670000536',
    categoria: 'Snacks',
    precio: 5.00,
    costo: 3.50,
    cantidadActual: 80,
    cantidadMinima: 15,
    proveedor: 'PepsiCo',
    imagen: '/images/products/lays.jpg',
    precioMayoreo: 4.50,
    valorPuntos: 5,
    mostrar: true,
    usaInventario: true,
    fechaCreacion: '2024-01-15T10:00:00Z',
    fechaActualizacion: '2024-01-15T10:00:00Z',
    activo: true,
  },
  {
    id: 4,
    productoDescripcion: 'Leche Gloria 1L',
    codigoBarra: '7750670003057',
    categoria: 'Lácteos',
    precio: 4.80,
    costo: 3.20,
    cantidadActual: 5, // Stock bajo para testing
    cantidadMinima: 15,
    proveedor: 'Gloria',
    imagen: '/images/products/gloria.jpg',
    precioMayoreo: 4.50,
    valorPuntos: 4,
    mostrar: true,
    usaInventario: true,
    fechaCreacion: '2024-01-15T10:00:00Z',
    fechaActualizacion: '2024-01-15T10:00:00Z',
    activo: true,
  },
];

// Clientes mock alineados con el backend
export const mockClientsAligned: Client[] = [
  {
    id: 1,
    nombres: 'Juan Carlos',
    apellidos: 'García López',
    dni: '12345678',
    telefono: '987654321',
    email: 'juan@email.com',
    direccion: 'Av. Lima 123, San Isidro',
    fechaNacimiento: '1990-05-15',
    puntosAcumulados: 450,
    codigoCorto: 'JCG001',
    fechaCreacion: '2024-01-10T08:00:00Z',
    fechaActualizacion: '2024-01-10T08:00:00Z',
    activo: true,
  },
  {
    id: 2,
    nombres: 'María Elena',
    apellidos: 'Rodríguez Vega',
    dni: '87654321',
    telefono: '987654322',
    email: 'maria@email.com',
    direccion: 'Jr. Comercio 456, Miraflores',
    fechaNacimiento: '1985-12-20',
    puntosAcumulados: 320,
    codigoCorto: 'MRV002',
    fechaCreacion: '2024-01-10T08:00:00Z',
    fechaActualizacion: '2024-01-10T08:00:00Z',
    activo: true,
  },
  {
    id: 3,
    nombres: 'Carlos Alberto',
    apellidos: 'López Mendoza',
    dni: '11223344',
    telefono: '987654323',
    direccion: 'Calle Lima 789, San Borja',
    fechaNacimiento: '1992-10-05',
    puntosAcumulados: 180,
    codigoCorto: 'CLM003',
    fechaCreacion: '2024-01-10T08:00:00Z',
    fechaActualizacion: '2024-01-10T08:00:00Z',
    activo: true,
  },
];

// Ventas mock alineadas con el backend
export const mockSalesAligned: Sale[] = [
  {
    id: 1,
    ticketId: 'T-001-2024',
    fecha: '2024-12-01T10:30:00Z',
    clienteId: 1,
    listaProductos: [
      { 
        id: 1, 
        descripcion: 'Cerveza Pilsen 650ml', 
        cantidad: 2, 
        precio: 4.50, 
        subtotal: 9.00, 
      },
      { 
        id: 3, 
        descripcion: 'Chips Lays 180g', 
        cantidad: 1, 
        precio: 5.00, 
        subtotal: 5.00, 
      },
    ],
    subTotal: 14.00,
    descuento: 0,
    total: 14.00,
    metodoPago: 'EFECTIVO',
    comentario: 'Cliente frecuente',
    cajero: 'Juan Cajero',
    estado: 'COMPLETADA',
    puntosOtorgados: 14,
    puntosUsados: 0,
    tipoCompra: 'LOCAL',
    montoRecibido: 20.00,
    vuelto: 6.00,
  },
  {
    id: 2,
    ticketId: 'T-002-2024',
    fecha: '2024-12-01T14:15:00Z',
    clienteId: 2,
    listaProductos: [
      { 
        id: 2, 
        descripcion: 'Inca Kola 500ml', 
        cantidad: 3, 
        precio: 3.50, 
        subtotal: 10.50, 
      },
      { 
        id: 4, 
        descripcion: 'Leche Gloria 1L', 
        cantidad: 2, 
        precio: 4.80, 
        subtotal: 9.60, 
      },
    ],
    subTotal: 20.10,
    descuento: 2.00,
    total: 18.10,
    metodoPago: 'YAPE',
    comentario: 'Descuento por cumpleaños',
    cajero: 'Juan Cajero',
    estado: 'COMPLETADA',
    puntosOtorgados: 18,
    puntosUsados: 50,
    tipoCompra: 'LOCAL',
    montoRecibido: 18.10,
    vuelto: 0,
  },
];

// Promociones mock alineadas con el backend
export const mockPromotionsAligned: Promotion[] = [
  {
    id: 1,
    name: 'Descuento de Verano',
    description: '20% de descuento en bebidas',
    type: 'percentage',
    value: 20,
    startDate: '2024-12-01',
    endDate: '2024-12-31',
    active: true,
    productIds: [1, 2], // Cerveza Pilsen e Inca Kola
  },
  {
    id: 2,
    name: 'Combo Familiar',
    description: 'S/5 de descuento en compras mayores a S/50',
    type: 'fixed',
    value: 5,
    startDate: '2024-12-01',
    endDate: '2024-12-31',
    active: true,
  },
];

// Combos mock alineados con el backend
export const mockCombosAligned: Combo[] = [
  {
    id: 1,
    name: 'Combo Cerveza + Snack',
    description: 'Cerveza Pilsen + Chips Lays',
    products: [
      { productId: 1, quantity: 1 }, // Cerveza Pilsen
      { productId: 3, quantity: 1 }, // Chips Lays
    ],
    originalPrice: 9.50,
    comboPrice: 8.00,
    active: true,
  },
  {
    id: 2,
    name: 'Combo Desayuno',
    description: 'Leche Gloria + Pan (cuando esté disponible)',
    products: [
      { productId: 4, quantity: 1 }, // Leche Gloria
    ],
    originalPrice: 4.80,
    comboPrice: 4.50,
    active: true,
  },
];

// Gastos mock alineados con el backend
export const mockExpensesAligned: Expense[] = [
  {
    id: 1,
    date: '2024-12-01T09:00:00Z',
    description: 'Compra de productos de limpieza',
    amount: 25.50,
    category: 'OPERATIVO',
    paymentMethod: 'EFECTIVO',
  },
  {
    id: 2,
    date: '2024-12-01T11:30:00Z',
    description: 'Pago de servicios básicos',
    amount: 150.00,
    category: 'ADMINISTRATIVO',
    paymentMethod: 'TARJETA',
  },
];

// Caja registradora mock alineada con el backend
export const mockCashRegistersAligned: CashRegister[] = [
  {
    id: 1,
    cashier: 'Juan Cajero',
    openedAt: '2024-12-01T08:00:00Z',
    closedAt: '2024-12-01T20:00:00Z',
    initialCash: 100.00,
    finalCash: 450.00,
    totalSales: 500.00,
    totalExpenses: 175.50,
    status: 'CERRADA',
    paymentBreakdown: {
      efectivo: 300.00,
      yape: 150.00,
      plin: 50.00,
      tarjeta: 0.00,
    },
  },
];

// Configuraciones mock alineadas con el backend
export const mockSettingsAligned: Settings = {
  storeName: 'Francachela POS',
  address: 'Av. Principal 123, Lima, Perú',
  phone: '+51 987 654 321',
  email: 'info@francachela.com',
  ruc: '20123456789',
  pointsPerSole: 1,
  solesPerPoint: 0.1,
  deliveryFee: 5.00,
  general: {
    businessName: 'Francachela SAC',
    ruc: '20123456789',
    address: 'Av. Principal 123, Lima, Perú',
    phone: '+51 987 654 321',
    email: 'info@francachela.com',
  },
  payments: {
    acceptCash: true,
    acceptYape: true,
    acceptPlin: true,
    acceptCard: true,
  },
  points: {
    enabled: true,
    pointsPerSol: 1,
    solsPerPoint: 0.1,
  },
  notifications: {
    lowStock: true,
    dailyReport: true,
    emailNotifications: false,
  },
};

// Categorías de productos disponibles
export const mockProductCategories = [
  'Bebidas',
  'Snacks',
  'Lácteos',
  'Abarrotes',
  'Limpieza',
  'Higiene Personal',
  'Confitería',
  'Panadería',
  'Congelados',
  'Otros',
];

// Proveedores disponibles
export const mockSuppliers = [
  'Alicorp',
  'Gloria',
  'Nestlé',
  'PepsiCo',
  'Backus',
  'Coca-Cola',
  'San Fernando',
  'Laive',
  'Arcor',
  'Mondelez',
  'Lindley',
  'Bimbo',
  'Otro',
];

// Categorías de gastos disponibles
export const mockExpenseCategories = [
  'OPERATIVO',
  'ADMINISTRATIVO',
  'MARKETING',
  'MANTENIMIENTO',
  'OTROS',
];

// Estados de delivery disponibles
export const mockDeliveryStatuses = [
  'PENDIENTE',
  'ASIGNADO',
  'EN_CAMINO',
  'ENTREGADO',
  'CANCELADO',
];
