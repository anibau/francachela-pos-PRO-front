import { SaleItem } from '@/types';
import { roundToNearestDime } from './moneyUtils';

/**
 * 🎯 MOTOR ÚNICO DE CÁLCULO PARA EL POS
 * 
 * Esta es la única función que debe usarse en todo el proyecto
 * para calcular el total del ticket considerando todos los factores.
 * 
 * Fórmula:
 * Total = subtotal - descuento + recargoExtra - descuentoPuntos
 * 
 * @param items - Items del ticket
 * @param discount - Descuento manual aplicado
 * @param recargoExtra - Recargo extra (ej: tarjeta)
 * @param pointsDiscount - Descuento por puntos (viene del backend)
 * @returns Total redondeado a décima (0.10 soles)
 */
export function calculateTicketTotal(
  items: SaleItem[],
  discount: number = 0,
  recargoExtra: number = 0,
  pointsDiscount: number = 0
): number {
  // Calcular subtotal
  const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
  
  // Aplicar descuento y recargo
  const baseTotal = roundToNearestDime(
    Math.max(0, subtotal - discount + recargoExtra)
  );
  
  // Restar descuento por puntos
  const finalTotal = roundToNearestDime(
    Math.max(0, baseTotal - pointsDiscount)
  );
  
  return finalTotal;
}

/**
 * Variante simple cuando solo hay subtotal (sin descuentos ni recargos)
 * Usada para obtener el precio base antes de aplicar modificadores
 */
export function calculateSubtotal(items: SaleItem[]): number {
  return roundToNearestDime(
    items.reduce((sum, item) => sum + item.subtotal, 0)
  );
}

/**
 * Obtiene el desglose completo del cálculo para debugging
 * Retorna todos los componentes y el total final
 */
export function getCalculationBreakdown(
  items: SaleItem[],
  discount: number = 0,
  recargoExtra: number = 0,
  pointsDiscount: number = 0
) {
  const subtotal = calculateSubtotal(items);
  const baseTotal = roundToNearestDime(Math.max(0, subtotal - discount + recargoExtra));
  const total = calculateTicketTotal(items, discount, recargoExtra, pointsDiscount);
  
  return {
    subtotal,
    discount,
    recargoExtra,
    pointsDiscount,
    baseTotal,
    total,
    // Helper para debugging
    formula: `${subtotal} - ${discount} + ${recargoExtra} - ${pointsDiscount} = ${total}`
  };
}
