import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { MoneyInput } from "@/components/ui/money-input";
import { Gift, Calendar, Plus, Pencil, Trash2, Package, X, Tag, Percent, DollarSign } from "lucide-react";
import { toast } from "sonner";
import { unifiedPromotionsService, TipoPromocion, TipoDescuento } from "@/services/unifiedPromotionsService";
import { productsService } from "@/services/productsService";
import type { UnifiedPromotion, CreateUnifiedPromotionRequest, Product } from "@/types";

export default function PromocionesUnificadas() {
  const [promociones, setPromociones] = useState<UnifiedPromotion[]>([]);
  const [productos, setProductos] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<UnifiedPromotion | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Estados del formulario
  const [formData, setFormData] = useState<CreateUnifiedPromotionRequest>({
    nombre: '',
    descripcion: '',
    tipoPromocion: TipoPromocion.SIMPLE,
    tipoDescuento: TipoDescuento.PORCENTAJE,
    descuento: 0,
    precioCombo: undefined,
    fechaInicio: '',
    fechaFin: '',
    maxUsos: 100,
    activo: true,
    puntosExtra: 0,
    productosAplicables: []
  });

  // Estados para productos seleccionados
  const [selectedProducts, setSelectedProducts] = useState<{
    productoId: number;
    cantidadExacta?: number;
    cantidadMinima?: number;
    obligatorio?: boolean;
  }[]>([]);

  // Cargar datos iniciales
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [promocionesData, productosData] = await Promise.all([
        unifiedPromotionsService.getAll(),
        productsService.getAll()
      ]);
      setPromociones(promocionesData);
      setProductos(productosData);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Error al cargar datos');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      nombre: '',
      descripcion: '',
      tipoPromocion: TipoPromocion.SIMPLE,
      tipoDescuento: TipoDescuento.PORCENTAJE,
      descuento: 0,
      precioCombo: undefined,
      fechaInicio: '',
      fechaFin: '',
      maxUsos: 100,
      activo: true,
      puntosExtra: 0,
      productosAplicables: []
    });
    setSelectedProducts([]);
    setEditingPromotion(null);
  };

  const openCreateDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const openEditDialog = (promotion: UnifiedPromotion) => {
    setEditingPromotion(promotion);
    setFormData({
      nombre: promotion.nombre,
      descripcion: promotion.descripcion,
      tipoPromocion: promotion.tipoPromocion,
      tipoDescuento: promotion.tipoDescuento,
      descuento: parseFloat(promotion.descuento),
      precioCombo: promotion.precioCombo ? parseFloat(promotion.precioCombo) : undefined,
      fechaInicio: promotion.fechaInicio.split('T')[0],
      fechaFin: promotion.fechaFin.split('T')[0],
      maxUsos: promotion.maxUsos,
      activo: promotion.activo,
      puntosExtra: promotion.puntosExtra || 0,
      productosAplicables: promotion.productos.map(p => ({
        productoId: p.productoId,
        cantidadExacta: p.cantidadExacta,
        cantidadMinima: p.cantidadMinima,
        obligatorio: p.obligatorio
      }))
    });
    setSelectedProducts(promotion.productos.map(p => ({
      productoId: p.productoId,
      cantidadExacta: p.cantidadExacta,
      cantidadMinima: p.cantidadMinima,
      obligatorio: p.obligatorio
    })));
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const submitData = {
        ...formData,
        productosAplicables: selectedProducts
      };

      if (editingPromotion) {
        await unifiedPromotionsService.update(editingPromotion.id, submitData);
        toast.success('Promoción actualizada correctamente');
      } else {
        await unifiedPromotionsService.create(submitData);
        toast.success('Promoción creada correctamente');
      }

      setIsDialogOpen(false);
      loadData();
    } catch (error) {
      console.error('Error saving promotion:', error);
      toast.error('Error al guardar promoción');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar esta promoción?')) return;

    try {
      await unifiedPromotionsService.delete(id);
      toast.success('Promoción eliminada correctamente');
      loadData();
    } catch (error) {
      console.error('Error deleting promotion:', error);
      toast.error('Error al eliminar promoción');
    }
  };

  const toggleActive = async (promotion: UnifiedPromotion) => {
    try {
      if (promotion.activo) {
        await unifiedPromotionsService.deactivate(promotion.id);
        toast.success('Promoción desactivada');
      } else {
        await unifiedPromotionsService.activate(promotion.id);
        toast.success('Promoción activada');
      }
      loadData();
    } catch (error) {
      console.error('Error toggling promotion status:', error);
      toast.error('Error al cambiar estado de promoción');
    }
  };

  const addProduct = () => {
    setSelectedProducts([...selectedProducts, {
      productoId: 0,
      cantidadExacta: 1,
      cantidadMinima: 1,
      obligatorio: true
    }]);
  };

  const removeProduct = (index: number) => {
    setSelectedProducts(selectedProducts.filter((_, i) => i !== index));
  };

  const updateProduct = (index: number, field: string, value: any) => {
    const updated = [...selectedProducts];
    updated[index] = { ...updated[index], [field]: value };
    setSelectedProducts(updated);
  };

  const getProductName = (productId: number) => {
    const product = productos.find(p => p.id === productId);
    return product ? product.productoDescripcion : 'Producto no encontrado';
  };

  const getTipoPromocionIcon = (tipo: TipoPromocion) => {
    switch (tipo) {
      case TipoPromocion.SIMPLE: return <Tag className="h-4 w-4" />;
      case TipoPromocion.PACK: return <Package className="h-4 w-4" />;
      case TipoPromocion.COMBO: return <Gift className="h-4 w-4" />;
    }
  };

  const getTipoDescuentoIcon = (tipo: TipoDescuento) => {
    switch (tipo) {
      case TipoDescuento.PORCENTAJE: return <Percent className="h-4 w-4" />;
      case TipoDescuento.MONTO_FIJO: return <DollarSign className="h-4 w-4" />;
      case TipoDescuento.PRECIO_FIJO: return <DollarSign className="h-4 w-4" />;
    }
  };

  const formatDescuento = (promotion: UnifiedPromotion) => {
    const valor = parseFloat(promotion.descuento);
    switch (promotion.tipoDescuento) {
      case TipoDescuento.PORCENTAJE:
        return `${valor}%`;
      case TipoDescuento.MONTO_FIJO:
        return `S/ ${valor.toFixed(2)}`;
      case TipoDescuento.PRECIO_FIJO:
        return promotion.precioCombo ? `S/ ${parseFloat(promotion.precioCombo).toFixed(2)}` : `S/ ${valor.toFixed(2)}`;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Cargando promociones...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Promociones Unificadas</h1>
          <p className="text-muted-foreground">
            Gestiona promociones, packs y combos desde un solo lugar
          </p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="h-4 w-4 mr-2" />
          Nueva Promoción
        </Button>
      </div>

      {/* Lista de promociones */}
      <div className="grid gap-4">
        {promociones.map((promotion) => (
          <Card key={promotion.id} className={`${!promotion.activo ? 'opacity-60' : ''}`}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getTipoPromocionIcon(promotion.tipoPromocion)}
                  <div>
                    <CardTitle className="text-lg">{promotion.nombre}</CardTitle>
                    <p className="text-sm text-muted-foreground">{promotion.descripcion}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={promotion.activo ? "default" : "secondary"}>
                    {promotion.activo ? 'Activa' : 'Inactiva'}
                  </Badge>
                  <Badge variant="outline" className="flex items-center gap-1">
                    {getTipoDescuentoIcon(promotion.tipoDescuento)}
                    {formatDescuento(promotion)}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {new Date(promotion.fechaInicio).toLocaleDateString()} - {new Date(promotion.fechaFin).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Usos: {promotion.usosActuales} / {promotion.maxUsos}
                  </div>
                  {promotion.puntosExtra && (
                    <div className="text-sm text-muted-foreground">
                      Puntos extra: {promotion.puntosExtra}
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleActive(promotion)}
                  >
                    {promotion.activo ? 'Desactivar' : 'Activar'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditDialog(promotion)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(promotion.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              {/* Productos aplicables */}
              {promotion.productos.length > 0 && (
                <div className="mt-4 pt-4 border-t">
                  <h4 className="text-sm font-medium mb-2">Productos aplicables:</h4>
                  <div className="flex flex-wrap gap-2">
                    {promotion.productos.map((producto, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {getProductName(producto.productoId)}
                        {producto.cantidadExacta && ` (x${producto.cantidadExacta})`}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Dialog para crear/editar promoción */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingPromotion ? 'Editar Promoción' : 'Nueva Promoción'}
            </DialogTitle>
            <DialogDescription>
              Configura los detalles de la promoción unificada
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Información básica */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre</Label>
                <Input
                  id="nombre"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tipoPromocion">Tipo de Promoción</Label>
                <Select
                  value={formData.tipoPromocion}
                  onValueChange={(value: TipoPromocion) => setFormData({ ...formData, tipoPromocion: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={TipoPromocion.SIMPLE}>
                      <div className="flex items-center gap-2">
                        <Tag className="h-4 w-4" />
                        Simple - Descuento individual
                      </div>
                    </SelectItem>
                    <SelectItem value={TipoPromocion.PACK}>
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4" />
                        Pack - Descuento por cantidad
                      </div>
                    </SelectItem>
                    <SelectItem value={TipoPromocion.COMBO}>
                      <div className="flex items-center gap-2">
                        <Gift className="h-4 w-4" />
                        Combo - Precio fijo conjunto
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="descripcion">Descripción</Label>
              <Textarea
                id="descripcion"
                value={formData.descripcion}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                required
              />
            </div>

            {/* Configuración de descuento */}
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tipoDescuento">Tipo de Descuento</Label>
                <Select
                  value={formData.tipoDescuento}
                  onValueChange={(value: TipoDescuento) => setFormData({ ...formData, tipoDescuento: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={TipoDescuento.PORCENTAJE}>
                      <div className="flex items-center gap-2">
                        <Percent className="h-4 w-4" />
                        Porcentaje
                      </div>
                    </SelectItem>
                    <SelectItem value={TipoDescuento.MONTO_FIJO}>
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        Monto Fijo
                      </div>
                    </SelectItem>
                    <SelectItem value={TipoDescuento.PRECIO_FIJO}>
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        Precio Fijo
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="descuento">
                  {formData.tipoDescuento === TipoDescuento.PORCENTAJE ? 'Descuento (%)' : 'Descuento (S/)'}
                </Label>
                <MoneyInput
                  value={formData.descuento}
                  onChange={(value) => setFormData({ ...formData, descuento: value })}
                  placeholder={formData.tipoDescuento === TipoDescuento.PORCENTAJE ? "15" : "5.00"}
                />
              </div>
              {(formData.tipoPromocion === TipoPromocion.COMBO || formData.tipoDescuento === TipoDescuento.PRECIO_FIJO) && (
                <div className="space-y-2">
                  <Label htmlFor="precioCombo">Precio Combo (S/)</Label>
                  <MoneyInput
                    value={formData.precioCombo || 0}
                    onChange={(value) => setFormData({ ...formData, precioCombo: value })}
                    placeholder="35.00"
                  />
                </div>
              )}
            </div>

            {/* Fechas y configuración */}
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fechaInicio">Fecha Inicio</Label>
                <Input
                  id="fechaInicio"
                  type="date"
                  value={formData.fechaInicio}
                  onChange={(e) => setFormData({ ...formData, fechaInicio: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fechaFin">Fecha Fin</Label>
                <Input
                  id="fechaFin"
                  type="date"
                  value={formData.fechaFin}
                  onChange={(e) => setFormData({ ...formData, fechaFin: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxUsos">Máximo Usos</Label>
                <Input
                  id="maxUsos"
                  type="number"
                  value={formData.maxUsos}
                  onChange={(e) => setFormData({ ...formData, maxUsos: parseInt(e.target.value) })}
                  min="1"
                  required
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="puntosExtra">Puntos Extra</Label>
                <Input
                  id="puntosExtra"
                  type="number"
                  value={formData.puntosExtra}
                  onChange={(e) => setFormData({ ...formData, puntosExtra: parseInt(e.target.value) })}
                  min="0"
                />
              </div>
              <div className="flex items-center space-x-2 pt-6">
                <Switch
                  id="activo"
                  checked={formData.activo}
                  onCheckedChange={(checked) => setFormData({ ...formData, activo: checked })}
                />
                <Label htmlFor="activo">Promoción activa</Label>
              </div>
            </div>

            {/* Productos aplicables */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Productos Aplicables</Label>
                <Button type="button" variant="outline" size="sm" onClick={addProduct}>
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Producto
                </Button>
              </div>
              
              {selectedProducts.map((product, index) => (
                <div key={index} className="grid md:grid-cols-4 gap-2 items-end p-3 border rounded-lg">
                  <div className="space-y-2">
                    <Label>Producto</Label>
                    <Select
                      value={product.productoId.toString()}
                      onValueChange={(value) => updateProduct(index, 'productoId', parseInt(value))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar producto" />
                      </SelectTrigger>
                      <SelectContent>
                        {productos.map((prod) => (
                          <SelectItem key={prod.id} value={prod.id.toString()}>
                            {prod.productoDescripcion}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {formData.tipoPromocion === TipoPromocion.PACK && (
                    <div className="space-y-2">
                      <Label>Cantidad Exacta</Label>
                      <Input
                        type="number"
                        value={product.cantidadExacta || 1}
                        onChange={(e) => updateProduct(index, 'cantidadExacta', parseInt(e.target.value))}
                        min="1"
                      />
                    </div>
                  )}
                  
                  {formData.tipoPromocion === TipoPromocion.SIMPLE && (
                    <div className="space-y-2">
                      <Label>Cantidad Mínima</Label>
                      <Input
                        type="number"
                        value={product.cantidadMinima || 1}
                        onChange={(e) => updateProduct(index, 'cantidadMinima', parseInt(e.target.value))}
                        min="1"
                      />
                    </div>
                  )}
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={product.obligatorio ?? true}
                      onCheckedChange={(checked) => updateProduct(index, 'obligatorio', checked)}
                    />
                    <Label className="text-sm">Obligatorio</Label>
                  </div>
                  
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => removeProduct(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Guardando...' : editingPromotion ? 'Actualizar' : 'Crear'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

