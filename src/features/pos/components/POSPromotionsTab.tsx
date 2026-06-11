import { Gift } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { LoadingState, ErrorState } from '@/components/ui/state-views';
import type { Product } from '@/types';
import type { UnifiedPromotion } from '@/services/unifiedPromotionsService';
import { formatPromoLabel } from '@/features/pos/hooks/usePOSPromotionsCatalog';

interface POSPromotionsTabProps {
  promos: UnifiedPromotion[];
  isLoading: boolean;
  error: Error | null;
  onRetry: () => void;
  onApply: (promo: UnifiedPromotion) => void;
}

export function POSPromotionsTab({
  promos,
  isLoading,
  error,
  onRetry,
  onApply,
}: POSPromotionsTabProps) {
  if (isLoading) return <LoadingState message="Cargando promociones..." />;
  if (error) return <ErrorState message="Error al cargar promociones" onRetry={onRetry} />;
  if (!promos.length) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-muted-foreground text-sm">
        <Gift className="h-8 w-8 mb-2 opacity-50" />
        Sin promociones activas
      </div>
    );
  }

  return (
    <ScrollArea className="flex-1 min-h-0">
      <div className="space-y-2 pr-2">
        {promos.map((promo) => (
          <Card key={promo.id} className="overflow-hidden">
            <CardContent className="p-2 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-xs truncate">{promo.nombre}</p>
                  <p className="text-[10px] text-muted-foreground line-clamp-2">{promo.descripcion}</p>
                </div>
                <Badge variant="secondary" className="text-[9px] shrink-0">
                  {promo.tipoPromocion}
                </Badge>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] text-muted-foreground truncate">
                  {formatPromoLabel(promo)}
                </span>
                {(promo.tipoPromocion === 'COMBO' || promo.tipoPromocion === 'PACK') && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 text-xs shrink-0"
                    onClick={() => onApply(promo)}
                  >
                    Aplicar
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </ScrollArea>
  );
}
