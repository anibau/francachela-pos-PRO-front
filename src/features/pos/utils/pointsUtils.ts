import type { PointsEvaluationResponse } from '@/services/pointsService';

/** Sincroniza el input de puntos con la respuesta de /puntos/evaluar. */
export function applyPointsEvaluation(evaluation: PointsEvaluationResponse) {
  return {
    puntosAUsar: evaluation.puntosAceptados,
    pointsEvaluation: evaluation,
  };
}

export function maxPuntosFromEvaluation(
  evaluation: PointsEvaluationResponse | null | undefined,
  clientPuntos?: number,
): number | undefined {
  if (evaluation) {
    return Math.min(evaluation.puntosDisponibles, evaluation.limitePorProductos);
  }
  if (clientPuntos != null) return clientPuntos;
  return undefined;
}

export interface TicketPointsSlice {
  id: string;
  puntosAUsar?: number;
  pointsEvaluation?: PointsEvaluationResponse | null;
  clientId?: number;
}

/** Lee estado de puntos del ticket activo (aislado por ticket). */
export function getTicketPointsState(
  tickets: TicketPointsSlice[],
  activeTicketId: string,
) {
  const ticket = tickets.find((t) => t.id === activeTicketId);
  return {
    puntosAUsar: ticket?.puntosAUsar ?? 0,
    pointsEvaluation: ticket?.pointsEvaluation ?? null,
  };
}
