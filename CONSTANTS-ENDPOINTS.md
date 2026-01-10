# 🍻 Francachela POS API -- Documentación de Endpoints

API REST para el sistema de Punto de Venta **Francachela POS**,
desarrollado con **NestJS + PostgreSQL**, orientado a la gestión de
ventas, inventario, clientes, promociones, caja, delivery, reportes y
exportación de datos.

------------------------------------------------------------------------

## 🚀 Tecnologías

-   **Backend:** NestJS + TypeScript
-   **Base de Datos:** PostgreSQL
-   **ORM:** TypeORM
-   **Autenticación:** JWT Bearer
-   **Documentación:** Swagger / OpenAPI
-   **Mensajería:** WhatsApp (Baileys)
-   **Reportes:** ExcelJS

------------------------------------------------------------------------

## 🌐 URL Base

  Entorno      URL
  ------------ -----------------------------
  Desarrollo   http://localhost:3000
  Producción   https://api.francachela.com

------------------------------------------------------------------------

## 🔐 Autenticación

Todos los endpoints protegidos requieren el siguiente header:

``` http
Authorization: Bearer <TOKEN_JWT>
```

### Roles del sistema

-   **ADMIN:** Acceso total
-   **CAJERO:** Ventas, clientes y consultas
-   **INVENTARIOS:** Productos y stock

------------------------------------------------------------------------

## 📌 Estructura de Respuesta Estándar

``` json
{
  "status": true,
  "message": "Operación exitosa",
  "data": {}
}
```

### Error

``` json
{
  "status": false,
  "message": "Mensaje de error",
  "error": "Detalle técnico"
}
```

------------------------------------------------------------------------

# 📖 ENDPOINTS

## ✅ App

  Método   Endpoint   Descripción
  -------- ---------- ----------------------------------
  GET      `/`        Verificación de estado de la API

------------------------------------------------------------------------

## 🔐 Autenticación

  Método   Endpoint          Descripción
  -------- ----------------- ----------------------------------------
  POST     `/auth/login`     Iniciar sesión
    ### payload example: 
        {username: "admin", password: "admin123"}

    ### RESPONSE example:     
            {
                "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFkbWluIiwic3ViIjoxLCJyb2wiOiJBRE1JTiIsIm5vbWJyZSI6IkFkbWluaXN0cmFkb3IgUHJpbmNpcGFsIiwiaWF0IjoxNzY0NjI4ODgzLCJleHAiOjE3NjQ2MzI0ODN9.YSh06IfKpDHSYE_HQMK1BipSg_mxyUOqIL2jZ6WPYDA",
                "user": {
                    "id": 1,
                    "username": "admin",
                    "nombre": "Administrador Principal",
                    "rol": "ADMIN"
                }
            }

  GET      `/auth/profile`   Obtener perfil del usuario autenticado

### Ejemplo Login

``` bash
curl -X POST http://localhost:3000/auth/login   -H "Content-Type: application/json"   -d '{"email":"admin@mail.com","password":"123456"}'
```

------------------------------------------------------------------------

## 👥 Usuarios

  Método   Endpoint                 Descripción
  -------- ------------------------ ------------------------
  POST     `/users`                 Crear usuario
  GET      `/users`                 Listar usuarios
  GET      `/users/{id}`            Obtener usuario por ID
  PATCH    `/users/{id}`            Actualizar usuario
  DELETE   `/users/{id}`            Desactivar usuario
  PATCH    `/users/{id}/activate`   Activar usuario

------------------------------------------------------------------------

