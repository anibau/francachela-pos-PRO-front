# 🚀 Francachela POS - Frontend

Sistema de punto de venta moderno y eficiente para la gestión de inventario, ventas y clientes. **Completamente refactorizado** para integración con backend local.

## ✅ Estado Actual: **REFACTORIZACIÓN COMPLETADA**

- ✅ **Eliminación completa de Google Sheets**
- ✅ **7 servicios especializados implementados**
- ✅ **Hooks de TanStack Query optimizados**
- ✅ **Cliente HTTP robusto con JWT**
- ✅ **Mock data funcional alineado con backend**
- ✅ **Preparado para integración con NestJS + PostgreSQL**

## 🚀 Características

- **Gestión de Productos**: CRUD completo con categorías y control de stock
- **Gestión de Clientes**: Sistema de puntos y fidelización
- **Punto de Venta**: Interface intuitiva con múltiples tickets
- **Control de Caja**: Apertura, cierre y seguimiento de efectivo
- **Gastos**: Registro y categorización de gastos operativos
- **Inventario**: Movimientos de entrada, salida y ajustes
- **Promociones**: Sistema de descuentos y ofertas
- **Reportes**: Estadísticas y análisis de ventas
- **Configuraciones**: Personalización del sistema

## 🛠️ Tecnologías

- **React 18** con TypeScript
- **Vite** para desarrollo rápido
- **Tailwind CSS** para estilos
- **Shadcn/ui** para componentes
- **TanStack Query** para manejo de estado del servidor
- **React Hook Form** para formularios
- **Lucide React** para iconos
- **Axios** para cliente HTTP

## 📦 Instalación Rápida

```bash
# Clonar el repositorio
git clone https://github.com/anibau/francachela-pos-PRO-front.git
cd francachela-pos-PRO-front

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env

# Iniciar servidor de desarrollo
npm run dev
```

## 🔧 Configuración

### Variables de Entorno

```env
# Backend Configuration
VITE_API_BASE_URL=http://localhost:3000
VITE_USE_BACKEND=false  # true para backend real, false para mocks

# Development Settings
VITE_ENABLE_LOGGING=true
VITE_MOCK_DELAY=500

# JWT Configuration
VITE_JWT_SECRET=francachela_pos_secret_key
VITE_JWT_EXPIRES_IN=24h
```

### Modos de Desarrollo

#### 🧪 **Desarrollo con Mocks** (Recomendado)
```env
VITE_USE_BACKEND=false
```
- ✅ Funciona sin backend
- ✅ Datos realistas para desarrollo
- ✅ Latencia simulada (500ms)

#### 🔗 **Integración con Backend**
```env
VITE_USE_BACKEND=true
VITE_API_BASE_URL=http://localhost:3000
```
- ✅ Se conecta al backend NestJS
- ✅ JWT automático
- ✅ Endpoints mapeados según CONSTANTS-ENDPOINTS.md

## 🏗️ Arquitectura Refactorizada

```
Frontend Components
        ↓
React Hooks (useProducts, useClients, etc.)
        ↓
TanStack Query (Caching, Invalidation, Mutations)
        ↓
API Proxy Layer (Compatibilidad retroactiva)
        ↓
Servicios Especializados (7 servicios)
        ↓
HTTP Client (JWT, Retries, Error Handling)
        ↓
Backend/Mocks (Configurable)
```

## 📁 Estructura del Proyecto

```
src/
├── components/          # Componentes reutilizables
├── pages/              # Páginas principales
├── contexts/           # Contextos de React
├── hooks/              # Hooks de TanStack Query
├── services/           # Servicios especializados
│   ├── productsService.ts
│   ├── clientsService.ts
│   ├── salesService.ts
│   ├── cashRegisterService.ts
│   ├── expensesService.ts
│   ├── inventoryService.ts
│   ├── promotionsService.ts
│   ├── authService.ts
│   ├── httpClient.ts
│   └── api.ts          # API Proxy
├── types/              # Definiciones de TypeScript
├── config/             # Configuraciones
├── utils/              # Utilidades y helpers
└── lib/                # Configuraciones de librerías
```

## 🎯 Uso Rápido

### 1. **Desarrollo con Mocks**
```bash
npm run dev
# Login: admin@francachela.com / admin123
```

### 2. **Integración con Backend**
```bash
# Asegurar que el backend esté ejecutándose
# Cambiar VITE_USE_BACKEND=true en .env
npm run dev
```

### 3. **Uso en Componentes**
```typescript
import { useProducts, useCreateProduct } from '@/hooks';

function ProductsPage() {
  const { data: products, isLoading } = useProducts();
  const createProduct = useCreateProduct();

  // Uso directo con caching automático
  if (isLoading) return <div>Cargando...</div>;
  
  return (
    <div>
      {products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
```

## 🧪 Usuarios Mock para Testing

```typescript
// Credenciales disponibles
admin@francachela.com / admin123        // ADMIN
supervisor@francachela.com / super123   // ADMIN  
cajero@francachela.com / caja123        // CAJERO
inventario@francachela.com / inv123     // INVENTARIOS
```

## ⚡ Características Avanzadas

### **Optimistic Updates**
- Updates inmediatos en UI
- Rollback automático en errores
- Mejor UX sin esperas

### **Smart Search**
- Detecta automáticamente DNI vs código vs nombre
- Validaciones incorporadas
- Búsqueda inteligente

### **Caching Inteligente**
- Stale time optimizado por tipo de dato
- Invalidación granular
- Query keys jerárquicos

### **Error Handling Robusto**
- Reintentos con backoff exponencial
- Manejo automático de 401
- Timeouts configurables

## 📊 Estadísticas del Proyecto

- **~4,100 líneas** de código refactorizado
- **18 archivos** creados/modificados
- **7 servicios** especializados
- **2 hooks principales** + utilidades
- **200+ tipos** TypeScript
- **50+ registros** mock realistas

## 📚 Documentación

- **[INTEGRATION-GUIDE.md](./INTEGRATION-GUIDE.md)**: Guía completa de integración
- **[CONSTANTS-ENDPOINTS.md](./CONSTANTS-ENDPOINTS.md)**: Documentación de endpoints
- **src/types/api.ts**: Tipos TypeScript completos
- **src/services/**: Servicios documentados

## 🤝 Contribución

1. Fork el proyecto
2. Crear una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

## 🆘 Troubleshooting

### Error: "Network Error"
```bash
# Verificar configuración
echo $VITE_API_BASE_URL
# Verificar backend
curl http://localhost:3000/health
```

### Error: "Token expired"
```bash
# Limpiar localStorage
localStorage.clear()
# O usar logout en la app
```

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

---

**🎉 ¡Sistema completamente refactorizado y listo para integración con backend!**
