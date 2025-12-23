import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Users, Star, Gift, Calendar, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";

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
}

export const ClientesStats: React.FC = () => {
  const [topClientes, setTopClientes] = useState<Cliente[]>([]);
  const [clientesCumpleaneros, setClientesCumpleaneros] = useState<Cliente[]>([]);
  const [isLoadingTop, setIsLoadingTop] = useState(false);
  const [isLoadingCumpleaneros, setIsLoadingCumpleaneros] = useState(false);
  const [limitTop, setLimitTop] = useState(1);
  
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
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('No hay sesión activa');
      }

      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
      const response = await fetch(
        `${API_BASE_URL}/clientes/top?limit=${limitTop}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Error al cargar top clientes');
      }

      const data = await response.json();
      setTopClientes(Array.isArray(data) ? data : []);
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
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('No hay sesión activa');
      }

      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
      const response = await fetch(
        `${API_BASE_URL}/clientes/cumpleaneros`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Error al cargar clientes cumpleañeros');
      }

      const data = await response.json();
      setClientesCumpleaneros(Array.isArray(data) ? data : []);
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

