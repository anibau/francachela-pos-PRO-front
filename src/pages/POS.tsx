import { useState, useEffect, useRef, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useProducts, useClients, productKeys, clientKeys } from '@/hooks';
import type { Client } from '@/types';
import { PAYMENT_METHODS } from '@/constants/paymentMethods';
import { usePOS } from '@/contexts/POSContext';
import { calculateTicketTotal } from '@/utils/calculateTicketTotal';
import { toast } from '@/hooks/use-toast';
import { calculateTotalPoints } from '@/utils/pointsCalculator';
import { usePOSCheckout } from '@/features/pos/hooks/usePOSCheckout';
import { usePOSPromotions } from '@/features/pos/hooks/usePOSPromotions';
import { usePOSPayments } from '@/features/pos/hooks/usePOSPayments';
import { usePOSPoints } from '@/features/pos/hooks/usePOSPoints';
import { usePOSCatalog } from '@/features/pos/hooks/usePOSCatalog';
import { useCatalogPageSize } from '@/features/pos/hooks/useCatalogPageSize';
import { usePOSPromotionsCatalog } from '@/features/pos/hooks/usePOSPromotionsCatalog';
import { POSTicketPanel } from '@/features/pos/components/POSTicketPanel';
import { POSProductGrid } from '@/features/pos/components/POSProductGrid';
import { POSPaymentDialog } from '@/features/pos/components/POSPaymentDialog';
import { POSCashRegisterGate } from '@/features/pos/components/POSCashRegisterGate';
import { POSPreviewDialog } from '@/features/pos/components/POSPreviewDialog';
import type { UnifiedPromotion } from '@/services/unifiedPromotionsService';

