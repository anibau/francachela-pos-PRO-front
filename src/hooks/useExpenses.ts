import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { expensesService } from '@/services/expensesService';
import type { Expense } from '@/types';
import type { 
  ExpenseCreateRequest,
  PaginationParams,
  DateRangeFilter 
} from '@/types/api';

// Query keys
export const EXPENSE_KEYS = {
  all: ['expenses'] as const,
  lists: () => [...EXPENSE_KEYS.all, 'list'] as const,
  list: (params?: PaginationParams) => [...EXPENSE_KEYS.lists(), params] as const,
  details: () => [...EXPENSE_KEYS.all, 'detail'] as const,
  detail: (id: number) => [...EXPENSE_KEYS.details(), id] as const,
  today: () => [...EXPENSE_KEYS.all, 'today'] as const,
  categories: () => [...EXPENSE_KEYS.all, 'categories'] as const,
  statistics: (filters?: DateRangeFilter) => [...EXPENSE_KEYS.all, 'statistics', filters] as const,
  byCategory: (categoria: string) => [...EXPENSE_KEYS.all, 'category', categoria] as const,
  byCashier: (cajero: string) => [...EXPENSE_KEYS.all, 'cashier', cajero] as const,
  byDateRange: (filters: DateRangeFilter) => [...EXPENSE_KEYS.all, 'dateRange', filters] as const,
};

/**
 * Hook para obtener todos los gastos
 */
export function useExpenses(params?: PaginationParams) {
  return useQuery({
    queryKey: EXPENSE_KEYS.list(params),
    queryFn: () => expensesService.getAll(params),
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
}

/**
 * Hook para obtener un gasto por ID
 */
export function useExpense(id: number) {
  return useQuery({
    queryKey: EXPENSE_KEYS.detail(id),
    queryFn: () => expensesService.getById(id),
    enabled: !!id,
  });
}

/**
 * Hook para obtener gastos del día actual
 */
export function useExpensesToday() {
  return useQuery({
    queryKey: EXPENSE_KEYS.today(),
    queryFn: () => expensesService.getToday(),
    staleTime: 1000 * 60 * 2, // 2 minutos
  });
}

/**
 * Hook para obtener categorías de gastos
 */
export function useExpenseCategories() {
  return useQuery({
    queryKey: EXPENSE_KEYS.categories(),
    queryFn: () => expensesService.getCategories(),
    staleTime: 1000 * 60 * 30, // 30 minutos (las categorías no cambian frecuentemente)
  });
}

/**
 * Hook para obtener estadísticas de gastos
 */
export function useExpenseStatistics(filters?: DateRangeFilter) {
  return useQuery({
    queryKey: EXPENSE_KEYS.statistics(filters),
    queryFn: () => expensesService.getStatistics(filters),
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
}

/**
 * Hook para obtener gastos por categoría
 */
export function useExpensesByCategory(categoria: string) {
  return useQuery({
    queryKey: EXPENSE_KEYS.byCategory(categoria),
    queryFn: () => expensesService.getByCategory(categoria),
    enabled: !!categoria && categoria !== 'all',
  });
}

/**
 * Hook para obtener gastos por cajero
 */
export function useExpensesByCashier(cajero: string) {
  return useQuery({
    queryKey: EXPENSE_KEYS.byCashier(cajero),
    queryFn: () => expensesService.getByCashier(cajero),
    enabled: !!cajero && cajero !== 'all',
  });
}

/**
 * Hook para obtener gastos por rango de fechas
 */
export function useExpensesByDateRange(filters: DateRangeFilter) {
  return useQuery({
    queryKey: EXPENSE_KEYS.byDateRange(filters),
    queryFn: () => expensesService.getByDateRange(filters),
    enabled: !!(filters.from && filters.to),
  });
}

/**
 * Hook para crear un gasto
 */
export function useCreateExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (expenseData: ExpenseCreateRequest) => 
      expensesService.create(expenseData),
    onSuccess: () => {
      // Invalidar todas las queries relacionadas con gastos
      queryClient.invalidateQueries({ queryKey: EXPENSE_KEYS.all });
    },
  });
}

/**
 * Hook para actualizar un gasto
 */
export function useUpdateExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<ExpenseCreateRequest> }) => 
      expensesService.update(id, data),
    onSuccess: (_, { id }) => {
      // Invalidar queries específicas y generales
      queryClient.invalidateQueries({ queryKey: EXPENSE_KEYS.detail(id) });
      queryClient.invalidateQueries({ queryKey: EXPENSE_KEYS.lists() });
    },
  });
}

/**
 * Hook para eliminar un gasto
 */
export function useDeleteExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => expensesService.delete(id),
    onSuccess: (_, id) => {
      // Invalidar queries específicas y generales
      queryClient.invalidateQueries({ queryKey: EXPENSE_KEYS.detail(id) });
      queryClient.invalidateQueries({ queryKey: EXPENSE_KEYS.lists() });
    },
  });
}

/**
 * Hook combinado para todas las operaciones de gastos
 */
export function useExpenseOperations() {
  const createExpense = useCreateExpense();
  const updateExpense = useUpdateExpense();
  const deleteExpense = useDeleteExpense();

  return {
    createExpense,
    updateExpense,
    deleteExpense,
    isLoading: createExpense.isPending || updateExpense.isPending || deleteExpense.isPending,
  };
}

