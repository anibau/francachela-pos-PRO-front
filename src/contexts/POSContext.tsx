import React, { createContext, useContext, useState, useCallback } from "react";
import type { PaymentMethod, SaleItem, Product, Client } from "@/types";
import { salesService } from "@/services/salesService";
import { clientsService } from "@/services/clientsService";
import { roundMoney } from "@/utils/moneyUtils";
import { toast } from "sonner";

// Interfaz extendida para items en el ticket del POS
interface POSItem extends SaleItem {
  productId: number;
  puntosValor: number;
  isWholesale?: boolean;
}

interface Ticket {
  id: string;
  items: POSItem[];
  clientId?: number;
  clientName?: string;
  notes?: string;
  discount: number;
  recargoExtra: number;
}

interface POSContextType {
  tickets: Ticket[];
  activeTicketId: string;
  createTicket: () => void;
  switchTicket: (id: string) => void;
  closeTicket: (id: string) => void;
  addItem: (product: Product, isWholesale?: boolean) => void;
  updateItemQuantity: (itemIndex: number, delta: number) => void;
  removeItem: (itemIndex: number) => void;
  setTicketClient: (clientId?: number, clientName?: string) => void;
  setTicketNotes: (notes: string) => void;
  applyDiscount: (discount: number) => void;
  applyRecargoExtra: (recargoExtra: number) => void;
  getActiveTicket: () => Ticket | undefined;
  getTicketTotal: (ticketId?: string) => number;
  completeSale: (
    paymentMethod: PaymentMethod,
    cashierName: string,
    montoRecibido?: number,
    metodosPageo?: Array<{
      monto: number;
      metodoPago: PaymentMethod;
      referencia?: string;
    }>,
    products?: Product[],
    refetchProducts?: () => void,
    refetchClients?: () => void
  ) => Promise<void>;
}

const POSContext = createContext<POSContextType | undefined>(undefined);

