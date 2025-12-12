import { httpClient } from '@/lib/httpClient';
import { API_ENDPOINTS } from '@/config/api';

export const whatsappService = {
  /**
   * Enviar información del cliente por WhatsApp
   */
  sendClientInfo: async (dni: string): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await httpClient.post<{ success: boolean; message: string }>(
        API_ENDPOINTS.CLIENTS.SEND_WHATSAPP_INFO(dni),
        {}
      );
      
      return response;
    } catch (error) {
      console.error('Error sending WhatsApp message:', error);
      throw new Error('Error al enviar mensaje de WhatsApp');
    }
  },

  /**
   * Verificar estado del servicio de WhatsApp
   */
  getStatus: async (): Promise<{ connected: boolean; phone?: string }> => {
    try {
      const response = await httpClient.get<{ connected: boolean; phone?: string }>(
        '/whatsapp/status'
      );
      
      return response;
    } catch (error) {
      console.error('Error getting WhatsApp status:', error);
      return { connected: false };
    }
  },

  /**
   * Enviar mensaje personalizado por WhatsApp
   */
  sendMessage: async (phone: string, message: string, ventaId?: number): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await httpClient.post<{ success: boolean; message: string }>(
        '/whatsapp/send',
        {
          phone,
          message,
          ventaId
        }
      );
      
      return response;
    } catch (error) {
      console.error('Error sending WhatsApp message:', error);
      throw new Error('Error al enviar mensaje de WhatsApp');
    }
  }
};
