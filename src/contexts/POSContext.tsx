import React, { createContext, useContext, useState, useCallback } from "react";
import type { 
  PaymentMethod, 
  SaleItem, 
  Product, 
  Client, 
  SalePreviewRequest, 
  SalePreviewResponse,
  CashRegisterState 
} from "@/types";
import { salesService } from "@/services/salesService";
import { whatsappService } from "@/services/whatsappService";
import { clientsService } from "@/services/clientsService";
import { cashRegisterService } from "@/services/cashRegisterService";
import { toast } from "sonner";
import { roundMoney } from "@/utils/moneyUtils";
import { buildCreatePayloadFromPreview } from "@/features/pos/utils/buildCreatePayload";
import {
  canAddOneUnit,
  canIncreaseQty,
  getAvailableStock,
} from "@/features/pos/utils/stockUtils";
import type { PointsEvaluationResponse } from "@/services/pointsService";

// Interfaz extendida para items en el ticket del POS
interface POSItem extends SaleItem {
  productId: number;
  puntosValor: number;
  isWholesale?: boolean;
}

export interface Ticket {
  id: string;
  items: POSItem[];
  clientId?: number;
  clientName?: string;
  clientPuntos?: number;
  notes?: string;
  discount: number;
  recargoExtra: number;
  puntosAUsar?: number;
  pointsEvaluation?: PointsEvaluationResponse | null;
  salePreview?: SalePreviewResponse | null;
}

interface POSContextType {
  tickets: Ticket[];
  activeTicketId: string;
  // Estados para flujo profesional
  cashRegisterState: CashRegisterState | null;
  salePreview: SalePreviewResponse | null;
  isLoadingPreview: boolean;
  isLoadingCashState: boolean;
  
  // Métodos existentes
  createTicket: () => void;
  switchTicket: (id: string) => void;
  closeTicket: (id: string) => void;
  addItem: (product: Product, isWholesale?: boolean) => void;
  updateItemQuantity: (itemIndex: number, delta: number, product?: Product) => void;
  removeItem: (itemIndex: number) => void;
  setTicketClient: (clientId?: number, clientName?: string, clientPuntos?: number) => void;
  setTicketNotes: (notes: string) => void;
  applyDiscount: (discount: number) => void;
  applyRecargoExtra: (recargoExtra: number) => void;
  getActiveTicket: () => Ticket | undefined;
  updateActiveTicketPoints: (
    update: Partial<Pick<Ticket, "puntosAUsar" | "pointsEvaluation">>,
  ) => void;
  invalidateActiveTicketPreview: () => void;
  
  checkCashRegisterState: () => Promise<void>;
  previewSale: (puntosAUsar?: number, montoRecibido?: number, descuento?: number, recargoExtra?: number) => Promise<SalePreviewResponse | null>;
  clearPreview: () => void;
  
  completeSale: (
    salePreview: SalePreviewResponse,
    paymentMethod: PaymentMethod,
    cashierName: string,
    puntosUsados?: number,
    metodosPageo?: Array<{
      monto: number;
      metodoPago: PaymentMethod;
      referencia?: string;
    }>,
    products?: Product[],
    refetchProducts?: () => void,
    refetchClients?: () => void,
    clients?: Client[],
    efectivoEntregado?: number,
  ) => Promise<void>;
}

const POSContext = createContext<POSContextType | undefined>(undefined);

