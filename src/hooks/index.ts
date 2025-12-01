/**
 * Hooks consolidados para TanStack Query
 * 
 * Este archivo exporta todos los hooks personalizados para facilitar
 * la importación en los componentes.
 */

// Hooks de productos
export * from './useProducts';

// Hooks de clientes
export * from './useClients';

// Re-exportar hooks de TanStack Query para conveniencia
export { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
