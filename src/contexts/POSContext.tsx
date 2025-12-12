import React, { createContext, useContext, useState, useCallback } from 'react';
import type { PaymentMethod, SaleItem, Product, Client } from '@/types';
import { salesService } from '@/services/salesService';
import { clientsService } from '@/services/clientsService';
import { toast } from 'sonner';

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
  getActiveTicket: () => Ticket | undefined;
  getTicketTotal: (ticketId?: string) => number;
  completeSale: (paymentMethod: PaymentMethod, cashierName: string, montoRecibido?: number) => Promise<void>;
}

const POSContext = createContext<POSContextType | undefined>(undefined);

export function POSProvider({ children }: { children: React.ReactNode }) {
  const [tickets, setTickets] = useState<Ticket[]>([
    { id: '1', items: [], discount: 0 },
  ]);
  const [activeTicketId, setActiveTicketId] = useState('1');
  const [ticketCounter, setTicketCounter] = useState(1); // Contador único para evitar duplicaciones

  const createTicket = useCallback(() => {
    const newId = String(ticketCounter + 1);
    setTicketCounter(prev => prev + 1);
    setTickets(prev => [...prev, { id: newId, items: [], discount: 0 }]);
    setActiveTicketId(newId);
  }, [ticketCounter]);

  const switchTicket = useCallback((id: string) => {
    setActiveTicketId(id);
  }, []);

  const closeTicket = useCallback((id: string) => {
    setTickets(prev => prev.filter(t => t.id !== id));
    if (activeTicketId === id) {
      setActiveTicketId(tickets[0]?.id || '1');
    }
  }, [activeTicketId, tickets]);

  const getActiveTicket = useCallback(() => {
    return tickets.find(t => t.id === activeTicketId);
  }, [tickets, activeTicketId]);

  const addItem = useCallback(
    (product: Product, isWholesale: boolean = false) => {
      setTickets(prev =>
        prev.map(ticket => {
          if (ticket.id !== activeTicketId) return ticket;
          
          const precio = isWholesale ? product.precioMayoreo : product.precio;
          
          // Buscar si existe el item con mismo producto y tipo de precio
          const existingItemIndex = ticket.items.findIndex(item => 
            item.productId === product.id && 
            item.isWholesale === isWholesale
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
      setTickets(prev =>
        prev.map(ticket => {
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
      setTickets(prev =>
        prev.map(ticket => {
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
      setTickets(prev =>
        prev.map(ticket => 
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
      setTickets(prev =>
        prev.map(ticket =>
          ticket.id === activeTicketId
            ? { ...ticket, notes }
            : ticket
        )
      );
    },
    [activeTicketId]
  );

  const applyDiscount = useCallback(
    (discount: number) => {
      setTickets(prev =>
        prev.map(ticket =>
          ticket.id === activeTicketId
            ? { ...ticket, discount: Math.max(0, discount) }
            : ticket
        )
      );
    },
    [activeTicketId]
  );

  const getTicketTotal = useCallback(
    (ticketId?: string) => {
      const ticket = tickets.find(t => t.id === (ticketId || activeTicketId));
      if (!ticket) return 0;
      
      const subtotal = ticket.items.reduce((sum, item) => sum + item.subtotal, 0);
      return Math.max(0, subtotal - ticket.discount);
    },
    [tickets, activeTicketId]
  );

  const completeSale = useCallback(
    async (paymentMethod: PaymentMethod, cashierName: string, montoRecibido: number = 0) => {
      const ticket = getActiveTicket();
      
      if (!ticket || ticket.items.length === 0) {
        toast.error('No hay productos en el ticket');
        return;
      }
      
      try {
        const subtotal = ticket.items.reduce((sum, item) => sum + item.subtotal, 0);
        const total = Math.max(0, subtotal - ticket.discount);
        
        // Calcular puntos (1 punto por cada sol gastado)
        const puntosOtorgados = Math.floor(total);
        
        // Log para debugging
        console.log('[POSContext] Ticket actual:', {
          id: ticket.id,
          clientId: ticket.clientId,
          clientName: ticket.clientName,
          itemsCount: ticket.items.length,
        });
        
        // Crear venta en el backend
        const saleData = {
          // Siempre incluir clienteId si existe
          clienteId: ticket.clientId || null,
          listaProductos: ticket.items.map(item => ({
            productoId: item.productId,
            cantidad: item.cantidad,
          })),
          descuento: ticket.discount || 0,
          metodoPago: paymentMethod,
          comentario: ticket.notes || '',
          tipoCompra: 'LOCAL',
          montoRecibido: montoRecibido || 0,
          puntosUsados: 0,
        };
        
        console.log('[POSContext] Payload de venta:', saleData);
        
        const sale = await salesService.create(saleData);
        
        console.log('[POSContext] Venta creada:', sale);
        
        // Si hay cliente, actualizar sus puntos
        if (ticket.clientId && puntosOtorgados > 0) {
          try {
            const cliente = await clientsService.getById(ticket.clientId);
            await clientsService.update(ticket.clientId, {
              puntosAcumulados: cliente.puntosAcumulados + puntosOtorgados
            });
          } catch (error) {
            console.error('Error updating client points:', error);
          }
        }
        
        toast.success('Venta completada exitosamente');
        
        // Limpiar ticket actual
        closeTicket(activeTicketId);
        
        // Crear nuevo ticket
        if (tickets.length === 1) {
          createTicket();
        }
      } catch (error) {
        console.error('Error completing sale:', error);
        toast.error('Error al completar la venta');
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
    throw new Error('usePOS must be used within a POSProvider');
  }
  return context;
}
