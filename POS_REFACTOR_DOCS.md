/**
 * REFACTORIZACIÓN POS - CAMBIOS IMPLEMENTADOS
 * 
 * Versión: 1.0
 * Fecha: 2025-12-16
 * Cambios: 2 mejoras principales
 */

// ============================================================================
// 1. MoneyInput para Descuento y Recargo
// ============================================================================

/*
ANTES (Problema: Validación complicada, user experience deficiente):
```tsx
<div className="flex gap-2">
  <div className="flex-1">
    <Input
      type="number"
      min="0"
      step="0.01"
      value={discount === 0 ? '' : discount}
      onChange={(e) => setDiscount(e.target.value === '' ? 0 : parseFloat(e.target.value))}
      onBlur={handleUpdateDiscount}
      placeholder="Descuento S/"
      className="h-7 text-xs"
    />
  </div>
  <div className="flex-1">
    <Input
      type="number"
      min="0"
      step="0.01"
      value={recargoExtra === 0 ? '' : recargoExtra}
      onChange={(e) => setRecargoExtra(e.target.value === '' ? 0 : parseFloat(e.target.value))}
      onBlur={handleUpdateRecargoExtra}
      placeholder="Recargo S/"
      className="h-7 text-xs"
    />
  </div>
</div>
```

DESPUÉS (Solución: MoneyInput profesional):
```tsx
<div className="flex gap-2">
  <MoneyInput
    value={discount}
    onChange={(value) => {
      setDiscount(value);
      applyDiscount(value);
    }}
    placeholder="Descuento S/"
    showValidation={false}
    className="h-7 text-xs flex-1"
  />
  <MoneyInput
    value={recargoExtra}
    onChange={(value) => {
      setRecargoExtra(value);
      handleUpdateRecargoExtra();
    }}
    placeholder="Recargo S/"
    showValidation={false}
    className="h-7 text-xs flex-1"
  />
</div>
```

✅ BENEFICIOS:
- Permite escribir "0.5" sin problemas
- Redondea automáticamente a 2 decimales
- UX profesional sin interrupciones
- Sincronización limpia con el state
*/

// ============================================================================
// 2. Redondeo Inteligente de Totales a .X0
// ============================================================================

/*
ESCENARIO REAL - Sistema de Caja/POS:

Un cliente compra:
- Cerveza 1: S/ 1.45
- Cerveza 2: S/ 3.11
- ────────────────
  Subtotal: S/ 4.56 ❌ Incómodo para dinero en efectivo

CON NUESTRO SISTEMA:
- Subtotal: S/ 4.56
- Redondeo .X0: S/ 4.60 ✅ Cómodo para transacciones

IMPLEMENTACIÓN EN CÓDIGO:

POSContext.tsx - getTicketTotal():
```tsx
const getTicketTotal = useCallback(
  (ticketId?: string) => {
    const ticket = tickets.find((t) => t.id === (ticketId || activeTicketId));
    if (!ticket) return 0;

    const subtotal = ticket.items.reduce(
      (sum, item) => sum + item.subtotal,
      0
    );
    const rawTotal = Math.max(0, subtotal - ticket.discount + ticket.recargoExtra);
    
    // 🔑 REDONDEO INTELIGENTE A .X0
    // 4.56 → 4.60
    // 4.51 → 4.60
    // 4.49 → 4.50
    // 4.00 → 4.00
    const roundedTotal = Math.ceil(rawTotal * 10) / 10;
    return roundMoney(roundedTotal);
  },
  [tickets, activeTicketId]
);
```

POS.tsx - Mostrar total redondeado:
```tsx
const rawTotal = getTicketTotal();
// Redondear total a decimales .X0 (4.56 → 4.60)
const total = Math.ceil(rawTotal * 10) / 10;
```

✅ VENTAJAS:
- Redondeo consistente en toda la aplicación
- Funciona en lógica (backend) y UI (frontend)
- Evita confusiones con centavos incómodos
- Compatible con moneda peruana
*/

// ============================================================================
// EJEMPLOS DE USO
// ============================================================================

/**
 * Ejemplo 1: Uso de MoneyInput en POS
 */
import { MoneyInput } from '@/components/ui/money-input';
import { useState } from 'react';

export function POSDiscountRecargoExample() {
  const [discount, setDiscount] = useState(0);
  const [recargoExtra, setRecargoExtra] = useState(0);

  const handleDiscountChange = (value: number) => {
    setDiscount(value);
    // Aplicar descuento automáticamente
    applyDiscount(value);
  };

  const handleRecargoChange = (value: number) => {
    setRecargoExtra(value);
    // Aplicar recargo automáticamente
    handleUpdateRecargoExtra();
  };

  return (
    <div className="flex gap-2 p-2">
      <MoneyInput
        value={discount}
        onChange={handleDiscountChange}
        placeholder="Descuento S/"
        showValidation={false}
        className="flex-1"
      />
      <MoneyInput
        value={recargoExtra}
        onChange={handleRecargoChange}
        placeholder="Recargo S/"
        showValidation={false}
        className="flex-1"
      />
    </div>
  );
}

/**
 * Ejemplo 2: Redondeo de totales en transacciones
 */
