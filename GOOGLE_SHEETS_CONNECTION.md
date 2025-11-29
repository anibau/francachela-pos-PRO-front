# 📊 Guía Paso a Paso: Conectar POS con Google Sheets

Esta guía te ayudará a conectar tu sistema POS con Google Sheets para almacenar y gestionar datos en tiempo real.

---

## 📋 Requisitos Previos

- Una cuenta de Google
- Acceso a Google Sheets
- Acceso a Google Apps Script

---

## 🚀 Paso 1: Crear la Hoja de Cálculo

1. Ve a [Google Sheets](https://sheets.google.com)
2. Crea una nueva hoja de cálculo llamada `POS_Francachela`
3. Crea las siguientes pestañas (hojas):

### Pestaña: **Usuarios** ⚠️ IMPORTANTE
Crea los siguientes encabezados en la primera fila:

```
ID | USERNAME | PASSWORD | ROL | NOMBRE
```

**Roles disponibles:** `administrador`, `supervisor`, `cajero`

**Datos de ejemplo:**
```
1 | admin | admin123 | administrador | Administrador Sistema
2 | supervisor1 | super123 | supervisor | María García
3 | cajero1 | caja123 | cajero | Juan Pérez
```

⚠️ **SEGURIDAD:** Usa contraseñas seguras y restringe el acceso a tu Google Sheet.

### Pestaña: **Ventas**
Crea los siguientes encabezados en la primera fila:

⚠️ **IMPORTANTE**: Los nombres de columnas NO deben tener espacios al final. Usa exactamente estos nombres:

```
ID | FECHA | CLIENTE_ID | LISTA_PRODUCTOS | SUB_TOTAL | DESCUENTO | TOTAL | METODO_PAGO | COMENTARIO | CAJERO | ESTADO | PUNTOS_OTORGADOS | PUNTOS_USADOS | TICKET_ID
```

**ESTADOS permitidos:** `completada`, `anulada` (en minúsculas)

**Datos de ejemplo:**
```
1 | 2025-10-02T10:30:00 | 1 | [{"productId":1,"productName":"Inca Kola 500ml","quantity":2,"price":3.50,"subtotal":7.00}] | 12.00 | 0 | 12.00 | Efectivo | | Admin | completada | 12 | 0 | T-001
2 | 2025-10-02T11:15:00 | 2 | [{"productId":5,"productName":"Cerveza Pilsen 330ml","quantity":6,"price":4.00,"subtotal":24.00}] | 24.00 | 2.00 | 22.00 | Yape | | Admin | completada | 22 | 0 | T-002
3 | 2025-10-02T14:20:00 | 3 | [{"productId":3,"productName":"Chips Lays 180g","quantity":3,"price":5.00,"subtotal":15.00}] | 15.00 | 0 | 15.00 | Plin | | Cajero1 | completada | 15 | 0 | T-003
4 | 2025-10-02T16:45:00 | | [{"productId":2,"productName":"Coca Cola 500ml","quantity":1,"price":3.50,"subtotal":3.50}] | 3.50 | 0 | 3.50 | Tarjeta | Sin cliente | Admin | completada | 3 | 0 | T-004
5 | 2025-10-02T18:00:00 | 1 | [{"productId":1,"productName":"Inca Kola 500ml","quantity":1,"price":3.50,"subtotal":3.50}] | 3.50 | 0 | 3.50 | Efectivo | | Admin | anulada | 0 | 0 | T-005
```

### Pestaña: **Productos**
```
ID | PRODUCTO_DESCRIPCION | CODIGO_BARRA | IMAGEN | COSTO | PRECIO | PRECIO_MAYOREO | CANTIDAD_ACTUAL | CANTIDAD_MINIMA | PROVEEDOR | CATEGORIA | VALOR_PUNTOS | MOSTRAR | USA_INVENTARIO
```

⚠️ **IMPORTANTE**: 
- `MOSTRAR` y `USA_INVENTARIO` deben ser `true` o `false` (o `SI`/`NO`)
- Todos los precios y cantidades deben ser números
- `CATEGORIA` debe ser uno de: Bebidas, Snacks, Lácteos, Abarrotes, Limpieza, Higiene Personal, Confitería, Panadería, Congelados, Otros
- `PROVEEDOR` debe ser uno de: Alicorp, Gloria, Nestlé, PepsiCo, Backus, Coca-Cola, San Fernando, Laive, Arcor, Mondelez, Otro

**Datos de ejemplo:**
```
1 | Inca Kola 500ml | 7750885005609 | | 2.00 | 3.50 | 3.00 | 150 | 20 | Coca-Cola | Bebidas | 3 | true | true
2 | Coca Cola 500ml | 7750885005616 | | 2.00 | 3.50 | 3.00 | 200 | 20 | Coca-Cola | Bebidas | 3 | true | true
3 | Chips Lays 180g | 7750670000536 | | 3.50 | 5.00 | 4.50 | 80 | 15 | PepsiCo | Snacks | 5 | true | true
4 | Galletas Oreo | 7622210100672 | | 3.00 | 4.50 | 4.00 | 60 | 10 | Mondelez | Snacks | 4 | true | true
5 | Cerveza Pilsen 330ml | 7750182003476 | | 2.50 | 4.00 | 3.50 | 120 | 30 | Backus | Bebidas | 4 | true | true
```

### Pestaña: **Clientes**
```
ID | NOMBRES | APELLIDOS | DNI | FECHA_NACIMIENTO | TELEFONO | FECHA_REGISTRO | PUNTOS_ACUMULADOS | HISTORIAL_COMPRAS | HISTORIAL_CANJES
```

⚠️ **IMPORTANTE**: 
- Usa `NOMBRES` y `APELLIDOS` como campos separados (NO usar solo `NOMBRE`)
- `TELEFONO` debe incluir el código de país: `+51987654321` o sin el + (`51987654321`)
- `DNI` debe ser un número de 8 dígitos
- `PUNTOS_ACUMULADOS` es opcional al crear un cliente y puede iniciar en 0

**Datos de ejemplo:**
```
1 | Juan | Pérez | 12345678 | 1990-05-15 | 51987654321 | 2025-01-01 | 450 | [] | []
2 | María | García | 87654321 | 1985-12-20 | 51987654322 | 2025-01-01 | 320 | [] | []
3 | Carlos | López | 11223344 | 2000-10-05 | 51987654323 | 2025-01-01 | 180 | [] | []
4 | Ana | Torres | 44332211 | 1992-08-30 | 51987654324 | 2025-01-01 | 520 | [] | []
5 | Luis | Ramírez | 55667788 | 1988-03-10 | 51987654325 | 2025-01-02 | 0 | [] | []
```

### Pestaña: **Promociones**
```
ID | NOMBRE | DESCRIPCION | TIPO | DESCUENTO | FECHA_INICIO | FECHA_FIN | ACTIVO
```

⚠️ **NOTA**: El campo se llama `DESCUENTO` (no VALOR). Los tipos permitidos son: `percentage`, `fixed`, `2x1`, `3x2`

**Datos de ejemplo:**
```
1 | 2x1 en Bebidas | Lleva 2 bebidas y paga 1 | 2x1 | 0 | 2025-10-01 | 2025-10-31 | true
2 | 20% OFF Snacks | 20% de descuento en todos los snacks | percentage | 20 | 2025-10-01 | 2025-10-15 | true
3 | S/5 OFF compras >S/50 | S/5 de descuento en compras mayores a S/50 | fixed | 5 | 2025-09-01 | 2025-09-30 | false
4 | Combo Familiar | 3 productos al precio de 2 | 3x2 | 33 | 2025-10-01 | 2025-10-31 | true
5 | Descuento Cumpleaños | 10% de descuento en tu cumpleaños | percentage | 10 | 2025-01-01 | 2025-12-31 | true
```

### Pestaña: **Combos**
```
ID | NOMBRE | DESCRIPCION | PRODUCTOS | PRECIO_ORIGINAL | COMBO_PRECIO | PUNTOS_EXTRA | ACTIVE
```

⚠️ **IMPORTANTE**: 
- El campo se llama `COMBO_PRECIO` (con guion bajo, NO `PRECIO_COMBO`)
- El campo activo se llama `ACTIVE` (en inglés, NO `ACTIVO`)
- `PRODUCTOS` debe ser un array JSON: `[{"productId":1,"quantity":2}]`

**Datos de ejemplo:**
```
1 | Combo Lonchera | Bebida + Snack + Pan | [{"productId":1,"quantity":1},{"productId":3,"quantity":1}] | 14.00 | 12.00 | 5 | true
2 | Combo Fiesta | 6 Cervezas + 2 Snacks | [{"productId":5,"quantity":6},{"productId":3,"quantity":2}] | 34.00 | 28.00 | 10 | true
3 | Combo Familiar | 4 Bebidas + 3 Snacks | [{"productId":2,"quantity":4},{"productId":4,"quantity":3}] | 28.00 | 25.00 | 8 | true
4 | Combo Desayuno | Café + Pan + Leche | [{"productId":1,"quantity":1},{"productId":7,"quantity":1}] | 12.00 | 10.00 | 3 | true
5 | Combo Película | 2 Bebidas + 2 Snacks Grandes | [{"productId":2,"quantity":2},{"productId":3,"quantity":2}] | 19.00 | 16.00 | 6 | false
```

### Pestaña: **Caja**
```
ID | FECHA_APERTURA | FECHA_CIERRE | MONTO_INICIAL | TOTAL_VENTAS | TOTAL_GASTOS | MONTO_FINAL | CAJERO | ESTADO | DIFERENCIA
```

**Datos de ejemplo:**
```
1 | 2025-10-02T08:00:00 | | 100.00 | 450.00 | 50.00 | | Admin | open | 
2 | 2025-10-01T08:00:00 | 2025-10-01T20:00:00 | 100.00 | 520.00 | 40.00 | 580.00 | Admin | closed | 0
3 | 2025-09-30T08:00:00 | 2025-09-30T20:00:00 | 100.00 | 380.00 | 30.00 | 450.00 | Cajero1 | closed | 0
4 | 2025-09-29T08:00:00 | 2025-09-29T20:00:00 | 100.00 | 620.00 | 60.00 | 660.00 | Supervisor1 | closed | 0
5 | 2025-09-28T08:00:00 | 2025-09-28T20:00:00 | 100.00 | 490.00 | 45.00 | 545.00 | Admin | closed | 0
```

### Pestaña: **Gastos**
```
ID | FECHA | DESCRIPCION | MONTO | CATEGORIA | CAJERO | COMPROBANTE
```

**Datos de ejemplo:**
```
1 | 2025-10-02T09:00:00 | Pago de luz | 150.00 | Servicios | Admin | 
2 | 2025-10-02T10:30:00 | Compra de bolsas | 30.00 | Suministros | Admin | 
3 | 2025-10-01T14:00:00 | Reparación de refrigerador | 200.00 | Mantenimiento | Supervisor1 | 
4 | 2025-09-30T11:00:00 | Compra de etiquetas | 45.00 | Suministros | Cajero1 | 
5 | 2025-09-29T15:00:00 | Servicio de internet | 120.00 | Servicios | Admin | 
```

### Pestaña: **Delivery**
```
ID | FECHA | CLIENTE_ID | PEDIDO_ID | DIRECCION | ESTADO | REPARTIDOR | HORA_SALIDA | HORA_ENTREGA
```

**Datos de ejemplo:**
```
1 | 2025-10-02T10:30:00 | 1 | T-001 | Av. Principal 123 | delivered | Luis Mendoza | 2025-10-02T10:35:00 | 2025-10-02T11:00:00
2 | 2025-10-02T11:15:00 | 2 | T-002 | Jr. Comercio 456 | in-transit | Carlos Ramos | 2025-10-02T11:20:00 | 
3 | 2025-10-02T14:00:00 | 3 | T-006 | Calle Lima 789 | pending | | | 
4 | 2025-10-01T16:30:00 | 4 | T-007 | Av. Los Olivos 321 | delivered | Pedro Silva | 2025-10-01T16:35:00 | 2025-10-01T17:05:00
5 | 2025-10-01T18:00:00 | 1 | T-008 | Av. Principal 123 | cancelled | | | 
```

---

## 🔧 Paso 2: Configurar Google Apps Script

1. En tu hoja de cálculo, ve a **Extensiones → Apps Script**
2. Borra todo el código predeterminado
3. Copia y pega el siguiente código:

```javascript
// Configuración
const SHEET_NAME = 'POS_Francachela';

// Función para obtener la hoja por nombre
function getSheet(name) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  return ss.getSheetByName(name);
}

// Función para convertir encabezados y fila en objeto
function rowToObject(headers, row) {
  const obj = {};
  headers.forEach((header, index) => {
    obj[header] = row[index];
  });
  return obj;
}

// Función principal que maneja todas las peticiones
function doPost(e) {
  try {
    // Obtener parámetros
    const params = e.parameter;
    console.log('Received params:', params);

    // Validar parámetros requeridos
    if (!params.action || !params.sheet) {
      throw new Error('Se requieren los parámetros action y sheet');
    }

    // Obtener la hoja solicitada
    const sheet = getSheet(params.sheet);
    if (!sheet) {
      throw new Error(`Hoja "${params.sheet}" no encontrada`);
    }

    // Obtener datos de la hoja
    const range = sheet.getDataRange();
    const values = range.getValues();
    const headers = values[0];

    let result = { ok: true };

    // Procesar según la acción
    switch (params.action) {
      case 'read':
        // Si es una operación de lectura para usuarios (login)
        if (params.sheet === 'Usuarios' && params.data) {
          const loginData = JSON.parse(params.data);
          console.log('Login attempt for:', loginData.username);
          
          // Buscar usuario
          for (let i = 1; i < values.length; i++) {
            const row = values[i];
            const user = rowToObject(headers, row);
            
            if (user.USERNAME === loginData.username && user.PASSWORD === loginData.password) {
              // Usuario encontrado - retornar sin la contraseña
              result.users = [{
                id: user.ID,
                username: user.USERNAME,
                role: user.ROL,
                nombre: user.NOMBRE
              }];
              break;
            }
          }
          
          if (!result.users) {
            throw new Error('Usuario o contraseña incorrectos');
          }
        } else {
          // Lectura normal de datos
          result.data = values.slice(1).map(row => {
            const item = {};
            headers.forEach((header, index) => {
              // Convertir algunos valores comunes
              let value = row[index];
              if (typeof value === 'string' && value.startsWith('{')) {
                try {
                  value = JSON.parse(value);
                } catch (e) {
                  // Mantener como string si no es JSON válido
                }
              }
              item[header] = value;
            });
            return item;
          });
        }
        break;

      case 'write':
        if (!params.data) {
          throw new Error('Se requiere el parámetro data para escribir');
        }
        
        const newData = JSON.parse(params.data);
        const nextId = values.length; // ID automático
        const rowData = headers.map(header => newData[header] || '');
        rowData[0] = nextId; // Asignar ID
        
        sheet.appendRow(rowData);
        result.id = nextId;
        result.message = 'Registro creado exitosamente';
        break;

      case 'update':
        if (!params.id || !params.data) {
          throw new Error('Se requieren id y data para actualizar');
        }
        
        const updateData = JSON.parse(params.data);
        const rowIndex = values.findIndex(row => row[0] == params.id);
        
        if (rowIndex === -1) {
          throw new Error(`Registro con ID ${params.id} no encontrado`);
        }
        
        headers.forEach((header, colIndex) => {
          if (updateData[header] !== undefined) {
            sheet.getRange(rowIndex + 1, colIndex + 1).setValue(updateData[header]);
          }
        });
        
        result.message = 'Registro actualizado exitosamente';
        break;

      case 'delete':
        if (!params.id) {
          throw new Error('Se requiere id para eliminar');
        }
        
        const deleteRowIndex = values.findIndex(row => row[0] == params.id);
        if (deleteRowIndex === -1) {
          throw new Error(`Registro con ID ${params.id} no encontrado`);
        }
        
        sheet.deleteRow(deleteRowIndex + 1);
        result.message = 'Registro eliminado exitosamente';
        break;

      default:
        throw new Error(`Acción "${params.action}" no soportada`);
    }

    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    console.error('Error:', error);
    return ContentService.createTextOutput(JSON.stringify({
      ok: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// Función GET para pruebas
function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: 'POS API funcionando correctamente',
    timestamp: new Date().toISOString()
  })).setMimeType(ContentService.MimeType.JSON);
}
```

4. Guarda el proyecto con un nombre descriptivo (ej: "POS_API")

---

## 🌐 Paso 3: Implementar el Script

1. Haz clic en **Implementar → Nueva implementación**
2. Selecciona **Aplicación web**
3. Configura:
   - **Descripción**: "API POS v1.0"
   - **Ejecutar como**: "Yo" (tu cuenta)
   - **Quién tiene acceso**: "Cualquier persona"
4. Haz clic en **Implementar**
5. **Copia la URL de implementación** - la necesitarás en el siguiente paso

⚠️ **IMPORTANTE**: Autoriza el script cuando Google te lo solicite

---

## 🔐 Paso 4: Configurar Variables de Entorno en tu Proyecto

1. En tu proyecto, crea o edita el archivo `.env` en la raíz
2. Agrega las siguientes variables:

```env
# Google Sheets Configuration
VITE_USE_GOOGLE_SHEETS=true
VITE_GOOGLE_SHEETS_SCRIPT_URL=https://script.google.com/macros/s/TU_DEPLOYMENT_ID_AQUI/exec

# Mock Data (para desarrollo sin conexión)
VITE_USE_MOCKS=false

# API Base URL (opcional, para backend futuro)
VITE_API_BASE_URL=http://localhost:3000
```

3. Reemplaza `TU_DEPLOYMENT_ID_AQUI` con la URL que copiaste en el Paso 3

---

## ✅ Paso 5: Probar la Conexión

### Opción A: Desde el Navegador
1. Abre la URL de tu script en el navegador
2. Deberías ver:
```json
{
  "status": "POS API funcionando correctamente",
  "timestamp": "2025-01-XX..."
}
```

### Opción B: Desde tu Aplicación
1. Reinicia tu servidor de desarrollo
2. Ve a la página de **Punto de Venta**
3. Realiza una venta de prueba
4. Verifica en tu Google Sheet (pestaña "Ventas") que se haya registrado

---

## 🎯 Paso 6: Poblar Datos Iniciales

Para comenzar a usar el sistema, agrega algunos datos de ejemplo:

### Productos (pestaña Productos):
```
1 | Inca Kola 500ml | 7750885005609 | | 2.00 | 3.50 | 3.00 | 150 | 20 | Coca-Cola | Bebidas | 3 | true | true
2 | Coca Cola 500ml | 7750885005616 | | 2.00 | 3.50 | 3.00 | 200 | 20 | Coca-Cola | Bebidas | 3 | true | true
3 | Chips Lays 180g | 7750670000536 | | 3.50 | 5.00 | 4.50 | 80 | 15 | PepsiCo | Snacks | 5 | true | true
4 | Galletas Oreo | 7622210100672 | | 3.00 | 4.50 | 4.00 | 60 | 10 | Mondelez | Snacks | 4 | true | true
5 | Cerveza Pilsen 330ml | 7750182003476 | | 2.50 | 4.00 | 3.50 | 120 | 30 | Backus | Bebidas | 4 | true | true
```

### Clientes (pestaña Clientes):
```
1 | Juan | Pérez | 12345678 | 1990-05-15 | 51987654321 | 2025-01-01 | 450 | [] | []
2 | María | García | 87654321 | 1985-12-20 | 51987654322 | 2025-01-01 | 320 | [] | []
3 | Carlos | López | 11223344 | 2000-10-05 | 51987654323 | 2025-01-01 | 180 | [] | []
4 | Ana | Torres | 44332211 | 1992-08-30 | 51987654324 | 2025-01-01 | 520 | [] | []
5 | Luis | Ramírez | 55667788 | 1988-03-10 | 51987654325 | 2025-01-02 | 0 | [] | []
```

---

## 🔄 Paso 7: Modo Desarrollo (Opcional)

Si quieres trabajar sin conexión a Google Sheets durante el desarrollo:

1. En tu archivo `.env`:
```env
VITE_USE_GOOGLE_SHEETS=false
VITE_USE_MOCKS=true
```

2. El sistema usará datos de prueba locales

---

## 🛠️ Solución de Problemas

### Error: "Script no autorizado"
- Ve a Apps Script → Implementación → Gestionar implementaciones
- Verifica que "Quién tiene acceso" esté en "Cualquier persona"

### Error: "No se puede escribir en la hoja"
- Verifica que los encabezados de la hoja coincidan exactamente con los especificados
- Comprueba que no haya espacios extra en los nombres de las columnas

### Las ventas no se registran
1. Abre la consola del navegador (F12)
2. Busca errores en la pestaña "Console"
3. Verifica que `VITE_USE_GOOGLE_SHEETS=true` en tu `.env`
4. Confirma que la URL del script sea correcta

### Error de CORS
- Esto es normal con Google Apps Script en modo `no-cors`
- La petición se procesa correctamente aunque no veas la respuesta

---

## 📱 Próximos Pasos

Una vez conectado exitosamente:

1. ✅ Realiza ventas de prueba
2. ✅ Verifica que los datos se guarden correctamente
3. ✅ Prueba la búsqueda de clientes y productos
4. ✅ Configura las promociones
5. ✅ Empieza a usar el sistema en producción

---

## 📞 Soporte

Si tienes problemas:
1. Revisa la consola del navegador (F12)
2. Verifica los registros de Apps Script (View → Logs)
3. Confirma que todas las variables de entorno estén configuradas

---

## 🔒 Seguridad

⚠️ **Importante**:
- Nunca compartas públicamente la URL de tu script
- Considera implementar autenticación en el script para producción
- Revisa regularmente los permisos de acceso a tu hoja

---

## 📊 Estructura de Datos Completa

### Ventas (Campos obligatorios)
```javascript
{
  ID: number,
  FECHA: string (ISO 8601),
  CLIENTE_ID: number | '',
  LISTA_PRODUCTOS: string (JSON array),
  SUB_TOTAL: number,
  DESCUENTO: number,
  TOTAL: number,
  METODO_PAGO: 'Efectivo' | 'Yape' | 'Plin' | 'Tarjeta',
  COMENTARIO: string,
  CAJERO: string,
  ESTADO: 'completada' | 'anulada',
  PUNTOS_OTORGADOS: number,
  PUNTOS_USADOS: number,
  TICKET_ID: string
}
```

---

¡Listo! Tu sistema POS ahora está conectado con Google Sheets y listo para usar. 🎉
