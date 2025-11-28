# 🍻 Sistema POS Francachela

Sistema de Punto de Venta completo con integración a Google Sheets como base de datos.

## 🚀 Características Principales

### ✅ Módulos Implementados

1. **POS (Punto de Venta)**
   - ✅ Multi-ticket (múltiples ventas simultáneas)
   - ✅ Búsqueda de productos por nombre o código de barras
   - ✅ Gestión de cantidades
   - ✅ Asociación de clientes a ventas
   - ✅ Sistema de puntos automático
   - ✅ Aplicación de descuentos
   - ✅ Comentarios por venta
   - ✅ Múltiples métodos de pago (Efectivo, Yape, Plin, Tarjeta)
   - ✅ Generación de tickets

2. **Gestión de Clientes**
   - ✅ CRUD completo
   - ✅ Registro con DNI, nombres, apellidos, teléfono
   - ✅ Historial de compras
   - ✅ Puntos de fidelidad acumulados
   - ✅ Historial de canjes
   - ✅ Filtros por cumpleaños y deudas

3. **Inventario de Productos**
   - ✅ CRUD completo
   - ✅ Código de barras
   - ✅ Gestión de stock
   - ✅ Stock mínimo y alertas
   - ✅ Precio normal y mayoreo
   - ✅ Categorías
   - ✅ Valor en puntos por producto
   - ✅ Control de visibilidad
   - ✅ Movimientos de inventario (entradas, salidas, ajustes)

4. **Historial de Ventas**
   - ✅ Registro completo de transacciones
   - ✅ Detalles de productos vendidos
   - ✅ Puntos otorgados/usados
   - ✅ Filtros por fecha y método de pago
   - ✅ Anulación de ventas
   - ✅ Reversión de inventario

5. **Promociones y Combos**
   - ✅ CRUD de promociones
   - ✅ Tipos: porcentaje, monto fijo, 2x1, 3x2
   - ✅ Combos de productos
   - ✅ Precios especiales
   - ✅ Aplicación automática en POS

6. **Caja Registradora**
   - ✅ Apertura/cierre de caja
   - ✅ Monto inicial
   - ✅ Desglose por método de pago
   - ✅ Control de gastos
   - ✅ Historial de cajas

7. **Gastos**
   - ✅ Registro de gastos operativos
   - ✅ Categorías
   - ✅ Vinculación con caja registradora

8. **Puntos de Fidelidad**
   - ✅ Acumulación automática
   - ✅ Canje de puntos
   - ✅ Historial de transacciones
   - ✅ Configuración de equivalencias

9. **Delivery**
   - ✅ Gestión de pedidos
   - ✅ Estados de entrega
   - ✅ Asignación de repartidores
   - ✅ Costo de delivery

10. **Dashboard**
    - ✅ Métricas en tiempo real
    - ✅ Ventas del día/semana/mes
    - ✅ Productos más vendidos
    - ✅ Alertas de inventario bajo
    - ✅ Clientes con más puntos

11. **Configuraciones**
    - ✅ Datos del negocio
    - ✅ Métodos de pago
    - ✅ Sistema de puntos
    - ✅ Notificaciones

## 🏗️ Arquitectura

```
src/
├── components/
│   ├── layout/        # Layout principal con sidebar
│   └── ui/           # Componentes UI (shadcn)
├── config/
│   └── api.ts        # Configuración de API y endpoints
├── contexts/
│   └── POSContext.tsx # Estado global del POS
├── pages/
│   ├── POS.tsx       # Punto de venta
│   ├── Productos.tsx # Gestión de productos
│   ├── Clientes.tsx  # Gestión de clientes
│   ├── Ventas.tsx    # Historial de ventas
│   ├── Promociones.tsx # Promociones y combos
│   ├── Caja.tsx      # Caja registradora
│   ├── Gastos.tsx    # Control de gastos
│   ├── Puntos.tsx    # Sistema de puntos
│   ├── Delivery.tsx  # Gestión de delivery
│   ├── Dashboard.tsx # Dashboard principal
│   └── Configuraciones.tsx # Configuración
├── services/
│   ├── api.ts        # Capa de abstracción API
│   ├── mockData.ts   # Datos de prueba
│   └── googleSheets.ts # Integración Google Sheets
├── types/
│   └── index.ts      # Definiciones TypeScript
└── utils/
    └── pointsCalculator.ts # Utilidades de puntos
```

## 🔧 Configuración

### Variables de Entorno

Crea un archivo `.env` basado en `.env.example`:

