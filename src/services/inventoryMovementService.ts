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
    const token = localStorage.getItem('auth_token');
    if (!token) {
      throw new Error('No hay sesión activa');
    }

    const response = await fetch(`${API_BASE_URL}/movimiento-inventario/entrada`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(movimiento),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Error al registrar entrada de inventario');
    }

    return response.json();
  },

  // Registrar ajuste de inventario
  async registrarAjuste(movimiento: MovimientoAjuste): Promise<any> {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      throw new Error('No hay sesión activa');
    }

    const response = await fetch(`${API_BASE_URL}/movimiento-inventario/ajuste`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(movimiento),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Error al registrar ajuste de inventario');
    }

    return response.json();
  },

  // Registrar venta/salida de inventario
  async registrarVenta(movimiento: MovimientoVenta): Promise<any> {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      throw new Error('No hay sesión activa');
    }

    const response = await fetch(`${API_BASE_URL}/movimiento-inventario/venta`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(movimiento),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Error al registrar venta de inventario');
    }

    return response.json();
  },
};
