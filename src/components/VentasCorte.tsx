import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Calculator, 
  TrendingUp, 
  ShoppingCart, 
  DollarSign, 
  Star,
  Calendar,
  CreditCard,
  Truck,
  Store,
  RefreshCw,
  FileText,
  Ban
} from "lucide-react";
import { PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { httpClient } from '@/services/httpClient';
import { showErrorToast, showLoadingToast, dismissToast, showSuccessToast } from '@/utils/errorHandler';
import type { VentasCorte, PaymentMethod } from '@/types';

const PAYMENT_COLORS: Record<PaymentMethod, string> = {
  EFECTIVO: '#00C49F',
  YAPE: '#8884D8',
  PLIN: '#0088FE',
  TARJETA: '#FF8042'
};

const TIPO_COMPRA_COLORS = {
  LOCAL: '#00C49F',
  DELIVERY: '#FF8042'
};

export default function VentasCorte() {
  const [ventasCorte, setVentasCorte] = useState<VentasCorte | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [dateRange, setDateRange] = useState({
    fechaInicio: new Date().toISOString().split('T')[0], // Hoy
    fechaFin: new Date().toISOString().split('T')[0] // Hoy
  });

  const loadVentasCorte = async () => {
    setIsLoading(true);
    const loadingToastId = showLoadingToast('Cargando corte de ventas...');
    
    try {
      const params = new URLSearchParams({
        fechaInicio: `${dateRange.fechaInicio} 00:00:00`,
        fechaFin: `${dateRange.fechaFin} 23:59:59`
      });

      const response = await httpClient.get<VentasCorte>(`/ventas/corte?${params.toString()}`);
      setVentasCorte(response);
      showSuccessToast('Corte de ventas cargado correctamente');
    } catch (error) {
      showErrorToast(error, 'Error al cargar el corte de ventas');
    } finally {
      dismissToast(loadingToastId);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadVentasCorte();
  }, []);

  const handleDateRangeChange = (field: 'fechaInicio' | 'fechaFin', value: string) => {
    setDateRange(prev => ({ ...prev, [field]: value }));
  };

  const setQuickRange = (days: number) => {
    const fechaFin = new Date().toISOString().split('T')[0];
    const fechaInicio = new Date(Date.now() - (days - 1) * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    setDateRange({ fechaInicio, fechaFin });
  };

  const formatCurrency = (amount: number) => `S/${amount.toFixed(2)}`;
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-PE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Preparar datos para gráficos
  const metodosPagoData = ventasCorte ? 
    Object.entries(ventasCorte.desgloseMetodosPago).map(([metodo, data]) => ({
      name: metodo,
      cantidad: data.cantidad,
      monto: data.monto,
      color: PAYMENT_COLORS[metodo as PaymentMethod] || '#8884D8'
    })).filter(item => item.cantidad > 0) : [];

  const tipoCompraData = ventasCorte ?
    Object.entries(ventasCorte.desgloseTipoCompra).map(([tipo, data]) => ({
      name: tipo,
      cantidad: data.cantidad,
      monto: data.monto,
      color: TIPO_COMPRA_COLORS[tipo as keyof typeof TIPO_COMPRA_COLORS] || '#8884D8'
    })).filter(item => item.cantidad > 0) : [];

  const ventasPorDiaData = ventasCorte?.ventasPorDia.map(item => ({
    ...item,
    fecha: formatDate(item.fecha)
  })) || [];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Corte de Ventas
            </CardTitle>
            <Button 
              onClick={loadVentasCorte} 
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
              <Button onClick={loadVentasCorte} size="sm">
                <Calendar className="h-4 w-4 mr-1" />
                Aplicar
              </Button>
            </div>
            
            {/* Botones de rango rápido */}
            <div className="flex gap-1">
              <Button variant="outline" size="sm" onClick={() => setQuickRange(1)}>Hoy</Button>
              <Button variant="outline" size="sm" onClick={() => setQuickRange(7)}>7d</Button>
              <Button variant="outline" size="sm" onClick={() => setQuickRange(30)}>30d</Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <RefreshCw className="h-6 w-6 animate-spin mr-2" />
              Cargando corte de ventas...
            </div>
          ) : ventasCorte ? (
            <>
              {/* Métricas principales */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="bg-green-50 border-green-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground">Total Ventas</p>
                        <p className="text-lg font-bold text-green-700">
                          {formatCurrency(ventasCorte.totalVentas)}
                        </p>
                      </div>
                      <DollarSign className="h-4 w-4 text-green-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground">Transacciones</p>
                        <p className="text-lg font-bold text-blue-700">{ventasCorte.numeroTransacciones}</p>
                      </div>
                      <ShoppingCart className="h-4 w-4 text-blue-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-orange-50 border-orange-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground">Ticket Promedio</p>
                        <p className="text-lg font-bold text-orange-700">
                          {formatCurrency(ventasCorte.ticketPromedio)}
                        </p>
                      </div>
                      <TrendingUp className="h-4 w-4 text-orange-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-purple-50 border-purple-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground">Puntos Otorgados</p>
                        <p className="text-lg font-bold text-purple-700">{ventasCorte.puntosOtorgados}</p>
                      </div>
                      <Star className="h-4 w-4 text-purple-500" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Métricas secundarias */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground">Descuentos</p>
                        <p className="text-sm font-semibold text-red-600">
                          {formatCurrency(ventasCorte.totalDescuentos)}
                        </p>
                      </div>
                      <FileText className="h-4 w-4 text-red-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground">Puntos Canjeados</p>
                        <p className="text-sm font-semibold">{ventasCorte.puntosCanjeados}</p>
                      </div>
                      <Star className="h-4 w-4 text-yellow-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground">Ventas Anuladas</p>
                        <p className="text-sm font-semibold text-red-600">{ventasCorte.ventasAnuladas}</p>
                      </div>
                      <Ban className="h-4 w-4 text-red-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground">Monto Anulado</p>
                        <p className="text-sm font-semibold text-red-600">
                          {formatCurrency(ventasCorte.montoVentasAnuladas)}
                        </p>
                      </div>
                      <DollarSign className="h-4 w-4 text-red-500" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Gráfico de métodos de pago */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      Métodos de Pago
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {metodosPagoData.length > 0 ? (
                      <>
                        <ResponsiveContainer width="100%" height={200}>
                          <PieChart>
                            <Pie
                              data={metodosPagoData}
                              cx="50%"
                              cy="50%"
                              innerRadius={40}
                              outerRadius={80}
                              paddingAngle={5}
                              dataKey="monto"
                            >
                              {metodosPagoData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip formatter={(value) => [formatCurrency(Number(value)), 'Monto']} />
                          </PieChart>
                        </ResponsiveContainer>
                        <div className="grid grid-cols-2 gap-2 mt-4">
                          {metodosPagoData.map((entry, index) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                              <div className="flex items-center gap-2">
                                <div 
                                  className="w-3 h-3 rounded-full" 
                                  style={{ backgroundColor: entry.color }}
                                />
                                <span className="text-xs font-medium">{entry.name}</span>
                              </div>
                              <div className="text-right">
                                <p className="text-xs font-semibold">{formatCurrency(entry.monto)}</p>
                                <p className="text-xs text-muted-foreground">{entry.cantidad} trans.</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-8">
                        No hay datos de métodos de pago
                      </p>
                    )}
                  </CardContent>
                </Card>

                {/* Gráfico de tipo de compra */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Store className="h-4 w-4" />
                      Tipo de Compra
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {tipoCompraData.length > 0 ? (
                      <>
                        <ResponsiveContainer width="100%" height={200}>
                          <PieChart>
                            <Pie
                              data={tipoCompraData}
                              cx="50%"
                              cy="50%"
                              innerRadius={40}
                              outerRadius={80}
                              paddingAngle={5}
                              dataKey="monto"
                            >
                              {tipoCompraData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip formatter={(value) => [formatCurrency(Number(value)), 'Monto']} />
                          </PieChart>
                        </ResponsiveContainer>
                        <div className="space-y-2 mt-4">
                          {tipoCompraData.map((entry, index) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                              <div className="flex items-center gap-2">
                                <div 
                                  className="w-3 h-3 rounded-full" 
                                  style={{ backgroundColor: entry.color }}
                                />
                                <span className="text-sm font-medium">
                                  {entry.name === 'LOCAL' ? 'En Local' : 'Delivery'}
                                </span>
                                {entry.name === 'DELIVERY' && <Truck className="h-3 w-3 text-muted-foreground" />}
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-semibold">{formatCurrency(entry.monto)}</p>
                                <p className="text-xs text-muted-foreground">{entry.cantidad} ventas</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-8">
                        No hay datos de tipo de compra
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Top productos */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Top Productos Vendidos</CardTitle>
                </CardHeader>
                <CardContent>
                  {ventasCorte.topProductos.length > 0 ? (
                    <div className="space-y-2">
                      {ventasCorte.topProductos.slice(0, 10).map((producto, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <Badge variant="secondary" className="w-8 h-8 rounded-full flex items-center justify-center">
                              {index + 1}
                            </Badge>
                            <div>
                              <p className="font-medium text-sm">
                                {producto.descripcion.length > 40 
                                  ? producto.descripcion.substring(0, 40) + '...' 
                                  : producto.descripcion
                                }
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {formatCurrency(producto.monto)} total
                              </p>
                            </div>
                          </div>
                          <Badge variant="outline" className="font-semibold">
                            {producto.cantidad} unid.
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No hay productos vendidos
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Gráfico de ventas por día */}
              {ventasPorDiaData.length > 1 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Ventas por Día</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={ventasPorDiaData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="fecha" />
                        <YAxis yAxisId="cantidad" orientation="left" />
                        <YAxis yAxisId="monto" orientation="right" />
                        <Tooltip 
                          formatter={(value, name) => [
                            name === 'monto' ? formatCurrency(Number(value)) : value,
                            name === 'monto' ? 'Monto' : 'Cantidad'
                          ]}
                        />
                        <Bar yAxisId="monto" dataKey="monto" fill="#00C49F" name="monto" />
                        <Line 
                          yAxisId="cantidad" 
                          type="monotone" 
                          dataKey="cantidad" 
                          stroke="#0088FE" 
                          strokeWidth={2}
                          name="cantidad"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <div className="text-center py-8">
              <Calculator className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No hay datos disponibles para el rango seleccionado</p>
              <Button onClick={loadVentasCorte} className="mt-2" size="sm">
                Cargar datos
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
