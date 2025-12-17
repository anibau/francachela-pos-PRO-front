import React from 'react';
import VentasCorte from '@/components/VentasCorte';

export default function VentasCortePage() {
  return (
    <div className="space-y-6 animate-fade-in p-4 lg:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Corte de Ventas</h1>
          <p className="text-muted-foreground">
            Análisis detallado de ventas por período con métricas y gráficos
          </p>
        </div>
      </div>
      
      <VentasCorte />
    </div>
  );
}
