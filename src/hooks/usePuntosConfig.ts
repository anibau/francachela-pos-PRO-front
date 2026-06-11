import { useQuery } from '@tanstack/react-query';
import { puntosConfigService } from '@/services/puntosConfigService';

const STALE_MS = 5 * 60 * 1000;

export function usePuntosConfig() {
  return useQuery({
    queryKey: ['puntos-config'],
    queryFn: () => puntosConfigService.get(),
    staleTime: STALE_MS,
  });
}
