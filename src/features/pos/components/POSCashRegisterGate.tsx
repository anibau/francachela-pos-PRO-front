import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface POSCashRegisterGateProps {
  open: boolean;
  isLoading: boolean;
  onCheckState: () => void;
}

export function POSCashRegisterGate({
  open,
  isLoading,
  onCheckState,
}: POSCashRegisterGateProps) {
  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            Caja Cerrada
          </DialogTitle>
          <DialogDescription>
            No hay una caja abierta. Debes abrir una caja antes de realizar ventas.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="text-sm text-muted-foreground">
            {isLoading
              ? 'Verificando estado de caja...'
              : 'Para continuar con las ventas, necesitas abrir una caja desde el módulo de Caja.'}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1 touch-target"
              onClick={() => { window.location.href = '/caja'; }}
            >
              Ir a Caja
            </Button>
            <Button
              className="flex-1 touch-target"
              onClick={onCheckState}
              disabled={isLoading}
            >
              {isLoading ? 'Verificando...' : 'Verificar Estado'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
