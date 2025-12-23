import { toast } from "sonner";

/**
 * Estructura de respuesta de error del backend
 */
interface BackendErrorResponse {
  message: string;
  status: number;
  error?: string;
  details?: any;
}

/**
 * Estructura de error de Axios
 */
interface AxiosError {
  response?: {
    data?: BackendErrorResponse;
    status?: number;
    statusText?: string;
  };
  message?: string;
  code?: string;
}

/**
 * Extrae el mensaje de error específico del backend
 * @param error - Error capturado (puede ser AxiosError, Error, string, etc.)
 * @returns Mensaje de error específico o genérico
 */
export function extractErrorMessage(error: any): string {
  // Si es un error de Axios con respuesta del backend
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }

  // Si es un error de Axios con mensaje en data (string)
  if (error?.response?.data && typeof error.response.data === 'string') {
    return error.response.data;
  }

  // Si es un error de red o timeout
  if (error?.code === 'NETWORK_ERROR' || error?.code === 'ECONNABORTED') {
    return 'Error de conexión. Verifica tu conexión a internet.';
  }

  // Si es un error 401 (no autorizado)
  if (error?.response?.status === 401) {
    return 'Sesión expirada. Por favor inicia sesión nuevamente.';
  }

  // Si es un error 403 (prohibido)
  if (error?.response?.status === 403) {
    return 'No tienes permisos para realizar esta acción.';
  }

  // Si es un error 404 (no encontrado)
  if (error?.response?.status === 404) {
    return 'Recurso no encontrado.';
  }

  // Si es un error 500 (servidor)
  if (error?.response?.status === 500) {
    return 'Error interno del servidor. Contacta al administrador.';
  }

  // Si es un Error nativo de JavaScript
  if (error instanceof Error) {
    return error.message;
  }

  // Si es un string
  if (typeof error === 'string') {
    return error;
  }

  // Mensaje genérico como fallback
  return 'Ha ocurrido un error inesperado. Inténtalo nuevamente.';
}

/**
 * Muestra un toast de error con el mensaje específico del backend
 * @param error - Error capturado
 * @param fallbackMessage - Mensaje alternativo si no se puede extraer del error
 */
export function showErrorToast(error: any, fallbackMessage?: string): void {
  const errorMessage = extractErrorMessage(error);
  const finalMessage = fallbackMessage && errorMessage === 'Ha ocurrido un error inesperado. Inténtalo nuevamente.' 
    ? fallbackMessage 
    : errorMessage;
  
  toast.error(finalMessage);
}

/**
 * Muestra un toast de éxito
 * @param message - Mensaje de éxito
 */
export function showSuccessToast(message: string): void {
  toast.success(message);
}

/**
 * Muestra un toast de información
 * @param message - Mensaje informativo
 */
export function showInfoToast(message: string): void {
  toast.info(message);
}

/**
 * Muestra un toast de advertencia
 * @param message - Mensaje de advertencia
 */
export function showWarningToast(message: string): void {
  toast.warning(message);
}

/**
 * Muestra un toast de carga
 * @param message - Mensaje de carga
 * @returns ID del toast para poder dismissarlo después
 */
export function showLoadingToast(message: string): string | number {
  return toast.loading(message);
}

/**
 * Cierra un toast específico
 * @param toastId - ID del toast a cerrar
 */
export function dismissToast(toastId: string | number): void {
  toast.dismiss(toastId);
}

/**
 * Maneja errores de forma centralizada con logging
 * @param error - Error capturado
 * @param context - Contexto donde ocurrió el error (ej: 'crear cliente', 'cargar productos')
 * @param showToast - Si debe mostrar toast (default: true)
 */
export function handleError(error: any, context: string, showToast: boolean = true): void {
  const errorMessage = extractErrorMessage(error);
  
  // Log del error para debugging
  console.error(`[${context}] Error:`, {
    originalError: error,
    extractedMessage: errorMessage,
    timestamp: new Date().toISOString()
  });

  // Mostrar toast si está habilitado
  if (showToast) {
    showErrorToast(error, `Error al ${context.toLowerCase()}`);
  }
}

/**
 * Wrapper para operaciones async con manejo de errores automático
 * @param operation - Función async a ejecutar
 * @param context - Contexto de la operación
 * @param successMessage - Mensaje de éxito (opcional)
 * @returns Resultado de la operación o null si hay error
 */
export async function withErrorHandling<T>(
  operation: () => Promise<T>,
  context: string,
  successMessage?: string
): Promise<T | null> {
  try {
    const result = await operation();
    
    if (successMessage) {
      showSuccessToast(successMessage);
    }
    
    return result;
  } catch (error) {
    handleError(error, context);
    return null;
  }
}

