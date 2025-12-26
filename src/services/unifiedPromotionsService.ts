import { API_CONFIG, API_ENDPOINTS } from '@/config/api';
import { httpClient, simulateDelay } from './httpClient';

// Enums para tipos de promoción y descuento
export enum TipoPromocion {
  SIMPLE = 'SIMPLE',
  PACK = 'PACK',
  COMBO = 'COMBO'
}

export enum TipoDescuento {
  PORCENTAJE = 'PORCENTAJE',
  MONTO_FIJO = 'MONTO_FIJO',
  PRECIO_FIJO = 'PRECIO_FIJO'
}

// Interfaces para la nueva estructura unificada
export interface PromocionProducto {
  id?: number;
  promocionId?: number;
  productoId: number;
  cantidadExacta?: number;
  cantidadMinima?: number;
  obligatorio?: boolean;
  producto?: {
    id: number;
    productoDescripcion: string;
    codigoBarra: string;
    imagen?: string;
    costo: string;
    precio: string;
    precioMayoreo?: string;
    cantidadActual: number;
    cantidadMinima: number;
    proveedor?: string;
    categoria: string;
    valorPuntos?: number;
    mostrar: boolean;
    usaInventario: boolean;
    fechaCreacion: string;
    fechaActualizacion: string;
  };
}

export interface UnifiedPromotion {
  id: number;
  nombre: string;
  descripcion: string;
  tipoPromocion: TipoPromocion;
  tipoDescuento: TipoDescuento;
  descuento: string;
  precioCombo?: string;
  fechaInicio: string;
  fechaFin: string;
  maxUsos: number;
  usosActuales: number;
  activo: boolean;
  puntosExtra?: number;
  createdAt: string;
  updatedAt: string;
  productos: PromocionProducto[];
}

export interface CreateUnifiedPromotionRequest {
  nombre: string;
  descripcion: string;
  tipoPromocion: TipoPromocion;
  tipoDescuento: TipoDescuento;
  descuento: number;
  precioCombo?: number;
  fechaInicio: string;
  fechaFin: string;
  maxUsos: number;
  activo: boolean;
  puntosExtra?: number;
  productosAplicables: {
    productoId: number;
    cantidadExacta?: number;
    cantidadMinima?: number;
    obligatorio?: boolean;
  }[];
}

export interface UpdateUnifiedPromotionRequest extends Partial<CreateUnifiedPromotionRequest> {}

export interface EvaluatePromotionRequest {
  items: {
    productoId: number;
    cantidad: number;
    precioUnitario: number;
  }[];
  montoTotal: number;
}

export interface EvaluatePromotionResponse {
  promocionesAplicables: {
    promocionId: number;
    nombre: string;
    tipoPromocion: TipoPromocion;
    tipoDescuento: TipoDescuento;
    descuentoCalculado: number;
    puntosExtra?: number;
  }[];
  descuentoTotal: number;
  montoFinal: number;
  puntosExtrasTotal: number;
}

