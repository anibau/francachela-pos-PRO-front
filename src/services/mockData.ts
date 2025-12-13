import type {
  Product,
  Client,
  Sale,
  Promotion,
  Combo,
  CashRegister,
  Expense,
  DeliveryOrder,
  Settings,
} from '@/types';
import type { User } from '@/contexts/AuthContext';

export const mockUsers: User[] = [
  { id: 1, username: 'admin', role: 'ADMIN', nombre: 'Administrador Sistema' },
  { id: 2, username: 'supervisor1', role: 'CAJERO', nombre: 'María Supervisor' },
  { id: 3, username: 'cajero1', role: 'CAJERO', nombre: 'Juan Cajero' },
];

export const mockProducts: Product[] = [
  { id: 1, productoDescripcion: 'Inca Kola 500ml', codigoBarra: '7750885005609', categoria: 'Bebidas', precio: 3.50, costo: 2.00, cantidadActual: 150, cantidadMinima: 20, proveedor: 'Lindley', imagen: '', precioMayoreo: 3.00, valorPuntos: 3, mostrar: true, usaInventario: true },
  { id: 2, productoDescripcion: 'Coca Cola 500ml', codigoBarra: '7750885005616', categoria: 'Bebidas', precio: 3.50, costo: 2.00, cantidadActual: 200, cantidadMinima: 20, proveedor: 'Lindley', imagen: '', precioMayoreo: 3.00, valorPuntos: 3, mostrar: true, usaInventario: true },
  { id: 3, productoDescripcion: 'Chips Lays 180g', codigoBarra: '7750670000536', categoria: 'Snacks', precio: 5.00, costo: 3.50, cantidadActual: 80, cantidadMinima: 15, proveedor: 'PepsiCo', imagen: '', precioMayoreo: 4.50, valorPuntos: 5, mostrar: true, usaInventario: true },
  { id: 4, productoDescripcion: 'Galletas Oreo', codigoBarra: '7622210100672', categoria: 'Snacks', precio: 4.50, costo: 3.00, cantidadActual: 60, cantidadMinima: 10, proveedor: 'Mondelez', imagen: '', precioMayoreo: 4.00, valorPuntos: 4, mostrar: true, usaInventario: true },
  { id: 5, productoDescripcion: 'Cerveza Pilsen 330ml', codigoBarra: '7750182003476', categoria: 'Bebidas', precio: 4.00, costo: 2.50, cantidadActual: 120, cantidadMinima: 30, proveedor: 'Backus', imagen: '', precioMayoreo: 3.50, valorPuntos: 4, mostrar: true, usaInventario: true },
  { id: 6, productoDescripcion: 'Pan Molde Bimbo', codigoBarra: '7501000112345', categoria: 'Panadería', precio: 6.50, costo: 4.00, cantidadActual: 40, cantidadMinima: 10, proveedor: 'Bimbo', imagen: '', precioMayoreo: 6.00, valorPuntos: 6, mostrar: true, usaInventario: true },
  { id: 7, productoDescripcion: 'Leche Gloria 1L', codigoBarra: '7750670003057', categoria: 'Lácteos', precio: 4.80, costo: 3.20, cantidadActual: 5, cantidadMinima: 15, proveedor: 'Gloria', imagen: '', precioMayoreo: 4.50, valorPuntos: 4, mostrar: true, usaInventario: true },
  { id: 8, productoDescripcion: 'Yogurt Gloria 1L', codigoBarra: '7750670004123', categoria: 'Lácteos', precio: 6.00, costo: 4.00, cantidadActual: 0, cantidadMinima: 10, proveedor: 'Gloria', imagen: '', precioMayoreo: 5.50, valorPuntos: 6, mostrar: true, usaInventario: true },
];

export const mockClients: Client[] = [
  { id: 1, nombres: 'Juan', apellidos: 'Pérez', dni: '12345678', telefono: '+51987654321', email: 'juan@email.com', puntosAcumulados: 450, fechaNacimiento: '1990-05-15', direccion: 'Av. Principal 123' },
  { id: 2, nombres: 'María', apellidos: 'García', dni: '87654321', telefono: '+51987654322', email: 'maria@email.com', puntosAcumulados: 320, fechaNacimiento: '1985-12-20', direccion: 'Jr. Comercio 456' },
  { id: 3, nombres: 'Carlos', apellidos: 'López', dni: '11223344', telefono: '+51987654323', puntosAcumulados: 180, fechaNacimiento: '2025-10-05', direccion: 'Calle Lima 789' },
  { id: 4, nombres: 'Ana', apellidos: 'Torres', dni: '44332211', telefono: '+51987654324', puntosAcumulados: 520, fechaNacimiento: '1992-08-30', direccion: 'Av. Los Olivos 321' },
];

