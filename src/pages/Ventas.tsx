import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { TrendingUp, Calendar, User, CreditCard, Download, Eye, XCircle, Ban, FileSpreadsheet, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { salesService } from "@/services/salesService";
import type { Sale } from "@/types";

export default function Ventas() {
  const [ventas, setVentas] = useState<Sale[]>([]);
  const [filteredVentas, setFilteredVentas] = useState<Sale[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cancelingIds, setCancelingIds] = useState<Set<number>>(new Set());
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;
  const [dateFilter, setDateFilter] = useState({
    startDate: '',
    endDate: '',
  });

  useEffect(() => {
    loadVentas();
  }, []);

  const filterVentas = () => {
    // Asegurar que ventas sea un array antes de usar spread operator
    let filtered = [...(ventas || [])];

    if (dateFilter.startDate) {
      filtered = filtered.filter(v => new Date(v.fecha) >= new Date(dateFilter.startDate));
    }
    if (dateFilter.endDate) {
      filtered = filtered.filter(v => new Date(v.fecha) <= new Date(dateFilter.endDate));
    }
    
    setFilteredVentas(filtered);
    setCurrentPage(1);
  };

  useEffect(() => {
    filterVentas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ventas, dateFilter]);

  const loadVentas = async () => {
    try {
      const data = await salesService.getAll();
      setVentas(data);
    } catch (error) {
      toast.error('Error al cargar ventas');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelSale = async (id: number) => {
    if (!confirm('¿Estás seguro de anular esta venta? Esta acción no se puede deshacer.')) {
      return;
    }

    // Agregar ID al set de cargando
    setCancelingIds(prev => new Set(prev).add(id));
    
    try {
      const updatedSale = await salesService.cancel(id);
      
      // Actualizar la venta en la lista
      setVentas(prev => 
        prev.map(v => v.id === id ? { ...v, estado: updatedSale.estado } : v)
      );
      
      toast.success('Venta anulada correctamente');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al anular venta';
      toast.error(errorMessage);
      console.error('Error canceling sale:', error);
    } finally {
      // Remover ID del set de cargando
      setCancelingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  const openDetailDialog = (sale: Sale) => {
    setSelectedSale(sale);
    setIsDetailDialogOpen(true);
  };

  const exportToExcel = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        toast.error('No hay sesión activa');
        return;
      }

      // Construir URL con parámetros de fecha
      const params = new URLSearchParams();
      if (dateFilter.startDate) params.append('fechaInicio', dateFilter.startDate);
      if (dateFilter.endDate) params.append('fechaFin', dateFilter.endDate);
      params.append('tipoReporte', 'VENTAS');
      params.append('incluirDetalles', 'false');

      const url = `${import.meta.env.VITE_API_BASE_URL}/excel/export-ventas?${params.toString()}`;
      
      toast.loading('Generando archivo Excel...');
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Error al exportar ventas');
      }

      const blob = await response.blob();
      const downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `ventas_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(downloadUrl);

      toast.dismiss();
      toast.success('Ventas exportadas correctamente');
    } catch (error) {
      toast.dismiss();
      console.error('Error exporting sales:', error);
      toast.error('Error al exportar ventas');
    }
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
        
        <Button onClick={exportToExcel} className="w-full sm:w-auto">
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          Exportar Excel
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
        {filteredVentas
          .slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)
          .map((venta) => (
          <Card key={venta.id} className="hover:shadow-lg transition-all">
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                <CardTitle className="flex items-center gap-3 text-lg">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  {venta.ticketId}
                </CardTitle>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <Badge variant="default" className="text-lg font-bold">
                    S/ {venta.total.toFixed(2)}
                  </Badge>
                  <Badge variant={venta.estado === 'completada' ? 'default' : 'destructive'}>
                    {venta.estado.toUpperCase()}
                  </Badge>
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    onClick={() => openDetailDialog(venta)}
                    title="Ver detalles de la venta"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  {venta.estado === 'COMPLETADO' && (
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      onClick={() => handleCancelSale(venta.id)}
                      disabled={cancelingIds.has(venta.id)}
                      title="Anular esta venta"
                      className="hover:text-destructive"
                    >
                      {cancelingIds.has(venta.id) ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Ban className="h-4 w-4" />
                      )}
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
                    <p className="font-semibold text-sm">{new Date(venta.fecha).toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Cliente</p>
                    <p className="font-semibold text-sm">{venta.cliente?.nombres + ' ' + venta.cliente?.apellidos || 'Venta Rápida'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Cajero</p>
                    <p className="font-semibold text-sm">{venta.cajero}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Método de pago</p>
                    <p className="font-semibold text-sm">{venta.metodoPago}</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Productos</p>
                  <p className="font-semibold text-sm">{venta.listaProductos.length} items</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredVentas.length > ITEMS_PER_PAGE && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
              />
            </PaginationItem>
            {Array.from({ length: Math.ceil(filteredVentas.length / ITEMS_PER_PAGE) }, (_, i) => i + 1)
              .filter(page => {
                const totalPages = Math.ceil(filteredVentas.length / ITEMS_PER_PAGE);
                return page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1;
              })
              .map((page, idx, arr) => {
                if (idx > 0 && page - arr[idx - 1] > 1) {
                  return (
                    <React.Fragment key={`ellipsis-${page}`}>
                      <PaginationItem>
                        <span className="px-4">...</span>
                      </PaginationItem>
                      <PaginationItem>
                        <PaginationLink
                          onClick={() => setCurrentPage(page)}
                          isActive={currentPage === page}
                          className="cursor-pointer"
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    </React.Fragment>
                  );
                }
                return (
                  <PaginationItem key={page}>
                    <PaginationLink
                      onClick={() => setCurrentPage(page)}
                      isActive={currentPage === page}
                      className="cursor-pointer"
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}
            <PaginationItem>
              <PaginationNext 
                onClick={() => setCurrentPage(p => Math.min(Math.ceil(filteredVentas.length / ITEMS_PER_PAGE), p + 1))}
                className={currentPage >= Math.ceil(filteredVentas.length / ITEMS_PER_PAGE) ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalle de Venta - {selectedSale?.ticketId}</DialogTitle>
            <DialogDescription>
              {selectedSale && new Date(selectedSale.fecha).toLocaleString()}
            </DialogDescription>
          </DialogHeader>
          
          {selectedSale && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Cliente</p>
                  <p className="font-semibold">{selectedSale.cliente?.nombres + ' ' + selectedSale.cliente?.apellidos || 'Venta Rápida'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Cajero</p>
                  <p className="font-semibold">{selectedSale.cajero}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Método de Pago</p>
                  <p className="font-semibold">{selectedSale.metodoPago}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Estado</p>
                  <Badge variant={selectedSale.estado === 'completada' ? 'default' : 'destructive'}>
                    {selectedSale.estado.toUpperCase()}
                  </Badge>
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3">Productos</h3>
                <div className="space-y-2">
                  {selectedSale.listaProductos.map((item, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">{item.descripcion}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.cantidad} x S/ {item.precio.toFixed(2)}
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
                  <p className="font-semibold">S/ {selectedSale.subTotal.toFixed(2)}</p>
                </div>
                {selectedSale.descuento > 0 && (
                  <div className="flex justify-between text-destructive">
                    <p>Descuento</p>
                    <p className="font-semibold">- S/ {selectedSale.descuento.toFixed(2)}</p>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <p>Total</p>
                  <p>S/ {selectedSale.total.toFixed(2)}</p>
                </div>
              </div>

              {selectedSale.puntosOtorgados && selectedSale.puntosOtorgados > 0 && (
                <div className="border-t pt-4">
                  <p className="text-sm text-muted-foreground">Puntos Ganados</p>
                  <p className="font-semibold text-primary">{selectedSale.puntosOtorgados} puntos</p>
                </div>
              )}

              {selectedSale.comentario && (
                <div className="border-t pt-4">
                  <p className="text-sm text-muted-foreground">Comentarios</p>
                  <p className="font-semibold">{selectedSale.comentario}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
