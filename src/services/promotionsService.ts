import { API_CONFIG, API_ENDPOINTS } from '@/config/api';
import { httpClient, simulateDelay } from './httpClient';
import { mockPromotionsAligned } from './mockDataAligned';
import type { Promotion } from '@/types';
import type { 
  PromotionCreateRequest,
  PaginationParams,
  PaginatedResponse 
} from '@/types/api';
import { toNumber, normalizePromotion, normalizePromotions } from '@/utils/dataTransform';

export const promotionsService = {
  /**
   * Obtener todas las promociones
   */
  getAll: async (params?: PaginationParams): Promise<Promotion[]> => {
    try {
      if (API_CONFIG.USE_MOCKS) {
        await simulateDelay();
        
        let promotions = [...mockPromotionsAligned];
        
        // Aplicar filtro de búsqueda si existe
        if (params?.search) {
          const searchTerm = params.search.toLowerCase();
          promotions = promotions.filter(promotion => 
            promotion.name.toLowerCase().includes(searchTerm) ||
            promotion.description.toLowerCase().includes(searchTerm)
          );
        }
        
        return promotions;
      }
      
      // Usar backend real
      const queryParams = new URLSearchParams();
      if (params?.search) queryParams.append('search', params.search);
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      
      const url = `${API_ENDPOINTS.PROMOTIONS.BASE}${queryParams.toString() ? `?${queryParams}` : ''}`;
      const response = await httpClient.get<PaginatedResponse<Promotion> | Promotion[]>(url);
      
      // El backend devuelve { data: [], total, page, etc }
      if (response && typeof response === 'object' && 'data' in response) {
        return normalizePromotions((response as PaginatedResponse<Promotion>).data);
      }
      return normalizePromotions(Array.isArray(response) ? response : []);
    } catch (error) {
      console.error('Error getting promotions:', error);
      throw new Error('Error al cargar las promociones');
    }
  },

  /**
   * Obtener promoción por ID
   */
  getById: async (id: number): Promise<Promotion> => {
    try {
      if (API_CONFIG.USE_MOCKS) {
        await simulateDelay();
        
        const promotion = mockPromotionsAligned.find(p => p.id === id);
        if (!promotion) {
          throw new Error('Promoción no encontrada');
        }
        return promotion;
      }
      
      const promotion = await httpClient.get<Promotion>(API_ENDPOINTS.PROMOTIONS.BY_ID(id));
      return normalizePromotion(promotion);
    } catch (error) {
      console.error('Error getting promotion by ID:', error);
      throw new Error('Error al cargar la promoción');
    }
  },

  /**
   * Obtener promociones activas
   */
  getActive: async (): Promise<Promotion[]> => {
    try {
      if (API_CONFIG.USE_MOCKS) {
        await simulateDelay();
        
        const now = new Date();
        return mockPromotionsAligned.filter(promotion => {
          if (!promotion.active) return false;
          
          const startDate = new Date(promotion.startDate);
          const endDate = new Date(promotion.endDate);
          
          return now >= startDate && now <= endDate;
        });
      }
      
      const promotions = await httpClient.get<PaginatedResponse<Promotion> | Promotion[]>(API_ENDPOINTS.PROMOTIONS.ACTIVE);
      if (promotions && typeof promotions === 'object' && 'data' in promotions) {
        return normalizePromotions((promotions as PaginatedResponse<Promotion>).data);
      }
      return normalizePromotions(Array.isArray(promotions) ? promotions : []);
    } catch (error) {
      console.error('Error getting active promotions:', error);
      throw new Error('Error al cargar las promociones activas');
    }
  },

  /**
   * Crear nueva promoción
   */
  create: async (promotionData: Omit<Promotion, 'id'>): Promise<Promotion> => {
    try {
      if (API_CONFIG.USE_MOCKS) {
        await simulateDelay();
        
        const newPromotion: Promotion = {
          ...promotionData,
          id: Math.max(...mockPromotionsAligned.map(p => p.id)) + 1,
        };
        
        mockPromotionsAligned.push(newPromotion);
        return newPromotion;
      }
      
      // Mapear datos del frontend al formato del backend
      const createRequest: PromotionCreateRequest = {
        nombre: promotionData.name,
        descripcion: promotionData.description,
        tipo: promotionData.type === 'percentage' ? 'PORCENTAJE' : 'MONTO_FIJO',
        descuento: promotionData.value,
        fechaInicio: promotionData.startDate,
        fechaFin: promotionData.endDate,
        productosId: promotionData.productIds,
        active: promotionData.active,
      };
      
      const promotion = await httpClient.post<Promotion>(API_ENDPOINTS.PROMOTIONS.BASE, createRequest);
      return normalizePromotion(promotion);
    } catch (error) {
      console.error('Error creating promotion:', error);
      throw new Error('Error al crear la promoción');
    }
  },

  /**
   * Actualizar promoción
   */
  update: async (id: number, promotionData: Partial<Promotion>): Promise<Promotion> => {
    try {
      if (API_CONFIG.USE_MOCKS) {
        await simulateDelay();
        
        const index = mockPromotionsAligned.findIndex(p => p.id === id);
        if (index === -1) {
          throw new Error('Promoción no encontrada');
        }
        
        mockPromotionsAligned[index] = {
          ...mockPromotionsAligned[index],
          ...promotionData,
        };
        
        return mockPromotionsAligned[index];
      }
      
      // Mapear datos del frontend al formato del backend
      const updateRequest: Partial<PromotionCreateRequest> = {};
      if (promotionData.name) updateRequest.nombre = promotionData.name;
      if (promotionData.description) updateRequest.descripcion = promotionData.description;
      if (promotionData.type) updateRequest.tipo = promotionData.type === 'percentage' ? 'PORCENTAJE' : 'MONTO_FIJO';
      if (promotionData.value !== undefined) updateRequest.descuento = promotionData.value;
      if (promotionData.startDate) updateRequest.fechaInicio = promotionData.startDate;
      if (promotionData.endDate) updateRequest.fechaFin = promotionData.endDate;
      if (promotionData.productIds) updateRequest.productosId = promotionData.productIds;
      if (promotionData.active !== undefined) updateRequest.active = promotionData.active;
      
      const promotion = await httpClient.patch<Promotion>(API_ENDPOINTS.PROMOTIONS.BY_ID(id), updateRequest);
      return normalizePromotion(promotion);
    } catch (error) {
      console.error('Error updating promotion:', error);
      throw new Error('Error al actualizar la promoción');
    }
  },

  /**
   * Eliminar promoción
   */
  delete: async (id: number): Promise<void> => {
    try {
      if (API_CONFIG.USE_MOCKS) {
        await simulateDelay();
        
        const index = mockPromotionsAligned.findIndex(p => p.id === id);
        if (index === -1) {
          throw new Error('Promoción no encontrada');
        }
        
        mockPromotionsAligned.splice(index, 1);
        return;
      }
      
      await httpClient.delete(API_ENDPOINTS.PROMOTIONS.BY_ID(id));
    } catch (error) {
      console.error('Error deleting promotion:', error);
      throw new Error('Error al eliminar la promoción');
    }
  },

  /**
   * Activar promoción
   */
  activate: async (id: number): Promise<Promotion> => {
    try {
      if (API_CONFIG.USE_MOCKS) {
        await simulateDelay();
        
        const index = mockPromotionsAligned.findIndex(p => p.id === id);
        if (index === -1) {
          throw new Error('Promoción no encontrada');
        }
        
        mockPromotionsAligned[index].active = true;
        return mockPromotionsAligned[index];
      }
      
      return await httpClient.patch<Promotion>(API_ENDPOINTS.PROMOTIONS.ACTIVATE(id)).then(normalizePromotion);
    } catch (error) {
      console.error('Error activating promotion:', error);
      throw new Error('Error al activar la promoción');
    }
  },

  /**
   * Desactivar promoción
   */
  deactivate: async (id: number): Promise<Promotion> => {
    try {
      if (API_CONFIG.USE_MOCKS) {
        await simulateDelay();
        
        const index = mockPromotionsAligned.findIndex(p => p.id === id);
        if (index === -1) {
          throw new Error('Promoción no encontrada');
        }
        
        mockPromotionsAligned[index].active = false;
        return mockPromotionsAligned[index];
      }
      
      return await httpClient.patch<Promotion>(API_ENDPOINTS.PROMOTIONS.DEACTIVATE(id)).then(normalizePromotion);
    } catch (error) {
      console.error('Error deactivating promotion:', error);
      throw new Error('Error al desactivar la promoción');
    }
  },

  /**
   * Validar promoción para una venta
   */
  validate: async (promotionId: number, saleData: any): Promise<{ valid: boolean; discount: number; message?: string }> => {
    try {
      if (API_CONFIG.USE_MOCKS) {
        await simulateDelay();
        
        const promotion = mockPromotionsAligned.find(p => p.id === promotionId);
        if (!promotion) {
          return { valid: false, discount: 0, message: 'Promoción no encontrada' };
        }
        
        if (!promotion.active) {
          return { valid: false, discount: 0, message: 'Promoción inactiva' };
        }
        
        const now = new Date();
        const startDate = new Date(promotion.startDate);
        const endDate = new Date(promotion.endDate);
        
        if (now < startDate || now > endDate) {
          return { valid: false, discount: 0, message: 'Promoción fuera de vigencia' };
        }
        
        // Calcular descuento
        let discount = 0;
        if (promotion.type === 'percentage') {
          discount = (saleData.subtotal * promotion.value) / 100;
        } else {
          discount = promotion.value;
        }
        
        return { valid: true, discount, message: 'Promoción aplicada correctamente' };
      }
      
      return await httpClient.post<{ valid: boolean; discount: number; message?: string }>(
        API_ENDPOINTS.PROMOTIONS.VALIDATE,
        { promotionId, saleData }
      );
    } catch (error) {
      console.error('Error validating promotion:', error);
      return { valid: false, discount: 0, message: 'Error al validar la promoción' };
    }
  },

  /**
   * Buscar promociones
   */
  search: async (query: string): Promise<Promotion[]> => {
    try {
      if (API_CONFIG.USE_MOCKS) {
        await simulateDelay();
        
        const searchTerm = query.toLowerCase();
        return mockPromotionsAligned.filter(promotion => 
          promotion.name.toLowerCase().includes(searchTerm) ||
          promotion.description.toLowerCase().includes(searchTerm)
        );
      }
      
      // Para el backend real, usar el endpoint de getAll con parámetro search
      return await promotionsService.getAll({ search: query });
    } catch (error) {
      console.error('Error searching promotions:', error);
      throw new Error('Error al buscar promociones');
    }
  },

  /**
   * Obtener promociones aplicables a productos específicos
   */
  getApplicablePromotions: async (productIds: number[]): Promise<Promotion[]> => {
    try {
      if (API_CONFIG.USE_MOCKS) {
        await simulateDelay();
        
        const activePromotions = await promotionsService.getActive();
        
        return activePromotions.filter(promotion => {
          // Si la promoción no tiene productos específicos, aplica a todos
          if (!promotion.productIds || promotion.productIds.length === 0) {
            return true;
          }
          
          // Verificar si algún producto está en la promoción
          return promotion.productIds.some(pid => productIds.includes(pid));
        });
      }
      
      // Para el backend real, esto podría ser un endpoint específico
      const activePromotions = await promotionsService.getActive();
      return activePromotions.filter(promotion => {
        if (!promotion.productIds || promotion.productIds.length === 0) {
          return true;
        }
        return promotion.productIds.some(pid => productIds.includes(pid));
      });
    } catch (error) {
      console.error('Error getting applicable promotions:', error);
      throw new Error('Error al cargar las promociones aplicables');
    }
  },

  /**
   * Obtener estadísticas de uso de promociones
   */
  getUsageStatistics: async (promotionId: number): Promise<{ timesUsed: number; totalDiscount: number; lastUsed?: string }> => {
    try {
      if (API_CONFIG.USE_MOCKS) {
        await simulateDelay();
        
        // Mock de estadísticas
        return {
          timesUsed: Math.floor(Math.random() * 50) + 1,
          totalDiscount: Math.floor(Math.random() * 500) + 50,
          lastUsed: '2024-12-01T14:30:00Z',
        };
      }
      
      // Para el backend real, esto podría ser parte de un endpoint de estadísticas
      return {
        timesUsed: 0,
        totalDiscount: 0,
      };
    } catch (error) {
      console.error('Error getting promotion usage statistics:', error);
      throw new Error('Error al cargar las estadísticas de la promoción');
    }
  },
};