export default function POS() {
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isClientDialogOpen, setIsClientDialogOpen] = useState(false);
  const [isCashRegisterDialogOpen, setIsCashRegisterDialogOpen] = useState(false);
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false);
  const [clientSearchTerm, setClientSearchTerm] = useState('');
  const [montoRecibido, setMontoRecibido] = useState<number | undefined>();
  const [showChangeCalculator, setShowChangeCalculator] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const listContainerRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const { data: products = [], isLoading: productsLoading, error: productsError, refetch: refetchProducts } = useProducts();
  const { data: clients = [], refetch: refetchClients } = useClients();
  const { data: promos = [], isLoading: promosLoading, error: promosError, refetch: refetchPromos } = usePOSPromotionsCatalog();

  const pos = usePOS();
  const {
    tickets, activeTicketId, createTicket, switchTicket, closeTicket,
    addItem, updateItemQuantity, removeItem, setTicketClient, setTicketNotes,
    applyDiscount, applyRecargoExtra, getActiveTicket, cashRegisterState,
    salePreview, isLoadingCashState, checkCashRegisterState, clearPreview,
    updateActiveTicketPoints,
  } = pos;

  const { isSubmitting, isLoadingPreview, runPreview, confirmSale, canConfirm, payableFromPreview } = usePOSCheckout();

  const activeTicket = getActiveTicket();
  const currentDiscount = activeTicket?.discount || 0;
  const currentRecargoExtra = activeTicket?.recargoExtra || 0;
  const { promoDiscount } = usePOSPromotions(activeTicket?.items || []);
  const points = usePOSPoints(activeTicket, updateActiveTicketPoints);
  const pageSize = useCatalogPageSize(listContainerRef);
  const catalog = usePOSCatalog(products, activeTicket, addItem, removeItem, pageSize);

  const total = calculateTicketTotal(
    activeTicket?.items || [],
    currentDiscount + promoDiscount,
    currentRecargoExtra,
    points.pointsDiscount,
  );
  const pointsEarned = activeTicket ? calculateTotalPoints(activeTicket.items) : 0;
  const payments = usePOSPayments(montoRecibido ?? payableFromPreview(total));

  useEffect(() => {
    if (productsError) toast({ title: 'Error al cargar productos', variant: 'destructive' });
  }, [productsError]);

  useEffect(() => { checkCashRegisterState(); }, [checkCashRegisterState]);

  useEffect(() => {
    if (cashRegisterState && !cashRegisterState.abierta) setIsCashRegisterDialogOpen(true);
    else if (cashRegisterState?.abierta) setIsCashRegisterDialogOpen(false);
  }, [cashRegisterState]);

  useEffect(() => { if (!isPaymentOpen) setMontoRecibido(undefined); }, [isPaymentOpen]);

  useEffect(() => {
    setIsPaymentOpen(false);
    setMontoRecibido(undefined);
  }, [activeTicketId]);

  useEffect(() => {
    if (!activeTicket || activeTicket.items.length > 0) return;
    if (activeTicket.discount > 0 || activeTicket.recargoExtra > 0 || activeTicket.notes) {
      applyDiscount(0);
      applyRecargoExtra(0);
      setTicketNotes('');
    }
  }, [activeTicket?.items.length, activeTicket?.id, activeTicket, applyDiscount, applyRecargoExtra, setTicketNotes]);

  const filteredClients = (clients || []).filter((c) => {
    if (!c?.nombres || !c?.dni) return false;
    const term = clientSearchTerm.toLowerCase();
    return c.nombres.toLowerCase().includes(term) || c.apellidos.toLowerCase().includes(term)
      || c.dni.includes(clientSearchTerm) || (c.codigoCorto || '').toLowerCase().includes(term);
  });

  const handleShowPreview = useCallback(async () => {
    if (!activeTicket?.items.length) {
      toast({ title: 'No hay productos en el ticket', variant: 'destructive' });
      return;
    }
    try {
      const puntosParaPreview = points.pointsEvaluation?.puntosAceptados || (points.puntosAUsar > 0 ? points.puntosAUsar : undefined);
      const previewResult = await runPreview({
        puntosAUsar: puntosParaPreview,
        ticketDiscount: currentDiscount,
        promoDiscount,
        recargoExtra: currentRecargoExtra,
        fallbackTotal: total,
      });
      if (previewResult?.validaciones.stockSuficiente && previewResult.validaciones.puntosValidos) {
        const montoFinal = previewResult.totalCobrado || total;
        setMontoRecibido(montoFinal);
        if (Math.abs(montoFinal - total) > 0.01) {
          toast({ title: `Total: S/ ${montoFinal.toFixed(2)}` });
        }
        payments.resetPayments();
        setIsPaymentOpen(true);
      } else {
        const mensajes = previewResult?.validaciones.mensajes || [];
        toast({
          title: 'Error en validación',
          description: mensajes.length ? mensajes.join(', ') : 'Revisa los datos',
          variant: 'destructive',
        });
      }
    } catch {
      toast({ title: 'Error al validar la venta', variant: 'destructive' });
    }
  }, [activeTicket, points, runPreview, currentDiscount, promoDiscount, currentRecargoExtra, total, payments]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key.toLowerCase() === 'k') { e.preventDefault(); searchInputRef.current?.focus(); }
      if (e.key === 'F2' && activeTicket?.items.length) { e.preventDefault(); handleShowPreview(); }
      if (e.key === 'Escape') {
        if (isPaymentOpen) setIsPaymentOpen(false);
        if (isPreviewDialogOpen) setIsPreviewDialogOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [activeTicket?.items.length, handleShowPreview, isPaymentOpen, isPreviewDialogOpen]);

  const resetAfterSale = () => {
    payments.resetPayments();
    setIsPaymentOpen(false);
    setIsPreviewDialogOpen(false);
    points.resetPoints();
    setMontoRecibido(undefined);
    payments.setSelectedPaymentMethod(PAYMENT_METHODS.EFECTIVO);
    clearPreview();
    queryClient.invalidateQueries({ queryKey: productKeys.all });
    queryClient.invalidateQueries({ queryKey: clientKeys.all });
  };

  const handleConfirmSale = async () => {
    const result = await confirmSale({
      selectedPaymentMethod: payments.selectedPaymentMethod,
      metodosPageo: payments.metodosPageo,
      puntosUsados: points.pointsEvaluation?.puntosAceptados || 0,
      promoDiscount,
      fallbackTotal: total,
      products,
      clients,
      refetchProducts,
      refetchClients,
    });
    if (result.ok) {
      toast({ title: `Venta OK · S/ ${result.montoFinalPagar.toFixed(2)}` });
      resetAfterSale();
      return;
    }
    const messages: Record<string, string> = {
      already_submitting: 'La venta ya se está procesando',
      empty_ticket: 'No hay productos en el ticket',
      invalid_preview: 'La venta no ha sido validada. Presiona Pagar nuevamente.',
      payment_mismatch: 'Los métodos de pago no coinciden con el total',
    };
    toast({ title: 'Error en la venta', description: messages[result.reason] || 'Error al procesar', variant: 'destructive' });
  };

  const handleAgregarMetodo = () => {
    const result = payments.agregarMetodoPago();
    if (!result.ok) toast({ title: 'Error', description: result.error, variant: 'destructive' });
    else toast({ title: `+${result.metodo}: S/ ${result.monto.toFixed(2)}` });
  };

  const handleSelectClient = (client: Client) => {
    setTicketClient(client.id, `${client.nombres} ${client.apellidos}`.trim(), client.puntosAcumulados);
    setIsClientDialogOpen(false);
    setClientSearchTerm('');
  };

  const handleApplyPromo = (promo: UnifiedPromotion) => {
    for (const pp of promo.productos || []) {
      const product = products.find((p) => p.id === pp.productoId);
      if (!product) continue;
      const qty = pp.cantidadExacta ?? pp.cantidadMinima ?? 1;
      for (let i = 0; i < qty; i++) {
        if (catalog.canAddProduct(product)) {
          addItem(product, false);
        }
      }
    }
    toast({ title: `Promo "${promo.nombre}" aplicada al ticket` });
  };

  const paymentDialog = (
    <POSPaymentDialog
      open={isPaymentOpen}
      onOpenChange={setIsPaymentOpen}
      total={montoRecibido ?? total}
      pointsEarned={pointsEarned}
      clientName={activeTicket?.clientName}
      pointsEvaluation={points.pointsEvaluation}
      selectedPaymentMethod={payments.selectedPaymentMethod}
      onSelectPaymentMethod={payments.setSelectedPaymentMethod}
      montoActual={payments.montoActual}
      onMontoActualChange={payments.setMontoActual}
      metodosPageo={payments.metodosPageo}
      getMontoRestante={payments.getMontoRestante}
      getTotalPagado={payments.getTotalPagado}
      isPagoCompleto={payments.isPagoCompleto}
      onAgregarMetodo={handleAgregarMetodo}
      onRemoverMetodo={payments.removerMetodoPago}
      showChangeCalculator={showChangeCalculator}
      onShowChangeCalculatorChange={setShowChangeCalculator}
      montoRecibido={montoRecibido}
      onMontoRecibidoChange={setMontoRecibido}
      isSubmitting={isSubmitting}
      canConfirm={canConfirm}
      onConfirm={handleConfirmSale}
    />
  );

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100dvh-4rem)] bg-background overflow-hidden">
      <POSTicketPanel
        tickets={tickets}
        activeTicketId={activeTicketId}
        activeTicket={activeTicket}
        products={products}
        clients={clients}
        filteredClients={filteredClients}
        clientSearchTerm={clientSearchTerm}
        onClientSearchChange={setClientSearchTerm}
        isClientDialogOpen={isClientDialogOpen}
        onClientDialogOpenChange={setIsClientDialogOpen}
        onCreateTicket={createTicket}
        onSwitchTicket={switchTicket}
        onCloseTicket={closeTicket}
        onSelectClient={handleSelectClient}
        onRemoveClient={() => { setTicketClient(undefined, undefined, undefined); }}
        onUpdateQuantity={updateItemQuantity}
        onRemoveItem={removeItem}
        onToggleWholesale={catalog.toggleWholesale}
        currentDiscount={currentDiscount}
        onDiscountChange={applyDiscount}
        currentRecargoExtra={currentRecargoExtra}
        onRecargoChange={applyRecargoExtra}
        onNotesChange={setTicketNotes}
        puntosAUsar={points.puntosAUsar}
        onPuntosAUsarChange={points.setPuntosAUsar}
        onEvaluatePoints={points.evaluatePoints}
        pointsEvaluation={points.pointsEvaluation}
        maxPuntosInput={points.maxPuntosInput}
        pointsDiscount={points.pointsDiscount}
        promoDiscount={promoDiscount}
        total={total}
        pointsEarned={pointsEarned}
        isLoadingPreview={isLoadingPreview}
        isSubmitting={isSubmitting}
        onPay={handleShowPreview}
        paymentDialog={paymentDialog}
      />
      <POSProductGrid
        searchTerm={catalog.searchTerm}
        onSearchChange={catalog.setSearchTerm}
        onBarcodeSearch={catalog.handleBarcodeSearch}
        searchInputRef={searchInputRef}
        listContainerRef={listContainerRef}
        productsLoading={productsLoading}
        productsError={productsError}
        onRetryProducts={() => refetchProducts()}
        displayProducts={catalog.displayProducts}
        currentPage={catalog.currentPage}
        totalPages={catalog.totalPages}
        onPageChange={catalog.setCurrentPage}
        onAddProduct={catalog.addProduct}
        canAddProduct={catalog.canAddProduct}
        promos={promos}
        promosLoading={promosLoading}
        promosError={promosError as Error | null}
        onRetryPromos={() => refetchPromos()}
        onApplyPromo={handleApplyPromo}
      />
      <POSCashRegisterGate open={isCashRegisterDialogOpen} isLoading={isLoadingCashState} onCheckState={checkCashRegisterState} />
      <POSPreviewDialog
        open={isPreviewDialogOpen}
        onOpenChange={setIsPreviewDialogOpen}
        isLoading={isLoadingPreview}
        salePreview={salePreview}
        isSubmitting={isSubmitting}
        onConfirm={handleConfirmSale}
      />
    </div>
  );
}
