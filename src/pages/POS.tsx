import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useProducts, useClients, productKeys, clientKeys } from '@/hooks';
import type { Product, Client, PaymentMethod } from '@/types';
import { PAYMENT_METHODS, PAYMENT_METHOD_OPTIONS } from '@/constants/paymentMethods';
import { usePOS } from '@/contexts/POSContext';
import { Search, Plus, Minus, Trash2, User, FileText, DollarSign, X, ShoppingCart, Send } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/hooks/use-toast';
import { calculateTotalPoints, calculateProductPoints } from '@/utils/pointsCalculator';

export default function POS() {
  const [searchTerm, setSearchTerm] = useState('');
  const [clientSearchTerm, setClientSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isClientDialogOpen, setIsClientDialogOpen] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>(PAYMENT_METHODS.EFECTIVO);
  const [notes, setNotes] = useState('');
  const [discount, setDiscount] = useState(0);
  const [montoRecibido, setMontoRecibido] = useState<number | undefined>();
  
  // Estados para múltiples métodos de pago
  const [metodosPageo, setMetodosPageo] = useState<Array<{
    monto: number;
    metodoPago: PaymentMethod;
    referencia?: string;
  }>>([]);
  const [montoActual, setMontoActual] = useState<number>(0);
  const [referenciaActual, setReferenciaActual] = useState<string>('');
  
  const PRODUCTS_PER_PAGE = 9;

  // Query client para invalidar caché
  const queryClient = useQueryClient();

  // Usar los nuevos hooks - cargar TODO sin parámetros de búsqueda
  const { data: products = [], isLoading: productsLoading, error: productsError, refetch: refetchProducts } = useProducts();
  const { data: clients = [], isLoading: clientsLoading, refetch: refetchClients } = useClients();
  
  const {
    tickets,
    activeTicketId,
    createTicket,
    switchTicket,
    closeTicket,
    addItem,
    updateItemQuantity,
    removeItem,
    setTicketClient,
    setTicketNotes,
    applyDiscount,
    getActiveTicket,
    getTicketTotal,
    completeSale,
  } = usePOS();

  // Manejar errores de carga
  useEffect(() => {
    if (productsError) {
      toast({
        title: 'Error',
        description: 'Error al cargar productos',
        variant: 'destructive',
      });
    }
  }, [productsError]);

  // Resetear montoRecibido cuando se cierra el diálogo de pago
  useEffect(() => {
    if (!isPaymentOpen) {
      setMontoRecibido(undefined);
    }
  }, [isPaymentOpen]);

  // Filtrar productos localmente (patrón como en Clientes.tsx)
  const filteredProducts = (products || []).filter(producto => {
    if (!producto?.productoDescripcion || !producto?.codigoBarra) return false;
    
    const searchTermLower = searchTerm.toLowerCase();
    return (
      producto.productoDescripcion.toLowerCase().includes(searchTermLower) ||
      producto.codigoBarra.includes(searchTerm) ||
      (producto.categoria || '').toLowerCase().includes(searchTermLower)
    );
  });

  // Filtrar clientes localmente - por nombre, DNI o código corto
  const filteredClients = (clients || []).filter(cliente => {
    if (!cliente?.nombres || !cliente?.dni) return false;
    
    const searchTermLower = clientSearchTerm.toLowerCase();
    return (
      cliente.nombres.toLowerCase().includes(searchTermLower) ||
      cliente.apellidos.toLowerCase().includes(searchTermLower) ||
      cliente.dni.includes(clientSearchTerm) ||
      (cliente.codigoCorto || '').toLowerCase().includes(searchTermLower)
    );
  });

  const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);
  const displayProducts = filteredProducts.slice(
    (currentPage - 1) * PRODUCTS_PER_PAGE,
    currentPage * PRODUCTS_PER_PAGE
  );

  const activeTicket = getActiveTicket();
  const total = getTicketTotal();
  const pointsEarned = activeTicket ? calculateTotalPoints(activeTicket.items) : 0;

  const handleAddProduct = (product: Product) => {
    addItem(product, false);
    toast({
      title: 'Producto agregado',
      description: `${product.productoDescripcion} - S/ ${product.precio.toFixed(2)}`,
    });
  };

  const handleToggleWholesale = (itemIndex: number) => {
    const item = activeTicket?.items[itemIndex];
    if (!item) return;
    
    const product = products.find(p => p.id === item.productId);
    if (!product || !product.precioMayoreo) return;
    
    const isCurrentlyWholesale = item.isWholesale || false;
    
    // Remover el item actual
    removeItem(itemIndex);
    
    // Agregar con el nuevo estado de mayoreo
    addItem(product, !isCurrentlyWholesale);
  };

  const handleSelectClient = (client: Client) => {
    setTicketClient(client.id, client.nombres);
    setIsClientDialogOpen(false);
    setClientSearchTerm('');
    toast({
      title: 'Cliente seleccionado',
      description: `${client.nombres} - Puntos: ${client.puntosAcumulados}`,
    });
  };

  const handleRemoveClient = () => {
    setTicketClient(undefined, undefined);
    toast({
      title: 'Cliente removido',
      description: 'Venta sin cliente asociado',
    });
  };

  const handleUpdateNotes = () => {
    setTicketNotes(notes);
  };

  const handleUpdateDiscount = () => {
    applyDiscount(discount);
  };

  // Funciones para múltiples métodos de pago
  const agregarMetodoPago = () => {
    if (montoActual <= 0) {
      toast({
        title: 'Error',
        description: 'El monto debe ser mayor a 0',
        variant: 'destructive',
      });
      return;
    }

    const totalPagado = metodosPageo.reduce((sum, metodo) => sum + metodo.monto, 0);
    const montoRestante = total - totalPagado;

    if (montoActual > montoRestante) {
      toast({
        title: 'Error',
        description: `El monto no puede ser mayor al restante: S/ ${montoRestante.toFixed(2)}`,
        variant: 'destructive',
      });
      return;
    }

    const nuevoMetodo = {
      monto: montoActual,
      metodoPago: selectedPaymentMethod,
      referencia: referenciaActual || undefined,
    };

    setMetodosPageo([...metodosPageo, nuevoMetodo]);
    setMontoActual(0);
    setReferenciaActual('');
    
    toast({
      title: 'Método agregado',
      description: `${selectedPaymentMethod}: S/ ${montoActual.toFixed(2)}`,
    });
  };

  const removerMetodoPago = (index: number) => {
    const nuevosMetodos = metodosPageo.filter((_, i) => i !== index);
    setMetodosPageo(nuevosMetodos);
  };

  const getTotalPagado = () => {
    return metodosPageo.reduce((sum, metodo) => sum + metodo.monto, 0);
  };

  const getMontoRestante = () => {
    return total - getTotalPagado();
  };

  const isPagoCompleto = () => {
    return Math.abs(getMontoRestante()) < 0.01; // Tolerancia para decimales
  };

  /*const sendWhatsAppMessage = (clientPhone: string, points: number, total: number) => {
    const message = `¡Gracias por tu compra! 🎉\n\nTotal: S/ ${total.toFixed(2)}\nPuntos ganados: ${points}\n\n¡Vuelve pronto!`;
    const encodedMessage = encodeURIComponent(message);
    // Limpiar el teléfono: eliminar +, espacios y asegurar formato correcto
    const cleanPhone = clientPhone.replace(/[\s+]/g, '');
    // Si ya empieza con 51, no duplicar
    const phoneWithCountryCode = cleanPhone.startsWith('51') ? cleanPhone : `51${cleanPhone}`;
    const whatsappUrl = `https://wa.me/${phoneWithCountryCode}?text=${encodedMessage}`;
    console.log('WhatsApp URL generada:', whatsappUrl);
    window.open(whatsappUrl, '_blank');
  }; */

  const handleCheckout = async () => {
    if (!activeTicket || activeTicket.items.length === 0) {
      toast({
        title: 'Error',
        description: 'No hay productos en el ticket',
        variant: 'destructive',
      });
      return;
    }

    // Verificar si se están usando múltiples métodos de pago
    if (metodosPageo.length > 0) {
      // Validar que el pago esté completo
      if (!isPagoCompleto()) {
        toast({
          title: 'Error',
          description: `Falta pagar S/ ${getMontoRestante().toFixed(2)}`,
          variant: 'destructive',
        });
        return;
      }

      // Usar múltiples métodos de pago
      const metodoPrincipal = metodosPageo[0]?.metodoPago || selectedPaymentMethod;
      await completeSale(metodoPrincipal, 'Sistema', getTotalPagado(), metodosPageo);
    } else {
      // Usar método de pago único (comportamiento original)
      await completeSale(selectedPaymentMethod, 'Sistema', montoRecibido);
    }

    // Limpiar estados de múltiples métodos de pago
    setMetodosPageo([]);
    setMontoActual(0);
    setReferenciaActual('');
    setIsPaymentOpen(false);
    
    // Guardar referencia al cliente antes de completar la venta
    const currentClientId = activeTicket.clientId;
    
    // Obtener el cliente actualizado para obtener los puntos actualizados
    const client = clients.find(c => c.id === currentClientId);
    
    toast({
      title: 'Venta completada',
      description: `Total: S/ ${total.toFixed(2)} | Puntos: ${pointsEarned}`,
    });
    
    setIsPaymentOpen(false);
    setNotes('');
    setDiscount(0);
    setMontoRecibido(undefined);
    setSelectedPaymentMethod(PAYMENT_METHODS.EFECTIVO);
  };

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-background">
      {/* Main Panel - Tickets & Payment (Now Left/Top) */}
      <div className="flex-1 bg-card border-r lg:border-r border-b lg:border-b-0 flex flex-col overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <h1 className="text-2xl font-bold">Punto de Venta</h1>
          <Button onClick={createTicket} variant="outline" size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Ticket
          </Button>
        </div>

        <Tabs value={activeTicketId} onValueChange={switchTicket} className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="w-full justify-start rounded-none border-b bg-muted/50 overflow-x-auto flex-shrink-0">
            {tickets.map((ticket) => (
              <TabsTrigger 
                key={ticket.id} 
                value={ticket.id} 
                className="relative data-[state=active]:bg-background whitespace-nowrap"
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Ticket {ticket.id}
                {tickets.length > 1 && (
                  <X
                    className="ml-2 h-3 w-3 hover:text-destructive cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      closeTicket(ticket.id);
                    }}
                  />
                )}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value={activeTicketId} className="flex-1 flex flex-col m-0">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between mb-3">
                <CardTitle className="text-lg">Ticket #{activeTicketId}</CardTitle>
                <Dialog open={isClientDialogOpen} onOpenChange={setIsClientDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <User className="h-4 w-4 mr-2" />
                      {activeTicket?.clientName ? 'Cambiar' : 'Cliente'}
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Seleccionar Cliente</DialogTitle>
                      <DialogDescription>
                        Asocia un cliente a esta venta para acumular puntos
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-3">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                        <Input
                          type="text"
                          placeholder="Buscar por nombre, DNI o código..."
                          value={clientSearchTerm}
                          onChange={(e) => setClientSearchTerm(e.target.value)}
                          className="pl-9"
                        />
                      </div>
                      <div className="space-y-2 max-h-80 overflow-y-auto">
                        {filteredClients.length === 0 ? (
                          <p className="text-center text-muted-foreground py-4">
                            No se encontraron clientes
                          </p>
                        ) : (
                          filteredClients.map((client) => (
                        <Button
                          key={client.id}
                          variant="outline"
                          className="w-full justify-start"
                          onClick={() => handleSelectClient(client)}
                        >
                          <User className="h-4 w-4 mr-2" />
                          <div className="text-left flex-1">
                            <div className="font-medium">{client.nombres} {client.apellidos}</div>
                            <div className="text-xs text-muted-foreground">
                              <span className="font-mono text-primary">{client.codigoCorto || '-'}</span> • {client.puntosAcumulados} pts
                            </div>
                          </div>
                          </Button>
                          ))
                        )}
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              
              {activeTicket?.clientName && (
                <div className="flex items-center justify-between bg-primary/5 p-2 rounded-md">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-primary" />
                    <div>
                      <div className="text-sm font-medium">{activeTicket.clientName}</div>
                      <div className="text-xs text-muted-foreground">
                        {clients.find(c => c.id === activeTicket.clientId)?.puntosAcumulados || 0} puntos
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={handleRemoveClient}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </CardHeader>

            <CardContent className="flex-1 overflow-y-auto space-y-4">
              {!activeTicket?.items.length ? (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                  <FileText className="h-12 w-12 mb-2" />
                  <p>No hay productos en el ticket</p>
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    {activeTicket.items.map((item, itemIndex) => {
                      const product = products.find(p => p.id === item.productId);
                      // Solo mostrar badge de mayoreo si el producto TIENE precio de mayoreo > 0
                      const wholesalePrice = product?.precioMayoreo ? parseFloat(String(product.precioMayoreo)) : 0;
                      const hasWholesalePrice = wholesalePrice > 0;
                      const isWholesale = item.isWholesale || false;
                      // Solo mostrar puntos si el valor es mayor a 0
                      const showPointsBadge = item.puntosValor > 0;
                      
                      return (
                        <div key={`${item.productId}-${itemIndex}`} className="flex flex-col gap-2 p-2 bg-muted/50 rounded-lg">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate">{item.descripcion}</p>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <span>S/ {item.precio.toFixed(2)}</span>
                                {showPointsBadge && (
                                  <Badge variant="secondary" className="text-xs">
                                    {item.puntosValor} pts
                                  </Badge>
                                )}
                                {hasWholesalePrice && (
                                  <Badge 
                                    variant={isWholesale ? "default" : "outline"} 
                                    className="text-xs cursor-pointer"
                                    onClick={() => handleToggleWholesale(itemIndex)}
                                  >
                                    {isWholesale ? '✓ Mayoreo' : 'Normal'}
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <Button
                                size="icon"
                                variant="outline"
                                className="h-7 w-7"
                                onClick={() => updateItemQuantity(itemIndex, -1)}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="w-8 text-center font-medium">{item.cantidad}</span>
                              <Button
                                size="icon"
                                variant="outline"
                                className="h-7 w-7"
                                onClick={() => updateItemQuantity(itemIndex, 1)}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                            <div className="text-right min-w-[80px]">
                              <p className="font-bold">S/ {item.subtotal.toFixed(2)}</p>
                            </div>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-7 w-7"
                              onClick={() => removeItem(itemIndex)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <Separator />

                  {/* Descuento */}
                  <div className="space-y-2">
                    <Label>Descuento (S/)</Label>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={discount === 0 ? '' : discount}
                        onChange={(e) => setDiscount(e.target.value === '' ? 0 : parseFloat(e.target.value))}
                        placeholder="0.00"
                      />
                      <Button onClick={handleUpdateDiscount} variant="outline" size="sm">
                        Aplicar
                      </Button>
                    </div>
                  </div>

                  {/* Comentarios */}
                  <div className="space-y-2">
                    <Label>Comentarios</Label>
                    <Textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      onBlur={handleUpdateNotes}
                      placeholder="Notas de la venta..."
                      rows={2}
                    />
                  </div>
                </>
              )}
            </CardContent>

            <div className="p-4 border-t space-y-3 bg-muted/30">
              {activeTicket?.discount > 0 && (
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Descuento:</span>
                  <span>- S/ {activeTicket.discount.toFixed(2)}</span>
                </div>
              )}
              
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-lg font-bold">Total:</div>
                  <div className="text-xs text-muted-foreground">
                    {pointsEarned} puntos a ganar
                  </div>
                </div>
                <div className="text-2xl font-bold text-primary">
                  S/ {total.toFixed(2)}
                </div>
              </div>
              
              <Dialog open={isPaymentOpen} onOpenChange={setIsPaymentOpen}>
                <DialogTrigger asChild>
                  <Button 
                    className="w-full" 
                    size="lg"
                    disabled={!activeTicket?.items.length}
                  >
                    <DollarSign className="mr-2 h-5 w-5" />
                    Procesar Pago
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Procesar Pago</DialogTitle>
                    <DialogDescription>
                      Selecciona el método de pago para completar la venta
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-4 p-2 bg-muted/50 rounded-lg">
                      <div>
                        <div className="text-sm text-muted-foreground">Subtotal</div>
                        <div className="font-medium">S/ {(total + (activeTicket?.discount || 0)).toFixed(2)}</div>
                      </div>
                      {activeTicket?.discount > 0 && (
                        <div>
                          <div className="text-sm text-muted-foreground">Descuento</div>
                          <div className="font-medium text-destructive">- S/ {activeTicket.discount.toFixed(2)}</div>
                        </div>
                      )}
                      <div>
                        <div className="text-sm text-muted-foreground">Total</div>
                        <div className="text-xl font-bold text-primary">S/ {total.toFixed(2)}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Puntos</div>
                        <div className="font-medium text-primary">{pointsEarned} pts</div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Método de Pago</Label>
                      <Select value={selectedPaymentMethod} onValueChange={(value) => setSelectedPaymentMethod(value as PaymentMethod)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {PAYMENT_METHOD_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Sección de Múltiples Métodos de Pago */}
                    <div className="space-y-2 p-2 bg-purple-50 rounded-lg border border-purple-200">
                      <div className="font-medium text-sm text-purple-700">Múltiples Métodos de Pago</div>
                      
                      {/* Agregar método de pago */}
                      <div className="grid grid-cols-2 gap-1">
                        <div>
                          <Label htmlFor="montoActual" className="text-xs">Monto</Label>
                          <Input
                            id="montoActual"
                            type="number"
                            min="0"
                            step="0.01"
                            value={montoActual || ''}
                            onChange={(e) => setMontoActual(parseFloat(e.target.value) || 0)}
                            placeholder="0.00"
                            className="text-sm"
                          />
                        </div>
                        
                        <Button 
                        onClick={agregarMetodoPago} 
                        variant="outline" 
                        size="sm" 
                        className="w-full"
                        disabled={montoActual <= 0}
                      >
                        Agregar {selectedPaymentMethod} - S/ {montoActual.toFixed(2)}
                      </Button>
                      </div>
                      
                      

                      {/* Lista de métodos agregados */}
                      {metodosPageo.length > 0 && (
                        <div className="space-y-2">
                          <div className="text-xs font-medium text-blue-700">Métodos agregados:</div>
                          {metodosPageo.map((metodo, index) => (
                            <div key={index} className="flex items-center justify-between p-1 bg-white rounded border">
                              <div className="flex-1">
                                <div className="text-sm font-medium">{metodo.metodoPago}</div>
                                <div className="text-xs text-muted-foreground">
                                  S/ {metodo.monto.toFixed(2)}
                                  {metodo.referencia && ` - ${metodo.referencia}`}
                                </div>
                              </div>
                              <Button
                                onClick={() => removerMetodoPago(index)}
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                              >
                                ×
                              </Button>
                            </div>
                          ))}
                          
                          {/* Resumen de pagos */}
                          <div className="pt-2 border-t space-y-1">
                            <div className="flex justify-between text-sm">
                              <span>Total a pagar:</span>
                              <span className="font-medium">S/ {total.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>Total pagado:</span>
                              <span className="font-medium">S/ {getTotalPagado().toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm font-bold">
                              <span>Restante:</span>
                              <span className={getMontoRestante() > 0 ? 'text-destructive' : 'text-green-600'}>
                                S/ {getMontoRestante().toFixed(2)}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Sección de Cálculo de Vuelto */}
                    <div className="space-y-2 p-2 bg-muted/50 rounded-lg">
                      <div className="font-medium text-sm">Cálculo de Vuelto</div>
                      <div className="space-y-2">
                        <div>
                          <Label htmlFor="montoRecibido" className="text-xs">Monto Recibido (opcional)</Label>
                          <Input
                            id="montoRecibido"
                            type="number"
                            min="0"
                            step="0.01"
                            value={montoRecibido === undefined ? '' : montoRecibido}
                            onChange={(e) => setMontoRecibido(e.target.value === '' ? undefined : parseFloat(e.target.value))}
                            placeholder={`Total: S/ ${total.toFixed(2)}`}
                            className="text-sm"
                          />
                        </div>
                        {montoRecibido !== undefined && montoRecibido >= 0 && (
                          <div className="space-y-2">
                            {montoRecibido < total && (
                              <div className="text-sm text-destructive font-medium">
                                Monto insuficiente: Falta S/ {(total - montoRecibido).toFixed(2)}
                              </div>
                            )}
                            {montoRecibido >= total && (
                              <>
                                <div className="flex justify-between text-sm">
                                  <span className="text-muted-foreground">Monto recibido:</span>
                                  <span className="font-medium">S/ {montoRecibido.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-sm border-t pt-1">
                                  <span className="font-medium">Vuelto:</span>
                                  <span className="text-lg font-bold text-primary">S/ {(montoRecibido - total).toFixed(2)}</span>
                                </div>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {activeTicket?.clientName && (
                      <div className="flex items-center gap-2 p-3 bg-primary/5 rounded-lg">
                        <User className="h-4 w-4 text-primary" />
                        <div className="flex-1">
                          <div className="text-sm font-medium">{activeTicket.clientName}</div>
                          <div className="text-xs text-muted-foreground">
                            Se enviará resumen por WhatsApp
                          </div>
                        </div>
                        <Send className="h-4 w-4 text-primary" />
                      </div>
                    )}

                    <Button 
                      onClick={handleCheckout} 
                      className="w-full" 
                      size="lg"
                      disabled={metodosPageo.length > 0 && !isPagoCompleto()}
                    >
                      <DollarSign className="mr-2 h-5 w-5" />
                      {metodosPageo.length > 0 
                        ? `Confirmar Pago - S/ ${getTotalPagado().toFixed(2)} de S/ ${total.toFixed(2)}`
                        : `Confirmar Pago - S/ ${total.toFixed(2)}`
                      }
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Secondary Panel - Products (Now Right/Bottom) */}
      <div className="w-full lg:w-96 bg-background p-4 lg:p-6 overflow-y-auto flex flex-col">
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Buscar productos..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-10"
            />
          </div>
        </div>

        <div className="flex-1 space-y-3 mb-4">
          {displayProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <Search className="h-12 w-12 mb-2" />
              <p>No se encontraron productos</p>
            </div>
          ) : (
            displayProducts.map((product) => (
              <Card
                key={product.id}
                className="cursor-pointer hover:shadow-md transition-shadow group"
                onClick={() => handleAddProduct(product)}
              >
                <CardContent className="p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm truncate mb-1">{product.productoDescripcion}</h3>
                      <div className="flex flex-col gap-1 mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">Normal:</span>
                          <span className="text-lg font-bold text-primary">
                            S/ {product.precio?.toFixed(2) || '0.00'}
                          </span>
                        </div>
                       
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={product.cantidadActual > 10 ? 'default' : 'destructive'} className="text-xs">
                          Stock: {product.cantidadActual || 0}
                        </Badge>
                        {product.valorPuntos > 0 && (
                          <Badge variant="secondary" className="text-xs">
                            {product.valorPuntos} pts
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  {/* Botón para agregar producto */}
                  <Button
                    size="sm"
                    className="w-full mt-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddProduct(product);
                    }}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Agregar
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t pt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Anterior
            </Button>
            <span className="text-sm text-muted-foreground">
              Página {currentPage} de {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Siguiente
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
