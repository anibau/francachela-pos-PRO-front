import {
  Calculator,
  ChevronDown,
  ChevronUp,
  DollarSign,
  User,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { PAYMENT_METHOD_OPTIONS } from '@/constants/paymentMethods';
import type { PaymentMethod } from '@/types';
import type { PaymentLine } from '../hooks/usePOSPayments';

interface POSPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  total: number;
  pointsEarned: number;
  clientName?: string;
  pointsEvaluation: { descuento: number; mensaje?: string } | null;
  selectedPaymentMethod: PaymentMethod;
  onSelectPaymentMethod: (method: PaymentMethod) => void;
  montoActual: number;
  onMontoActualChange: (value: number) => void;
  metodosPageo: PaymentLine[];
  getMontoRestante: () => number;
  getTotalPagado: () => number;
  isPagoCompleto: () => boolean;
  onAgregarMetodo: () => void;
  onRemoverMetodo: (index: number) => void;
  showChangeCalculator: boolean;
  onShowChangeCalculatorChange: (open: boolean) => void;
  montoRecibido: number | undefined;
  onMontoRecibidoChange: (value: number | undefined) => void;
  isSubmitting: boolean;
  canConfirm: boolean;
  onConfirm: () => void;
}

export function POSPaymentDialog({
  open,
  onOpenChange,
  total,
  pointsEarned,
  clientName,
  pointsEvaluation,
  selectedPaymentMethod,
  onSelectPaymentMethod,
  montoActual,
  onMontoActualChange,
  metodosPageo,
  getMontoRestante,
  getTotalPagado,
  isPagoCompleto,
  onAgregarMetodo,
  onRemoverMetodo,
  showChangeCalculator,
  onShowChangeCalculatorChange,
  montoRecibido,
  onMontoRecibidoChange,
  isSubmitting,
  canConfirm,
  onConfirm,
}: POSPaymentDialogProps) {
  const confirmAmount =
    metodosPageo.length > 0 ? getTotalPagado() : total;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm max-h-[85vh] overflow-y-auto">
        <DialogHeader className="pb-2">
          <DialogTitle className="text-base">Procesar Pago</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2 p-2 bg-muted/50 rounded text-center text-sm">
            <div>
              <div className="text-[10px] text-muted-foreground">Total</div>
              <div className="text-lg font-bold text-primary">S/ {total.toFixed(2)}</div>
            </div>
            <div>
              <div className="text-[10px] text-muted-foreground">Puntos</div>
              <div className="font-bold text-primary">{pointsEarned}</div>
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-xs">Método de Pago</Label>
            <div className="grid grid-cols-4 gap-1">
              {PAYMENT_METHOD_OPTIONS.map((option) => (
                <Button
                  key={option.value}
                  type="button"
                  variant={selectedPaymentMethod === option.value ? 'default' : 'outline'}
                  size="sm"
                  className="text-xs h-11 px-1 touch-target"
                  onClick={() => onSelectPaymentMethod(option.value as PaymentMethod)}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>

          <Collapsible>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="w-full justify-between h-11 text-xs touch-target">
                <span>+ Dividir pago</span>
                <ChevronDown className="h-3 w-3" />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-2 space-y-2">
              <div className="flex gap-1">
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={montoActual || ''}
                  onChange={(e) => onMontoActualChange(parseFloat(e.target.value) || 0)}
                  onFocus={() => {
                    if (montoActual === 0 && getMontoRestante() > 0) {
                      onMontoActualChange(getMontoRestante());
                    }
                  }}
                  placeholder={`Monto ${getMontoRestante() > 0 ? `(Restante: S/${getMontoRestante().toFixed(2)})` : ''}`}
                  className="h-11 text-xs flex-1"
                />
                <Button
                  onClick={onAgregarMetodo}
                  variant="outline"
                  size="sm"
                  className="h-11 text-xs touch-target"
                  disabled={montoActual <= 0}
                >
                  + {selectedPaymentMethod}
                </Button>
              </div>
              {metodosPageo.length > 0 && (
                <div className="space-y-1 p-2 bg-muted/30 rounded text-xs">
                  {metodosPageo.map((metodo, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span>{metodo.metodoPago}: S/{metodo.monto.toFixed(2)}</span>
                      <Button
                        onClick={() => onRemoverMetodo(index)}
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-destructive touch-target"
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                  <Separator className="my-1" />
                  <div className="flex justify-between font-bold">
                    <span>Restante:</span>
                    <span className={getMontoRestante() > 0.01 ? 'text-destructive' : 'text-green-600'}>
                      S/ {getMontoRestante().toFixed(2)}
                    </span>
                  </div>
                </div>
              )}
            </CollapsibleContent>
          </Collapsible>

          <Collapsible open={showChangeCalculator} onOpenChange={onShowChangeCalculatorChange}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="w-full justify-between h-11 text-xs touch-target">
                <span className="flex items-center gap-1"><Calculator className="h-3 w-3" /> Vuelto</span>
                {showChangeCalculator ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-2">
              <div className="space-y-2 p-2 bg-muted/30 rounded">
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={montoRecibido === undefined ? '' : montoRecibido}
                  onChange={(e) =>
                    onMontoRecibidoChange(
                      e.target.value === '' ? undefined : parseFloat(e.target.value),
                    )
                  }
                  placeholder={`Recibido (Total: S/${total.toFixed(2)})`}
                  className="h-11 text-xs"
                />
                {montoRecibido !== undefined && montoRecibido >= total && (
                  <div className="flex justify-between items-center text-sm">
                    <span>Vuelto:</span>
                    <span className="font-bold text-primary text-lg">
                      S/ {(montoRecibido - total).toFixed(2)}
                    </span>
                  </div>
                )}
              </div>
            </CollapsibleContent>
          </Collapsible>

          {clientName && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 p-2 bg-primary/5 rounded text-xs">
                <User className="h-3 w-3 text-primary" />
                <span className="font-medium">{clientName}</span>
                <span className="text-muted-foreground">+{pointsEarned} pts</span>
              </div>
              {pointsEvaluation && (
                <div className="p-2 bg-green-50 border border-green-200 rounded text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-green-700 font-medium">Descuento aplicado:</span>
                    <span className="text-green-800 font-bold">
                      -S/ {pointsEvaluation.descuento.toFixed(2)}
                    </span>
                  </div>
                  {pointsEvaluation.mensaje && (
                    <p className="text-green-600 text-[10px] mt-1">{pointsEvaluation.mensaje}</p>
                  )}
                </div>
              )}
            </div>
          )}

          <Button
            onClick={onConfirm}
            className="w-full touch-target h-11"
            size="lg"
            disabled={
              isSubmitting ||
              !canConfirm ||
              (metodosPageo.length > 0 && !isPagoCompleto())
            }
          >
            <DollarSign className="mr-2 h-4 w-4" />
            {isSubmitting
              ? 'Procesando...'
              : `Confirmar S/ ${confirmAmount.toFixed(2)}`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
