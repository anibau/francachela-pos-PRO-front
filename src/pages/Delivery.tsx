import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Truck } from 'lucide-react';
import { deliveryService, type BackendDelivery } from '@/services/deliveryService';
import { LoadingState } from '@/components/ui/state-views';
import { EmptyState } from '@/components/ui/state-views';

export default function Delivery() {
  const [orders, setOrders] = useState<BackendDelivery[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const data = await deliveryService.getAll();
      setOrders(data);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: 'secondary',
      'in-transit': 'default',
      delivered: 'outline',
      cancelled: 'destructive',
    } as const;
    return variants[status as keyof typeof variants] || 'secondary';
  };

  if (loading) {
    return <LoadingState message="Cargando pedidos de delivery..." />;
  }

  return (
    <div className="space-y-6 animate-fade-in p-4 lg:p-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Delivery</h1>
        <p className="text-muted-foreground">Gestión de pedidos a domicilio</p>
      </div>

      {orders.length === 0 ? (
        <EmptyState title="Sin pedidos de delivery" description="No hay entregas registradas" />
      ) : (
        <div className="grid gap-4">
          {orders.map((order) => (
            <Card key={order.id}>
              <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex items-center gap-3">
                  <Truck className="h-5 w-5 text-primary" />
                  <div>
                    <CardTitle>Pedido #{order.pedidoId || order.id}</CardTitle>
                    <p className="text-sm text-muted-foreground">{order.direccion}</p>
                  </div>
                </div>
                <Badge variant={getStatusBadge(order.estado)}>{order.estado}</Badge>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Cliente</p>
                    <p className="font-semibold">
                      {order.cliente
                        ? `${order.cliente.nombres} ${order.cliente.apellidos}`
                        : '—'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Teléfono</p>
                    <p className="font-semibold">{order.phone || order.cliente?.telefono || '—'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Repartidor</p>
                    <p className="font-semibold">{order.repartidor || '—'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Costo Delivery</p>
                    <p className="font-semibold">S/ {Number(order.deliveryFee || 0).toFixed(2)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
