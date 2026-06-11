import type { PaymentMethod, Product, SalePreviewResponse } from '@/types';
import { roundToNearestDime } from '@/utils/moneyUtils';

export interface TicketForCreate {
  clientId?: number;
  notes?: string;
  discount: number;
  recargoExtra: number;
  items: Array<{
    productId: number;
    cantidad: number;
    precio: number;
    isWholesale?: boolean;
  }>;
}

export interface BuildCreatePayloadInput {
  ticket: TicketForCreate;
  salePreview: SalePreviewResponse;
  paymentMethod: PaymentMethod;
  puntosUsados: number;
  metodosPageo?: Array<{
    monto: number;
    metodoPago: PaymentMethod;
    referencia?: string;
  }>;
  products?: Product[];
  efectivoEntregado?: number;
}

export interface CreateVentaPayload {
  clienteId: number | null;
  listaProductos: Array<{
    productoId: number;
    cantidad: number;
    precioUnitario: number;
  }>;
  descuento?: number;
  recargoExtra: number;
  metodosPageo: Array<{
    monto: number;
    metodoPago: PaymentMethod;
    referencia?: string;
  }>;
  comentario: string;
  tipoCompra: string;
  montoRecibido?: number;
  puntosUsados: number;
}

/** Construye POST /ventas desde el preview del backend (fuente de verdad de montos). */
export function buildCreatePayloadFromPreview(
  input: BuildCreatePayloadInput,
): CreateVentaPayload {
  const { ticket, salePreview, paymentMethod, puntosUsados, metodosPageo, products, efectivoEntregado } =
    input;

  const totalCobrado = salePreview.totalCobrado;

  let hasMayoreo = false;
  const listaProductos = ticket.items.map((item) => {
    if (item.isWholesale && products) {
      const producto = products.find((p) => p.id === item.productId);
      if (producto?.precio && producto?.precioMayoreo) {
        hasMayoreo = true;
      }
    }
    return {
      productoId: item.productId,
      cantidad: item.cantidad,
      precioUnitario: item.precio,
    };
  });

  const descuentoManualMasPromos = ticket.discount + (salePreview.descuentoPromos || 0);

  let metodosPageoArray: CreateVentaPayload['metodosPageo'];
  if (metodosPageo && metodosPageo.length > 0) {
    metodosPageoArray = metodosPageo.map((m) => ({
      monto: m.monto,
      metodoPago: m.metodoPago,
      ...(m.referencia && { referencia: m.referencia }),
    }));
  } else {
    metodosPageoArray = [{ monto: totalCobrado, metodoPago: paymentMethod }];
  }

  const recargoExtra = roundToNearestDime(ticket.recargoExtra || 0);

  const payload: CreateVentaPayload = {
    clienteId: ticket.clientId ?? null,
    listaProductos,
    recargoExtra: recargoExtra || 0,
    metodosPageo: metodosPageoArray,
    comentario: ticket.notes || '',
    tipoCompra: 'LOCAL',
    puntosUsados,
  };

  if (descuentoManualMasPromos > 0 && !hasMayoreo) {
    payload.descuento = descuentoManualMasPromos;
  }

  if (efectivoEntregado != null && efectivoEntregado > totalCobrado) {
    payload.montoRecibido = roundToNearestDime(efectivoEntregado);
  }

  return payload;
}