## 📦 Productos

  Método   Endpoint           Descripción
  -------- ------------------ ---------------------
  POST     `/products`        Crear producto
    ### payload example: 
        {
          "productoDescripcion": "Cerveza Pilsen 650ml",
          "codigoBarra": "7751271001234",
          "imagen": "string",
          "costo": 2.5,
          "precio": 4,
          "precioMayoreo": 3.5,
          "cantidadActual": 100,
          "cantidadMinima": 10,
          "proveedor": "Backus",
          "categoria": "Bebidas",
          "valorPuntos": 5,
          "mostrar": true,
          "usaInventario": true
        }
  GET      `/products`        Listar productos
      ### REPSONSE example: 
          {
              "data": [
                  {
                      "id": 5,
                      "productoDescripcion": "Agua Mineral 500ml",
                      "codigoBarra": "7751271001238",
                      "imagen": null,
                      "costo": "0.80",
                      "precio": "2.00",
                      "precioMayoreo": "1.50",
                      "cantidadActual": 200,
                      "cantidadMinima": 50,
                      "proveedor": "San Luis",
                      "categoria": "Bebidas",
                      "valorPuntos": 2,
                      "mostrar": true,
                      "usaInventario": true,
                      "fechaCreacion": "2025-11-29T15:07:42.539Z",
                      "fechaActualizacion": "2025-11-29T15:07:42.539Z"
                  },
                  {
                      "id": 4,
                      "productoDescripcion": "Chicharrón Preparado",
                      "codigoBarra": "7751271001237",
                      "imagen": null,
                      "costo": "8.00",
                      "precio": "15.00",
                      "precioMayoreo": "13.00",
                      "cantidadActual": 50,
                      "cantidadMinima": 10,
                      "proveedor": "Cocina Local",
                      "categoria": "Comida",
                      "valorPuntos": 15,
                      "mostrar": true,
                      "usaInventario": true,
                      "fechaCreacion": "2025-11-29T15:07:42.530Z",
                      "fechaActualizacion": "2025-11-29T15:07:42.530Z"
                  },
                  {
                      "id": 3,
                      "productoDescripcion": "Pisco Quebranta 750ml",
                      "codigoBarra": "7751271001236",
                      "imagen": null,
                      "costo": "25.00",
                      "precio": "45.00",
                      "precioMayoreo": "40.00",
                      "cantidadActual": 30,
                      "cantidadMinima": 5,
                      "proveedor": "Viñas Peruanas",
                      "categoria": "Licores",
                      "valorPuntos": 45,
                      "mostrar": true,
                      "usaInventario": true,
                      "fechaCreacion": "2025-11-29T15:07:42.520Z",
                      "fechaActualizacion": "2025-11-29T15:07:42.520Z"
                  },
                  {
                      "id": 2,
                      "productoDescripcion": "Cerveza Cristal 630ml",
                      "codigoBarra": "7751271001235",
                      "imagen": null,
                      "costo": "3.20",
                      "precio": "5.50",
                      "precioMayoreo": "5.00",
                      "cantidadActual": 80,
                      "cantidadMinima": 15,
                      "proveedor": "Backus",
                      "categoria": "Cervezas",
                      "valorPuntos": 5,
                      "mostrar": true,
                      "usaInventario": true,
                      "fechaCreacion": "2025-11-29T15:07:42.512Z",
                      "fechaActualizacion": "2025-11-29T15:07:42.512Z"
                  },
                  {
                      "id": 1,
                      "productoDescripcion": "Cerveza Pilsen 650ml",
                      "codigoBarra": "7751271001234",
                      "imagen": null,
                      "costo": "3.50",
                      "precio": "6.00",
                      "precioMayoreo": "5.50",
                      "cantidadActual": 100,
                      "cantidadMinima": 20,
                      "proveedor": "Backus",
                      "categoria": "Cervezas",
                      "valorPuntos": 6,
                      "mostrar": true,
                      "usaInventario": true,
                      "fechaCreacion": "2025-11-29T15:07:42.503Z",
                      "fechaActualizacion": "2025-11-29T15:07:42.503Z"
                  }
              ],
              "total": 5,
              "page": 1,
              "limit": 10,
              "totalPages": 1,
              "hasNextPage": false,
              "hasPrevPage": false
          }     
  GET    `/productos/search`   (Buscar productos por descripción, código de barras, categoría o proveedor con query)
  GET: `/productos/categorias` ( Obtener todas las categorías de productos)
  GET: `/productos/stock-bajo`  (Obtener productos con stock bajo)
  GET: `/productos/categoria/{categoria}`  (Obtener productos por categoría)
  GET: `/productos/proveedor/{proveedor}`  (Obtener productos por proveedor)
  GET: `/productos/movimientos`  (Obtener historial de movimientos de inventario)
  GET: `/productos/movimientos/{codigoBarra}`  (Obtener historial de movimientos de inventario por producto)
  GET: `/productos/codigo/{codigoBarra}`  (Obtener producto por codigo de barras)
  GET      `/products/{id}`   Obtener producto
  PATCH    `/products/{id}`   Actualizar producto
    ### payload example: 
        {
          "productoDescripcion": "Cerveza Pilsen 650ml",
          "codigoBarra": "7751271001234",
          "imagen": "string",
          "costo": 2.5,
          "precio": 4,
          "precioMayoreo": 3.5,
          "cantidadActual": 100,
          "cantidadMinima": 10,
          "proveedor": "Backus",
          "categoria": "Bebidas",
          "valorPuntos": 5,
          "mostrar": true,
          "usaInventario": true
        }

  DELETE   `/products/{id}`   Eliminar producto (soft delete)
  PATCH: `/productos/{id}/stock`   (Actualizar stock del producto)
    ### payload example: 
        {
          "cantidad": 50,
          "tipo": "ENTRADA",
          "observaciones": "Compra de mercancía",
          "proveedor": "Distribuidora ABC",
          "numeroFactura": "F001-00001234"
        }
  PATCH: `/productos/{id}/activate`  (Mostrar producto nuevamente)

