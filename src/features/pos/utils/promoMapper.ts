import { TipoDescuento, TipoPromocion } from '@/services/unifiedPromotionsService';
import type { EvaluatePromotionResponse } from '@/services/unifiedPromotionsService';

/** Respuesta cruda del backend POST /promociones/evaluar */
export interface BackendPromoEvaluation {
  montoDescontado?: number;
  precioFinal?: number;
  puntosExtra?: number;
  promocionAplicada?: {
    id: number;
    nombre: string;
    descuento: number;
    tipo?: string;
    tipoDescuento?: string;
  } | null;
}

export function mapBackendPromoToFrontend(
  raw: BackendPromoEvaluation,
  montoTotal: number,
): EvaluatePromotionResponse {
  const descuentoTotal = raw.montoDescontado ?? 0;
  const promo = raw.promocionAplicada;

  return {
    promocionesAplicables: promo
      ? [{
          promocionId: promo.id,
          nombre: promo.nombre,
          tipoPromocion: (promo.tipo as TipoPromocion) ?? TipoPromocion.SIMPLE,
          tipoDescuento: (promo.tipoDescuento as TipoDescuento) ?? TipoDescuento.MONTO_FIJO,
          descuentoCalculado: promo.descuento,
          puntosExtra: raw.puntosExtra,
        }]
      : [],
    descuentoTotal,
    montoFinal: raw.precioFinal ?? Math.max(0, montoTotal - descuentoTotal),
    puntosExtrasTotal: raw.puntosExtra ?? 0,
  };
}
