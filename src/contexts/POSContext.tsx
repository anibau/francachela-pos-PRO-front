import React, { createContext, useContext, useState, useCallback } from 'react';
import type { PaymentMethod, SaleItem } from '@/types';
import { salesAPI } from '@/services/api';
import { toast } from 'sonner';

interface Ticket {
  id: string;
  items: SaleItem[];
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
  addItem: (productId: number, productName: string, price: number, pointsValue?: number, isWholesale?: boolean) => void;
  updateItemQuantity: (itemIndex: number, delta: number) => void;
  removeItem: (itemIndex: number) => void;
  setTicketClient: (clientId?: number, clientName?: string) => void;
  setTicketNotes: (notes: string) => void;
  applyDiscount: (discount: number) => void;
  getActiveTicket: () => Ticket | undefined;
  getTicketTotal: (ticketId?: string) => number;
  completeSale: (paymentMethod: PaymentMethod, cashierName: string) => Promise<void>;
}

const POSContext = createContext<POSContextType | undefined>(undefined);

export function POSProvider({ children }: { children: React.ReactNode }) {
  const [tickets, setTickets] = useState<Ticket[]>([
    { id: '1', items: [], discount: 0 },
  ]);
  const [activeTicketId, setActiveTicketId] = useState('1');

  const createTicket = useCallback(() => {
    const newId = String(tickets.length + 1);
    setTickets(prev => [...prev, { id: newId, items: [], discount: 0 }]);
    setActiveTicketId(newId);
  }, [tickets.length]);

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
    (productId: number, productName: string, price: number, pointsValue: number = 0, isWholesale: boolean = false) => {
      setTickets(prev =>
        prev.map(ticket => {
          if (ticket.id !== activeTicketId) return ticket;
          
          // Buscar si existe el item exactamente igual (mismo producto y mismo tipo de precio)
          const existingItemIndex = ticket.items.findIndex(item => 
            item.productId === productId && 
            ((item as any).isWholesale === isWholesale)
          );
          
          if (existingItemIndex !== -1) {
            // Actualizar cantidad del item existente
            const updatedItems = [...ticket.items];
            const existingItem = updatedItems[existingItemIndex];
            updatedItems[existingItemIndex] = {
              ...existingItem,
              quantity: existingItem.quantity + 1,
              subtotal: (existingItem.quantity + 1) * existingItem.price,
            };
            
            return {
              ...ticket,
              items: updatedItems,
            };
          }
          
          // Agregar nuevo item
          return {
            ...ticket,
            items: [
              ...ticket.items,
              {
                productId,
                productName,
                quantity: 1,
                price,
                subtotal: price,
                pointsValue,
                isWholesale,
              } as any,
            ],
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
          
          if (!item) return ticket;
          
          const newQuantity = item.quantity + delta;
          
          if (newQuantity <= 0) {
            // Eliminar el item si la cantidad es 0 o menor
            updatedItems.splice(itemIndex, 1);
          } else {
            // Actualizar cantidad y subtotal
            updatedItems[itemIndex] = {
              ...item,
              quantity: newQuantity,
              subtotal: newQuantity * item.price,
            };
          }
          
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
          
          const updatedItems = [...ticket.items];
          updatedItems.splice(itemIndex, 1);
          
          return {
            ...ticket,
            items: updatedItems,
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
          ticket.id === activeTicketId ? { ...ticket, notes } : ticket
        )
      );
    },
    [activeTicketId]
  );

  const applyDiscount = useCallback(
    (discount: number) => {
      setTickets(prev =>
        prev.map(ticket =>
          ticket.id === activeTicketId ? { ...ticket, discount } : ticket
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
    async (paymentMethod: PaymentMethod, cashierName: string = 'Sistema') => {
      const ticket = getActiveTicket();
      if (!ticket || ticket.items.length === 0) return;

      const subtotal = ticket.items.reduce((sum, item) => sum + item.subtotal, 0);
      const total = getTicketTotal();
      const pointsEarned = ticket.items.reduce((sum, item) => sum + ((item.pointsValue || 0) * item.quantity), 0);

      // Preparar datos de la venta con TODOS los campos requeridos para Google Sheets
      const saleData = {
        ticketNumber: `T-${Date.now()}`,
        date: new Date().toISOString(),
        clientId: ticket.clientId || undefined,
        clientName: ticket.clientName || '',
        items: ticket.items,
        subtotal: subtotal,
        discount: ticket.discount || 0,
        total: total,
        paymentMethod: paymentMethod,
        cashier: cashierName,
        notes: ticket.notes || '',
        pointsEarned: pointsEarned,
        pointsUsed: 0,
        status: 'completada' as const,
      };

      try {
        // Enviar venta a Google Sheets
        await salesAPI.create(saleData as any);
        
        // Actualizar puntos del cliente si existe (SUMA, no reemplaza)
        if (ticket.clientId && pointsEarned > 0) {
          try {
            const { clientsAPI } = await import('@/services/api');
            // Obtener datos frescos del cliente
            const client = await clientsAPI.getById(ticket.clientId);
            const currentPoints = parseInt(String(client.points || 0));
            const newPoints = currentPoints + pointsEarned;
            console.log(`Sumando puntos al cliente ${ticket.clientId}: ${currentPoints} + ${pointsEarned} = ${newPoints}`);
            await clientsAPI.update(ticket.clientId, { points: newPoints });
          } catch (error) {
            console.error('Error al actualizar puntos del cliente:', error);
          }
        }
        
        toast.success('Venta registrada y guardada correctamente');
      } catch (error) {
        console.error('Error al guardar venta:', error);
        toast.error('La venta se procesó pero hubo un error al guardar');
      }
      
      // Limpiar el ticket actual
      setTickets(prev =>
        prev.map(t =>
          t.id === activeTicketId
            ? { ...t, items: [], clientId: undefined, clientName: undefined, notes: undefined, discount: 0 }
            : t
        )
      );
    },
    [activeTicketId, getActiveTicket, getTicketTotal]
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
  if (!context) {
    throw new Error('usePOS must be used within POSProvider');
  }
  return context;
}
