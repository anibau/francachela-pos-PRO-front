const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const whatsappService = {
  // Enviar mensaje de bienvenida al crear cliente (Requerimiento 7a)
  async sendWelcomeMessage(idCliente: number): Promise<any> {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      throw new Error('No hay sesión activa');
    }

    const response = await fetch(`${API_BASE_URL}/whatsapp/send-welcome/${idCliente}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Error al enviar mensaje de bienvenida');
    }

    return response.json();
  },

  // Obtener estado del servicio WhatsApp
  async getStatus(): Promise<any> {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      throw new Error('No hay sesión activa');
    }

    const response = await fetch(`${API_BASE_URL}/whatsapp/status`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Error al obtener estado de WhatsApp');
    }

    return response.json();
  },

  // Obtener código QR para conexión
  async getQR(): Promise<any> {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      throw new Error('No hay sesión activa');
    }

    const response = await fetch(`${API_BASE_URL}/whatsapp/qr`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Error al obtener código QR');
    }

    return response.json();
  },

  // Reconectar WhatsApp manualmente
  async reconnect(): Promise<any> {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      throw new Error('No hay sesión activa');
    }

    const response = await fetch(`${API_BASE_URL}/whatsapp/reconnect`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Error al reconectar WhatsApp');
    }

    return response.json();
  },

  // Cerrar sesión de WhatsApp
  async logout(): Promise<any> {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      throw new Error('No hay sesión activa');
    }

    const response = await fetch(`${API_BASE_URL}/whatsapp/logout`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Error al cerrar sesión de WhatsApp');
    }

    return response.json();
  },
};
