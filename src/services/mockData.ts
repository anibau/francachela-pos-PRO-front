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

export const mockProducts: Product[] = [
  { id: 1, name: 'Inca Kola 500ml', barcode: '7750885005609', category: 'Bebidas', price: 3.50, cost: 2.00, stock: 150, minStock: 20, supplier: 'Lindley' },
  { id: 2, name: 'Coca Cola 500ml', barcode: '7750885005616', category: 'Bebidas', price: 3.50, cost: 2.00, stock: 200, minStock: 20, supplier: 'Lindley' },
  { id: 3, name: 'Chips Lays 180g', barcode: '7750670000536', category: 'Snacks', price: 5.00, cost: 3.50, stock: 80, minStock: 15, supplier: 'PepsiCo' },
  { id: 4, name: 'Galletas Oreo', barcode: '7622210100672', category: 'Snacks', price: 4.50, cost: 3.00, stock: 60, minStock: 10, supplier: 'Mondelez' },
  { id: 5, name: 'Cerveza Pilsen 330ml', barcode: '7750182003476', category: 'Bebidas', price: 4.00, cost: 2.50, stock: 120, minStock: 30, supplier: 'Backus' },
  { id: 6, name: 'Pan Molde Bimbo', barcode: '7501000112345', category: 'Panadería', price: 6.50, cost: 4.00, stock: 40, minStock: 10, supplier: 'Bimbo' },
  { id: 7, name: 'Leche Gloria 1L', barcode: '7750670003057', category: 'Lácteos', price: 4.80, cost: 3.20, stock: 5, minStock: 15, supplier: 'Gloria' },
  { id: 8, name: 'Yogurt Gloria 1L', barcode: '7750670004123', category: 'Lácteos', price: 6.00, cost: 4.00, stock: 0, minStock: 10, supplier: 'Gloria' },
];

export const mockClients: Client[] = [
  { id: 1, name: 'Juan Pérez', dni: '12345678', phone: '+51987654321', email: 'juan@email.com', points: 450, debt: 0, birthday: '1990-05-15', createdAt: '2024-01-15', address: 'Av. Principal 123' },
  { id: 2, name: 'María García', dni: '87654321', phone: '+51987654322', email: 'maria@email.com', points: 320, debt: 50, birthday: '1985-12-20', createdAt: '2024-02-10', address: 'Jr. Comercio 456' },
  { id: 3, name: 'Carlos López', dni: '11223344', phone: '+51987654323', points: 180, debt: 0, birthday: '2025-10-05', createdAt: '2024-03-05', address: 'Calle Lima 789' },
  { id: 4, name: 'Ana Torres', dni: '44332211', phone: '+51987654324', points: 520, debt: 120, birthday: '1992-08-30', createdAt: '2024-01-20', address: 'Av. Los Olivos 321' },
];

export const mockSales: Sale[] = [
  {
    id: 1,
    ticketNumber: 'T-001',
    ticketId: '1',
    date: '2025-10-02T10:30:00',
    clientId: 1,
    clientName: 'Juan Pérez',
    items: [
      { productId: 1, productName: 'Inca Kola 500ml', quantity: 2, price: 3.50, subtotal: 7.00, pointsValue: 3 },
      { productId: 3, productName: 'Chips Lays 180g', quantity: 1, price: 5.00, subtotal: 5.00, pointsValue: 5 },
    ],
    subtotal: 12.00,
    discount: 0,
    total: 12.00,
    paymentMethod: 'Efectivo',
    cashier: 'Admin',
    pointsEarned: 12,
    pointsUsed: 0,
    status: 'completada',
  },
  {
    id: 2,
    ticketNumber: 'T-002',
    ticketId: '2',
    date: '2025-10-02T11:15:00',
    clientId: 2,
    clientName: 'María García',
    items: [
      { productId: 5, productName: 'Cerveza Pilsen 330ml', quantity: 6, price: 4.00, subtotal: 24.00, pointsValue: 4 },
    ],
    subtotal: 24.00,
    discount: 2.00,
    total: 22.00,
    paymentMethod: 'Yape',
    cashier: 'Admin',
    pointsEarned: 22,
    pointsUsed: 0,
    status: 'completada',
  },
];

export const mockPromotions: Promotion[] = [
  { id: 1, name: '2x1 en Bebidas', description: 'Lleva 2 bebidas y paga 1', type: '2x1', value: 50, startDate: '2025-10-01', endDate: '2025-10-31', active: true, applicableProducts: [1, 2, 5] },
  { id: 2, name: '20% OFF Snacks', description: '20% de descuento en todos los snacks', type: 'percentage', value: 20, startDate: '2025-10-01', endDate: '2025-10-15', active: true, applicableProducts: [3, 4] },
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
    status: 'open',
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
    status: 'closed',
    paymentBreakdown: {
      efectivo: 250.00,
      yape: 150.00,
      plin: 70.00,
      tarjeta: 50.00,
    },
  },
];

export const mockExpenses: Expense[] = [
  { id: 1, date: '2025-10-02T09:00:00', category: 'Servicios', description: 'Pago de luz', amount: 150.00, paymentMethod: 'Efectivo', cashRegisterId: 1 },
  { id: 2, date: '2025-10-02T10:30:00', category: 'Suministros', description: 'Compra de bolsas', amount: 30.00, paymentMethod: 'Efectivo', cashRegisterId: 1 },
  { id: 3, date: '2025-10-01T14:00:00', category: 'Mantenimiento', description: 'Reparación de refrigerador', amount: 200.00, paymentMethod: 'Yape', cashRegisterId: 2 },
];

export const mockDeliveryOrders: DeliveryOrder[] = [
  { id: 1, saleId: 2, clientId: 2, address: 'Jr. Comercio 456', phone: '+51987654322', status: 'in-transit', driver: 'Carlos Ramos', deliveryFee: 5.00, estimatedTime: '30 min' },
  { id: 2, saleId: 1, clientId: 1, address: 'Av. Principal 123', phone: '+51987654321', status: 'delivered', driver: 'Luis Mendoza', deliveryFee: 5.00 },
];

export const mockSettings: Settings = {
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
