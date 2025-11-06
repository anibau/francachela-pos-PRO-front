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
  addItem: (productId: number, productName: string, price: number, pointsValue?: number) => void;
  updateItemQuantity: (productId: number, delta: number) => void;
  removeItem: (productId: number) => void;
  setTicketClient: (clientId?: number, clientName?: string) => void;
  setTicketNotes: (notes: string) => void;
  applyDiscount: (discount: number) => void;
  getActiveTicket: () => Ticket | undefined;
  getTicketTotal: (ticketId?: string) => number;
  completeSale: (paymentMethod: PaymentMethod) => Promise<void>;
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
    (productId: number, productName: string, price: number, pointsValue: number = 0) => {
      setTickets(prev =>
        prev.map(ticket => {
          if (ticket.id !== activeTicketId) return ticket;
          
          const existingItem = ticket.items.find(item => item.productId === productId);
          
          if (existingItem) {
            return {
              ...ticket,
              items: ticket.items.map(item =>
                item.productId === productId
                  ? {
                      ...item,
                      quantity: item.quantity + 1,
                      subtotal: (item.quantity + 1) * item.price,
                    }
                  : item
              ),
            };
          }
          
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
              },
            ],
          };
        })
      );
    },
    [activeTicketId]
  );

  const updateItemQuantity = useCallback(
    (productId: number, delta: number) => {
      setTickets(prev =>
        prev.map(ticket => {
          if (ticket.id !== activeTicketId) return ticket;
          
          return {
            ...ticket,
            items: ticket.items
              .map(item => {
                if (item.productId !== productId) return item;
                const newQuantity = item.quantity + delta;
                if (newQuantity <= 0) return null;
                return {
                  ...item,
                  quantity: newQuantity,
                  subtotal: newQuantity * item.price,
                };
              })
              .filter((item): item is SaleItem => item !== null),
          };
        })
      );
    },
    [activeTicketId]
  );

  const removeItem = useCallback(
    (productId: number) => {
      setTickets(prev =>
        prev.map(ticket => {
          if (ticket.id !== activeTicketId) return ticket;
          return {
            ...ticket,
            items: ticket.items.filter(item => item.productId !== productId),
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
    async (paymentMethod: PaymentMethod) => {
      const ticket = getActiveTicket();
      if (!ticket || ticket.items.length === 0) return;

      // Preparar datos de la venta con todos los campos requeridos para Google Sheets
      const saleData = {
        ticketNumber: `T-${Date.now()}`,
        date: new Date().toISOString(),
        clientId: ticket.clientId,
        clientName: ticket.clientName,
        items: ticket.items,
        subtotal: ticket.items.reduce((sum, item) => sum + item.subtotal, 0),
        discount: ticket.discount,
        total: getTicketTotal(),
        paymentMethod,
        cashier: 'Sistema',
        notes: ticket.notes,
        pointsEarned: ticket.items.reduce((sum, item) => sum + ((item.pointsValue || 0) * item.quantity), 0),
        pointsUsed: 0,
        status: 'completada' as const,
      };

      try {
        // Enviar venta a Google Sheets
        await salesAPI.create(saleData as any);
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