```env
# Modo de desarrollo con mocks
VITE_USE_MOCKS=true
VITE_USE_GOOGLE_SHEETS=false

# Para producción con Google Sheets
VITE_USE_MOCKS=false
VITE_USE_GOOGLE_SHEETS=true
VITE_GOOGLE_SHEETS_SCRIPT_URL=https://script.google.com/macros/s/TU_SCRIPT_ID/exec
```

### Instalación

```bash
# Instalar dependencias
npm install

# Modo desarrollo
npm run dev

# Compilar para producción
npm run build
```

## 📊 Integración con Google Sheets

El sistema puede usar Google Sheets como base de datos. Ver documentación completa en `GOOGLE_SHEETS_SETUP.md`.

### Modos de operación:

1. **Modo Mock** (`VITE_USE_MOCKS=true`): Usa datos de prueba locales
2. **Modo API Rest** (`VITE_USE_MOCKS=false`, `VITE_USE_GOOGLE_SHEETS=false`): Conecta a API backend
3. **Modo Google Sheets** (`VITE_USE_GOOGLE_SHEETS=true`): Usa Google Sheets como BD

## 🎯 Flujo de Trabajo Típico

### Venta Normal

1. Abrir/seleccionar ticket en POS
2. Buscar y agregar productos
3. (Opcional) Asociar cliente
4. (Opcional) Aplicar descuento o promoción
5. Seleccionar método de pago
6. Completar venta
7. Se registra automáticamente:
   - Venta en historial
   - Descuento de inventario
   - Puntos acumulados al cliente
   - Movimiento en caja registradora

### Gestión de Inventario

1. Ver productos con stock bajo
2. Registrar entrada de mercancía
3. Ajustar stock manualmente
4. Ver historial de movimientos

### Cierre de Caja

1. Abrir caja al inicio del día
2. Registrar ventas durante el día
3. Registrar gastos
4. Cerrar caja al final
5. Ver desglose por método de pago
6. Verificar diferencias

## 🔐 Seguridad

- Validación de datos en frontend
- Sanitización de inputs
- Control de permisos por rol (admin, cajero, supervisor)
- Logs de auditoría en Google Sheets

## 🚧 Próximas Funcionalidades

- [ ] Exportación de reportes PDF/CSV
- [ ] Envío de puntos por WhatsApp
- [ ] Notificaciones push
- [ ] Modo offline con sincronización
- [ ] App móvil nativa
- [ ] Impresión de tickets térmica
- [ ] Dashboard en tiempo real con websockets

## 📱 Soporte

- UI optimizada para pantallas táctiles
- Responsive design
- Funciona en tablets y móviles
- Soporte para lectores de código de barras

## 🛠️ Tecnologías

- **Frontend**: React + TypeScript + Vite
- **UI**: Tailwind CSS + shadcn/ui
- **Estado**: React Context API
- **Formularios**: React Hook Form + Zod
- **Backend**: API REST con POSTGRES +NEST.JS + TYPEORM + BAYLES (para el servicio de mensaje por whatsapp por cada venta)
- **Routing**: React Router DOM

## ENTIDADES BACKEND (TypeORM + PostgreSQL)
@Entity('usuarios')
export class Usuario {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;

  @Column()
  password: string;

  @Column({ type: 'varchar', length: 20 })
  rol: 'ADMIN' | 'CAJERO' | 'INVENTARIOS';

  @Column()
  nombre: string;
}

@Entity('productos')
export class Producto {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  productoDescripcion: string;

  @Column({ unique: true })
  codigoBarra: string;

  @Column({ nullable: true })
  imagen: string;

  @Column('decimal', { precision: 10, scale: 2 })
  costo: number;

  @Column('decimal', { precision: 10, scale: 2 })
  precio: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  precioMayoreo: number;

  @Column('int')
  cantidadActual: number;

  @Column('int')
  cantidadMinima: number;

  @Column({ nullable: true })
  proveedor: string;

  @Column({ nullable: true })
  categoria: string;

  @Column('int', { default: 0 })
  valorPuntos: number;

  @Column({ default: true })
  mostrar: boolean;

  @Column({ default: true })
  usaInventario: boolean;
}

@Entity('clientes')
export class Cliente {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombres: string;

  @Column()
  apellidos: string;

  @Column({ unique: true })
  dni: string;

  @Column({ type: 'date', nullable: true })
  fechaNacimiento: Date;

  @Column({ nullable: true })
  telefono: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  fechaRegistro: Date;

