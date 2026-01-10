import { useState, useCallback } from 'react';
import { clientsService } from '@/services/clientsService';
import type { 
  ClienteTop, 
  TopClientesResponse, 
  ClientesCumpleanosResponse, 
  ClienteEstadisticasByDNI 
} from '@/types';
import { toast } from 'sonner';

export function useClientesStats() {
  // Estados para Top Clientes (Requerimiento 5)
  const [topClientes, setTopClientes] = useState<TopClientesResponse | null>(null);
  const [loadingTop, setLoadingTop] = useState(false);
  
  // Estados para Cumpleañeros (Requerimiento 6)
  const [cumpleaneros, setCumpleaneros] = useState<ClientesCumpleanosResponse | null>(null);
  const [loadingCumpleaneros, setLoadingCumpleaneros] = useState(false);
  
  // Estados para Estadísticas por DNI (Requerimiento 7)
  const [estadisticasDNI, setEstadisticasDNI] = useState<ClienteEstadisticasByDNI | null>(null);
  const [loadingEstadisticas, setLoadingEstadisticas] = useState(false);
  
  // Estado general de error
  const [error, setError] = useState<string | null>(null);

  /**
   * Cargar Top Clientes (Requerimiento 5)
   */
  const fetchTopClientes = useCallback(async (limit: number = 10) => {
    setLoadingTop(true);
    setError(null);
    
    try {
      const response = await clientsService.getTopClients(limit);
      setTopClientes(response);
      
      if (response.clientes.length === 0) {
        toast.info('No se encontraron clientes top');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al cargar top clientes';
      setError(errorMessage);
      toast.error(errorMessage);
      setTopClientes(null);
    } finally {
      setLoadingTop(false);
    }
  }, []);

  /**
   * Cargar Clientes Cumpleañeros (Requerimiento 6)
   */
  const fetchCumpleaneros = useCallback(async (page: number = 1, limit: number = 10) => {
    setLoadingCumpleaneros(true);
    setError(null);
    
    try {
      const response = await clientsService.getCumpleaneros(page, limit);
      setCumpleaneros(response);
      
      if (response.clientes.length === 0) {
        toast.info('No se encontraron clientes cumpleañeros');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al cargar clientes cumpleañeros';
      setError(errorMessage);
      toast.error(errorMessage);
      setCumpleaneros(null);
    } finally {
      setLoadingCumpleaneros(false);
    }
  }, []);

  /**
   * Cargar Estadísticas por DNI (Requerimiento 7)
   */
  const fetchEstadisticasByDNI = useCallback(async (dni: string) => {
    if (!dni || dni.trim() === '') {
      toast.error('DNI es requerido');
      return;
    }

    setLoadingEstadisticas(true);
    setError(null);
    
    try {
      const response = await clientsService.getEstadisticas(dni);
      setEstadisticasDNI(response);
      toast.success('Estadísticas cargadas correctamente');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al cargar estadísticas del cliente';
      setError(errorMessage);
      toast.error(errorMessage);
      setEstadisticasDNI(null);
    } finally {
      setLoadingEstadisticas(false);
    }
  }, []);

  /**
   * Limpiar datos
   */
  const clearData = useCallback(() => {
    setTopClientes(null);
    setCumpleaneros(null);
    setEstadisticasDNI(null);
    setError(null);
  }, []);

  /**
   * Refrescar Top Clientes
   */
  const refetchTopClientes = useCallback((limit?: number) => {
    const currentLimit = topClientes?.limit || limit || 10;
    return fetchTopClientes(currentLimit);
  }, [fetchTopClientes, topClientes?.limit]);

  /**
   * Refrescar Cumpleañeros
   */
  const refetchCumpleaneros = useCallback((page?: number, limit?: number) => {
    const currentPage = cumpleaneros?.pagination.page || page || 1;
    const currentLimit = cumpleaneros?.pagination.limit || limit || 10;
    return fetchCumpleaneros(currentPage, currentLimit);
  }, [fetchCumpleaneros, cumpleaneros?.pagination]);

  return {
    // Estados
    topClientes,
    cumpleaneros,
    estadisticasDNI,
    error,
    
    // Estados de carga
    loadingTop,
    loadingCumpleaneros,
    loadingEstadisticas,
    
    // Métodos de carga
    fetchTopClientes,
    fetchCumpleaneros,
    fetchEstadisticasByDNI,
    
    // Métodos de utilidad
    clearData,
    refetchTopClientes,
    refetchCumpleaneros,
  };
}
