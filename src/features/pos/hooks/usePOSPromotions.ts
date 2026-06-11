import { useEffect, useState } from 'react';
import type { SaleItem } from '@/types';
import { calculateSubtotal } from '@/utils/calculateTicketTotal';
import { unifiedPromotionsService } from '@/services/unifiedPromotionsService';

const DEBOUNCE_MS = 300;

export function usePOSPromotions(items: SaleItem[]) {
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [isEvaluating, setIsEvaluating] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    const timer = setTimeout(async () => {
      if (!items.length) {
        if (!controller.signal.aborted) setPromoDiscount(0);
        return;
      }

      setIsEvaluating(true);
      try {
        const subtotal = calculateSubtotal(items);
        const result = await unifiedPromotionsService.evaluate({
          items: items.map((item) => ({
            productoId: item.productId,
            cantidad: item.cantidad,
            precioUnitario: item.precio,
          })),
          montoTotal: subtotal,
        });
        if (!controller.signal.aborted) {
          setPromoDiscount(result.descuentoTotal || 0);
        }
      } catch {
        if (!controller.signal.aborted) setPromoDiscount(0);
      } finally {
        if (!controller.signal.aborted) setIsEvaluating(false);
      }
    }, DEBOUNCE_MS);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [items]);

  return { promoDiscount, isEvaluatingPromos: isEvaluating };
}
