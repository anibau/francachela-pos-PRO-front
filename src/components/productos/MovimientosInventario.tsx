import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, Filter, Search } from "lucide-react";

interface MovimientosInventarioProps {
  // Movimientos del día actual (Req 4)
  movimientosHoy: any[];
  totalMovimientosHoy: number;
  isLoadingMovimientosHoy: boolean;
  
  // Movimientos por tipo (Req 5)
  selectedTipoMovimiento: string;
  movimientosPorTipo: any[];
  isLoadingMovimientosTipo: boolean;
  
  // Movimientos por rango de fechas (Req 6)
  movimientosRango: any[];
  isLoadingMovimientosRango: boolean;
  fechaInicioMovimientos: string;
  fechaFinMovimientos: string;
}

export const MovimientosInventario: React.FC<MovimientosInventarioProps> = ({
  movimientosHoy,
  totalMovimientosHoy,
  isLoadingMovimientosHoy,
  selectedTipoMovimiento,
  movimientosPorTipo,
  isLoadingMovimientosTipo,
  movimientosRango,
  isLoadingMovimientosRango,
  fechaInicioMovimientos,
  fechaFinMovimientos,
}) => {
  // Funciones auxiliares para formateo
  const formatCurrency = (amount: number | string) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return `S/${num.toFixed(2)}`;
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-PE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('es-PE', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Movimientos del Día Actual - REQUERIMIENTO 4 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Movimientos de Hoy
            <Badge variant="outline" className="ml-2">
              Total: {totalMovimientosHoy}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingMovimientosHoy ? (
            <div className="flex items-center justify-center h-32">
              <div className="text-center">
                <Package className="h-8 w-8 animate-spin mx-auto mb-2 text-primary" />
                <p>Cargando movimientos de hoy...</p>
              </div>
            </div>
          ) : movimientosHoy.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2 font-semibold">Hora</th>
                    <th className="text-left p-2 font-semibold">Código</th>
                    <th className="text-left p-2 font-semibold">Descripción</th>
                    <th className="text-left p-2 font-semibold">Costo</th>
                    <th className="text-left p-2 font-semibold">Precio Venta</th>
                    <th className="text-left p-2 font-semibold">Stock Anterior</th>
                    <th className="text-left p-2 font-semibold">Stock Nuevo</th>
                    <th className="text-left p-2 font-semibold">Tipo</th>
                    <th className="text-left p-2 font-semibold">Cantidad</th>
                    <th className="text-left p-2 font-semibold">Cajero</th>
                    <th className="text-left p-2 font-semibold">Observaciones</th>
                  </tr>
                </thead>
                <tbody>
                  {movimientosHoy.map((movimiento) => (
                    <tr key={movimiento.id} className="border-b hover:bg-muted/50">
                      <td className="p-2 text-sm">
                        {formatTime(movimiento.hora)}
                      </td>
                      <td className="p-2 text-sm font-mono">
                        {movimiento.codigoBarra}
                      </td>
                      <td className="p-2 font-medium">
                        {movimiento.descripcion}
                      </td>
                      <td className="p-2">
                        {formatCurrency(movimiento.costo)}
                      </td>
                      <td className="p-2">
                        {formatCurrency(movimiento.precioVenta)}
                      </td>
                      <td className="p-2 text-center">
                        {movimiento.existenciaAnterior}
                      </td>
                      <td className="p-2 text-center font-semibold">
                        {movimiento.existenciaNueva}
                      </td>
                      <td className="p-2">
                        <Badge 
                          variant={
                            movimiento.tipo === 'VENTA' ? 'destructive' :
                            movimiento.tipo === 'ENTRADA' ? 'default' :
                            'secondary'
                          }
                        >
                          {movimiento.tipo}
                        </Badge>
                      </td>
                      <td className="p-2 text-center">
                        {movimiento.cantidad}
                      </td>
                      <td className="p-2 text-sm">
                        {movimiento.cajero}
                      </td>
                      <td className="p-2 text-sm text-muted-foreground">
                        {movimiento.observaciones}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg font-semibold mb-2">No hay movimientos hoy</p>
              <p className="text-muted-foreground">Los movimientos del día aparecerán aquí</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Movimientos por Tipo - REQUERIMIENTO 5 */}
      {selectedTipoMovimiento !== 'todos' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Movimientos de Tipo: {selectedTipoMovimiento}
              <Badge variant="outline" className="ml-2">
                Total: {movimientosPorTipo.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingMovimientosTipo ? (
              <div className="flex items-center justify-center h-32">
                <div className="text-center">
                  <Filter className="h-8 w-8 animate-spin mx-auto mb-2 text-primary" />
                  <p>Cargando movimientos por tipo...</p>
                </div>
              </div>
            ) : movimientosPorTipo.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2 font-semibold">Hora</th>
                      <th className="text-left p-2 font-semibold">Código</th>
                      <th className="text-left p-2 font-semibold">Descripción</th>
                      <th className="text-left p-2 font-semibold">Costo</th>
                      <th className="text-left p-2 font-semibold">Precio Venta</th>
                      <th className="text-left p-2 font-semibold">Stock Anterior</th>
                      <th className="text-left p-2 font-semibold">Stock Nuevo</th>
                      <th className="text-left p-2 font-semibold">Cantidad</th>
                      <th className="text-left p-2 font-semibold">Cajero</th>
                      <th className="text-left p-2 font-semibold">Observaciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {movimientosPorTipo.map((movimiento) => (
                      <tr key={movimiento.id} className="border-b hover:bg-muted/50">
                        <td className="p-2 text-sm">
                          {formatDateTime(movimiento.hora)}
                        </td>
                        <td className="p-2 text-sm font-mono">
                          {movimiento.codigoBarra}
                        </td>
                        <td className="p-2 font-medium">
                          {movimiento.descripcion}
                        </td>
                        <td className="p-2">
                          {formatCurrency(movimiento.costo)}
                        </td>
                        <td className="p-2">
                          {formatCurrency(movimiento.precioVenta)}
                        </td>
                        <td className="p-2 text-center">
                          {movimiento.existenciaAnterior}
                        </td>
                        <td className="p-2 text-center font-semibold">
                          {movimiento.existenciaNueva}
                        </td>
                        <td className="p-2 text-center">
                          {movimiento.cantidad}
                        </td>
                        <td className="p-2 text-sm">
                          {movimiento.cajero}
                        </td>
                        <td className="p-2 text-sm text-muted-foreground">
                          {movimiento.observaciones}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8">
                <Filter className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-lg font-semibold mb-2">No hay movimientos de este tipo</p>
                <p className="text-muted-foreground">No se encontraron movimientos de tipo {selectedTipoMovimiento}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Movimientos por Rango de Fechas - REQUERIMIENTO 6 */}
      {movimientosRango.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Movimientos por Rango de Fechas
              <Badge variant="outline" className="ml-2">
                Total: {movimientosRango.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4 p-3 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                Mostrando movimientos entre {fechaInicioMovimientos} y {fechaFinMovimientos}
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2 font-semibold">Fecha/Hora</th>
                    <th className="text-left p-2 font-semibold">Código</th>
                    <th className="text-left p-2 font-semibold">Descripción</th>
                    <th className="text-left p-2 font-semibold">Costo</th>
                    <th className="text-left p-2 font-semibold">Precio Venta</th>
                    <th className="text-left p-2 font-semibold">Stock Anterior</th>
                    <th className="text-left p-2 font-semibold">Stock Nuevo</th>
                    <th className="text-left p-2 font-semibold">Tipo</th>
                    <th className="text-left p-2 font-semibold">Cantidad</th>
                    <th className="text-left p-2 font-semibold">Cajero</th>
                    <th className="text-left p-2 font-semibold">Observaciones</th>
                  </tr>
                </thead>
                <tbody>
                  {movimientosRango.map((movimiento) => (
                    <tr key={movimiento.id} className="border-b hover:bg-muted/50">
                      <td className="p-2 text-sm">
                        {formatDateTime(movimiento.hora)}
                      </td>
                      <td className="p-2 text-sm font-mono">
                        {movimiento.codigoBarra}
                      </td>
                      <td className="p-2 font-medium">
                        {movimiento.descripcion}
                      </td>
                      <td className="p-2">
                        {formatCurrency(movimiento.costo)}
                      </td>
                      <td className="p-2">
                        {formatCurrency(movimiento.precioVenta)}
                      </td>
                      <td className="p-2 text-center">
                        {movimiento.existenciaAnterior}
                      </td>
                      <td className="p-2 text-center font-semibold">
                        {movimiento.existenciaNueva}
                      </td>
                      <td className="p-2">
                        <Badge 
                          variant={
                            movimiento.tipo === 'VENTA' ? 'destructive' :
                            movimiento.tipo === 'ENTRADA' ? 'default' :
                            'secondary'
                          }
                        >
                          {movimiento.tipo}
                        </Badge>
                      </td>
                      <td className="p-2 text-center">
                        {movimiento.cantidad}
                      </td>
                      <td className="p-2 text-sm">
                        {movimiento.cajero}
                      </td>
                      <td className="p-2 text-sm text-muted-foreground">
                        {movimiento.observaciones}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

