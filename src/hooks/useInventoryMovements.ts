import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { inventoryService } from '@/services/inventoryService';
import type { InventoryMovement } from '@/types';
import type { 
  InventoryMovementCreateRequest,
  PaginationParams,
  DateRangeFilter 
} from '@/types/api';

// Query keys
export const INVENTORY_MOVEMENT_KEYS = {
  all: ['inventory-movements'] as const,
  lists: () => [...INVENTORY_MOVEMENT_KEYS.all, 'list'] as const,
  list: (params?: PaginationParams) => [...INVENTORY_MOVEMENT_KEYS.lists(), params] as const,
  details: () => [...INVENTORY_MOVEMENT_KEYS.all, 'detail'] as const,
  detail: (id: number) => [...INVENTORY_MOVEMENT_KEYS.details(), id] as const,
  today: () => [...INVENTORY_MOVEMENT_KEYS.all, 'today'] as const,
  statistics: (filters?: DateRangeFilter) => [...INVENTORY_MOVEMENT_KEYS.all, 'statistics', filters] as const,
  byType: (tipo: string) => [...INVENTORY_MOVEMENT_KEYS.all, 'type', tipo] as const,
  byCashier: (cajero: string) => [...INVENTORY_MOVEMENT_KEYS.all, 'cashier', cajero] as const,
  byDateRange: (filters: DateRangeFilter) => [...INVENTORY_MOVEMENT_KEYS.all, 'dateRange', filters] as const,
};

/**
 * Hook para obtener todos los movimientos de inventario
 */
export function useInventoryMovements(params?: PaginationParams) {
  return useQuery({
    queryKey: INVENTORY_MOVEMENT_KEYS.list(params),
    queryFn: () => inventoryService.getMovements(params),
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
}

/**
 * Hook para obtener un movimiento por ID
 */
export function useInventoryMovement(id: number) {
  return useQuery({
    queryKey: INVENTORY_MOVEMENT_KEYS.detail(id),
    queryFn: () => inventoryService.getById(id),
    enabled: !!id,
  });
}

/**
 * Hook para obtener movimientos del día actual
 */
export function useInventoryMovementsToday() {
  return useQuery({
    queryKey: INVENTORY_MOVEMENT_KEYS.today(),
    queryFn: () => inventoryService.getToday(),
    staleTime: 1000 * 60 * 2, // 2 minutos
  });
}

/**
 * Hook para obtener estadísticas de inventario
 */
export function useInventoryStatistics(filters?: DateRangeFilter) {
  return useQuery({
    queryKey: INVENTORY_MOVEMENT_KEYS.statistics(filters),
    queryFn: () => inventoryService.getStatistics(filters),
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
}

/**
 * Hook para obtener movimientos por tipo
 */
export function useInventoryMovementsByType(tipo: string) {
  return useQuery({
    queryKey: INVENTORY_MOVEMENT_KEYS.byType(tipo),
    queryFn: () => inventoryService.getByType(tipo),
    enabled: !!tipo && tipo !== 'all',
  });
}

/**
 * Hook para obtener movimientos por cajero
 */
export function useInventoryMovementsByCashier(cajero: string) {
  return useQuery({
    queryKey: INVENTORY_MOVEMENT_KEYS.byCashier(cajero),
    queryFn: () => inventoryService.getByCashier(cajero),
    enabled: !!cajero && cajero !== 'all',
  });
}

/**
 * Hook para obtener movimientos por rango de fechas
 */
export function useInventoryMovementsByDateRange(filters: DateRangeFilter) {
  return useQuery({
    queryKey: INVENTORY_MOVEMENT_KEYS.byDateRange(filters),
    queryFn: () => inventoryService.getByDateRange(filters),
    enabled: !!(filters.from && filters.to),
  });
}

/**
 * Hook para crear un movimiento de inventario
 */
export function useCreateInventoryMovement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (movementData: Omit<InventoryMovement, 'id'>) => 
      inventoryService.createMovement(movementData),
    onSuccess: () => {
      // Invalidar todas las queries relacionadas con movimientos
      queryClient.invalidateQueries({ queryKey: INVENTORY_MOVEMENT_KEYS.all });
    },
  });
}

/**
 * Hook para crear una entrada de inventario
 */
export function useCreateInventoryEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (entryData: InventoryMovementCreateRequest) => 
      inventoryService.createEntry(entryData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: INVENTORY_MOVEMENT_KEYS.all });
    },
  });
}

/**
 * Hook para crear un ajuste de inventario
 */
export function useCreateInventoryAdjustment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (adjustmentData: InventoryMovementCreateRequest) => 
      inventoryService.createAdjustment(adjustmentData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: INVENTORY_MOVEMENT_KEYS.all });
    },
  });
}

/**
 * Hook para crear un movimiento de venta (automático)
 */
export function useCreateInventorySaleMovement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (saleData: InventoryMovementCreateRequest) => 
      inventoryService.createSaleMovement(saleData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: INVENTORY_MOVEMENT_KEYS.all });
    },
  });
}

/**
 * Hook combinado para todas las operaciones de movimientos de inventario
 */
export function useInventoryMovementOperations() {
  const createMovement = useCreateInventoryMovement();
  const createEntry = useCreateInventoryEntry();
  const createAdjustment = useCreateInventoryAdjustment();
  const createSaleMovement = useCreateInventorySaleMovement();

  return {
    createMovement,
    createEntry,
    createAdjustment,
    createSaleMovement,
    isLoading: createMovement.isPending || createEntry.isPending || 
               createAdjustment.isPending || createSaleMovement.isPending,
  };
}

