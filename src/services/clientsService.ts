import { API_CONFIG, API_ENDPOINTS } from '@/config/api';
import { httpClient, simulateDelay } from './httpClient';
import { mockClientsAligned } from './mockDataAligned';
import type { Client } from '@/types';
import type { 
  ClientCreateRequest, 
  ClientUpdateRequest,
  PaginationParams,
  ClientStatistics 
} from '@/types/api';

export const clientsService = {
  /**
   * Obtener todos los clientes
   */
  getAll: async (params?: PaginationParams): Promise<Client[]> => {
    try {
      if (API_CONFIG.USE_MOCKS) {
        await simulateDelay();
        
        let clients = [...mockClientsAligned];
        
        // Aplicar filtro de búsqueda si existe
        if (params?.search) {
          const searchTerm = params.search.toLowerCase();
          clients = clients.filter(client => 
            client.nombres.toLowerCase().includes(searchTerm) ||
            client.apellidos.toLowerCase().includes(searchTerm) ||
            client.dni.includes(searchTerm) ||
            client.telefono.includes(searchTerm) ||
            (client.codigoCorto && client.codigoCorto.toLowerCase().includes(searchTerm))
          );
        }
        
        return clients;
      }
      
      // Usar backend real
      const queryParams = new URLSearchParams();
      if (params?.search) queryParams.append('search', params.search);
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      
      const url = `${API_ENDPOINTS.CLIENTS.BASE}${queryParams.toString() ? `?${queryParams}` : ''}`;
      const response = await httpClient.get<any>(url);
      
      // Extraer array de clientes si la respuesta tiene estructura paginada
      if (response && typeof response === 'object' && 'data' in response && Array.isArray(response.data)) {
        return response.data as Client[];
      }
      
      // Si es un array directo, retornarlo como está
      if (Array.isArray(response)) {
        return response as Client[];
      }
      
      // Fallback
      console.warn('Respuesta de clientes con estructura inesperada:', response);
      return [];
    } catch (error) {
      console.error('Error getting clients:', error);
      throw new Error('Error al cargar los clientes');
    }
  },

  /**
   * Obtener cliente por ID
   */
  getById: async (id: number): Promise<Client> => {
    try {
      if (API_CONFIG.USE_MOCKS) {
        await simulateDelay();
        
        const client = mockClientsAligned.find(c => c.id === id);
        if (!client) {
          throw new Error('Cliente no encontrado');
        }
        return client;
      }
      
      return await httpClient.get<Client>(API_ENDPOINTS.CLIENTS.BY_ID(id));
    } catch (error) {
      console.error('Error getting client by ID:', error);
      throw new Error('Error al cargar el cliente');
    }
  },

  /**
   * Buscar clientes
   */
  search: async (query: string): Promise<Client[]> => {
    try {
      if (API_CONFIG.USE_MOCKS) {
        await simulateDelay();
        
        const searchTerm = query.toLowerCase();
        return mockClientsAligned.filter(client => 
          client.nombres.toLowerCase().includes(searchTerm) ||
          client.apellidos.toLowerCase().includes(searchTerm) ||
          client.dni.includes(searchTerm) ||
          client.telefono.includes(searchTerm) ||
          (client.codigoCorto && client.codigoCorto.toLowerCase().includes(searchTerm))
        );
      }
      
      const queryParams = new URLSearchParams({ q: query });
      const response = await httpClient.get<any>(`${API_ENDPOINTS.CLIENTS.SEARCH}?${queryParams}`);
      
      // Extraer array de clientes si la respuesta tiene estructura paginada
      if (response && typeof response === 'object' && 'data' in response && Array.isArray(response.data)) {
        return response.data as Client[];
      }
      
      // Si es un array directo, retornarlo como está
      if (Array.isArray(response)) {
        return response as Client[];
      }
      
      // Fallback
      console.warn('Respuesta de búsqueda de clientes con estructura inesperada:', response);
      return [];
    } catch (error) {
      console.error('Error searching clients:', error);
      throw new Error('Error al buscar clientes');
    }
  },

  /**
   * Obtener clientes que cumplen años hoy
   */
  getBirthdays: async (): Promise<Client[]> => {
    try {
      if (API_CONFIG.USE_MOCKS) {
        await simulateDelay();
        
        const today = new Date();
        const todayMonth = today.getMonth() + 1;
        const todayDay = today.getDate();
        
        return mockClientsAligned.filter(client => {
          if (!client.fechaNacimiento) return false;
          
          const birthday = new Date(client.fechaNacimiento);
          return birthday.getMonth() + 1 === todayMonth && birthday.getDate() === todayDay;
        });
      }
      
      const response = await httpClient.get<any>(API_ENDPOINTS.CLIENTS.BIRTHDAYS);
      
      // Extraer array de clientes si la respuesta tiene estructura paginada
      if (response && typeof response === 'object' && 'data' in response && Array.isArray(response.data)) {
        return response.data as Client[];
      }
      
      // Si es un array directo, retornarlo como está
      if (Array.isArray(response)) {
        return response as Client[];
      }
      
      // Fallback
      console.warn('Respuesta de cumpleaños con estructura inesperada:', response);
      return [];
    } catch (error) {
      console.error('Error getting birthday clients:', error);
      throw new Error('Error al cargar clientes con cumpleaños');
    }
  },

  /**
   * Obtener clientes con más puntos
   */
  getTopClients: async (limit: number = 10): Promise<Client[]> => {
    try {
      if (API_CONFIG.USE_MOCKS) {
        await simulateDelay();
        
        return [...mockClientsAligned]
          .sort((a, b) => b.puntosAcumulados - a.puntosAcumulados)
          .slice(0, limit);
      }
      
      const queryParams = new URLSearchParams({ limit: limit.toString() });
      const response = await httpClient.get<any>(`${API_ENDPOINTS.CLIENTS.TOP}?${queryParams}`);
      
      // Extraer array de clientes si la respuesta tiene estructura paginada
      if (response && typeof response === 'object' && 'data' in response && Array.isArray(response.data)) {
        return response.data as Client[];
      }
      
      // Si es un array directo, retornarlo como está
      if (Array.isArray(response)) {
        return response as Client[];
      }
      
      // Fallback
      console.warn('Respuesta de clientes top con estructura inesperada:', response);
      return [];
    } catch (error) {
      console.error('Error getting top clients:', error);
      throw new Error('Error al cargar clientes top');
    }
  },

  /**
   * Obtener cliente por DNI
   */
  getByDni: async (dni: string): Promise<Client | null> => {
    try {
      if (API_CONFIG.USE_MOCKS) {
        await simulateDelay();
        
        const client = mockClientsAligned.find(c => c.dni === dni);
        return client || null;
      }
      
      return await httpClient.get<Client>(API_ENDPOINTS.CLIENTS.BY_DNI(dni));
    } catch (error) {
      console.error('Error getting client by DNI:', error);
      // No lanzar error si no se encuentra, devolver null
      return null;
    }
  },

  /**
   * Obtener cliente por código corto
   */
  getByCode: async (codigo: string): Promise<Client | null> => {
    try {
      if (API_CONFIG.USE_MOCKS) {
        await simulateDelay();
        
        const client = mockClientsAligned.find(c => c.codigoCorto === codigo);
        return client || null;
      }
      
      return await httpClient.get<Client>(API_ENDPOINTS.CLIENTS.BY_CODE(codigo));
    } catch (error) {
      console.error('Error getting client by code:', error);
      // No lanzar error si no se encuentra, devolver null
      return null;
    }
  },

  /**
   * Crear nuevo cliente
   */
  create: async (clientData: Omit<Client, 'id'>): Promise<Client> => {
    try {
      if (API_CONFIG.USE_MOCKS) {
        await simulateDelay();
        
        // Generar código corto automáticamente
        const initials = `${clientData.nombres.charAt(0)}${clientData.apellidos.charAt(0)}`;
        const nextId = Math.max(...mockClientsAligned.map(c => c.id)) + 1;
        const codigoCorto = `${initials}${nextId.toString().padStart(3, '0')}`;
        
        const newClient: Client = {
          ...clientData,
          id: nextId,
          codigoCorto,
          fechaCreacion: new Date().toISOString(),
          fechaActualizacion: new Date().toISOString(),
          activo: true,
          // Getters para compatibilidad
          get name() { return `${this.nombres} ${this.apellidos}`; },
          get phone() { return this.telefono; },
          get address() { return this.direccion; },
          get birthday() { return this.fechaNacimiento; },
          get points() { return this.puntosAcumulados; },
        };
        
        mockClientsAligned.push(newClient);
        return newClient;
      }
      
      // Mapear datos del frontend al formato del backend
      const createRequest: ClientCreateRequest = {
        nombres: clientData.nombres,
        apellidos: clientData.apellidos,
        dni: clientData.dni,
        telefono: clientData.telefono,
        fechaNacimiento: clientData.fechaNacimiento,
        direccion: clientData.direccion,
      };
      
      return await httpClient.post<Client>(API_ENDPOINTS.CLIENTS.BASE, createRequest);
    } catch (error) {
      console.error('Error creating client:', error);
      throw new Error('Error al crear el cliente');
    }
  },

  /**
   * Actualizar cliente
   */
  update: async (id: number, clientData: Partial<Client>): Promise<Client> => {
    try {
      if (API_CONFIG.USE_MOCKS) {
        await simulateDelay();
        
        const index = mockClientsAligned.findIndex(c => c.id === id);
        if (index === -1) {
          throw new Error('Cliente no encontrado');
        }
        
        mockClientsAligned[index] = {
          ...mockClientsAligned[index],
          ...clientData,
          fechaActualizacion: new Date().toISOString(),
        };
        
        return mockClientsAligned[index];
      }
      
      // Mapear datos del frontend al formato del backend
      const updateRequest: ClientUpdateRequest = {};
      if (clientData.nombres) updateRequest.nombres = clientData.nombres;
      if (clientData.apellidos) updateRequest.apellidos = clientData.apellidos;
      if (clientData.dni) updateRequest.dni = clientData.dni;
      if (clientData.telefono) updateRequest.telefono = clientData.telefono;
      if (clientData.fechaNacimiento !== undefined) updateRequest.fechaNacimiento = clientData.fechaNacimiento;
      if (clientData.direccion !== undefined) updateRequest.direccion = clientData.direccion;
      
      return await httpClient.patch<Client>(API_ENDPOINTS.CLIENTS.BY_ID(id), updateRequest);
    } catch (error) {
      console.error('Error updating client:', error);
      throw new Error('Error al actualizar el cliente');
    }
  },

  /**
   * Eliminar cliente (soft delete)
   */
  delete: async (id: number): Promise<void> => {
    try {
      if (API_CONFIG.USE_MOCKS) {
        await simulateDelay();
        
        const index = mockClientsAligned.findIndex(c => c.id === id);
        if (index === -1) {
          throw new Error('Cliente no encontrado');
        }
        
        // Soft delete - marcar como inactivo
        mockClientsAligned[index].activo = false;
        return;
      }
      
      await httpClient.delete(API_ENDPOINTS.CLIENTS.BY_ID(id));
    } catch (error) {
      console.error('Error deleting client:', error);
      throw new Error('Error al eliminar el cliente');
    }
  },

  /**
   * Obtener estadísticas del cliente
   */
  getStatistics: async (id: number): Promise<ClientStatistics> => {
    try {
      if (API_CONFIG.USE_MOCKS) {
        await simulateDelay();
        
        const client = mockClientsAligned.find(c => c.id === id);
        if (!client) {
          throw new Error('Cliente no encontrado');
        }
        
        // Mock de estadísticas
        return {
          totalCompras: 15,
          montoTotal: 450.50,
          ultimaCompra: '2024-12-01T14:15:00Z',
          puntosAcumulados: client.puntosAcumulados,
          puntosUsados: 50,
        };
      }
      
      return await httpClient.get<ClientStatistics>(API_ENDPOINTS.CLIENTS.STATISTICS(id));
    } catch (error) {
      console.error('Error getting client statistics:', error);
      throw new Error('Error al cargar las estadísticas del cliente');
    }
  },

  /**
   * Activar cliente
   */
  activate: async (id: number): Promise<Client> => {
    try {
      if (API_CONFIG.USE_MOCKS) {
        await simulateDelay();
        
        const index = mockClientsAligned.findIndex(c => c.id === id);
        if (index === -1) {
          throw new Error('Cliente no encontrado');
        }
        
        mockClientsAligned[index].activo = true;
        mockClientsAligned[index].fechaActualizacion = new Date().toISOString();
        
        return mockClientsAligned[index];
      }
      
      return await httpClient.patch<Client>(API_ENDPOINTS.CLIENTS.ACTIVATE(id));
    } catch (error) {
      console.error('Error activating client:', error);
      throw new Error('Error al activar el cliente');
    }
  },

  /**
   * Actualizar puntos del cliente
   */
  updatePoints: async (id: number, points: number, operation: 'add' | 'subtract' | 'set'): Promise<Client> => {
    try {
      if (API_CONFIG.USE_MOCKS) {
        await simulateDelay();
        
        const index = mockClientsAligned.findIndex(c => c.id === id);
        if (index === -1) {
          throw new Error('Cliente no encontrado');
        }
        
        switch (operation) {
          case 'add':
            mockClientsAligned[index].puntosAcumulados += points;
            break;
          case 'subtract':
            mockClientsAligned[index].puntosAcumulados = Math.max(0, mockClientsAligned[index].puntosAcumulados - points);
            break;
          case 'set':
            mockClientsAligned[index].puntosAcumulados = Math.max(0, points);
            break;
        }
        
        mockClientsAligned[index].fechaActualizacion = new Date().toISOString();
        return mockClientsAligned[index];
      }
      
      // Para el backend real, esto se manejaría a través de las ventas
      // Por ahora, actualizar directamente
      const updateData = { puntosAcumulados: points };
      return await this.update(id, updateData);
    } catch (error) {
      console.error('Error updating client points:', error);
      throw new Error('Error al actualizar los puntos del cliente');
    }
  },

  /**
   * Validar DNI único
   */
  validateDni: async (dni: string, excludeId?: number): Promise<boolean> => {
    try {
      if (API_CONFIG.USE_MOCKS) {
        await simulateDelay();
        
        const existingClient = mockClientsAligned.find(c => 
          c.dni === dni && c.id !== excludeId
        );
        
        return !existingClient; // true si no existe (es válido)
      }
      
      const existingClient = await this.getByDni(dni);
      if (existingClient && existingClient.id !== excludeId) {
        return false; // DNI ya existe
      }
      
      return true; // DNI disponible
    } catch (error) {
      console.error('Error validating DNI:', error);
      return false; // En caso de error, asumir que no es válido
    }
  },
};
