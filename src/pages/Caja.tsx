import { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DollarSign, Clock, History, Plus, Calendar, TrendingUp, BarChart3, FileText, Lock, Unlock, Download } from 'lucide-react';
import { toast } from 'sonner';
import { cashRegisterService } from '@/services/cashRegisterService';
import type { CashRegister, VentasCorte, CorteResponse } from '@/types';
import { API_ENDPOINTS, API_CONFIG } from '@/config/api';
import { httpClient } from '@/services/httpClient';

export default function Caja() {
  const [current, setCurrent] = useState<CashRegister | null>(null);
  const [history, setHistory] = useState<CashRegister[]>([]);
  const [summary, setSummary] = useState(null);
  const [statistics, setStatistics] = useState<VentasCorte | null>(null);
  const [corteData, setCorteData] = useState<CorteResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentCashAttempted, setCurrentCashAttempted] = useState(false);
  const [isOpenDialogOpen, setIsOpenDialogOpen] = useState(false);
  const [isCloseDialogOpen, setIsCloseDialogOpen] = useState(false);
  // Función para obtener fechas del mes actual
  const getMonthDates = () => {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    const formatDateOnly = (date: Date) => date.toISOString().split("T")[0];

    return {
      fechaInicio: formatDateOnly(firstDay),
      fechaFin: formatDateOnly(lastDay),
    };
  };

  const [dateRange, setDateRange] = useState(() => getMonthDates());
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const [openData, setOpenData] = useState({
    montoInicial: 0,
    observaciones: "",
  });

  const [closeData, setCloseData] = useState({
    montoFinal: 0,
    observaciones: "",
  });

  // Función separada para cargar caja actual (solo se ejecuta una vez)
  const loadCurrentCash = useCallback(async () => {
    if (currentCashAttempted) return current;
    
    try {
      const currentData = await cashRegisterService
        .getCurrent()
        .catch(() => null);
      
      setCurrent(currentData);
      setCurrentCashAttempted(true);
      
      // Load summary only if there's a current cash register
      if (currentData?.id) {
        try {
          const summaryData = await cashRegisterService
            .getSummary(currentData.id)
            .catch(() => null);
          setSummary(summaryData);
        } catch (summaryError) {
          console.error("Error loading summary:", summaryError);
          // No mostrar toast aquí, continuamos sin el resumen
        }
      }
      
      return currentData;
    } catch (error) {
      console.error("Error loading current cash register:", error);
      setCurrent(null);
      setCurrentCashAttempted(true);
      return null;
    }
  }, [currentCashAttempted, current]);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);

      // Cargar caja actual solo si no se ha intentado antes
      await loadCurrentCash();

      // Cargar historial con filtros de fecha
      const historyData = await cashRegisterService
        .getHistory({
          startDate: dateRange.fechaInicio,
          endDate: dateRange.fechaFin,
        })
        .catch(() => []);

      setHistory(historyData);
    } catch (error) {
      console.error("Unexpected error loading cash register data:", error);
      toast.error("Error inesperado al cargar datos de caja");
      // Establecer valores por defecto
      setHistory([]);
    } finally {
      setIsLoading(false);
    }
  }, [dateRange.fechaInicio, dateRange.fechaFin, loadCurrentCash]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleOpenCash = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!openData.montoInicial || openData.montoInicial <= 0) {
      toast.error("El monto inicial debe ser mayor a 0");
      return;
    }

    try {
      await cashRegisterService.open(openData);
      toast.success("Caja abierta correctamente");
      setIsOpenDialogOpen(false);
      setOpenData({ montoInicial: 0, observaciones: "" });
      
      // Resetear el flag para permitir cargar la nueva caja actual
      setCurrentCashAttempted(false);
      loadData();
    } catch (error) {
      console.error("Error opening cash register:", error);
      toast.error("Error al abrir caja");
    }
  };

  const handleCloseCash = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!current || !closeData.montoFinal || closeData.montoFinal < 0) {
      toast.error("El monto final debe ser mayor o igual a 0");
      return;
    }

    try {
      await cashRegisterService.close(current.id, closeData);
      toast.success("Caja cerrada correctamente");
      setIsCloseDialogOpen(false);
      setCloseData({ montoFinal: 0, observaciones: "" });
      
      // Resetear el flag para permitir cargar el estado actualizado
      setCurrentCashAttempted(false);
      loadData();
    } catch (error) {
      console.error("Error closing cash register:", error);
      toast.error("Error al cerrar caja");
    }
  };

  const loadStatistics = async () => {
  if (!dateFrom || !dateTo) {
    toast.error("Por favor selecciona un rango de fechas");
    return;
  }

  try {
    // Fechas en formato YYYY-MM-DD (ya vienen así)
    const fechaInicio = dateFrom;
    const fechaFin = dateTo;

    const queryParams = new URLSearchParams();
    queryParams.append("fechaInicio", fechaInicio);
    queryParams.append("fechaFin", fechaFin);

    // Cargar estadísticas de ventas (existente)
    const urlVentas = `${API_ENDPOINTS.SALES.CORTE}?${queryParams.toString()}`;
    const stats = await httpClient.get<VentasCorte>(urlVentas);
    setStatistics(stats);

    // Cargar corte completo (TAREA 1)
    const urlCorte = `${API_ENDPOINTS.CORTE.BASE}?${queryParams.toString()}`;
    const corte = await httpClient.get<CorteResponse>(urlCorte);
    setCorteData(corte);

    toast.success("Corte de ventas generado correctamente");
  } catch (error) {
    console.error("Error loading statistics:", error);
    toast.error("Error al generar corte de ventas");
  }
};

  // TAREA 2: Función para exportar corte a Excel
  const exportCorteToExcel = async () => {
  if (!dateFrom || !dateTo) {
    toast.error("Por favor selecciona un rango de fechas");
    return;
  }

  try {
    const fechaInicio = dateFrom;
    const fechaFin = dateTo;

    const token = localStorage.getItem("auth_token");
    if (!token) {
      toast.error("No hay sesión activa");
      return;
    }

    const queryParams = new URLSearchParams();
    queryParams.append("fechaInicio", fechaInicio);
    queryParams.append("fechaFin", fechaFin);

    const url = `${API_ENDPOINTS.CORTE.EXPORT}?${queryParams.toString()}`;

    const response = await fetch(`${API_CONFIG.BASE_URL}${url}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Accept": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      }
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || "Error al exportar el archivo");
    }

    const blob = await response.blob();

    const downloadUrl = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = `corte_${fechaInicio}_${fechaFin}.xlsx`;
    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);

    toast.success("Archivo Excel descargado correctamente");
  } catch (error) {
    console.error("Error exporting to Excel:", error);
    toast.error("Error al exportar a Excel");
  }
};


  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Control de Caja</h1>
          <p className="text-muted-foreground">
            Gestión de turnos, cierre de caja y corte de ventas
          </p>
        </div>
        <div className="flex gap-2">
          {!current ? (
            <Dialog open={isOpenDialogOpen} onOpenChange={setIsOpenDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Unlock className="h-4 w-4" />
                  Abrir Caja
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Abrir Caja</DialogTitle>
                  <DialogDescription>
                    Registra el monto inicial para abrir la caja del día
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleOpenCash} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="montoInicial">Monto Inicial S/ *</Label>
                    <Input
                      id="montoInicial"
                      type="number"
                      step="0.01"
                      value={openData.montoInicial || ""}
                      onChange={(e) =>
                        setOpenData({
                          ...openData,
                          montoInicial: parseFloat(e.target.value) || 0,
                        })
                      }
                      placeholder="100.00"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="observaciones">Observaciones</Label>
                    <Textarea
                      id="observaciones"
                      value={openData.observaciones}
                      onChange={(e) =>
                        setOpenData({
                          ...openData,
                          observaciones: e.target.value,
                        })
                      }
                      placeholder="Apertura normal del día..."
                    />
                  </div>
                  <DialogFooter>
                    <Button type="submit" className="w-full">
                      Abrir Caja
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          ) : (
            <Dialog
              open={isCloseDialogOpen}
              onOpenChange={setIsCloseDialogOpen}
            >
              <DialogTrigger asChild>
                <Button variant="destructive" className="gap-2">
                  <Lock className="h-4 w-4" />
                  Cerrar Caja
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Cerrar Caja</DialogTitle>
                  <DialogDescription>
                    Registra el monto final para cerrar la caja actual
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCloseCash} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="montoFinal">Monto Final S/ *</Label>
                    <Input
                      id="montoFinal"
                      type="number"
                      step="0.01"
                      value={closeData.montoFinal || ""}
                      onChange={(e) =>
                        setCloseData({
                          ...closeData,
                          montoFinal: parseFloat(e.target.value) || 0,
                        })
                      }
                      placeholder="450.00"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="observacionesCierre">Observaciones</Label>
                    <Textarea
                      id="observacionesCierre"
                      value={closeData.observaciones}
                      onChange={(e) =>
                        setCloseData({
                          ...closeData,
                          observaciones: e.target.value,
                        })
                      }
                      placeholder="Cierre normal, sin novedades..."
                    />
                  </div>
                  <DialogFooter>
                    <Button
                      type="submit"
                      variant="destructive"
                      className="w-full"
                    >
                      Cerrar Caja
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      <Tabs defaultValue="current" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="current">Caja Actual</TabsTrigger>
          <TabsTrigger value="history">Historial</TabsTrigger>
          <TabsTrigger value="sales">Corte de Ventas</TabsTrigger>
          <TabsTrigger value="analytics">Análisis</TabsTrigger>
        </TabsList>

        <TabsContent value="current" className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="text-center">
                <Clock className="h-8 w-8 animate-spin mx-auto mb-2 text-primary" />
                <p>Cargando información de caja...</p>
              </div>
            </div>
          ) : current ? (
            <>
              {/* Estado actual de la caja */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Estado</p>
                        <p className="text-2xl font-bold text-green-600">
                          ABIERTA
                        </p>
                      </div>
                      <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                        <Unlock className="h-4 w-4 text-green-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Monto Inicial
                        </p>
                        <p className="text-2xl font-bold text-primary">
                          S/ {current.montoInicial?.toFixed(2)}
                        </p>
                      </div>
                      <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <DollarSign className="h-4 w-4 text-primary" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Hora Apertura
                        </p>
                        <p className="text-2xl font-bold text-blue-600">
                          {new Date(
                            current.fechaApertura || ""
                          ).toLocaleTimeString("es-PE", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                      <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <Clock className="h-4 w-4 text-blue-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Cajero</p>
                        <p className="text-2xl font-bold text-purple-600">
                          {current.cajero || "N/A"}
                        </p>
                      </div>
                      <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
                        <FileText className="h-4 w-4 text-purple-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Resumen de la caja actual */}
              {summary && (
                <Card>
                  <CardHeader>
                    <CardTitle>Resumen de Caja Actual</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="text-center p-4 border rounded-lg">
                        <p className="text-sm text-muted-foreground">
                          Ventas del Día
                        </p>
                        <p className="text-2xl font-bold text-green-600">
                          S/ {summary.totalVentas?.toFixed(2) || "0.00"}
                        </p>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <p className="text-sm text-muted-foreground">
                          Gastos del Día
                        </p>
                        <p className="text-2xl font-bold text-red-600">
                          S/ {summary.totalGastos?.toFixed(2) || "0.00"}
                        </p>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <p className="text-sm text-muted-foreground">
                          Efectivo Esperado
                        </p>
                        <p className="text-2xl font-bold text-blue-600">
                          S/{" "}
                          {(
                            (current.fechaApertura || 0) +
                            (summary.totalVentas || 0) -
                            (summary.totalGastos || 0)
                          ).toFixed(2)}
                        </p>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <p className="text-sm text-muted-foreground">
                          Transacciones
                        </p>
                        <p className="text-2xl font-bold text-purple-600">
                          {summary.totalTransacciones || 0}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Observaciones */}
              {current.observaciones && (
                <Card>
                  <CardHeader>
                    <CardTitle>Observaciones de Apertura</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      {current.observaciones}
                    </p>
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <Lock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-lg font-semibold mb-2">
                    No hay caja abierta
                  </p>
                  <p className="text-muted-foreground mb-4">
                    Abre una caja para comenzar las operaciones del día
                  </p>
                  <Button
                    onClick={() => setIsOpenDialogOpen(true)}
                    className="gap-2"
                  >
                    <Unlock className="h-4 w-4" />
                    Abrir Caja
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Historial de Cajas
              </CardTitle>

              {/* Controles de filtros de fecha */}
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
                <div className="flex gap-4">
                  <div className="space-y-1">
                    <Label htmlFor="fechaInicio" className="text-xs">
                      Fecha Inicio
                    </Label>
                    <Input
                      id="fechaInicio"
                      type="date"
                      value={dateRange.fechaInicio}
                      onChange={(e) =>
                        setDateRange((prev) => ({
                          ...prev,
                          fechaInicio: e.target.value,
                        }))
                      }
                      className="w-40"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="fechaFin" className="text-xs">
                      Fecha Fin
                    </Label>
                    <Input
                      id="fechaFin"
                      type="date"
                      value={dateRange.fechaFin}
                      onChange={(e) =>
                        setDateRange((prev) => ({
                          ...prev,
                          fechaFin: e.target.value,
                        }))
                      }
                      className="w-40"
                    />
                  </div>
                  <div>

                  <div></div>

                  <Button onClick={loadData} size="sm" >
                    <Calendar className="h-4 w-4 mr-1" />
                    Aplicar
                  </Button>
                  </div>
                </div>

                {/* Botones de rango rápido */}
                <div className="flex gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const today = new Date();
                      const startDate = new Date(today);
                      startDate.setDate(today.getDate() - 6);
                      const formatDateOnly = (date: Date) =>
                        date.toISOString().split("T")[0];
                      setDateRange({
                        fechaInicio: formatDateOnly(startDate),
                        fechaFin: formatDateOnly(today),
                      });
                    }}
                  >
                    7d
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const today = new Date();
                      const startDate = new Date(today);
                      startDate.setDate(today.getDate() - 29);
                      const formatDateOnly = (date: Date) =>
                        date.toISOString().split("T")[0];
                      setDateRange({
                        fechaInicio: formatDateOnly(startDate),
                        fechaFin: formatDateOnly(today),
                      });
                    }}
                  >
                    30d
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDateRange(getMonthDates())}
                    title="Mes Actual"
                  >
                    Mes
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Array.isArray(history) && history.length > 0 ? (
                  history.map((cashRegister) => (
                    <div
                      key={cashRegister.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`h-3 w-3 rounded-full ${
                            cashRegister.estado === "ABIERTA"
                              ? "bg-green-500"
                              : "bg-gray-500"
                          }`}
                        />
                        <div>
                          <p className="font-semibold">
                            {cashRegister.fechaApertura
                              ? new Date(
                                  cashRegister.fechaApertura
                                ).toLocaleDateString("es-PE", {
                                  year: "numeric",
                                  month: "2-digit",
                                  day: "2-digit",
                                  timeZone: "America/Lima",
                                })
                              : "--"}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {cashRegister.cajero} • {cashRegister.estado}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">
                          S/ {cashRegister.montoInicial?.toFixed(2)}
                        </p>
                        {cashRegister.montoFinal && (
                          <p className="text-sm text-muted-foreground">
                            Final: S/ {cashRegister.montoFinal.toFixed(2)}
                          </p>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <History className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-lg font-semibold mb-2">
                      No hay historial de cajas
                    </p>
                    <p className="text-muted-foreground">
                      El historial aparecerá aquí cuando tengas cajas
                      registradas
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sales" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Corte de Ventas por Fechas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="space-y-2">
                  <Label>Fecha Desde</Label>
                  <Input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Fecha Hasta</Label>
                  <Input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>&nbsp;</Label>
                  <div className="flex gap-2">
                    <Button onClick={loadStatistics} className="flex-1 gap-2">
                      <BarChart3 className="h-4 w-4" />
                      Generar Corte
                    </Button>
                    <Button onClick={exportCorteToExcel} variant="outline" className="gap-2">
                      <Download className="h-4 w-4" />
                      Excel
                    </Button>
                  </div>
                </div>
              </div>

              {statistics && (
                <Tabs defaultValue="resumen" className="w-full">
                  <TabsList className="grid w-full grid-cols-7">
                    <TabsTrigger value="resumen">Resumen</TabsTrigger>
                    <TabsTrigger value="corte">Corte Completo</TabsTrigger>
                    <TabsTrigger value="metodos">Métodos Pago</TabsTrigger>
                    <TabsTrigger value="tipos">Tipo Compra</TabsTrigger>
                    <TabsTrigger value="productos">Top Productos</TabsTrigger>
                    <TabsTrigger value="diario">Por Día</TabsTrigger>
                    <TabsTrigger value="anulaciones">Anulaciones</TabsTrigger>
                  </TabsList>

                  <TabsContent value="resumen" className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      <Card>
                        <CardContent className="pt-6">
                          <div className="text-center">
                            <p className="text-sm text-muted-foreground">
                              Total Ventas
                            </p>
                            <p className="text-2xl font-bold text-green-600">
                              S/ {statistics.totalVentas.toFixed(2)}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="pt-6">
                          <div className="text-center">
                            <p className="text-sm text-muted-foreground">
                              Transacciones
                            </p>
                            <p className="text-2xl font-bold text-blue-600">
                              {statistics.numeroTransacciones}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="pt-6">
                          <div className="text-center">
                            <p className="text-sm text-muted-foreground">
                              Ticket Promedio
                            </p>
                            <p className="text-2xl font-bold text-purple-600">
                              S/ {statistics.ticketPromedio.toFixed(2)}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="pt-6">
                          <div className="text-center">
                            <p className="text-sm text-muted-foreground">
                              Total Descuentos
                            </p>
                            <p className="text-2xl font-bold text-orange-600">
                              S/ {statistics.totalDescuentos.toFixed(2)}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="pt-6">
                          <div className="text-center">
                            <p className="text-sm text-muted-foreground">
                              Puntos Otorgados
                            </p>
                            <p className="text-2xl font-bold text-indigo-600">
                              {statistics.puntosOtorgados}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="pt-6">
                          <div className="text-center">
                            <p className="text-sm text-muted-foreground">
                              Puntos Canjeados
                            </p>
                            <p className="text-2xl font-bold text-red-600">
                              {statistics.puntosCanjeados}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  {/* TAREA 1: Nueva pestaña Corte Completo */}
                  <TabsContent value="corte" className="space-y-4">
                    {corteData ? (
                      <div className="space-y-6">
                        {/* Período */}
                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              <Calendar className="h-5 w-5" />
                              Período del Corte
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="flex items-center justify-center gap-4">
                              <div className="text-center">
                                <p className="text-sm text-muted-foreground">Fecha Inicio</p>
                                <p className="text-lg font-semibold">{corteData.periodo.fechaInicio}</p>
                              </div>
                              <div className="text-2xl text-muted-foreground">→</div>
                              <div className="text-center">
                                <p className="text-sm text-muted-foreground">Fecha Fin</p>
                                <p className="text-lg font-semibold">{corteData.periodo.fechaFin}</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        {/* Resumen de Rentabilidad */}
                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              <TrendingUp className="h-5 w-5" />
                              Rentabilidad
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                              <div className="text-center p-4 bg-green-50 rounded-lg">
                                <p className="text-sm text-muted-foreground">Ingresos Totales</p>
                                <p className="text-2xl font-bold text-green-600">
                                  S/ {corteData.rentabilidad.ingresosTotales.toFixed(2)}
                                </p>
                              </div>
                              <div className="text-center p-4 bg-red-50 rounded-lg">
                                <p className="text-sm text-muted-foreground">Gastos Totales</p>
                                <p className="text-2xl font-bold text-red-600">
                                  S/ {corteData.rentabilidad.gastosTotales.toFixed(2)}
                                </p>
                              </div>
                              <div className={`text-center p-4 rounded-lg ${corteData.rentabilidad.utilidadNeta >= 0 ? 'bg-blue-50' : 'bg-orange-50'}`}>
                                <p className="text-sm text-muted-foreground">Utilidad Neta</p>
                                <p className={`text-2xl font-bold ${corteData.rentabilidad.utilidadNeta >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                                  S/ {corteData.rentabilidad.utilidadNeta.toFixed(2)}
                                </p>
                              </div>
                              <div className="text-center p-4 bg-purple-50 rounded-lg">
                                <p className="text-sm text-muted-foreground">Margen Utilidad</p>
                                <p className="text-2xl font-bold text-purple-600">
                                  {corteData.rentabilidad.margenUtilidad.toFixed(1)}%
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        {/* Desglose por Secciones */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                          {/* Ventas */}
                          <Card>
                            <CardHeader>
                              <CardTitle className="text-lg">Ventas</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                              <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">Cantidad:</span>
                                <span className="font-semibold">{corteData.ventas.cantidad}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">Total Bruto:</span>
                                <span className="font-semibold">S/ {corteData.ventas.totalBruto.toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">Total Cobrado:</span>
                                <span className="font-semibold">S/ {corteData.ventas.totalCobrado.toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">Ajustes Redondeo:</span>
                                <span className="font-semibold">S/ {corteData.ventas.ajustesRedondeo.toFixed(2)}</span>
                              </div>
                              {Object.keys(corteData.ventas.desglosePorMetodo).length > 0 && (
                                <div className="pt-2 border-t">
                                  <p className="text-sm font-medium mb-2">Por Método:</p>
                                  {Object.entries(corteData.ventas.desglosePorMetodo).map(([metodo, monto]) => (
                                    <div key={metodo} className="flex justify-between text-sm">
                                      <span>{metodo}:</span>
                                      <span>S/ {Number(monto).toFixed(2)}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </CardContent>
                          </Card>

                          {/* Entradas */}
                          <Card>
                            <CardHeader>
                              <CardTitle className="text-lg">Entradas</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                              <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">Cantidad:</span>
                                <span className="font-semibold">{corteData.entradas.cantidad}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">Total:</span>
                                <span className="font-semibold">S/ {corteData.entradas.total.toFixed(2)}</span>
                              </div>
                              {Object.keys(corteData.entradas.porCategoria).length > 0 && (
                                <div className="pt-2 border-t">
                                  <p className="text-sm font-medium mb-2">Por Categoría:</p>
                                  {Object.entries(corteData.entradas.porCategoria).map(([categoria, monto]) => (
                                    <div key={categoria} className="flex justify-between text-sm">
                                      <span>{categoria}:</span>
                                      <span>S/ {Number(monto).toFixed(2)}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </CardContent>
                          </Card>

                          {/* Gastos */}
                          <Card>
                            <CardHeader>
                              <CardTitle className="text-lg">Gastos</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                              <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">Cantidad:</span>
                                <span className="font-semibold">{corteData.gastos.cantidad}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">Total:</span>
                                <span className="font-semibold">S/ {corteData.gastos.total.toFixed(2)}</span>
                              </div>
                              {Object.keys(corteData.gastos.porCategoria).length > 0 && (
                                <div className="pt-2 border-t">
                                  <p className="text-sm font-medium mb-2">Por Categoría:</p>
                                  {Object.entries(corteData.gastos.porCategoria).map(([categoria, monto]) => (
                                    <div key={categoria} className="flex justify-between text-sm">
                                      <span>{categoria}:</span>
                                      <span>S/ {Number(monto).toFixed(2)}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <BarChart3 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                        <p className="text-lg font-semibold mb-2">No hay datos de corte</p>
                        <p className="text-muted-foreground">
                          Genera un corte para ver la información completa
                        </p>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="metodos" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Desglose por Método de Pago</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {Object.entries(statistics.desgloseMetodosPago).map(
                            ([metodo, data]) => (
                              <div
                                key={metodo}
                                className="flex justify-between items-center p-3 border rounded-lg"
                              >
                                <div>
                                  <span className="font-medium">{metodo}</span>
                                  <p className="text-sm text-muted-foreground">
                                    {data.cantidad} transacciones
                                  </p>
                                </div>
                                <span className="font-bold text-green-600">
                                  S/ {data.monto.toFixed(2)}
                                </span>
                              </div>
                            )
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="tipos" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Desglose por Tipo de Compra</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {Object.entries(statistics.desgloseTipoCompra).map(
                            ([tipo, data]) => (
                              <div
                                key={tipo}
                                className="flex justify-between items-center p-3 border rounded-lg"
                              >
                                <div>
                                  <span className="font-medium">{tipo}</span>
                                  <p className="text-sm text-muted-foreground">
                                    {data.cantidad} transacciones
                                  </p>
                                </div>
                                <span className="font-bold text-green-600">
                                  S/ {data.monto.toFixed(2)}
                                </span>
                              </div>
                            )
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="productos" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Top 5 Productos Más Vendidos</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {statistics.topProductos
                            .slice(0, 5)
                            .map((producto, index) => (
                              <div
                                key={producto.productoId}
                                className="flex justify-between items-center p-3 border rounded-lg"
                              >
                                <div>
                                  <p className="font-medium">
                                    {producto.descripcion}
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    Cantidad: {producto.cantidad}
                                  </p>
                                </div>
                                <span className="font-bold text-primary">
                                  S/ {producto.monto.toFixed(2)}
                                </span>
                              </div>
                            ))}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="diario" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Ventas por Día</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {statistics.ventasPorDia.map((dia, index) => (
                            <div
                              key={index}
                              className="flex justify-between items-center p-3 border rounded-lg"
                            >
                              <div>
                                <span className="font-medium">
                                  {new Date(dia.fecha).toLocaleDateString()}
                                </span>
                                <p className="text-sm text-muted-foreground">
                                  {dia.cantidad} transacciones
                                </p>
                              </div>
                              <span className="font-bold text-green-600">
                                S/ {dia.monto.toFixed(2)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="anulaciones" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Resumen de Anulaciones</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <Card>
                            <CardContent className="pt-6">
                              <div className="text-center">
                                <p className="text-sm text-muted-foreground">
                                  Ventas Anuladas
                                </p>
                                <p className="text-2xl font-bold text-red-600">
                                  {statistics.ventasAnuladas}
                                </p>
                              </div>
                            </CardContent>
                          </Card>
                          <Card>
                            <CardContent className="pt-6">
                              <div className="text-center">
                                <p className="text-sm text-muted-foreground">
                                  Monto Anulado
                                </p>
                                <p className="text-2xl font-bold text-red-600">
                                  S/ {statistics.montoVentasAnuladas.toFixed(2)}
                                </p>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Análisis de Rendimiento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-4">Resumen General</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Total de Cajas Registradas:</span>
                      <span className="font-semibold">
                        {Array.isArray(history) ? history.length : 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Cajas Abiertas:</span>
                      <span className="font-semibold text-green-600">
                        {Array.isArray(history)
                          ? history.filter((c) => c.estado === "ABIERTA").length
                          : 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Cajas Cerradas:</span>
                      <span className="font-semibold text-gray-600">
                        {Array.isArray(history)
                          ? history.filter((c) => c.estado === "CERRADA").length
                          : 0}
                      </span>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-4">Promedios</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Monto Inicial Promedio:</span>
                      <span className="font-semibold">
                        S/{" "}
                        {Array.isArray(history) && history.length > 0
                          ? (
                              history.reduce(
                                (sum, c) => sum + (c.montoInicial || 0),
                                0
                              ) / history.length
                            ).toFixed(2)
                          : "0.00"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Monto Final Promedio:</span>
                      <span className="font-semibold">
                        S/{" "}
                        {Array.isArray(history) &&
                        history.filter((c) => c.montoFinal).length > 0
                          ? (
                              history.reduce(
                                (sum, c) => sum + (c.montoFinal || 0),
                                0
                              ) / history.filter((c) => c.montoFinal).length
                            ).toFixed(2)
                          : "0.00"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
