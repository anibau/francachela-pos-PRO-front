import { describe, it, expect } from 'vitest';
import { buildPreviewPayload } from './buildPreviewPayload';
import type { SaleItem } from '@/types';

describe('buildPreviewPayload', () => {
  const items: SaleItem[] = [
    {
      productId: 10,
      descripcion: 'Galleta',
      precio: 8.5,
      cantidad: 2,
      subtotal: 17,
      puntosValor: 1,
      isWholesale: true,
    },
  ];

  it('includes precioUnitario from ticket items', () => {
    const payload = buildPreviewPayload(items, {
      clienteId: 5,
      montoRecibido: 17,
      descuento: 1,
    });
    expect(payload.items[0]).toEqual({
      productoId: 10,
      cantidad: 2,
      precioUnitario: 8.5,
    });
    expect(payload.clienteId).toBe(5);
    expect(payload.descuento).toBe(1);
  });
});
