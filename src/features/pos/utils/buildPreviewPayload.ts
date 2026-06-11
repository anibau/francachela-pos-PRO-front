import type { SaleItem, SalePreviewRequest } from '@/types';

export function buildPreviewPayload(
  items: SaleItem[],
  params: {
    clienteId?: number;
    puntosAUsar?: number;
    descuento?: number;
    recargoExtra?: number;
    montoRecibido?: number;
  },
): SalePreviewRequest {
  return {
    items: items.map((item) => ({
      productoId: item.productId,
      cantidad: item.cantidad,
      precioUnitario: item.precio,
    })),
    ...params,
  };
}
