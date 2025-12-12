import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Package, Plus, TrendingUp, TrendingDown, RotateCcw, Search, Calendar, User, Filter } from "lucide-react";
import { toast } from "sonner";
import { inventoryService } from '@/services/inventoryService';
import { useProducts } from '@/hooks/useProducts';
import type { InventoryMovement, Product } from "@/types";

export default function Inventario() {
  // Estados para movimientos
  const [movements, setMovements] = useState<InventoryMovement[]>([]);
  const [filteredMovements, setFilteredMovements] = useState<InventoryMovement[]>([]);
  const [statistics, setStatistics] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  
  // Estados para filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [cashierFilter, setCashierFilter] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  
  // Estados para formularios
  const [isMovementDialogOpen, setIsMovementDialogOpen] = useState(false);
  const [movementType, setMovementType] = useState<'entrada' | 'salida' | 'ajuste'>('entrada');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [movementData, setMovementData] = useState({
    cantidad: 0,
    descripcion: '',
    cajero: 'Usuario Actual', // TODO: obtener del contexto de auth
    proveedor: '',
  });

  // Hook para productos
  const { data: productos = [] } = useProducts();

  useEffect(() => {
    loadMovements();
    loadStatistics();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [movements, searchTerm, typeFilter, cashierFilter, dateFrom, dateTo]);

  const loadMovements = async () => {
    try {
      setLoading(true);
      const data = await inventoryService.getMovements();
      setMovements(data);
    } catch (error) {
      toast.error('Error al cargar movimientos de inventario');
      console.error('Error loading movements:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStatistics = async () => {
    try {
      const stats = await inventoryService.getStatistics();
      setStatistics(stats);
    } catch (error) {
      console.error('Error loading statistics:', error);
    }
  };

  const applyFilters = () => {
    let filtered = [...movements];

    // Filtro por búsqueda
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(movement =>
        movement.PRODUCTO_NOMBRE.toLowerCase().includes(searchLower) ||
        movement.DESCRIPCION.toLowerCase().includes(searchLower) ||
        movement.CAJERO.toLowerCase().includes(searchLower)
      );
    }

    // Filtro por tipo
    if (typeFilter !== 'all') {
      filtered = filtered.filter(movement => movement.TIPO === typeFilter);
    }

    // Filtro por cajero
    if (cashierFilter !== 'all') {
      filtered = filtered.filter(movement => movement.CAJERO === cashierFilter);
    }

    // Filtro por fecha
    if (dateFrom && dateTo) {
      const fromDate = new Date(dateFrom);
      const toDate = new Date(dateTo);
      filtered = filtered.filter(movement => {
        const movementDate = new Date(movement.HORA);
        return movementDate >= fromDate && movementDate <= toDate;
      });
    }

    setFilteredMovements(filtered);
  };

  const handleCreateMovement = async () => {
    if (!selectedProduct) {
      toast.error('Selecciona un producto');
      return;
    }

    if (movementData.cantidad <= 0) {
      toast.error('La cantidad debe ser mayor a 0');
      return;
    }

    try {
      const movementPayload = {
        TIPO: movementType,
        PRODUCTO_ID: selectedProduct.id,
        PRODUCTO_NOMBRE: selectedProduct.name,
        CANTIDAD: movementData.cantidad,
        DESCRIPCION: movementData.descripcion || `${movementType.charAt(0).toUpperCase() + movementType.slice(1)} de ${selectedProduct.name}`,
        CAJERO: movementData.cajero,
        HORA: new Date().toISOString(),
      };

      await inventoryService.createMovement(movementPayload);
      toast.success(`${movementType.charAt(0).toUpperCase() + movementType.slice(1)} registrada correctamente`);
      
      // Recargar datos
      loadMovements();
      loadStatistics();
      
      // Limpiar formulario
      setIsMovementDialogOpen(false);
      resetMovementForm();
    } catch (error) {
      toast.error('Error al registrar movimiento');
      console.error('Error creating movement:', error);
    }
  };

  const resetMovementForm = () => {
    setSelectedProduct(null);
    setMovementData({
      cantidad: 0,
      descripcion: '',
      cajero: 'Usuario Actual',
      proveedor: '',
    });
    setMovementType('entrada');
  };

  const getMovementIcon = (tipo: string) => {
    switch (tipo) {
      case 'entrada':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'salida':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      case 'ajuste':
        return <RotateCcw className="h-4 w-4 text-blue-600" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  const getMovementBadgeVariant = (tipo: string) => {
    switch (tipo) {
      case 'entrada':
        return 'default';
      case 'salida':
        return 'destructive';
      case 'ajuste':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  // Obtener cajeros únicos para el filtro
  const uniqueCashiers = [...new Set(movements.map(m => m.CAJERO))];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold mb-2">Inventario</h1>
        <p className="text-muted-foreground">Gestión de productos y movimientos de inventario</p>
      </div>

      <Tabs defaultValue="movements" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="movements">Movimientos</TabsTrigger>
          <TabsTrigger value="products">Productos</TabsTrigger>
          <TabsTrigger value="statistics">Estadísticas</TabsTrigger>
        </TabsList>

        {/* Tab de Movimientos */}
        <TabsContent value="movements" className="space-y-4">
          {/* Estadísticas rápidas */}
          {statistics && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    <div>
                      <p className="text-sm text-muted-foreground">Entradas</p>
                      <p className="text-2xl font-bold text-green-600">{statistics.entradas?.cantidad || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <TrendingDown className="h-4 w-4 text-red-600" />
                    <div>
                      <p className="text-sm text-muted-foreground">Salidas</p>
                      <p className="text-2xl font-bold text-red-600">{statistics.salidas?.cantidad || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <RotateCcw className="h-4 w-4 text-blue-600" />
                    <div>
                      <p className="text-sm text-muted-foreground">Ajustes</p>
                      <p className="text-2xl font-bold text-blue-600">{statistics.ajustes?.cantidad || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Hoy</p>
                      <p className="text-2xl font-bold">{statistics.movimientosHoy || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Filtros y acciones */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Movimientos de Inventario</span>
                <Dialog open={isMovementDialogOpen} onOpenChange={setIsMovementDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Nuevo Movimiento
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Registrar Movimiento</DialogTitle>
                      <DialogDescription>
                        Registra una entrada, salida o ajuste de inventario
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Tipo de Movimiento</Label>
                        <Select value={movementType} onValueChange={(value: any) => setMovementType(value)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="entrada">Entrada</SelectItem>
                            <SelectItem value="salida">Salida</SelectItem>
                            <SelectItem value="ajuste">Ajuste</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Producto</Label>
                        <Select value={selectedProduct?.id.toString() || ''} onValueChange={(value) => {
                          const product = productos.find(p => p.id.toString() === value);
                          setSelectedProduct(product || null);
                        }}>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar producto" />
                          </SelectTrigger>
                          <SelectContent>
                            {productos.map((product) => (
                              <SelectItem key={product.id} value={product.id.toString()}>
                                {product.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Cantidad</Label>
                        <Input
                          type="number"
                          min="1"
                          value={movementData.cantidad}
                          onChange={(e) => setMovementData({ ...movementData, cantidad: parseInt(e.target.value) || 0 })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Descripción</Label>
                        <Input
                          value={movementData.descripcion}
                          onChange={(e) => setMovementData({ ...movementData, descripcion: e.target.value })}
                          placeholder="Descripción del movimiento"
                        />
                      </div>
                      {movementType === 'entrada' && (
                        <div className="space-y-2">
                          <Label>Proveedor</Label>
                          <Input
                            value={movementData.proveedor}
                            onChange={(e) => setMovementData({ ...movementData, proveedor: e.target.value })}
                            placeholder="Nombre del proveedor"
                          />
                        </div>
                      )}
                    </div>
                    <DialogFooter>
                      <Button onClick={handleCreateMovement}>
                        Registrar Movimiento
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Filtros */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="space-y-2">
                  <Label>Buscar</Label>
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Producto, descripción..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Tipo</Label>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="entrada">Entrada</SelectItem>
                      <SelectItem value="salida">Salida</SelectItem>
                      <SelectItem value="ajuste">Ajuste</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Cajero</Label>
                  <Select value={cashierFilter} onValueChange={setCashierFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      {uniqueCashiers.map((cashier) => (
                        <SelectItem key={cashier} value={cashier}>
                          {cashier}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Desde</Label>
                  <Input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Hasta</Label>
                  <Input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                  />
                </div>
              </div>

              {/* Tabla de movimientos */}
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Producto</TableHead>
                      <TableHead>Cantidad</TableHead>
                      <TableHead>Descripción</TableHead>
                      <TableHead>Cajero</TableHead>
                      <TableHead>Fecha</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          Cargando movimientos...
                        </TableCell>
                      </TableRow>
                    ) : filteredMovements.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          No se encontraron movimientos
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredMovements.map((movement) => (
                        <TableRow key={movement.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getMovementIcon(movement.TIPO)}
                              <Badge variant={getMovementBadgeVariant(movement.TIPO)}>
                                {movement.TIPO.charAt(0).toUpperCase() + movement.TIPO.slice(1)}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">
                            {movement.PRODUCTO_NOMBRE}
                          </TableCell>
                          <TableCell>
                            <span className={`font-semibold ${
                              movement.TIPO === 'entrada' ? 'text-green-600' : 
                              movement.TIPO === 'salida' ? 'text-red-600' : 'text-blue-600'
                            }`}>
                              {movement.TIPO === 'salida' ? '-' : '+'}{movement.CANTIDAD}
                            </span>
                          </TableCell>
                          <TableCell>{movement.DESCRIPCION}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <User className="h-3 w-3 text-muted-foreground" />
                              {movement.CAJERO}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3 text-muted-foreground" />
                              {new Date(movement.HORA).toLocaleString('es-PE')}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab de Productos */}
        <TabsContent value="products" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Lista de Productos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {productos.map((product) => (
                  <div key={product.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-semibold">{product.name}</h3>
                      <p className="text-sm text-muted-foreground">Stock: {product.stock}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={product.stock <= product.minStock ? 'destructive' : 'default'}>
                        {product.stock <= product.minStock ? 'Stock Bajo' : 'Stock OK'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab de Estadísticas */}
        <TabsContent value="statistics" className="space-y-4">
          {statistics && (
            <div className="grid gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Resumen General</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold">{statistics.totalMovimientos}</p>
                      <p className="text-sm text-muted-foreground">Total Movimientos</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">{statistics.entradas?.total || 0}</p>
                      <p className="text-sm text-muted-foreground">Unidades Ingresadas</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-red-600">{statistics.salidas?.total || 0}</p>
                      <p className="text-sm text-muted-foreground">Unidades Vendidas</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">{statistics.ajustes?.total || 0}</p>
                      <p className="text-sm text-muted-foreground">Ajustes Realizados</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Producto Más Activo</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-lg font-semibold">{statistics.productoConMasMovimientos}</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Cajero Más Activo</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-lg font-semibold">{statistics.cajeroMasActivo}</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

