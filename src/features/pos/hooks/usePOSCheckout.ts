import { useCallback, useRef, useState } from 'react';
import { usePOS } from '@/contexts/POSContext';
import { useAuth } from '@/hooks/useAuth';
import type { Client, PaymentMethod, Product } from '@/types';
import { isPaymentSumValid, resolvePayableAmount } from '../utils/saleTotals';

interface ConfirmSaleParams {
  selectedPaymentMethod: PaymentMethod;
  metodosPageo: Array<{ monto: number; metodoPago: PaymentMethod; referencia?: string }>;
  puntosUsados: number;
  promoDiscount: number;
  fallbackTotal: number;
  products: Product[];
  clients: Client[];
  refetchProducts?: () => void;
  refetchClients?: () => void;
}

export function usePOSCheckout() {
  const {
    previewSale,
    completeSale,
    salePreview,
    clearPreview,
    getActiveTicket,
    isLoadingPreview,
  } = usePOS();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submitLock = useRef(false);

  const runPreview = useCallback(
    async (params: {
      puntosAUsar?: number;
      ticketDiscount: number;
      promoDiscount: number;
      recargoExtra: number;
      fallbackTotal: number;
    }) => {
      // Solo descuento manual; promos las calcula el backend en previewVenta
      const descuento = params.ticketDiscount;
      return previewSale(
        params.puntosAUsar,
        params.fallbackTotal,
        descuento > 0 ? descuento : undefined,
        params.recargoExtra > 0 ? params.recargoExtra : undefined,
      );
    },
    [previewSale],
  );

  const confirmSale = useCallback(
    async (params: ConfirmSaleParams) => {
      if (submitLock.current) return { ok: false as const, reason: 'already_submitting' };

      const ticket = getActiveTicket();
      if (!ticket?.items.length) {
        return { ok: false as const, reason: 'empty_ticket' };
      }

      if (!salePreview?.validaciones.stockSuficiente || !salePreview?.validaciones.puntosValidos) {
        return { ok: false as const, reason: 'invalid_preview' };
      }

      const montoFinalPagar = resolvePayableAmount(salePreview, params.fallbackTotal);
      const cashier = user?.username ?? 'unknown';

      if (params.metodosPageo.length > 0) {
        const totalPagado = params.metodosPageo.reduce((s, m) => s + m.monto, 0);
        if (!isPaymentSumValid(totalPagado, montoFinalPagar)) {
          return { ok: false as const, reason: 'payment_mismatch' };
        }
      }

      submitLock.current = true;
      setIsSubmitting(true);
      try {
        const metodoPrincipal =
          params.metodosPageo[0]?.metodoPago ?? params.selectedPaymentMethod;

        const efectivoEntregado =
          metodoPrincipal === 'EFECTIVO' && montoFinalPagar > salePreview.totalCobrado
            ? montoFinalPagar
            : undefined;

        await completeSale(
          salePreview,
          metodoPrincipal,
          cashier,
          params.puntosUsados,
          params.metodosPageo.length > 0 ? params.metodosPageo : undefined,
          params.products,
          params.refetchProducts,
          params.refetchClients,
          params.clients,
          efectivoEntregado,
        );
        clearPreview();
        return { ok: true as const, montoFinalPagar };
      } finally {
        submitLock.current = false;
        setIsSubmitting(false);
      }
    },
    [completeSale, clearPreview, getActiveTicket, salePreview, user],
  );

  return {
    isSubmitting,
    isLoadingPreview,
    salePreview,
    runPreview,
    confirmSale,
    canConfirm:
      !!salePreview &&
      salePreview.validaciones.stockSuficiente &&
      salePreview.validaciones.puntosValidos &&
      !isSubmitting,
    payableFromPreview: (fallback: number) => resolvePayableAmount(salePreview, fallback),
  };
}
