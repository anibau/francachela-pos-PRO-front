/**
 * TEST RÁPIDO: MoneyInput - Verificar que funciona correctamente
 * 
 * Pasos para probar:
 * 1. Importar este componente en una página de prueba
 * 2. Escribir: 0.5 → debe mostrar "0.5" en el input
 * 3. Salir del campo (blur) → debe convertir a "0.50"
 * 4. Escribir: 12.3 → debe mostrar "12.3"
 * 5. Salir → debe convertir a "12.30"
 * 6. Escribir: abc → debe rechazar
 * 7. Escribir: 12.345 → debe limitar a "12.34"
 */

import { useState } from 'react';
import { MoneyInput } from '@/components/ui/money-input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function MoneyInputTest() {
  const [values, setValues] = useState({
    price: 15.50,
    cost: 10.00,
    wholesale: 12.00,
  });

  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    setLogs(prev => [message, ...prev].slice(0, 10));
  };

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Test: MoneyInput Component</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          
          <div className="space-y-4">
            <h3 className="font-semibold">Prueba 1: Escribir "0.5" y salir</h3>
            <MoneyInput
              id="test1"
              label="Prueba Decimal Simple"
              value={values.price}
              onChange={(value) => {
                setValues(prev => ({ ...prev, price: value }));
                addLog(`✓ Precio actualizado a: ${value}`);
              }}
              placeholder="0.00"
              showValidation
            />
            <p className="text-sm text-muted-foreground">Valor actual: {values.price.toFixed(2)}</p>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold">Prueba 2: Escribir "0." y salir</h3>
            <MoneyInput
              id="test2"
              label="Prueba Punto Final"
              value={values.cost}
              onChange={(value) => {
                setValues(prev => ({ ...prev, cost: value }));
                addLog(`✓ Costo actualizado a: ${value}`);
              }}
              placeholder="0.00"
              showValidation
            />
            <p className="text-sm text-muted-foreground">Valor actual: {values.cost.toFixed(2)}</p>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold">Prueba 3: Escribir "12.345" (debe limitar a 2 decimales)</h3>
            <MoneyInput
              id="test3"
              label="Prueba Límite de Decimales"
              value={values.wholesale}
              onChange={(value) => {
                setValues(prev => ({ ...prev, wholesale: value }));
                addLog(`✓ Mayoreo actualizado a: ${value}`);
              }}
              placeholder="0.00"
              showValidation
              error={values.wholesale <= 0 ? "Debe ser mayor a 0" : undefined}
            />
            <p className="text-sm text-muted-foreground">Valor actual: {values.wholesale.toFixed(2)}</p>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold">Log de Eventos (últimos 10)</h3>
            <div className="bg-slate-100 p-4 rounded font-mono text-xs space-y-1 max-h-40 overflow-y-auto">
              {logs.length === 0 ? (
                <p className="text-muted-foreground">Escribe en los campos arriba...</p>
              ) : (
                logs.map((log, i) => (
                  <div key={i} className="text-slate-700">
                    {log}
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded p-4 space-y-2">
            <h4 className="font-semibold text-blue-900">✓ Test Completado</h4>
            <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
              <li>Price: {values.price.toFixed(2)}</li>
              <li>Cost: {values.cost.toFixed(2)}</li>
              <li>Wholesale: {values.wholesale.toFixed(2)}</li>
            </ul>
          </div>

        </CardContent>
      </Card>
    </div>
  );
}