export const unifiedPromotionsService = {
  /**
   * Obtener todas las promociones unificadas
   */
  getAll: async (): Promise<UnifiedPromotion[]> => {
    try {
      if (API_CONFIG.USE_MOCKS) {
        await simulateDelay();
        // Retornar datos mock si es necesario
        return [];
      }
      
      const response = await httpClient.get<UnifiedPromotion[]>('/promociones/unificadas');
      return response || [];
    } catch (error) {
      console.error('Error getting unified promotions:', error);
      throw error;
    }
  },

  /**
   * Obtener promociones unificadas activas
   */
  getActive: async (): Promise<UnifiedPromotion[]> => {
    try {
      if (API_CONFIG.USE_MOCKS) {
        await simulateDelay();
        return [];
      }
      
      const response = await httpClient.get<UnifiedPromotion[]>('/promociones/unificadas/activas');
      return response || [];
    } catch (error) {
      console.error('Error getting active unified promotions:', error);
      throw error;
    }
  },

  /**
   * Obtener promoción unificada por ID
   */
  getById: async (id: number): Promise<UnifiedPromotion> => {
    try {
      if (API_CONFIG.USE_MOCKS) {
        await simulateDelay();
        throw new Error('Promoción no encontrada');
      }
      
      const response = await httpClient.get<UnifiedPromotion>(`/promociones/unificadas/${id}`);
      return response;
    } catch (error) {
      console.error('Error getting unified promotion by id:', error);
      throw error;
    }
  },

  /**
   * Crear nueva promoción unificada
   */
  create: async (data: CreateUnifiedPromotionRequest): Promise<UnifiedPromotion> => {
    try {
      if (API_CONFIG.USE_MOCKS) {
        await simulateDelay();
        // Simular respuesta de creación
        const newPromotion: UnifiedPromotion = {
          id: Date.now(),
          ...data,
          descuento: data.descuento.toString(),
          precioCombo: data.precioCombo?.toString(),
          usosActuales: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          productos: []
        };
        return newPromotion;
      }
      
      const response = await httpClient.post<UnifiedPromotion>('/promociones/unificadas', data);
      return response;
    } catch (error) {
      console.error('Error creating unified promotion:', error);
      throw error;
    }
  },

  /**
   * Actualizar promoción unificada
   */
  update: async (id: number, data: UpdateUnifiedPromotionRequest): Promise<UnifiedPromotion> => {
    try {
      if (API_CONFIG.USE_MOCKS) {
        await simulateDelay();
        throw new Error('Función no disponible en modo mock');
      }
      
      const response = await httpClient.patch<UnifiedPromotion>(`/promociones/unificadas/${id}`, data);
      return response;
    } catch (error) {
      console.error('Error updating unified promotion:', error);
      throw error;
    }
  },

  /**
   * Eliminar promoción unificada
   */
  delete: async (id: number): Promise<void> => {
    try {
      if (API_CONFIG.USE_MOCKS) {
        await simulateDelay();
        return;
      }
      
      await httpClient.delete(`/promociones/unificadas/${id}`);
    } catch (error) {
      console.error('Error deleting unified promotion:', error);
      throw error;
    }
  },

  /**
   * Activar promoción unificada
   */
  activate: async (id: number): Promise<UnifiedPromotion> => {
    try {
      if (API_CONFIG.USE_MOCKS) {
        await simulateDelay();
        throw new Error('Función no disponible en modo mock');
      }
      
      const response = await httpClient.patch<UnifiedPromotion>(`/promociones/unificadas/${id}/activate`);
      return response;
    } catch (error) {
      console.error('Error activating unified promotion:', error);
      throw error;
    }
  },

  /**
   * Desactivar promoción unificada
   */
  deactivate: async (id: number): Promise<UnifiedPromotion> => {
    try {
      if (API_CONFIG.USE_MOCKS) {
        await simulateDelay();
        throw new Error('Función no disponible en modo mock');
      }
      
      const response = await httpClient.patch<UnifiedPromotion>(`/promociones/unificadas/${id}/deactivate`);
      return response;
    } catch (error) {
      console.error('Error deactivating unified promotion:', error);
      throw error;
    }
  },

  /**
   * Evaluar promociones para un carrito de compra
   */
  evaluate: async (data: EvaluatePromotionRequest): Promise<EvaluatePromotionResponse> => {
    try {
      if (API_CONFIG.USE_MOCKS) {
        await simulateDelay();
        // Simular respuesta de evaluación
        return {
          promocionesAplicables: [],
          descuentoTotal: 0,
          montoFinal: data.montoTotal,
          puntosExtrasTotal: 0
        };
      }
      
      const response = await httpClient.post<EvaluatePromotionResponse>('/promociones/evaluar', data);
      return response;
    } catch (error) {
      console.error('Error evaluating promotions:', error);
      throw error;
    }
  }
};