export function POSProvider({ children }: { children: React.ReactNode }) {
  const [tickets, setTickets] = useState<Ticket[]>([
    { id: "1", items: [], discount: 0, recargoExtra: 0 },
  ]);
  const [activeTicketId, setActiveTicketId] = useState("1");
  const [ticketCounter, setTicketCounter] = useState(1); // Contador único para evitar duplicaciones

  const createTicket = useCallback(() => {
    const newId = String(ticketCounter + 1);
    setTicketCounter((prev) => prev + 1);
    setTickets((prev) => [
      ...prev,
      { id: newId, items: [], discount: 0, recargoExtra: 0 },
    ]);
    setActiveTicketId(newId);
  }, [ticketCounter]);

  const switchTicket = useCallback((id: string) => {
    setActiveTicketId(id);
  }, []);

  const closeTicket = useCallback(
    (id: string) => {
      setTickets((prev) => prev.filter((t) => t.id !== id));
      if (activeTicketId === id) {
        setActiveTicketId(tickets[0]?.id || "1");
      }
    },
    [activeTicketId, tickets]
  );

  const getActiveTicket = useCallback(() => {
    return tickets.find((t) => t.id === activeTicketId);
  }, [tickets, activeTicketId]);

  const addItem = useCallback(
    (product: Product, isWholesale: boolean = false) => {
      setTickets((prev) =>
        prev.map((ticket) => {
          if (ticket.id !== activeTicketId) return ticket;

          const precio = isWholesale ? product.precioMayoreo : product.precio;

          // Buscar si existe el item con mismo producto y tipo de precio
          const existingItemIndex = ticket.items.findIndex(
            (item) =>
              item.productId === product.id && item.isWholesale === isWholesale
          );

          if (existingItemIndex !== -1) {
            // Actualizar cantidad
            const updatedItems = [...ticket.items];
            const existingItem = updatedItems[existingItemIndex];
            const nuevaCantidad = existingItem.cantidad + 1;

            updatedItems[existingItemIndex] = {
              ...existingItem,
              cantidad: nuevaCantidad,
              subtotal: nuevaCantidad * existingItem.precio,
            };

            return {
              ...ticket,
              items: updatedItems,
            };
          }

          // Agregar nuevo item
          // Usar el valorPuntos del producto SOLO si es mayor a 0
          // Si es 0 o no existe, el badge no debería mostrarse
          const puntosValor = product.valorPuntos || 0;

          const newItem: POSItem = {
            id: product.id,
            productId: product.id,
            descripcion: product.productoDescripcion,
            cantidad: 1,
            precio,
            subtotal: precio,
            puntosValor,
            isWholesale,
          };

          return {
            ...ticket,
            items: [...ticket.items, newItem],
          };
        })
      );
    },
    [activeTicketId]
  );

  const updateItemQuantity = useCallback(
    (itemIndex: number, delta: number) => {
      setTickets((prev) =>
        prev.map((ticket) => {
          if (ticket.id !== activeTicketId) return ticket;

          const updatedItems = [...ticket.items];
          const item = updatedItems[itemIndex];
          const nuevaCantidad = Math.max(1, item.cantidad + delta);

          updatedItems[itemIndex] = {
            ...item,
            cantidad: nuevaCantidad,
            subtotal: item.precio * nuevaCantidad,
          };

          return {
            ...ticket,
            items: updatedItems,
          };
        })
      );
    },
    [activeTicketId]
  );

  const removeItem = useCallback(
    (itemIndex: number) => {
      setTickets((prev) =>
        prev.map((ticket) => {
          if (ticket.id !== activeTicketId) return ticket;

          return {
            ...ticket,
            items: ticket.items.filter((_, index) => index !== itemIndex),
          };
        })
      );
    },
    [activeTicketId]
  );

  const setTicketClient = useCallback(
    (clientId?: number, clientName?: string) => {
      setTickets((prev) =>
        prev.map((ticket) =>
          ticket.id === activeTicketId
            ? { ...ticket, clientId, clientName }
            : ticket
        )
      );
    },
    [activeTicketId]
  );

  const setTicketNotes = useCallback(
    (notes: string) => {
      setTickets((prev) =>
        prev.map((ticket) =>
          ticket.id === activeTicketId ? { ...ticket, notes } : ticket
        )
      );
    },
    [activeTicketId]
  );

  const applyDiscount = useCallback(
    (discount: number) => {
      setTickets((prev) =>
        prev.map((ticket) =>
          ticket.id === activeTicketId
            ? { ...ticket, discount: Math.max(0, discount) }
            : ticket
        )
      );
    },
    [activeTicketId]
  );

  const applyRecargoExtra = useCallback(
    (recargoExtra: number) => {
      setTickets((prev) =>
        prev.map((ticket) =>
          ticket.id === activeTicketId
            ? { ...ticket, recargoExtra: Math.max(0, recargoExtra) }
            : ticket
        )
      );
    },
    [activeTicketId]
  );

  const getTicketTotal = useCallback(
    (ticketId?: string) => {
      const ticket = tickets.find((t) => t.id === (ticketId || activeTicketId));
      if (!ticket) return 0;

      const subtotal = ticket.items.reduce(
        (sum, item) => sum + item.subtotal,
        0
      );
      const rawTotal = Math.max(0, subtotal - ticket.discount + ticket.recargoExtra);
      // Redondear a decimales .X0 (4.56 → 4.60)
      const roundedTotal = Math.ceil(rawTotal * 10) / 10;
      return roundMoney(roundedTotal);
    },
    [tickets, activeTicketId]
  );

  const completeSale = useCallback(
    async (
      paymentMethod: PaymentMethod,
      cashierName: string,
      montoRecibido: number = 0,
      metodosPageo?: Array<{
        monto: number;
        metodoPago: PaymentMethod;
        referencia?: string;
      }>,
      products?: Product[],
      refetchProducts?: () => void,
      refetchClients?: () => void
    ) => {
      const ticket = getActiveTicket();

      if (!ticket || ticket.items.length === 0) {
        toast.error("No hay productos en el ticket");
        return;
      }

      try {
        const subtotal = ticket.items.reduce(
          (sum, item) => sum + item.subtotal,
          0
        );
        const total = Math.max(
          0,
          subtotal - ticket.discount + ticket.recargoExtra
        );

        // Calcular puntos (1 punto por cada sol gastado)
        const puntosOtorgados = Math.floor(total);

        // Log para debugging
        console.log("[POSContext] Ticket actual:", {
          id: ticket.id,
          clientId: ticket.clientId,
          clientName: ticket.clientName,
          itemsCount: ticket.items.length,
        });

        // Calcular descuento por mayoreo
        let descuentoMayoreo = 0;
        const listaProductosConDescuento = ticket.items.map((item) => {
          let descuentoPorItem = 0;

          if (item.isWholesale && products) {
            // Buscar el producto original para obtener precio normal
            const producto = products.find((p) => p.id === item.productId);
            if (producto && producto.precio && producto.precioMayoreo) {
              // El descuento por mayoreo se calcula como: precio_normal - precio_mayoreo
              descuentoPorItem = producto.precio - producto.precioMayoreo;
            }
          }

          descuentoMayoreo += descuentoPorItem * item.cantidad;

          // Retornar solo los campos que el backend espera
          return {
            productoId: item.productId,
            cantidad: item.cantidad,
            precioUnitario: item.precio, // Precio que se está usando (normal o mayoreo)
          };
        });

        // Crear venta en el backend
        // NOTA: No incluir descuento cuando hay mayoreo porque el descuento ya está
        // reflejado en el precioUnitario de los productos (ej: 3.5 en lugar de 4.5)
        // Solo enviar descuento manual si no hay mayoreo
        const hasMayoreo = descuentoMayoreo > 0;

        const round1 = (value: unknown): number =>
          Number.isFinite(value) ? Math.round((value as number) * 10) / 10 : 0;

        // Construir metodosPageo - siempre como array
        const metodosPageoArray =
          metodosPageo && metodosPageo.length > 0
            ? metodosPageo.map((metodo) => ({
                monto: round1(metodo.monto),
                metodoPago: metodo.metodoPago,
                ...(metodo.referencia && { referencia: metodo.referencia }),
              }))
            : [
                {
                  monto: round1(total),
                  metodoPago: paymentMethod,
                },
              ];

        const recargoExtraRedondeado =
          Math.round((ticket.recargoExtra || 0) * 10) / 10;

        const saleData = {
          clienteId: ticket.clientId || null,
          listaProductos: listaProductosConDescuento,
          // Solo incluir descuento si es descuento manual Y no hay mayoreo
          // Para evitar duplicación (descuento manual + descuento en precioUnitario)
          ...(ticket.discount > 0 &&
            !hasMayoreo && { descuento: ticket.discount }),
          recargoExtra: recargoExtraRedondeado || 0,
          metodosPageo: metodosPageoArray,
          comentario: ticket.notes || "",
          tipoCompra: "LOCAL",
          montoRecibido: montoRecibido || 0,
          puntosUsados: 0,
        };

        console.log("[POSContext] Payload de venta:", saleData);

        const sale = await salesService.create(saleData);

        console.log("[POSContext] Venta creada:", sale);

        // NOTA: Los puntos del cliente se actualizan automáticamente en el backend
        // al crear la venta, por lo que no necesitamos hacer PATCH '/clientes/id' aquí

        toast.success("Venta completada exitosamente");

        // Refrescar datos después de venta exitosa
        try {
          if (refetchProducts) {
            refetchProducts();
          }
          if (refetchClients) {
            refetchClients();
          }
        } catch (refetchError) {
          console.warn(
            "Error al refrescar datos después de venta:",
            refetchError
          );
          // No fallar la venta si el refetch falla
        }

        // Limpiar ticket actual
        closeTicket(activeTicketId);

        // Crear nuevo ticket
        if (tickets.length === 1) {
          createTicket();
        }
      } catch (error) {
        console.error("Error completing sale:", error);
        toast.error("Error al completar la venta");
        throw error;
      }
    },
    [activeTicketId, tickets, getActiveTicket, closeTicket, createTicket]
  );

  return (
    <POSContext.Provider
      value={{
        tickets,
        activeTicketId,
        createTicket,
        switchTicket,
        closeTicket,
        addItem,
        updateItemQuantity,
        removeItem,
        setTicketClient,
        setTicketNotes,
        applyDiscount,
        applyRecargoExtra,
        getActiveTicket,
        getTicketTotal,
        completeSale,
      }}
    >
      {children}
    </POSContext.Provider>
  );
}

export function usePOS() {
  const context = useContext(POSContext);
  if (context === undefined) {
    throw new Error("usePOS must be used within a POSProvider");
  }
  return context;
}
