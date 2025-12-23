# ⚡ GUÍA RÁPIDA - Refactorización POS

## 🎯 ¿Qué se cambió?

### 1️⃣ Descuento y Recargo usan MoneyInput (Profesional)
- **Antes:** `<Input type="number" />`
- **Ahora:** `<MoneyInput />`

### 2️⃣ Total redondea a .X0 automáticamente
- **Antes:** 4.56 soles
- **Ahora:** 4.60 soles

---

## 📍 Archivos Modificados

```
✏️ src/pages/POS.tsx
   ├─ Línea 6: Agregar import MoneyInput
   ├─ Línea 11: Agregar import roundMoney
   ├─ Línea 129-132: Lógica de redondeo
   └─ Línea 483-506: MoneyInputs descuento/recargo

✏️ src/contexts/POSContext.tsx
   ├─ Línea 5: Agregar import roundMoney
   └─ Línea 235-246: Redondeo en getTicketTotal()
```

---

## ✨ Nuevo Comportamiento

### Descuento
```
Usuario tipea: "5.5"
Se redondea a: "5.50"
Se aplica: -S/ 5.50
```

### Recargo
```
Usuario tipea: "0.75"
Se acepta como: "0.75"
Se aplica: +S/ 0.75
```

### Total
```
Subtotal: S/ 4.56
Se redondea a: S/ 4.60
Se muestra: S/ 4.60
```

---

## 🧪 Pruebas Rápidas

### Test 1: Escribir Descuento
1. Haz click en "Descuento S/"
2. Escribe: `5.5`
3. Presiona Tab
4. ✅ Debe mostrar: `5.50`

### Test 2: Escribir Recargo
1. Haz click en "Recargo S/"
2. Escribe: `0.75`
3. Presiona Tab
4. ✅ Debe mostrar: `0.75`

### Test 3: Redondeo de Total
1. Agrega productos que sumen: 4.56
2. ✅ Total debe mostrar: 4.60
3. En pago debe requerir: 4.60

---

## 🚀 Caso de Uso Completo

```
1. Cliente compra:
   - Cerveza 1: S/ 1.45
   - Cerveza 2: S/ 3.11
   - Subtotal: S/ 4.56

2. Sistema redondea:
   - Total: S/ 4.60 ✅

3. Usuario aplica descuento:
   - Descuento: S/ 0.10
   - Nuevo total: 4.50

4. Usuario paga:
   - Requiere: S/ 4.50
   - Recibe: S/ 5.00
   - Vuelto: S/ 0.50
```

---

## ⚙️ Configuración

| Parámetro | Valor | Descripción |
|-----------|-------|-------------|
| Redondeo | .X0 | Décimas (compatible moneda peruana) |
| Decimales | 2 | Máximo permitido |
| Validación | Automática | Rechaza caracteres inválidos |

---

## 🔑 Claves Importantes

1. **MoneyInput no usa `type="number"`**
   - Usa `inputMode="decimal"` para mejor UX

2. **Redondeo solo en .X0**
   - 4.56 → 4.60 (no a 4.00 ni 5.00)

3. **Aplicación automática**
   - onChange actualiza el estado inmediatamente
   - onBlur redondea y aplica

4. **Totalmente retrocompatible**
   - No rompe funcionalidad existente
   - Mejora sin cambios de API

---

## 🐛 Si Algo Falla

### El descuento no permite escribir
```
✓ Verifica: src/pages/POS.tsx línea 6
  import { MoneyInput } from '@/components/ui/money-input';
```

### El total no se redondea
```
✓ Verifica: src/contexts/POSContext.tsx línea 235-246
  const roundedTotal = Math.ceil(rawTotal * 10) / 10;
```

### Error "roundMoney is not defined"
```
✓ Verifica: src/contexts/POSContext.tsx línea 5
  import { roundMoney } from '@/utils/moneyUtils';
```

---

## 📚 Documentación Completa

- 📖 [MONEY_INPUT_GUIDE.md](MONEY_INPUT_GUIDE.md) - Guía profesional MoneyInput
- 📋 [POS_CAMBIOS_IMPLEMENTADOS.md](POS_CAMBIOS_IMPLEMENTADOS.md) - Cambios detallados
- 📊 [POS_REFACTOR_DOCS.md](POS_REFACTOR_DOCS.md) - Documentación técnica
- ❓ [FAQ_POS_REFACTORIZACION.md](FAQ_POS_REFACTORIZACION.md) - Preguntas frecuentes

---

## ⏱️ Tiempo de Adopción

| Acción | Tiempo |
|--------|--------|
| Entender los cambios | 5 min |
| Probar descuento | 1 min |
| Probar recargo | 1 min |
| Probar total redondeado | 2 min |
| **Total** | **~9 min** |

---

## ✅ Checklist de Validación

- [ ] MoneyInput importado en POS.tsx
- [ ] Redondeo lógica en POSContext.tsx
- [ ] Redondeo UI en POS.tsx
- [ ] Descuento permite escribir naturalmente
- [ ] Recargo permite escribir naturalmente
- [ ] Total se redondea a .X0
- [ ] Funciona con múltiples métodos de pago
- [ ] Funciona en móviles

---

**¿Preguntas?** Ver [FAQ_POS_REFACTORIZACION.md](FAQ_POS_REFACTORIZACION.md)  
**¿Más detalles?** Ver [POS_CAMBIOS_IMPLEMENTADOS.md](POS_CAMBIOS_IMPLEMENTADOS.md)

---

Versión: 1.0 | Fecha: 2025-12-16 | Estado: ✅ Activo
