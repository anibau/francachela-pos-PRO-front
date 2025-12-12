/**
 * Utilidades para cálculo de puntos de fidelidad
 */

import type { SaleItem, Product } from '@/types';

/**
 * Calcula los puntos totales de una venta
 */
export function calculateTotalPoints(items: any[]): number {
  return items.reduce((total, item) => {
    // Usar puntosValor (del POS) o pointsValue (del backend)
    const pointsPerUnit = item.puntosValor !== undefined ? item.puntosValor : (item.pointsValue || 0);
    return total + (pointsPerUnit * (item.cantidad || item.quantity || 0));
  }, 0);
}

/**
 * Calcula los puntos para un producto basado en su precio
 * Por defecto: precio de producto * 10
 */
export function calculateProductPoints(product: Product): number {
  return Math.floor(product.precio * 10);
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
 * NOTA: Esta función mantiene compatibilidad pero no se usa actualmente.
 * El POS maneja directamente los items con el POSContext
 */
export function createSaleItemWithPoints(product: Product, quantity: number = 1): SaleItem {
  return {
    id: product.id,
    precio: product.precio,
    cantidad: quantity,
    subtotal: product.precio * quantity,
    descripcion: product.productoDescripcion,
  };
}
