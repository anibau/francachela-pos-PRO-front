import { API_CONFIG } from '@/config/api';
import type { ApiResponse, ApiError } from '@/types/api';

// Tipos para el cliente HTTP
interface RequestConfig extends RequestInit {
  timeout?: number;
  retries?: number;
  requiresAuth?: boolean;
}

interface HttpClient {
  get<T>(url: string, config?: RequestConfig): Promise<T>;
  post<T>(url: string, data?: any, config?: RequestConfig): Promise<T>;
  put<T>(url: string, data?: any, config?: RequestConfig): Promise<T>;
  patch<T>(url: string, data?: any, config?: RequestConfig): Promise<T>;
  delete<T>(url: string, config?: RequestConfig): Promise<T>;
}

class FrancachelaHttpClient implements HttpClient {
  private baseURL: string;
  private defaultTimeout: number = 10000;
  private defaultRetries: number = 3;

  constructor(baseURL: string) {
    this.baseURL = baseURL.replace(/\/$/, ''); // Remove trailing slash
  }

  private log(message: string, data?: any) {
    if (API_CONFIG.ENABLE_LOGGING) {
      console.log(`[HttpClient] ${message}`, data || '');
    }
  }

  private getAuthToken(): string | null {
    try {
      const user = localStorage.getItem('user');
      if (user) {
        const userData = JSON.parse(user);
        return userData.token || null;
      }
      return localStorage.getItem('auth_token');
    } catch (error) {
      this.log('Error getting auth token:', error);
      return null;
    }
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    const contentType = response.headers.get('content-type');
    
    // Handle non-JSON responses (like file downloads)
    if (!contentType || !contentType.includes('application/json')) {
      if (response.ok) {
        return response.blob() as unknown as T;
      }
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    // Handle successful responses
    if (response.ok) {
      // If it's a standard API response with status/message/data structure
      if (typeof data === 'object' && 'status' in data && 'data' in data) {
        const apiResponse = data as ApiResponse<T>;
        if (apiResponse.status) {
          return apiResponse.data;
        } else {
          throw new Error(apiResponse.message || 'API returned error status');
        }
      }
      // Return raw data if it's not in standard format
      return data;
    }

    // Handle error responses
    if (data && typeof data === 'object') {
      const apiError = data as ApiError;
      throw new Error(apiError.message || apiError.error || `HTTP ${response.status}`);
    }

    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  private async makeRequest<T>(
    url: string,
    config: RequestConfig = {}
  ): Promise<T> {
    const {
      timeout = this.defaultTimeout,
      retries = this.defaultRetries,
      requiresAuth = true,
      ...fetchConfig
    } = config;

    const fullUrl = url.startsWith('http') ? url : `${this.baseURL}${url}`;
    
    // Setup headers
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...fetchConfig.headers,
    };

    // Add authorization header if required
    if (requiresAuth) {
      const token = this.getAuthToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    // Setup abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const requestConfig: RequestInit = {
      ...fetchConfig,
      headers,
      signal: controller.signal,
    };

    this.log(`Making ${fetchConfig.method || 'GET'} request to:`, fullUrl);
    this.log('Request config:', { ...requestConfig, signal: undefined });

    let lastError: Error;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const response = await fetch(fullUrl, requestConfig);
        clearTimeout(timeoutId);
        
        this.log(`Response status: ${response.status}`);
        
        // Handle 401 Unauthorized - token might be expired
        if (response.status === 401) {
          this.log('Unauthorized response, clearing auth token');
          localStorage.removeItem('user');
          localStorage.removeItem('auth_token');
          
          // Redirect to login if we're not already there
          if (!window.location.pathname.includes('/login')) {
            window.location.href = '/login';
          }
          
          throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
        }

        return await this.handleResponse<T>(response);
      } catch (error) {
        clearTimeout(timeoutId);
        lastError = error as Error;
        
        this.log(`Attempt ${attempt + 1} failed:`, lastError.message);

        // Don't retry on certain errors
        if (
          lastError.name === 'AbortError' ||
          lastError.message.includes('Sesión expirada') ||
          lastError.message.includes('401')
        ) {
          break;
        }

        // Wait before retrying (exponential backoff)
        if (attempt < retries) {
          const delay = Math.pow(2, attempt) * 1000;
          this.log(`Retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError!;
  }

  async get<T>(url: string, config?: RequestConfig): Promise<T> {
    return this.makeRequest<T>(url, { ...config, method: 'GET' });
  }

  async post<T>(url: string, data?: any, config?: RequestConfig): Promise<T> {
    return this.makeRequest<T>(url, {
      ...config,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(url: string, data?: any, config?: RequestConfig): Promise<T> {
    return this.makeRequest<T>(url, {
      ...config,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T>(url: string, data?: any, config?: RequestConfig): Promise<T> {
    return this.makeRequest<T>(url, {
      ...config,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(url: string, config?: RequestConfig): Promise<T> {
    return this.makeRequest<T>(url, { ...config, method: 'DELETE' });
  }
}

// Create and export the HTTP client instance
export const httpClient = new FrancachelaHttpClient(API_CONFIG.BASE_URL);

// Export the class for testing purposes
export { FrancachelaHttpClient };

// Utility function to handle API errors consistently
export const handleApiError = (error: any): never => {
  console.error('API Error:', error);
  
  if (error.message) {
    throw new Error(error.message);
  }
  
  if (typeof error === 'string') {
    throw new Error(error);
  }
  
  throw new Error('Error de conexión con el servidor');
};

// Utility function to simulate network delay in development
export const simulateDelay = (ms: number = API_CONFIG.MOCK_DELAY): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};
