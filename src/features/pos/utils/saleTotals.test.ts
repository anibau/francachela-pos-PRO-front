import { describe, it, expect } from 'vitest';
import {
  buildManualDiscount,
  isPaymentSumValid,
  resolvePayableAmount,
} from './saleTotals';
import type { SalePreviewResponse } from '@/types';

describe('saleTotals', () => {
  it('buildManualDiscount sums manual and promo', () => {
    expect(buildManualDiscount(2, 3)).toBe(5);
  });

  it('resolvePayableAmount prefers preview totalCobrado', () => {
    const preview = { totalCobrado: 42 } as SalePreviewResponse;
    expect(resolvePayableAmount(preview, 50)).toBe(42);
    expect(resolvePayableAmount(null, 50)).toBe(50);
  });

  it('isPaymentSumValid tolerates cent rounding', () => {
    expect(isPaymentSumValid(10.005, 10)).toBe(true);
    expect(isPaymentSumValid(9.5, 10)).toBe(false);
  });
});
