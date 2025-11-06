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

```
ID | FECHA | CLIENTE_ID | LISTA_PRODUCTOS | SUB_TOTAL | DESCUENTO | TOTAL | METODO_PAGO | COMENTARIO | CAJERO | ESTADO | PUNTOS_OTORGADOS | PUNTOS_USADOS | TICKET_ID
```

### Pestaña: **Productos**
```
ID | PRODUCTO_DESCRIPCION | CODIGO_BARRA | IMAGEN | COSTO | PRECIO | PRECIO_MAYOREO | CANTIDAD_ACTUAL | CANTIDAD_MINIMA | PROVEEDOR | CATEGORIA | VALOR_PUNTOS | MOSTRAR | USA_INVENTARIO
```

### Pestaña: **Clientes**
```
ID | NOMBRES | APELLIDOS | DNI | FECHA_NACIMIENTO | TELEFONO | FECHA_REGISTRO | PUNTOS_ACUMULADOS | HISTORIAL_COMPRAS | HISTORIAL_CANJES
```

### Pestaña: **Promociones**
```
ID | NOMBRE | DESCRIPCION | TIPO | DESCUENTO | FECHA_INICIO | FECHA_FIN | ACTIVO
```

### Pestaña: **Combos**
```
ID | NOMBRE | DESCRIPCION | PRODUCTOS | PRECIO | PUNTOS_EXTRA | ACTIVO
```

### Pestaña: **Caja**
```
ID | FECHA_APERTURA | FECHA_CIERRE | MONTO_INICIAL | TOTAL_VENTAS | TOTAL_GASTOS | MONTO_FINAL | CAJERO | ESTADO | DIFERENCIA
```

### Pestaña: **Gastos**
```
ID | FECHA | DESCRIPCION | MONTO | CATEGORIA | CAJERO | COMPROBANTE
```

### Pestaña: **Delivery**
```
ID | FECHA | CLIENTE_ID | PEDIDO_ID | DIRECCION | ESTADO | REPARTIDOR | HORA_SALIDA | HORA_ENTREGA
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
1 | Coca Cola 500ml | 7501234567890 | | 2.50 | 4.00 | 3.50 | 50 | 10 | Bebidas SA | Bebidas | 4 | true | true
2 | Pan Francés | 7501234567891 | | 0.20 | 0.50 | 0.40 | 100 | 20 | Panadería | Panadería | 1 | true | true
```

### Clientes (pestaña Clientes):
```
1 | Juan | Pérez | 12345678 | 1990-01-15 | 987654321 | 2025-01-01 | 0 | [] | []
2 | María | García | 87654321 | 1985-05-20 | 912345678 | 2025-01-01 | 50 | [] | []
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
  ESTADO: 'completada' | 'cancelada',
  PUNTOS_OTORGADOS: number,
  PUNTOS_USADOS: number,
  TICKET_ID: string
}
```

---

¡Listo! Tu sistema POS ahora está conectado con Google Sheets y listo para usar. 🎉
