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
};

