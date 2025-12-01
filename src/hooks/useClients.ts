import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { clientsService } from '@/services/clientsService';
import type { Client } from '@/types';
import type { PaginationParams, ClientStatistics } from '@/types/api';

// Query Keys
export const clientKeys = {
  all: ['clients'] as const,
  lists: () => [...clientKeys.all, 'list'] as const,
  list: (params?: PaginationParams) => [...clientKeys.lists(), params] as const,
  details: () => [...clientKeys.all, 'detail'] as const,
  detail: (id: number) => [...clientKeys.details(), id] as const,
  birthdays: () => [...clientKeys.all, 'birthdays'] as const,
  topClients: (limit?: number) => [...clientKeys.all, 'topClients', limit] as const,
  byDni: (dni: string) => [...clientKeys.all, 'byDni', dni] as const,
  byCode: (code: string) => [...clientKeys.all, 'byCode', code] as const,
  search: (query: string) => [...clientKeys.all, 'search', query] as const,
  statistics: (id: number) => [...clientKeys.all, 'statistics', id] as const,
};

// Hooks para consultas
export const useClients = (params?: PaginationParams) => {
  return useQuery({
    queryKey: clientKeys.list(params),
    queryFn: () => clientsService.getAll(params),
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
  });
};

export const useClient = (id: number) => {
  return useQuery({
    queryKey: clientKeys.detail(id),
    queryFn: () => clientsService.getById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

export const useClientBirthdays = () => {
  return useQuery({
    queryKey: clientKeys.birthdays(),
    queryFn: () => clientsService.getBirthdays(),
    staleTime: 60 * 60 * 1000, // 1 hora - los cumpleaños no cambian durante el día
    refetchInterval: 60 * 60 * 1000, // Refetch cada hora
  });
};

export const useTopClients = (limit: number = 10) => {
  return useQuery({
    queryKey: clientKeys.topClients(limit),
    queryFn: () => clientsService.getTopClients(limit),
    staleTime: 10 * 60 * 1000, // 10 minutos
  });
};

export const useClientByDni = (dni: string) => {
  return useQuery({
    queryKey: clientKeys.byDni(dni),
    queryFn: () => clientsService.getByDni(dni),
    enabled: !!dni && dni.length >= 8, // Solo buscar si el DNI tiene al menos 8 dígitos
    staleTime: 5 * 60 * 1000,
  });
};

export const useClientByCode = (code: string) => {
  return useQuery({
    queryKey: clientKeys.byCode(code),
    queryFn: () => clientsService.getByCode(code),
    enabled: !!code && code.length >= 3, // Solo buscar si el código tiene al menos 3 caracteres
    staleTime: 5 * 60 * 1000,
  });
};

export const useClientSearch = (query: string) => {
  return useQuery({
    queryKey: clientKeys.search(query),
    queryFn: () => clientsService.search(query),
    enabled: query.length >= 2, // Solo buscar si hay al menos 2 caracteres
    staleTime: 2 * 60 * 1000,
  });
};

export const useClientStatistics = (id: number) => {
  return useQuery({
    queryKey: clientKeys.statistics(id),
    queryFn: () => clientsService.getStatistics(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

// Hooks para mutaciones
export const useCreateClient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (clientData: Omit<Client, 'id'>) => clientsService.create(clientData),
    onSuccess: (newClient) => {
      // Invalidar y actualizar caché
      queryClient.invalidateQueries({ queryKey: clientKeys.lists() });
      queryClient.invalidateQueries({ queryKey: clientKeys.topClients() });
      
      // Agregar el nuevo cliente al caché
      queryClient.setQueryData(clientKeys.detail(newClient.id), newClient);
      
      // Si tiene cumpleaños hoy, invalidar cumpleaños
      const today = new Date().toISOString().split('T')[0];
      if (newClient.fechaNacimiento?.startsWith(today.slice(5))) { // MM-DD
        queryClient.invalidateQueries({ queryKey: clientKeys.birthdays() });
      }
    },
  });
};

export const useUpdateClient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Client> }) => 
      clientsService.update(id, data),
    onSuccess: (updatedClient, { id }) => {
      // Actualizar el cliente específico en caché
      queryClient.setQueryData(clientKeys.detail(id), updatedClient);
      
      // Invalidar listas para reflejar cambios
      queryClient.invalidateQueries({ queryKey: clientKeys.lists() });
      queryClient.invalidateQueries({ queryKey: clientKeys.topClients() });
      queryClient.invalidateQueries({ queryKey: clientKeys.birthdays() });
      
      // Invalidar búsquedas por DNI y código si cambiaron
      queryClient.invalidateQueries({ queryKey: [...clientKeys.all, 'byDni'] });
      queryClient.invalidateQueries({ queryKey: [...clientKeys.all, 'byCode'] });
    },
  });
};

