import { API_CONFIG } from '@/config/api';

/**
 * Descarga autenticada de archivos binarios (Excel, etc.)
 */
export async function downloadAuthenticatedBlob(
  path: string,
  filename: string,
): Promise<void> {
  const token = localStorage.getItem('auth_token');
  if (!token) {
    throw new Error('No hay sesión activa');
  }

  const base = API_CONFIG.BASE_URL.replace(/\/$/, '');
  const url = path.startsWith('http') ? path : `${base}${path}`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    let message = `Error ${response.status} al descargar archivo`;
    try {
      const data = await response.json();
      if (data?.error?.message) {
        message = data.error.message;
      } else if (data?.message) {
        message = data.message;
      }
    } catch {
      // respuesta no JSON
    }
    throw new Error(message);
  }

  const blob = await response.blob();
  const objectUrl = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = objectUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(objectUrl);
}
