/**
 * Utilidades para cálculo de puntos de fidelidad
 */

import type { SaleItem, Product } from '@/types';

/**
 * Calcula los puntos totales de una venta
 */
export function calculateTotalPoints(items: SaleItem[]): number {
  return items.reduce((total, item) => {
    return total + (item.pointsValue * item.quantity);
  }, 0);
}

/**
 * Calcula los puntos para un producto basado en su precio
 * Por defecto: precio de producto * 10
 */
export function calculateProductPoints(product: Product): number {
  return Math.floor(product.price * 10);
}

/**
 * Verifica si un cliente tiene suficientes puntos para canjear
 */
export function canRedeemPoints(clientPoints: number, pointsToRedeem: number): boolean {
  return clientPoints >= pointsToRedeem;
}

/**
 * Convierte puntos a descuento en soles
 * Por defecto: 10 puntos = 1 sol
 */
export function pointsToDiscount(points: number, solsPerPoint: number = 0.10): number {
  return points * solsPerPoint;
}

/**
 * Calcula cuántos puntos se necesitan para un descuento específico
 */
export function discountToPoints(discount: number, solsPerPoint: number = 0.10): number {
  return Math.ceil(discount / solsPerPoint);
}

/**
 * Genera un objeto SaleItem con puntos calculados
 */
export function createSaleItemWithPoints(product: Product, quantity: number = 1): SaleItem {
  const pointsValue = calculateProductPoints(product);
  
  return {
    productId: product.id,
    productName: product.name,
    quantity,
    price: product.price,
    subtotal: product.price * quantity,
    pointsValue,
  };
}