------------------------------------------------------------------------

## 🧾 Ventas

  | Método | Endpoint                                       | Descripción                |
| ------ | ---------------------------------------------- | -------------------------- |
| POST   | `/ventas`                                       | Registrar venta            |
        ### payload example: 
        {
          "clienteId": 1,
          "listaProductos": [
            {
              "productoId": 1,
              "cantidad": 2,
              "precioUnitario": 4.5
            }
          ],
          "descuento": 5,
          "recargoExtra": 3.5,
          "metodosPageo": [
            {
              "metodoPago": "EFECTIVO",
              "monto": 50
            },
            {
              "metodoPago": "YAPE",
              "monto": 45,
              "referencia": "TXN-123456"
            }
          ],
          "comentario": "Cliente preferente - promoción especial",
          "tipoCompra": "LOCAL",
          "montoRecibido": 50,
          "puntosUsados": 10
        } 
| GET    | `/ventas`                                       | Listar todas las ventas    |
      ### RESPONSE example: 
                  {
                      "data": [
                          {
                            "clienteId": 1,
                            "listaProductos": [
                              {
                                "productoId": 1,
                                "cantidad": 2,
                                "precioUnitario": 4.5
                              }
                            ],
                            "descuento": 5,
                            "recargoExtra": 3.5,
                            "metodosPageo": [
                              {
                                "metodoPago": "EFECTIVO",
                                "monto": 50
                              },
                              {
                                "metodoPago": "YAPE",
                                "monto": 45,
                                "referencia": "TXN-123456"
                              }
                            ],
                            "comentario": "Cliente preferente - promoción especial",
                            "tipoCompra": "LOCAL",
                            "montoRecibido": 50,
                            "puntosUsados": 10
                          },
                                                    {
                            "clienteId": 1,
                            "listaProductos": [
                              {
                                "productoId": 1,
                                "cantidad": 2,
                                "precioUnitario": 4.5
                              }
                            ],
                            "descuento": 5,
                            "recargoExtra": 3.5,
                            "metodosPageo": [
                              {
                                "metodoPago": "EFECTIVO",
                                "monto": 50
                              },
                              {
                                "metodoPago": "YAPE",
                                "monto": 45,
                                "referencia": "TXN-123456"
                              }
                            ],
                            "comentario": "Cliente preferente - promoción especial",
                            "tipoCompra": "LOCAL",
                            "montoRecibido": 50,
                            "puntosUsados": 10
                          }
                      ],
                      "total": 2,
                      "page": 1,
                      "limit": 10,
                      "totalPages": 1,
                      "hasNextPage": false,
                      "hasPrevPage": false
                  }
| GET    | `/ventas/{id}`                                  | Obtener detalle de venta   |
| GET    | `/ventas/cliente/{clienteId}`                 | Obtener estadisticas de ventas por rango de fecha|
| GET    | `/ventas/estadisticas`                 | Obtener ventas de un cliente especifico|
| GET    | `/ventas/rango??fechaInicio=YYYY-MM-DD&fechaFin=YYYY-MM-DD` | Ventas por rango de fechas |
| GET    | `/ventas/ticket/{ticketId}`                      | Ventas por ticket ID         |
| PATCH  | `/ventas/{id}/anular`                           | Anular venta               |
| PATCH  | `/ventas/{id}/comentario`                           | actualizar comentario de venta               |
| POST   | `/ventas/devolucion/{id}`                       | Devolución                 |
| GET    | `/ventas/hoy`                                 | Ventas del día             |
| GET    | `/ventas/corte`                                 | generar corte de ventas       |
| POST    | `/ventas/preview`                                 | Previsualizar ventas sin persistir datos   |
      ### Payload: 
        {
          "items": [
            {
              "productoId": 1,
              "cantidad": 2
            },
            {
              "productoId": 3,
              "cantidad": 1
            }
          ],
          "clienteId": 5,
          "puntosAUsar": 30,
          "montoRecibido": 35
        }
      ### Response: 
          {
            "subtotal": 45,
            "descuentoPromos": 5,
            "descuentoPuntos": 6.2,
            "ajusteRedondeo": -0.2,
            "total": 33.6,
            "totalCobrado": 33.4,
            "vuelto": 1.6,
            "puntosOtorgados": 3,
            "detalleItems": [
              {
                "productoId": 0,
                "nombre": "string",
                "precio": 0,
                "cantidad": 0,
                "subtotal": 0
              }
            ],
            "validaciones": {
              "stockSuficiente": true,
              "puntosValidos": true,
              "mensajes": [
                "string"
              ]
            }
          }
