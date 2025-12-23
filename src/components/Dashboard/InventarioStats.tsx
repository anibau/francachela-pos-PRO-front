import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Package, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  BarChart3,
  Calendar,
  RefreshCw,
  DollarSign
} from "lucide-react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { inventarioService, type InventarioEstadisticas } from '@/services/inventarioService';
import { showErrorToast, showLoadingToast, dismissToast } from '@/utils/errorHandler';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function InventarioStats() {
  const [estadisticas, setEstadisticas] = useState<InventarioEstadisticas | null>(null);
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

  const loadEstadisticas = useCallback(async () => {
    setIsLoading(true);
    const loadingToastId = showLoadingToast('Cargando estadísticas de inventario...');
    
    try {
      const fechaInicio = `${dateRange.fechaInicio} 00:00:00`;
      const fechaFin = `${dateRange.fechaFin} 23:59:59`;
      
      const data = await inventarioService.getEstadisticas(fechaInicio, fechaFin);
      setEstadisticas(data);
    } catch (error) {
      showErrorToast(error, 'Error al cargar estadísticas de inventario');
    } finally {
      dismissToast(loadingToastId);
      setIsLoading(false);
    }
  }, [dateRange]);

  useEffect(() => {
    loadEstadisticas();
    // Agregar loadEstadisticas a las dependencias pero evitar loop infinito con useCallback
  }, [dateRange]);

  const handleDateRangeChange = (field: 'fechaInicio' | 'fechaFin', value: string) => {
    setDateRange(prev => ({ ...prev, [field]: value }));
  };

  const setQuickRange = (days: number) => {
    const fechaFin = new Date().toISOString().split('T')[0];
    const fechaInicio = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    setDateRange({ fechaInicio, fechaFin });
  };

  const resetToCurrentMonth = () => {
    setDateRange(getMonthDates());
  };

  // Función para formatear moneda
  const formatCurrency = (amount: number) => `S/${amount.toFixed(2)}`;

  // Preparar datos para gráficos
  const movimientosPorTipoData = estadisticas ? [
    { name: 'Entradas', value: estadisticas.movimientosPorTipo.ENTRADA, color: '#00C49F' },
    { name: 'Ventas', value: estadisticas.movimientosPorTipo.VENTA, color: '#0088FE' },
    { name: 'Devoluciones', value: estadisticas.movimientosPorTipo.DEVOLUCION, color: '#FFBB28' }
  ] : [];

  const movimientosPorCajeroData = estadisticas ? 
    Object.entries(estadisticas.movimientosPorCajero).map(([cajero, cantidad]) => ({
      cajero,
      cantidad
    })) : [];

  const productosMasMovidosData = estadisticas ?
    Object.entries(estadisticas.productosMasMovidos)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([producto, cantidad]) => ({
        producto: producto.length > 20 ? producto.substring(0, 20) + '...' : producto,
        cantidad
      })) : [];

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Estadísticas de Inventario
          </CardTitle>
          <Button 
            onClick={loadEstadisticas} 
            disabled={isLoading}
            size="sm"
            variant="outline"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
        </div>
        
        {/* Controles de fecha */}
        <div className="flex flex-col sm:flex-row gap-4 items-end">
          <div className="flex gap-2 items-end">
            <div>
              <Label htmlFor="fechaInicio" className="text-xs">Desde</Label>
              <Input
                id="fechaInicio"
                type="date"
                value={dateRange.fechaInicio}
                onChange={(e) => handleDateRangeChange('fechaInicio', e.target.value)}
                className="w-auto text-xs"
              />
            </div>
            <div>
              <Label htmlFor="fechaFin" className="text-xs">Hasta</Label>
              <Input
                id="fechaFin"
                type="date"
                value={dateRange.fechaFin}
                onChange={(e) => handleDateRangeChange('fechaFin', e.target.value)}
                className="w-auto text-xs"
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
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">Total Movimientos</p>
                      <p className="text-lg font-bold">{estadisticas.totalMovimientos}</p>
                    </div>
                    <BarChart3 className="h-4 w-4 text-blue-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">Entradas</p>
                      <p className="text-lg font-bold text-green-600">{estadisticas.entradas}</p>
                    </div>
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">Salidas</p>
                      <p className="text-lg font-bold text-red-600">{estadisticas.salidas}</p>
                    </div>
                    <TrendingDown className="h-4 w-4 text-red-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">Ajustes</p>
                      <p className="text-lg font-bold text-orange-600">{estadisticas.ajustes}</p>
                    </div>
                    <AlertTriangle className="h-4 w-4 text-orange-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">Valor Entradas</p>
                      <p className="text-lg font-bold text-green-600">
                        {formatCurrency(estadisticas.valorTotalEntradas)}
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
                      <p className="text-xs text-muted-foreground">Valor Salidas</p>
                      <p className="text-lg font-bold text-red-600">
                        {formatCurrency(estadisticas.valorTotalSalidas)}
                      </p>
                    </div>
                    <DollarSign className="h-4 w-4 text-red-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Gráfico de movimientos por tipo */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Movimientos por Tipo</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={movimientosPorTipoData}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {movimientosPorTipoData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex justify-center gap-4 mt-2">
                    {movimientosPorTipoData.map((entry, index) => (
                      <div key={index} className="flex items-center gap-1">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: entry.color }}
                        />
                        <span className="text-xs">{entry.name}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Top 5 productos más movidos */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Top 5 Productos Más Movidos</CardTitle>
                </CardHeader>
                <CardContent>
                  {productosMasMovidosData.length > 0 ? (
                    <div className="space-y-2">
                      {productosMasMovidosData.map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <span className="text-sm font-medium">{item.producto}</span>
                          <Badge variant="secondary">{item.cantidad}</Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No hay datos de productos
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Gráfico de movimientos por cajero */}
            {movimientosPorCajeroData.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Movimientos por Cajero</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={movimientosPorCajeroData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="cajero" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="cantidad" fill="#0088FE" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}
          </>
        ) : (
          <div className="text-center py-8">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No hay datos disponibles</p>
            <Button onClick={loadEstadisticas} className="mt-2" size="sm">
              Cargar datos
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
