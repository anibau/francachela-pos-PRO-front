import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { TrendingUp, Calendar, User, CreditCard, Download, Eye, XCircle } from "lucide-react";
import { toast } from "sonner";
import { salesAPI } from "@/services/api";
import type { Sale } from "@/types";

export default function Ventas() {
  const [ventas, setVentas] = useState<Sale[]>([]);
  const [filteredVentas, setFilteredVentas] = useState<Sale[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [dateFilter, setDateFilter] = useState({
    startDate: '',
    endDate: '',
  });

  useEffect(() => {
    loadVentas();
  }, []);

  useEffect(() => {
    filterVentas();
  }, [ventas, dateFilter]);

  const loadVentas = async () => {
    try {
      const data = await salesAPI.getAll();
      setVentas(data);
    } catch (error) {
      toast.error('Error al cargar ventas');
    } finally {
      setIsLoading(false);
    }
  };

  const filterVentas = () => {
    let filtered = [...ventas];

    if (dateFilter.startDate) {
      filtered = filtered.filter(v => new Date(v.date) >= new Date(dateFilter.startDate));
    }

    if (dateFilter.endDate) {
      filtered = filtered.filter(v => new Date(v.date) <= new Date(dateFilter.endDate + 'T23:59:59'));
    }

    setFilteredVentas(filtered);
  };

  const handleCancelSale = async (id: number) => {
    if (!confirm('¿Estás seguro de anular esta venta?')) return;

    try {
      await salesAPI.cancel(id);
      toast.success('Venta anulada correctamente');
      loadVentas();
    } catch (error) {
      toast.error('Error al anular venta');
    }
  };

  const openDetailDialog = (sale: Sale) => {
    setSelectedSale(sale);
    setIsDetailDialogOpen(true);
  };

  const exportToCSV = () => {
    if (filteredVentas.length === 0) {
      toast.error('No hay ventas para exportar');
      return;
    }

    const headers = ['ID', 'Fecha', 'Cliente', 'Total', 'Método Pago', 'Cajero', 'Estado'];
    const rows = filteredVentas.map(v => [
      v.ticketNumber,
      new Date(v.date).toLocaleString(),
      v.clientName || 'Venta Rápida',
      v.total.toFixed(2),
      v.paymentMethod,
      v.cashier,
      v.status,
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `ventas_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success('Ventas exportadas correctamente');
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">Cargando ventas...</div>;
  }

  return (
    <div className="space-y-6 animate-fade-in p-4 lg:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold mb-2">Historial de Ventas</h1>
          <p className="text-muted-foreground">Registro detallado de todas las transacciones</p>
        </div>
        
        <Button onClick={exportToCSV} className="w-full sm:w-auto">
          <Download className="h-4 w-4 mr-2" />
          Exportar CSV
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtrar por Fecha</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Fecha Inicio</Label>
              <Input
                id="startDate"
                type="date"
                value={dateFilter.startDate}
                onChange={(e) => setDateFilter({ ...dateFilter, startDate: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">Fecha Fin</Label>
              <Input
                id="endDate"
                type="date"
                value={dateFilter.endDate}
                onChange={(e) => setDateFilter({ ...dateFilter, endDate: e.target.value })}
              />
            </div>
          </div>
          {(dateFilter.startDate || dateFilter.endDate) && (
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() => setDateFilter({ startDate: '', endDate: '' })}
            >
              Limpiar Filtros
            </Button>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {filteredVentas.map((venta) => (
          <Card key={venta.id} className="hover:shadow-lg transition-all">
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                <CardTitle className="flex items-center gap-3 text-lg">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  {venta.ticketNumber}
                </CardTitle>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <Badge variant="default" className="text-lg font-bold">
                    S/ {venta.total.toFixed(2)}
                  </Badge>
                  <Badge variant={venta.status === 'completada' ? 'default' : 'destructive'}>
                    {venta.status.toUpperCase()}
                  </Badge>
                  <Button size="icon" variant="ghost" onClick={() => openDetailDialog(venta)}>
                    <Eye className="h-4 w-4" />
                  </Button>
                  {venta.status === 'completada' && (
                    <Button size="icon" variant="ghost" onClick={() => handleCancelSale(venta.id)}>
                      <XCircle className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Fecha y hora</p>
                    <p className="font-semibold text-sm">{new Date(venta.date).toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Cliente</p>
                    <p className="font-semibold text-sm">{venta.clientName || 'Venta Rápida'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Cajero</p>
                    <p className="font-semibold text-sm">{venta.cashier}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Método de pago</p>
                    <p className="font-semibold text-sm">{venta.paymentMethod}</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Productos</p>
                  <p className="font-semibold text-sm">{venta.items.length} items</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalle de Venta - {selectedSale?.ticketNumber}</DialogTitle>
            <DialogDescription>
              {selectedSale && new Date(selectedSale.date).toLocaleString()}
            </DialogDescription>
          </DialogHeader>
          
          {selectedSale && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Cliente</p>
                  <p className="font-semibold">{selectedSale.clientName || 'Venta Rápida'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Cajero</p>
                  <p className="font-semibold">{selectedSale.cashier}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Método de Pago</p>
                  <p className="font-semibold">{selectedSale.paymentMethod}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Estado</p>
                  <Badge variant={selectedSale.status === 'completada' ? 'default' : 'destructive'}>
                    {selectedSale.status.toUpperCase()}
                  </Badge>
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3">Productos</h3>
                <div className="space-y-2">
                  {selectedSale.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">{item.productName}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.quantity} x S/ {item.price.toFixed(2)}
                        </p>
                      </div>
                      <p className="font-semibold">S/ {item.subtotal.toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between">
                  <p className="text-muted-foreground">Subtotal</p>
                  <p className="font-semibold">S/ {selectedSale.subtotal.toFixed(2)}</p>
                </div>
                {selectedSale.discount > 0 && (
                  <div className="flex justify-between text-destructive">
                    <p>Descuento</p>
                    <p className="font-semibold">- S/ {selectedSale.discount.toFixed(2)}</p>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <p>Total</p>
                  <p>S/ {selectedSale.total.toFixed(2)}</p>
                </div>
              </div>

              {selectedSale.pointsEarned && selectedSale.pointsEarned > 0 && (
                <div className="border-t pt-4">
                  <p className="text-sm text-muted-foreground">Puntos Ganados</p>
                  <p className="font-semibold text-primary">{selectedSale.pointsEarned} puntos</p>
                </div>
              )}

              {selectedSale.notes && (
                <div className="border-t pt-4">
                  <p className="text-sm text-muted-foreground">Comentarios</p>
                  <p className="font-semibold">{selectedSale.notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
