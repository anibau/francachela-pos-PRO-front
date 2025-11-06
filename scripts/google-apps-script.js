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