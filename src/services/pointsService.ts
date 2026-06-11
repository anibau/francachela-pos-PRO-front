import { API_CONFIG, API_ENDPOINTS } from '@/config/api';
import { httpClient, simulateDelay } from './httpClient';
import { extractErrorMessage } from '@/utils/errorHandler';

export interface PointsEvaluationRequest {
  clienteId: number;
  items: Array<{
    productoId: number;
    cantidad: number;
    precioUnitario?: number;
  }>;
  puntosSolicitados: number;
}

/**
 * Response del backend para POST /puntos/evaluar
 * Estructura confirmada en CONSTANTS-ENDPOINTS.md
 */
export interface PointsEvaluationResponse {
  puntosDisponibles: number;
  puntosAceptados: number;
  descuento: number;
  mensaje: string;
  limitePorProductos: number;
  detalleProductos: Array<{
    productoId: number;
    nombre: string;
    precio: number;
    cantidad: number;
    subtotal: number;
    puntosMaximos: number;
  }>;
}

export interface PointsMovement {
  id: number;
  tipo: string;
  puntos: number;
  saldoDespues: number;
  motivo?: string;
  fecha: string;
  ventaId?: number;
}

export interface AdjustPointsRequest {
  clienteId: number;
  puntos: number;
  motivo: string;
  tipo: 'AJUSTE' | 'ACUMULACION' | 'CANJE' | 'REVERSO';
}

export const pointsService = {
  /**
   * Evaluar puntos disponibles y calcular descuento
   * Requiere items del carrito para validación correcta en backend
   */
  evaluate: async (request: PointsEvaluationRequest): Promise<PointsEvaluationResponse> => {
    try {
      if (API_CONFIG.USE_MOCKS) {
        await simulateDelay();
        const puntosAceptados = Math.min(request.puntosSolicitados, 100);
        return {
          puntosDisponibles: 100,
          puntosAceptados: puntosAceptados,
          descuento: puntosAceptados * 0.1,
          mensaje: `Se pueden usar ${puntosAceptados} de ${request.puntosSolicitados} puntos`,
          limitePorProductos: 30,
          detalleProductos: request.items.map(item => ({
            productoId: item.productoId,
            nombre: `Producto ${item.productoId}`,
            precio: 0,
            cantidad: item.cantidad,
            subtotal: 0,
            puntosMaximos: 30
          }))
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
  },

  getHistorial: async (clienteId: number): Promise<PointsMovement[]> => {
    try {
      if (API_CONFIG.USE_MOCKS) {
        await simulateDelay();
        return [];
      }
      const response = await httpClient.get<PointsMovement[]>(
        API_ENDPOINTS.POINTS.HISTORIAL(clienteId),
      );
      return Array.isArray(response) ? response : [];
    } catch (error) {
      console.error('Error getting points history:', error);
      throw new Error(extractErrorMessage(error));
    }
  },

  adjust: async (request: AdjustPointsRequest): Promise<void> => {
    try {
      if (API_CONFIG.USE_MOCKS) {
        await simulateDelay();
        return;
      }
      await httpClient.post(API_ENDPOINTS.POINTS.AJUSTAR, request);
    } catch (error) {
      console.error('Error adjusting points:', error);
      throw new Error(extractErrorMessage(error));
    }
  },

  getStatistics: async (): Promise<Record<string, unknown>> => {
    try {
      if (API_CONFIG.USE_MOCKS) {
        await simulateDelay();
        return {};
      }
      return await httpClient.get<Record<string, unknown>>(API_ENDPOINTS.POINTS.ESTADISTICAS);
    } catch (error) {
      console.error('Error getting points statistics:', error);
      throw new Error(extractErrorMessage(error));
    }
  },
};