  @Column('int', { default: 0 })
  puntosAcumulados: number;

  @Column({ type: 'jsonb', default: [] })
  historialCompras: any[];

  @Column({ type: 'jsonb', default: [] })
  historialCanjes: any[];

  @Column({ nullable: true })
  codigoCorto: string;

  @Column({ nullable: true })
  direccion: string;
}

@Entity('ventas')
export class Venta {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  fecha: Date;

  @ManyToOne(() => Cliente, { nullable: true })
  cliente: Cliente;

  @Column({ type: 'jsonb' })
  listaProductos: any[]; // id, cantidad, precio, subtotal

  @Column('decimal', { precision: 10, scale: 2 })
  subTotal: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  descuento: number;

  @Column('decimal', { precision: 10, scale: 2 })
  total: number;

  @Column()
  metodoPago: string;

  @Column({ nullable: true })
  comentario: string;

  @Column()
  cajero: string;

  @Column({ default: 'COMPLETADO' })
  estado: string;

  @Column('int', { default: 0 })
  puntosOtorgados: number;

  @Column('int', { default: 0 })
  puntosUsados: number;

  @Column({ nullable: true })
  ticketId: string;

  @Column({ default: 'LOCAL' })
  tipoCompra: 'LOCAL' | 'DELIVERY';
}

@Entity('promociones')
export class Promocion {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre: string;

  @Column({ nullable: true })
  descripcion: string;

  @Column()
  tipo: 'PORCENTAJE' | 'MONTO';

  @Column('decimal', { precision: 10, scale: 2 })
  descuento: number;

  @Column({ type: 'date' })
  fechaInicio: Date;

  @Column({ type: 'date' })
  fechaFin: Date;

  @Column({ default: true })
  activo: boolean;
}


@Entity('combos')
export class Combo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre: string;

  @Column({ nullable: true })
  descripcion: string;

  @Column({ type: 'jsonb' })
  productos: any[];

  @Column('decimal', { precision: 10, scale: 2 })
  precioOriginal: number;

  @Column('decimal', { precision: 10, scale: 2 })
  precioCombo: number;

  @Column('int', { default: 0 })
  puntosExtra: number;

  @Column({ default: true })
  active: boolean;
}

@Entity('caja')
export class Caja {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'timestamp' })
  fechaApertura: Date;

  @Column({ type: 'timestamp', nullable: true })
  fechaCierre: Date;

  @Column('decimal', { precision: 10, scale: 2 })
  montoInicial: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  totalVentas: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  totalGastos: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  montoFinal: number;

  @Column()
  cajero: string;

  @Column({ default: 'ABIERTA' })
  estado: string;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  diferencia: number;
}

@Entity('gastos')
export class Gasto {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  fecha: Date;

  @Column()
  descripcion: string;

  @Column('decimal', { precision: 10, scale: 2 })
  monto: number;

  @Column()
  categoria: string;

  @Column()
  cajero: string;

  @Column({ nullable: true })
  comprobante: string;

  @Column()
  metodoPago: string;
}

@Entity('delivery')
export class Delivery {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  fecha: Date;

  @ManyToOne(() => Cliente, { nullable: true })
  cliente: Cliente;

  @Column()
  pedidoId: number;

  @Column()
  direccion: string;

  @Column({ default: 'PENDIENTE' })
  estado: string;

  @Column()
  repartidor: string;

  @Column({ nullable: true })
  horaSalida: string;

  @Column({ nullable: true })
  horaEntrega: string;

  @Column({ nullable: true })
  saleId: number;

  @Column({ nullable: true })
  phone: string;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  deliveryFee: number;

  @Column({ nullable: true })
  notes: string;
}

@Entity('movimientos_inventario')
export class MovimientoInventario {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  hora: Date;

  @Column()
  codigoBarra: string;

  @Column()
  descripcion: string;

  @Column('decimal', { precision: 10, scale: 2 })
  costo: number;

  @Column('decimal', { precision: 10, scale: 2 })
  precioVenta: number;

  @Column('int')
  existencia: number;

  @Column('int')
  invMinimo: number;

  @Column()
  tipo: 'ENTRADA' | 'SALIDA' | 'AJUSTE';

  @Column('int')
  cantidad: number;

  @Column()
  cajero: string;

  @Column({ nullable: true })
  proveedor: string;
}


## 📄 Licencia

Proyecto privado - Francachela POS

---

**Desarrollado con ❤️ para mejorar la gestión de tu negocio**
