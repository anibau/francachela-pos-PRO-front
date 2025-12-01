import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productsService } from '@/services/productsService';
import type { Product } from '@/types';
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
  suppliers: () => [...productKeys.all, 'suppliers'] as const,
};

// Hooks para consultas
export const useProducts = (params?: ProductoQueryParams) => {
  return useQuery({
    queryKey: productKeys.list(params),
    queryFn: () => productsService.getAll(params),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
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
    staleTime: 30 * 60 * 1000,
  });
};

export const useProductSuppliers = () => {
  return useQuery({
    queryKey: productKeys.suppliers(),
    queryFn: () => productsService.getSuppliers(),
    staleTime: 30 * 60 * 1000,
  });
};

export const useLowStockProducts = () => {
  return useQuery({
    queryKey: productKeys.lowStock(),
    queryFn: () => productsService.getLowStock(),
    staleTime: 2 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
  });
};

export const useProductSearch = (query: string) => {
  return useProducts({ 
    search: query,
    limit: 20 
  });
};

// Hooks para mutaciones
export const useCreateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productData: Omit<Product, 'id'>) => productsService.create(productData),
    onSuccess: (newProduct) => {
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      queryClient.invalidateQueries({ queryKey: productKeys.categories() });
      queryClient.invalidateQueries({ queryKey: productKeys.suppliers() });
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
      queryClient.setQueryData(productKeys.detail(id), updatedProduct);
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      queryClient.invalidateQueries({ queryKey: productKeys.lowStock() });
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => productsService.delete(id),
    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: productKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      queryClient.invalidateQueries({ queryKey: productKeys.lowStock() });
    },
  });
};

export const useUpdateProductStock = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, stockData }: { id: number; stockData: any }) => 
      productsService.updateStock(id, stockData),
    onSuccess: (updatedProduct, { id }) => {
      queryClient.setQueryData(productKeys.detail(id), updatedProduct);
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      queryClient.invalidateQueries({ queryKey: productKeys.lowStock() });
    },
  });
};
