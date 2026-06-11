import { describe, expect, it } from 'vitest';
import {
  applyPointsEvaluation,
  getTicketPointsState,
  maxPuntosFromEvaluation,
} from './pointsUtils';
import type { PointsEvaluationResponse } from '@/services/pointsService';

const evaluation = (over: Partial<PointsEvaluationResponse> = {}): PointsEvaluationResponse => ({
  puntosDisponibles: 100,
  puntosAceptados: 30,
  descuento: 3,
  mensaje: 'Solo se pueden usar 30 pts',
  limitePorProductos: 30,
  ...over,
});

describe('pointsUtils', () => {
  it('syncs puntosAUsar to puntosAceptados after evaluation', () => {
    const result = applyPointsEvaluation(evaluation({ puntosAceptados: 30 }));
    expect(result.puntosAUsar).toBe(30);
    expect(result.pointsEvaluation?.descuento).toBe(3);
  });

  it('max input uses min of disponibles and limitePorProductos', () => {
    expect(maxPuntosFromEvaluation(evaluation({ puntosDisponibles: 100, limitePorProductos: 30 }))).toBe(30);
    expect(maxPuntosFromEvaluation(null, 100)).toBe(100);
  });

  it('ticket switch keeps independent points per ticket', () => {
    const tickets = [
      { id: '1', clientId: 1, puntosAUsar: 50, pointsEvaluation: evaluation({ puntosAceptados: 50 }) },
      { id: '2', clientId: 2, puntosAUsar: 0, pointsEvaluation: null },
    ];
    expect(getTicketPointsState(tickets, '1').puntosAUsar).toBe(50);
    expect(getTicketPointsState(tickets, '2').puntosAUsar).toBe(0);
    expect(getTicketPointsState(tickets, '2').pointsEvaluation).toBeNull();
  });
});
