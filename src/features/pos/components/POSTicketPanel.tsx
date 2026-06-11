import {
  DollarSign,
  FileText,
  Minus,
  Plus,
  Search,
  ShoppingCart,
  Trash2,
  User,
  X,
} from 'lucide-react';
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MoneyInput } from '@/components/ui/money-input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import type { Client, Product } from '@/types';
import type { Ticket } from '@/contexts/POSContext';
import type { PointsEvaluationResponse } from '@/services/pointsService';
import { canIncreaseQty } from '@/features/pos/utils/stockUtils';

interface POSTicketPanelProps {
  tickets: Ticket[];
  activeTicketId: string;
  activeTicket: Ticket | undefined;
  products: Product[];
  clients: Client[];
  filteredClients: Client[];
  clientSearchTerm: string;
  onClientSearchChange: (value: string) => void;
  isClientDialogOpen: boolean;
  onClientDialogOpenChange: (open: boolean) => void;
  onCreateTicket: () => void;
  onSwitchTicket: (id: string) => void;
  onCloseTicket: (id: string) => void;
  onSelectClient: (client: Client) => void;
  onRemoveClient: () => void;
  onUpdateQuantity: (index: number, delta: number, product?: Product) => void;
  onRemoveItem: (index: number) => void;
  onToggleWholesale: (index: number) => void;
  currentDiscount: number;
  onDiscountChange: (value: number) => void;
  currentRecargoExtra: number;
  onRecargoChange: (value: number) => void;
  onNotesChange: (notes: string) => void;
  puntosAUsar: number;
  onPuntosAUsarChange: (value: number) => void;
  onEvaluatePoints: () => void;
  pointsEvaluation: PointsEvaluationResponse | null;
  maxPuntosInput?: number;
  pointsDiscount: number;
  promoDiscount: number;
  total: number;
  pointsEarned: number;
  isLoadingPreview: boolean;
  isSubmitting: boolean;
  onPay: () => void;
  paymentDialog: React.ReactNode;
}

