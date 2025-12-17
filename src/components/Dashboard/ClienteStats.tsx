import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  User, 
  Search, 
  ShoppingCart, 
  DollarSign, 
  Star,
  Calendar,
  TrendingUp,
  Heart,
  RefreshCw
} from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { clientsService } from '@/services/clientsService';
import { showErrorToast, showLoadingToast, dismissToast, showSuccessToast } from '@/utils/errorHandler';

interface Metricas {
  totalCompras?: number;
  montoTotalGastado?: number;
  promedioCompra?: number;
  puntosAcumulados?: number;
  puntosCanjeados?: number;
  fechaPrimeraCompra?: string;
  fechaUltimaCompra?: string;
}

interface ComprasPorMes {
  mes?: string;
  cantidad?: number;
  monto?: number;
}

interface ProductoFavorito {
  productoId?: number;
  descripcion?: string;
  cantidadComprada?: number;
  montoGastado?: number;
}

interface ClienteEstadisticas {
  cliente?: {
    id?: number;
    nombre?: string;
    telefono?: string;
    email?: string;
    puntos?: number;
    fechaRegistro?: string;
  };
  metricas?: Metricas;
  comprasPorMes?: ComprasPorMes[];
  productosFavoritos?: ProductoFavorito[];
}

export default function ClienteStats() {
  const [clienteId, setClienteId] = useState('');
  const [estadisticas, setEstadisticas] = useState<ClienteEstadisticas | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const buscarEstadisticas = async () => {
    if (!clienteId.trim()) {
      showErrorToast('Por favor ingresa un ID de cliente válido');
      return;
    }

    const id = parseInt(clienteId.trim());
    if (isNaN(id) || id <= 0) {
      showErrorToast('El ID del cliente debe ser un número válido mayor a 0');
      return;
    }

    setIsLoading(true);
    setHasSearched(true);
    const loadingToastId = showLoadingToast('Buscando estadísticas del cliente...');
    
    try {
      const data = await clientsService.getEstadisticas(id);
      // Validar estructura mínima de datos
      if (!data || !data.cliente) {
        throw new Error('Datos inválidos recibidos del servidor');
      }
      setEstadisticas(data);
      showSuccessToast('Estadísticas cargadas correctamente');
    } catch (error) {
      setEstadisticas(null);
      showErrorToast(error, 'Error al cargar estadísticas del cliente');
    } finally {
      dismissToast(loadingToastId);
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      buscarEstadisticas();
    }
  };

  const formatCurrency = (amount: number) => `S/${amount.toFixed(2)}`;
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-PE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Estadísticas de Cliente
        </CardTitle>
        
        {/* Búsqueda por ID */}
        <div className="flex gap-2 items-end">
          <div className="flex-1">
            <Label htmlFor="clienteId" className="text-xs">ID del Cliente</Label>
            <Input
              id="clienteId"
              type="number"
              placeholder="Ingresa el ID del cliente"
              value={clienteId}
              onChange={(e) => setClienteId(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full"
              min="1"
            />
          </div>
          <Button 
            onClick={buscarEstadisticas} 
            disabled={isLoading || !clienteId.trim()}
            size="sm"
          >
            <Search className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Buscar
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <RefreshCw className="h-6 w-6 animate-spin mr-2" />
            Cargando estadísticas del cliente...
          </div>
        ) : estadisticas ? (
          <>
            {/* Información del cliente */}
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-lg">{estadisticas.cliente.nombre}</h3>
                    <p className="text-sm text-muted-foreground">{estadisticas.cliente.telefono}</p>
                    {estadisticas.cliente.email && (
                      <p className="text-sm text-muted-foreground">{estadisticas.cliente.email}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      Cliente desde: {formatDate(estadisticas.cliente.fechaRegistro)}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge variant="secondary" className="text-lg px-3 py-1">
                      <Star className="h-4 w-4 mr-1" />
                      {estadisticas.cliente.puntos} pts
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Métricas principales */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">Total Compras</p>
                      <p className="text-lg font-bold">{estadisticas?.metricas?.totalCompras ?? 0}</p>
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
                        {formatCurrency(estadisticas?.metricas?.montoTotalGastado ?? 0)}
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
                      <p className="text-xs text-muted-foreground">Promedio/Compra</p>
                      <p className="text-lg font-bold text-orange-600">
                        {formatCurrency(estadisticas?.metricas?.promedioCompra ?? 0)}
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
                      <p className="text-xs text-muted-foreground">Puntos Ganados</p>
                      <p className="text-lg font-bold text-purple-600">
                        {estadisticas?.metricas?.puntosAcumulados ?? 0}
                      </p>
                    </div>
                    <Star className="h-4 w-4 text-purple-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Fechas importantes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-blue-500" />
                    <div>
                      <p className="text-xs text-muted-foreground">Primera Compra</p>
                      <p className="text-sm font-medium">
                        {estadisticas?.metricas?.fechaPrimeraCompra 
                          ? formatDate(estadisticas.metricas.fechaPrimeraCompra)
                          : 'N/A'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-green-500" />
                    <div>
                      <p className="text-xs text-muted-foreground">Última Compra</p>
                      <p className="text-sm font-medium">
                        {estadisticas?.metricas?.fechaUltimaCompra
                          ? formatDate(estadisticas.metricas.fechaUltimaCompra)
                          : 'N/A'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Gráfico de compras por mes */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Compras por Mes</CardTitle>
                </CardHeader>
                <CardContent>
                  {(estadisticas?.comprasPorMes?.length ?? 0) > 0 ? (
                    <ResponsiveContainer width="100%" height={200}>
                      <LineChart data={estadisticas.comprasPorMes!}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="mes" />
                        <YAxis />
                        <Tooltip />
                        <Line 
                          type="monotone" 
                          dataKey="cantidad" 
                          stroke="#0088FE" 
                          strokeWidth={2}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      No hay datos de compras por mes
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Productos favoritos */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Heart className="h-4 w-4" />
                    Productos Favoritos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {(estadisticas?.productosFavoritos?.length ?? 0) > 0 ? (
                    <div className="space-y-2">
                      {estadisticas.productosFavoritos!.slice(0, 5).map((producto, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <div>
                            <p className="text-sm font-medium">
                              {producto.descripcion.length > 25 
                                ? producto.descripcion.substring(0, 25) + '...' 
                                : producto.descripcion
                              }
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatCurrency(producto.montoGastado)}
                            </p>
                          </div>
                          <Badge variant="secondary">{producto.cantidadComprada}</Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No hay productos favoritos
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Gráfico de monto gastado por mes */}
            {(estadisticas?.comprasPorMes?.length ?? 0) > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Monto Gastado por Mes</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={estadisticas.comprasPorMes!}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="mes" />
                      <YAxis />
                      <Tooltip formatter={(value) => [formatCurrency(Number(value)), 'Monto']} />
                      <Bar dataKey="monto" fill="#00C49F" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}
          </>
        ) : hasSearched ? (
          <div className="text-center py-8">
            <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No se encontraron estadísticas para este cliente</p>
            <p className="text-sm text-muted-foreground mt-2">
              Verifica que el ID sea correcto y que el cliente tenga compras registradas
            </p>
          </div>
        ) : (
          <div className="text-center py-8">
            <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Ingresa un ID de cliente para ver sus estadísticas</p>
            <p className="text-sm text-muted-foreground mt-2">
              Podrás ver métricas de compras, productos favoritos y más
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
