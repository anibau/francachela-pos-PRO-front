import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MoneyInput } from '@/components/ui/money-input';
import { useProducts, useClients, productKeys, clientKeys } from '@/hooks';
import type { Product, Client, PaymentMethod } from '@/types';
import { PAYMENT_METHODS, PAYMENT_METHOD_OPTIONS } from '@/constants/paymentMethods';
import { usePOS } from '@/contexts/POSContext';
import { roundMoney, roundToNearestDime } from '@/utils/moneyUtils';
import { calculateTicketTotal } from '@/utils/calculateTicketTotal';
import { Search, Plus, Minus, Trash2, User, FileText, DollarSign, X, ShoppingCart, Send, Calculator, ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from '@/hooks/use-toast';
import { calculateTotalPoints, calculateProductPoints } from '@/utils/pointsCalculator';
import { pointsService } from '@/services/pointsService';

export default function POS() {
  const [searchTerm, setSearchTerm] = useState('');
  const [clientSearchTerm, setClientSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isClientDialogOpen, setIsClientDialogOpen] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>(PAYMENT_METHODS.EFECTIVO);
  
  // Estados para flujo POS profesional
  const [isCashRegisterDialogOpen, setIsCashRegisterDialogOpen] = useState(false);
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false);

  // Los descuentos y recargos ahora se manejan directamente en el ticket activo
  const [montoRecibido, setMontoRecibido] = useState<number | undefined>();
  const [showChangeCalculator, setShowChangeCalculator] = useState(false);
  
  // Estados para múltiples métodos de pago
  const [metodosPageo, setMetodosPageo] = useState<Array<{
    monto: number;
    metodoPago: PaymentMethod;
    referencia?: string;
  }>>([]);
  const [montoActual, setMontoActual] = useState<number>(0);
  const [referenciaActual, setReferenciaActual] = useState<string>('');
  
  // DEFECTO 3: Estados para puntos a usar y evaluación
  const [puntosAUsar, setPuntosAUsar] = useState<number>(0);
  const [pointsEvaluation, setPointsEvaluation] = useState<any>(null);
  
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
    applyRecargoExtra,
    getActiveTicket,
    completeSale,
    // Nuevos métodos para flujo profesional
    cashRegisterState,
    salePreview,
    isLoadingPreview,
    isLoadingCashState,
    checkCashRegisterState,
    previewSale,
    clearPreview,
  } = usePOS();

  // Obtener valores del ticket activo
  const activeTicket = getActiveTicket();
  const currentDiscount = activeTicket?.discount || 0;
  const currentRecargoExtra = activeTicket?.recargoExtra || 0;

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

  // ETAPA 1-2: Verificar estado de caja al cargar el POS
  useEffect(() => {
    const initializePOS = async () => {
      await checkCashRegisterState();
      
      // Si no hay caja abierta, mostrar modal obligatorio
      if (cashRegisterState && !cashRegisterState.abierta) {
        setIsCashRegisterDialogOpen(true);
      }
    };

    initializePOS();
  }, [checkCashRegisterState]);

  // Reaccionar a cambios en el estado de la caja
  useEffect(() => {
    if (cashRegisterState && !cashRegisterState.abierta) {
      setIsCashRegisterDialogOpen(true);
    } else if (cashRegisterState && cashRegisterState.abierta) {
      setIsCashRegisterDialogOpen(false);
    }
  }, [cashRegisterState]);

  // Resetear montoRecibido cuando se cierra el diálogo de pago
  useEffect(() => {
    if (!isPaymentOpen) {
      setMontoRecibido(undefined);
    }
  }, [isPaymentOpen]);

  // Actualizar recargo automáticamente cuando cambie el método de pago
  useEffect(() => {
    handleUpdateRecargoExtra();
  }, [selectedPaymentMethod, currentRecargoExtra]);

  // Limpiar descuento, recargo y notas cuando el ticket se vacía
  useEffect(() => {
    if (activeTicket && activeTicket.items.length === 0) {
      // Solo limpiar si hay valores que limpiar
      if (activeTicket.discount > 0 || activeTicket.recargoExtra > 0 || activeTicket.notes) {
        applyDiscount(0);
        applyRecargoExtra(0);
        setTicketNotes('');
      }
    }
  }, [activeTicket?.items.length, activeTicket?.id]);


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

  // 🎯 MOTOR ÚNICO DE CÁLCULO - Total del ticket con todos los factores
  // Fórmula: subtotal - descuento + recargo - descuentoPuntos
  const pointsDiscount = pointsEvaluation?.descuento || 0;
  const total = calculateTicketTotal(
    activeTicket?.items || [],
    currentDiscount,
    currentRecargoExtra,
    pointsDiscount
  );
  
  const pointsEarned = activeTicket ? calculateTotalPoints(activeTicket.items) : 0;


  const handleAddProduct = (product: Product) => {
    // Validar que hay un ticket activo seleccionado
    if (!activeTicket) {
      toast({
        title: 'Error',
        description: 'Selecciona un ticket antes de agregar productos',
        variant: 'destructive',
      });
      return;
    }

    // ETAPA 3: Validar stock disponible
    if (product.usaInventario && product.cantidadActual <= 0) {
      toast({
        title: 'Stock insuficiente',
        description: `No hay stock disponible para ${product.productoDescripcion}`,
        variant: 'destructive',
      });
      return;
    }

    // Verificar si el producto ya está en el ticket para validar cantidad total
    const existingItem = activeTicket.items.find(item => item.productId === product.id);
    const currentQuantityInTicket = existingItem ? existingItem.cantidad : 0;
    
    if (product.usaInventario && (currentQuantityInTicket + 1) > product.cantidadActual) {
      toast({
        title: 'Stock insuficiente',
        description: `Solo hay ${product.cantidadActual} unidades disponibles de ${product.productoDescripcion}`,
        variant: 'destructive',
      });
      return;
    }

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



  const handleUpdateRecargoExtra = () => {
    // Calcular recargo automático si el método de pago es TARJETA
    let recargoFinal = currentRecargoExtra;
    
    if (selectedPaymentMethod === PAYMENT_METHODS.TARJETA) {
      if (activeTicket) {
        const subtotal = activeTicket.items.reduce((sum, item) => sum + item.subtotal, 0);
        const total = subtotal - activeTicket.discount;
        const recargoAutomatico = total * 0.0005; // 0.05% del total
        recargoFinal = currentRecargoExtra + recargoAutomatico;
      }
    }
    
    applyRecargoExtra(recargoFinal);
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

    // Usar montoRecibido (del preview) como el monto total a cubrir, no el total calculado
    const totalParaPago = montoRecibido || total;
    const totalPagado = metodosPageo.reduce((sum, metodo) => sum + metodo.monto, 0);
    const montoRestante = totalParaPago - totalPagado;

    if (montoActual > montoRestante + 0.01) { // Pequeña tolerancia por redondeo
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
    return roundToNearestDime(
      metodosPageo.reduce((sum, metodo) => sum + metodo.monto, 0)
    );
  };

  const getMontoRestante = () => {
    // Usar montoRecibido del preview como el monto total a cubrir
    const totalParaPago = montoRecibido || total;
    return roundToNearestDime(totalParaPago - getTotalPagado());
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

  // DEFECTO 3: Función para evaluar puntos/promociones
  const handleEvaluatePoints = async () => {
    if (!activeTicket?.clientId || !puntosAUsar || puntosAUsar <= 0) {
      toast({
        title: 'Error',
        description: 'Selecciona un cliente e ingresa puntos válidos',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Construir items con estructura correcta para el backend
      const itemsForEvaluation = activeTicket.items.map(item => ({
        productoId: item.productId,
        cantidad: item.cantidad
      }));

      const evaluation = await pointsService.evaluate({
        clienteId: activeTicket.clientId,
        items: itemsForEvaluation,
        puntosSolicitados: puntosAUsar
      });

      // Validar: si se aceptaron menos puntos de los solicitados, mostrar warning
      const esValido = evaluation.puntosAceptados === puntosAUsar;
      console.log('Evaluación de puntos:', evaluation);
      console.log('Es válido:', esValido);
      if (!esValido) {
        toast({
          title: 'Puntos ajustados',
          description: `Solicitados: ${puntosAUsar}, Aceptados: ${evaluation.puntosAceptados}. ${evaluation.mensaje}`,
          variant: 'default',
        });
      }

      // Guardar evaluación para mostrar en UI
      setPointsEvaluation(evaluation);
      
      toast({
        title: '✅ Puntos evaluados',
        description: `Descuento: S/ ${evaluation.descuento.toFixed(2)} (${evaluation.puntosAceptados} pts)`,
      });
    } catch (error) {
      console.error('Error evaluating points:', error);
      toast({
        title: 'Error',
        description: 'Error al evaluar puntos',
        variant: 'destructive',
      });
      setPointsEvaluation(null);
    }
  };

  // DEFECTO 4: Función para abrir dialog de pago y ejecutar preview (Botón "Pagar")
  const handleShowPreview = async () => {
    if (!activeTicket || activeTicket.items.length === 0) {
      toast({
        title: 'Error',
        description: 'No hay productos en el ticket',
        variant: 'destructive',
      });
      return;
    }

    try {
      // ETAPA A: Ejecutar PREVIEW DE LA VENTA (validación final del backend)
      toast({
        title: 'Validando venta...',
        description: 'Ejecutando validación final contra el backend',
      });

      // Usar puntosAceptados si ya fue evaluado, sino usar puntosAUsar
      const puntosParaPreview = pointsEvaluation?.puntosAceptados || (puntosAUsar > 0 ? puntosAUsar : undefined);
      
      const previewResult = await previewSale(
        puntosParaPreview,
        total,  // montoRecibido = total a pagar
        currentDiscount > 0 ? currentDiscount : undefined,
        currentRecargoExtra > 0 ? currentRecargoExtra : undefined
      );

      // ETAPA C: Validar si el preview es válido
      if (previewResult && previewResult.validaciones.stockSuficiente && previewResult.validaciones.puntosValidos) {
        // Si el backend corrigió el total, actualizar montoRecibido en el estado
        const montoFinal = previewResult.totalCobrado || total;
        if (Math.abs(montoFinal - total) > 0.01) {
          setMontoRecibido(montoFinal);
          toast({
            title: '⚠️ Total actualizado',
            description: `Monto a pagar: S/ ${montoFinal.toFixed(2)}`,
            variant: 'default',
          });
        } else {
          setMontoRecibido(total);
        }
        
        // Limpiar metodosPageo al abrir el dialog - permitirá que se agreguen métodos desde cero
        // basados en el nuevo montoRecibido
        setMetodosPageo([]);
        setMontoActual(0);
        setReferenciaActual('');
        setIsPaymentOpen(true);
      } else {
        // Mostrar mensajes de validación
        const mensajes = previewResult?.validaciones.mensajes || [];
        const detalleError = mensajes.length > 0 ? mensajes.join(', ') : 'Revisa los datos e intenta nuevamente';
        
        toast({
          title: 'Error en validación',
          description: detalleError,
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error in preview:', error);
      toast({
        title: 'Error',
        description: 'Error al validar la venta',
        variant: 'destructive',
      });
    }
  };

  // DEFECTO 4: Función para confirmar venta (Botón "Confirmar" en dialog de pago)
  const handleConfirmSale = async () => {
    if (!activeTicket || activeTicket.items.length === 0) {
      toast({
        title: 'Error',
        description: 'No hay productos en el ticket',
        variant: 'destructive',
      });
      return;
    }

    // Validar que el preview fue ejecutado correctamente
    if (!salePreview || !salePreview.validaciones.stockSuficiente || !salePreview.validaciones.puntosValidos) {
      toast({
        title: 'Error',
        description: 'La venta no ha sido validada. Presiona Pagar nuevamente.',
        variant: 'destructive',
      });
      return;
    }

    try {
      // ETAPA A: Validar métodos de pago
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
      }

      // ETAPA B: Confirmar venta con datos validados
      toast({
        title: 'Procesando venta...',
        description: 'Confirmando venta en el backend',
      });

      // Obtener puntos usados del preview o de la evaluación
      const puntosUsados = pointsEvaluation?.puntosAceptados || 0;
      // Usar montoRecibido del preview (debe ser sincronizado con metodosPageo)
      const montoFinalPagar = montoRecibido || total;

      if (metodosPageo.length > 0) {
        // Usar múltiples métodos de pago - la suma debe ser igual a montoRecibido
        const metodoPrincipal = metodosPageo[0]?.metodoPago || selectedPaymentMethod;
        const totalPagado = getTotalPagado();
        
        // Validar que la suma de metodosPageo coincida con montoRecibido
        if (Math.abs(totalPagado - montoFinalPagar) > 0.01) {
          toast({
            title: 'Error',
            description: `Los métodos de pago (S/ ${totalPagado.toFixed(2)}) no coinciden con el total (S/ ${montoFinalPagar.toFixed(2)})`,
            variant: 'destructive',
          });
          return;
        }
        
        await completeSale(metodoPrincipal, 'Sistema', montoFinalPagar, metodosPageo, products, refetchProducts, refetchClients, puntosUsados);
      } else {
        // Usar método de pago único
        await completeSale(selectedPaymentMethod, 'Sistema', montoFinalPagar, undefined, products, refetchProducts, refetchClients, puntosUsados);
      }

      // ETAPA C: Finalización y limpieza completa
      const finalTotal = metodosPageo.length > 0 ? getTotalPagado() : total;
      
      // Limpiar todos los estados
      setMetodosPageo([]);
      setMontoActual(0);
      setReferenciaActual('');
      setIsPaymentOpen(false);
      setIsPreviewDialogOpen(false);
      setPuntosAUsar(0);
      setPointsEvaluation(null);
      setMontoRecibido(undefined);
      setSelectedPaymentMethod(PAYMENT_METHODS.EFECTIVO);
      
      // Limpiar preview
      clearPreview();
      
      // Mensaje de éxito final
      toast({
        title: '✅ Venta completada exitosamente',
        description: `Total cobrado: S/ ${finalTotal.toFixed(2)} | Puntos: ${pointsEarned}`,
      });

    } catch (error) {
      console.error('Error in sale confirmation:', error);
      toast({
        title: 'Error en la venta',
        description: 'Error al procesar la venta. Intenta nuevamente.',
        variant: 'destructive',
      });
    }
  };

  // Función para confirmar venta desde el botón en el dialog
  const handleCheckout = async () => {
    await handleConfirmSale();
  };

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-4rem)] bg-background overflow-hidden">
      {/* Main Panel - Tickets & Payment */}
      <div className="flex-1 bg-card border-r flex flex-col min-h-0 overflow-hidden">
        <div className="flex items-center justify-between p-3 border-b shrink-0">
          <h1 className="text-xl font-bold">Punto de Venta</h1>
          <Button onClick={createTicket} variant="outline" size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Nuevo
          </Button>
        </div>

        <Tabs value={activeTicketId} onValueChange={switchTicket} className="flex-1 flex flex-col min-h-0">
          <TabsList className="w-full justify-start rounded-none border-b bg-muted/50 overflow-x-auto shrink-0 h-9">
            {tickets.map((ticket) => (
              <TabsTrigger 
                key={ticket.id} 
                value={ticket.id} 
                className="relative data-[state=active]:bg-background whitespace-nowrap text-xs px-2"
              >
                <ShoppingCart className="h-3 w-3 mr-1" />
                T-{ticket.id.slice(-4)}
                {tickets.length > 1 && (
                  <X
                    className="ml-1 h-3 w-3 hover:text-destructive cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      closeTicket(ticket.id);
                    }}
                  />
                )}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value={activeTicketId} className="flex-1 flex flex-col m-0 min-h-0 overflow-hidden">
            <CardHeader className="pb-2 shrink-0">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Ticket #{activeTicketId?.slice(-4)}</CardTitle>
                <Dialog open={isClientDialogOpen} onOpenChange={setIsClientDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="h-7 text-xs">
                      <User className="h-3 w-3 mr-1" />
                      {activeTicket?.clientName ? activeTicket.clientName.split(' ')[0] : 'Cliente'}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-sm">
                    <DialogHeader>
                      <DialogTitle>Seleccionar Cliente</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-2">
                      <div className="relative">
                        <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                        <Input
                          placeholder="Buscar..."
                          value={clientSearchTerm}
                          onChange={(e) => setClientSearchTerm(e.target.value)}
                          className="pl-8 h-8"
                        />
                      </div>
                      <ScrollArea className="h-60">
                        <div className="space-y-1">
                          {filteredClients.length === 0 ? (
                            <p className="text-center text-muted-foreground py-4 text-sm">Sin resultados</p>
                          ) : (
                            filteredClients.map((client) => (
                              <Button
                                key={client.id}
                                variant="ghost"
                                className="w-full justify-start h-auto py-2"
                                onClick={() => handleSelectClient(client)}
                              >
                                <div className="text-left">
                                  <div className="text-sm font-medium">{client.nombres} {client.esCumpleañosHoy ? <span className="text-green-500">🎂</span> : ''}</div>
                                  <div className="text-xs text-muted-foreground">
                                    {client.codigoCorto || client.dni} • {client.puntosAcumulados} pts
                                  </div>
                                </div>
                              </Button>
                            ))
                          )}
                        </div>
                      </ScrollArea>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              
              {activeTicket?.clientName && (
                <div className="flex items-center justify-between bg-primary/5 p-1.5 rounded text-xs mt-1">
                  <span className="font-medium">{activeTicket.clientName}</span>
                  <Button variant="ghost" size="sm" className="h-5 w-5 p-0" onClick={handleRemoveClient}>
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </CardHeader>

            {/* Items list with ScrollArea */}
            <ScrollArea className="flex-1 min-h-0">
              <CardContent className="p-2 space-y-2">
                {!activeTicket?.items.length ? (
                  <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                    <FileText className="h-8 w-8 mb-2" />
                    <p className="text-sm">Sin productos</p>
                  </div>
                ) : (
                  activeTicket.items.map((item, itemIndex) => {
                    const product = products.find(p => p.id === item.productId);
                    const wholesalePrice = product?.precioMayoreo ? parseFloat(String(product.precioMayoreo)) : 0;
                    const hasWholesalePrice = wholesalePrice > 0;
                    const isWholesale = item.isWholesale || false;
                    const showPointsBadge = item.puntosValor > 0;
                    
                    return (
                      <div key={`${item.productId}-${itemIndex}`} className="flex items-center gap-1 p-1.5 bg-muted/30 rounded text-xs">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate text-sm">{item.descripcion}</p>
                          <div className="flex items-center gap-1">
                            <span className="text-muted-foreground">S/{item.precio.toFixed(2)}</span>
                            {showPointsBadge && <Badge variant="secondary" className="text-[10px] px-1 py-0">{item.puntosValor}pts</Badge>}
                            {hasWholesalePrice && (
                              <Badge 
                                variant={isWholesale ? "default" : "outline"} 
                                className="text-[10px] px-1 py-0 cursor-pointer"
                                onClick={() => handleToggleWholesale(itemIndex)}
                              >
                                {isWholesale ? '✓M' : 'N'}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-0.5">
                          <Button size="icon" variant="outline" className="h-6 w-6" onClick={() => updateItemQuantity(itemIndex, -1, product)}>
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-5 text-center text-sm font-medium">{item.cantidad}</span>
                          <Button size="icon" variant="outline" className="h-6 w-6" onClick={() => updateItemQuantity(itemIndex, 1, product)}>
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        <div className="text-right min-w-[50px]">
                          <p className="font-bold text-sm">S/{item.subtotal.toFixed(2)}</p>
                        </div>
                        <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => removeItem(itemIndex)}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    );
                  })
                )}
              </CardContent>
            </ScrollArea>

            {/* Fixed footer with totals and pay button */}
            <div className="p-2 border-t bg-muted/20 shrink-0 space-y-2">
              {/* Compact discount and notes row */}
              {activeTicket?.items.length > 0 && (
                <div className="flex gap-2">
                  <div>

                  <label htmlFor="" className='text-xs'> Descuento </label>
                  <MoneyInput
                    value={currentDiscount}
                    onChange={(value) => {
                      applyDiscount(value);
                    }}
                    showValidation={false}
                    className="h-7 text-xs flex-1"
                  />
                  </div>
                  <div>
                  <label htmlFor="" className='text-xs'> Recargo Extra </label>                 
                  <MoneyInput
                    value={currentRecargoExtra}
                    onChange={(value) => {
                      applyRecargoExtra(value);
                    }}
                    showValidation={false}
                    className="h-7 text-xs flex-1"
                  />
                  </div>
                  <div className="flex-1">
                    <label htmlFor="" className='text-xs'>Notas </label>
                    <Input
                      value={activeTicket?.notes || ''}
                      onChange={(e) => setTicketNotes(e.target.value)}
                      placeholder="Notas..."
                      className="h-7 text-xs"
                    />
                  </div>
                  {/* ✅ NUEVA: Puntos a usar - AL LADO DE NOTAS */}
                  {activeTicket?.clientName && (
                    <div className="flex-1">
                      <label htmlFor="" className='text-xs'>Puntos a usar</label>
                      <Input
                        type="number"
                        min="0"
                        max={clients.find(c => c.id === activeTicket.clientId)?.puntosAcumulados || 0}
                        value={puntosAUsar || ''}
                        onChange={(e) => setPuntosAUsar(parseInt(e.target.value) || 0)}
                        onBlur={() => {
                          // Gatillador: blur → evaluar puntos
                          if (puntosAUsar > 0) {
                            handleEvaluatePoints();
                          }
                        }}
                        onKeyDown={(e) => {
                          // Gatillador: Enter → evaluar puntos
                          if (e.key === 'Enter' && puntosAUsar > 0) {
                            handleEvaluatePoints();
                          }
                        }}
                        placeholder="0"
                        className="h-7 text-xs"
                      />

                    </div>
                  )}
                </div>
              )}

              {/* Totals */}
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-sm font-bold">Total</div>
                  {activeTicket?.discount > 0 && (
                    <div className="text-[10px] text-muted-foreground">-S/{activeTicket.discount.toFixed(2)} desc.</div>
                  )}
                  {pointsEvaluation?.descuento > 0 && (
                    <div className="text-[10px] text-green-600 font-semibold">-S/{pointsDiscount.toFixed(2)} pts</div>
                  )}
                  <div className="text-[10px] text-muted-foreground">{total} pts</div>
                </div>
                <div className="text-xl font-bold text-primary">S/ {total.toFixed(2)}</div>
              </div>
              
              {/* Botón PAGAR - Ejecuta preview y abre dialog */}
              <Button 
                className="w-full" 
                disabled={!activeTicket?.items.length}
                onClick={handleShowPreview}
              >
                <DollarSign className="mr-2 h-4 w-4" />
                Pagar
              </Button>
              
              <Dialog open={isPaymentOpen} onOpenChange={setIsPaymentOpen}>
                <DialogContent className="max-w-sm max-h-[85vh] overflow-y-auto">
                  <DialogHeader className="pb-2">
                    <DialogTitle className="text-base">Procesar Pago</DialogTitle>
                  </DialogHeader>
                  
                  <div className="space-y-3">
                    {/* Compact summary */}
                    <div className="grid grid-cols-2 gap-2 p-2 bg-muted/50 rounded text-center text-sm">
                      <div>
                        <div className="text-[10px] text-muted-foreground">Total</div>
                        <div className="text-lg font-bold text-primary">S/ {total.toFixed(2)}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-muted-foreground">Puntos</div>
                        <div className="font-bold text-primary">{pointsEarned}</div>
                      </div>
                    </div>

                    {/* Payment method buttons */}
                    <div className="space-y-1">
                      <Label className="text-xs">Método de Pago</Label>
                      <div className="grid grid-cols-4 gap-1">
                        {PAYMENT_METHOD_OPTIONS.map((option) => (
                          <Button
                            key={option.value}
                            type="button"
                            variant={selectedPaymentMethod === option.value ? "default" : "outline"}
                            size="sm"
                            className="text-[10px] h-8 px-1"
                            onClick={() => setSelectedPaymentMethod(option.value as PaymentMethod)}
                          >
                            {option.label}
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* Multiple payment methods collapsible */}
                    <Collapsible>
                      <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="sm" className="w-full justify-between h-7 text-xs">
                          <span>+ Dividir pago</span>
                          <ChevronDown className="h-3 w-3" />
                        </Button>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="pt-2 space-y-2">
                        <div className="flex gap-1">
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={montoActual || ''}
                            onChange={(e) => setMontoActual(parseFloat(e.target.value) || 0)}
                            onFocus={() => {
                              // Auto-rellenar con monto restante si el campo está vacío
                              if (montoActual === 0 && getMontoRestante() > 0) {
                                setMontoActual(getMontoRestante());
                              }
                            }}
                            placeholder={`Monto ${getMontoRestante() > 0 ? `(Restante: S/${getMontoRestante().toFixed(2)})` : ''}`}
                            className="h-7 text-xs flex-1"
                          />
                          <Button 
                            onClick={agregarMetodoPago} 
                            variant="outline" 
                            size="sm"
                            className="h-7 text-xs"
                            disabled={montoActual <= 0}
                          >
                            + {selectedPaymentMethod}
                          </Button>
                        </div>
                        
                        {metodosPageo.length > 0 && (
                          <div className="space-y-1 p-2 bg-muted/30 rounded text-xs">
                            {metodosPageo.map((metodo, index) => (
                              <div key={index} className="flex items-center justify-between">
                                <span>{metodo.metodoPago}: S/{metodo.monto.toFixed(2)}</span>
                                <Button
                                  onClick={() => removerMetodoPago(index)}
                                  variant="ghost"
                                  size="sm"
                                  className="h-5 w-5 p-0 text-destructive"
                                >
                                  ×
                                </Button>
                              </div>
                            ))}
                            <Separator className="my-1" />
                            <div className="flex justify-between font-bold">
                              <span>Restante:</span>
                              <span className={getMontoRestante() > 0.01 ? 'text-destructive' : 'text-green-600'}>
                                S/ {getMontoRestante().toFixed(2)}
                              </span>
                            </div>
                          </div>
                        )}
                      </CollapsibleContent>
                    </Collapsible>

                    {/* Change calculator collapsible */}
                    <Collapsible open={showChangeCalculator} onOpenChange={setShowChangeCalculator}>
                      <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="sm" className="w-full justify-between h-7 text-xs">
                          <span className="flex items-center gap-1"><Calculator className="h-3 w-3" /> Vuelto</span>
                          {showChangeCalculator ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                        </Button>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="pt-2">
                        <div className="space-y-2 p-2 bg-muted/30 rounded">
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={montoRecibido === undefined ? '' : montoRecibido}
                            onChange={(e) => setMontoRecibido(e.target.value === '' ? undefined : parseFloat(e.target.value))}
                            placeholder={`Recibido (Total: S/${total.toFixed(2)})`}
                            className="h-7 text-xs"
                          />
                          {montoRecibido !== undefined && montoRecibido >= total && (
                            <div className="flex justify-between items-center text-sm">
                              <span>Vuelto:</span>
                              <span className="font-bold text-primary text-lg">S/ {(montoRecibido - total).toFixed(2)}</span>
                            </div>
                          )}
                        </div>
                      </CollapsibleContent>
                    </Collapsible>

                    {/* Client info */}
                    {activeTicket?.clientName && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 p-2 bg-primary/5 rounded text-xs">
                          <User className="h-3 w-3 text-primary" />
                          <span className="font-medium">{activeTicket.clientName}</span>
                          <span className="text-muted-foreground">+{pointsEarned} pts</span>
                        </div>
                        
                        {/* ✅ REFACTORIZADO: Mostrar resultado de evaluación de puntos (si existe) */}
                        {pointsEvaluation && (
                          <div className="p-2 bg-green-50 border border-green-200 rounded text-xs">
                            <div className="flex justify-between items-center">
                              <span className="text-green-700 font-medium">Descuento aplicado:</span>
                              <span className="text-green-800 font-bold">-S/ {pointsEvaluation.descuento.toFixed(2)}</span>
                            </div>
                            {pointsEvaluation.mensaje && (
                              <p className="text-green-600 text-[10px] mt-1">{pointsEvaluation.mensaje}</p>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    <Button 
                      onClick={handleCheckout} 
                      className="w-full" 
                      size="lg"
                      disabled={metodosPageo.length > 0 && !isPagoCompleto()}
                    >
                      <DollarSign className="mr-2 h-4 w-4" />
                      Confirmar S/ {metodosPageo.length > 0 ? getTotalPagado().toFixed(2) : total.toFixed(2)}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Secondary Panel - Products */}
      <div className="w-full lg:w-72 bg-background p-2 flex flex-col min-h-0 overflow-hidden">
        <div className="mb-2 shrink-0">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="text"
              placeholder="Buscar..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-8 h-8 text-sm"
            />
          </div>
        </div>

        <ScrollArea className="flex-1 min-h-0 max-h-[calc(100vh-12rem)] sm:max-h-[calc(100vh-10rem)] lg:max-h-[calc(100vh-8rem)]">
          <div className="space-y-1.5 pr-2">
            {displayProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                <Search className="h-8 w-8 mb-2" />
                <p className="text-sm">Sin resultados</p>
              </div>
            ) : (
              displayProducts.map((product) => (
                <Card
                  key={product.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => handleAddProduct(product)}
                >
                  <CardContent className="p-2">
                    <div className="flex items-center justify-between gap-1">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-xs truncate">{product.productoDescripcion}</h3>
                        <div className="flex items-center gap-1">
                          <span className="text-sm font-bold text-primary">S/{product.precio?.toFixed(2)}</span>
                          <Badge variant={product.cantidadActual > 10 ? 'secondary' : 'destructive'} className="text-[9px] px-1 h-4">
                            {product.cantidadActual}
                          </Badge>
                        </div>
                      </div>
                      <Button size="icon" variant="ghost" className="h-7 w-7 shrink-0">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </ScrollArea>

        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-2 mt-2 border-t shrink-0 text-xs">
            <Button variant="outline" size="sm" className="h-6 px-2" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>
              ←
            </Button>
            <span className="text-muted-foreground">{currentPage}/{totalPages}</span>
            <Button variant="outline" size="sm" className="h-6 px-2" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
              →
            </Button>
          </div>
        )}
      </div>
    

    {/* Dialog obligatorio para verificar caja abierta */}
    <Dialog open={isCashRegisterDialogOpen} onOpenChange={() => {}}>
      <DialogContent className="max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            Caja Cerrada
          </DialogTitle>
          <DialogDescription>
            No hay una caja abierta. Debes abrir una caja antes de realizar ventas.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="text-sm text-muted-foreground">
            {isLoadingCashState ? (
              'Verificando estado de caja...'
            ) : (
              'Para continuar con las ventas, necesitas abrir una caja desde el módulo de Caja.'
            )}
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => window.location.href = '/caja'}
            >
              Ir a Caja
            </Button>
            <Button 
              className="flex-1"
              onClick={checkCashRegisterState}
              disabled={isLoadingCashState}
            >
              {isLoadingCashState ? 'Verificando...' : 'Verificar Estado'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>

    {/* Dialog de preview de venta */}
    <Dialog open={isPreviewDialogOpen} onOpenChange={setIsPreviewDialogOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Preview de Venta
          </DialogTitle>
          <DialogDescription>
            Revisa los detalles antes de confirmar la venta
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {isLoadingPreview ? (
            <div className="text-center py-4">
              <div className="text-sm text-muted-foreground">Validando venta...</div>
            </div>
          ) : salePreview ? (
            <div className="space-y-3">
              <div className="text-sm">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>S/ {salePreview.subtotal?.toFixed(2)}</span>
                </div>
                {(salePreview.descuentoPuntos > 0 || salePreview.descuentoPromos > 0) && (
                  <div className="flex justify-between text-red-600">
                    <span>Descuento:</span>
                    <span>-S/ {(salePreview.descuentoPuntos?.toFixed(2)|| salePreview.descuentoPromos?.toFixed(2))}</span>
                  </div>
                )}
                {salePreview.ajusteRedondeo > 0 && (
                  <div className="flex justify-between text-blue-600">
                    <span>Recargo:</span>
                    <span>+S/ {salePreview.ajusteRedondeo?.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold border-t pt-2">
                  <span>Total:</span>
                  <span>S/ {salePreview.total?.toFixed(2)}</span>
                </div>
                {salePreview.puntosOtorgados > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Puntos a ganar:</span>
                    <span>{salePreview.puntosOtorgados} pts</span>
                  </div>
                )}
              </div>
              
              {salePreview.validaciones.mensajes && salePreview.validaciones.mensajes.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
                  <div className="text-sm font-medium text-yellow-800 mb-1">Advertencias:</div>
                  {salePreview.validaciones.mensajes.map((advertencia, index) => (
                    <div key={index} className="text-xs text-yellow-700">• {advertencia}</div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-4">
              <div className="text-sm text-muted-foreground">Error al generar preview</div>
            </div>
          )}
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => setIsPreviewDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button 
              className="flex-1"
              onClick={handleConfirmSale}
              disabled={isLoadingPreview || !salePreview}
            >
              Confirmar Venta
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
    </div>
  );
}
