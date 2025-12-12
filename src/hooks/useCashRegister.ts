import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cashRegisterService } from '@/services/cashRegisterService';
import type { CashRegister } from '@/types';
import type { 
  CashRegisterOpenRequest,
  CashRegisterCloseRequest,
  DateRangeFilter 
} from '@/types/api';

// Query keys
export const CASH_REGISTER_KEYS = {
  all: ['cash-register'] as const,
  lists: () => [...CASH_REGISTER_KEYS.all, 'list'] as const,
  list: () => [...CASH_REGISTER_KEYS.lists()] as const,
  details: () => [...CASH_REGISTER_KEYS.all, 'detail'] as const,
  detail: (id: number) => [...CASH_REGISTER_KEYS.details(), id] as const,
  current: () => [...CASH_REGISTER_KEYS.all, 'current'] as const,
  summary: () => [...CASH_REGISTER_KEYS.all, 'summary'] as const,
  statistics: (filters?: DateRangeFilter) => [...CASH_REGISTER_KEYS.all, 'statistics', filters] as const,
  byDateRange: (filters: DateRangeFilter) => [...CASH_REGISTER_KEYS.all, 'dateRange', filters] as const,
};

/**
 * Hook para obtener el historial de cajas
 */
export function useCashRegisterHistory() {
  return useQuery({
    queryKey: CASH_REGISTER_KEYS.list(),
    queryFn: () => cashRegisterService.getHistory(),
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
}

/**
 * Hook para obtener una caja por ID
 */
export function useCashRegister(id: number) {
  return useQuery({
    queryKey: CASH_REGISTER_KEYS.detail(id),
    queryFn: () => cashRegisterService.getById(id),
    enabled: !!id,
  });
}

/**
 * Hook para obtener la caja actual
 */
export function useCurrentCashRegister() {
  return useQuery({
    queryKey: CASH_REGISTER_KEYS.current(),
    queryFn: () => cashRegisterService.getCurrent(),
    staleTime: 1000 * 60 * 2, // 2 minutos
  });
}

/**
 * Hook para obtener el resumen de la caja actual
 */
export function useCashRegisterSummary() {
  return useQuery({
    queryKey: CASH_REGISTER_KEYS.summary(),
    queryFn: () => cashRegisterService.getSummary(),
    staleTime: 1000 * 60 * 2, // 2 minutos
  });
}

/**
 * Hook para obtener estadísticas de cajas
 */
export function useCashRegisterStatistics(filters?: DateRangeFilter) {
  return useQuery({
    queryKey: CASH_REGISTER_KEYS.statistics(filters),
    queryFn: () => cashRegisterService.getStatistics(filters),
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
}

/**
 * Hook para obtener cajas por rango de fechas
 */
export function useCashRegisterByDateRange(filters: DateRangeFilter) {
  return useQuery({
    queryKey: CASH_REGISTER_KEYS.byDateRange(filters),
    queryFn: () => cashRegisterService.getByDateRange(filters),
    enabled: !!(filters.from && filters.to),
  });
}

/**
 * Hook para abrir caja
 */
export function useOpenCashRegister() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CashRegisterOpenRequest) => 
      cashRegisterService.open(data),
    onSuccess: () => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: CASH_REGISTER_KEYS.current() });
      queryClient.invalidateQueries({ queryKey: CASH_REGISTER_KEYS.summary() });
      queryClient.invalidateQueries({ queryKey: CASH_REGISTER_KEYS.list() });
    },
  });
}

/**
 * Hook para cerrar caja
 */
export function useCloseCashRegister() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: CashRegisterCloseRequest }) => 
      cashRegisterService.close(id, data),
    onSuccess: () => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: CASH_REGISTER_KEYS.current() });
      queryClient.invalidateQueries({ queryKey: CASH_REGISTER_KEYS.summary() });
      queryClient.invalidateQueries({ queryKey: CASH_REGISTER_KEYS.list() });
    },
  });
}

/**
 * Hook combinado para todas las operaciones de caja
 */
export function useCashRegisterOperations() {
  const openCashRegister = useOpenCashRegister();
  const closeCashRegister = useCloseCashRegister();

  return {
    openCashRegister,
    closeCashRegister,
    isLoading: openCashRegister.isPending || closeCashRegister.isPending,
  };
}

