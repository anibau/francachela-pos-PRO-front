import { FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { SalePreviewResponse } from '@/types';

interface POSPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isLoading: boolean;
  salePreview: SalePreviewResponse | null;
  isSubmitting: boolean;
  onConfirm: () => void;
}

export function POSPreviewDialog({
  open,
  onOpenChange,
  isLoading,
  salePreview,
  isSubmitting,
  onConfirm,
}: POSPreviewDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Preview de Venta
          </DialogTitle>
          <DialogDescription>
            Revisa los detalles antes de confirmar la venta
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center py-4">
              <div className="text-sm text-muted-foreground">Validando venta...</div>
            </div>
          ) : salePreview ? (
            <div className="space-y-3">
              <div className="text-sm">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>S/ {salePreview.subtotal?.toFixed(2)}</span>
                </div>
                {(salePreview.descuentoPuntos > 0 || salePreview.descuentoPromos > 0) && (
                  <div className="flex justify-between text-red-600">
                    <span>Descuento:</span>
                    <span>
                      -S/{(salePreview.descuentoPuntos + salePreview.descuentoPromos).toFixed(2)}
                    </span>
                  </div>
                )}
                {salePreview.ajusteRedondeo > 0 && (
                  <div className="flex justify-between text-blue-600">
                    <span>Recargo:</span>
                    <span>+S/ {salePreview.ajusteRedondeo?.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold border-t pt-2">
                  <span>Total:</span>
                  <span>S/ {salePreview.totalCobrado?.toFixed(2)}</span>
                </div>
                {salePreview.puntosOtorgados > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Puntos a ganar:</span>
                    <span>{salePreview.puntosOtorgados} pts</span>
                  </div>
                )}
              </div>
              {salePreview.validaciones.mensajes?.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
                  <div className="text-sm font-medium text-yellow-800 mb-1">Advertencias:</div>
                  {salePreview.validaciones.mensajes.map((advertencia, index) => (
                    <div key={index} className="text-xs text-yellow-700">• {advertencia}</div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-4">
              <div className="text-sm text-muted-foreground">Error al generar preview</div>
            </div>
          )}
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1 touch-target"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button
              className="flex-1 touch-target"
              onClick={onConfirm}
              disabled={isLoading || !salePreview || isSubmitting}
            >
              {isSubmitting ? 'Procesando...' : 'Confirmar Venta'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