export const useDeleteClient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => clientsService.delete(id),
    onSuccess: (_, id) => {
      // Remover el cliente del caché
      queryClient.removeQueries({ queryKey: clientKeys.detail(id) });
      queryClient.removeQueries({ queryKey: clientKeys.statistics(id) });
      
      // Invalidar listas
      queryClient.invalidateQueries({ queryKey: clientKeys.lists() });
      queryClient.invalidateQueries({ queryKey: clientKeys.topClients() });
      queryClient.invalidateQueries({ queryKey: clientKeys.birthdays() });
    },
  });
};

export const useActivateClient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => clientsService.activate(id),
    onSuccess: (updatedClient, id) => {
      // Actualizar el cliente en caché
      queryClient.setQueryData(clientKeys.detail(id), updatedClient);
      
      // Invalidar listas
      queryClient.invalidateQueries({ queryKey: clientKeys.lists() });
    },
  });
};

export const useUpdateClientPoints = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, points, operation }: { id: number; points: number; operation: 'add' | 'subtract' | 'set' }) => 
      clientsService.updatePoints(id, points, operation),
    onSuccess: (updatedClient, { id }) => {
      // Actualizar el cliente en caché
      queryClient.setQueryData(clientKeys.detail(id), updatedClient);
      
      // Invalidar listas y top clients (los puntos pueden cambiar el ranking)
      queryClient.invalidateQueries({ queryKey: clientKeys.lists() });
      queryClient.invalidateQueries({ queryKey: clientKeys.topClients() });
      queryClient.invalidateQueries({ queryKey: clientKeys.statistics(id) });
    },
  });
};

export const useValidateClientDni = () => {
  return useMutation({
    mutationFn: ({ dni, excludeId }: { dni: string; excludeId?: number }) => 
      clientsService.validateDni(dni, excludeId),
  });
};

// Hook personalizado para búsqueda inteligente de clientes
export const useSmartClientSearch = () => {
  const queryClient = useQueryClient();

  const searchClient = async (query: string) => {
    // Si parece un DNI (solo números, 8 dígitos)
    if (/^\d{8}$/.test(query)) {
      const client = await clientsService.getByDni(query);
      if (client) {
        // Cachear el resultado
        queryClient.setQueryData(clientKeys.detail(client.id), client);
        return [client];
      }
    }

    // Si parece un código corto (letras + números)
    if (/^[A-Z]{2,3}\d{3}$/i.test(query)) {
      const client = await clientsService.getByCode(query.toUpperCase());
      if (client) {
        queryClient.setQueryData(clientKeys.detail(client.id), client);
        return [client];
      }
    }

    // Búsqueda general por nombre
    return await clientsService.search(query);
  };

  return useMutation({
    mutationFn: searchClient,
  });
};

// Hook para optimistic updates de puntos
export const useOptimisticPointsUpdate = () => {
  const queryClient = useQueryClient();
  const updatePointsMutation = useUpdateClientPoints();

  const updatePoints = async (id: number, points: number, operation: 'add' | 'subtract' | 'set') => {
    // Cancelar queries en curso
    await queryClient.cancelQueries({ queryKey: clientKeys.detail(id) });

    // Snapshot del estado anterior
    const previousClient = queryClient.getQueryData<Client>(clientKeys.detail(id));

    // Optimistic update
    if (previousClient) {
      const optimisticClient = { ...previousClient };
      
      switch (operation) {
        case 'add':
          optimisticClient.puntosAcumulados += points;
          break;
        case 'subtract':
          optimisticClient.puntosAcumulados = Math.max(0, optimisticClient.puntosAcumulados - points);
          break;
        case 'set':
          optimisticClient.puntosAcumulados = Math.max(0, points);
          break;
      }

      queryClient.setQueryData(clientKeys.detail(id), optimisticClient);
    }

    try {
      await updatePointsMutation.mutateAsync({ id, points, operation });
    } catch (error) {
      // Revertir en caso de error
      if (previousClient) {
        queryClient.setQueryData(clientKeys.detail(id), previousClient);
      }
      throw error;
    }
  };

  return {
    updatePoints,
    isLoading: updatePointsMutation.isPending,
    error: updatePointsMutation.error,
  };
};
