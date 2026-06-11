import { describe, expect, it } from 'vitest';
import { buildCreatePayloadFromPreview } from './buildCreatePayload';
import type { SalePreviewResponse } from '@/types';

const basePreview: SalePreviewResponse = {
  subtotal: 102,
  descuentoPromos: 0,
  descuentoPuntos: 9.8,
  ajusteRedondeo: 0,
  total: 90.2,
  totalCobrado: 90.2,
  vuelto: 0,
  puntosOtorgados: 90,
  detalleItems: [],
  validaciones: { stockSuficiente: true, puntosValidos: true, mensajes: [] },
};

describe('buildCreatePayloadFromPreview', () => {
  it('usa totalCobrado del preview en pago único (anti-regresión 100 vs 90.2)', () => {
    const payload = buildCreatePayloadFromPreview({
      ticket: {
        discount: 3,
        recargoExtra: 1,
        items: [{ productId: 298, cantidad: 1, precio: 102 }],
      },
      salePreview: basePreview,
      paymentMethod: 'EFECTIVO',
      puntosUsados: 98,
    });

    expect(payload.metodosPageo[0].monto).toBe(90.2);
    expect(payload.metodosPageo[0].monto).not.toBe(100);
    expect(payload.puntosUsados).toBe(98);
    expect(payload.descuento).toBe(3);
  });

  it('incluye descuento manual + promos del preview', () => {
    const preview = { ...basePreview, descuentoPromos: 5 };
    const payload = buildCreatePayloadFromPreview({
      ticket: {
        discount: 3,
        recargoExtra: 0,
        items: [{ productId: 1, cantidad: 1, precio: 50 }],
      },
      salePreview: preview,
      paymentMethod: 'TARJETA',
      puntosUsados: 0,
    });

    expect(payload.descuento).toBe(8);
  });

  it('omite descuento cuando hay mayoreo (precio ya en precioUnitario)', () => {
    const payload = buildCreatePayloadFromPreview({
      ticket: {
        discount: 2,
        recargoExtra: 0,
        items: [{ productId: 10, cantidad: 2, precio: 8.5, isWholesale: true }],
      },
      salePreview: { ...basePreview, totalCobrado: 17, total: 17 },
      paymentMethod: 'EFECTIVO',
      puntosUsados: 0,
      products: [
        { id: 10, precio: 10, precioMayoreo: 8.5 } as import('@/types').Product,
      ],
    });

    expect(payload.descuento).toBeUndefined();
    expect(payload.listaProductos[0].precioUnitario).toBe(8.5);
  });

  it('pasa montoRecibido solo cuando hay efectivo entregado mayor al total', () => {
    const payload = buildCreatePayloadFromPreview({
      ticket: {
        discount: 0,
        recargoExtra: 0,
        items: [{ productId: 1, cantidad: 1, precio: 90.2 }],
      },
      salePreview: basePreview,
      paymentMethod: 'EFECTIVO',
      puntosUsados: 0,
      efectivoEntregado: 100,
    });

    expect(payload.montoRecibido).toBe(100);
  });
});
