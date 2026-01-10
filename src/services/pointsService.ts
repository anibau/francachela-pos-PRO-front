import { API_CONFIG, API_ENDPOINTS } from '@/config/api';
import { httpClient, simulateDelay } from './httpClient';
import { extractErrorMessage } from '@/utils/errorHandler';

export interface PointsEvaluationRequest {
  clienteId: number;
  puntosAUsar: number;
}

export interface PointsEvaluationResponse {
  puntosDisponibles: number;
  puntosAUsar: number;
  descuentoAplicado: number;
  esValido: boolean;
  mensaje?: string;
}

export const pointsService = {
  /**
   * Evaluar puntos disponibles y calcular descuento
   */
  evaluate: async (request: PointsEvaluationRequest): Promise<PointsEvaluationResponse> => {
    try {
      if (API_CONFIG.USE_MOCKS) {
        await simulateDelay();
        // Mock response
        return {
          puntosDisponibles: 100,
          puntosAUsar: request.puntosAUsar,
          descuentoAplicado: request.puntosAUsar * 0.1, // 1 punto = 0.1 soles
          esValido: request.puntosAUsar <= 100,
          mensaje: request.puntosAUsar <= 100 ? 'Puntos válidos' : 'Puntos insuficientes'
        };
      }
      
      const response = await httpClient.post<PointsEvaluationResponse>(
        API_ENDPOINTS.POINTS.EVALUATE,
        request
      );
      
      return response;
    } catch (error) {
      console.error('Error evaluating points:', error);
      throw new Error(extractErrorMessage(error));
    }
  }
};
