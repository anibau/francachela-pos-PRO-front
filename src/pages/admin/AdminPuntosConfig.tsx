import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Settings2 } from 'lucide-react';
import { toast } from 'sonner';
import { CanAccess } from '@/components/auth/CanAccess';
import { LoadingState } from '@/components/ui/state-views';
import { puntosConfigService, type PuntosConfig } from '@/services/puntosConfigService';

const PREVIEW_VENTA = 90.2;

export default function AdminPuntosConfig() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['puntos-config'],
    queryFn: () => puntosConfigService.get(),
  });

  const [form, setForm] = useState<PuntosConfig>({
    valorPunto: 0.1,
    limiteCanjePorcentaje: 0.5,
    factorOtorgamiento: 1,
  });

  useEffect(() => {
    if (data) setForm(data);
  }, [data]);

  const mutation = useMutation({
    mutationFn: puntosConfigService.update,
    onSuccess: (updated) => {
      queryClient.setQueryData(['puntos-config'], updated);
      toast.success('Configuración de puntos actualizada');
    },
    onError: (error: Error) => toast.error(error.message),
  });

  if (isLoading) {
    return <LoadingState message="Cargando configuración..." />;
  }

  const puntosOtorgadosPreview = Math.floor(PREVIEW_VENTA * form.factorOtorgamiento);
  const descuento10Pts = (10 * form.valorPunto).toFixed(2);

  return (
    <CanAccess roles={['ADMIN']}>
      <div className="space-y-6 animate-fade-in p-4 lg:p-6 max-w-2xl">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Settings2 className="h-7 w-7 text-primary" />
            Configuración de Puntos
          </h1>
          <p className="text-muted-foreground mt-1">
            Parámetros globales de canje y otorgamiento de puntos en el POS.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Parámetros</CardTitle>
            <CardDescription>
              Los cambios aplican al preview, create y evaluación de puntos.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="valorPunto">Valor del punto (S/)</Label>
              <Input
                id="valorPunto"
                type="number"
                min={0.01}
                step={0.01}
                value={form.valorPunto}
                onChange={(e) =>
                  setForm((f) => ({ ...f, valorPunto: parseFloat(e.target.value) || 0 }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label>
                Límite canje por producto: {Math.round(form.limiteCanjePorcentaje * 100)}%
              </Label>
              <Slider
                min={0}
                max={100}
                step={5}
                value={[form.limiteCanjePorcentaje * 100]}
                onValueChange={([v]) =>
                  setForm((f) => ({ ...f, limiteCanjePorcentaje: v / 100 }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="factorOtorgamiento">Factor otorgamiento (puntos por sol cobrado)</Label>
              <Input
                id="factorOtorgamiento"
                type="number"
                min={0}
                step={0.1}
                value={form.factorOtorgamiento}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    factorOtorgamiento: parseFloat(e.target.value) || 0,
                  }))
                }
              />
            </div>

            <div className="rounded-lg border bg-muted/40 p-4 text-sm space-y-1">
              <p className="font-medium">Vista previa</p>
              <p>
                Venta S/ {PREVIEW_VENTA.toFixed(2)} → otorga{' '}
                <strong>{puntosOtorgadosPreview}</strong> puntos
              </p>
              <p>
                10 pts = S/ <strong>{descuento10Pts}</strong> de descuento
              </p>
            </div>

            <Button
              onClick={() => mutation.mutate(form)}
              disabled={mutation.isPending}
            >
              {mutation.isPending ? 'Guardando...' : 'Guardar cambios'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </CanAccess>
  );
}
