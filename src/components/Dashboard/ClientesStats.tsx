import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Users, Star, Gift, Calendar, RefreshCw, ChevronLeft, ChevronRight, User, Search, ShoppingCart, DollarSign, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { dismissToast, showErrorToast, showLoadingToast, showSuccessToast } from '@/utils/errorHandler';
import { clientsService } from '@/services/clientsService';
import { API_ENDPOINTS } from '@/config/api';
import { httpClient } from '@/services/httpClient';

interface HistorialCompra {
  fecha: string;
  monto: number;
  ventaId: number;
  puntosGanados: number;
}

interface HistorialCanje {
  fecha: string;
  ventaId: number;
  descripcion: string;
  puntosUsados: number;
}

interface Cliente {
  id: number;
  nombres: string;
  apellidos: string;
  dni: string;
  fechaNacimiento: string;
  telefono: string;
  fechaRegistro: string;
  puntosAcumulados: number;
  historialCompras: HistorialCompra[];
  historialCanjes: HistorialCanje[];
  codigoCorto: string;
  direccion: string;
  activo: boolean;
  fechaCreacion: string;
  fechaActualizacion: string;
   esCumpleañosHoy: boolean;
  edad: number
}

interface EstadisticasCliente {
  totalCompras: number;
  totalGastado: number;
  totalCanjes: number;
  totalPuntosCanjeados: number;
  puntosDisponibles: number;
}

interface ClienteResponse {
  cliente: Cliente;
  estadisticas: EstadisticasCliente;
}