------------------------------------------------------------------------

## 👤 Clientes

  Método   Endpoint            Descripción
  -------- ------------------- --------------------
  POST     `/clientes`        Crear cliente
    ### payload example: 
        {
          "nombres": "Juan Carlos",
          "apellidos": "García López",
          "dni": "12345678",
          "fechaNacimiento": "1990-05-15",
          "telefono": "987654321",
          "direccion": "Av. Lima 123, San Isidro"
        }
  GET      `/clientes`        Listar clientes
      ### RESPONSE example: 
          {
              "data": [
                  {
                      "id": 5,
                      "nombres": "Roberto",
                      "apellidos": "Castillo Morales",
                      "dni": "55667788",
                      "fechaNacimiento": "1982-09-13",
                      "telefono": "977889900",
                      "fechaRegistro": "2025-11-29T15:07:42.579Z",
                      "puntosAcumulados": 178,
                      "historialCompras": [],
                      "historialCanjes": [],
                      "codigoCorto": "RCM005",
                      "direccion": "Jr. Independencia 654, Lima",
                      "activo": true,
                      "fechaCreacion": "2025-11-29T15:07:42.579Z",
                      "fechaActualizacion": "2025-11-29T15:07:42.579Z"
                  },
                  {
                      "id": 4,
                      "nombres": "Ana Sofía",
                      "apellidos": "Torres Vega",
                      "dni": "44332211",
                      "fechaNacimiento": "1995-01-29",
                      "telefono": "955443322",
                      "fechaRegistro": "2025-11-29T15:07:42.571Z",
                      "puntosAcumulados": 67,
                      "historialCompras": [],
                      "historialCanjes": [],
                      "codigoCorto": "AST004",
                      "direccion": "Av. Central 321, Lima",
                      "activo": true,
                      "fechaCreacion": "2025-11-29T15:07:42.571Z",
                      "fechaActualizacion": "2025-11-29T15:07:42.571Z"
                  },
                  {
                      "id": 3,
                      "nombres": "Carlos Alberto",
                      "apellidos": "Mendoza Silva",
                      "dni": "11223344",
                      "fechaNacimiento": "1978-11-07",
                      "telefono": "998877665",
                      "fechaRegistro": "2025-11-29T15:07:42.563Z",
                      "puntosAcumulados": 234,
                      "historialCompras": [],
                      "historialCanjes": [],
                      "codigoCorto": "CAM003",
                      "direccion": "Calle Los Pinos 789, Lima",
                      "activo": true,
                      "fechaCreacion": "2025-11-29T15:07:42.563Z",
                      "fechaActualizacion": "2025-11-29T15:07:42.563Z"
                  },
                  {
                      "id": 2,
                      "nombres": "María Elena",
                      "apellidos": "Rodríguez López",
                      "dni": "87654321",
                      "fechaNacimiento": "1990-07-21",
                      "telefono": "912345678",
                      "fechaRegistro": "2025-11-29T15:07:42.557Z",
                      "puntosAcumulados": 89,
                      "historialCompras": [],
                      "historialCanjes": [],
                      "codigoCorto": "MER002",
                      "direccion": "Jr. Las Flores 456, Lima",
                      "activo": true,
                      "fechaCreacion": "2025-11-29T15:07:42.557Z",
                      "fechaActualizacion": "2025-11-29T15:07:42.557Z"
                  },
                  {
                      "id": 1,
                      "nombres": "Juan Carlos",
                      "apellidos": "Pérez García",
                      "dni": "12345678",
                      "fechaNacimiento": "1985-03-14",
                      "telefono": "987654321",
                      "fechaRegistro": "2025-11-29T15:07:42.549Z",
                      "puntosAcumulados": 150,
                      "historialCompras": [],
                      "historialCanjes": [],
                      "codigoCorto": "JCP001",
                      "direccion": "Av. Los Olivos 123, Lima",
                      "activo": true,
                      "fechaCreacion": "2025-11-29T15:07:42.549Z",
                      "fechaActualizacion": "2025-11-29T15:07:42.549Z"
                  }
              ],
              "total": 5,
              "page": 1,
              "limit": 10,
              "totalPages": 1,
              "hasNextPage": false,
              "hasPrevPage": false
          }     
  GET      `/clientes/{id}`   Obtener cliente
  GET: `/clientes/search`  (Buscar clientes por nombre, apellido, DNI, teléfono o código por query)
  GET: `/clientes/cumpleañeros`  (Obtener clientes que cumplen años hoy)
  GET: `/clientes/top`   (Obtener clientes con más puntos)
  GET: `/clientes/dni/{dni}`   (Obtener cliente por DNI)
  GET: `/clientes/codigo/{codigoCorto}`  (Obtener cliente por código corto)
  PATCH    `/clientes/{id}`   Actualizar cliente
    ### payload example: 
          {
            "nombres": "Juan Carlos",
            "apellidos": "García López",
            "dni": "12345678",
            "fechaNacimiento": "1990-05-15",
            "telefono": "987654321",
            "direccion": "Av. Lima 123, San Isidro"
          }

  DELETE   `/clientes/{id}`   Eliminar cliente
  GET: `/clientes/{id}/estadisticas`   (Obtener estadísticas del cliente)
  PATCH: `/clientes/{id}/activate`   (Activar cliente nuevamente)
