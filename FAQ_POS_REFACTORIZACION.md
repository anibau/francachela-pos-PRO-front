# ❓ FAQ - Refactorización POS y MoneyInput

## 🤔 Preguntas Frecuentes

### P1: ¿Por qué el redondeo es .X0 y no .XX?
**R:** En Perú, es común trabajar con dinero de la siguiente forma:
- Billetes: 10, 20, 50, 100 soles
- Monedas: 5, 2, 1 sol (y antes 50, 20, 10 céntimos)

Un redondeo a `.X0` (décimas) es más natural para transacciones en efectivo.
Además, evita confusiones con centavos incómodos como .56, .67, etc.

**Matemática:**
```
4.56 soles → 4.60 soles (2 monedas de 5 centavos, o 1 moneda de 10 céntimos)
4.01 soles → 4.10 soles (1 moneda de 10 céntimos)
```

---

### P2: ¿Qué pasa si el usuario ingresa un número muy grande?
**R:** MoneyInput valida automáticamente:
- ✅ "999.99" - Aceptado, redondeado a "999.90"
- ✅ "9999.99" - Aceptado, redondeado a "10000.00"
- ❌ "abc123" - Rechazado, mantiene valor anterior

---

### P3: ¿El redondeo se aplica al generar la factura?
**R:** Sí, en múltiples niveles:

1. **En UI:** El usuario ve el total redondeado
2. **En lógica (Context):** `getTicketTotal()` retorna redondeado
3. **En base de datos:** Se guarda el valor redondeado
4. **En factura:** Se imprime/exporta el valor redondeado

**Flujo:**
```
Entrada → Cálculo → Redondeo → UI → Backend → DB → Factura
```

---

### P4: ¿Funciona con descuentos porcentuales?
**R:** No directamente, pero puedes adaptarlo:

```typescript
// Calcular descuento como porcentaje
const descuentoPorcentaje = 10; // 10%
const montoDescuentoCalculado = (subtotal * descuentoPorcentaje) / 100;

// Luego ingresarlo en MoneyInput
<MoneyInput
  value={montoDescuentoCalculado}
  onChange={(value) => {
    setDiscount(value);
    applyDiscount(value);
  }}
/>
```

---

### P5: ¿Qué sucede con múltiples métodos de pago?
**R:** El redondeo se aplica antes de dividir:

```typescript
// Total: S/ 4.60 (redondeado)

// División de pago:
// Efectivo: S/ 2.30
// Tarjeta: S/ 2.30
// Total: S/ 4.60 ✓
```

No hay diferencias porque el redondeo se aplica al total completo.

---

### P6: ¿Puedo deshabilitar el redondeo?
**R:** Sí, pero no es recomendado. Si lo necesitas:

```typescript
// En POS.tsx
// const total = Math.ceil(rawTotal * 10) / 10; // ← Comentar esta línea
const total = rawTotal; // Usar valor sin redondeo

// Pero entonces el sistema manejará centavos incómodos
// Ejemplo: S/ 4.56, S/ 7.89, etc.
```

---

### P7: ¿El MoneyInput funciona en móviles?
**R:** Sí, optimizado para móviles:

```typescript
<MoneyInput
  // ...
  // Automáticamente:
  // - Teclado decimal en iOS y Android
  // - Validación táctil
  // - Tamaño adaptable
/>
```

---

## 🐛 Troubleshooting

### Problema 1: "El input de descuento no permite escribir"

**Síntoma:** El usuario intenta escribir en el campo de descuento pero el input rechaza caracteres.

**Causa Probable:** MoneyInput es más estricto que Input normal.

**Solución:**
```typescript
// Verificar que MoneyInput esté importado correctamente
import { MoneyInput } from '@/components/ui/money-input'; ✓

// Verificar que onChange esté configurado
onChange={(value) => setDiscount(value)} ✓

// Verificar que el valor sea un número
value={discount} // discount debe ser number, no string ✓
```

---

### Problema 2: "El total no se redondea correctamente"

**Síntoma:** Total muestra S/ 4.56 en lugar de S/ 4.60

**Causa Probable:** POSContext no está usando el redondeo.

**Solución:**
```typescript
// En POSContext.tsx, verificar getTicketTotal():

const getTicketTotal = useCallback(
  (ticketId?: string) => {
    // ... código ...
    const rawTotal = Math.max(0, subtotal - ticket.discount + ticket.recargoExtra);
    
    // ✓ Debe tener esta línea:
    const roundedTotal = Math.ceil(rawTotal * 10) / 10;
    return roundMoney(roundedTotal);
  },
  [tickets, activeTicketId]
);
```

---

### Problema 3: "El descuento/recargo no se aplica inmediatamente"

**Síntoma:** Cambios en descuento/recargo se aplican con retraso.

**Causa Probable:** Falta sincronización entre cambio de valor y aplicación.

