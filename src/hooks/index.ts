/**
 * Hooks consolidados para TanStack Query y autenticación
 * 
 * Este archivo exporta todos los hooks personalizados para facilitar
 * la importación en los componentes.
 */

// Hooks de autenticación
export * from './useAuth';
export * from './useAuthWithRecovery';

// Hooks de productos
export * from './useProducts';

// Hooks de clientes
export * from './useClients';

// Hooks de inputs monetarios
export * from './useMoneyInput';

// Re-exportar hooks de TanStack Query para conveniencia
export { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
