import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Star, Search } from 'lucide-react';
import { toast } from 'sonner';
import { useClients } from '@/hooks';
import { pointsService, type PointsMovement } from '@/services/pointsService';
import { CanAccess } from '@/components/auth/CanAccess';
import { LoadingState } from '@/components/ui/state-views';

export default function Puntos() {
  const { data: clients = [], isLoading } = useClients();
  const [search, setSearch] = useState('');
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);
  const [historial, setHistorial] = useState<PointsMovement[]>([]);
  const [loadingHistorial, setLoadingHistorial] = useState(false);
  const [ajuste, setAjuste] = useState({ puntos: 0, motivo: '' });
  const [stats, setStats] = useState<Record<string, unknown> | null>(null);

  const filtered = clients.filter((c) => {
    const q = search.toLowerCase();
    return (
      c.nombres.toLowerCase().includes(q) ||
      c.apellidos.toLowerCase().includes(q) ||
      c.dni.includes(search)
    );
  });

  const loadHistorial = async (clienteId: number) => {
    setSelectedClientId(clienteId);
    setLoadingHistorial(true);
    try {
      const data = await pointsService.getHistorial(clienteId);
      setHistorial(data);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al cargar historial');
    } finally {
      setLoadingHistorial(false);
    }
  };

  const handleAjustar = async () => {
    if (!selectedClientId || !ajuste.motivo.trim()) {
      toast.error('Seleccione un cliente e ingrese el motivo');
      return;
    }
    try {
      await pointsService.adjust({
        clienteId: selectedClientId,
        puntos: ajuste.puntos,
        motivo: ajuste.motivo,
        tipo: 'AJUSTE',
      });
      toast.success('Puntos ajustados correctamente');
      setAjuste({ puntos: 0, motivo: '' });
      await loadHistorial(selectedClientId);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al ajustar puntos');
    }
  };

  const loadStats = async () => {
    try {
      const data = await pointsService.getStatistics();
      setStats(data);
    } catch (error) {
      toast.error('Error al cargar estadísticas');
    }
  };

  if (isLoading) {
    return <LoadingState message="Cargando clientes..." />;
  }

  return (
    <div className="space-y-6 animate-fade-in p-4 lg:p-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Sistema de Puntos</h1>
        <p className="text-muted-foreground">Historial y ajustes manuales (solo administradores)</p>
      </div>

      <CanAccess roles={['ADMIN']}>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadStats}>Cargar estadísticas</Button>
        </div>
        {stats && (
          <Card>
            <CardContent className="pt-6">
              <pre className="text-sm text-muted-foreground">{JSON.stringify(stats, null, 2)}</pre>
            </CardContent>
          </Card>
        )}
      </CanAccess>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Buscar cliente
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Nombre o DNI..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <div className="max-h-64 overflow-y-auto space-y-2">
              {filtered.slice(0, 20).map((cliente) => (
                <button
                  key={cliente.id}
                  type="button"
                  className={`w-full text-left p-2 rounded border hover:bg-accent ${
                    selectedClientId === cliente.id ? 'border-primary bg-accent' : ''
                  }`}
                  onClick={() => loadHistorial(cliente.id)}
                >
                  <p className="font-medium">{cliente.nombres} {cliente.apellidos}</p>
                  <p className="text-sm text-muted-foreground">
                    DNI: {cliente.dni} · {cliente.puntosAcumulados ?? 0} pts
                  </p>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5" />
              Historial
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingHistorial ? (
              <LoadingState message="Cargando historial..." />
            ) : historial.length === 0 ? (
              <p className="text-muted-foreground text-sm">Seleccione un cliente para ver movimientos</p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {historial.map((mov) => (
                  <div key={mov.id} className="p-2 border rounded text-sm">
                    <p className="font-medium">{mov.tipo}: {mov.puntos > 0 ? '+' : ''}{mov.puntos} pts</p>
                    <p className="text-muted-foreground">Saldo: {mov.saldoDespues} · {new Date(mov.fecha).toLocaleString()}</p>
                    {mov.motivo && <p className="text-xs">{mov.motivo}</p>}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <CanAccess roles={['ADMIN']}>
        <Card>
          <CardHeader>
            <CardTitle>Ajuste manual de puntos</CardTitle>
          </CardHeader>
          <CardContent className="grid sm:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="puntos-ajuste">Puntos (+/-)</Label>
              <Input
                id="puntos-ajuste"
                type="number"
                value={ajuste.puntos}
                onChange={(e) => setAjuste({ ...ajuste, puntos: Number(e.target.value) })}
              />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="motivo-ajuste">Motivo</Label>
              <Textarea
                id="motivo-ajuste"
                value={ajuste.motivo}
                onChange={(e) => setAjuste({ ...ajuste, motivo: e.target.value })}
              />
            </div>
            <Button onClick={handleAjustar} disabled={!selectedClientId}>
              Aplicar ajuste
            </Button>
          </CardContent>
        </Card>
      </CanAccess>
    </div>
  );
}
