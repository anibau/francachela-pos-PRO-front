/* eslint-disable @typescript-eslint/no-explicit-any */
import { API_ENDPOINTS } from "@/config/api";
import { httpClient } from "./httpClient";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export interface MovimientoEntrada {
  codigoBarra: string;
  cantidad: number;
  costo: number;
  precioVenta: number;
  cajero: string;
  proveedor: string;
}

export interface MovimientoAjuste {
  codigoBarra: string;
  nuevaCantidad: number;
  costo: number;
  precioVenta: number;
  cajero: string;
}

export interface MovimientoVenta {
  codigoBarra: string;
  cantidad: number;
  precioVenta: number;
  cajero: string;
}

export const inventoryMovementService = {
  // Registrar entrada de inventario
  async registrarEntrada(movimiento: MovimientoEntrada): Promise<any> {
    try {
      const response = await httpClient.post<any>(
        API_ENDPOINTS.INVENTORY_MOVEMENTS.ENTRY,
        movimiento
      );
      return response;
    } catch (error: any) {
      console.error('Error registrar entrada inventario:', error);
      throw new Error(
        error?.response?.data?.message ||
        'Error al registrar entrada de inventario'
      );
    }
  },

  // Registrar ajuste de inventario
  async registrarAjuste(movimiento: MovimientoAjuste): Promise<any> {
    try {
      const response = await httpClient.post<any>(
        API_ENDPOINTS.INVENTORY_MOVEMENTS.ADJUSTMENT,
        movimiento
      );
      return response;
    } catch (error) {
      console.error('Error registrar ajuste inventario:', error);
      throw new Error(
        error?.response?.data?.message ||
        'Error al registrar ajuste de inventario'
      );
    }
  },

  // Registrar venta / salida de inventario
  async registrarVenta(movimiento: MovimientoVenta): Promise<any> {
    try {
      const response = await httpClient.post<any>(
        API_ENDPOINTS.INVENTORY_MOVEMENTS.SALE,
        movimiento
      );
      return response;
    } catch (error) {
      console.error('Error registrar venta inventario:', error);
      throw new Error(
        error?.response?.data?.message ||
        'Error al registrar venta de inventario'
      );
    }
  },
};
