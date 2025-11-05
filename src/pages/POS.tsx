import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { productsAPI, clientsAPI } from '@/services/api';
import type { Product, Client, PaymentMethod } from '@/types';
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
  const [products, setProducts] = useState<Product[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [clientSearchTerm, setClientSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isClientDialogOpen, setIsClientDialogOpen] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>('Efectivo');
  const [notes, setNotes] = useState('');
  const [discount, setDiscount] = useState(0);
  
  const PRODUCTS_PER_PAGE = 9;
  
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

  useEffect(() => {
    const loadData = async () => {
      try {
        const [productsData, clientsData] = await Promise.all([
          productsAPI.getAll(),
          clientsAPI.getAll(),
        ]);
        setProducts(productsData);
        setClients(clientsData);
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Error al cargar datos',
          variant: 'destructive',
        });
      }
    };
    loadData();
  }, []);

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.barcode.includes(searchTerm)
  );

  const filteredClients = clients.filter(
    (client) =>
      client.name.toLowerCase().includes(clientSearchTerm.toLowerCase()) ||
      client.dni?.includes(clientSearchTerm) ||
      client.phone?.includes(clientSearchTerm)
  );

  const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * PRODUCTS_PER_PAGE,
    currentPage * PRODUCTS_PER_PAGE
  );

  const activeTicket = getActiveTicket();
  const total = getTicketTotal();
  const pointsEarned = activeTicket ? calculateTotalPoints(activeTicket.items) : 0;

  const handleAddProduct = (product: Product) => {
    const pointsValue = calculateProductPoints(product);
    addItem(product.id, product.name, product.price, pointsValue);
    toast({
      title: 'Producto agregado',
      description: `${product.name} agregado al ticket`,
    });
  };

  const handleSelectClient = (client: Client) => {
    setTicketClient(client.id, client.name);
    setIsClientDialogOpen(false);
    setClientSearchTerm('');
    toast({
      title: 'Cliente seleccionado',
      description: `${client.name} - Puntos: ${client.points}`,
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

  const sendWhatsAppMessage = (clientPhone: string, points: number, total: number) => {
    const message = `¡Gracias por tu compra! 🎉\n\nTotal: S/ ${total.toFixed(2)}\nPuntos ganados: ${points}\n\n¡Vuelve pronto!`;
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/51${clientPhone}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleCheckout = async () => {
    if (!activeTicket || activeTicket.items.length === 0) {
      toast({
        title: 'Error',
        description: 'No hay productos en el ticket',
        variant: 'destructive',
      });
      return;
    }

    await completeSale(selectedPaymentMethod);
    
    // Enviar WhatsApp si hay cliente
    const client = clients.find(c => c.id === activeTicket.clientId);
    if (client && client.phone) {
      sendWhatsAppMessage(client.phone, pointsEarned, total);
    }
    
    toast({
      title: 'Venta completada',
      description: `Total: S/ ${total.toFixed(2)} | Puntos: ${pointsEarned}`,
    });
    
    setIsPaymentOpen(false);
    setNotes('');
    setDiscount(0);
    setSelectedPaymentMethod('Efectivo');
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
                          placeholder="Buscar por nombre, DNI, teléfono..."
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
                            <div className="font-medium">{client.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {client.phone} • {client.points} pts
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
                        {clients.find(c => c.id === activeTicket.clientId)?.points || 0} puntos
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
                    {activeTicket.items.map((item) => (
                      <div key={item.productId} className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{item.productName}</p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>S/ {item.price.toFixed(2)}</span>
                            <Badge variant="secondary" className="text-xs">
                              {item.pointsValue} pts
                            </Badge>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            size="icon"
                            variant="outline"
                            className="h-7 w-7"
                            onClick={() => updateItemQuantity(item.productId, -1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center font-medium">{item.quantity}</span>
                          <Button
                            size="icon"
                            variant="outline"
                            className="h-7 w-7"
                            onClick={() => updateItemQuantity(item.productId, 1)}
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
                          onClick={() => removeItem(item.productId)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
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
                        value={discount}
                        onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
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
                    <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
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
                          <SelectItem value="Efectivo">💵 Efectivo</SelectItem>
                          <SelectItem value="Yape">📱 Yape</SelectItem>
                          <SelectItem value="Plin">📱 Plin</SelectItem>
                          <SelectItem value="Tarjeta">💳 Tarjeta</SelectItem>
                        </SelectContent>
                      </Select>
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

                    <Button onClick={handleCheckout} className="w-full" size="lg">
                      <DollarSign className="mr-2 h-5 w-5" />
                      Confirmar Pago - S/ {total.toFixed(2)}
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
          {paginatedProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <Search className="h-12 w-12 mb-2" />
              <p>No se encontraron productos</p>
            </div>
          ) : (
            paginatedProducts.map((product) => (
              <Card
                key={product.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleAddProduct(product)}
              >
                <CardContent className="p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm truncate mb-1">{product.name}</h3>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-primary">
                          S/ {product.price.toFixed(2)}
                        </span>
                        <Badge variant={product.stock > 10 ? 'default' : 'destructive'} className="text-xs">
                          {product.stock}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {calculateProductPoints(product)} pts
                      </p>
                    </div>
                    <Plus className="h-5 w-5 text-primary flex-shrink-0" />
                  </div>
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
