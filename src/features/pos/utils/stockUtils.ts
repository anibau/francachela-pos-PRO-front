import type { Product } from '@/types';

export interface TicketItemForStock {
  productId: number;
  cantidad: number;
}

/** Suma cantidades del mismo producto en el ticket (normal + mayoreo). */
export function getTicketQtyByProduct(
  items: TicketItemForStock[],
  productId: number,
  excludeIndex?: number,
): number {
  return items.reduce((sum, item, idx) => {
    if (excludeIndex !== undefined && idx === excludeIndex) return sum;
    if (item.productId !== productId) return sum;
    return sum + item.cantidad;
  }, 0);
}

/** Unidades disponibles para agregar más al ticket. */
export function getAvailableStock(
  product: Pick<Product, 'usaInventario' | 'cantidadActual'>,
  items: TicketItemForStock[],
  productId: number,
  excludeIndex?: number,
): number {
  if (!product.usaInventario) return Infinity;
  const inTicket = getTicketQtyByProduct(items, productId, excludeIndex);
  return Math.max(0, product.cantidadActual - inTicket);
}

export function canAddOneUnit(
  product: Pick<Product, 'usaInventario' | 'cantidadActual'>,
  items: TicketItemForStock[],
  productId: number,
): boolean {
  return getAvailableStock(product, items, productId) >= 1;
}

export function canIncreaseQty(
  product: Pick<Product, 'usaInventario' | 'cantidadActual'>,
  items: TicketItemForStock[],
  productId: number,
): boolean {
  return getAvailableStock(product, items, productId) >= 1;
}

export function isOutOfStock(
  product: Pick<Product, 'usaInventario' | 'cantidadActual'>,
): boolean {
  return product.usaInventario && product.cantidadActual <= 0;
}
