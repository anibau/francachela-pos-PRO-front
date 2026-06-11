import { useQuery } from '@tanstack/react-query';
import { unifiedPromotionsService, type UnifiedPromotion } from '@/services/unifiedPromotionsService';

export function usePOSPromotionsCatalog() {
  return useQuery({
    queryKey: ['pos-promotions-active'],
    queryFn: () => unifiedPromotionsService.getActive(),
    staleTime: 60_000,
  });
}

export function formatPromoLabel(promo: UnifiedPromotion): string {
  const tipo = promo.tipoPromocion;
  const desc = promo.descuento ? `${promo.descuento}` : '';
  return `${promo.nombre} (${tipo}${desc ? ` · ${desc}` : ''})`;
}
