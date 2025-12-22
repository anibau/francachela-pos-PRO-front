import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MoneyInput } from "@/components/ui/money-input";
import { Package, Plus, Pencil, Trash2, Search, ArrowUpDown, AlertCircle, Check, FileSpreadsheet, RefreshCw, Filter } from "lucide-react";
import { toast } from "sonner";
import { useProducts, useCreateProduct, useUpdateProduct, useDeleteProduct } from '@/hooks/useProducts';
import { inventoryService } from '@/services/inventoryService';
import { productsService } from '@/services/productsService';
import { validateProductName, validateBarcode, validatePrice, validateQuantity } from '@/utils/validators';
import type { Product, InventoryMovement } from "@/types";
import { ProductCategory, ProductSupplier } from "@/types";

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

export default function Productos() {
  // Usar hooks de TanStack Query
  const { data: productos = [], isLoading, error, refetch } = useProducts();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isMovementDialogOpen, setIsMovementDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [movimientos, setMovimientos] = useState<InventoryMovement[]>([]);
  const [isLoadingMovements, setIsLoadingMovements] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ProductValidationErrors>({});
  const [hasChanges, setHasChanges] = useState(false);

  // Estados para Requerimiento 3: Gestión de Productos - paginación y filtros
  const [categorias, setCategorias] = useState<string[]>([]);
  const [selectedCategoria, setSelectedCategoria] = useState<string>('todas');
  const [stockBajoProducts, setStockBajoProducts] = useState<Product[]>([]);
  const [isLoadingStockBajo, setIsLoadingStockBajo] = useState(false);
  const [currentProductPage, setCurrentProductPage] = useState(1);
  const productsPerPage = 10;

  // Estados para Requerimiento 4: Movimientos - día actual
  const [movimientosHoy, setMovimientosHoy] = useState<any[]>([]);
  const [totalMovimientosHoy, setTotalMovimientosHoy] = useState(0);
  const [isLoadingMovimientosHoy, setIsLoadingMovimientosHoy] = useState(false);

  // Estados para Requerimiento 5: Movimientos - filtros por tipo
  const [selectedTipoMovimiento, setSelectedTipoMovimiento] = useState<string>('todos');
  const [movimientosPorTipo, setMovimientosPorTipo] = useState<any[]>([]);
  const [isLoadingMovimientosTipo, setIsLoadingMovimientosTipo] = useState(false);

  // Estados para Requerimiento 6: Movimientos - filtros de rango de fechas
  const [fechaInicioMovimientos, setFechaInicioMovimientos] = useState('');
  const [fechaFinMovimientos, setFechaFinMovimientos] = useState('');
  const [movimientosRango, setMovimientosRango] = useState<any[]>([]);
  const [isLoadingMovimientosRango, setIsLoadingMovimientosRango] = useState(false);
  
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
  
  const [movementData, setMovementData] = useState({
    type: 'entrada' as 'entrada' | 'salida' | 'ajuste',
    quantity: 0,
    notes: '',
  });

  // Cargar movimientos de inventario
  useEffect(() => {
    const loadMovements = async () => {
      setIsLoadingMovements(true);
      try {
        const data = await inventoryService.getMovements();
        setMovimientos(data);
      } catch (error) {
        console.error('Error loading movements:', error);
      } finally {
        setIsLoadingMovements(false);
      }
    };
    loadMovements();
    loadCategorias(); // Cargar categorías para filtros
    loadMovimientosHoy(); // Cargar movimientos del día actual
  }, []);

  // Función para cargar categorías (Requerimiento 3)
  const loadCategorias = async () => {
    try {
      const data = await productsService.getCategories();
      setCategorias(data || []);
    } catch (error) {
      console.error('Error loading categories:', error);
      setCategorias([]);
    }
  };

  // Función para cargar productos con stock bajo (Requerimiento 3)
  const loadStockBajo = async () => {
    setIsLoadingStockBajo(true);
    try {
      const data = await productsService.getLowStock();
      setStockBajoProducts(data || []);
      toast.success(`Se encontraron ${data?.length || 0} productos con stock bajo`);
    } catch (error) {
      console.error('Error loading low stock products:', error);
      setStockBajoProducts([]);
      toast.error('Error al cargar productos con stock bajo');
    } finally {
      setIsLoadingStockBajo(false);
    }
  };

  // Función para cargar movimientos del día actual (Requerimiento 4)
  const loadMovimientosHoy = async () => {
    setIsLoadingMovimientosHoy(true);
    try {
      const data = await inventoryService.getToday();
      
      // Adaptar al response esperado: { movimientos: [], totalMovimientos: number }
      if (data && typeof data === 'object' && 'movimientos' in data) {
        setMovimientosHoy(data.movimientos || []);
        setTotalMovimientosHoy(data.totalMovimientos || 0);
      } else if (Array.isArray(data)) {
        setMovimientosHoy(data);
        setTotalMovimientosHoy(data.length);
      } else {
        setMovimientosHoy([]);
        setTotalMovimientosHoy(0);
      }
    } catch (error) {
      console.error('Error loading today movements:', error);
      setMovimientosHoy([]);
      setTotalMovimientosHoy(0);
    } finally {
      setIsLoadingMovimientosHoy(false);
    }
  };

  // Función para cargar movimientos por tipo (Requerimiento 5)
  const loadMovimientosPorTipo = async (tipo: string) => {
    if (tipo === 'todos') {
      setMovimientosPorTipo([]);
      return;
    }

    setIsLoadingMovimientosTipo(true);
    try {
      const data = await inventoryService.getByType(tipo);
      
      // Adaptar al response con paginación
      if (data && typeof data === 'object' && 'data' in data) {
        setMovimientosPorTipo(data.data || []);
      } else if (Array.isArray(data)) {
        setMovimientosPorTipo(data);
      } else {
        setMovimientosPorTipo([]);
      }
      
      toast.success(`Se encontraron ${data?.data?.length || data?.length || 0} movimientos de tipo ${tipo}`);
    } catch (error) {
      console.error('Error loading movements by type:', error);
      setMovimientosPorTipo([]);
      toast.error('Error al cargar movimientos por tipo');
    } finally {
      setIsLoadingMovimientosTipo(false);
    }
  };

  // Función para aplicar filtros de rango de fechas (Requerimiento 6)
  const aplicarFiltrosRangoMovimientos = async () => {
    if (!fechaInicioMovimientos || !fechaFinMovimientos) {
      toast.error('Por favor selecciona ambas fechas');
      return;
    }

    setIsLoadingMovimientosRango(true);
    try {
      const fechaInicio = `${fechaInicioMovimientos} 00:00:00`;
      const fechaFin = `${fechaFinMovimientos} 23:59:59`;
      
      const data = await inventoryService.getByDateRange({ fechaInicio, fechaFin });
      
      // Response es array simple según especificación
      if (Array.isArray(data)) {
        setMovimientosRango(data);
      } else {
        setMovimientosRango([]);
      }
      
      toast.success(`Se encontraron ${data?.length || 0} movimientos en el rango seleccionado`);
    } catch (error) {
      console.error('Error loading movements by date range:', error);
      setMovimientosRango([]);
      toast.error('Error al aplicar filtros de fecha');
    } finally {
      setIsLoadingMovimientosRango(false);
    }
  };

  // Manejar errores
  useEffect(() => {
    if (error) {
      toast.error('Error al cargar productos');
      console.error('Error loading products:', error);
    }
  }, [error]);

  // Validar campos individuales
  const validateField = (field: string, value: string | number) => {
    const errors: ProductValidationErrors = { ...validationErrors };

    switch (field) {
      case 'productoDescripcion': {
        const validation = validateProductName(String(value));
        if (!validation.isValid) {
          errors.productoDescripcion = validation.message;
        } else {
          delete errors.productoDescripcion;
        }
        break;
      }
      case 'codigoBarra': {
        const validation = validateBarcode(String(value), false); // Opcional
        if (!validation.isValid) {
          errors.codigoBarra = validation.message;
        } else {
          delete errors.codigoBarra;
        }
        break;
      }
      case 'categoria':
        if (!value) {
          errors.categoria = 'La categoría es requerida';
        } else {
          delete errors.categoria;
        }
        break;
      case 'costo': {
        const validation = validatePrice(Number(value), 'El costo', true); // Permite 0
        if (!validation.isValid) {
          errors.costo = validation.message;
        } else {
          delete errors.costo;
        }
        break;
      }
      case 'precio': {
        const validation = validatePrice(Number(value), 'El precio', false); // No permite 0
        if (!validation.isValid) {
          errors.precio = validation.message;
        } else {
          delete errors.precio;
        }
        break;
      }
      case 'precioMayoreo': {
        // Precio mayoreo es OPCIONAL - permitir 0 o vacío
        if (value && Number(value) > 0) {
          const validation = validatePrice(Number(value), 'El precio mayoreo', true); // Permite 0 ya que es opcional
          if (!validation.isValid) {
            errors.precioMayoreo = validation.message;
          } else {
            delete errors.precioMayoreo;
          }
        } else {
          // Si está vacío o es 0, no hay error (campo opcional)
          delete errors.precioMayoreo;
        }
        break;
      }
      case 'cantidadActual': {
        // Si no usa inventario, no validar (se enviará 0)
        if (!formData.usaInventario) {
          delete errors.cantidadActual;
        } else {
          // Si usa inventario, debe ser mayor que 0
          const validation = validateQuantity(Number(value), 'El stock actual', false); // No permite 0
          if (!validation.isValid) {
            errors.cantidadActual = validation.message;
          } else {
            delete errors.cantidadActual;
          }
        }
        break;
      }
      case 'cantidadMinima': {
        // Si no usa inventario, no validar (se enviará 0)
        if (!formData.usaInventario) {
          delete errors.cantidadMinima;
        } else {
          // Si usa inventario, puede ser 0 o mayor
          const validation = validateQuantity(Number(value), 'El stock mínimo', true); // Permite 0
          if (!validation.isValid) {
            errors.cantidadMinima = validation.message;
          } else {
            delete errors.cantidadMinima;
          }
        }
        break;
      }
      case 'proveedor':
        if (!value) {
          errors.proveedor = 'El proveedor es requerido';
        } else {
          delete errors.proveedor;
        }
        break;
    }

    setValidationErrors(errors);
  };

  // Función para validar el formulario completo
  const isFormValid = () => {
    const baseValid =
      formData.productoDescripcion.trim().length >= 3 &&
      formData.categoria &&
      formData.precio > 0 &&
      formData.costo >= 0 &&
      formData.cantidadActual >= 0 &&
      formData.cantidadMinima >= 0 &&
      formData.proveedor &&
      Object.keys(validationErrors).length === 0;

    if (editingProduct) {
      return baseValid && hasChanges;
    }

    return baseValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isFormValid()) {
      toast.error('Por favor corrige los errores en el formulario');
      return;
    }
    
    try {
      // Preparar datos para envío - si no usa inventario, enviar stock en 0
      const dataToSend = {
        ...formData,
        cantidadActual: formData.usaInventario ? formData.cantidadActual : 0,
        cantidadMinima: formData.usaInventario ? formData.cantidadMinima : 0,
      };

      if (editingProduct) {
        await updateProduct.mutateAsync({ id: editingProduct.id, data: dataToSend });
        toast.success('Producto actualizado correctamente');
      } else {
        await createProduct.mutateAsync(dataToSend as Omit<Product, 'id'>);
        toast.success('Producto creado correctamente');
      }
      
      setIsDialogOpen(false);
      resetForm();
      refetch();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al guardar producto';
      toast.error(errorMessage);
    }
  };

  const handleMovementSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedProduct) return;
    
    try {
      await inventoryService.createMovement({
        tipo: movementData.type,
        id: selectedProduct.id,
        descripcion: movementData.notes || `Movimiento de ${movementData.type}`,
        cantidad: movementData.quantity,
        hora: new Date().toISOString(),
        cajero: 'Usuario', // TODO: obtener del contexto de auth
      });
      
      // Actualizar stock del producto
      const newStock = movementData.type === 'entrada' 
        ? selectedProduct.cantidadActual + movementData.quantity
        : selectedProduct.cantidadActual - movementData.quantity;
      
      await productsService.update(selectedProduct.id, { cantidadActual: newStock });
      
      toast.success('Movimiento registrado correctamente');
      setIsMovementDialogOpen(false);
      resetMovementForm();
      
      // Recargar datos
      refetch();
      const updatedMovements = await inventoryService.getMovements();
      setMovimientos(updatedMovements);
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
    setHasChanges(false);
    setValidationErrors({});
    setFormData({
      productoDescripcion: product.productoDescripcion,
      codigoBarra: product.codigoBarra,
      categoria: product.categoria,
      precio: product.precio,
      costo: product.costo,
      cantidadActual: product.cantidadActual,
      cantidadMinima: product.cantidadMinima,
      proveedor: product.proveedor,
      imagen: product.imagen || '',
      precioMayoreo: product.precioMayoreo || 0,
      valorPuntos: product.valorPuntos || 0,
      mostrar: product.mostrar ?? true,
      usaInventario: product.usaInventario ?? true,
    });
    setIsDialogOpen(true);
  };

  const openMovementDialog = (product: Product) => {
    setSelectedProduct(product);
    setIsMovementDialogOpen(true);
  };

  const resetForm = () => {
    setEditingProduct(null);
    setHasChanges(false);
    setValidationErrors({});
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
  };

  const resetMovementForm = () => {
    setSelectedProduct(null);
    setMovementData({
      type: 'entrada',
      quantity: 0,
      notes: '',
    });
  };

  // Funciones auxiliares para formateo
  const formatCurrency = (amount: number | string) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return `S/${num.toFixed(2)}`;
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-PE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('es-PE', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Filtrar productos localmente (Requerimiento 3)
  const filteredProductos = (productos || []).filter(producto => {
    if (!producto?.productoDescripcion || !producto?.codigoBarra || !producto?.categoria) return false;
    
    const searchTermLower = searchTerm.toLowerCase();
    const matchesSearch = (
      producto.productoDescripcion.toLowerCase().includes(searchTermLower) ||
      producto.codigoBarra.includes(searchTerm) ||
      producto.categoria.toLowerCase().includes(searchTermLower)
    );

    const matchesCategory = selectedCategoria === 'todas' || producto.categoria === selectedCategoria;
    
    return matchesSearch && matchesCategory;
  });

  // Paginación para productos (Requerimiento 3)
  const totalProductPages = Math.ceil(filteredProductos.length / productsPerPage);
  const paginatedProductos = filteredProductos.slice(
    (currentProductPage - 1) * productsPerPage,
    currentProductPage * productsPerPage
  );

  // Función para cargar productos por categoría (Requerimiento 3)
  const loadProductosPorCategoria = async (categoria: string) => {
    if (categoria === 'todas') {
      setSelectedCategoria('todas');
      return;
    }

    try {
      const data = await productsService.getByCategory(categoria);
      // Los productos filtrados se manejan automáticamente por el filtro local
      setSelectedCategoria(categoria);
      setCurrentProductPage(1); // Reset página al cambiar filtro
      toast.success(`Mostrando productos de categoría: ${categoria}`);
    } catch (error) {
      console.error('Error loading products by category:', error);
      toast.error('Error al filtrar productos por categoría');
    }
  };

  const exportProductsToExcel = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        toast.error('No hay sesión activa');
        return;
      }

      toast.loading('Generando archivo Excel...');
      
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/excel/export-productos`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Error al exportar productos');

      const blob = await response.blob();
      const downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `productos_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(downloadUrl);

      toast.dismiss();
      toast.success('Productos exportados correctamente');
    } catch (error) {
      toast.dismiss();
      console.error('Error exporting products:', error);
      toast.error('Error al exportar productos');
    }
  };

  const exportMovementsToExcel = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        toast.error('No hay sesión activa');
        return;
      }

      const today = new Date();
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
      const endOfDay = today.toISOString().split('T')[0];

      const params = new URLSearchParams({
        fechaInicio: startOfMonth,
        fechaFin: endOfDay,
        tipoReporte: 'INVENTARIO',
        incluirDetalles: 'true'
      });

      toast.loading('Generando archivo Excel...');
      
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/excel/export-inventario?${params}`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Error al exportar movimientos');

      const blob = await response.blob();
      const downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `movimientos_inventario_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(downloadUrl);

      toast.dismiss();
      toast.success('Movimientos exportados correctamente');
    } catch (error) {
      toast.dismiss();
      console.error('Error exporting movements:', error);
      toast.error('Error al exportar movimientos');
    }
  };

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
            
            <div className="flex gap-2 w-full sm:w-auto">
              <Button onClick={exportProductsToExcel} variant="outline" size="sm">
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Exportar Excel
              </Button>
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
                  <div className="space-y-2">
                    <Label htmlFor="category">Categoría *</Label>
                    <Select
                      value={formData.categoria}
                      onValueChange={(value) => {
                        setFormData({ ...formData, categoria: value });
                        if (editingProduct) setHasChanges(true);
                        validateField('categoria', value);
                      }}
                      required
                    >
                      <SelectTrigger id="category" className={validationErrors.categoria ? 'border-destructive' : ''}>
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
                    {validationErrors.categoria && (
                      <p className="text-xs text-destructive flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {validationErrors.categoria}
                      </p>
                    )}
                  </div>
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
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="stock">Stock *</Label>
                      <Input
                        id="stock"
                        type="number"
                        value={formData.usaInventario ? (formData.cantidadActual || '') : 0}
                        onChange={(e) => {
                          const value = e.target.value === '' ? 0 : parseInt(e.target.value, 10);
                          setFormData({ ...formData, cantidadActual: value });
                          if (editingProduct) setHasChanges(true);
                          validateField('cantidadActual', value);
                        }}
                        placeholder="0"
                        className={validationErrors.cantidadActual ? 'border-destructive' : ''}
                        disabled={!formData.usaInventario}
                      />
                      {validationErrors.cantidadActual && (
                        <p className="text-xs text-destructive flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {validationErrors.cantidadActual}
                        </p>
                      )}
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
                  <div className="space-y-2">
                    <Label htmlFor="supplier">Proveedor *</Label>
                    <Select
                      value={formData.proveedor}
                      onValueChange={(value) => {
                        setFormData({ ...formData, proveedor: value });
                        if (editingProduct) setHasChanges(true);
                        validateField('proveedor', value);
                      }}
                      required
                    >
                      <SelectTrigger id="supplier" className={validationErrors.proveedor ? 'border-destructive' : ''}>
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
                    {validationErrors.proveedor && (
                      <p className="text-xs text-destructive flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {validationErrors.proveedor}
                      </p>
                    )}
                  </div>
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
                          // Si no usa inventario, resetear stock a 0
                          cantidadActual: usaInventario ? formData.cantidadActual : 0,
                          cantidadMinima: usaInventario ? formData.cantidadMinima : 0,
                        });
                        if (editingProduct) setHasChanges(true);
                        // Revalidar campos de stock
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
                      disabled={!isFormValid()}
                    >
                      {editingProduct ? 'Actualizar' : 'Crear Producto'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
            </div>
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

          {/* Filtros y controles - REQUERIMIENTO 3 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filtros y Controles
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Categoría</Label>
                  <Select value={selectedCategoria} onValueChange={loadProductosPorCategoria}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todas">Todas las categorías</SelectItem>
                      {categorias.map((categoria) => (
                        <SelectItem key={categoria} value={categoria}>
                          {categoria}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>&nbsp;</Label>
                  <Button 
                    onClick={loadStockBajo}
                    disabled={isLoadingStockBajo}
                    variant="outline"
                    className="w-full"
                  >
                    {isLoadingStockBajo ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                        Cargando...
                      </>
                    ) : (
                      <>
                        <AlertCircle className="h-4 w-4 mr-2" />
                        Stock Bajo
                      </>
                    )}
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label>Productos por página</Label>
                  <Select 
                    value={productsPerPage.toString()} 
                    onValueChange={(value) => {
                      // Actualizar productos por página (se puede hacer dinámico si se necesita)
                      setCurrentProductPage(1);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10 productos</SelectItem>
                      <SelectItem value="20">20 productos</SelectItem>
                      <SelectItem value="50">50 productos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Información de filtros aplicados */}
              <div className="mt-4 flex flex-wrap gap-2">
                {selectedCategoria !== 'todas' && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Categoría: {selectedCategoria}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0 hover:bg-transparent"
                      onClick={() => loadProductosPorCategoria('todas')}
                    >
                      ×
                    </Button>
                  </Badge>
                )}
                {stockBajoProducts.length > 0 && (
                  <Badge variant="destructive" className="flex items-center gap-1">
                    {stockBajoProducts.length} productos con stock bajo
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0 hover:bg-transparent"
                      onClick={() => setStockBajoProducts([])}
                    >
                      ×
                    </Button>
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Lista de productos con paginación - REQUERIMIENTO 3 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Productos</span>
                <Badge variant="outline">
                  {stockBajoProducts.length > 0 ? 
                    `${stockBajoProducts.length} con stock bajo` : 
                    `${filteredProductos.length} productos`
                  }
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {/* Mostrar productos con stock bajo si están cargados */}
                {stockBajoProducts.length > 0 ? (
                  stockBajoProducts.map((producto) => (
                    <Card key={`stock-bajo-${producto.id}`} className="hover:shadow-lg transition-all border-destructive">
                      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0">
                        <CardTitle className="flex items-center gap-3 text-lg">
                          <AlertCircle className="h-5 w-5 text-destructive" />
                          {producto.productoDescripcion}
                        </CardTitle>
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                          <Badge variant="destructive">
                            Stock: {producto.cantidadActual} / Min: {producto.cantidadMinima}
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
                            <p className="font-semibold">{producto.categoria}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Código</p>
                            <p className="font-semibold text-sm">{producto.codigoBarra}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Costo</p>
                            <p className="font-semibold">{formatCurrency(producto.costo)}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Precio</p>
                            <p className="font-semibold text-primary">{formatCurrency(producto.precio)}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Proveedor</p>
                            <p className="font-semibold">{producto.proveedor}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  /* Productos normales con paginación */
                  paginatedProductos.map((producto) => (
              <Card key={producto.id} className="hover:shadow-lg transition-all">
                <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0">
                  <CardTitle className="flex items-center gap-3 text-lg">
                    <Package className="h-5 w-5 text-primary" />
                    {producto.productoDescripcion}
                  </CardTitle>
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Badge variant={producto.cantidadActual > producto.cantidadMinima ? "default" : "destructive"}>
                      Stock: {producto.cantidadActual}
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
                      <p className="font-semibold">{producto.categoria}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Código</p>
                      <p className="font-semibold text-sm">{producto.codigoBarra}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Costo</p>
                      <p className="font-semibold">{formatCurrency(producto.costo)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Precio</p>
                      <p className="font-semibold text-primary">{formatCurrency(producto.precio)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Proveedor</p>
                      <p className="font-semibold">{producto.proveedor}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
                  ))
                )}
              </div>

              {/* Paginación - REQUERIMIENTO 3 */}
              {stockBajoProducts.length === 0 && totalProductPages > 1 && (
                <div className="flex items-center justify-between mt-6">
                  <p className="text-sm text-muted-foreground">
                    Mostrando {(currentProductPage - 1) * productsPerPage + 1} a{' '}
                    {Math.min(currentProductPage * productsPerPage, filteredProductos.length)} de {filteredProductos.length} productos
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentProductPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentProductPage === 1}
                    >
                      Anterior
                    </Button>
                    <span className="text-sm">
                      Página {currentProductPage} de {totalProductPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentProductPage(prev => Math.min(prev + 1, totalProductPages))}
                      disabled={currentProductPage === totalProductPages}
                    >
                      Siguiente
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="movimientos" className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-2xl font-bold mb-2">Movimientos de Inventario</h2>
              <p className="text-muted-foreground">Historial de entradas, salidas y ajustes</p>
            </div>
            <div className="flex gap-2">
              <Button onClick={exportMovementsToExcel} variant="outline" size="sm">
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Exportar Excel
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={async () => {
                  setIsLoadingMovements(true);
                  try {
                    const data = await inventoryService.getMovements();
                    setMovimientos(data);
                  } catch (error) {
                    console.error('Error loading movements:', error);
                  } finally {
                    setIsLoadingMovements(false);
                  }
                }}
                disabled={isLoadingMovements}
              >
                Actualizar
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  // Exportar movimientos (placeholder)
                  toast.info('Función de exportación próximamente');
                }}
              >
                Exportar
              </Button>
            </div>
          </div>

          {/* Filtros de movimientos - REQUERIMIENTOS 5 y 6 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Filtros de Movimientos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Filtro por tipo - REQUERIMIENTO 5 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Tipo de Movimiento</Label>
                    <Select 
                      value={selectedTipoMovimiento} 
                      onValueChange={(value) => {
                        setSelectedTipoMovimiento(value);
                        loadMovimientosPorTipo(value);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos">Todos</SelectItem>
                        <SelectItem value="ENTRADA">Entradas</SelectItem>
                        <SelectItem value="SALIDA">Salidas</SelectItem>
                        <SelectItem value="AJUSTE">Ajustes</SelectItem>
                        <SelectItem value="VENTA">Ventas</SelectItem>
                        <SelectItem value="DEVOLUCIÓN">Devoluciones</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Filtro por rango de fechas - REQUERIMIENTO 6 */}
                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-3">Filtro por Rango de Fechas</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Fecha Inicio</Label>
                      <Input 
                        type="date" 
                        value={fechaInicioMovimientos}
                        onChange={(e) => setFechaInicioMovimientos(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Fecha Fin</Label>
                      <Input 
                        type="date" 
                        value={fechaFinMovimientos}
                        onChange={(e) => setFechaFinMovimientos(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>&nbsp;</Label>
                      <Button 
                        onClick={aplicarFiltrosRangoMovimientos}
                        disabled={isLoadingMovimientosRango || !fechaInicioMovimientos || !fechaFinMovimientos}
                        className="w-full"
                      >
                        {isLoadingMovimientosRango ? (
                          <>
                            <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                            Aplicando...
                          </>
                        ) : (
                          <>
                            <Search className="h-4 w-4 mr-2" />
                            APLICAR
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Estadísticas rápidas */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Movimientos Hoy</p>
                    <p className="text-2xl font-bold text-primary">
                      {movimientos.filter(m => {
                        const today = new Date().toDateString();
                        return new Date(m.hora).toDateString() === today;
                      }).length}
                    </p>
                  </div>
                  <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <Package className="h-4 w-4 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Entradas</p>
                    <p className="text-2xl font-bold text-green-600">
                      {movimientos.filter(m => m.tipo === 'entrada').length}
                    </p>
                  </div>
                  <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                    <Plus className="h-4 w-4 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Salidas</p>
                    <p className="text-2xl font-bold text-red-600">
                      {movimientos.filter(m => m.tipo === 'salida').length}
                    </p>
                  </div>
                  <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center">
                    <ArrowUpDown className="h-4 w-4 text-red-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {isLoadingMovements ? (
            <div className="flex items-center justify-center h-32">
              <div className="text-center">
                <Package className="h-8 w-8 animate-spin mx-auto mb-2 text-primary" />
                <p>Cargando movimientos...</p>
              </div>
            </div>
          ) : (
            <div className="grid gap-4">
              {movimientos.slice(0, 50).map((mov) => (
                <Card key={mov.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Fecha/Hora</p>
                        <p className="font-semibold text-sm">
                          {mov.hora ? new Date(mov.hora).toLocaleString('es-PE') : 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Producto</p>
                        <p className="font-semibold text-sm">{mov.descripcion || 'Sin especificar'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Tipo</p>
                        <Badge variant={mov.tipo === 'entrada' ? 'default' : mov.tipo === 'salida' ? 'destructive' : 'secondary'}>
                          {(mov.tipo || 'desconocido').toUpperCase()}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Cantidad</p>
                        <p className={`font-semibold ${mov.tipo === 'entrada' ? 'text-green-600' : mov.tipo === 'salida' ? 'text-red-600' : 'text-blue-600'}`}>
                          {mov.tipo === 'entrada' ? '+' : mov.tipo === 'salida' ? '-' : '±'}{mov.cantidad || 0}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Cajero</p>
                        <p className="font-semibold text-sm">{mov.cajero || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Código</p>
                        <p className="text-sm text-muted-foreground">{mov.codigoBarra || 'Sin código'}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {movimientos.length === 0 && (
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center py-8">
                      <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-lg font-semibold mb-2">No hay movimientos registrados</p>
                      <p className="text-muted-foreground">Los movimientos de inventario aparecerán aquí</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
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
              {selectedProduct?.productoDescripcion}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleMovementSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Tipo de Movimiento</Label>
              <Select value={movementData.type} onValueChange={(value: 'entrada' | 'salida' | 'ajuste') => setMovementData({ ...movementData, type: value })}>
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
                value={movementData.quantity || ''}
                onChange={(e) => setMovementData({ ...movementData, quantity: e.target.value === '' ? 0 : parseInt(e.target.value) })}
                required
                min="1"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notas</Label>
              <Input
                id="notes"
                value={movementData.notes}
                onChange={(e) => setMovementData({ ...movementData, notes: e.target.value })}
                placeholder="Descripción del movimiento"
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
