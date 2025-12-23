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

interface ClienteData {
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
  edad: number;
}

interface EstadisticasCliente {
  totalCompras: number;
  totalGastado: number;
  totalCanjes: number;
  totalPuntosCanjeados: number;
  puntosDisponibles: number;
}

interface ClienteResponse {
  cliente: ClienteData;
  estadisticas: EstadisticasCliente;
}

export default function ClienteStats() {
  const [clienteDni, setClienteDni] = useState('');
  const [clienteData, setClienteData] = useState<ClienteResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Estados para Top Clientes
  const [topClientes, setTopClientes] = useState<ClienteData[]>([]);
  const [limitTopClientes, setLimitTopClientes] = useState(5);
  const [isLoadingTopClientes, setIsLoadingTopClientes] = useState(false);

  // Estados para Clientes Cumpleañeros
  const [clientesCumpleaneros, setClientesCumpleaneros] = useState<ClienteData[]>([]);
  const [isLoadingCumpleaneros, setIsLoadingCumpleaneros] = useState(false);

  // Función para formatear moneda
  const formatCurrency = (amount: number) => `S/${amount.toFixed(2)}`;

 // Función para formatear fechas DATE e ISO sin errores de zona horaria
const formatDate = (dateString: string) => {
  if (!dateString) return '';

  let date: Date;

  // 🟢 Caso 1: DATE puro → "YYYY-MM-DD"
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    const [year, month, day] = dateString.split('-').map(Number);
    date = new Date(year, month - 1, day);
  } 
  // 🔵 Caso 2: ISO → "YYYY-MM-DDTHH:mm:ss.sssZ"
  else {
    date = new Date(dateString);
  }

  if (isNaN(date.getTime())) return 'Fecha inválida';

  return date.toLocaleDateString('es-PE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};



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

  // Función para cargar Top Clientes
  const cargarTopClientes = async () => {
    setIsLoadingTopClientes(true);
    const loadingToastId = showLoadingToast('Cargando top clientes...');
    
    try {
      const data = await clientsService.getTopClients(limitTopClientes);
      setTopClientes(data);
    } catch (error) {
      setTopClientes([]);
      showErrorToast(error, 'Error al cargar top clientes');
    } finally {
      dismissToast(loadingToastId);
      setIsLoadingTopClientes(false);
    }
  };

  // Función para cargar Clientes Cumpleañeros
  const cargarClientesCumpleaneros = async () => {
    setIsLoadingCumpleaneros(true);
    const loadingToastId = showLoadingToast('Cargando clientes cumpleañeros...');
    
    try {
      const data = await clientsService.getBirthdays();
      setClientesCumpleaneros(data);
    } catch (error) {
      setClientesCumpleaneros([]);
      showErrorToast(error, 'Error al cargar clientes cumpleañeros');
    } finally {
      dismissToast(loadingToastId);
      setIsLoadingCumpleaneros(false);
    }
  };

  return (
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

      {/* Sección de Top Clientes */}
      <CardHeader className="border-t">
        <CardTitle className="flex items-center gap-2">
          <Star className="h-5 w-5" />
          Top Clientes
        </CardTitle>
        
        <div className="flex gap-2 items-end">
          <div className="flex-1">
            <Label htmlFor="limitTopClientes" className="text-xs">Límite</Label>
            <Input
              id="limitTopClientes"
              type="number"
              placeholder="Número de clientes"
              value={limitTopClientes}
              onChange={(e) => setLimitTopClientes(parseInt(e.target.value) || 5)}
              className="w-32"
              min="1"
              max="50"
            />
          </div>
          <Button 
            onClick={cargarTopClientes} 
            disabled={isLoadingTopClientes}
            size="sm"
          >
            {isLoadingTopClientes ? (
              <RefreshCw className="h-4 w-4 animate-spin mr-1" />
            ) : (
              <TrendingUp className="h-4 w-4 mr-1" />
            )}
            Cargar
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {isLoadingTopClientes ? (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin mr-2" />
            Cargando top clientes...
          </div>
        ) : topClientes.length > 0 ? (
          <div className="space-y-3">
            {topClientes.map((cliente, index) => (
              <div key={cliente.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Badge variant="secondary" className="w-8 h-8 rounded-full flex items-center justify-center p-0">
                    {index + 1}
                  </Badge>
                  <div>
                    <p className="font-medium">{cliente.nombres} {cliente.apellidos}</p>
                    <p className="text-sm text-muted-foreground">
                      DNI: {cliente.dni} • {cliente.puntosAcumulados} puntos
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-green-600">
                    {cliente.historialCompras?.length || 0} compras
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {formatCurrency(
                      cliente.historialCompras?.reduce((sum, compra) => sum + compra.monto, 0) || 0
                    )}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Star className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No hay datos de top clientes</p>
            <p className="text-sm text-muted-foreground mt-2">
              Haz clic en "Cargar" para obtener los mejores clientes
            </p>
          </div>
        )}
      </CardContent>

      {/* Sección de Clientes Cumpleañeros */}
      <CardHeader className="border-t">
        <CardTitle className="flex items-center gap-2">
          <Heart className="h-5 w-5" />
          Clientes Cumpleañeros
        </CardTitle>
        
        <div className="flex gap-2">
          <Button 
            onClick={cargarClientesCumpleaneros} 
            disabled={isLoadingCumpleaneros}
            size="sm"
          >
            {isLoadingCumpleaneros ? (
              <RefreshCw className="h-4 w-4 animate-spin mr-1" />
            ) : (
              <Calendar className="h-4 w-4 mr-1" />
            )}
            Cargar Cumpleañeros
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {isLoadingCumpleaneros ? (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin mr-2" />
            Cargando clientes cumpleañeros...
          </div>
        ) : clientesCumpleaneros.length > 0 ? (
          <div className="space-y-3">
            {clientesCumpleaneros.map((cliente) => (
              <div key={cliente.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Heart className="h-6 w-6 text-red-500" />
                  <div>
                    <p className="font-medium">{cliente.nombres} {cliente.apellidos}</p>
                    <p className="text-sm text-muted-foreground">
                      DNI: {cliente.dni} • Cumpleaños: {formatDate(cliente.fechaNacimiento)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-blue-600">{cliente.puntosAcumulados} puntos</p>
                  <p className="text-sm text-muted-foreground">
                    Tel: {cliente.telefono}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No hay clientes cumpleañeros hoy</p>
            <p className="text-sm text-muted-foreground mt-2">
              Haz clic en "Cargar Cumpleañeros" para verificar
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
