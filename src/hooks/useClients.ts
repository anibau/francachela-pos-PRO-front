import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { clientsService } from '@/services/clientsService';
import type { Client } from '@/types';
import type { PaginationParams, ClientStatistics } from '@/types/api';
import type { ClienteQueryParams } from '@/types/backend';

// Query Keys
export const clientKeys = {
  all: ['clients'] as const,
  lists: () => [...clientKeys.all, 'list'] as const,
  list: (params?: ClienteQueryParams) => [...clientKeys.lists(), params] as const,
  details: () => [...clientKeys.all, 'detail'] as const,
  detail: (id: number) => [...clientKeys.details(), id] as const,
  birthdays: () => [...clientKeys.all, 'birthdays'] as const,
  topClients: (limit?: number) => [...clientKeys.all, 'topClients', limit] as const,
  byDni: (dni: string) => [...clientKeys.all, 'byDni', dni] as const,
  byCode: (code: string) => [...clientKeys.all, 'byCode', code] as const,
  statistics: (id: number) => [...clientKeys.all, 'statistics', id] as const,
};

// Hooks para consultas
export const useClients = (params?: ClienteQueryParams) => {
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

// getByCode no existe en el service refactorizado

// Hook de búsqueda usando el hook principal con filtros
export const useClientSearch = (query: string) => {
  // Solo hacer búsqueda si hay query de al menos 2 caracteres
  const shouldSearch = query && query.length >= 2;
  return useClients(shouldSearch ? { 
    search: query,
    // Usar límite pequeño para búsquedas rápidas
    limit: 20 
  } : undefined);
};

// getStatistics no existe en el service refactorizado

// Hooks para mutaciones
export const useCreateClient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (clientData: Omit<Client, 'id'>) => {
      // Crear el cliente
      const newClient = await clientsService.create(clientData);
      
      // Enviar mensaje de bienvenida por WhatsApp automáticamente
      try {
        await clientsService.sendWelcomeMessage(newClient.id);
        console.log('Mensaje de bienvenida enviado exitosamente');
      } catch (error) {
        console.warn('Error al enviar mensaje de bienvenida:', error);
        // No fallar la creación del cliente si falla el WhatsApp
      }
      
      return newClient;
    },
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

// activate no existe en el service refactorizado

// updatePoints no existe, se hace vía update normal

export const useValidateClientDni = () => {
  return useMutation({
    mutationFn: ({ dni, excludeId }: { dni: string; excludeId?: number }) => 
      clientsService.validateDni(dni, excludeId),
  });
};

// Método simplificado sin getByCode

// Optimistic updates removidos por simplicidad
