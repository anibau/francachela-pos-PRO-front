import type { SalePreviewResponse } from '@/types';

/** Descuento manual + promos (sin puntos; los puntos van por preview/backend) */
export function buildManualDiscount(
  ticketDiscount: number,
  promoDiscount: number,
): number {
  return ticketDiscount + promoDiscount;
}

/** Monto a cobrar: prioriza preview del backend como fuente de verdad */
export function resolvePayableAmount(
  salePreview: SalePreviewResponse | null,
  fallbackTotal: number,
): number {
  if (salePreview?.totalCobrado != null) {
    return salePreview.totalCobrado;
  }
  return fallbackTotal;
}

/** Valida que la suma de métodos de pago coincida con el monto esperado */
export function isPaymentSumValid(
  paidSum: number,
  expected: number,
  tolerance = 0.01,
): boolean {
  return Math.abs(paidSum - expected) <= tolerance;
}
