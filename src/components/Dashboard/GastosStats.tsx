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
  Receipt,
  CreditCard,
  Building
} from "lucide-react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { expensesService } from '@/services/expensesService';
import { showErrorToast, showLoadingToast, dismissToast } from '@/utils/errorHandler';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d'];

interface GastosEstadisticas {
  totalGastos: number;
  totalMonto: number;
  promedioGasto: number;
  gastosPorCategoria: {
    [categoria: string]: number;
  };
  gastosPorMetodo: {
    [metodo: string]: number;
  };
  topProveedores: Array<{
    nombre: string;
    monto: number;
    cantidad: number;
  }>;
}

export default function GastosStats() {
  const [estadisticas, setEstadisticas] = useState<GastosEstadisticas | null>(null);
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
    const loadingToastId = showLoadingToast('Cargando estadísticas de gastos...');
    
    try {
      // Formatear fechas con hora para el backend (YYYY-MM-DD HH:mm:ss)
      const fechaInicio = `${dateRange.fechaInicio} 00:00:00`;
      const fechaFin = `${dateRange.fechaFin} 23:59:59`;
      
      const data = await expensesService.getEstadisticas(fechaInicio, fechaFin);
      setEstadisticas(data);
    } catch (error) {
      console.error('Error loading expenses statistics:', error);
      setEstadisticas(null);
      showErrorToast(error instanceof Error ? error.message : 'Error al cargar las estadísticas de gastos');
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
          <Receipt className="h-5 w-5" />
          Estadísticas de Gastos
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">Total Gastos</p>
                      <p className="text-lg font-bold">{estadisticas.totalGastos || 0}</p>
                    </div>
                    <Receipt className="h-4 w-4 text-red-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">Monto Total</p>
                      <p className="text-lg font-bold text-red-600">
                        {formatCurrency(estadisticas.totalMonto || 0)}
                      </p>
                    </div>
                    <DollarSign className="h-4 w-4 text-red-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">Promedio Gasto</p>
                      <p className="text-lg font-bold text-orange-600">
                        {formatCurrency(estadisticas.promedioGasto || 0)}
                      </p>
                    </div>
                    <TrendingUp className="h-4 w-4 text-orange-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Gráficos y visualizaciones */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Gráfico de Gastos por Categoría */}
              {(Object.keys(estadisticas.gastosPorCategoria || {}).length > 0) ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Gastos por Categoría</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie
                          data={Object.entries(estadisticas.gastosPorCategoria).map(([categoria, monto]) => ({
                            categoria,
                            monto
                          }))}
                          dataKey="monto"
                          nameKey="categoria"
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          fill="#8884d8"
                          label={({ categoria, monto }) => `${categoria}: ${formatCurrency(monto)}`}
                        >
                          {Object.entries(estadisticas.gastosPorCategoria).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Gastos por Categoría</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-center h-[250px] text-muted-foreground">
                      No hay datos de categorías
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Gráfico de Gastos por Método de Pago */}
              {(Object.keys(estadisticas.gastosPorMetodo || {}).length > 0) ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Gastos por Método de Pago</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={Object.entries(estadisticas.gastosPorMetodo).map(([metodo, monto]) => ({
                        metodo,
                        monto
                      }))}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="metodo" />
                        <YAxis tickFormatter={(value) => `S/${value}`} />
                        <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                        <Bar dataKey="monto" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Gastos por Método de Pago</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-center h-[250px] text-muted-foreground">
                      No hay datos de métodos de pago
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Top Proveedores */}
            {estadisticas.topProveedores && estadisticas.topProveedores.length > 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Building className="h-4 w-4" />
                    Top Proveedores
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {estadisticas.topProveedores.map((proveedor, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Badge variant="secondary" className="w-8 h-8 rounded-full flex items-center justify-center p-0">
                            {index + 1}
                          </Badge>
                          <div>
                            <p className="font-medium">{proveedor.nombre}</p>
                            <p className="text-sm text-muted-foreground">
                              {proveedor.cantidad} gasto{proveedor.cantidad !== 1 ? 's' : ''}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-red-600">{formatCurrency(proveedor.monto)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Building className="h-4 w-4" />
                    Top Proveedores
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-center h-32 text-muted-foreground">
                    No hay datos de proveedores
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Información del período */}
            <div className="text-center text-sm text-muted-foreground">
              Período: {formatDate(dateRange.fechaInicio)} - {formatDate(dateRange.fechaFin)}
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-32">
            <div className="text-center">
              <Receipt className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg font-semibold mb-2">No hay datos disponibles</p>
              <p className="text-muted-foreground">Selecciona un rango de fechas para ver las estadísticas</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
