import { API_CONFIG, API_ENDPOINTS } from '@/config/api';
import { httpClient, simulateDelay } from './httpClient';
import { ensureArray } from '@/utils/apiValidators';
import type { Product } from '@/types';
import type { ProductoQueryParams, PaginatedResponse, ProductStockUpdateRequest } from '@/types/backend';
import { normalizeProduct, normalizeProducts } from '@/utils/dataTransform';

export const productsService = {
  /**
   * Obtener todos los productos con filtros opcionales
   */
  getAll: async (params?: ProductoQueryParams): Promise<Product[]> => {
    try {
      if (API_CONFIG.USE_MOCKS) {
        await simulateDelay();
        // Mock data simple
        return [];
      }
      
      // Usar backend real - NO usar 'search', usar el endpoint correcto
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.categoria) queryParams.append('categoria', params.categoria);
      if (params?.mostrar !== undefined) queryParams.append('mostrar', params.mostrar.toString());
      
      const url = `${API_ENDPOINTS.PRODUCTS.BASE}${queryParams.toString() ? `?${queryParams}` : ''}`;
      const response = await httpClient.get<PaginatedResponse<Product> | Product[]>(url);
      
      // El backend devuelve { data: [], total, page, etc }
      let products: any[] = [];
      if (response && typeof response === 'object' && 'data' in response) {
        products = (response as PaginatedResponse<Product>).data;
      } else if (Array.isArray(response)) {
        products = response;
      }
      
      // Normalizar y asegurar que es un array
      return normalizeProducts(ensureArray(products, []));
    } catch (error) {
      console.error('Error getting products:', error);
      // Retornar array vacío en lugar de lanzar error
      return [];
    }
  },

  /**
   * Obtener producto por ID
   */
  getById: async (id: number): Promise<Product> => {
    try {
      const product = await httpClient.get<Product>(API_ENDPOINTS.PRODUCTS.BY_ID(id));
      return normalizeProduct(product);
    } catch (error) {
      console.error('Error getting product by ID:', error);
      throw new Error('Error al cargar el producto');
    }
  },

  /**
   * Buscar productos - usa el endpoint dedicado de búsqueda
   */
  search: async (query: string): Promise<Product[]> => {
    try {
      if (!query || query.length < 2) {
        return [];
      }
      
      // Usar endpoint de búsqueda específico con parámetro 'q'
      const queryParams = new URLSearchParams({ q: query });
      const response = await httpClient.get<PaginatedResponse<Product> | Product[]>(
        `${API_ENDPOINTS.PRODUCTS.SEARCH}?${queryParams}`
      );
      
      if (response && typeof response === 'object' && 'data' in response) {
        return normalizeProducts((response as PaginatedResponse<Product>).data);
      }
      return normalizeProducts(Array.isArray(response) ? response : []);
    } catch (error) {
      console.error('Error searching products:', error);
      // En caso de error, retornar array vacío para no romper la UI
      return [];
    }
  },

  /**
   * Obtener categorías de productos
   */
  getCategories: async (): Promise<string[]> => {
    try {
      return await httpClient.get<string[]>(API_ENDPOINTS.PRODUCTS.CATEGORIES);
    } catch (error) {
      console.error('Error getting categories:', error);
      throw new Error('Error al cargar las categorías');
    }
  },

  /**
   * Obtener productos con stock bajo
   */
  getLowStock: async (): Promise<Product[]> => {
    try {
      const products = await httpClient.get<Product[]>(API_ENDPOINTS.PRODUCTS.LOW_STOCK);
      return normalizeProducts(Array.isArray(products) ? products : []);
    } catch (error) {
      console.error('Error getting low stock products:', error);
      throw new Error('Error al cargar productos con stock bajo');
    }
  },

  /**
   * Crear nuevo producto
   */
  create: async (productData: Omit<Product, 'id'>): Promise<Product> => {
    try {
      const product = await httpClient.post<Product>(API_ENDPOINTS.PRODUCTS.BASE, productData);
      return normalizeProduct(product);
    } catch (error) {
      console.error('Error creating product:', error);
      throw new Error('Error al crear el producto');
    }
  },

  /**
   * Actualizar producto
   */
  update: async (id: number, productData: Partial<Product>): Promise<Product> => {
    try {
      const product = await httpClient.patch<Product>(API_ENDPOINTS.PRODUCTS.BY_ID(id), productData);
      return normalizeProduct(product);
    } catch (error) {
      console.error('Error updating product:', error);
      throw new Error('Error al actualizar el producto');
    }
  },

  /**
   * Eliminar producto (soft delete)
   */
  delete: async (id: number): Promise<void> => {
    try {
      await httpClient.delete(API_ENDPOINTS.PRODUCTS.BY_ID(id));
    } catch (error) {
      console.error('Error deleting product:', error);
      throw new Error('Error al eliminar el producto');
    }
  },

  /**
   * Actualizar stock del producto
   */
  updateStock: async (id: number, stockData: ProductStockUpdateRequest): Promise<Product> => {
    try {
      const product = await httpClient.patch<Product>(API_ENDPOINTS.PRODUCTS.UPDATE_STOCK(id), stockData);
      return normalizeProduct(product);
    } catch (error) {
      console.error('Error updating product stock:', error);
      throw new Error('Error al actualizar el stock del producto');
    }
  },

  /**
   * Obtener proveedores disponibles
   */
  getSuppliers: async (): Promise<string[]> => {
    try {
      const products = await productsService.getAll();
      if (!products || products.length === 0) return [];
      const suppliers = [...new Set(products.map((p: Product) => p.proveedor).filter(Boolean))];
      return suppliers.sort();
    } catch (error) {
      console.error('Error getting suppliers:', error);
      throw new Error('Error al cargar los proveedores');
    }
  },
};
