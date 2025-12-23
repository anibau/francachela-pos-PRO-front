# Guía de Uso: MoneyInput - Inputs de Dinero Profesionales

## 📋 Descripción

`MoneyInput` es un componente React y un hook personalizado diseñado para manejar inputs de dinero de forma profesional en sistemas de POS/Caja, compatible con máximo 2 decimales y UX natural.

## 🎯 Características

✅ **Permite escribir decimales de forma natural**
- Acepta: `0.`, `0.50`, `12.30`, `.99`
- No requiere obligatoriamente escribir el primer dígito

✅ **Validación automática**
- Solo permite números y punto decimal
- Limita máximo a 2 decimales mientras escribes
- Rechaza caracteres especiales

✅ **Redondeo inteligente**
- Redondea automáticamente a 2 decimales en `onBlur`
- Maneja correctamente valores como `.5` → `0.50`
- Evita errores de precisión con `Math.round()`

✅ **UX Sin Interrupciones**
- El valor se mantiene como string mientras escribes
- Conversión a número solo al salir del campo
- No usa `parseFloat` en `onChange` que rompe la edición

✅ **Validación Visual**
- Muestra check verde cuando es válido
- Muestra alerta roja si hay error
- Soporta mensajes de error personalizados

## 📦 Instalación / Ubicación

Los archivos están ubicados en:
- **Hook**: `src/hooks/useMoneyInput.ts`
- **Componente**: `src/components/ui/money-input.tsx`
- **Utilidades**: Funciones auxiliares en el hook

Se exportan automáticamente desde `src/hooks/index.ts`

## 🚀 Uso Básico

### Con el Componente (Recomendado)

```tsx
import { MoneyInput } from '@/components/ui/money-input';
import { useState } from 'react';

export function ProductForm() {
  const [price, setPrice] = useState(0);
  const [cost, setCost] = useState(0);
  const [errors, setErrors] = useState({});

  return (
    <form>
      <MoneyInput
        id="price"
        label="Precio S/"
        value={price}
        onChange={(value) => setPrice(value)}
        placeholder="0.00"
        required
      />

      <MoneyInput
        id="cost"
        label="Costo S/"
        value={cost}
        onChange={(value) => setCost(value)}
        error={errors.cost}
      />

      <button type="submit">Guardar</button>
    </form>
  );
}
```

### Con el Hook Personalizado

```tsx
import { useMoneyInput } from '@/hooks/useMoneyInput';
import { Input } from '@/components/ui/input';

export function CustomMoneyField() {
  const money = useMoneyInput(12.50);

  const handleSave = () => {
    const finalValue = money.handleBlur(); // Redondea a 2 decimales
    console.log('Valor guardado:', finalValue);
  };

  return (
    <div>
      <Input
        type="text"
        inputMode="decimal"
        value={money.stringValue}
        onChange={money.handleChange}
        onBlur={handleSave}
      />
      <p>Valor actual: {money.getNumericValue()}</p>
    </div>
  );
}
```

## 📐 Props del Componente MoneyInput

```tsx
interface MoneyInputProps {
  id?: string;                    // ID del input
  label?: string;                 // Etiqueta del campo
  value: number;                  // Valor inicial (número)
  onChange: (value: number) => void;  // Callback cuando se valida (onBlur)
  onBlur?: () => void;           // Callback adicional en blur
  placeholder?: string;           // Placeholder (default: "0.00")
  disabled?: boolean;             // Desabilitar input
  required?: boolean;             // Campo requerido
  error?: string;                 // Mensaje de error personalizado
  className?: string;             // Classes de Tailwind adicionales
  showValidation?: boolean;       // Mostrar check/alerta (default: true)
}
```

## 🔄 Flujo de Funcionamiento

```
┌─────────────────────────────────────────────┐
│ Usuario tipea en el input                   │
│ (ej: "12.", "0.5", etc)                     │
└────────────────┬────────────────────────────┘
                 │
                 ▼
         ┌───────────────────┐
         │ onChange dispara  │
         │ handleChange()    │
         └────────┬──────────┘
                  │
                  ▼
        ┌─────────────────────────┐
        │ Valida caracteres:      │
        │ - Solo números y punto  │
        │ - Máximo 2 decimales    │
        │ - Mantiene como STRING  │ ◄── Clave: No convierte a número
        └────────┬────────────────┘
                 │
                 ▼
        ┌─────────────────────────┐
        │ Actualiza stringValue    │
        │ (el usuario ve sus      │
        │  cambios en tiempo real)│
        └─────────────────────────┘


┌─────────────────────────────────────────────┐
│ Usuario sale del input (blur)               │
│ o presiona Tab/Enter                        │
└────────────────┬────────────────────────────┘
                 │
                 ▼
         ┌───────────────────┐
         │ onBlur dispara    │
         │ handleBlur()      │
         └────────┬──────────┘
                  │
                  ▼
         ┌────────────────────────┐
         │ Convierte a número     │
         │ parseFloat(stringValue)│
         └────────┬───────────────┘
                  │
                  ▼
         ┌────────────────────────┐
         │ Redondea a 2 decimales │
         │ Math.round(num * 100)/100 ◄── Precisión garantizada
         └────────┬───────────────┘
                  │
                  ▼
         ┌────────────────────────┐
         │ Actualiza stringValue   │
         │ con formato .toFixed(2)│
         └────────┬───────────────┘
                  │
                  ▼
         ┌────────────────────────┐
         │ Dispara onChange()     │
         │ con el número final    │
         └─────────────────────────┘
```

