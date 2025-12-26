import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MoneyInput } from "@/components/ui/money-input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { 
  Package, 
  TrendingUp, 
  TrendingDown, 
  Settings, 
  AlertCircle,
  Info,
  User,
  Building
} from "lucide-react";
import { toast } from "sonner";
import { inventoryMovementService, MovimientoEntrada, MovimientoAjuste, MovimientoVenta } from '@/services/inventoryMovementService';
import { ProductSupplier } from '@/types';

interface Product {
  id: number;
  codigoBarra: string;
  productoDescripcion: string;
  cantidadActual: number;
  precio: number;
  costo: number;
  proveedor?: string;
}

interface InventoryMovementDialogProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onSuccess: () => void;
}

type MovementType = 'entrada' | 'ajuste' | 'venta';

interface MovementFormData {
  type: MovementType;
  cantidad: number;
  nuevaCantidad: number;
  costo: number;
  precioVenta: number;
  cajero: string;
  proveedor: string;
}

export default function InventoryMovementDialog({ 
  isOpen, 
  onClose, 
  product, 
  onSuccess 
}: InventoryMovementDialogProps) {
  const [formData, setFormData] = useState<MovementFormData>({
    type: 'entrada',
    cantidad: 1,
    nuevaCantidad: 0,
    costo: 0,
    precioVenta: 0,
    cajero: '',
    proveedor: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Resetear formulario cuando se abre el diálogo
  useEffect(() => {
    if (isOpen && product) {
      setFormData({
        type: 'entrada',
        cantidad: 1,
        nuevaCantidad: product.cantidadActual,
        costo: product.costo || 0,
        precioVenta: product.precio || 0,
        cajero: localStorage.getItem('user_name') || 'admin',
        proveedor: product.proveedor || '',
      });
      setErrors({});
    }
  }, [isOpen, product]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.cajero.trim()) {
      newErrors.cajero = 'El cajero es requerido';
    }

    if (formData.type === 'entrada') {
      if (formData.cantidad <= 0) {
        newErrors.cantidad = 'La cantidad debe ser mayor a 0';
      }
      if (formData.costo <= 0) {
        newErrors.costo = 'El costo debe ser mayor a 0';
      }
      if (formData.precioVenta <= 0) {
        newErrors.precioVenta = 'El precio de venta debe ser mayor a 0';
      }
      if (!formData.proveedor.trim()) {
        newErrors.proveedor = 'El proveedor es requerido para entradas';
      }
    } else if (formData.type === 'ajuste') {
      if (formData.nuevaCantidad < 0) {
        newErrors.nuevaCantidad = 'La nueva cantidad no puede ser negativa';
      }
      if (formData.costo <= 0) {
        newErrors.costo = 'El costo debe ser mayor a 0';
      }
      if (formData.precioVenta <= 0) {
        newErrors.precioVenta = 'El precio de venta debe ser mayor a 0';
      }
    } else if (formData.type === 'venta') {
      if (formData.cantidad <= 0) {
        newErrors.cantidad = 'La cantidad debe ser mayor a 0';
      }
      if (product && formData.cantidad > product.cantidadActual) {
        newErrors.cantidad = `No hay suficiente stock. Disponible: ${product.cantidadActual}`;
      }
      if (formData.precioVenta <= 0) {
        newErrors.precioVenta = 'El precio de venta debe ser mayor a 0';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!product || !validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      let response;
      
      if (formData.type === 'entrada') {
        const movimiento: MovimientoEntrada = {
          codigoBarra: product.codigoBarra,
          cantidad: formData.cantidad,
          costo: formData.costo,
          precioVenta: formData.precioVenta,
          cajero: formData.cajero,
          proveedor: formData.proveedor,
        };
        response = await inventoryMovementService.registrarEntrada(movimiento);
      } else if (formData.type === 'ajuste') {
        const movimiento: MovimientoAjuste = {
          codigoBarra: product.codigoBarra,
          nuevaCantidad: formData.nuevaCantidad,
          costo: formData.costo,
          precioVenta: formData.precioVenta,
          cajero: formData.cajero,
        };
        response = await inventoryMovementService.registrarAjuste(movimiento);
      } else if (formData.type === 'venta') {
        const movimiento: MovimientoVenta = {
          codigoBarra: product.codigoBarra,
          cantidad: formData.cantidad,
          precioVenta: formData.precioVenta,
          cajero: formData.cajero,
        };
        response = await inventoryMovementService.registrarVenta(movimiento);
      }

      toast.success(`Movimiento de ${formData.type} registrado correctamente`);
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error al registrar movimiento:', error);
      toast.error(error instanceof Error ? error.message : 'Error al registrar movimiento');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getMovementIcon = (type: MovementType) => {
    switch (type) {
      case 'entrada': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'ajuste': return <Settings className="h-4 w-4 text-blue-600" />;
      case 'venta': return <TrendingDown className="h-4 w-4 text-red-600" />;
    }
  };

  const getMovementColor = (type: MovementType) => {
    switch (type) {
      case 'entrada': return 'text-green-600';
      case 'ajuste': return 'text-blue-600';
      case 'venta': return 'text-red-600';
    }
  };

  if (!product) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Registrar Movimiento de Inventario
          </DialogTitle>
          <DialogDescription>
            <div className="space-y-2">
              <div className="font-medium">{product.productoDescripcion}</div>
              <div className="flex items-center gap-2 text-sm">
                <Badge variant="outline">Stock actual: {product.cantidadActual}</Badge>
                <Badge variant="outline">Código: {product.codigoBarra}</Badge>
              </div>
            </div>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Tipo de Movimiento */}
          <div className="space-y-2">
            <Label>Tipo de Movimiento</Label>
            <Select 
              value={formData.type} 
              onValueChange={(value: MovementType) => setFormData({ ...formData, type: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="entrada">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    Entrada (Compra/Recepción)
                  </div>
                </SelectItem>
                <SelectItem value="ajuste">
                  <div className="flex items-center gap-2">
                    <Settings className="h-4 w-4 text-blue-600" />
                    Ajuste (Corrección de stock)
                  </div>
                </SelectItem>
                <SelectItem value="venta">
                  <div className="flex items-center gap-2">
                    <TrendingDown className="h-4 w-4 text-red-600" />
                    Venta (Salida manual)
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Información del movimiento */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription className={getMovementColor(formData.type)}>
              {formData.type === 'entrada' && 'Aumentará el stock del producto'}
              {formData.type === 'ajuste' && 'Establecerá el stock a la cantidad especificada'}
              {formData.type === 'venta' && 'Reducirá el stock del producto'}
            </AlertDescription>
          </Alert>

          {/* Campos específicos por tipo */}
          {formData.type === 'entrada' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="cantidad">Cantidad a Ingresar *</Label>
                <Input
                  id="cantidad"
                  type="number"
                  min="1"
                  value={formData.cantidad || ''}
                  onChange={(e) => setFormData({ ...formData, cantidad: parseInt(e.target.value) || 0 })}
                  className={errors.cantidad ? 'border-destructive' : ''}
                />
                {errors.cantidad && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.cantidad}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="proveedor">Proveedor *</Label>
                <Select
                  value={formData.proveedor}
                  onValueChange={(value) => setFormData({ ...formData, proveedor: value })}
                >
                  <SelectTrigger className={errors.proveedor ? 'border-destructive' : ''}>
                    <SelectValue placeholder="Seleccionar proveedor" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(ProductSupplier).map((supplier) => (
                      <SelectItem key={supplier} value={supplier}>
                        <div className="flex items-center gap-2">
                          <Building className="h-4 w-4" />
                          {supplier}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.proveedor && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.proveedor}
                  </p>
                )}
              </div>
            </>
          )}

          {formData.type === 'ajuste' && (
            <div className="space-y-2">
              <Label htmlFor="nuevaCantidad">Nueva Cantidad Total *</Label>
              <Input
                id="nuevaCantidad"
                type="number"
                min="0"
                value={formData.nuevaCantidad || ''}
                onChange={(e) => setFormData({ ...formData, nuevaCantidad: parseInt(e.target.value) || 0 })}
                className={errors.nuevaCantidad ? 'border-destructive' : ''}
              />
              {errors.nuevaCantidad && (
                <p className="text-xs text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.nuevaCantidad}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                Stock actual: {product.cantidadActual} → Nuevo stock: {formData.nuevaCantidad}
              </p>
            </div>
          )}

          {formData.type === 'venta' && (
            <div className="space-y-2">
              <Label htmlFor="cantidadVenta">Cantidad a Vender *</Label>
              <Input
                id="cantidadVenta"
                type="number"
                min="1"
                max={product.cantidadActual}
                value={formData.cantidad || ''}
                onChange={(e) => setFormData({ ...formData, cantidad: parseInt(e.target.value) || 0 })}
                className={errors.cantidad ? 'border-destructive' : ''}
              />
              {errors.cantidad && (
                <p className="text-xs text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.cantidad}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                Stock disponible: {product.cantidadActual}
              </p>
            </div>
          )}

          {/* Campos comunes */}
          {(formData.type === 'entrada' || formData.type === 'ajuste') && (
            <MoneyInput
              id="costo"
              label="Costo Unitario S/ *"
              value={formData.costo}
              onChange={(value) => setFormData({ ...formData, costo: value })}
              placeholder="0.00"
              error={errors.costo}
            />
          )}

          <MoneyInput
            id="precioVenta"
            label="Precio de Venta S/ *"
            value={formData.precioVenta}
            onChange={(value) => setFormData({ ...formData, precioVenta: value })}
            placeholder="0.00"
            error={errors.precioVenta}
          />

          <div className="space-y-2">
            <Label htmlFor="cajero">Cajero/Usuario *</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="cajero"
                value={formData.cajero}
                onChange={(e) => setFormData({ ...formData, cajero: e.target.value })}
                className={`pl-10 ${errors.cajero ? 'border-destructive' : ''}`}
                placeholder="Nombre del cajero"
              />
            </div>
            {errors.cajero && (
              <p className="text-xs text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.cajero}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="flex items-center gap-2"
            >
              {getMovementIcon(formData.type)}
              {isSubmitting ? 'Registrando...' : `Registrar ${formData.type}`}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
