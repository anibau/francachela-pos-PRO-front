import { useState, useEffect, useCallback } from 'react';
import { expensesService } from '@/services/expensesService';
import type { Expense, GastosEstadisticas } from '@/types';
import { toast } from 'sonner';

export function useGastos() {
  const [gastos, setGastos] = useState<Expense[]>([]);
  const [estadisticas, setEstadisticas] = useState<GastosEstadisticas | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    pages: 1,
    total: 0,
    limit: 10
  });

  // Obtener gastos con paginación
  const fetchGastos = useCallback(async (page: number = 1, limit: number = 10) => {
    setLoading(true);
    setError(null);
    try {
      const response = await expensesService.getAll({ page, limit });
      
      // Si la respuesta es un array simple, adaptarla
      if (Array.isArray(response)) {
        setGastos(response);
        setPagination({
          page: 1,
          pages: 1,
          total: response.length,
          limit: response.length
        });
      } else {
        // Si tiene estructura de paginación
        setGastos(response.gastos || response.data || []);
        setPagination({
          page: response.pagination?.page || page,
          pages: response.pagination?.pages || 1,
          total: response.pagination?.total || 0,
          limit: response.pagination?.limit || limit
        });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar gastos';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Obtener estadísticas de gastos con filtros de fecha
  const fetchEstadisticas = useCallback(async (fechaInicio: string, fechaFin: string) => {
    try {
      const response = await expensesService.getEstadisticas(fechaInicio, fechaFin);
      setEstadisticas(response);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar estadísticas de gastos';
      setError(errorMessage);
      toast.error(errorMessage);
    }
  }, []);

  // Crear nuevo gasto
  const createGasto = useCallback(async (gastoData: any) => {
    setLoading(true);
    try {
      const newGasto = await expensesService.create(gastoData);
      setGastos(prev => [newGasto, ...prev]);
      toast.success('Gasto creado correctamente');
      return newGasto;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al crear gasto';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Actualizar gasto
  const updateGasto = useCallback(async (id: number, gastoData: any) => {
    setLoading(true);
    try {
      const updatedGasto = await expensesService.update(id, gastoData);
      setGastos(prev => prev.map(gasto => gasto.id === id ? updatedGasto : gasto));
      toast.success('Gasto actualizado correctamente');
      return updatedGasto;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar gasto';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Eliminar gasto
  const deleteGasto = useCallback(async (id: number) => {
    setLoading(true);
    try {
      await expensesService.delete(id);
      setGastos(prev => prev.filter(gasto => gasto.id !== id));
      toast.success('Gasto eliminado correctamente');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al eliminar gasto';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargar gastos al montar el componente
  useEffect(() => {
    fetchGastos();
  }, [fetchGastos]);

  return {
    gastos,
    estadisticas,
    loading,
    error,
    pagination,
    fetchGastos,
    fetchEstadisticas,
    createGasto,
    updateGasto,
    deleteGasto,
    refetch: () => fetchGastos(pagination.page, pagination.limit)
  };
}

