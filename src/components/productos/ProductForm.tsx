import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MoneyInput } from "@/components/ui/money-input";
import { AlertCircle, Check, Plus } from "lucide-react";
import { toast } from "sonner";
import { productsService } from '@/services/productsService';
import { validateProductName, validateBarcode, validatePrice, validateQuantity } from '@/utils/validators';
import type { Product } from "@/types";

interface ProductValidationErrors {
  productoDescripcion?: string;
  codigoBarra?: string;
  categoria?: string;
  precio?: string;
  costo?: string;
  precioMayoreo?: string;
  cantidadActual?: string;
  cantidadMinima?: string;
  proveedor?: string;
}

interface ProductFormProps {
  isOpen: boolean;
  onClose: () => void;
  editingProduct: Product | null;
  onSubmit: (formData: any) => void;
  isSubmitting?: boolean;
}

export const ProductForm: React.FC<ProductFormProps> = ({
  isOpen,
  onClose,
  editingProduct,
  onSubmit,
  isSubmitting = false
}) => {
  // Estados del formulario
  const [formData, setFormData] = useState({
    productoDescripcion: '',
    codigoBarra: '',
    categoria: '',
    precio: 0,
    costo: 0,
    cantidadActual: 0,
    cantidadMinima: 0,
    proveedor: '',
    imagen: '',
    precioMayoreo: 0,
    valorPuntos: 0,
    mostrar: true,
    usaInventario: true,
  });

  // Estados para selectores dinámicos
  const [categoriasDisponibles, setCategoriasDisponibles] = useState<string[]>([]);
  const [proveedoresDisponibles, setProveedoresDisponibles] = useState<string[]>([]);
  const [isLoadingCategorias, setIsLoadingCategorias] = useState(false);
  const [isLoadingProveedores, setIsLoadingProveedores] = useState(false);
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
  const [showNewSupplierInput, setShowNewSupplierInput] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newSupplierName, setNewSupplierName] = useState('');

  // Estados de validación
  const [validationErrors, setValidationErrors] = useState<ProductValidationErrors>({});
  const [hasChanges, setHasChanges] = useState(false);

  // Cargar categorías disponibles
  const loadCategorias = async () => {
    setIsLoadingCategorias(true);
    try {
      const categories = await productsService.getCategories();
      setCategoriasDisponibles(categories);
    } catch (error) {
      console.error('Error loading categories:', error);
      toast.error('Error al cargar categorías');
    } finally {
      setIsLoadingCategorias(false);
    }
  };

  // Cargar proveedores disponibles
  const loadProveedores = async () => {
    setIsLoadingProveedores(true);
    try {
      const suppliers = await productsService.getSuppliers();
      setProveedoresDisponibles(suppliers);
    } catch (error) {
      console.error('Error loading suppliers:', error);
      toast.error('Error al cargar proveedores');
    } finally {
      setIsLoadingProveedores(false);
    }
  };

  // Cargar datos al abrir el diálogo
  useEffect(() => {
    if (isOpen) {
      loadCategorias();
      loadProveedores();
      
      if (editingProduct) {
        setFormData({
          productoDescripcion: editingProduct.productoDescripcion || '',
          codigoBarra: editingProduct.codigoBarra || '',
          categoria: editingProduct.categoria || '',
          precio: editingProduct.precio || 0,
          costo: editingProduct.costo || 0,
          cantidadActual: editingProduct.cantidadActual || 0,
          cantidadMinima: editingProduct.cantidadMinima || 0,
          proveedor: editingProduct.proveedor || '',
          imagen: editingProduct.imagen || '',
          precioMayoreo: editingProduct.precioMayoreo || 0,
          valorPuntos: editingProduct.valorPuntos || 0,
          mostrar: editingProduct.mostrar ?? true,
          usaInventario: editingProduct.usaInventario ?? true,
        });
        
        // Validar que el proveedor del producto esté en la lista de proveedores disponibles
        if (editingProduct.proveedor && !proveedoresDisponibles.includes(editingProduct.proveedor)) {
          setProveedoresDisponibles(prev => [...prev, editingProduct.proveedor]);
        }
      } else {
        resetForm();
      }
    }
  }, [isOpen, editingProduct]);

  const resetForm = () => {
    setFormData({
      productoDescripcion: '',
      codigoBarra: '',
      categoria: '',
      precio: 0,
      costo: 0,
      cantidadActual: 0,
      cantidadMinima: 0,
      proveedor: '',
      imagen: '',
      precioMayoreo: 0,
      valorPuntos: 0,
      mostrar: true,
      usaInventario: true,
    });
    setValidationErrors({});
    setHasChanges(false);
    setShowNewCategoryInput(false);
    setShowNewSupplierInput(false);
    setNewCategoryName('');
    setNewSupplierName('');
  };

  const validateField = (field: string, value: any) => {
    const errors = { ...validationErrors };
    
    switch (field) {
      case 'productoDescripcion': {
        const validation = validateProductName(value);
        if (!validation.isValid) {
          errors.productoDescripcion = validation.message;
        } else {
          delete errors.productoDescripcion;
        }
        break;
      }
      case 'codigoBarra': {
        const validation = validateBarcode(value, false);
        if (!validation.isValid) {
          errors.codigoBarra = validation.message;
        } else {
          delete errors.codigoBarra;
        }
        break;
      }
      case 'categoria':
        if (!value) errors.categoria = 'La categoría es requerida';
        else delete errors.categoria;
        break;
      case 'precio': {
        const validation = validatePrice(value, 'El precio', false);
        if (!validation.isValid) {
          errors.precio = validation.message;
        } else {
          delete errors.precio;
        }
        break;
      }
      case 'costo': {
        const validation = validatePrice(value, 'El costo', true);
        if (!validation.isValid) {
          errors.costo = validation.message;
        } else {
          delete errors.costo;
        }
        break;
      }
      case 'precioMayoreo': {
        if (value > 0) {
          const validation = validatePrice(value, 'El precio mayoreo', true);
          if (!validation.isValid) {
            errors.precioMayoreo = validation.message;
          } else {
            delete errors.precioMayoreo;
          }
        } else {
          delete errors.precioMayoreo;
        }
        break;
      }
      case 'cantidadActual': {
        if (formData.usaInventario) {
          const validation = validateQuantity(value, 'La cantidad actual', true);
          if (!validation.isValid) {
            errors.cantidadActual = validation.message;
          } else {
            delete errors.cantidadActual;
          }
        } else {
          delete errors.cantidadActual;
        }
        break;
      }
      case 'cantidadMinima': {
        if (formData.usaInventario) {
          const validation = validateQuantity(value, 'La cantidad mínima', true);
          if (!validation.isValid) {
            errors.cantidadMinima = validation.message;
          } else {
            delete errors.cantidadMinima;
          }
        } else {
          delete errors.cantidadMinima;
        }
        break;
      }
      case 'proveedor':
        if (!value) errors.proveedor = 'El proveedor es requerido';
        else delete errors.proveedor;
        break;
    }
    
    setValidationErrors(errors);
  };

  const isFormValid = () => {
    return Object.keys(validationErrors).length === 0 &&
           formData.productoDescripcion &&
           formData.categoria &&
           formData.precio > 0 &&
           formData.proveedor;
  };

  const validateFormComplete = (): boolean => {
    const errors: ProductValidationErrors = {};
    
    // Validar cada campo
    const nameValidation = validateProductName(formData.productoDescripcion);
    if (!nameValidation.isValid) errors.productoDescripcion = nameValidation.message;
    
    if (!formData.categoria) errors.categoria = 'La categoría es requerida';
    
    const priceValidation = validatePrice(formData.precio, 'El precio', false);
    if (!priceValidation.isValid) errors.precio = priceValidation.message;
    
    const costValidation = validatePrice(formData.costo, 'El costo', true);
    if (!costValidation.isValid) errors.costo = costValidation.message;
    
    if (!formData.proveedor) errors.proveedor = 'El proveedor es requerido';
    
    if (formData.usaInventario) {
      const stockValidation = validateQuantity(formData.cantidadActual, 'La cantidad actual', false);
      if (!stockValidation.isValid) errors.cantidadActual = stockValidation.message;
      
      const minStockValidation = validateQuantity(formData.cantidadMinima, 'La cantidad mínima', true);
      if (!minStockValidation.isValid) errors.cantidadMinima = minStockValidation.message;
    }
    
    if (formData.precioMayoreo > 0) {
      const wholesaleValidation = validatePrice(formData.precioMayoreo, 'El precio mayoreo', true);
      if (!wholesaleValidation.isValid) errors.precioMayoreo = wholesaleValidation.message;
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCategoryChange = (value: string) => {
    if (value === 'CREATE_NEW') {
      setShowNewCategoryInput(true);
      setFormData({ ...formData, categoria: '' });
    } else {
      setShowNewCategoryInput(false);
      setFormData({ ...formData, categoria: value });
      if (editingProduct) setHasChanges(true);
      validateField('categoria', value);
    }
  };

  const handleSupplierChange = (value: string) => {
    if (value === 'CREATE_NEW') {
      setShowNewSupplierInput(true);
      setFormData({ ...formData, proveedor: '' });
    } else {
      setShowNewSupplierInput(false);
      setFormData({ ...formData, proveedor: value });
      if (editingProduct) setHasChanges(true);
      validateField('proveedor', value);
    }
  };

  const handleNewCategorySubmit = () => {
    const categoryName = newCategoryName.toUpperCase().trim();
    if (categoryName) {
      setFormData({ ...formData, categoria: categoryName });
      setShowNewCategoryInput(false);
      setNewCategoryName('');
      if (editingProduct) setHasChanges(true);
      validateField('categoria', categoryName);
      
      // Agregar a la lista de categorías disponibles
      if (!categoriasDisponibles.includes(categoryName)) {
        setCategoriasDisponibles([...categoriasDisponibles, categoryName].sort());
      }
    }
  };

  const handleNewSupplierSubmit = () => {
    const supplierName = newSupplierName.toUpperCase().trim();
    if (supplierName) {
      setFormData({ ...formData, proveedor: supplierName });
      setShowNewSupplierInput(false);
      setNewSupplierName('');
      if (editingProduct) setHasChanges(true);
      validateField('proveedor', supplierName);
      
      // Agregar a la lista de proveedores disponibles
      if (!proveedoresDisponibles.includes(supplierName)) {
        setProveedoresDisponibles([...proveedoresDisponibles, supplierName].sort());
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar todos los campos de forma sincrónica
    const isValid = validateFormComplete();
    
    if (isValid) {
      onSubmit(formData);
    } else {
      toast.error('Por favor corrige los errores en el formulario');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editingProduct ? 'Editar Producto' : 'Nuevo Producto'}</DialogTitle>
          <DialogDescription>
            {editingProduct ? 'Actualiza la información del producto' : 'Completa los datos del nuevo producto'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nombre del producto */}
          <div className="space-y-2">
            <Label htmlFor="name">Nombre *</Label>
            <div className="relative">
              <Input
                id="name"
                value={formData.productoDescripcion}
                onChange={(e) => {
                  setFormData({ ...formData, productoDescripcion: e.target.value });
                  if (editingProduct) setHasChanges(true);
                  validateField('productoDescripcion', e.target.value);
                }}
                placeholder="Ej: Cerveza Cristal 355ml"
                className={validationErrors.productoDescripcion ? 'border-destructive pr-10' : 'pr-10'}
                required
              />
              {formData.productoDescripcion && !validationErrors.productoDescripcion && (
                <Check className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />
              )}
            </div>
            {validationErrors.productoDescripcion && (
              <p className="text-xs text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {validationErrors.productoDescripcion}
              </p>
            )}
          </div>

          {/* Código de barras */}
          <div className="space-y-2">
            <Label htmlFor="barcode">Código de Barras *</Label>
            <div className="relative">
              <Input
                id="barcode"
                value={formData.codigoBarra}
                onChange={(e) => {
                  setFormData({ ...formData, codigoBarra: e.target.value });
                  if (editingProduct) setHasChanges(true);
                  validateField('codigoBarra', e.target.value);
                }}
                placeholder="Ej: 7791234567890"
                className={validationErrors.codigoBarra ? 'border-destructive pr-10' : 'pr-10'}
              />
              {formData.codigoBarra && !validationErrors.codigoBarra && (
                <Check className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />
              )}
            </div>
            {validationErrors.codigoBarra && (
              <p className="text-xs text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {validationErrors.codigoBarra}
              </p>
            )}
          </div>

          {/* Categoría con selector dinámico */}
          <div className="space-y-2">
            <Label htmlFor="category">Categoría *</Label>
            <Select
              value={formData.categoria}
              onValueChange={handleCategoryChange}
              required
            >
              <SelectTrigger id="category" className={validationErrors.categoria ? 'border-destructive' : ''}>
                <SelectValue placeholder="Seleccionar categoría" />
              </SelectTrigger>
              <SelectContent>
                {isLoadingCategorias ? (
                  <SelectItem value="loading" disabled>Cargando categorías...</SelectItem>
                ) : (
                  <>
                    {categoriasDisponibles.map((categoria) => (
                      <SelectItem key={categoria} value={categoria}>
                        {categoria}
                      </SelectItem>
                    ))}
                    <SelectItem value="CREATE_NEW">
                      <div className="flex items-center gap-2">
                        ➕ Crear nueva categoría
                      </div>
                    </SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>
            
            {/* Input para nueva categoría */}
            {showNewCategoryInput && (
              <div className="flex gap-2">
                <Input
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value.toUpperCase())}
                  placeholder="NUEVA CATEGORÍA"
                  className="flex-1"
                />
                <Button 
                  type="button" 
                  size="sm" 
                  onClick={handleNewCategorySubmit}
                  disabled={!newCategoryName.trim()}
                >
                  Agregar
                </Button>
                <Button 
                  type="button" 
                  size="sm" 
                  variant="outline"
                  onClick={() => {
                    setShowNewCategoryInput(false);
                    setNewCategoryName('');
                  }}
                >
                  Cancelar
                </Button>
              </div>
            )}
            
            {validationErrors.categoria && (
              <p className="text-xs text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {validationErrors.categoria}
              </p>
            )}
          </div>

          {/* Precios */}
          <div className="grid grid-cols-2 gap-4">
            <MoneyInput
              id="cost"
              label="Costo S/"
              value={formData.costo}
              onChange={(value) => {
                setFormData({ ...formData, costo: value });
                if (editingProduct) setHasChanges(true);
                validateField('costo', value);
              }}
              placeholder="0.00"
              error={validationErrors.costo}
            />
            <MoneyInput
              id="price"
              label="Precio S/"
              value={formData.precio}
              onChange={(value) => {
                setFormData({ ...formData, precio: value });
                if (editingProduct) setHasChanges(true);
                validateField('precio', value);
              }}
              placeholder="0.00"
              error={validationErrors.precio}
              required
            />
          </div>

          {/* Stock */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="stock">Stock (Solo lectura)</Label>
              <Input
                id="stock"
                type="number"
                value={formData.usaInventario ? (formData.cantidadActual || '') : 0}
                placeholder="0"
                className="bg-muted"
                disabled={true}
                readOnly={true}
              />
              <p className="text-xs text-muted-foreground">
                Para modificar el stock, usa "Registrar Movimiento" en la lista de productos
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="minStock">Stock Mínimo *</Label>
              <Input
                id="minStock"
                type="number"
                value={formData.usaInventario ? (formData.cantidadMinima || '') : 0}
                onChange={(e) => {
                  const value = e.target.value === '' ? 0 : parseInt(e.target.value, 10);
                  setFormData({ ...formData, cantidadMinima: value });
                  if (editingProduct) setHasChanges(true);
                  validateField('cantidadMinima', value);
                }}
                placeholder="0"
                className={validationErrors.cantidadMinima ? 'border-destructive' : ''}
                disabled={!formData.usaInventario}
              />
              {validationErrors.cantidadMinima && (
                <p className="text-xs text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {validationErrors.cantidadMinima}
                </p>
              )}
            </div>
          </div>

          {/* Proveedor con selector dinámico */}
          <div className="space-y-2">
            <Label htmlFor="supplier">Proveedor *</Label>
            <Select
              value={formData.proveedor}
              onValueChange={handleSupplierChange}
              required
            >
              <SelectTrigger id="supplier" className={validationErrors.proveedor ? 'border-destructive' : ''}>
                <SelectValue placeholder="Seleccionar proveedor" />
              </SelectTrigger>
              <SelectContent>
                {isLoadingProveedores ? (
                  <SelectItem value="loading" disabled>Cargando proveedores...</SelectItem>
                ) : (
                  <>
                    {proveedoresDisponibles.map((proveedor) => (
                      <SelectItem key={proveedor} value={proveedor}>
                        {proveedor}
                      </SelectItem>
                    ))}
                    <SelectItem value="CREATE_NEW">
                      <div className="flex items-center gap-2">
                        ➕ Crear nuevo proveedor
                      </div>
                    </SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>
            
            {/* Input para nuevo proveedor */}
            {showNewSupplierInput && (
              <div className="flex gap-2">
                <Input
                  value={newSupplierName}
                  onChange={(e) => setNewSupplierName(e.target.value.toUpperCase())}
                  placeholder="NUEVO PROVEEDOR"
                  className="flex-1"
                />
                <Button 
                  type="button" 
                  size="sm" 
                  onClick={handleNewSupplierSubmit}
                  disabled={!newSupplierName.trim()}
                >
                  Agregar
                </Button>
                <Button 
                  type="button" 
                  size="sm" 
                  variant="outline"
                  onClick={() => {
                    setShowNewSupplierInput(false);
                    setNewSupplierName('');
                  }}
                >
                  Cancelar
                </Button>
              </div>
            )}
            
            {validationErrors.proveedor && (
              <p className="text-xs text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {validationErrors.proveedor}
              </p>
            )}
          </div>

          {/* Campos opcionales */}
          <div className="space-y-2">
            <Label htmlFor="image">URL de Imagen (Opcional)</Label>
            <Input
              id="image"
              value={formData.imagen}
              onChange={(e) => {
                setFormData({ ...formData, imagen: e.target.value });
                if (editingProduct) setHasChanges(true);
              }}
              placeholder="https://ejemplo.com/imagen.jpg"
            />
          </div>

          <MoneyInput
            id="wholesalePrice"
            label="Precio Mayoreo S/ (Opcional)"
            value={formData.precioMayoreo}
            onChange={(value) => {
              setFormData({ ...formData, precioMayoreo: value });
              if (editingProduct) setHasChanges(true);
              validateField('precioMayoreo', value);
            }}
            placeholder="0.00"
            error={validationErrors.precioMayoreo}
          />

          <div className="space-y-2">
            <Label htmlFor="pointsValue">Valor en Puntos (Opcional)</Label>
            <Input
              id="pointsValue"
              type="number"
              min="0"
              value={formData.valorPuntos || ''}
              onChange={(e) => {
                const value = e.target.value === '' ? 0 : parseInt(e.target.value, 10);
                setFormData({ ...formData, valorPuntos: value });
                if (editingProduct) setHasChanges(true);
              }}
              placeholder="0"
            />
          </div>

          {/* Checkboxes */}
          <div className="flex items-center justify-between">
            <Label htmlFor="showInCatalog">Mostrar en Catálogo</Label>
            <Input
              id="showInCatalog"
              type="checkbox"
              checked={formData.mostrar}
              onChange={(e) => {
                setFormData({ ...formData, mostrar: e.target.checked });
                if (editingProduct) setHasChanges(true);
              }}
              className="w-4 h-4"
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="useInventory">Usa Inventario</Label>
            <Input
              id="useInventory"
              type="checkbox"
              checked={formData.usaInventario}
              onChange={(e) => {
                const usaInventario = e.target.checked;
                setFormData({ 
                  ...formData, 
                  usaInventario,
                  cantidadActual: usaInventario ? formData.cantidadActual : 0,
                  cantidadMinima: usaInventario ? formData.cantidadMinima : 0,
                });
                if (editingProduct) setHasChanges(true);
                validateField('cantidadActual', usaInventario ? formData.cantidadActual : 0);
                validateField('cantidadMinima', usaInventario ? formData.cantidadMinima : 0);
              }}
              className="w-4 h-4"
            />
          </div>

          <DialogFooter>
            <Button 
              type="submit" 
              className="w-full"
              disabled={!isFormValid() || isSubmitting}
            >
              {isSubmitting ? 'Guardando...' : (editingProduct ? 'Actualizar' : 'Crear')} Producto
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