------------------------------------------------------------------------

## 💸 Promociones y 💸 Combos UNIFICADOS
### DONDE tipo de promocion en el sistema unificado es:
 * SIMPLE: Descuento aplicado a productos individuales
 * PACK: Descuento por cantidad específica de un producto
 * COMBO: Precio fijo para conjunto específico de productos

export enum TipoPromocion {
  SIMPLE = 'SIMPLE',
  PACK = 'PACK', 
  COMBO = 'COMBO'
}

### DONDE Tipos de descuento disponibles en el sistema unificado es:

 * PORCENTAJE: Descuento expresado como porcentaje (ej: 15%)
 * MONTO_FIJO: Descuento de monto fijo (ej: S/ 5.00)
 * PRECIO_FIJO: Precio fijo para el combo/pack (ej: S/ 35.00)

export enum TipoDescuento {
  PORCENTAJE = 'PORCENTAJE',
  MONTO_FIJO = 'MONTO_FIJO',
  PRECIO_FIJO = 'PRECIO_FIJO'
}



| Método | Endpoint                      | Descripción          |
| ------ | ----------------------------- | -------------------- |
| POST   | `/promociones/unificadas`                 | Crear promoción      |
         ### payload example: 
                {
                  "nombre": "Combo x2",
                  "descripcion": "2 cerveza brahma",
                  "tipoPromocion": "PACK",
                  "tipoDescuento": "PRECIO_FIJO",
                  "descuento": 1,
                  "precioCombo": 8,
                  "fechaInicio": "2025-01-01",
                  "fechaFin": "2026-12-31",
                  "maxUsos": 1000,
                  "activo": true,
                  "puntosExtra": 8,
                  "productosAplicables": [
                    {
                      "productoId": 1,
                      "cantidadExacta": 2
                    }
                  ]
                }          
| GET    | `/promociones/unificadas`                 | Listar promociones unificadas  |
| GET    | `/promociones/unificadas/activas`         | Listar promociones unificadas activas  |
        ### RESPONSE example: 
              [
                {
                    "id": 1,
                    "nombre": "Combo x2",
                    "descripcion": "2 cerveza brahma",
                    "tipoPromocion": "PACK",
                    "tipoDescuento": "PRECIO_FIJO",
                    "descuento": "1.00",
                    "precioCombo": "8.00",
                    "fechaInicio": "2024-12-31",
                    "fechaFin": "2026-12-30",
                    "maxUsos": 1000,
                    "usosActuales": 0,
                    "activo": true,
                    "puntosExtra": 8,
                    "createdAt": "2025-12-26T17:22:58.077Z",
                    "updatedAt": "2025-12-26T17:22:58.077Z",
                    "productos": [
                        {
                            "id": 1,
                            "promocionId": 1,
                            "productoId": 1,
                            "cantidadExacta": 2,
                            "cantidadMinima": null,
                            "obligatorio": true,
                            "producto": {
                                "id": 1,
                                "productoDescripcion": "Cerveza brahma 650ml",
                                "codigoBarra": "7751271001231453",
                                "imagen": "string",
                                "costo": "2.50",
                                "precio": "4.50",
                                "precioMayoreo": "3.50",
                                "cantidadActual": 95,
                                "cantidadMinima": 10,
                                "proveedor": "Backus",
                                "categoria": "Bebidas",
                                "valorPuntos": 5,
                                "mostrar": true,
                                "usaInventario": true,
                                "fechaCreacion": "2025-12-15T23:05:17.466Z",
                                "fechaActualizacion": "2025-12-16T17:09:44.730Z"
                            }
                        }
                    ]
                }
            ]

