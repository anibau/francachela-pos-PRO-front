import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Package, Plus, Pencil, Trash2, Search, ArrowUpDown } from "lucide-react";
import { toast } from "sonner";
import { useProducts, useCreateProduct, useUpdateProduct, useDeleteProduct } from '@/hooks/useProducts';
import type { Product, InventoryMovement } from "@/types";
import { ProductCategory, ProductSupplier } from "@/types";

export default function Productos() {
  // Usar hooks de TanStack Query
  const { data: productos = [], isLoading, error } = useProducts();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isMovementDialogOpen, setIsMovementDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    barcode: '',
    category: '',
    price: 0,
    cost: 0,
    stock: 0,
    minStock: 0,
    supplier: '',
    description: '',
    image: '',
    wholesalePrice: 0,
    pointsValue: 0,
    showInCatalog: true,
    useInventory: true,
  });
  const [movementData, setMovementData] = useState({
    type: 'entrada' as 'entrada' | 'salida' | 'ajuste',
    quantity: 0,
    notes: '',
  });

  // Manejar errores
  useEffect(() => {
    if (error) {
      toast.error('Error al cargar productos');
      console.error('Error loading products:', error);
    }
  }, [error]);



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingProduct) {
        await updateProduct.mutateAsync({ id: editingProduct.id, data: formData });
        toast.success('Producto actualizado correctamente');
      } else {
        await createProduct.mutateAsync(formData);
        toast.success('Producto creado correctamente');
      }
      
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      toast.error('Error al guardar producto');
    }
  };

  const handleMovementSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedProduct) return;
    
    try {
      await inventoryAPI.createMovement({
        CODIGO_BARRA: selectedProduct.barcode,
        DESCRIPCION: selectedProduct.name,
        COSTO: selectedProduct.cost,
        PRECIO_VENTA: selectedProduct.price,
        EXISTENCIA: selectedProduct.stock,
        INV_MINIMO: selectedProduct.minStock,
        TIPO: movementData.type,
        CANTIDAD: movementData.quantity,
        CAJERO: 'Usuario', // TODO: obtener del contexto de auth
        PROVEEDOR: selectedProduct.supplier,
      } as any);
      
      // Actualizar stock del producto
      const newStock = movementData.type === 'entrada' 
        ? selectedProduct.stock + movementData.quantity
        : selectedProduct.stock - movementData.quantity;
      
      await productsAPI.update(selectedProduct.id, { stock: newStock });
      
      toast.success('Movimiento registrado correctamente');
      setIsMovementDialogOpen(false);
      resetMovementForm();
      loadData();
    } catch (error) {
      toast.error('Error al registrar movimiento');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar este producto?')) return;
    
    try {
      await deleteProduct.mutateAsync(id);
      toast.success('Producto eliminado correctamente');
    } catch (error) {
      toast.error('Error al eliminar producto');
    }
  };

  const openEditDialog = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      barcode: product.barcode,
      category: product.category,
      price: product.price,
      cost: product.cost,
      stock: product.stock,
      minStock: product.minStock,
      supplier: product.supplier,
      description: product.description || '',
      image: product.image || '',
      wholesalePrice: product.wholesalePrice || 0,
      pointsValue: product.pointsValue || 0,
      showInCatalog: product.showInCatalog ?? true,
      useInventory: product.useInventory ?? true,
    });
    setIsDialogOpen(true);
  };

  const openMovementDialog = (product: Product) => {
    setSelectedProduct(product);
    setIsMovementDialogOpen(true);
  };

  const resetForm = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      barcode: '',
      category: '',
      price: 0,
      cost: 0,
      stock: 0,
      minStock: 0,
      supplier: '',
      description: '',
      image: '',
      wholesalePrice: 0,
      pointsValue: 0,
      showInCatalog: true,
      useInventory: true,
    });
  };

  const resetMovementForm = () => {
    setSelectedProduct(null);
    setMovementData({
      type: 'entrada',
      quantity: 0,
      notes: '',
    });
  };

  // Asegurar que productos sea un array antes de filtrar
  const filteredProductos = (productos || []).filter(producto => {
    if (!producto?.name || !producto?.barcode || !producto?.category) return false;
    
    const searchTermLower = searchTerm.toLowerCase();
    return (
      producto.name.toLowerCase().includes(searchTermLower) ||
      // producto.barcode.includes(searchTerm) ||
      producto.category.toLowerCase().includes(searchTermLower)
    );
  });

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">Cargando productos...</div>;
  }

  return (
    <div className="space-y-6 animate-fade-in p-4 lg:p-6">
      <Tabs defaultValue="productos" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="productos">Productos</TabsTrigger>
          <TabsTrigger value="movimientos">Movimientos</TabsTrigger>
        </TabsList>

        <TabsContent value="productos" className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold mb-2">Gestión de Productos</h1>
              <p className="text-muted-foreground">Administra tu inventario de productos</p>
            </div>
            
            <Dialog open={isDialogOpen} onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (!open) resetForm();
            }}>
              <DialogTrigger asChild>
                <Button className="w-full sm:w-auto">
                  <Plus className="h-4 w-4 mr-2" />
                  Nuevo Producto
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingProduct ? 'Editar Producto' : 'Nuevo Producto'}</DialogTitle>
                  <DialogDescription>
                    {editingProduct ? 'Actualiza la información del producto' : 'Completa los datos del nuevo producto'}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nombre *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="barcode">Código de Barras *</Label>
                    <Input
                      id="barcode"
                      value={formData.barcode}
                      onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Categoría *</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => setFormData({ ...formData, category: value })}
                      required
                    >
                      <SelectTrigger id="category">
                        <SelectValue placeholder="Seleccionar categoría" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.values(ProductCategory).map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="cost">Costo S/ *</Label>
                      <Input
                        id="cost"
                        type="number"
                        step="0.01"
                        value={formData.cost}
                        onChange={(e) => setFormData({ ...formData, cost: parseFloat(e.target.value) })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="price">Precio S/ *</Label>
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="stock">Stock *</Label>
                      <Input
                        id="stock"
                        type="number"
                        value={formData.stock}
                        onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="minStock">Stock Mínimo *</Label>
                      <Input
                        id="minStock"
                        type="number"
                        value={formData.minStock}
                        onChange={(e) => setFormData({ ...formData, minStock: parseInt(e.target.value) })}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="supplier">Proveedor *</Label>
                    <Select
                      value={formData.supplier}
                      onValueChange={(value) => setFormData({ ...formData, supplier: value })}
                      required
                    >
                      <SelectTrigger id="supplier">
                        <SelectValue placeholder="Seleccionar proveedor" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.values(ProductSupplier).map((sup) => (
                          <SelectItem key={sup} value={sup}>
                            {sup}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Descripción</Label>
                    <Input
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Descripción del producto"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="image">URL de Imagen</Label>
                    <Input
                      id="image"
                      value={formData.image}
                      onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                      placeholder="https://ejemplo.com/imagen.jpg"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="wholesalePrice">Precio Mayoreo S/</Label>
                    <Input
                      id="wholesalePrice"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.wholesalePrice || ''}
                      onChange={(e) => setFormData({ ...formData, wholesalePrice: e.target.value === '' ? 0 : parseFloat(e.target.value) })}
                      placeholder="0.00"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pointsValue">Valor en Puntos</Label>
                    <Input
                      id="pointsValue"
                      type="number"
                      min="0"
                      value={formData.pointsValue || ''}
                      onChange={(e) => setFormData({ ...formData, pointsValue: e.target.value === '' ? 0 : parseInt(e.target.value) })}
                      placeholder="0"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="showInCatalog">Mostrar en Catálogo</Label>
                    <Input
                      id="showInCatalog"
                      type="checkbox"
                      checked={formData.showInCatalog}
                      onChange={(e) => setFormData({ ...formData, showInCatalog: e.target.checked })}
                      className="w-4 h-4"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="useInventory">Usa Inventario</Label>
                    <Input
                      id="useInventory"
                      type="checkbox"
                      checked={formData.useInventory}
                      onChange={(e) => setFormData({ ...formData, useInventory: e.target.checked })}
                      className="w-4 h-4"
                    />
                  </div>
                  <DialogFooter>
                    <Button type="submit" className="w-full">
                      {editingProduct ? 'Actualizar' : 'Crear Producto'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre, código o categoría..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="grid gap-4">
            {filteredProductos.map((producto) => (
              <Card key={producto.id} className="hover:shadow-lg transition-all">
                <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0">
                  <CardTitle className="flex items-center gap-3 text-lg">
                    <Package className="h-5 w-5 text-primary" />
                    {producto.name}
                  </CardTitle>
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Badge variant={producto.stock > producto.minStock ? "default" : "destructive"}>
                      Stock: {producto.stock}
                    </Badge>
                    <Button size="icon" variant="ghost" onClick={() => openMovementDialog(producto)}>
                      <ArrowUpDown className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => openEditDialog(producto)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => handleDelete(producto.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Categoría</p>
                      <p className="font-semibold">{producto.category}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Código</p>
                      <p className="font-semibold text-sm">{producto.barcode}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Costo</p>
                      <p className="font-semibold">S/ {producto.cost.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Precio</p>
                      <p className="font-semibold text-primary">S/ {producto.price.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Proveedor</p>
                      <p className="font-semibold">{producto.supplier}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="movimientos" className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold mb-2">Movimientos de Inventario</h2>
            <p className="text-muted-foreground">Historial de entradas, salidas y ajustes</p>
          </div>

          <div className="grid gap-4">
            {movimientos.slice(0, 50).map((mov) => (
              <Card key={mov.id}>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Fecha/Hora</p>
                      <p className="font-semibold text-sm">{new Date(mov.HORA).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Producto</p>
                      <p className="font-semibold text-sm">{mov.DESCRIPCION}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Tipo</p>
                      <Badge variant={mov.TIPO === 'entrada' ? 'default' : mov.TIPO === 'salida' ? 'destructive' : 'secondary'}>
                        {mov.TIPO.toUpperCase()}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Cantidad</p>
                      <p className="font-semibold">{mov.CANTIDAD}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Cajero</p>
                      <p className="font-semibold">{mov.CAJERO}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={isMovementDialogOpen} onOpenChange={(open) => {
        setIsMovementDialogOpen(open);
        if (!open) resetMovementForm();
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar Movimiento</DialogTitle>
            <DialogDescription>
              {selectedProduct?.name}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleMovementSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Tipo de Movimiento</Label>
              <Select value={movementData.type} onValueChange={(value: any) => setMovementData({ ...movementData, type: value })}>
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
              <Label htmlFor="quantity">Cantidad</Label>
              <Input
                id="quantity"
                type="number"
                value={movementData.quantity}
                onChange={(e) => setMovementData({ ...movementData, quantity: parseInt(e.target.value) })}
                required
                min="1"
              />
            </div>
            <DialogFooter>
              <Button type="submit" className="w-full">Registrar Movimiento</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
