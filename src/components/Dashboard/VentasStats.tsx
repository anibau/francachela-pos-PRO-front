import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  DollarSign, 
  TrendingUp, 
  ShoppingCart, 
  Users,
  Calendar,
  RefreshCw,
  Gift,
  Percent,
  Star,
  Package
} from "lucide-react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { salesService } from '@/services/salesService';
import { showErrorToast, showLoadingToast, dismissToast } from '@/utils/errorHandler';
import type { VentasEstadisticasBackend } from '@/types';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d'];

export default function VentasStats() {
  const [estadisticas, setEstadisticas] = useState<VentasEstadisticasBackend | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Interfaz para manejo consistente de fechas
  interface DateRange {
    fechaInicio: string;
    fechaFin: string;
  }

  // Función auxiliar para obtener fechas del mes actual
  const getMonthDates = (): DateRange => {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    
    const formatDateOnly = (date: Date) => date.toISOString().split('T')[0];
    
    return {
      fechaInicio: formatDateOnly(firstDay),
      fechaFin: formatDateOnly(lastDay)
    };
  };

  const [dateRange, setDateRange] = useState<DateRange>(() => {
    // Inicializar con fechas del mes actual
    return getMonthDates();
  });

  // Función para formatear moneda
  const formatCurrency = (amount: number) => `S/${amount.toFixed(2)}`;

  // Función para formatear fecha
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-PE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const loadEstadisticas = useCallback(async () => {
    setIsLoading(true);
    const loadingToastId = showLoadingToast('Cargando estadísticas de ventas...');
    
    try {
      // Formatear fechas con hora para el backend (YYYY-MM-DD HH:mm:ss)
      const fechaInicio = `${dateRange.fechaInicio} 00:00:00`;
      const fechaFin = `${dateRange.fechaFin} 23:59:59`;
      
      const data = await salesService.getEstadisticas(fechaInicio, fechaFin);
      setEstadisticas(data);
    } catch (error) {
      console.error('Error loading sales statistics:', error);
      setEstadisticas(null);
      showErrorToast(error instanceof Error ? error.message : 'Error al cargar las estadísticas de ventas');
    } finally {
      setIsLoading(false);
      dismissToast(loadingToastId);
    }
  }, [dateRange]);

  // Cargar estadísticas al montar el componente
  useEffect(() => {
    loadEstadisticas();
  }, [loadEstadisticas]);

  // Función para establecer rangos rápidos
  const setQuickRange = (days: number) => {
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - days + 1);
    
    const formatDateOnly = (date: Date) => date.toISOString().split('T')[0];
    
    setDateRange({
      fechaInicio: formatDateOnly(startDate),
      fechaFin: formatDateOnly(today)
    });
  };

  const resetToCurrentMonth = () => {
    setDateRange(getMonthDates());
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Estadísticas de Ventas
        </CardTitle>
        
        {/* Controles de fecha */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
          <div className="flex gap-4">
            <div className="space-y-1">
              <Label htmlFor="fechaInicio" className="text-xs">Fecha Inicio</Label>
              <Input
                id="fechaInicio"
                type="date"
                value={dateRange.fechaInicio}
                onChange={(e) => setDateRange(prev => ({ ...prev, fechaInicio: e.target.value }))}
                className="w-40"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="fechaFin" className="text-xs">Fecha Fin</Label>
              <Input
                id="fechaFin"
                type="date"
                value={dateRange.fechaFin}
                onChange={(e) => setDateRange(prev => ({ ...prev, fechaFin: e.target.value }))}
                className="w-40"
              />
            </div>
            <Button onClick={loadEstadisticas} size="sm">
              <Calendar className="h-4 w-4 mr-1" />
              Aplicar
            </Button>
          </div>
          
          {/* Botones de rango rápido */}
          <div className="flex gap-1">
            <Button variant="outline" size="sm" onClick={() => setQuickRange(7)}>7d</Button>
            <Button variant="outline" size="sm" onClick={() => setQuickRange(30)}>30d</Button>
            <Button variant="outline" size="sm" onClick={() => setQuickRange(90)}>90d</Button>
            <Button variant="outline" size="sm" onClick={resetToCurrentMonth} title="Mes Actual">Mes</Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <RefreshCw className="h-6 w-6 animate-spin mr-2" />
            Cargando estadísticas...
          </div>
        ) : estadisticas ? (
          <>
            {/* Cards de métricas principales */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">Total Ventas</p>
                      <p className="text-lg font-bold">{estadisticas.totalVentas || 0}</p>
                    </div>
                    <ShoppingCart className="h-4 w-4 text-blue-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">Monto Total</p>
                      <p className="text-lg font-bold text-green-600">
                        {formatCurrency(estadisticas.totalMonto || 0)}
                      </p>
                    </div>
                    <DollarSign className="h-4 w-4 text-green-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">Promedio Venta</p>
                      <p className="text-lg font-bold text-orange-600">
                        {formatCurrency(estadisticas.promedioVenta || 0)}
                      </p>
                    </div>
                    <TrendingUp className="h-4 w-4 text-orange-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">Descuentos</p>
                      <p className="text-lg font-bold text-red-600">
                        {formatCurrency(estadisticas.totalDescuentos || 0)}
                      </p>
                    </div>
                    <Percent className="h-4 w-4 text-red-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Segunda fila de métricas */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">Recargos</p>
                      <p className="text-lg font-bold text-blue-600">
                        {formatCurrency(estadisticas.totalRecargos || 0)}
                      </p>
                    </div>
                    <TrendingUp className="h-4 w-4 text-blue-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">Puntos Otorgados</p>
                      <p className="text-lg font-bold text-yellow-600">
                        {estadisticas.totalPuntosOtorgados || 0}
                      </p>
                    </div>
                    <Gift className="h-4 w-4 text-yellow-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">Puntos Usados</p>
                      <p className="text-lg font-bold text-purple-600">
                        {estadisticas.totalPuntosUsados || 0}
                      </p>
                    </div>
                    <Star className="h-4 w-4 text-purple-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">Productos Vendidos</p>
                      <p className="text-lg font-bold text-indigo-600">
                        {estadisticas.topProductos?.length || 0}
                      </p>
                    </div>
                    <Package className="h-4 w-4 text-indigo-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Gráficos y visualizaciones */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Gráfico de Ventas por Método de Pago */}
              {(Object.keys(estadisticas.ventasPorMetodo || {}).length > 0) ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Ventas por Método de Pago</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie
                          data={Object.entries(estadisticas.ventasPorMetodo).map(([metodo, data]) => ({
                            metodo,
                            montoTotal: data.montoTotal,
                            cantidadVentas: data.cantidadVentas
                          }))}
                          dataKey="montoTotal"
                          nameKey="metodo"
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          label={({ metodo, percent }) => `${metodo} ${((Number(percent) || 0) * 100).toFixed(0)}%`}
                        >
                          {Object.entries(estadisticas.ventasPorMetodo).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              ) : null}

              {/* Gráfico de Ventas por Tipo */}
              {(Object.keys(estadisticas.ventasPorTipo || {}).length > 0) ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Ventas por Tipo</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={Object.entries(estadisticas.ventasPorTipo).map(([tipo, data]) => ({
                        tipo: tipo === 'undefined' ? 'Sin Tipo' : tipo,
                        cantidadVentas: data.cantidadVentas,
                        montoTotal: data.montoTotal
                      }))}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="tipo" />
                        <YAxis />
                        <Tooltip formatter={(value, name) => [
                          name === 'montoTotal' ? formatCurrency(Number(value)) : value,
                          name === 'montoTotal' ? 'Monto' : 'Cantidad'
                        ]} />
                        <Bar dataKey="cantidadVentas" fill="#0088FE" name="cantidadVentas" />
                        <Bar dataKey="montoTotal" fill="#00C49F" name="montoTotal" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              ) : null}
            </div>

            {/* Tabla de Top Productos */}
            {(estadisticas.topProductos?.length > 0) ? (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    Top Productos Más Vendidos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {estadisticas.topProductos.slice(0, 10).map((producto, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Badge variant="secondary" className="w-8 h-8 rounded-full flex items-center justify-center">
                            {index + 1}
                          </Badge>
                          <div>
                            <p className="text-sm font-medium">
                              {producto.descripcion.length > 40 
                                ? producto.descripcion.substring(0, 40) + '...' 
                                : producto.descripcion
                              }
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Código: {producto.codigoBarra}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-green-600">
                            {formatCurrency(producto.monto)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {producto.cantidad} unidades
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : null}

            {/* Información del rango de fechas */}
            <div className="text-center text-sm text-muted-foreground">
              Estadísticas del {formatDate(dateRange.fechaInicio)} al {formatDate(dateRange.fechaFin)}
              {estadisticas.fechaGeneracion && (
                <span className="block mt-1">
                  Generado el {formatDate(estadisticas.fechaGeneracion)}
                </span>
              )}
            </div>
          </>
        ) : (
          <div className="text-center py-8">
            <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No se pudieron cargar las estadísticas</p>
            <p className="text-sm text-muted-foreground mt-2">
              Verifica la conexión y vuelve a intentar
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