export const ClientesStats: React.FC = () => {
  const [topClientes, setTopClientes] = useState<Cliente[]>([]);
  const [clientesCumpleaneros, setClientesCumpleaneros] = useState<Cliente[]>([]);
  const [isLoadingTop, setIsLoadingTop] = useState(false);
  const [isLoadingCumpleaneros, setIsLoadingCumpleaneros] = useState(false);
  const [limitTop, setLimitTop] = useState(1);


    const [clienteDni, setClienteDni] = useState('');
    const [clienteData, setClienteData] = useState<ClienteResponse | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
  
  
  
  
    const buscarEstadisticas = async () => {
      if (!clienteDni.trim()) {
        showErrorToast('Por favor ingresa un DNI de cliente válido');
        return;
      }
  
      const dni = clienteDni.trim();
      if (dni.length < 8) {
        showErrorToast('El DNI debe tener al menos 8 dígitos');
        return;
      }
  
      setIsLoading(true);
      setHasSearched(true);
      const loadingToastId = showLoadingToast('Buscando estadísticas del cliente...');
      
      try {
        const data = await clientsService.getEstadisticas(dni);
        // Validar estructura mínima de datos
        if (!data || !data.cliente) {
          throw new Error('Datos inválidos recibidos del servidor');
        }
        setClienteData(data);
        showSuccessToast('Estadísticas cargadas correctamente');
      } catch (error) {
        setClienteData(null);
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
  
  // Paginación para cumpleañeros
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);

  useEffect(() => {
    loadTopClientes();
    loadClientesCumpleaneros();
  }, []);

  const loadTopClientes = async () => {
  setIsLoadingTop(true);
  try {
    const queryParams = new URLSearchParams();
    queryParams.append('limit', limitTop.toString());

    const url = `${API_ENDPOINTS.CLIENTS.TOP}?${queryParams.toString()}`;

    const response = await httpClient.get<any[]>(url);

    setTopClientes(Array.isArray(response) ? response : []);
  } catch (error) {
    console.error('Error loading top clientes:', error);
    toast.error('Error al cargar top clientes');
    setTopClientes([]);
  } finally {
    setIsLoadingTop(false);
  }
};


 const loadClientesCumpleaneros = async () => {
  setIsLoadingCumpleaneros(true);
  try {
    const response = await httpClient.get<any[]>(
      API_ENDPOINTS.CLIENTS.BIRTHDAYS
    );

    setClientesCumpleaneros(Array.isArray(response) ? response : []);
  } catch (error) {
    console.error('Error loading clientes cumpleañeros:', error);
    toast.error('Error al cargar clientes cumpleañeros');
    setClientesCumpleaneros([]);
  } finally {
    setIsLoadingCumpleaneros(false);
  }
};


  const aplicarLimitTop = () => {
    if (limitTop < 1) {
      toast.error('El límite debe ser mayor a 0');
      return;
    }
    loadTopClientes();
  };

  const formatCurrency = (amount: number) => {
    return `S/${amount.toFixed(2)}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-PE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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

  // Paginación para cumpleañeros
  const totalPages = Math.ceil(clientesCumpleaneros.length / itemsPerPage);
  const paginatedCumpleaneros = clientesCumpleaneros.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6">
      {/* Estadísticas de Cliente por DNI */}
      <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Estadísticas de Cliente
        </CardTitle>
        
        {/* Búsqueda por DNI */}
        <div className="flex gap-2 items-end">
          <div className="flex-1">
            <Label htmlFor="clienteDni" className="text-xs">DNI del Cliente</Label>
            <Input
              id="clienteDni"
              type="text"
              placeholder="Ingresa el DNI del cliente"
              value={clienteDni}
              onChange={(e) => setClienteDni(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full"
            />
          </div>
          <Button 
            onClick={buscarEstadisticas} 
            disabled={isLoading || !clienteDni.trim()}
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
        ) : clienteData ? (
          <>
            {/* Información del cliente */}
            <Card className={`${clienteData.cliente.esCumpleañosHoy ? 'bg-yellow-50 border-yellow-200' : 'bg-blue-50 border-blue-200'}`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-lg">
                        {clienteData.cliente.nombres} {clienteData.cliente.apellidos}
                      </h3>
                      {clienteData.cliente.esCumpleañosHoy && (
                        <Badge variant="secondary" className="bg-yellow-200 text-yellow-800">
                          🎂 ¡Cumpleaños!
                        </Badge>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">DNI:</p>
                        <p className="font-medium">{clienteData.cliente.dni}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Código:</p>
                        <p className="font-medium">{clienteData.cliente.codigoCorto}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Teléfono:</p>
                        <p className="font-medium">{clienteData.cliente.telefono}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Fecha Nacimiento:</p>
                        <p className="font-medium">{clienteData.cliente.fechaNacimiento}</p>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Cliente desde: {formatDate(clienteData.cliente.fechaRegistro)}
                    </p>
                  </div>
                  <div className="text-right space-y-2">
                    <Badge variant="secondary" className="text-lg px-3 py-1">
                      <Star className="h-4 w-4 mr-1" />
                      {clienteData.estadisticas.puntosDisponibles} pts
                    </Badge>
                    <p className="text-xs text-muted-foreground">
                      {clienteData.cliente.puntosAcumulados} acumulados
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Métricas principales */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">Total Compras</p>
                      <p className="text-lg font-bold">{clienteData.estadisticas.totalCompras}</p>
                    </div>
                    <ShoppingCart className="h-4 w-4 text-blue-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">Total Gastado</p>
                      <p className="text-lg font-bold text-green-600">
                        {formatCurrency(clienteData.estadisticas.totalGastado)}
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
                      <p className="text-xs text-muted-foreground">Total Canjes</p>
                      <p className="text-lg font-bold text-orange-600">
                        {clienteData.estadisticas.totalCanjes}
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
                      <p className="text-xs text-muted-foreground">Puntos Canjeados</p>
                      <p className="text-lg font-bold text-red-600">
                        {clienteData.estadisticas.totalPuntosCanjeados}
                      </p>
                    </div>
                    <Star className="h-4 w-4 text-red-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">Puntos Disponibles</p>
                      <p className="text-lg font-bold text-purple-600">
                        {clienteData.estadisticas.puntosDisponibles}
                      </p>
                    </div>
                    <Star className="h-4 w-4 text-purple-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Historial de Compras y Canjes */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Historial de Compras */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <ShoppingCart className="h-4 w-4 text-green-500" />
                    Historial de Compras
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {clienteData.cliente.historialCompras.length > 0 ? (
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {clienteData.cliente.historialCompras.map((compra, index) => (
                        <div key={index} className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                          <div>
                            <p className="text-sm font-medium">Venta #{compra.ventaId}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatDate(compra.fecha)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-green-600">
                              {formatCurrency(compra.monto)}
                            </p>
                            <p className="text-xs text-green-500">
                              +{compra.puntosGanados} pts
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No hay compras registradas
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Historial de Canjes */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Star className="h-4 w-4 text-red-500" />
                    Historial de Canjes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {clienteData.cliente.historialCanjes.length > 0 ? (
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {clienteData.cliente.historialCanjes.map((canje, index) => (
                        <div key={index} className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                          <div>
                            <p className="text-sm font-medium">{canje.descripcion}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatDate(canje.fecha)} - Venta #{canje.ventaId}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-red-600">
                              -{canje.puntosUsados} pts
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No hay canjes registrados
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>


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
            <p className="text-muted-foreground">Ingresa un DNI de cliente para ver sus estadísticas</p>
            <p className="text-sm text-muted-foreground mt-2">
              Podrás ver métricas de compras, productos favoritos y más
            </p>
          </div>
        )}
      </CardContent>
    </Card>
      {/* Top Clientes - REQUERIMIENTO 7d */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            Top Clientes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Control de límite */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Límite de clientes</Label>
                <Input 
                  type="number" 
                  value={limitTop}
                  onChange={(e) => setLimitTop(parseInt(e.target.value) || 1)}
                  min="1"
                  max="50"
                />
              </div>
              <div className="space-y-2">
                <Label>&nbsp;</Label>
                <Button 
                  onClick={aplicarLimitTop}
                  disabled={isLoadingTop}
                  className="w-full"
                >
                  {isLoadingTop ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                      Cargando...
                    </>
                  ) : (
                    <>
                      <Users className="h-4 w-4 mr-2" />
                      APLICAR
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Lista de top clientes */}
            {topClientes.length > 0 ? (
              <div className="space-y-4">
                {topClientes.map((cliente, index) => (
                  <Card key={cliente.id} className="border-l-4 border-l-primary">
                    <CardContent className="pt-6">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Información básica */}
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <Badge variant="default">#{index + 1}</Badge>
                            <div>
                              <h3 className="font-semibold text-lg">
                                {cliente.nombres} {cliente.apellidos}
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                DNI: {cliente.dni} | Código: {cliente.codigoCorto}
                              </p>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm text-muted-foreground">Teléfono</p>
                              <p className="font-medium">{cliente.telefono}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Puntos Acumulados</p>
                              <p className="font-semibold text-primary">{cliente.puntosAcumulados}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Fecha Nacimiento</p>
                              <p className="font-medium">{formatDate(cliente.fechaNacimiento)}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Fecha Registro</p>
                              <p className="font-medium">{formatDate(cliente.fechaRegistro)}</p>
                            </div>
                          </div>
                        </div>

                        {/* Historial de compras y canjes */}
                        <div className="space-y-4">
                          {/* Historial de Compras */}
                          <div>
                            <h4 className="font-semibold mb-2 flex items-center gap-2">
                              <Users className="h-4 w-4" />
                              Historial de Compras ({cliente.historialCompras.length})
                            </h4>
                            {cliente.historialCompras.length > 0 ? (
                              <div className="space-y-2 max-h-32 overflow-y-auto">
                                {cliente.historialCompras.map((compra, idx) => (
                                  <div key={idx} className="flex justify-between items-center p-2 bg-muted rounded text-sm">
                                    <div>
                                      <p className="font-medium">{formatDateTime(compra.fecha)}</p>
                                      <p className="text-muted-foreground">Venta #{compra.ventaId}</p>
                                    </div>
                                    <div className="text-right">
                                      <p className="font-semibold">{formatCurrency(compra.monto)}</p>
                                      <p className="text-primary text-xs">+{compra.puntosGanados} pts</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-muted-foreground text-sm">Sin compras registradas</p>
                            )}
                          </div>

                          {/* Historial de Canjes */}
                          <div>
                            <h4 className="font-semibold mb-2 flex items-center gap-2">
                              <Gift className="h-4 w-4" />
                              Historial de Canjes ({cliente.historialCanjes.length})
                            </h4>
                            {cliente.historialCanjes.length > 0 ? (
                              <div className="space-y-2 max-h-32 overflow-y-auto">
                                {cliente.historialCanjes.map((canje, idx) => (
                                  <div key={idx} className="flex justify-between items-center p-2 bg-muted rounded text-sm">
                                    <div>
                                      <p className="font-medium">{formatDateTime(canje.fecha)}</p>
                                      <p className="text-muted-foreground">{canje.descripcion}</p>
                                    </div>
                                    <div className="text-right">
                                      <p className="text-red-600 font-semibold">-{canje.puntosUsados} pts</p>
                                      <p className="text-muted-foreground text-xs">Venta #{canje.ventaId}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-muted-foreground text-sm">Sin canjes registrados</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-lg font-semibold mb-2">No hay clientes</p>
                <p className="text-muted-foreground">Los top clientes aparecerán aquí</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Clientes Cumpleañeros - REQUERIMIENTO 7e */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Clientes Cumpleañeros
            <Badge variant="outline" className="ml-2">
              Total: {clientesCumpleaneros.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingCumpleaneros ? (
            <div className="flex items-center justify-center h-32">
              <div className="text-center">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2 text-primary" />
                <p>Cargando clientes cumpleañeros...</p>
              </div>
            </div>
          ) : paginatedCumpleaneros.length > 0 ? (
            <div className="space-y-4">
              {/* Lista de cumpleañeros */}
              {paginatedCumpleaneros.map((cliente) => (
                <Card key={cliente.id} className="border-l-4 border-l-orange-500">
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center">
                          <Gift className="h-6 w-6 text-orange-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold">
                            {cliente.nombres} {cliente.apellidos}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            DNI: {cliente.dni} | Código: {cliente.codigoCorto}
                          </p>
                          <p className="text-sm text-orange-600 font-medium">
                            🎂 Cumpleaños: {formatDate(cliente.fechaNacimiento)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Puntos</p>
                        <p className="font-semibold text-primary">{cliente.puntosAcumulados}</p>
                        <p className="text-xs text-muted-foreground">
                          Tel: {cliente.telefono}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Paginación */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Mostrando {(currentPage - 1) * itemsPerPage + 1} a {Math.min(currentPage * itemsPerPage, clientesCumpleaneros.length)} de {clientesCumpleaneros.length} cumpleañeros
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Anterior
                    </Button>
                    <span className="text-sm">
                      Página {currentPage} de {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                    >
                      Siguiente
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg font-semibold mb-2">No hay cumpleañeros</p>
              <p className="text-muted-foreground">Los clientes cumpleañeros aparecerán aquí</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

