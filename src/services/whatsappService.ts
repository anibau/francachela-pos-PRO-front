import { API_ENDPOINTS } from "@/config/api";
import { httpClient } from "./httpClient";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const whatsappService = {
  // Enviar mensaje de bienvenida
  async sendWelcomeMessage(idCliente: number): Promise<any> {
    try {
      return await httpClient.post(
        API_ENDPOINTS.WHATSAPP.SEND_WELCOME(idCliente),
        {},
      );
    } catch {
      throw new Error('Error al enviar mensaje de bienvenida');
    }
  },

  // Obtener estado del servicio WhatsApp
  async getStatus(): Promise<any> {
    try {
      return await httpClient.get(API_ENDPOINTS.WHATSAPP.STATUS);
    } catch {
      throw new Error('Error al obtener estado de WhatsApp');
    }
  },

  // Obtener QR de conexión
  async getQR(): Promise<any> {
    try {
      return await httpClient.get(API_ENDPOINTS.WHATSAPP.QR);
    } catch {
      throw new Error('Error al obtener código QR');
    }
  },

  // Reconectar WhatsApp
  async reconnect(): Promise<any> {
    try {
      return await httpClient.post(API_ENDPOINTS.WHATSAPP.RECONNECT);
    } catch {
      throw new Error('Error al reconectar WhatsApp');
    }
  },

  // Cerrar sesión de WhatsApp
  async logout(): Promise<any> {
    try {
      return await httpClient.delete(API_ENDPOINTS.WHATSAPP.LOGOUT);
    } catch {
      throw new Error('Error al cerrar sesión de WhatsApp');
    }
  },

  async sendVentaNotification(payload: {
    phone: string;
    total: number;
    puntosGanados: number;
    ventaId: string;
  }): Promise<void> {
    try {
      await httpClient.post(API_ENDPOINTS.WHATSAPP.SEND_VENTA, payload);
    } catch (error) {
      console.warn('WhatsApp post-venta no enviado:', error);
    }
  },

  async sendBirthdayMessages(): Promise<void> {
    await httpClient.post(API_ENDPOINTS.WHATSAPP.BIRTHDAY, {});
  },
};
