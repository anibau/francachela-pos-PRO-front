import { useState, useEffect, useCallback } from 'react';
import { entradasService } from '@/services/entradasService';
import type { Entrada, CreateEntradaRequest, EntradasEstadisticas, EntradasListResponse } from '@/types';
import { toast } from 'sonner';

export function useEntradas() {
  const [entradas, setEntradas] = useState<Entrada[]>([]);
  const [estadisticas, setEstadisticas] = useState<EntradasEstadisticas | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    pages: 1,
    total: 0,
    limit: 10
  });
  const [resumen, setResumen] = useState<{ totalMonto: number; totalEntradas: number } | null>(null);

  // Obtener entradas con paginación
  const fetchEntradas = useCallback(async (page: number = 1, limit: number = 10) => {
    setLoading(true);
    setError(null);
    try {
      const response = await entradasService.getAll(page, limit);
      setEntradas(response.entradas);
      setPagination({
        page: response.pagination.page,
        pages: response.pagination.pages,
        total: response.pagination.total,
        limit: response.pagination.limit
      });
      setResumen(response.resumen);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar entradas';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Obtener entradas por rango de fechas
  const fetchEntradasByRange = useCallback(async (fechaInicio: string, fechaFin: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await entradasService.getByRange(fechaInicio, fechaFin);
      setEntradas(response);
      // Reset pagination cuando se filtra por rango
      setPagination({
        page: 1,
        pages: 1,
        total: response.length,
        limit: response.length
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar entradas por rango';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Obtener estadísticas
  const fetchEstadisticas = useCallback(async (fechaInicio: string, fechaFin: string) => {
    try {
      const response = await entradasService.getEstadisticas(fechaInicio, fechaFin);
      setEstadisticas(response);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar estadísticas';
      setError(errorMessage);
      toast.error(errorMessage);
    }
  }, []);

  // Crear entrada
  const createEntrada = useCallback(async (entradaData: CreateEntradaRequest) => {
    try {
      const newEntrada = await entradasService.create(entradaData);
      setEntradas(prev => [newEntrada, ...prev]);
      toast.success('Entrada creada exitosamente');
      return newEntrada;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al crear entrada';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    }
  }, []);

  // Actualizar entrada
  const updateEntrada = useCallback(async (id: number, entradaData: Partial<CreateEntradaRequest>) => {
    try {
      const updatedEntrada = await entradasService.update(id, entradaData);
      setEntradas(prev => prev.map(entrada => 
        entrada.id === id ? updatedEntrada : entrada
      ));
      toast.success('Entrada actualizada exitosamente');
      return updatedEntrada;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar entrada';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    }
  }, []);

  // Eliminar entrada
  const deleteEntrada = useCallback(async (id: number) => {
    try {
      await entradasService.delete(id);
      setEntradas(prev => prev.filter(entrada => entrada.id !== id));
      toast.success('Entrada eliminada exitosamente');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al eliminar entrada';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    }
  }, []);

  // Cargar entradas iniciales
  useEffect(() => {
    fetchEntradas();
  }, [fetchEntradas]);

  return {
    entradas,
    estadisticas,
    resumen,
    loading,
    error,
    pagination,
    fetchEntradas,
    fetchEntradasByRange,
    fetchEstadisticas,
    createEntrada,
    updateEntrada,
    deleteEntrada,
    refetch: () => fetchEntradas(pagination.page, pagination.limit)
  };
}
