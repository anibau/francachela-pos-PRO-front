import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { TrendingDown, DollarSign, BarChart3, Calendar, RefreshCw } from "lucide-react";
import { toast } from "sonner";

interface GastosStatsData {
  totalGastos: number;
  totalMonto: number;
  promedioGasto: number;
  gastosPorCategoria: Record<string, number>;
  gastosPorMetodo: Record<string, number>;
  topProveedores: any[];
}

export const GastosStats: React.FC = () => {
  const [gastosData, setGastosData] = useState<GastosStatsData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');

  // Función para obtener fechas del mes actual
  const getMonthDates = () => {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    
    const formatDateOnly = (date: Date) => date.toISOString().split('T')[0];
    
    return {
      fechaInicio: formatDateOnly(firstDay),
      fechaFin: formatDateOnly(lastDay)
    };
  };

  // Cargar datos del mes actual al montar el componente
  useEffect(() => {
    const monthDates = getMonthDates();
    setFechaInicio(monthDates.fechaInicio);
    setFechaFin(monthDates.fechaFin);
    loadGastosStats(monthDates.fechaInicio, monthDates.fechaFin);
  }, []);

  const loadGastosStats = async (inicio: string, fin: string) => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('No hay sesión activa');
      }

      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
      const response = await fetch(
        `${API_BASE_URL}/gastos/estadisticas?fechaInicio=${inicio} 00:00:00&fechaFin=${fin} 23:59:59`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Error al cargar estadísticas de gastos');
      }

      const data = await response.json();
      setGastosData(data);
    } catch (error) {
      console.error('Error loading gastos stats:', error);
      toast.error('Error al cargar estadísticas de gastos');
      setGastosData(null);
    } finally {
      setIsLoading(false);
    }
  };

  const aplicarFiltros = () => {
    if (!fechaInicio || !fechaFin) {
      toast.error('Selecciona ambas fechas');
      return;
    }
    
    if (new Date(fechaFin) < new Date(fechaInicio)) {
      toast.error('La fecha fin debe ser mayor o igual a la fecha inicio');
      return;
    }

    loadGastosStats(fechaInicio, fechaFin);
  };

  const setRangoRapido = (dias: number) => {
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - dias + 1);
    
    const formatDateOnly = (date: Date) => date.toISOString().split('T')[0];
    
    const inicio = formatDateOnly(startDate);
    const fin = formatDateOnly(today);
    
    setFechaInicio(inicio);
    setFechaFin(fin);
    loadGastosStats(inicio, fin);
  };

  const formatCurrency = (amount: number) => {
    return `S/${amount.toFixed(2)}`;
  };

  return (
    <div className="space-y-6">
      {/* Filtros de fecha */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Estadísticas de Gastos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Filtros de rango de fechas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Fecha Inicio</Label>
                <Input 
                  type="date" 
                  value={fechaInicio}
                  onChange={(e) => setFechaInicio(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Fecha Fin</Label>
                <Input 
                  type="date" 
                  value={fechaFin}
                  onChange={(e) => setFechaFin(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>&nbsp;</Label>
                <Button 
                  onClick={aplicarFiltros}
                  disabled={isLoading || !fechaInicio || !fechaFin}
                  className="w-full"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                      Cargando...
                    </>
                  ) : (
                    <>
                      <Calendar className="h-4 w-4 mr-2" />
                      APLICAR
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Botones de rango rápido */}
            <div className="flex gap-2 flex-wrap">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setRangoRapido(7)}
                disabled={isLoading}
              >
                7 días
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  const monthDates = getMonthDates();
                  setFechaInicio(monthDates.fechaInicio);
                  setFechaFin(monthDates.fechaFin);
                  loadGastosStats(monthDates.fechaInicio, monthDates.fechaFin);
                }}
                disabled={isLoading}
              >
                Mes actual
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Estadísticas principales */}
      {gastosData && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Gastos</p>
                    <p className="text-2xl font-bold text-primary">
                      {gastosData.totalGastos}
                    </p>
                  </div>
                  <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <TrendingDown className="h-4 w-4 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Monto Total</p>
                    <p className="text-2xl font-bold text-red-600">
                      {formatCurrency(gastosData.totalMonto)}
                    </p>
                  </div>
                  <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center">
                    <DollarSign className="h-4 w-4 text-red-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Promedio por Gasto</p>
                    <p className="text-2xl font-bold text-orange-600">
                      {formatCurrency(gastosData.promedioGasto)}
                    </p>
                  </div>
                  <div className="h-8 w-8 bg-orange-100 rounded-full flex items-center justify-center">
                    <BarChart3 className="h-4 w-4 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Gastos por categoría */}
          <Card>
            <CardHeader>
              <CardTitle>Gastos por Categoría</CardTitle>
            </CardHeader>
            <CardContent>
              {Object.keys(gastosData.gastosPorCategoria).length > 0 ? (
                <div className="space-y-3">
                  {Object.entries(gastosData.gastosPorCategoria).map(([categoria, monto]) => (
                    <div key={categoria} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline">{categoria}</Badge>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{formatCurrency(monto)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-4">No hay gastos por categoría</p>
              )}
            </CardContent>
          </Card>

          {/* Gastos por método de pago */}
          <Card>
            <CardHeader>
              <CardTitle>Gastos por Método de Pago</CardTitle>
            </CardHeader>
            <CardContent>
              {Object.keys(gastosData.gastosPorMetodo).length > 0 ? (
                <div className="space-y-3">
                  {Object.entries(gastosData.gastosPorMetodo).map(([metodo, monto]) => (
                    <div key={metodo} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div className="flex items-center gap-3">
                        <Badge variant="secondary">{metodo}</Badge>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{formatCurrency(monto)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-4">No hay gastos por método</p>
              )}
            </CardContent>
          </Card>

          {/* Top proveedores */}
          <Card>
            <CardHeader>
              <CardTitle>Top Proveedores</CardTitle>
            </CardHeader>
            <CardContent>
              {gastosData.topProveedores.length > 0 ? (
                <div className="space-y-3">
                  {gastosData.topProveedores.map((proveedor, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div className="flex items-center gap-3">
                        <Badge variant="default">#{index + 1}</Badge>
                        <span className="font-medium">{proveedor.nombre}</span>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{formatCurrency(proveedor.monto)}</p>
                        <p className="text-sm text-muted-foreground">{proveedor.gastos} gastos</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-4">No hay proveedores registrados</p>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* Estado de carga */}
      {isLoading && !gastosData && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center h-32">
              <div className="text-center">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2 text-primary" />
                <p>Cargando estadísticas de gastos...</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

