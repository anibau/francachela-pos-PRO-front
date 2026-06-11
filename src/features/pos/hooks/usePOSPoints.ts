import { useCallback, useEffect, useRef } from 'react';
import { toast } from '@/hooks/use-toast';
import { pointsService } from '@/services/pointsService';
import { applyPointsEvaluation, maxPuntosFromEvaluation } from '@/features/pos/utils/pointsUtils';
import type { Ticket } from '@/contexts/POSContext';

const DEBOUNCE_MS = 400;

export function usePOSPoints(
  activeTicket: Ticket | undefined,
  updateActiveTicketPoints: (
    update: Partial<Pick<Ticket, 'puntosAUsar' | 'pointsEvaluation'>>,
  ) => void,
) {
  const puntosAUsar = activeTicket?.puntosAUsar ?? 0;
  const pointsEvaluation = activeTicket?.pointsEvaluation ?? null;
  const evalLock = useRef(false);

  const setPuntosAUsar = useCallback(
    (value: number) => {
      updateActiveTicketPoints({
        puntosAUsar: Math.max(0, value),
        pointsEvaluation: null,
      });
    },
    [updateActiveTicketPoints],
  );

  const resetPoints = useCallback(() => {
    updateActiveTicketPoints({ puntosAUsar: 0, pointsEvaluation: null });
  }, [updateActiveTicketPoints]);

  const evaluatePoints = useCallback(async () => {
    if (!activeTicket?.clientId || !puntosAUsar || puntosAUsar <= 0) {
      toast({
        title: 'Error',
        description: 'Selecciona un cliente e ingresa puntos válidos',
        variant: 'destructive',
      });
      return;
    }
    if (evalLock.current) return;
    evalLock.current = true;
    try {
      const evaluation = await pointsService.evaluate({
        clienteId: activeTicket.clientId,
        items: activeTicket.items.map((item) => ({
          productoId: item.productId,
          cantidad: item.cantidad,
          precioUnitario: item.precio,
        })),
        puntosSolicitados: puntosAUsar,
      });
      updateActiveTicketPoints(applyPointsEvaluation(evaluation));
    } catch {
      toast({ title: 'Error', description: 'Error al evaluar puntos', variant: 'destructive' });
      updateActiveTicketPoints({ pointsEvaluation: null });
    } finally {
      evalLock.current = false;
    }
  }, [activeTicket, puntosAUsar, updateActiveTicketPoints]);

  useEffect(() => {
    if (!activeTicket?.clientId || !puntosAUsar || puntosAUsar <= 0) return;
    if (!activeTicket.items.length) return;

    const timer = setTimeout(() => {
      void evaluatePoints();
    }, DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [activeTicket?.items, activeTicket?.clientId, activeTicket?.id]);

  const maxPuntosInput = maxPuntosFromEvaluation(pointsEvaluation, activeTicket?.clientPuntos);

  return {
    puntosAUsar,
    setPuntosAUsar,
    pointsEvaluation,
    pointsDiscount: pointsEvaluation?.descuento ?? 0,
    maxPuntosInput,
    resetPoints,
    evaluatePoints,
  };
}