export function POSTicketPanel({
  tickets,
  activeTicketId,
  activeTicket,
  products,
  clients,
  filteredClients,
  clientSearchTerm,
  onClientSearchChange,
  isClientDialogOpen,
  onClientDialogOpenChange,
  onCreateTicket,
  onSwitchTicket,
  onCloseTicket,
  onSelectClient,
  onRemoveClient,
  onUpdateQuantity,
  onRemoveItem,
  onToggleWholesale,
  currentDiscount,
  onDiscountChange,
  currentRecargoExtra,
  onRecargoChange,
  onNotesChange,
  puntosAUsar,
  onPuntosAUsarChange,
  onEvaluatePoints,
  pointsEvaluation,
  maxPuntosInput,
  pointsDiscount,
  promoDiscount,
  total,
  pointsEarned,
  isLoadingPreview,
  isSubmitting,
  onPay,
  paymentDialog,
}: POSTicketPanelProps) {
  return (
    <div className="flex-1 lg:flex-[0_0_70%] xl:flex-[0_0_72%] bg-card border-r flex flex-col min-h-0 overflow-hidden">
      <div className="flex items-center justify-between px-2 py-1.5 border-b shrink-0">
        <h1 className="text-lg font-bold">Punto de Venta</h1>
        <Button onClick={onCreateTicket} variant="outline" size="sm" className="touch-target">
          <Plus className="mr-2 h-4 w-4" />
          Nuevo
        </Button>
      </div>

      <Tabs value={activeTicketId} onValueChange={onSwitchTicket} className="flex-1 flex flex-col min-h-0">
        <TabsList className="w-full justify-start rounded-none border-b bg-muted/50 overflow-x-auto shrink-0 h-11">
          {tickets.map((ticket) => (
            <TabsTrigger
              key={ticket.id}
              value={ticket.id}
              className="relative data-[state=active]:bg-background whitespace-nowrap text-xs px-2 touch-target"
            >
              <ShoppingCart className="h-3 w-3 mr-1" />
              T-{ticket.id.slice(-4)}
              {tickets.length > 1 && (
                <X
                  className="ml-1 h-3 w-3 hover:text-destructive cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    onCloseTicket(ticket.id);
                  }}
                />
              )}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={activeTicketId} className="flex-1 flex flex-col m-0 min-h-0 overflow-hidden">
          <CardHeader className="pb-2 shrink-0">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Ticket #{activeTicketId?.slice(-4)}</CardTitle>
              <Dialog open={isClientDialogOpen} onOpenChange={onClientDialogOpenChange}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="h-11 text-xs touch-target">
                    <User className="h-3 w-3 mr-1" />
                    {activeTicket?.clientName ? activeTicket.clientName.split(' ')[0] : 'Cliente'}
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-sm">
                  <DialogHeader>
                    <DialogTitle>Seleccionar Cliente</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-2">
                    <div className="relative">
                      <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input
                        placeholder="Buscar..."
                        value={clientSearchTerm}
                        onChange={(e) => onClientSearchChange(e.target.value)}
                        className="pl-8 h-11"
                      />
                    </div>
                    <ScrollArea className="h-60">
                      <div className="space-y-1">
                        {filteredClients.length === 0 ? (
                          <p className="text-center text-muted-foreground py-4 text-sm">Sin resultados</p>
                        ) : (
                          filteredClients.map((client) => (
                            <Button
                              key={client.id}
                              variant="ghost"
                              className="w-full justify-start h-auto py-2 touch-target"
                              onClick={() => onSelectClient(client)}
                            >
                              <div className="text-left">
                                <div className="text-sm font-medium">
                                  {client.nombres}{' '}
                                  {client.esCumpleañosHoy ? <span className="text-green-500">🎂</span> : ''}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {client.codigoCorto || client.dni} • {client.puntosAcumulados} pts
                                </div>
                              </div>
                            </Button>
                          ))
                        )}
                      </div>
                    </ScrollArea>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {activeTicket?.clientName && (
              <div className="flex items-center justify-between bg-primary/5 px-2 py-1 rounded text-xs mt-1 gap-2">
                <div className="min-w-0">
                  <span className="font-medium truncate block">{activeTicket.clientName}</span>
                  {activeTicket.clientPuntos != null && (
                    <span className="text-[10px] text-primary font-semibold">
                      {activeTicket.clientPuntos} pts disponibles
                    </span>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 touch-target"
                  onClick={onRemoveClient}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            )}
          </CardHeader>

          <ScrollArea className="flex-1 min-h-0">
            <CardContent className="p-2 space-y-2">
              {!activeTicket?.items.length ? (
                <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                  <FileText className="h-8 w-8 mb-2" />
                  <p className="text-sm">Sin productos</p>
                </div>
              ) : (
                activeTicket.items.map((item, itemIndex) => {
                  const product = products.find((p) => p.id === item.productId);
                  const wholesalePrice = product?.precioMayoreo
                    ? parseFloat(String(product.precioMayoreo))
                    : 0;
                  const hasWholesalePrice = wholesalePrice > 0;
                  const isWholesale = item.isWholesale || false;
                  const showPointsBadge = item.puntosValor > 0;
                  const canPlus =
                    product && canIncreaseQty(product, activeTicket.items, item.productId);

                  return (
                    <div
                      key={`${item.productId}-${itemIndex}`}
                      className="flex items-center gap-1 p-1.5 bg-muted/30 rounded text-xs"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate text-sm">{item.descripcion}</p>
                        <div className="flex items-center gap-1">
                          <span className="text-muted-foreground">S/{item.precio.toFixed(2)}</span>
                          {showPointsBadge && (
                            <Badge variant="secondary" className="text-[10px] px-1 py-0">
                              {item.puntosValor}pts
                            </Badge>
                          )}
                          {hasWholesalePrice && (
                            <Badge
                              variant={isWholesale ? 'default' : 'outline'}
                              className="text-[10px] px-1 py-0 cursor-pointer touch-target"
                              onClick={() => onToggleWholesale(itemIndex)}
                            >
                              {isWholesale ? '✓M' : 'N'}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-0.5">
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-11 w-11 touch-target"
                          onClick={() => onUpdateQuantity(itemIndex, -1, product)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-6 text-center text-sm font-medium">{item.cantidad}</span>
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-9 w-9 touch-target"
                          disabled={!canPlus}
                          onClick={() => onUpdateQuantity(itemIndex, 1, product)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="text-right min-w-[50px]">
                        <p className="font-bold text-sm">S/{item.subtotal.toFixed(2)}</p>
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-11 w-11 touch-target"
                        onClick={() => onRemoveItem(itemIndex)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  );
                })
              )}
            </CardContent>
          </ScrollArea>

          <div className="p-2 border-t bg-muted/20 shrink-0 space-y-2">
            {activeTicket?.items.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                <div>
                  <label htmlFor="pos-descuento" className="text-xs">Descuento</label>
                  <MoneyInput
                    id="pos-descuento"
                    value={currentDiscount}
                    onChange={onDiscountChange}
                    showValidation={false}
                    className="h-11 text-xs flex-1"
                  />
                </div>
                <div>
                  <label htmlFor="pos-recargo" className="text-xs">Recargo Extra</label>
                  <MoneyInput
                    id="pos-recargo"
                    value={currentRecargoExtra}
                    onChange={onRecargoChange}
                    showValidation={false}
                    className="h-11 text-xs flex-1"
                  />
                </div>
                <div className="flex-1 min-w-[100px]">
                  <label htmlFor="pos-notas" className="text-xs">Notas</label>
                  <Input
                    id="pos-notas"
                    value={activeTicket?.notes || ''}
                    onChange={(e) => onNotesChange(e.target.value)}
                    placeholder="Notas..."
                    className="h-11 text-xs"
                  />
                </div>
                {activeTicket?.clientName && (
                  <div className="flex-1 min-w-[100px]">
                    <label htmlFor="pos-puntos" className="text-xs">Puntos a usar</label>
                    <div className="flex gap-1">
                      <Input
                        id="pos-puntos"
                        type="number"
                        min={0}
                        max={maxPuntosInput}
                        value={puntosAUsar || ''}
                        onChange={(e) => onPuntosAUsarChange(parseInt(e.target.value) || 0)}
                        onBlur={() => { if (puntosAUsar > 0) onEvaluatePoints(); }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && puntosAUsar > 0) onEvaluatePoints();
                        }}
                        placeholder="0"
                        className="h-9 text-xs flex-1"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-9 text-xs shrink-0"
                        onClick={onEvaluatePoints}
                        disabled={!puntosAUsar}
                      >
                        OK
                      </Button>
                    </div>
                    {pointsEvaluation && (
                      <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight">
                        {pointsEvaluation.mensaje}
                        {pointsEvaluation.descuento > 0 && (
                          <span className="text-green-600 font-medium">
                            {' '}· Descuento S/ {pointsEvaluation.descuento.toFixed(2)}
                          </span>
                        )}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-between items-center">
              <div>
                <div className="text-sm font-bold">Total</div>
                {activeTicket?.discount > 0 && (
                  <div className="text-[10px] text-muted-foreground">
                    -S/{activeTicket.discount.toFixed(2)} desc.
                  </div>
                )}
                {promoDiscount > 0 && (
                  <div className="text-[10px] text-amber-600 font-semibold">
                    -S/{promoDiscount.toFixed(2)} promo
                  </div>
                )}
                {pointsDiscount > 0 && (
                  <div className="text-[10px] text-green-600 font-semibold">
                    -S/{pointsDiscount.toFixed(2)} pts
                  </div>
                )}
                <div className="text-[10px] text-muted-foreground">{pointsEarned} pts</div>
              </div>
              <div className="text-xl font-bold text-primary">S/ {total.toFixed(2)}</div>
            </div>

            <Button
              className="w-full h-11 touch-target"
              disabled={!activeTicket?.items.length || isLoadingPreview || isSubmitting}
              onClick={onPay}
            >
              <DollarSign className="mr-2 h-4 w-4" />
              {isLoadingPreview ? 'Validando...' : 'Pagar'}
            </Button>

            {paymentDialog}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
