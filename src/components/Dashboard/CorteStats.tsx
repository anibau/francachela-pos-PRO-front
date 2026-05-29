import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, DollarSign, ShoppingCart, BarChart3, Calendar, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { httpClient } from '@/services/httpClient';
import { API_ENDPOINTS } from '@/config/api';
import type { CorteEstadisticas } from '@/types';

export default function CorteStats() {
  const [stats, setStats] = useState<CorteEstadisticas | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | 'month'>('month');

  // Función para obtener fechas según el período seleccionado
  const getDateRange = (period: '7d' | '30d' | 'month') => {
    const today = new Date();
    let fechaInicio: Date;
    let fechaFin: Date = today;

    switch (period) {
      case '7d':
        fechaInicio = new Date(today);
        fechaInicio.setDate(today.getDate() - 7);
        break;
      case '30d':
        fechaInicio = new Date(today);
        fechaInicio.setDate(today.getDate() - 30);
        break;
      case 'month':
      default:
        // Mes actual completo
        fechaInicio = new Date(today.getFullYear(), today.getMonth(), 1);
        fechaFin = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        break;
    }

    const formatDate = (date: Date) => {
      return date.toISOString().split('T')[0] + ' 00:00:00';
    };

    return {
      fechaInicio: formatDate(fechaInicio),
      fechaFin: formatDate(fechaFin),
    };
  };

  // Función para cargar estadísticas
  const loadStats = async (period: '7d' | '30d' | 'month' = selectedPeriod) => {
    setIsLoading(true);
    try {
      const { fechaInicio, fechaFin } = getDateRange(period);
      
      const queryParams = new URLSearchParams();
      queryParams.append('fechaInicio', fechaInicio);
      queryParams.append('fechaFin', fechaFin);

      const url = `${API_ENDPOINTS.CORTE.STATISTICS}?${queryParams.toString()}`;
      const data = await httpClient.get<CorteEstadisticas>(url);
      
      setStats(data);
    } catch (error) {
      console.error('Error loading corte statistics:', error);
      toast.error('Error al cargar estadísticas de corte');
    } finally {
      setIsLoading(false);
    }
  };

  // Cargar datos al montar el componente y cuando cambie el período
  useEffect(() => {
    loadStats();
  }, [selectedPeriod]);

  // Función para cambiar período
  const handlePeriodChange = (period: '7d' | '30d' | 'month') => {
    setSelectedPeriod(period);
  };

  // Función para formatear moneda
  const formatCurrency = (amount: number) => {
    return `S/ ${amount.toFixed(2)}`;
  };

  // Función para obtener color según utilidad
  const getUtilityColor = (utilidad: number) => {
    if (utilidad > 0) return 'text-green-600';
    if (utilidad < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Estadísticas de Corte
          </CardTitle>
          <div className="flex items-center gap-2">
            {/* Filtros de período */}
            <div className="flex gap-1">
              <Button
                variant={selectedPeriod === '7d' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handlePeriodChange('7d')}
              >
                7d
              </Button>
              <Button
                variant={selectedPeriod === '30d' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handlePeriodChange('30d')}
              >
                30d
              </Button>
              <Button
                variant={selectedPeriod === 'month' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handlePeriodChange('month')}
              >
                Mes
              </Button>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => loadStats()}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="text-center">
              <BarChart3 className="h-8 w-8 animate-pulse mx-auto mb-2 text-primary" />
              <p className="text-sm text-muted-foreground">Cargando estadísticas...</p>
            </div>
          </div>
        ) : stats ? (
          <div className="space-y-6">
            {/* Métricas principales */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <DollarSign className="h-6 w-6 mx-auto mb-2 text-green-600" />
                <p className="text-sm text-muted-foreground">Ingresos Totales</p>
                <p className="text-xl font-bold text-green-600">
                  {formatCurrency(stats.ingresosTotales)}
                </p>
              </div>
              
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <BarChart3 className="h-6 w-6 mx-auto mb-2 text-red-600" />
                <p className="text-sm text-muted-foreground">Gastos Totales</p>
                <p className="text-xl font-bold text-red-600">
                  {formatCurrency(stats.gastosTotales)}
                </p>
              </div>
              
              <div className={`text-center p-4 rounded-lg ${stats.utilidadNeta >= 0 ? 'bg-blue-50' : 'bg-orange-50'}`}>
                <TrendingUp className={`h-6 w-6 mx-auto mb-2 ${getUtilityColor(stats.utilidadNeta)}`} />
                <p className="text-sm text-muted-foreground">Utilidad Neta</p>
                <p className={`text-xl font-bold ${getUtilityColor(stats.utilidadNeta)}`}>
                  {formatCurrency(stats.utilidadNeta)}
                </p>
              </div>
              
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <ShoppingCart className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                <p className="text-sm text-muted-foreground">Cantidad Ventas</p>
                <p className="text-xl font-bold text-purple-600">
                  {stats.cantidadVentas}
                </p>
              </div>
              
              <div className="text-center p-4 bg-indigo-50 rounded-lg">
                <Calendar className="h-6 w-6 mx-auto mb-2 text-indigo-600" />
                <p className="text-sm text-muted-foreground">Promedio Venta</p>
                <p className="text-xl font-bold text-indigo-600">
                  {formatCurrency(stats.promedioVenta)}
                </p>
              </div>
            </div>

            {/* Información del período */}
            {stats.fechaInicio && stats.fechaFin && (
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>
                  Período: {new Date(stats.fechaInicio).toLocaleDateString()} - {new Date(stats.fechaFin).toLocaleDateString()}
                </span>
              </div>
            )}

            {/* Indicador de rentabilidad */}
            <div className="flex justify-center">
              <Badge 
                variant={stats.utilidadNeta >= 0 ? 'default' : 'destructive'}
                className="text-sm px-4 py-2"
              >
                {stats.utilidadNeta >= 0 ? '📈 Rentable' : '📉 Pérdidas'}
              </Badge>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <BarChart3 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg font-semibold mb-2">No hay datos disponibles</p>
            <p className="text-muted-foreground mb-4">
              No se encontraron estadísticas para el período seleccionado
            </p>
            <Button onClick={() => loadStats()} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Intentar de nuevo
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
