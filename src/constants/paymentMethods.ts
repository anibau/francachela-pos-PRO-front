/**
 * Constantes de Métodos de Pago
 * Centraliza los valores de métodos de pago para evitar inconsistencias
 * DEBE concordar con los valores del backend
 */

export const PAYMENT_METHODS = {
  EFECTIVO: 'EFECTIVO',
  YAPE: 'YAPE',
  PLIN: 'PLIN',
  TARJETA: 'TARJETA',
} as const;

export type PaymentMethodKey = keyof typeof PAYMENT_METHODS;

/**
 * Mapeo de métodos de pago para mostrar al usuario
 * Display Label → Backend Value
 */
export const PAYMENT_METHOD_LABELS: Record<typeof PAYMENT_METHODS[PaymentMethodKey], string> = {
  EFECTIVO: '💵 Efectivo',
  YAPE: '📱 Yape',
  PLIN: '📱 Plin',
  TARJETA: '💳 Tarjeta',
} as const;

/**
 * Array de opciones para Select/Dropdown
 * Ordenado por preferencia de uso común
 */
export const PAYMENT_METHOD_OPTIONS = [
  { value: PAYMENT_METHODS.EFECTIVO, label: PAYMENT_METHOD_LABELS.EFECTIVO },
  { value: PAYMENT_METHODS.YAPE, label: PAYMENT_METHOD_LABELS.YAPE },
  { value: PAYMENT_METHODS.PLIN, label: PAYMENT_METHOD_LABELS.PLIN },
  { value: PAYMENT_METHODS.TARJETA, label: PAYMENT_METHOD_LABELS.TARJETA },
] as const;
