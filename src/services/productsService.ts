import { API_CONFIG, API_ENDPOINTS } from '@/config/api';
import { httpClient, simulateDelay } from './httpClient';
import type { Product } from '@/types';
import type { ProductoQueryParams } from '@/types/backend';

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
      
      // Usar backend real
      const queryParams = new URLSearchParams();
      if (params?.search) queryParams.append('search', params.search);
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.categoria) queryParams.append('categoria', params.categoria);
      if (params?.mostrar !== undefined) queryParams.append('mostrar', params.mostrar.toString());
      
      const url = `${API_ENDPOINTS.PRODUCTS.BASE}${queryParams.toString() ? `?${queryParams}` : ''}`;
      const response = await httpClient.get<any>(url);
      
      // El backend devuelve { data: [], total, page, etc }
      return response.data || response;
    } catch (error) {
      console.error('Error getting products:', error);
      throw new Error('Error al cargar los productos');
    }
  },

  /**
   * Obtener producto por ID
   */
  getById: async (id: number): Promise<Product> => {
    try {
      return await httpClient.get<Product>(API_ENDPOINTS.PRODUCTS.BY_ID(id));
    } catch (error) {
      console.error('Error getting product by ID:', error);
      throw new Error('Error al cargar el producto');
    }
  },

  /**
   * Buscar productos
   */
  search: async (query: string): Promise<Product[]> => {
    try {
      const queryParams = new URLSearchParams({ q: query });
      const response = await httpClient.get<any>(`${API_ENDPOINTS.PRODUCTS.SEARCH}?${queryParams}`);
      
      return response.data || response || [];
    } catch (error) {
      console.error('Error searching products:', error);
      throw new Error('Error al buscar productos');
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
      return await httpClient.get<Product[]>(API_ENDPOINTS.PRODUCTS.LOW_STOCK);
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
      return await httpClient.post<Product>(API_ENDPOINTS.PRODUCTS.BASE, productData);
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
      return await httpClient.patch<Product>(API_ENDPOINTS.PRODUCTS.BY_ID(id), productData);
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
  updateStock: async (id: number, stockData: any): Promise<Product> => {
    try {
      return await httpClient.patch<Product>(API_ENDPOINTS.PRODUCTS.UPDATE_STOCK(id), stockData);
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
      const products = await this.getAll();
      const suppliers = [...new Set(products.map(p => p.proveedor))];
      return suppliers.sort();
    } catch (error) {
      console.error('Error getting suppliers:', error);
      throw new Error('Error al cargar los proveedores');
    }
  },
};