export const mockSales: Sale[] = [
  {
    id: 1,
    ticketId: 'T-001',
    fecha: '2025-10-02T10:30:00',
    clienteId: 1,
    listaProductos: [
      { id: 1, descripcion: 'Inca Kola 500ml', cantidad: 2, precio: 3.50, subtotal: 7.00 },
      { id: 2, descripcion: 'Chips Lays 180g', cantidad: 1, precio: 5.00, subtotal: 5.00 },
    ],
    subTotal: 12.00,
    descuento: 0,
    total: 12.00,
    metodoPago: 'EFECTIVO',
    cajero: 'Admin',
    puntosOtorgados: 12,
    puntosUsados: 0,
    estado: 'COMPLETADA',
  },
  {
    id: 2,
    ticketId: 'T-002',
    fecha: '2025-10-02T11:15:00',
    clienteId: 2,
    listaProductos: [
      { id: 3, descripcion: 'Cerveza Pilsen 330ml', cantidad: 6, precio: 4.00, subtotal: 24.00 },
    ],
    subTotal: 24.00,
    descuento: 2.00,
    total: 22.00,
    metodoPago: 'YAPE',
    cajero: 'Admin',
    puntosOtorgados: 22,
    puntosUsados: 0,
    estado: 'COMPLETADA',
  },
];

export const mockPromotions: Promotion[] = [
  { id: 1, name: '2x1 en Bebidas', description: 'Lleva 2 bebidas y paga 1', type: 'percentage', value: 50, startDate: '2025-10-01', endDate: '2025-10-31', active: true, productIds: [1, 2, 5] },
  { id: 2, name: '20% OFF Snacks', description: '20% de descuento en todos los snacks', type: 'percentage', value: 20, startDate: '2025-10-01', endDate: '2025-10-15', active: true, productIds: [3, 4] },
  { id: 3, name: 'S/5 OFF compras >S/50', description: 'S/5 de descuento en compras mayores a S/50', type: 'fixed', value: 5, startDate: '2025-09-01', endDate: '2025-09-30', active: false },
];

export const mockCombos: Combo[] = [
  {
    id: 1,
    name: 'Combo Lonchera',
    description: 'Bebida + Snack + Pan',
    products: [
      { productId: 1, quantity: 1 },
      { productId: 3, quantity: 1 },
      { productId: 6, quantity: 1 },
    ],
    originalPrice: 15.00,
    comboPrice: 12.00,
    active: true,
  },
  {
    id: 2,
    name: 'Combo Fiesta',
    description: '6 Cervezas + 2 Snacks',
    products: [
      { productId: 5, quantity: 6 },
      { productId: 3, quantity: 2 },
    ],
    originalPrice: 34.00,
    comboPrice: 28.00,
    active: true,
  },
];

export const mockCashRegisters: CashRegister[] = [
  {
    id: 1,
    cashier: 'Admin',
    openedAt: '2025-10-02T08:00:00',
    initialCash: 100.00,
    totalSales: 450.00,
    totalExpenses: 50.00,
    status: 'ABIERTA',
    paymentBreakdown: {
      efectivo: 200.00,
      yape: 150.00,
      plin: 50.00,
      tarjeta: 50.00,
    },
  },
  {
    id: 2,
    cashier: 'Admin',
    openedAt: '2025-10-01T08:00:00',
    closedAt: '2025-10-01T20:00:00',
    initialCash: 100.00,
    finalCash: 580.00,
    totalSales: 520.00,
    totalExpenses: 40.00,
    status: 'CERRADA',
    paymentBreakdown: {
      efectivo: 250.00,
      yape: 150.00,
      plin: 70.00,
      tarjeta: 50.00,
    },
  },
];

export const mockExpenses: Expense[] = [
  { id: 1, date: '2025-10-02T09:00:00', category: 'Servicios', description: 'Pago de luz', amount: 150.00, paymentMethod: 'EFECTIVO' },
  { id: 2, date: '2025-10-02T10:30:00', category: 'Suministros', description: 'Compra de bolsas', amount: 30.00, paymentMethod: 'EFECTIVO' },
  { id: 3, date: '2025-10-01T14:00:00', category: 'Mantenimiento', description: 'Reparación de refrigerador', amount: 200.00, paymentMethod: 'YAPE' },
];

export const mockDeliveryOrders: DeliveryOrder[] = [
  { 
    id: 1, 
    client: mockClients[1], 
    address: 'Jr. Comercio 456', 
    phone: '+51987654322', 
    products: [],
    total: 0,
    status: 'in-transit', 
    driver: 'Carlos Ramos', 
    deliveryFee: 5.00 
  },
  { 
    id: 2, 
    client: mockClients[0], 
    address: 'Av. Principal 123', 
    phone: '+51987654321', 
    products: [],
    total: 0,
    status: 'delivered', 
    driver: 'Luis Mendoza', 
    deliveryFee: 5.00 
  },
];

export const mockSettings: Settings = {
  storeName: 'Francachela POS',
  address: 'Av. Principal 100, Lima, Perú',
  phone: '+51987654320',
  email: 'francachela@negocio.com',
  ruc: '20123456789',
  pointsPerSole: 1,
  solesPerPoint: 0.10,
  deliveryFee: 5.00,
  general: {
    businessName: 'Francachela POS',
    ruc: '20123456789',
    address: 'Av. Principal 100, Lima, Perú',
    phone: '+51987654320',
    email: 'francachela@negocio.com',
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
    solsPerPoint: 0.10,
  },
  notifications: {
    lowStock: true,
    dailyReport: true,
    emailNotifications: false,
  },
};
