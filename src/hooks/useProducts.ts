import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productsService } from '@/services/productsService';
import type { Product } from '@/types';
import type { PaginationParams, ProductStockUpdateRequest } from '@/types/api';
import type { ProductoQueryParams } from '@/types/backend';

// Query Keys
export const productKeys = {
  all: ['products'] as const,
  lists: () => [...productKeys.all, 'list'] as const,
  list: (params?: ProductoQueryParams) => [...productKeys.lists(), params] as const,
  details: () => [...productKeys.all, 'detail'] as const,
  detail: (id: number) => [...productKeys.details(), id] as const,
  categories: () => [...productKeys.all, 'categories'] as const,
  lowStock: () => [...productKeys.all, 'lowStock'] as const,
  byCategory: (category: string) => [...productKeys.all, 'byCategory', category] as const,
  movements: (filters?: any) => [...productKeys.all, 'movements', filters] as const,
  suppliers: () => [...productKeys.all, 'suppliers'] as const,
};

// Hooks para consultas
export const useProducts = (params?: ProductoQueryParams) => {
  return useQuery({
    queryKey: productKeys.list(params),
    queryFn: () => productsService.getAll(params),
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
  });
};

export const useProduct = (id: number) => {
  return useQuery({
    queryKey: productKeys.detail(id),
    queryFn: () => productsService.getById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

export const useProductCategories = () => {
  return useQuery({
    queryKey: productKeys.categories(),
    queryFn: () => productsService.getCategories(),
    staleTime: 30 * 60 * 1000, // 30 minutos - las categorías cambian poco
  });
};

export const useProductSuppliers = () => {
  return useQuery({
    queryKey: productKeys.suppliers(),
    queryFn: () => productsService.getSuppliers(),
    staleTime: 30 * 60 * 1000, // 30 minutos
  });
};

export const useLowStockProducts = () => {
  return useQuery({
    queryKey: productKeys.lowStock(),
    queryFn: () => productsService.getLowStock(),
    staleTime: 2 * 60 * 1000, // 2 minutos - información crítica
    refetchInterval: 5 * 60 * 1000, // Refetch cada 5 minutos
  });
};

export const useProductsByCategory = (category: string) => {
  return useQuery({
    queryKey: productKeys.byCategory(category),
    queryFn: () => productsService.getByCategory(category),
    enabled: !!category,
    staleTime: 5 * 60 * 1000,
  });
};

// Hook de búsqueda usando el hook principal con filtros
export const useProductSearch = (query: string) => {
  return useProducts({ 
    search: query,
    // Usar límite pequeño para búsquedas rápidas
    limit: 20 
  });
};

export const useProductMovements = (filters?: any) => {
  return useQuery({
    queryKey: productKeys.movements(filters),
    queryFn: () => productsService.getMovements(filters),
    staleTime: 1 * 60 * 1000, // 1 minuto - movimientos son dinámicos
  });
};

// Hooks para mutaciones
export const useCreateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productData: Omit<Product, 'id'>) => productsService.create(productData),
    onSuccess: (newProduct) => {
      // Invalidar y actualizar caché
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      queryClient.invalidateQueries({ queryKey: productKeys.categories() });
      queryClient.invalidateQueries({ queryKey: productKeys.suppliers() });
      
      // Agregar el nuevo producto al caché
      queryClient.setQueryData(productKeys.detail(newProduct.id), newProduct);
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Product> }) => 
      productsService.update(id, data),
    onSuccess: (updatedProduct, { id }) => {
      // Actualizar el producto específico en caché
      queryClient.setQueryData(productKeys.detail(id), updatedProduct);
      
      // Invalidar listas para reflejar cambios
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      queryClient.invalidateQueries({ queryKey: productKeys.lowStock() });
      
      // Si cambió la categoría, invalidar búsquedas por categoría
      queryClient.invalidateQueries({ queryKey: [...productKeys.all, 'byCategory'] });
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => productsService.delete(id),
    onSuccess: (_, id) => {
      // Remover el producto del caché
      queryClient.removeQueries({ queryKey: productKeys.detail(id) });
      
      // Invalidar listas
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      queryClient.invalidateQueries({ queryKey: productKeys.lowStock() });
    },
  });
};

export const useUpdateProductStock = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, stockData }: { id: number; stockData: ProductStockUpdateRequest }) => 
      productsService.updateStock(id, stockData),
    onSuccess: (updatedProduct, { id }) => {
      // Actualizar el producto en caché
      queryClient.setQueryData(productKeys.detail(id), updatedProduct);
      
      // Invalidar listas y stock bajo
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      queryClient.invalidateQueries({ queryKey: productKeys.lowStock() });
      queryClient.invalidateQueries({ queryKey: productKeys.movements() });
    },
  });
};

export const useActivateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => productsService.activate(id),
    onSuccess: (updatedProduct, id) => {
      // Actualizar el producto en caché
      queryClient.setQueryData(productKeys.detail(id), updatedProduct);
      
      // Invalidar listas
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
    },
  });
};

// Hook personalizado para optimistic updates en stock
export const useOptimisticStockUpdate = () => {
  const queryClient = useQueryClient();
  const updateStockMutation = useUpdateProductStock();

  const updateStock = async (id: number, stockData: ProductStockUpdateRequest) => {
    // Cancelar queries en curso para evitar conflictos
    await queryClient.cancelQueries({ queryKey: productKeys.detail(id) });

    // Snapshot del estado anterior
    const previousProduct = queryClient.getQueryData<Product>(productKeys.detail(id));

    // Optimistic update
    if (previousProduct) {
      const optimisticProduct = { ...previousProduct };
      
      switch (stockData.tipo) {
        case 'ENTRADA':
          optimisticProduct.cantidadActual += stockData.cantidad;
          break;
        case 'SALIDA':
          optimisticProduct.cantidadActual -= stockData.cantidad;
          break;
        case 'AJUSTE':
          optimisticProduct.cantidadActual = stockData.cantidad;
          break;
      }

      queryClient.setQueryData(productKeys.detail(id), optimisticProduct);
    }

    try {
      await updateStockMutation.mutateAsync({ id, stockData });
    } catch (error) {
      // Revertir en caso de error
      if (previousProduct) {
        queryClient.setQueryData(productKeys.detail(id), previousProduct);
      }
      throw error;
    }
  };

  return {
    updateStock,
    isLoading: updateStockMutation.isPending,
    error: updateStockMutation.error,
  };
};
