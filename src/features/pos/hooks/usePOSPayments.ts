import { useState, useCallback } from 'react';
import type { PaymentMethod } from '@/types';
import { roundToNearestDime } from '@/utils/moneyUtils';

export interface PaymentLine {
  monto: number;
  metodoPago: PaymentMethod;
  referencia?: string;
}

export function usePOSPayments(amountToPay: number) {
  const [metodosPageo, setMetodosPageo] = useState<PaymentLine[]>([]);
  const [montoActual, setMontoActual] = useState(0);
  const [referenciaActual, setReferenciaActual] = useState('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>('EFECTIVO');

  const getTotalPagado = useCallback(() => {
    return roundToNearestDime(
      metodosPageo.reduce((sum, m) => sum + m.monto, 0),
    );
  }, [metodosPageo]);

  const getMontoRestante = useCallback(() => {
    return roundToNearestDime(amountToPay - getTotalPagado());
  }, [amountToPay, getTotalPagado]);

  const isPagoCompleto = useCallback(() => {
    return Math.abs(getMontoRestante()) < 0.01;
  }, [getMontoRestante]);

  const agregarMetodoPago = useCallback(() => {
    if (montoActual <= 0) return { ok: false as const, error: 'El monto debe ser mayor a 0' };
    const restante = amountToPay - getTotalPagado();
    if (montoActual > restante + 0.01) {
      return { ok: false as const, error: `El monto no puede ser mayor al restante: S/ ${restante.toFixed(2)}` };
    }
    setMetodosPageo((prev) => [
      ...prev,
      {
        monto: montoActual,
        metodoPago: selectedPaymentMethod,
        referencia: referenciaActual || undefined,
      },
    ]);
    setMontoActual(0);
    setReferenciaActual('');
    return { ok: true as const, metodo: selectedPaymentMethod, monto: montoActual };
  }, [montoActual, amountToPay, getTotalPagado, selectedPaymentMethod, referenciaActual]);

  const removerMetodoPago = useCallback((index: number) => {
    setMetodosPageo((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const resetPayments = useCallback(() => {
    setMetodosPageo([]);
    setMontoActual(0);
    setReferenciaActual('');
  }, []);

  return {
    metodosPageo,
    montoActual,
    setMontoActual,
    referenciaActual,
    setReferenciaActual,
    selectedPaymentMethod,
    setSelectedPaymentMethod,
    getTotalPagado,
    getMontoRestante,
    isPagoCompleto,
    agregarMetodoPago,
    removerMetodoPago,
    resetPayments,
  };
}
