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
import { roundMoney, roundToNearestDime } from "@/utils/moneyUtils";
import { calculateTicketTotal } from "@/utils/calculateTicketTotal";
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
  setTicketClient: (clientId?: number, clientName?: string) => void;
  setTicketNotes: (notes: string) => void;
  applyDiscount: (discount: number) => void;
  applyRecargoExtra: (recargoExtra: number) => void;
  getActiveTicket: () => Ticket | undefined;
  // getTicketTotal: (ticketId?: string) => number;
  
  // Nuevos métodos para flujo profesional
  checkCashRegisterState: () => Promise<void>;
  previewSale: (puntosAUsar?: number, montoRecibido?: number, descuento?: number, recargoExtra?: number) => Promise<SalePreviewResponse | null>;
  clearPreview: () => void;
  
  // Método de venta refactorizado
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
  
  // Estados para flujo profesional
  const [cashRegisterState, setCashRegisterState] = useState<CashRegisterState | null>(null);
  const [salePreview, setSalePreview] = useState<SalePreviewResponse | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [isLoadingCashState, setIsLoadingCashState] = useState(false);

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
      // TAREA 5: Validaciones de stock antes de agregar
      if (product.usaInventario) {
        if (product.cantidadActual <= 0) {
          toast.error("Stock insuficiente", {
            description: `El producto "${product.productoDescripcion}" no tiene stock disponible.`
          });
          return;
        }
      }

      setTickets((prev) =>
        prev.map((ticket) => {
          if (ticket.id !== activeTicketId) return ticket;

          // Asegurar que el precio está redondeado a 2 decimales
          const precio = roundMoney(isWholesale ? product.precioMayoreo : product.precio);

          // Buscar si existe el item con mismo producto y tipo de precio
          const existingItemIndex = ticket.items.findIndex(
            (item) =>
              item.productId === product.id && item.isWholesale === isWholesale
          );

          if (existingItemIndex !== -1) {
            // TAREA 5: Validar stock antes de aumentar cantidad
            const existingItem = ticket.items[existingItemIndex];
            const nuevaCantidad = existingItem.cantidad + 1;
            
            if (product.usaInventario && nuevaCantidad > product.cantidadActual) {
              toast.error("Stock insuficiente", {
                description: `Solo hay ${product.cantidadActual} unidades disponibles de "${product.productoDescripcion}".`
              });
              return ticket; // No modificar el ticket
            }

            // Actualizar cantidad
            const updatedItems = [...ticket.items];
            updatedItems[existingItemIndex] = {
              ...existingItem,
              cantidad: nuevaCantidad,
              subtotal: roundMoney(nuevaCantidad * existingItem.precio),
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
    (itemIndex: number, delta: number, product?: Product) => {
      setTickets((prev) =>
        prev.map((ticket) => {
          if (ticket.id !== activeTicketId) return ticket;

          const updatedItems = [...ticket.items];
          const item = updatedItems[itemIndex];
          const nuevaCantidad = Math.max(1, item.cantidad + delta);

          // TAREA 5: Validar stock al aumentar cantidad
          if (delta > 0 && product && product.usaInventario) {
            if (nuevaCantidad > product.cantidadActual) {
              toast.error("Stock insuficiente", {
                description: `Solo hay ${product.cantidadActual} unidades disponibles de "${product.productoDescripcion}".`
              });
              return ticket; // No modificar el ticket
            }
          }

          updatedItems[itemIndex] = {
            ...item,
            cantidad: nuevaCantidad,
            subtotal: roundMoney(item.precio * nuevaCantidad),
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
          cantidad: item.cantidad
        })),
        clienteId: ticket.clientId,
        puntosAUsar: puntosAUsar,
        descuento: descuento,
        recargoExtra: recargoExtra,
        montoRecibido: montoRecibido
      };

      const preview = await salesService.preview(previewRequest);
      setSalePreview(preview);
      return preview; // ✅ RETORNAR la respuesta
    } catch (error) {
      console.error('Error previewing sale:', error);
      toast.error('Error al previsualizar venta');
      return null;
    } finally {
      setIsLoadingPreview(false);
    }
  }, [getActiveTicket]);

  // Método para limpiar preview
  const clearPreview = useCallback(() => {
    setSalePreview(null);
  }, []);

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
      refetchClients?: () => void,
      puntosUsados: number = 0,
      clients?: Client[],
      promoDescuento: number = 0,
    ) => {
      const ticket = getActiveTicket();

      if (!ticket || ticket.items.length === 0) {
        toast.error("No hay productos en el ticket");
        return;
      }

      try {
        // 🎯 USAR EL MOTOR ÚNICO DE CÁLCULO
        const puntosDescuento = puntosUsados > 0 ? (puntosUsados * 0.1) : 0;
        const descuentoTotal = roundMoney(ticket.discount + promoDescuento);
        const totalRedondeado = calculateTicketTotal(
          ticket.items,
          descuentoTotal,
          ticket.recargoExtra,
          puntosDescuento
        );

        // Calcular puntos (1 punto por cada sol gastado)
        const puntosOtorgados = Math.floor(totalRedondeado);

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
              descuentoPorItem = roundMoney(producto.precio - producto.precioMayoreo);
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

        // Construir metodosPageo - siempre como array
        let metodosPageoArray: Array<{
          monto: number;
          metodoPago: PaymentMethod;
          referencia?: string;
        }>;

        if (metodosPageo && metodosPageo.length > 0) {
          // Redondear cada monto usando roundMoney y sincronizar con total
          metodosPageoArray = metodosPageo.map((metodo) => ({
            monto: metodo.monto,
            metodoPago: metodo.metodoPago,
            ...(metodo.referencia && { referencia: metodo.referencia }),
          }));
        } else {
          // Método de pago único: usar el total redondeado
          metodosPageoArray = [
            {
              monto: totalRedondeado,
              metodoPago: paymentMethod,
            },
          ];
        }

        const recargoExtraRedondeado = roundToNearestDime(ticket.recargoExtra || 0);

        // Calcular el monto total pagado (suma de todos los métodos de pago)
        // Debe coincidir exactamente con totalRedondeado
        const totalPagado = roundToNearestDime(
          metodosPageoArray.reduce((sum, metodo) => sum + metodo.monto, 0)
        );

        // Si hay montoRecibido, usarlo; si no, usar el total pagado
        const montoRecibidoFinal =
          montoRecibido && montoRecibido > 0 
            ? roundToNearestDime(montoRecibido)
            : totalPagado;

        const saleData = {
          clienteId: ticket.clientId || null,
          listaProductos: listaProductosConDescuento,
          // Solo incluir descuento si es descuento manual Y no hay mayoreo
          // Para evitar duplicación (descuento manual + descuento en precioUnitario)
          ...(descuentoTotal > 0 &&
            !hasMayoreo && { descuento: descuentoTotal }),
          recargoExtra: recargoExtraRedondeado || 0,
          metodosPageo: metodosPageoArray,
          comentario: ticket.notes || "",
          tipoCompra: "LOCAL",
          montoRecibido: montoRecibidoFinal,
          puntosUsados: puntosUsados,  // ✅ Usar el valor pasado como parámetro
          // El total debe coincidir exactamente con la suma de metodosPageo
          //total: totalRedondeado,
        };

        console.log("[POSContext] Payload de venta:", saleData);

        const sale = await salesService.create(saleData);

        console.log("[POSContext] Venta creada:", sale);

        if (ticket.clientId && clients?.length) {
          const client = clients.find((c) => c.id === ticket.clientId);
          const rawPhone = client?.telefono?.replace(/\D/g, '');
          if (rawPhone) {
            const phone = rawPhone.startsWith('51') ? rawPhone : `51${rawPhone}`;
            await whatsappService.sendVentaNotification({
              phone,
              total: totalRedondeado,
              puntosGanados: puntosOtorgados,
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
        if ((error as any)?.name === 'AbortError') {
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
        salePreview,
        isLoadingPreview,
        isLoadingCashState,
        // Métodos existentes
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
        // Nuevos métodos para flujo profesional
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