export function POSProvider({ children }: { children: React.ReactNode }) {
  const [tickets, setTickets] = useState<Ticket[]>([
    { id: "1", items: [], discount: 0, recargoExtra: 0 },
  ]);
  const [activeTicketId, setActiveTicketId] = useState("1");
  const [ticketCounter, setTicketCounter] = useState(1); // Contador único para evitar duplicaciones
  
  // Estados para flujo profesional
  const [cashRegisterState, setCashRegisterState] = useState<CashRegisterState | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [isLoadingCashState, setIsLoadingCashState] = useState(false);

  const getActiveTicket = useCallback(() => {
    return tickets.find((t) => t.id === activeTicketId);
  }, [tickets, activeTicketId]);

  const activeSalePreview = getActiveTicket()?.salePreview ?? null;

  const invalidateActiveTicketPreview = useCallback(() => {
    setTickets((prev) =>
      prev.map((t) =>
        t.id === activeTicketId ? { ...t, salePreview: null } : t,
      ),
    );
  }, [activeTicketId]);

  const updateActiveTicketPoints = useCallback(
    (update: Partial<Pick<Ticket, "puntosAUsar" | "pointsEvaluation">>) => {
      setTickets((prev) =>
        prev.map((t) =>
          t.id === activeTicketId ? { ...t, ...update, salePreview: null } : t,
        ),
      );
    },
    [activeTicketId],
  );

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

  const addItem = useCallback(
    (product: Product, isWholesale: boolean = false) => {
      setTickets((prev) => {
        const ticket = prev.find((t) => t.id === activeTicketId);
        if (!ticket) return prev;

        if (!canAddOneUnit(product, ticket.items, product.id)) {
          const avail = getAvailableStock(product, ticket.items, product.id);
          toast.error("Stock insuficiente", {
            description:
              avail <= 0
                ? `"${product.productoDescripcion}" sin stock disponible.`
                : `Solo quedan ${product.cantidadActual} u. de "${product.productoDescripcion}" (${avail} por agregar).`,
          });
          return prev;
        }

        return prev.map((t) => {
          if (t.id !== activeTicketId) return t;

          const precio = roundMoney(isWholesale ? product.precioMayoreo : product.precio);
          const existingItemIndex = t.items.findIndex(
            (item) => item.productId === product.id && item.isWholesale === isWholesale,
          );

          let items: POSItem[];
          if (existingItemIndex !== -1) {
            const existingItem = t.items[existingItemIndex];
            const nuevaCantidad = existingItem.cantidad + 1;
            items = [...t.items];
            items[existingItemIndex] = {
              ...existingItem,
              cantidad: nuevaCantidad,
              subtotal: roundMoney(nuevaCantidad * existingItem.precio),
            };
          } else {
            const newItem: POSItem = {
              id: product.id,
              productId: product.id,
              descripcion: product.productoDescripcion,
              cantidad: 1,
              precio,
              subtotal: precio,
              puntosValor: product.valorPuntos || 0,
              isWholesale,
            };
            items = [...t.items, newItem];
          }

          return { ...t, items, salePreview: null, pointsEvaluation: null };
        });
      });
    },
    [activeTicketId],
  );

  const updateItemQuantity = useCallback(
    (itemIndex: number, delta: number, product?: Product) => {
      setTickets((prev) =>
        prev.map((ticket) => {
          if (ticket.id !== activeTicketId) return ticket;

          const item = ticket.items[itemIndex];
          if (!item) return ticket;
          const nuevaCantidad = Math.max(1, item.cantidad + delta);

          if (delta > 0 && product?.usaInventario) {
            if (!canIncreaseQty(product, ticket.items, item.productId)) {
              const avail = getAvailableStock(product, ticket.items, item.productId);
              toast.error("Stock insuficiente", {
                description: `Solo quedan ${product.cantidadActual} u. de "${product.productoDescripcion}" (${avail} por agregar).`,
              });
              return ticket;
            }
          }

          const updatedItems = [...ticket.items];
          updatedItems[itemIndex] = {
            ...item,
            cantidad: nuevaCantidad,
            subtotal: roundMoney(item.precio * nuevaCantidad),
          };

          return { ...ticket, items: updatedItems, salePreview: null, pointsEvaluation: null };
        }),
      );
    },
    [activeTicketId],
  );

  const removeItem = useCallback(
    (itemIndex: number) => {
      setTickets((prev) =>
        prev.map((ticket) => {
          if (ticket.id !== activeTicketId) return ticket;

          return {
            ...ticket,
            items: ticket.items.filter((_, index) => index !== itemIndex),
            salePreview: null,
            pointsEvaluation: null,
          };
        })
      );
    },
    [activeTicketId]
  );

  const setTicketClient = useCallback(
    (clientId?: number, clientName?: string, clientPuntos?: number) => {
      setTickets((prev) =>
        prev.map((ticket) =>
          ticket.id === activeTicketId
            ? {
                ...ticket,
                clientId,
                clientName,
                clientPuntos,
                puntosAUsar: 0,
                pointsEvaluation: null,
                salePreview: null,
              }
            : ticket,
        ),
      );
    },
    [activeTicketId],
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

  // Método para verificar estado de caja
  const checkCashRegisterState = useCallback(async () => {
    setIsLoadingCashState(true);
    try {
      const state = await cashRegisterService.getEstado();
      setCashRegisterState(state);
    } catch (error) {
      console.error('Error checking cash register state:', error);
      toast.error('Error al verificar estado de caja');
    } finally {
      setIsLoadingCashState(false);
    }
  }, []);

  // Método para previsualizar venta - RETORNA el preview para usar inmediatamente
  const previewSale = useCallback(async (puntosAUsar?: number, montoRecibido?: number, descuento?: number, recargoExtra?: number): Promise<SalePreviewResponse | null> => {
    const ticket = getActiveTicket();
    
    if (!ticket || ticket.items.length === 0) {
      toast.error("No hay productos en el ticket");
      return null;
    }

    setIsLoadingPreview(true);
    try {
      const previewRequest: SalePreviewRequest = {
        items: ticket.items.map(item => ({
          productoId: item.productId,
          cantidad: item.cantidad,
          precioUnitario: item.precio,
        })),
        clienteId: ticket.clientId,
        puntosAUsar: puntosAUsar,
        descuento: descuento,
        recargoExtra: recargoExtra,
        montoRecibido: montoRecibido
      };

      const preview = await salesService.preview(previewRequest);
      setTickets((prev) =>
        prev.map((t) =>
          t.id === activeTicketId ? { ...t, salePreview: preview } : t,
        ),
      );
      return preview;
    } catch (error) {
      console.error('Error previewing sale:', error);
      toast.error('Error al previsualizar venta');
      return null;
    } finally {
      setIsLoadingPreview(false);
    }
  }, [getActiveTicket, activeTicketId]);

  const clearPreview = useCallback(() => {
    setTickets((prev) =>
      prev.map((t) =>
        t.id === activeTicketId ? { ...t, salePreview: null } : t,
      ),
    );
  }, [activeTicketId]);

  const completeSale = useCallback(
    async (
      salePreview: SalePreviewResponse,
      paymentMethod: PaymentMethod,
      _cashierName: string,
      puntosUsados: number = 0,
      metodosPageo?: Array<{
        monto: number;
        metodoPago: PaymentMethod;
        referencia?: string;
      }>,
      products?: Product[],
      refetchProducts?: () => void,
      refetchClients?: () => void,
      clients?: Client[],
      efectivoEntregado?: number,
    ) => {
      const ticket = getActiveTicket();

      if (!ticket || ticket.items.length === 0) {
        toast.error("No hay productos en el ticket");
        return;
      }

      try {
        const saleData = buildCreatePayloadFromPreview({
          ticket: {
            clientId: ticket.clientId,
            notes: ticket.notes,
            discount: ticket.discount,
            recargoExtra: ticket.recargoExtra,
            items: ticket.items.map((item) => ({
              productId: item.productId,
              cantidad: item.cantidad,
              precio: item.precio,
              isWholesale: item.isWholesale,
            })),
          },
          salePreview,
          paymentMethod,
          puntosUsados,
          metodosPageo,
          products,
          efectivoEntregado,
        });

        console.log("[POSContext] Payload de venta (desde preview):", saleData);

        const sale = await salesService.create(saleData);

        console.log("[POSContext] Venta creada:", sale);

        if (ticket.clientId && clients?.length) {
          const client = clients.find((c) => c.id === ticket.clientId);
          const rawPhone = client?.telefono?.replace(/\D/g, '');
          if (rawPhone) {
            const phone = rawPhone.startsWith('51') ? rawPhone : `51${rawPhone}`;
            await whatsappService.sendVentaNotification({
              phone,
              total: salePreview.totalCobrado,
              puntosGanados: salePreview.puntosOtorgados,
              ventaId: sale.ticketId || String(sale.id),
            });
          }
        }

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
        if ((error )?.name === 'AbortError') {
          toast.error("La venta está siendo procesada. Verifique en ventas antes de reintentar.");
          return;
        }
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
        // Estados para flujo profesional
        cashRegisterState,
        salePreview: activeSalePreview,
        isLoadingPreview,
        isLoadingCashState,
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
        updateActiveTicketPoints,
        invalidateActiveTicketPreview,
        checkCashRegisterState,
        previewSale,
        clearPreview,
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
