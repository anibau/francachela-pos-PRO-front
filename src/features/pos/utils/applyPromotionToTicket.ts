import type { Product } from '@/types';
import type { UnifiedPromotion } from '@/services/unifiedPromotionsService';
import { canAddOneUnit } from './stockUtils';
import type { TicketItemForStock } from './stockUtils';

export interface ApplyPromoResult {
  ok: boolean;
  added: number;
  skipped: number;
  message?: string;
}

/** Añade productos de una promo COMBO/PACK al ticket respetando stock. */
export function buildPromoAddPlan(
  promo: UnifiedPromotion,
  products: Product[],
  ticketItems: TicketItemForStock[],
): Array<{ product: Product; cantidad: number }> {
  const plan: Array<{ product: Product; cantidad: number }> = [];

  for (const pp of promo.productos || []) {
    const product = products.find((p) => p.id === pp.productoId);
    if (!product) continue;
    const qty = pp.cantidadExacta ?? pp.cantidadMinima ?? 1;
    if (qty <= 0) continue;
    plan.push({ product, cantidad: qty });
  }

  return plan.filter(({ product, cantidad }) => {
    let simItems = [...ticketItems];
    for (let i = 0; i < cantidad; i++) {
      if (!canAddOneUnit(product, simItems, product.id)) return false;
      const existing = simItems.find((x) => x.productId === product.id);
      if (existing) {
        simItems = simItems.map((x) =>
          x.productId === product.id ? { ...x, cantidad: x.cantidad + 1 } : x,
        );
      } else {
        simItems = [...simItems, { productId: product.id, cantidad: 1 }];
      }
    }
    return true;
  });
}
