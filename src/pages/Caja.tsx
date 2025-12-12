import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DollarSign, Clock, History, Plus, Calendar, User, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { 
  useCurrentCashRegister,
  useCashRegisterHistory,
  useCashRegisterSummary,
  useCashRegisterStatistics,
  useOpenCashRegister,
  useCloseCashRegister
} from '@/hooks/useCashRegister';
import type { CashRegister } from '@/types';

export default function Caja() {
  // Estados para formularios
  const [isOpenDialogOpen, setIsOpenDialogOpen] = useState(false);
  const [isCloseDialogOpen, setIsCloseDialogOpen] = useState(false);
  const [openData, setOpenData] = useState({
    montoInicial: 0,
    observaciones: '',
  });
  const [closeData, setCloseData] = useState({
    montoFinal: 0,
    observaciones: '',
  });

  // Hooks de datos
  const { data: currentCashRegister, isLoading: loadingCurrent } = useCurrentCashRegister();
  const { data: history = [], isLoading: loadingHistory } = useCashRegisterHistory();
  const { data: summary } = useCashRegisterSummary();
  const { data: statistics } = useCashRegisterStatistics();
  
  // Hooks de mutaciones
  const openCashRegister = useOpenCashRegister();
  const closeCashRegister = useCloseCashRegister();

  const handleOpenCashRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (openData.montoInicial < 0) {
      toast.error('El monto inicial debe ser mayor o igual a 0');
      return;
    }

    try {
      await openCashRegister.mutateAsync({
        montoInicial: openData.montoInicial,
        observaciones: openData.observaciones,
      });
      
      toast.success('Caja abierta correctamente');
      setIsOpenDialogOpen(false);
      setOpenData({ montoInicial: 0, observaciones: '' });
    } catch (error) {
      toast.error('Error al abrir caja');
      console.error('Error opening cash register:', error);
    }
  };

  const handleCloseCashRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentCashRegister) {
      toast.error('No hay caja abierta para cerrar');
      return;
    }

    if (closeData.montoFinal < 0) {
      toast.error('El monto final debe ser mayor o igual a 0');
      return;
    }

    try {
      await closeCashRegister.mutateAsync({
        id: currentCashRegister.id,
        data: {
          montoFinal: closeData.montoFinal,
          observaciones: closeData.observaciones,
        },
      });
      
      toast.success('Caja cerrada correctamente');
      setIsCloseDialogOpen(false);
      setCloseData({ montoFinal: 0, observaciones: '' });
    } catch (error) {
      toast.error('Error al cerrar caja');
      console.error('Error closing cash register:', error);
    }
  };

  const calculateExpectedCash = () => {
    if (!currentCashRegister || !summary) return 0;
    return currentCashRegister.initialCash + (summary.efectivo || 0);
  };

  const calculateDifference = () => {
    if (!closeData.montoFinal) return 0;
    return closeData.montoFinal - calculateExpectedCash();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold mb-2">Control de Caja</h1>
        <p className="text-muted-foreground">Gestión de turnos y control de efectivo</p>
      </div>

      <Tabs defaultValue="current" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="current">Caja Actual</TabsTrigger>
          <TabsTrigger value="summary">Resumen</TabsTrigger>
          <TabsTrigger value="history">Historial</TabsTrigger>
          <TabsTrigger value="statistics">Estadísticas</TabsTrigger>
        </TabsList>

        {/* Tab de Caja Actual */}
        <TabsContent value="current" className="space-y-4">
          {loadingCurrent ? (
            <Card>
              <CardContent className="p-12 text-center">
                <p className="text-muted-foreground">Cargando información de caja...</p>
              </CardContent>
            </Card>
          ) : currentCashRegister ? (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      Caja Abierta
                    </span>
                    <div className="flex items-center gap-2">
                      <Badge variant="default">Activo</Badge>
                      <Dialog open={isCloseDialogOpen} onOpenChange={setIsCloseDialogOpen}>
                        <DialogTrigger asChild>
                          <Button variant="destructive" size="sm">
                            Cerrar Caja
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                          <DialogHeader>
                            <DialogTitle>Cerrar Caja</DialogTitle>
                            <DialogDescription>
                              Registra el monto final de efectivo para cerrar la caja
                            </DialogDescription>
                          </DialogHeader>
                          <form onSubmit={handleCloseCashRegister} className="space-y-4">
                            <div className="space-y-2">
                              <Label>Monto Final en Efectivo S/ *</Label>
                              <Input
                                type="number"
                                step="0.01"
                                min="0"
                                value={closeData.montoFinal}
                                onChange={(e) => setCloseData({ ...closeData, montoFinal: parseFloat(e.target.value) || 0 })}
                                required
                              />
                            </div>
                            
                            {closeData.montoFinal > 0 && (
                              <div className="p-3 bg-muted rounded-lg space-y-2">
                                <div className="flex justify-between text-sm">
                                  <span>Efectivo esperado:</span>
                                  <span>S/ {calculateExpectedCash().toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                  <span>Efectivo contado:</span>
                                  <span>S/ {closeData.montoFinal.toFixed(2)}</span>
                                </div>
                                <div className={`flex justify-between font-semibold ${
                                  calculateDifference() === 0 ? 'text-green-600' : 
                                  calculateDifference() > 0 ? 'text-blue-600' : 'text-red-600'
                                }`}>
                                  <span>Diferencia:</span>
                                  <span>
                                    {calculateDifference() > 0 ? '+' : ''}
                                    S/ {calculateDifference().toFixed(2)}
                                  </span>
                                </div>
                              </div>
                            )}
                            
                            <div className="space-y-2">
                              <Label>Observaciones</Label>
                              <Input
                                value={closeData.observaciones}
                                onChange={(e) => setCloseData({ ...closeData, observaciones: e.target.value })}
                                placeholder="Observaciones del cierre"
                              />
                            </div>
                            <DialogFooter>
                              <Button type="submit" disabled={closeCashRegister.isPending}>
                                Cerrar Caja
                              </Button>
                            </DialogFooter>
                          </form>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Cajero</p>
                      <p className="font-semibold">{currentCashRegister.cashier}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Apertura</p>
                      <p className="font-semibold">
                        {new Date(currentCashRegister.openedAt).toLocaleString('es-PE')}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Efectivo Inicial</p>
                      <p className="font-semibold text-primary">S/ {currentCashRegister.initialCash.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Ventas</p>
                      <p className="font-semibold text-green-600">S/ {currentCashRegister.totalSales.toFixed(2)}</p>
                    </div>
                  </div>

                  {currentCashRegister.paymentBreakdown && (
                    <div>
                      <p className="text-sm font-semibold mb-3">Desglose por Método de Pago</p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <Card>
                          <CardContent className="p-3">
                            <p className="text-sm text-muted-foreground">Efectivo</p>
                            <p className="font-bold">S/ {currentCashRegister.paymentBreakdown.efectivo.toFixed(2)}</p>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="p-3">
                            <p className="text-sm text-muted-foreground">Yape</p>
                            <p className="font-bold">S/ {currentCashRegister.paymentBreakdown.yape.toFixed(2)}</p>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="p-3">
                            <p className="text-sm text-muted-foreground">Plin</p>
                            <p className="font-bold">S/ {currentCashRegister.paymentBreakdown.plin.toFixed(2)}</p>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="p-3">
                            <p className="text-sm text-muted-foreground">Tarjeta</p>
                            <p className="font-bold">S/ {currentCashRegister.paymentBreakdown.tarjeta.toFixed(2)}</p>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  )}

                  {currentCashRegister.notes && (
                    <div>
                      <p className="text-sm font-semibold mb-2">Observaciones de Apertura</p>
                      <p className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                        {currentCashRegister.notes}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="p-12 text-center space-y-4">
                <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto" />
                <div>
                  <p className="text-lg font-semibold mb-2">No hay caja abierta</p>
                  <p className="text-muted-foreground mb-4">
                    Debes abrir una caja para comenzar a registrar ventas
                  </p>
                  <Dialog open={isOpenDialogOpen} onOpenChange={setIsOpenDialogOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Abrir Caja
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>Abrir Caja</DialogTitle>
                        <DialogDescription>
                          Registra el monto inicial de efectivo para abrir la caja
                        </DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleOpenCashRegister} className="space-y-4">
                        <div className="space-y-2">
                          <Label>Monto Inicial S/ *</Label>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            value={openData.montoInicial}
                            onChange={(e) => setOpenData({ ...openData, montoInicial: parseFloat(e.target.value) || 0 })}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Observaciones</Label>
                          <Input
                            value={openData.observaciones}
                            onChange={(e) => setOpenData({ ...openData, observaciones: e.target.value })}
                            placeholder="Observaciones de apertura"
                          />
                        </div>
                        <DialogFooter>
                          <Button type="submit" disabled={openCashRegister.isPending}>
                            Abrir Caja
                          </Button>
                        </DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Tab de Resumen */}
        <TabsContent value="summary" className="space-y-4">
          {summary && (
            <div className="grid gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Resumen de Ventas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">S/ {summary.totalVentas?.toFixed(2) || '0.00'}</p>
                      <p className="text-sm text-muted-foreground">Total Ventas</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold">{summary.cantidadVentas || 0}</p>
                      <p className="text-sm text-muted-foreground">Cantidad Ventas</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">S/ {summary.efectivo?.toFixed(2) || '0.00'}</p>
                      <p className="text-sm text-muted-foreground">Efectivo</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-purple-600">S/ {summary.digital?.toFixed(2) || '0.00'}</p>
                      <p className="text-sm text-muted-foreground">Digital</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* Tab de Historial */}
        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Historial de Cajas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Caja</TableHead>
                      <TableHead>Cajero</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Efectivo Inicial</TableHead>
                      <TableHead>Total Ventas</TableHead>
                      <TableHead>Efectivo Final</TableHead>
                      <TableHead>Estado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loadingHistory ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">
                          Cargando historial...
                        </TableCell>
                      </TableRow>
                    ) : history.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          No hay historial de cajas
                        </TableCell>
                      </TableRow>
                    ) : (
                      history.map((register) => (
                        <TableRow key={register.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <History className="h-4 w-4 text-muted-foreground" />
                              Caja #{register.id}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <User className="h-3 w-3 text-muted-foreground" />
                              {register.cashier}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3 text-muted-foreground" />
                              {new Date(register.openedAt).toLocaleDateString('es-PE')}
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="font-semibold text-blue-600">
                              S/ {register.initialCash.toFixed(2)}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="font-semibold text-green-600">
                              S/ {register.totalSales.toFixed(2)}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="font-semibold">
                              S/ {register.finalCash?.toFixed(2) || '-'}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Badge variant={register.status === 'open' ? 'default' : 'secondary'}>
                              {register.status === 'open' ? 'Abierta' : 'Cerrada'}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab de Estadísticas */}
        <TabsContent value="statistics" className="space-y-4">
          {statistics && (
            <div className="grid gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Estadísticas Generales</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold">{statistics.totalCajas || 0}</p>
                      <p className="text-sm text-muted-foreground">Total Cajas</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">S/ {statistics.promedioVentas?.toFixed(2) || '0.00'}</p>
                      <p className="text-sm text-muted-foreground">Promedio Ventas</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">S/ {statistics.promedioEfectivo?.toFixed(2) || '0.00'}</p>
                      <p className="text-sm text-muted-foreground">Promedio Efectivo</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-purple-600">{statistics.cajeroMasActivo || '-'}</p>
                      <p className="text-sm text-muted-foreground">Cajero Más Activo</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

