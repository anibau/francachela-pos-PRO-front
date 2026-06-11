import { describe, expect, it } from 'vitest';
import {
  canAddOneUnit,
  canIncreaseQty,
  getAvailableStock,
  getTicketQtyByProduct,
} from './stockUtils';

const product = (stock: number, usaInventario = true) => ({
  cantidadActual: stock,
  usaInventario,
});

describe('stockUtils', () => {
  it('agrega cantidades del mismo producto en líneas distintas', () => {
    const items = [
      { productId: 1, cantidad: 1 },
      { productId: 1, cantidad: 1, isWholesale: true } as { productId: number; cantidad: number },
    ];
    expect(getTicketQtyByProduct(items, 1)).toBe(2);
  });

  it('bloquea tercera unidad con stock 2 en dos líneas', () => {
    const items = [
      { productId: 80, cantidad: 1 },
      { productId: 80, cantidad: 1 },
    ];
    expect(getAvailableStock(product(2), items, 80)).toBe(0);
    expect(canAddOneUnit(product(2), items, 80)).toBe(false);
  });

  it('permite incrementar línea si hay stock restante', () => {
    const items = [{ productId: 80, cantidad: 1 }];
    expect(canIncreaseQty(product(2), items, 80)).toBe(true);
    expect(getAvailableStock(product(2), items, 80)).toBe(1);
  });

  it('sin inventario retorna Infinity', () => {
    expect(getAvailableStock(product(0, false), [], 1)).toBe(Infinity);
  });
});
