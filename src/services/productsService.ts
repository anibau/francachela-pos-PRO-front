import { API_CONFIG, API_ENDPOINTS } from '@/config/api';
import { httpClient, simulateDelay } from './httpClient';
import { mockProductsAligned, mockProductCategories, mockSuppliers } from './mockDataAligned';
import type { Product } from '@/types';
import type { 
  ProductCreateRequest, 
  ProductUpdateRequest, 
  ProductStockUpdateRequest,
  PaginationParams,
  DateRangeFilter 
} from '@/types/api';

export const productsService = {
  /**
   * Obtener todos los productos
   */
  getAll: async (params?: PaginationParams): Promise<Product[]> => {
    try {
      if (API_CONFIG.USE_MOCKS) {
        await simulateDelay();
        
        let products = [...mockProductsAligned];
        
        // Aplicar filtro de búsqueda si existe
        if (params?.search) {
          const searchTerm = params.search.toLowerCase();
          products = products.filter(product => 
            product.productoDescripcion.toLowerCase().includes(searchTerm) ||
            product.codigoBarra.includes(searchTerm) ||
            product.categoria.toLowerCase().includes(searchTerm) ||
            product.proveedor.toLowerCase().includes(searchTerm)
          );
        }
        
        return products;
      }
      
      // Usar backend real
      const queryParams = new URLSearchParams();
      if (params?.search) queryParams.append('search', params.search);
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      
      const url = `${API_ENDPOINTS.PRODUCTS.BASE}${queryParams.toString() ? `?${queryParams}` : ''}`;
      const response = await httpClient.get<any>(url);
      
      // La API retorna { data: [...], total, page, ... }
      // Extraer solo el array de productos
      if (response && typeof response === 'object' && 'data' in response && Array.isArray(response.data)) {
        return response.data as Product[];
      }
      
      // Si es un array directo, retornarlo como está
      if (Array.isArray(response)) {
        return response as Product[];
      }
      
      // Fallback: retornar array vacío si la estructura no es reconocida
      console.warn('Respuesta de productos con estructura inesperada:', response);
      return [];
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
      if (API_CONFIG.USE_MOCKS) {
        await simulateDelay();
        
        const product = mockProductsAligned.find(p => p.id === id);
        if (!product) {
          throw new Error('Producto no encontrado');
        }
        return product;
      }
      
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
      if (API_CONFIG.USE_MOCKS) {
        await simulateDelay();
        
        const searchTerm = query.toLowerCase();
        return mockProductsAligned.filter(product => 
          product.productoDescripcion.toLowerCase().includes(searchTerm) ||
          product.codigoBarra.includes(searchTerm) ||
          product.categoria.toLowerCase().includes(searchTerm) ||
          product.proveedor.toLowerCase().includes(searchTerm)
        );
      }
      
      const queryParams = new URLSearchParams({ q: query });
      const response = await httpClient.get<any>(`${API_ENDPOINTS.PRODUCTS.SEARCH}?${queryParams}`);
      
      // Extraer array de productos si la respuesta tiene estructura paginada
      if (response && typeof response === 'object' && 'data' in response && Array.isArray(response.data)) {
        return response.data as Product[];
      }
      
      // Si es un array directo, retornarlo como está
      if (Array.isArray(response)) {
        return response as Product[];
      }
      
      // Fallback
      console.warn('Respuesta de búsqueda con estructura inesperada:', response);
      return [];
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
      if (API_CONFIG.USE_MOCKS) {
        await simulateDelay();
        return mockProductCategories;
      }
      
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
      if (API_CONFIG.USE_MOCKS) {
        await simulateDelay();
        
        return mockProductsAligned.filter(product => 
          product.cantidadActual <= product.cantidadMinima
        );
      }
      
      return await httpClient.get<Product[]>(API_ENDPOINTS.PRODUCTS.LOW_STOCK);
    } catch (error) {
      console.error('Error getting low stock products:', error);
      throw new Error('Error al cargar productos con stock bajo');
    }
  },

  /**
   * Obtener productos por categoría
   */
  getByCategory: async (categoria: string): Promise<Product[]> => {
    try {
      if (API_CONFIG.USE_MOCKS) {
        await simulateDelay();
        
        return mockProductsAligned.filter(product => 
          product.categoria.toLowerCase() === categoria.toLowerCase()
        );
      }
      
      return await httpClient.get<Product[]>(API_ENDPOINTS.PRODUCTS.BY_CATEGORY(categoria));
    } catch (error) {
      console.error('Error getting products by category:', error);
      throw new Error('Error al cargar productos por categoría');
    }
  },

  /**
   * Crear nuevo producto
   */
  create: async (productData: Omit<Product, 'id'>): Promise<Product> => {
    try {
      if (API_CONFIG.USE_MOCKS) {
        await simulateDelay();
        
        const newProduct: Product = {
          ...productData,
          id: Math.max(...mockProductsAligned.map(p => p.id)) + 1,
          fechaCreacion: new Date().toISOString(),
          fechaActualizacion: new Date().toISOString(),
          activo: true,
          // Getters para compatibilidad
          get name() { return this.productoDescripcion; },
          get barcode() { return this.codigoBarra; },
          get category() { return this.categoria; },
          get price() { return this.precio; },
          get cost() { return this.costo; },
          get stock() { return this.cantidadActual; },
          get minStock() { return this.cantidadMinima; },
          get supplier() { return this.proveedor; },
          get description() { return this.descripcion; },
          get image() { return this.imagen; },
          get wholesalePrice() { return this.precioMayoreo; },
          get pointsValue() { return this.valorPuntos; },
          get showInCatalog() { return this.mostrar; },
          get useInventory() { return this.usaInventario; },
        };
        
        mockProductsAligned.push(newProduct);
        return newProduct;
      }
      
      // Mapear datos del frontend al formato del backend
      const createRequest: ProductCreateRequest = {
        productoDescripcion: productData.productoDescripcion,
        codigoBarra: productData.codigoBarra,
        imagen: productData.imagen,
        costo: productData.costo,
        precio: productData.precio,
        precioMayoreo: productData.precioMayoreo,
        cantidadActual: productData.cantidadActual,
        cantidadMinima: productData.cantidadMinima,
        proveedor: productData.proveedor,
        categoria: productData.categoria,
        valorPuntos: productData.valorPuntos,
        mostrar: productData.mostrar,
        usaInventario: productData.usaInventario,
      };
      
      return await httpClient.post<Product>(API_ENDPOINTS.PRODUCTS.BASE, createRequest);
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
      if (API_CONFIG.USE_MOCKS) {
        await simulateDelay();
        
        const index = mockProductsAligned.findIndex(p => p.id === id);
        if (index === -1) {
          throw new Error('Producto no encontrado');
        }
        
        mockProductsAligned[index] = {
          ...mockProductsAligned[index],
          ...productData,
          fechaActualizacion: new Date().toISOString(),
        };
        
        return mockProductsAligned[index];
      }
      
      // Mapear datos del frontend al formato del backend
      const updateRequest: ProductUpdateRequest = {};
      if (productData.productoDescripcion) updateRequest.productoDescripcion = productData.productoDescripcion;
      if (productData.codigoBarra) updateRequest.codigoBarra = productData.codigoBarra;
      if (productData.imagen !== undefined) updateRequest.imagen = productData.imagen;
      if (productData.costo !== undefined) updateRequest.costo = productData.costo;
      if (productData.precio !== undefined) updateRequest.precio = productData.precio;
      if (productData.precioMayoreo !== undefined) updateRequest.precioMayoreo = productData.precioMayoreo;
      if (productData.cantidadActual !== undefined) updateRequest.cantidadActual = productData.cantidadActual;
      if (productData.cantidadMinima !== undefined) updateRequest.cantidadMinima = productData.cantidadMinima;
      if (productData.proveedor) updateRequest.proveedor = productData.proveedor;
      if (productData.categoria) updateRequest.categoria = productData.categoria;
      if (productData.valorPuntos !== undefined) updateRequest.valorPuntos = productData.valorPuntos;
      if (productData.mostrar !== undefined) updateRequest.mostrar = productData.mostrar;
      if (productData.usaInventario !== undefined) updateRequest.usaInventario = productData.usaInventario;
      
      return await httpClient.patch<Product>(API_ENDPOINTS.PRODUCTS.BY_ID(id), updateRequest);
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
      if (API_CONFIG.USE_MOCKS) {
        await simulateDelay();
        
        const index = mockProductsAligned.findIndex(p => p.id === id);
        if (index === -1) {
          throw new Error('Producto no encontrado');
        }
        
        // Soft delete - marcar como inactivo
        mockProductsAligned[index].activo = false;
        mockProductsAligned[index].mostrar = false;
        return;
      }
      
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
      if (API_CONFIG.USE_MOCKS) {
        await simulateDelay();
        
        const index = mockProductsAligned.findIndex(p => p.id === id);
        if (index === -1) {
          throw new Error('Producto no encontrado');
        }
        
        // Actualizar stock según el tipo de movimiento
        switch (stockData.tipo) {
          case 'ENTRADA':
            mockProductsAligned[index].cantidadActual += stockData.cantidad;
            break;
          case 'SALIDA':
            mockProductsAligned[index].cantidadActual -= stockData.cantidad;
            break;
          case 'AJUSTE':
            mockProductsAligned[index].cantidadActual = stockData.cantidad;
            break;
        }
        
        mockProductsAligned[index].fechaActualizacion = new Date().toISOString();
        return mockProductsAligned[index];
      }
      
      return await httpClient.patch<Product>(API_ENDPOINTS.PRODUCTS.UPDATE_STOCK(id), stockData);
    } catch (error) {
      console.error('Error updating product stock:', error);
      throw new Error('Error al actualizar el stock del producto');
    }
  },

  /**
   * Activar producto
   */
  activate: async (id: number): Promise<Product> => {
    try {
      if (API_CONFIG.USE_MOCKS) {
        await simulateDelay();
        
        const index = mockProductsAligned.findIndex(p => p.id === id);
        if (index === -1) {
          throw new Error('Producto no encontrado');
        }
        
        mockProductsAligned[index].activo = true;
        mockProductsAligned[index].mostrar = true;
        mockProductsAligned[index].fechaActualizacion = new Date().toISOString();
        
        return mockProductsAligned[index];
      }
      
      return await httpClient.patch<Product>(API_ENDPOINTS.PRODUCTS.ACTIVATE(id));
    } catch (error) {
      console.error('Error activating product:', error);
      throw new Error('Error al activar el producto');
    }
  },

  /**
   * Obtener movimientos de inventario
   */
  getMovements: async (filters?: DateRangeFilter): Promise<any[]> => {
    try {
      if (API_CONFIG.USE_MOCKS) {
        await simulateDelay();
        
        // Mock de movimientos de inventario
        return [
          {
            id: 1,
            productoId: 1,
            productoNombre: 'Cerveza Pilsen 650ml',
            tipo: 'ENTRADA',
            cantidad: 50,
            fecha: '2024-12-01T09:00:00Z',
            cajero: 'Juan Cajero',
            observaciones: 'Compra de mercancía',
          },
          {
            id: 2,
            productoId: 4,
            productoNombre: 'Leche Gloria 1L',
            tipo: 'SALIDA',
            cantidad: 10,
            fecha: '2024-12-01T14:30:00Z',
            cajero: 'Juan Cajero',
            observaciones: 'Venta',
          },
        ];
      }
      
      const queryParams = new URLSearchParams();
      if (filters?.from) queryParams.append('from', filters.from);
      if (filters?.to) queryParams.append('to', filters.to);
      
      const url = `${API_ENDPOINTS.PRODUCTS.MOVEMENTS}${queryParams.toString() ? `?${queryParams}` : ''}`;
      return await httpClient.get<any[]>(url);
    } catch (error) {
      console.error('Error getting product movements:', error);
      throw new Error('Error al cargar los movimientos de inventario');
    }
  },

  /**
   * Obtener proveedores disponibles
   */
  getSuppliers: async (): Promise<string[]> => {
    try {
      if (API_CONFIG.USE_MOCKS) {
        await simulateDelay();
        return mockSuppliers;
      }
      
      // El backend no tiene endpoint específico para proveedores,
      // se obtienen de los productos existentes
      const products = await this.getAll();
      const suppliers = [...new Set(products.map(p => p.proveedor))];
      return suppliers.sort();
    } catch (error) {
      console.error('Error getting suppliers:', error);
      throw new Error('Error al cargar los proveedores');
    }
  },
};