| GET    | `/promociones/unificadas/{id}`            | Obtener promoción unificadas por id   |
| PATCH  | `/promociones/unificadas/{id}`            | Actualizar promoción |
| DELETE | `/promociones/unificadas/{id}`            | Eliminar promoción   |
| PATCH  | `/promociones/unificadas/{id}/activate`   | Activar   promoción unificadas    |
| PATCH  | `/promociones/unificadas/{id}/deactivate` | Desactivar  promoción unificadas   |
| POST  | `/promociones/evaluar` | Evaluar promocion para un carrito de compra  |
          EJEMPLO PAYLOAD: {
                              "items": [
                                {
                                  "productoId": 1,
                                  "cantidad": 2,
                                  "precioUnitario": 4.5
                                }
                              ],
                              "montoTotal": 9
                            }



------------------------------------------------------------------------
## 💸 Caja

| Método | Endpoint                  | Descripción        |
| ------ | ------------------------- | ------------------ |
| POST   | `/caja/abrir`              | Apertura de caja   |
         ### payload example: 
            {
              "montoInicial": 100,
              "observaciones": "Apertura normal del día"
            }         
| PATCH   | `/caja/{id}/cerrar`             | Cierre de caja     |
          ### payload example: 
            {
              "montoFinal": 450,
              "observaciones": "Cierre normal, sin novedades"
            }
| GET    | `/caja`           | ontener historial de cajas  |
| GET    | `/caja/actual`           | Caja actual del cajero  |
| GET    | `/caja/resumen`           |obtener resumen de la caja actual |
| GET    | `/caja/estadisticas`           | Historial de cajas por rango de fecha |
| GET    | `/caja/{id}`              | Detalle de caja  por ID  |
| GET    | `/caja/rango`        | Ventas por caja por rango de fecha    |
| GET    | `/caja/estado`        | Obtener estado actual de la caja   |
    ### Response:
      {
        "abierta": true,
        "cajaId": 12,
        "usuario": "admin",
        "fechaApertura": "2026-01-09T08:00:00Z",
        "montoInicial": 500,
        "totalVentas": 1250.5,
        "totalGastos": 150,
        "montoEsperado": 1600.5
      }

------------------------------------------------------------------------

## 📊 Gastos

| Método | Endpoint                                          | Descripción      |
| ------ | ------------------------------------------------- | ---------------- |
| POST   | `/gastos`                                       | Registrar gasto  |
          ### payload example: 
            {
              "descripcion": "Compra de productos de limpieza",
              "monto": 25.5,
              "categoria": "OPERATIVO",
              "metodoPago": "EFECTIVO",
              "proveedor": "Distribuidora ABC",
              "numeroComprobante": "F001-00001234",
              "comprobante": "https://example.com/comprobante.pdf"
            }
| GET    | `/gastos`                                       | Listar gastos    |
| GET    | `/gastos/hoy`                                       | Listar gastos del dia actual   |
| GET    | `/gastos/categorias`                             | Listar categorias de gastos disponibles |
| GET    | `/gastos/estadisticas`                             | Listar estadisticas de gastos por rango de fecha |
| GET    | `/gastos/search`                             | buscar gastos por descripcion, proveedor o comprobante |
| GET    | `/gastos/rango?fechaInicio=YYYY-MM-DD&fechaFin=YYYY-MM-DD` | Gastos por rango de fecha |
| GET    | `/gastos/categoria/{categoria}`                 | Detalle de gastos por categoria |
| GET    | `/gastos/cajero/{cajero}`                 | Detalle de gastos por cajero |
| GET    | `/gastos/{id}`                                  | Detalle de gasto por id |
| PATCH  | `/gastos/{id}`                                  | Editar gasto     |
| DELETE | `/gastos/{id}`                                  | Eliminar gasto   |


