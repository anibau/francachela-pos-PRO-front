import { API_CONFIG, API_ENDPOINTS } from '@/config/api';
import { httpClient, simulateDelay } from './httpClient';
import { mockCombosAligned } from './mockDataAligned';
import type { Combo } from '@/types';
import type {
  ComboCreateRequest,
  PaginationParams,
  PaginatedResponse
} from '@/types/api';
import { normalizeCombo, normalizeCombos } from '@/utils/dataTransform';
import { extractErrorMessage } from '@/utils/errorHandler';

export const combosService = {
  /**
   * Obtener todos los combos
   */
  getAll: async (params?: PaginationParams): Promise<Combo[]> => {
    try {
      if (API_CONFIG.USE_MOCKS) {
        await simulateDelay();
        
        let combos = [...mockCombosAligned];
        
        // Aplicar filtro de búsqueda si existe
        if (params?.search) {
          const searchTerm = params.search.toLowerCase();
          combos = combos.filter(combo => 
            combo.name.toLowerCase().includes(searchTerm) ||
            combo.description.toLowerCase().includes(searchTerm)
          );
        }
        
        return normalizeCombos(combos);
      }
      
      // Usar backend real
      const queryParams = new URLSearchParams();
      if (params?.search) queryParams.append('search', params.search);
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      
      const url = `${API_ENDPOINTS.COMBOS.BASE}${queryParams.toString() ? `?${queryParams}` : ''}`;
      const response = await httpClient.get<PaginatedResponse<Combo> | Combo[]>(url);
      
      // El backend devuelve { data: [], total, page, etc }
      if (response && typeof response === 'object' && 'data' in response) {
        return normalizeCombos((response as PaginatedResponse<Combo>).data);
      }
      return normalizeCombos(Array.isArray(response) ? response : []);
    } catch (error) {
      console.error('Error getting combos:', error);
      throw new Error(extractErrorMessage(error));
    }
  },

  /**
   * Obtener combo por ID
   */
  getById: async (id: number): Promise<Combo> => {
    try {
      if (API_CONFIG.USE_MOCKS) {
        await simulateDelay();
        
        const combo = mockCombosAligned.find(c => c.id === id);
        if (!combo) {
          throw new Error('Combo no encontrado');
        }
        return normalizeCombo(combo);
      }
      
      const combo = await httpClient.get<Combo>(API_ENDPOINTS.COMBOS.BY_ID(id));
      return normalizeCombo(combo);
    } catch (error) {
      console.error('Error getting combo by ID:', error);
      throw new Error(extractErrorMessage(error));
    }
  },

  /**
   * Crear nuevo combo
   */
  create: async (comboData: Omit<Combo, 'id'>): Promise<Combo> => {
    try {
      if (API_CONFIG.USE_MOCKS) {
        await simulateDelay();
        
        const newCombo: Combo = {
          ...comboData,
          id: Math.max(...mockCombosAligned.map(c => c.id), 0) + 1,
        };
        
        mockCombosAligned.push(newCombo);
        return normalizeCombo(newCombo);
      }
      
      // Mapear datos del frontend al formato del backend
      const createRequest: ComboCreateRequest = {
        nombre: comboData.name,
        descripcion: comboData.description,
        productos: comboData.products.map(p => ({
          productoId: p.productId,
          cantidad: p.quantity,
        })),
        precioOriginal: comboData.originalPrice,
        precioCombo: comboData.comboPrice,
        active: comboData.active,
      };
      
      const combo = await httpClient.post<Combo>(API_ENDPOINTS.COMBOS.BASE, createRequest);
      return normalizeCombo(combo);
    } catch (error) {
      console.error('Error creating combo:', error);
      throw new Error(extractErrorMessage(error));
    }
  },

  /**
   * Actualizar combo
   */
  update: async (id: number, comboData: Partial<Combo>): Promise<Combo> => {
    try {
      if (API_CONFIG.USE_MOCKS) {
        await simulateDelay();
        
        const index = mockCombosAligned.findIndex(c => c.id === id);
        if (index === -1) {
          throw new Error('Combo no encontrado');
        }
        
        mockCombosAligned[index] = {
          ...mockCombosAligned[index],
          ...comboData,
        };
        
        return normalizeCombo(mockCombosAligned[index]);
      }
      
      // Mapear datos del frontend al formato del backend
      const updateRequest: Partial<ComboCreateRequest> = {};
      if (comboData.name) updateRequest.nombre = comboData.name;
      if (comboData.description) updateRequest.descripcion = comboData.description;
      if (comboData.products) {
        updateRequest.productos = comboData.products.map(p => ({
          productoId: p.productId,
          cantidad: p.quantity,
        }));
      }
      if (comboData.originalPrice !== undefined) updateRequest.precioOriginal = comboData.originalPrice;
      if (comboData.comboPrice !== undefined) updateRequest.precioCombo = comboData.comboPrice;
      if (comboData.active !== undefined) updateRequest.active = comboData.active;
      
      const combo = await httpClient.patch<Combo>(API_ENDPOINTS.COMBOS.BY_ID(id), updateRequest);
      return normalizeCombo(combo);
    } catch (error) {
      console.error('Error updating combo:', error);
      throw new Error(extractErrorMessage(error));
    }
  },

  /**
   * Eliminar combo
   */
  delete: async (id: number): Promise<void> => {
    try {
      if (API_CONFIG.USE_MOCKS) {
        await simulateDelay();
        
        const index = mockCombosAligned.findIndex(c => c.id === id);
        if (index === -1) {
          throw new Error('Combo no encontrado');
        }
        
        mockCombosAligned.splice(index, 1);
        return;
      }
      
      await httpClient.delete(API_ENDPOINTS.COMBOS.BY_ID(id));
    } catch (error) {
      console.error('Error deleting combo:', error);
      throw new Error(extractErrorMessage(error));
    }
  },

  /**
   * Obtener combos activos
   */
  getActive: async (): Promise<Combo[]> => {
    try {
      if (API_CONFIG.USE_MOCKS) {
        await simulateDelay();
        
        return normalizeCombos(mockCombosAligned.filter(combo => combo.active));
      }
      
      const combos = await httpClient.get<PaginatedResponse<Combo> | Combo[]>(API_ENDPOINTS.COMBOS.ACTIVE);
      if (combos && typeof combos === 'object' && 'data' in combos) {
        return normalizeCombos((combos as PaginatedResponse<Combo>).data);
      }
      return normalizeCombos(Array.isArray(combos) ? combos : []);
    } catch (error) {
      console.error('Error getting active combos:', error);
      throw new Error(extractErrorMessage(error));
    }
  },

  /**
   * Activar combo
   */
  activate: async (id: number): Promise<Combo> => {
    try {
      if (API_CONFIG.USE_MOCKS) {
        await simulateDelay();
        
        const index = mockCombosAligned.findIndex(c => c.id === id);
        if (index === -1) {
          throw new Error('Combo no encontrado');
        }
        
        mockCombosAligned[index].active = true;
        return normalizeCombo(mockCombosAligned[index]);
      }
      
      const combo = await httpClient.patch<Combo>(API_ENDPOINTS.COMBOS.ACTIVATE(id), {});
      return normalizeCombo(combo);
    } catch (error) {
      console.error('Error activating combo:', error);
      throw new Error(extractErrorMessage(error));
    }
  },

  /**
   * Desactivar combo
   */
  deactivate: async (id: number): Promise<Combo> => {
    try {
      if (API_CONFIG.USE_MOCKS) {
        await simulateDelay();
        
        const index = mockCombosAligned.findIndex(c => c.id === id);
        if (index === -1) {
          throw new Error('Combo no encontrado');
        }
        
        mockCombosAligned[index].active = false;
        return normalizeCombo(mockCombosAligned[index]);
      }
      
      const combo = await httpClient.patch<Combo>(API_ENDPOINTS.COMBOS.DEACTIVATE(id), {});
      return normalizeCombo(combo);
    } catch (error) {
      console.error('Error deactivating combo:', error);
      throw new Error(extractErrorMessage(error));
    }
  },
};
