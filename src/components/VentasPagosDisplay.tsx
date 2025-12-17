import React, { useState } from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CreditCard, Eye } from "lucide-react";
import type { Sale, Payment, PaymentMethod } from "@/types";

interface VentasPagosDisplayProps {
  venta: Sale;
}

// Función helper para obtener los métodos de pago de una venta
function getPaymentMethods(venta: Sale): { metodoPago: PaymentMethod; monto: number; referencia?: string | null; estado?: string }[] {
  // Si tiene array de pagos (nueva estructura)
  if (venta.pagos && venta.pagos.length > 0) {
    return venta.pagos.map(pago => ({
      metodoPago: pago.metodoPago,
      monto: pago.monto,
      referencia: pago.referencia,
      estado: pago.estado
    }));
  }
  
  // Si tiene metodoPago único (compatibilidad retroactiva)
  if (venta.metodoPago) {
    return [{
      metodoPago: venta.metodoPago,
      monto: venta.total,
      referencia: null,
      estado: 'COMPLETADO'
    }];
  }
  
  // Fallback si no hay información de pago
  return [];
}

// Función helper para obtener el color del badge según el método de pago
function getPaymentMethodColor(metodoPago: PaymentMethod): string {
  switch (metodoPago) {
    case 'EFECTIVO':
      return 'bg-green-100 text-green-800 hover:bg-green-200';
    case 'YAPE':
      return 'bg-purple-100 text-purple-800 hover:bg-purple-200';
    case 'PLIN':
      return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
    case 'TARJETA':
      return 'bg-orange-100 text-orange-800 hover:bg-orange-200';
    default:
      return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
  }
}

export default function VentasPagosDisplay({ venta }: VentasPagosDisplayProps) {
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const paymentMethods = getPaymentMethods(venta);

  // Si no hay métodos de pago
  if (paymentMethods.length === 0) {
    return (
      <Badge variant="outline" className="bg-gray-100 text-gray-600">
        Sin información
      </Badge>
    );
  }

  // Si es un solo método de pago
  if (paymentMethods.length === 1) {
    const payment = paymentMethods[0];
    return (
      <Badge 
        className={getPaymentMethodColor(payment.metodoPago)}
        variant="outline"
      >
        {payment.metodoPago} S/{payment.monto.toFixed(2)}
      </Badge>
    );
  }

  // Si son múltiples métodos de pago
  return (
    <>
      <div className="flex items-center gap-1">
        <Badge 
          variant="outline" 
          className="bg-blue-50 text-blue-700 cursor-pointer hover:bg-blue-100"
          onClick={() => setIsDetailDialogOpen(true)}
        >
          {paymentMethods.length} métodos
        </Badge>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsDetailDialogOpen(true)}
          className="h-6 w-6 p-0"
        >
          <Eye className="h-3 w-3" />
        </Button>
      </div>

      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Métodos de Pago - Venta #{venta.id}
            </DialogTitle>
            <DialogDescription>
              Detalles de los métodos de pago utilizados en esta venta
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-3">
            {paymentMethods.map((payment, index) => (
              <div 
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <Badge 
                    className={getPaymentMethodColor(payment.metodoPago)}
                    variant="outline"
                  >
                    {payment.metodoPago}
                  </Badge>
                  <div>
                    <p className="font-semibold text-sm">S/{payment.monto.toFixed(2)}</p>
                    {payment.referencia && (
                      <p className="text-xs text-gray-500">
                        Ref: {payment.referencia}
                      </p>
                    )}
                  </div>
                </div>
                
                {payment.estado && (
                  <Badge 
                    variant={payment.estado === 'COMPLETADO' ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {payment.estado}
                  </Badge>
                )}
              </div>
            ))}
            
            <div className="border-t pt-3">
              <div className="flex justify-between items-center font-semibold">
                <span>Total:</span>
                <span>S/{venta.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