------------------------------------------------------------------------

## 📊 Delivery

| Método | Endpoint                  | Descripción           |
| ------ | ------------------------- | --------------------- |
| POST   | `/delivery`               | Crear pedido delivery |
       ### payload example: 
              {
                "clienteId": 1,
                "pedidoId": 1,
                "direccion": "Av. Principal 123, San Isidro",
                "repartidor": "Juan Pérez",
                "phone": "987654321",
                "deliveryFee": 5,
                "notes": "Casa de color azul, segundo piso"
              }       
| GET    | `/delivery`               | Listar pedidos        |
| GET    | `/delivery/hoy`         | Pedidos del día       |
| GET    | `/delivery/repartidores`  | lista de repartidores     |
| GET    | `/delivery/estadisticas`  | obtener estadisticas de pedidos por rango de fechas   |
| GET    | `/delivery/estado/{estado}`  | lista de pedidos por estado   |
| GET    | `/delivery/repartidor/{repartidor}`  | lista de pedidos por repartidor   |
| GET    | `/delivery/rango`          | listar pedidos por rango de fechas     |
| GET    | `/delivery/{id}`          | Detalle pedido        |
| PATCH  | `/delivery/{id}` | Actualizar Pedido     |
          ### payload example: 
              {
                "clienteId": 1,
                "pedidoId": 1,
                "direccion": "Av. Principal 123, San Isidro",
                "repartidor": "Juan Pérez",
                "phone": "987654321",
                "deliveryFee": 5,
                "notes": "Casa de color azul, segundo piso",
                "estado": "EN_CAMINO",
                "horaSalida": "14:30",
                "horaEntrega": "15:15"
              }
| PATCH  | `/delivery/{id}/asignar` | asignar repartidor a pedido     |
| PATCH  | `/delivery/{id}/en-camino` | marcar pedido en camino     |
| PATCH  | `/delivery/{id}/entregado` | Marcar pedido como entregado      |
| PATCH  | `/delivery/{id}/cancelar`   | Cancelar pedido       |



------------------------------------------------------------------------

## 📊 Movimiento inventario

| Método | Endpoint                                      | Descripción        |
| ------ | --------------------------------------------- | ------------------ |
| POST   | `/movimiento-inventario`                  |crear nuevo movimiento de inventario|
           ### payload example: 
              {
                "codigoBarra": "7501234567890",
                "tipo": "ENTRADA",
                "cantidad": 10,
                "costo": 15.5,
                "precioVenta": 25,
                "cajero": "Juan Pérez",
                "proveedor": "Distribuidora ABC"
              }
| GET    | `/movimiento-inventario`                        | Listar movimientos |
| GET    | `/movimiento-inventario/hoy`                        | Listar movimientos del dia|
| GET    | `/movimiento-inventario/estadisticas`          | Listar estadisticas de movimientos por rango de fecha|
| GET    | `/movimiento-inventario/producto/{codigoBarra}`          | obtener movimientos por producto|
| GET    | `/movimiento-inventario/tipo/{tipo}`          | Listar  movimientos por tipo|
| GET    | `/movimiento-inventario/cajero/{cajero}`          | Listar  movimientos por cajero|
| GET    | `/movimiento-inventario/rango`          | Listar movimientos por rango de fecha|
| GET    | `/movimiento-inventario/{id}`                   | Detalle de movimiento por id           |
| POST   | `/movimiento-inventario/entrada`                    | registrar entrada de mercancia   |
| POST   | `/movimiento-inventario/ajuste`                    | registrar ajuste de inventario    |
| POST   | `/movimiento-inventario/venta`             | registrar salido por venta       |


------------------------------------------------------------------------

## 📩 WhatsApp

| Método | Endpoint                 | Descripción           |
| ------ | ------------------------ | --------------------- |
| POST   | `/whatsapp/send`         | Enviar mensaje        |
       ### payload example: 
          {
            "phone": "51987654321",
            "message": "¡Gracias por tu compra!",
            "ventaId": 1
          }
| GET    | `/whatsapp/status`       | Estado del servicio whatsapp   |
| GET    | `/whatsapp/qr`       | Obtener codigo QR para conexion   |
| POST    | `/whatsapp/reconnect`       | Reconectar whatsapp manualmente  |
| DELETE   | `/whatsapp/logout`       | Cerrar sesión de whatsapp      |