## 💡 Ejemplos de Uso en Productos.tsx

### Reemplazo del Input Original

**Antes (Problemático):**
```tsx
<Input
  id="price"
  type="number"
  step="0.01"
  value={formData.precio || ''}
  onChange={(e) => {
    const value = e.target.value === '' ? 0 : parseFloat(e.target.value);
    setFormData({ ...formData, precio: value }); // ❌ Problemas con UX
  }}
/>
```

**Después (Profesional):**
```tsx
<MoneyInput
  id="price"
  label="Precio S/"
  value={formData.precio}
  onChange={(value) => {
    setFormData({ ...formData, precio: value });
    if (editingProduct) setHasChanges(true);
    validateField('precio', value);
  }}
  error={validationErrors.precio}
/>
```

## ✨ Casos de Uso

### ✅ Funciona Perfectamente

| Entrada del Usuario | Se Muestra | Cuando Blur | Resultado |
|---|---|---|---|
| `0` | `0` | `0` | ✓ `0.00` |
| `0.` | `0.` | `0.` | ✓ `0.00` |
| `0.5` | `0.5` | `0.5` | ✓ `0.50` |
| `0.50` | `0.50` | `0.50` | ✓ `0.50` |
| `12` | `12` | `12` | ✓ `12.00` |
| `12.3` | `12.3` | `12.3` | ✓ `12.30` |
| `12.30` | `12.30` | `12.30` | ✓ `12.30` |
| `12.345` | `12.34` | `12.34` | ✓ `12.34` (limita automáticamente) |
| `.99` | `.99` | `.99` | ✓ `0.99` |
| `abc` | Rechaza | - | ✓ Mantiene anterior |
| `12.5.6` | Rechaza | - | ✓ Mantiene anterior |
| `(vacío)` | `` | `` | ✓ `0.00` |

## 🔐 Características de Seguridad

### 1. Validación de Entrada
```tsx
// Solo acepta números y un punto decimal
const regex = /^[0-9]*\.?[0-9]*$/;
```

### 2. Límite de Decimales
```tsx
// Máximo 2 decimales
if (parts[1] && parts[1].length > 2) {
  return `${parts[0]}.${parts[1].slice(0, 2)}`;
}
```

### 3. Redondeo Preciso
```tsx
// Evita problemas de precisión floating point
const roundedValue = Math.round(numValue * 100) / 100;
```

### 4. Manejo de Errores
```tsx
// Maneja NaN y valores inválidos
if (isNaN(numValue)) {
  setStringValue('0.00');
  return 0;
}
```

## 📊 Integración en Formularios

```tsx
// En validación
const validateField = (field: string, value: number) => {
  if (field === 'precio') {
    const validation = validatePrice(value, 'El precio', false);
    if (!validation.isValid) {
      errors.precio = validation.message;
    }
  }
};

// En envío
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  const dataToSend = {
    ...formData,
    precio: formData.precio, // Ya es número con 2 decimales
    costo: formData.costo,   // Ya es número con 2 decimales
  };
  
  await updateProduct.mutateAsync(dataToSend);
};
```

## 🎨 Customización

### Ocultar Validación Visual

```tsx
<MoneyInput
  value={price}
  onChange={setPrice}
  showValidation={false}
/>
```

### Agregar Clases Personalizadas

```tsx
<MoneyInput
  value={price}
  onChange={setPrice}
  className="bg-blue-50 border-blue-300"
/>
```

### Sin Etiqueta

```tsx
<MoneyInput
  value={price}
  onChange={setPrice}
  // Sin prop 'label'
/>
```

## 🧪 Testing

```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { MoneyInput } from '@/components/ui/money-input';

test('permite escribir decimales naturales', () => {
  const handleChange = jest.fn();
  render(<MoneyInput value={0} onChange={handleChange} />);
  
  const input = screen.getByRole('textbox');
  
  // Usuario tipea "0.5"
  fireEvent.change(input, { target: { value: '0.5' } });
  fireEvent.blur(input);
  
  expect(handleChange).toHaveBeenCalledWith(0.50);
});
```

## ⚠️ Puntos Importantes

1. **El onChange se dispara en onBlur**, no en cada keystroke
2. **El valor es redondeado automáticamente** a 2 decimales
3. **No use `type="number"`** en inputs personalizados, usamos `text`
4. **inputMode="decimal"** permite teclado decimal en móviles
5. **La validación es estricta** pero amigable con el usuario

## 📝 Migración desde Inputs type="number"

**Búsqueda y Reemplazo:**
```
BUSCAR:  <Input id="price" type="number" step="0.01" ... />
REEMPLAZAR: <MoneyInput id="price" ... />
```

**Cambios en onChange:**
- ❌ Antes: `onChange={(e) => { const value = parseFloat(e.target.value); ... }}`
- ✅ Ahora: `onChange={(value) => { setFormData({ ...formData, precio: value }); }}`

## 🚀 Rendimiento

- ✅ Sin re-renders innecesarios
- ✅ Memoización en hooks internos
- ✅ Operaciones matemáticas eficientes
- ✅ Sin dependencias externas de librerías

## 📞 Soporte

Para problemas o mejoras, consultar:
- `src/hooks/useMoneyInput.ts` - Lógica del hook
- `src/components/ui/money-input.tsx` - Componente UI
- `src/pages/Productos.tsx` - Ejemplo de integración

---

**Versión:** 1.0
**Última actualización:** 2025-12-16
**Compatible con:** React 18+, TypeScript 5+
