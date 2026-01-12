import { API_CONFIG, API_ENDPOINTS } from '@/config/api';
import { httpClient, simulateDelay } from './httpClient';
import { extractErrorMessage } from '@/utils/errorHandler';

export interface PointsEvaluationRequest {
  clienteId: number;
  items: Array<{
    productoId: number;
    cantidad: number;
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
  }
};
