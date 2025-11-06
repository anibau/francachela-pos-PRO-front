import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Gift, Calendar, Plus, Pencil, Trash2, Package } from "lucide-react";
import { toast } from "sonner";
import { promotionsAPI, combosAPI, productsAPI } from "@/services/api";
import type { Promotion, Combo, Product } from "@/types";

export default function Promociones() {
  const [promociones, setPromociones] = useState<Promotion[]>([]);
  const [combos, setCombos] = useState<Combo[]>([]);
  const [productos, setProductos] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPromoDialogOpen, setIsPromoDialogOpen] = useState(false);
  const [isComboDialogOpen, setIsComboDialogOpen] = useState(false);
  const [editingPromo, setEditingPromo] = useState<Promotion | null>(null);
  const [editingCombo, setEditingCombo] = useState<Combo | null>(null);
  const [currentPromoPage, setCurrentPromoPage] = useState(1);
  const [currentComboPage, setCurrentComboPage] = useState(1);
  const ITEMS_PER_PAGE = 10;
  
  const [promoFormData, setPromoFormData] = useState({
    name: '',
    description: '',
    type: 'percentage' as Promotion['type'],
    value: 0,
    startDate: '',
    endDate: '',
    active: true,
  });

  const [comboFormData, setComboFormData] = useState({
    name: '',
    description: '',
    originalPrice: 0,
    comboPrice: 0,
    active: true,
    products: [] as { productId: number; quantity: number }[],
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [promosData, combosData, productsData] = await Promise.all([
        promotionsAPI.getAll(),
        combosAPI.getAll(),
        productsAPI.getAll(),
      ]);
      setPromociones(promosData);
      setCombos(combosData);
      setProductos(productsData);
    } catch (error) {
      toast.error('Error al cargar datos');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePromoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingPromo) {
        await promotionsAPI.update(editingPromo.id, promoFormData);
        toast.success('Promoción actualizada correctamente');
      } else {
        await promotionsAPI.create(promoFormData as any);
        toast.success('Promoción creada correctamente');
      }
      
      setIsPromoDialogOpen(false);
      resetPromoForm();
      loadData();
    } catch (error) {
      toast.error('Error al guardar promoción');
    }
  };

  const handleComboSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingCombo) {
        await combosAPI.update(editingCombo.id, comboFormData);
        toast.success('Combo actualizado correctamente');
      } else {
        await combosAPI.create(comboFormData as any);
        toast.success('Combo creado correctamente');
      }
      
      setIsComboDialogOpen(false);
      resetComboForm();
      loadData();
    } catch (error) {
      toast.error('Error al guardar combo');
    }
  };

  const handleDeletePromo = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar esta promoción?')) return;
    
    try {
      await promotionsAPI.delete(id);
      toast.success('Promoción eliminada correctamente');
      loadData();
    } catch (error) {
      toast.error('Error al eliminar promoción');
    }
  };

  const handleDeleteCombo = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar este combo?')) return;
    
    try {
      await combosAPI.delete(id);
      toast.success('Combo eliminado correctamente');
      loadData();
    } catch (error) {
      toast.error('Error al eliminar combo');
    }
  };

  const openEditPromoDialog = (promo: Promotion) => {
    setEditingPromo(promo);
    setPromoFormData({
      name: promo.name,
      description: promo.description,
      type: promo.type,
      value: promo.value,
      startDate: promo.startDate,
      endDate: promo.endDate,
      active: promo.active,
    });
    setIsPromoDialogOpen(true);
  };

  const openEditComboDialog = (combo: Combo) => {
    setEditingCombo(combo);
    setComboFormData({
      name: combo.name,
      description: combo.description,
      originalPrice: combo.originalPrice,
      comboPrice: combo.comboPrice,
      active: combo.active,
      products: combo.products,
    });
    setIsComboDialogOpen(true);
  };

  const resetPromoForm = () => {
    setEditingPromo(null);
    setPromoFormData({
      name: '',
      description: '',
      type: 'percentage',
      value: 0,
      startDate: '',
      endDate: '',
      active: true,
    });
  };

  const resetComboForm = () => {
    setEditingCombo(null);
    setComboFormData({
      name: '',
      description: '',
      originalPrice: 0,
      comboPrice: 0,
      active: true,
      products: [],
    });
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">Cargando...</div>;
  }

  return (
    <div className="space-y-6 animate-fade-in p-4 lg:p-6">
      <Tabs defaultValue="promociones" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="promociones">Promociones</TabsTrigger>
          <TabsTrigger value="combos">Combos</TabsTrigger>
        </TabsList>

        <TabsContent value="promociones" className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold mb-2">Promociones</h1>
              <p className="text-muted-foreground">Gestiona las ofertas especiales de tu tienda</p>
            </div>
            
            <Dialog open={isPromoDialogOpen} onOpenChange={(open) => {
              setIsPromoDialogOpen(open);
              if (!open) resetPromoForm();
            }}>
              <DialogTrigger asChild>
                <Button className="w-full sm:w-auto">
                  <Plus className="h-4 w-4 mr-2" />
                  Nueva Promoción
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingPromo ? 'Editar Promoción' : 'Nueva Promoción'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handlePromoSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="promoName">Nombre *</Label>
                    <Input
                      id="promoName"
                      value={promoFormData.name}
                      onChange={(e) => setPromoFormData({ ...promoFormData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="promoDesc">Descripción *</Label>
                    <Textarea
                      id="promoDesc"
                      value={promoFormData.description}
                      onChange={(e) => setPromoFormData({ ...promoFormData, description: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Tipo</Label>
                    <Select value={promoFormData.type} onValueChange={(value: any) => setPromoFormData({ ...promoFormData, type: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percentage">Porcentaje</SelectItem>
                        <SelectItem value="fixed">Monto Fijo</SelectItem>
                        <SelectItem value="2x1">2x1</SelectItem>
                        <SelectItem value="3x2">3x2</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="promoValue">Valor</Label>
                    <Input
                      id="promoValue"
                      type="number"
                      step="0.01"
                      value={promoFormData.value}
                      onChange={(e) => setPromoFormData({ ...promoFormData, value: parseFloat(e.target.value) })}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="startDate">Inicio</Label>
                      <Input
                        id="startDate"
                        type="date"
                        value={promoFormData.startDate}
                        onChange={(e) => setPromoFormData({ ...promoFormData, startDate: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="endDate">Fin</Label>
                      <Input
                        id="endDate"
                        type="date"
                        value={promoFormData.endDate}
                        onChange={(e) => setPromoFormData({ ...promoFormData, endDate: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="promoActive">Activa</Label>
                    <Switch
                      id="promoActive"
                      checked={promoFormData.active}
                      onCheckedChange={(checked) => setPromoFormData({ ...promoFormData, active: checked })}
                    />
                  </div>
                  <DialogFooter>
                    <Button type="submit" className="w-full">
                      {editingPromo ? 'Actualizar' : 'Crear Promoción'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4">
            {promociones
              .slice((currentPromoPage - 1) * ITEMS_PER_PAGE, currentPromoPage * ITEMS_PER_PAGE)
              .map((promo) => (
              <Card key={promo.id} className="hover:shadow-lg transition-all">
                <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0">
                  <CardTitle className="flex items-center gap-3 text-lg">
                    <Gift className="h-5 w-5 text-success" />
                    {promo.name}
                  </CardTitle>
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Badge variant={promo.active ? "default" : "secondary"}>
                      {promo.active ? "Activa" : "Inactiva"}
                    </Badge>
                    <Button size="icon" variant="ghost" onClick={() => openEditPromoDialog(promo)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => handleDeletePromo(promo.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-3">{promo.description}</p>
                  <div className="flex flex-wrap items-center gap-4 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      {new Date(promo.startDate).toLocaleDateString()} - {new Date(promo.endDate).toLocaleDateString()}
                    </div>
                    <Badge variant="outline">{promo.type.toUpperCase()}</Badge>
                    <span className="font-semibold">{promo.value}{promo.type === 'percentage' ? '%' : ' soles'}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {promociones.length > ITEMS_PER_PAGE && (
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => setCurrentPromoPage(p => Math.max(1, p - 1))}
                    className={currentPromoPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  />
                </PaginationItem>
                {Array.from({ length: Math.ceil(promociones.length / ITEMS_PER_PAGE) }, (_, i) => i + 1).map(page => (
                  <PaginationItem key={page}>
                    <PaginationLink
                      onClick={() => setCurrentPromoPage(page)}
                      isActive={currentPromoPage === page}
                      className="cursor-pointer"
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext 
                    onClick={() => setCurrentPromoPage(p => Math.min(Math.ceil(promociones.length / ITEMS_PER_PAGE), p + 1))}
                    className={currentPromoPage >= Math.ceil(promociones.length / ITEMS_PER_PAGE) ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </TabsContent>

        <TabsContent value="combos" className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold mb-2">Combos</h1>
              <p className="text-muted-foreground">Crea paquetes especiales de productos</p>
            </div>
            
            <Dialog open={isComboDialogOpen} onOpenChange={(open) => {
              setIsComboDialogOpen(open);
              if (!open) resetComboForm();
            }}>
              <DialogTrigger asChild>
                <Button className="w-full sm:w-auto">
                  <Plus className="h-4 w-4 mr-2" />
                  Nuevo Combo
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingCombo ? 'Editar Combo' : 'Nuevo Combo'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleComboSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="comboName">Nombre *</Label>
                    <Input
                      id="comboName"
                      value={comboFormData.name}
                      onChange={(e) => setComboFormData({ ...comboFormData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="comboDesc">Descripción *</Label>
                    <Textarea
                      id="comboDesc"
                      value={comboFormData.description}
                      onChange={(e) => setComboFormData({ ...comboFormData, description: e.target.value })}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="originalPrice">Precio Original S/</Label>
                      <Input
                        id="originalPrice"
                        type="number"
                        step="0.01"
                        value={comboFormData.originalPrice}
                        onChange={(e) => setComboFormData({ ...comboFormData, originalPrice: parseFloat(e.target.value) })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="comboPrice">Precio Combo S/</Label>
                      <Input
                        id="comboPrice"
                        type="number"
                        step="0.01"
                        value={comboFormData.comboPrice}
                        onChange={(e) => setComboFormData({ ...comboFormData, comboPrice: parseFloat(e.target.value) })}
                        required
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="comboActive">Activo</Label>
                    <Switch
                      id="comboActive"
                      checked={comboFormData.active}
                      onCheckedChange={(checked) => setComboFormData({ ...comboFormData, active: checked })}
                    />
                  </div>
                  <DialogFooter>
                    <Button type="submit" className="w-full">
                      {editingCombo ? 'Actualizar' : 'Crear Combo'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4">
            {combos
              .slice((currentComboPage - 1) * ITEMS_PER_PAGE, currentComboPage * ITEMS_PER_PAGE)
              .map((combo) => (
              <Card key={combo.id} className="hover:shadow-lg transition-all">
                <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0">
                  <CardTitle className="flex items-center gap-3 text-lg">
                    <Package className="h-5 w-5 text-primary" />
                    {combo.name}
                  </CardTitle>
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Badge variant={combo.active ? "default" : "secondary"}>
                      {combo.active ? "Activo" : "Inactivo"}
                    </Badge>
                    <Button size="icon" variant="ghost" onClick={() => openEditComboDialog(combo)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => handleDeleteCombo(combo.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-3">{combo.description}</p>
                  <div className="flex flex-wrap items-center gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Precio Original</p>
                      <p className="font-semibold line-through">S/ {combo.originalPrice.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Precio Combo</p>
                      <p className="text-xl font-bold text-primary">S/ {combo.comboPrice.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Ahorro</p>
                      <p className="font-semibold text-success">S/ {(combo.originalPrice - combo.comboPrice).toFixed(2)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {combos.length > ITEMS_PER_PAGE && (
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => setCurrentComboPage(p => Math.max(1, p - 1))}
                    className={currentComboPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  />
                </PaginationItem>
                {Array.from({ length: Math.ceil(combos.length / ITEMS_PER_PAGE) }, (_, i) => i + 1).map(page => (
                  <PaginationItem key={page}>
                    <PaginationLink
                      onClick={() => setCurrentComboPage(page)}
                      isActive={currentComboPage === page}
                      className="cursor-pointer"
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext 
                    onClick={() => setCurrentComboPage(p => Math.min(Math.ceil(combos.length / ITEMS_PER_PAGE), p + 1))}
                    className={currentComboPage >= Math.ceil(combos.length / ITEMS_PER_PAGE) ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
