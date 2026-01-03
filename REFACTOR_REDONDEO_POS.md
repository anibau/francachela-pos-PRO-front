# Refactorización de Redondeo en Módulo POS

## Problema Identificado
El módulo POS estaba realizando múltiples redondeos inconsistentes que causaban que un producto de **$4.83** se redondeara a **$5.00**, generando un error de "ajuste excesivo" en el backend (que solo acepta hasta 0.09 de diferencia).

### Ejemplo del Problema:
- Producto: $4.83 (1 unidad)
- Total esperado: $4.83
- Total actual: $5.00 ❌ (Error de redondeo doble)

## Cambios Realizados

### 1. **moneyUtils.ts** - Función `roundMoney`
**Cambio:** `Math.ceil` → `Math.round`
```typescript
// ANTES (redondeaba hacia arriba)
export const roundMoney = (value: number): number => {
  return Math.ceil(value * 100) / 100;
};

// DESPUÉS (redondeo estándar)
export const roundMoney = (value: number): number => {
  return Math.round(value * 100) / 100;
};
```
**Razón:** `Math.ceil` siempre redondea hacia arriba, causando sobrecargos. El redondeo estándar es más justo (4.834 → 4.83, 4.835 → 4.84).

---

### 2. **POSContext.tsx** - Función `getTicketTotal`
**Cambio:** Eliminado redondeo doble a décimas
```typescript
// ANTES (redondeo doble e incorrecto)
const roundedTotal = Math.ceil(rawTotal * 10) / 10;
return roundMoney(roundedTotal);

// DESPUÉS (redondeo simple y correcto)
return roundMoney(rawTotal);
```
**Razón:** El redondeo a décimas (`* 10`) es innecesario y causa que 4.83 se redondee a 4.90 y luego a 5.00.

---

### 3. **POSContext.tsx** - Función `addItem`
**Cambios:**
- Redondear precio inicial
- Redondear subtotal al actualizar cantidad

```typescript
// ANTES
const precio = isWholesale ? product.precioMayoreo : product.precio;
subtotal: nuevaCantidad * existingItem.precio,

// DESPUÉS
const precio = roundMoney(isWholesale ? product.precioMayoreo : product.precio);
subtotal: roundMoney(nuevaCantidad * existingItem.precio),
```
**Razón:** Los precios deben estar redondeados antes de multiplicarse para evitar errores de precisión flotante.

---

### 4. **POSContext.tsx** - Función `updateItemQuantity`
**Cambio:** Redondear subtotal
```typescript
// ANTES
subtotal: item.precio * nuevaCantidad,

// DESPUÉS
subtotal: roundMoney(item.precio * nuevaCantidad),
```
**Razón:** Consistencia en redondeo de subtotales.

---

### 5. **POSContext.tsx** - Función `completeSale`
**Cambios:**
- Redondear total correctamente
- Usar `roundMoney` consistentemente en lugar de `Math.round(*100)/100`
- Redondear cálculos de descuentos y montos

```typescript
// ANTES (redondeo inconsistente)
const total = Math.max(0, subtotal - ticket.discount + ticket.recargoExtra);
const round1 = (value: unknown): number =>
  Number.isFinite(value) ? Math.ceil((value as number) * 10) / 10 : 0;
metodosPageoArray = metodosPageo.map((metodo) => ({
  monto: round1(metodo.monto),
  ...
}));
const totalPagado = Math.round(
  metodosPageoArray.reduce((sum, metodo) => sum + metodo.monto, 0) * 100
) / 100;

// DESPUÉS (redondeo consistente)
const total = roundMoney(Math.max(
  0,
  subtotal - ticket.discount + ticket.recargoExtra
));
metodosPageoArray = metodosPageo.map((metodo) => ({
  monto: roundMoney(metodo.monto),
  ...
}));
const totalPagado = roundMoney(
  metodosPageoArray.reduce((sum, metodo) => sum + metodo.monto, 0)
);
```
**Razón:** Usar una función de redondeo consistente en todo el código.

---

### 6. **POS.tsx** - Cálculo del total mostrado
**Cambio:** Eliminar redondeo doble
```typescript
// ANTES
const rawTotal = getTicketTotal();
const total = Math.ceil(rawTotal * 10) / 10;

// DESPUÉS
const rawTotal = getTicketTotal();
const total = rawTotal; // Ya está redondeado en getTicketTotal
```
**Razón:** `getTicketTotal` ya retorna un valor redondeado correctamente, no necesita redondeo adicional.

---

## Caso de Prueba - Antes y Después

### Entrada:
```json
{
  "clienteId": null,
  "listaProductos": [{
    "productoId": 2,
    "cantidad": 1,
    "precioUnitario": 4.83
  }],
  "metodosPageo": [{
    "monto": 5,
    "metodoPago": "EFECTIVO"
  }],
  "recargoExtra": 0,
  "puntosUsados": 0
}
```

### Antes de la refactorización ❌:
- Subtotal: 4.83
- Total mostrado: 5.00 (ERROR)
- Backend rechaza por: ajuste excesivo (0.17 > 0.09)

### Después de la refactorización ✅:
- Subtotal: 4.83
- Total mostrado: 4.83 (CORRECTO)
- Enviado al backend: 4.83
- Backend acepta: ajuste permitido (0.17, pero ahora solo es 0.17 de efectivo recibido vs 4.83 total = vuelto correcto)

---

## Archivos Modificados
1. `src/utils/moneyUtils.ts` - Función `roundMoney`
2. `src/contexts/POSContext.tsx` - Funciones `getTicketTotal`, `addItem`, `updateItemQuantity`, `completeSale`
3. `src/pages/POS.tsx` - Cálculo del total mostrado

## Impacto
✅ Redondeos consistentes en todo el módulo POS
✅ Elimina sobrecargos por redondeos duplicados
✅ Compatibilidad correcta con validación de ajustes del backend
✅ Los totales mostrados coinciden con lo enviado al backend