**Solución:**
```typescript
// MoneyInput debe llamar tanto setDiscount como applyDiscount
<MoneyInput
  value={discount}
  onChange={(value) => {
    setDiscount(value);        // ✓ Actualizar state
    applyDiscount(value);      // ✓ Aplicar al ticket
  }}
/>
```

---

### Problema 4: "Error: roundMoney is not defined"

**Síntoma:** Error en consola: "Cannot find 'roundMoney'"

**Causa Probable:** Falta import en POSContext.tsx

**Solución:**
```typescript
// Agregar al inicio de POSContext.tsx:
import { roundMoney } from '@/utils/moneyUtils'; ✓
```

---

### Problema 5: "El redondeo produce diferencias en auditoría"

**Síntoma:** Reportes muestran diferencias entre cálculos y registros.

**Causa Probable:** Redondeo no consistente en todas partes.

**Solución:**

1. **Verificar que todas las vistas usan getTicketTotal():**
   ```typescript
   // ✓ Correcto
   const total = getTicketTotal();
   
   // ✗ Incorrecto (cálculo manual)
   const total = subtotal - discount + recargo;
   ```

2. **Auditoría de redondeo:**
   ```typescript
   console.log('Raw total:', rawTotal);
   console.log('Rounded total:', roundedTotal);
   console.log('Diferencia:', Math.abs(roundedTotal - rawTotal));
   ```

---

## 💡 Tips Profesionales

### Tip 1: Validación de Rango
```typescript
// Evitar descuentos mayores al subtotal
const maxDiscount = subtotal * 0.5; // Máximo 50%

<MoneyInput
  value={discount}
  onChange={(value) => {
    if (value <= maxDiscount) {
      setDiscount(value);
    } else {
      toast.error(`Descuento máximo: S/ ${maxDiscount.toFixed(2)}`);
    }
  }}
/>
```

### Tip 2: Visualización de Diferencia
```typescript
// Mostrar cuánto dinero se redondea
const redondeoAplicado = total - rawTotal;

<p>Redondeo aplicado: +S/ {redondeoAplicado.toFixed(2)}</p>
```

### Tip 3: Historial de Cambios
```typescript
const [historialCambios, setHistorialCambios] = useState([]);

const registrarCambio = (tipo, anterior, nuevo) => {
  setHistorialCambios(prev => [...prev, {
    tipo,
    anterior,
    nuevo,
    timestamp: new Date()
  }]);
};

// Usar en onChange:
onChange={(value) => {
  registrarCambio('descuento', discount, value);
  setDiscount(value);
}}
```

### Tip 4: Validación de Coherencia
```typescript
// Verificar que descuento no sea negativo
if (discount < 0) {
  console.warn('Descuento negativo detectado');
  setDiscount(0);
}

// Verificar que no hay loops infinitos
if (total < 0) {
  console.error('Total negativo, verificar lógica');
}
```

---

## 🔧 Cómo Personalizar Redondeo

### Cambiar estrategia de redondeo

**Opción 1: Redondeo a centavos (.XX)**
```typescript
// Cambiar en POSContext.tsx:
// const roundedTotal = Math.ceil(rawTotal * 10) / 10; // Actual
const roundedTotal = Math.round(rawTotal * 100) / 100; // Centavos
```

**Opción 2: Sin redondeo**
```typescript
const roundedTotal = rawTotal; // Valor exacto
```

**Opción 3: Redondeo a moneda más cercana**
```typescript
// Redondear a 50 céntimos
const roundedTotal = Math.round(rawTotal * 2) / 2; // 4.60 o 4.50
```

---

## 📊 Matriz de Compatibilidad

| Funcionalidad | Estado | Notas |
|---|---|---|
| MoneyInput en POS | ✅ | Descuento y Recargo |
| Redondeo .X0 | ✅ | En POS.tsx y POSContext.tsx |
| Múltiples métodos pago | ✅ | Compatible con redondeo |
| Exportar a Excel | ✅ | Usa total redondeado |
| Calcular vuelto | ✅ | Basado en total redondeado |
| Puntos | ✅ | Independiente del redondeo |
| Factura impresa | ✅ | Muestra total redondeado |

---

## 📞 Cuando Contactar Soporte

- ❌ "El redondeo da valores negativos"
- ❌ "MoneyInput no aparece en pantalla"
- ❌ "Los descuentos no se guardan en la BD"
- ❌ "El total fluctúa al cambiar valores"

**Documentación relacionada:**
1. [MONEY_INPUT_GUIDE.md](MONEY_INPUT_GUIDE.md)
2. [POS_REFACTOR_DOCS.md](POS_REFACTOR_DOCS.md)
3. [POS_CAMBIOS_IMPLEMENTADOS.md](POS_CAMBIOS_IMPLEMENTADOS.md)

---

**Última actualización:** 2025-12-16  
**Versión:** 1.0  
**Autor:** Refactorización Profesional POS