------------------------------------------------------------------------

## 📊 EXPORTACIÓN A EXCEL

| Método | Endpoint                       | Descripción          |
| ------ | ------------------------------ | -------------------- |
| GET    | `/excel/export-ventas`         | Exportar ventas      |
| GET    | `/excel/export-venta-pagos`         | Exportar pagos de ventas (metodods de pago por venta)   |
| GET    | `/excel/export-productos`      | Exportar productos   |
| GET    | `/excel/export-clientes`     | Exportar clientes    |
| GET    | `/excel/export-inventario`     | Exportar inventario  |
| GET    | `/excel/export-delivery`          | Exportación de pedidos deliveries |


------------------------------------------------------------------------
## 📊 PUNTOS

| Método | Endpoint                       | Descripción          |
| ------ | ------------------------------ | -------------------- |
| POST    | `/puntos/evaluar`         | Evaluar puntos disponibles para uso en venta  |
    ### Payload: 
    {
      "clienteId": 5,
      "items": [
        {
          "productoId": 1,
          "cantidad": 2
        },
        {
          "productoId": 3,
          "cantidad": 1
        }
      ],
      "puntosSolicitados": 30
    }

    ### Response:
    {
      "puntosDisponibles": 25,
      "puntosAceptados": 25,
      "descuento": 6.2,
      "mensaje": "Solo se pueden usar 25 puntos",
      "limitePorProductos": 30,
      "detalleProductos": [
        {
          "productoId": 0,
          "nombre": "string",
          "precio": 0,
          "cantidad": 0,
          "subtotal": 0,
          "puntosMaximos": 0
        }
      ]
    }

| GET    | `/puntos/historial/{clienteId}`   | Obtener historial de movimientos de puntos de un cliente  |
| POST    | `/puntos/ajustar`         | Ajustar puntos de clientes manualmente (solo administradores)   |
      ### Payload:
        {
          "clienteId": 5,
          "puntos": 50,
          "motivo": "Corrección por error en sistema",
          "tipo": "AJUSTE"
        }
| GET    | `/puntos/estadisticas`         | Obtener estadisticas generales de puntos  |

------------------------------------------------------------------------
------------------------------------------------------------------------
## 📊 ENTRADAS

| Método | Endpoint                       | Descripción          |
| ------ | ------------------------------ | -------------------- |
| POST    | `/entradas`         | Crear entrada |
    ### Payload:
    {
      "monto": 150.5,
      "descripcion": "Donación de cliente por excelente servicio",
      "categoria": "DONACION",
      "fecha": "2025-01-09",
      "observaciones": "Cliente muy satisfecho con el producto"
    }
| GET    | `/entradas?page=1&limit=10`         | obtener entradas por paginacion |
| GET    | `/entradas/rango?fechaInicio=YYYY-MM-DD&fechaFin=YYYY-MM-DD`   | Obtener hentradas por rango de fechas  |
| GET    | `/entradas/total-rango?fechaInicio=YYYY-MM-DD&fechaFin=YYYY-MM-DD`   | calcular total de entradas por rango de fechas  |
| GET    | `/entradas/estadisticas?fechaInicio=YYYY-MM-DD&fechaFin=YYYY-MM-DD`         | Obtener estadisticas generales de entradas  |
| GET    | `/entradas/{id}`         | Obtener entrada por id  |
| PATCH    | `/entradas/{id}`         | Actualizar entrada por id  |
| DELETE    | `/entradas/{id}`         | Eliminar entrada por id  |

------------------------------------------------------------------------

## 📊 CORTE

| Método | Endpoint                       | Descripción          |
| ------ | ------------------------------ | -------------------- |
| GET    | `/corte?fechaInicio=YYYY-MM-DD&fechaFin=YYYY-MM-DD`         | obtener corte de caja completo |
| GET    | `/corte/estadisticas?fechaInicio=YYYY-MM-DD&fechaFin=YYYY-MM-DD`| obtener estadisticas de corte caja |
| GET    | `/corte/export?fechaInicio=YYYY-MM-DD&fechaFin=YYYY-MM-DD`         | obtener corte de caja a excel  |

------------------------------------------------------------------------


## 📜 Licencia

Proyecto privado -- Uso exclusivo de Francachela.

------------------------------------------------------------------------

📌 **Swagger disponible en:**\
http://localhost:3000/api