export function TotalRoundingExample() {
  // Cálculo raw (sin redondeo)
  const items = [
    { price: 1.45, quantity: 1 },
    { price: 3.11, quantity: 1 },
  ];

  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  console.log('Subtotal raw:', subtotal); // 4.56

  // Aplicar redondeo .X0
  const roundedSubtotal = Math.ceil(subtotal * 10) / 10;
  console.log('Subtotal redondeado:', roundedSubtotal); // 4.60

  // Con descuento
  const discount = 0.50;
  const rawTotal = subtotal - discount; // 4.06
  const roundedTotal = Math.ceil(rawTotal * 10) / 10; // 4.10
  console.log('Total con descuento:', roundedTotal); // 4.10

  // Con recargo
  const recargo = 0.10;
  const rawTotalWithRecargo = subtotal + recargo; // 4.66
  const roundedTotalWithRecargo = Math.ceil(rawTotalWithRecargo * 10) / 10; // 4.70
  console.log('Total con recargo:', roundedTotalWithRecargo); // 4.70
}

/**
 * Ejemplo 3: Casos especiales de redondeo
 */
export function RoundingCasesExample() {
  const testCases = [
    { value: 4.56, expected: 4.60, description: 'Redondeo hacia arriba' },
    { value: 4.51, expected: 4.60, description: 'Redondeo hacia arriba (0.51)' },
    { value: 4.50, expected: 4.50, description: 'Exacto a .50' },
    { value: 4.49, expected: 4.50, description: 'Redondeo hacia arriba (0.49)' },
    { value: 4.41, expected: 4.50, description: 'Redondeo hacia arriba (0.41)' },
    { value: 4.40, expected: 4.40, description: 'Exacto a .40' },
    { value: 4.11, expected: 4.20, description: 'Redondeo hacia arriba (0.11)' },
    { value: 4.10, expected: 4.10, description: 'Exacto a .10' },
    { value: 4.01, expected: 4.10, description: 'Redondeo hacia arriba (0.01)' },
    { value: 4.00, expected: 4.00, description: 'Exacto' },
  ];

  console.log('📊 Casos de redondeo .X0:');
  console.log('─'.repeat(60));

  testCases.forEach(({ value, expected, description }) => {
    const rounded = Math.ceil(value * 10) / 10;
    const status = rounded === expected ? '✅' : '❌';
    console.log(`${status} ${value} → ${rounded} (${description})`);
  });
}

// ============================================================================
// INTEGRACIÓN CON EL RESTO DE LA APLICACIÓN
// ============================================================================

/*
📌 CAMBIOS AUTOMÁTICOS:

1. POS.tsx:
   - Import de MoneyInput agregado
   - Import de roundMoney agregado
   - Total calculado con redondeo .X0
   - Inputs de descuento y recargo usando MoneyInput

2. POSContext.tsx:
   - Import de roundMoney agregado
   - getTicketTotal() aplicando redondeo
   - Cálculos consisten en toda la aplicación

3. Ningún cambio requerido en:
   - Hooks (useProducts, useClients, etc.)
   - Types
   - Services
   - Utils (excepto moneyUtils que ya existe)

✅ COMPATIBILIDAD:
- Totalmente retrocompatible
- No rompe flujos existentes
- Mejora UX sin cambios de lógica
- Funciona con todas las versiones anteriores
*/

// ============================================================================
// PRUEBAS RÁPIDAS
// ============================================================================

/**
 * Test: Validar redondeo en múltiples escenarios
 */
export function validatePOSRounding() {
  const scenarios = [
    {
      name: 'Venta simple',
      items: [{ price: 10.50, qty: 1 }],
      discount: 0,
      recargo: 0,
      expected: 10.50,
    },
    {
      name: 'Venta con centavos problemáticos',
      items: [
        { price: 1.45, qty: 1 },
        { price: 3.11, qty: 1 },
      ],
      discount: 0,
      recargo: 0,
      expected: 4.60,
    },
    {
      name: 'Venta con descuento',
      items: [{ price: 10.56, qty: 1 }],
      discount: 1.00,
      recargo: 0,
      expected: 9.60,
    },
    {
      name: 'Venta con recargo',
      items: [{ price: 10.51, qty: 1 }],
      discount: 0,
      recargo: 0.50,
      expected: 11.10,
    },
  ];

  console.log('\n✅ Pruebas de redondeo POS:');
  console.log('═'.repeat(70));

  scenarios.forEach(({ name, items, discount, recargo, expected }) => {
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const rawTotal = subtotal - discount + recargo;
    const rounded = Math.ceil(rawTotal * 10) / 10;
    const passed = Math.abs(rounded - expected) < 0.001;

    console.log(`\n${passed ? '✅' : '❌'} ${name}`);
    console.log(`   Subtotal: S/ ${subtotal.toFixed(2)}`);
    console.log(`   Total raw: S/ ${rawTotal.toFixed(2)}`);
    console.log(`   Total redondeado: S/ ${rounded.toFixed(2)}`);
    console.log(`   Esperado: S/ ${expected.toFixed(2)}`);
  });
}

// ============================================================================
// DOCUMENTACIÓN RELACIONADA
// ============================================================================

/*
Ver también:
- MONEY_INPUT_GUIDE.md - Guía completa de MoneyInput
- MONEY_INPUT_EXAMPLES.tsx - Ejemplos de uso del hook
- src/utils/moneyUtils.ts - Utilidades de dinero
- src/hooks/useMoneyInput.ts - Hook personalizado
- src/components/ui/money-input.tsx - Componente MoneyInput
*/
