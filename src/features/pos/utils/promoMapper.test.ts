import { describe, it, expect } from 'vitest';
import { mapBackendPromoToFrontend } from './promoMapper';
import { TipoDescuento, TipoPromocion } from '@/services/unifiedPromotionsService';

describe('mapBackendPromoToFrontend', () => {
  it('maps montoDescontado to descuentoTotal', () => {
    const result = mapBackendPromoToFrontend({ montoDescontado: 5, precioFinal: 45 }, 50);
    expect(result.descuentoTotal).toBe(5);
    expect(result.montoFinal).toBe(45);
    expect(result.promocionesAplicables).toHaveLength(0);
  });

  it('maps promocionAplicada to promocionesAplicables', () => {
    const result = mapBackendPromoToFrontend(
      {
        montoDescontado: 3,
        precioFinal: 27,
        puntosExtra: 2,
        promocionAplicada: {
          id: 1,
          nombre: '2x1',
          descuento: 3,
          tipo: TipoPromocion.PACK,
          tipoDescuento: TipoDescuento.MONTO_FIJO,
        },
      },
      30,
    );
    expect(result.descuentoTotal).toBe(3);
    expect(result.promocionesAplicables[0].promocionId).toBe(1);
    expect(result.puntosExtrasTotal).toBe(2);
  });
});
