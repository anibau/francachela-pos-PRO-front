import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Receipt, Plus, Search, Calendar, DollarSign, TrendingUp, Filter, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { expensesService } from '@/services/expensesService';
import type { Expense } from '@/types';

// Categorías de gastos según el backend
const EXPENSE_CATEGORIES = [
  'OPERATIVO',
  'ADMINISTRATIVO', 
  'MARKETING',
  'MANTENIMIENTO',
  'SERVICIOS',
  'OTROS'
];

const PAYMENT_METHODS = [
  'EFECTIVO',
  'TARJETA',
  'YAPE',
  'PLIN'
];

export default function Gastos() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [todayExpenses, setTodayExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Estados para la sección RESUMEN (Requerimiento 1)
  const [resumenExpenses, setResumenExpenses] = useState<any[]>([]);
  const [resumenTotal, setResumenTotal] = useState(0);
  const [isLoadingResumen, setIsLoadingResumen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Estados para filtros de fecha en sección GASTOS (Requerimiento 2)
  const [gastosExpenses, setGastosExpenses] = useState<any[]>([]);
  const [gastosTotal, setGastosTotal] = useState(0);
  const [isLoadingGastos, setIsLoadingGastos] = useState(false);
  const [filtroFechaInicio, setFiltroFechaInicio] = useState('');
  const [filtroFechaFin, setFiltroFechaFin] = useState('');

  const [formData, setFormData] = useState({
    description: '',
    amount: 0,
    category: '',
    paymentMethod: '',
    provider: '',
    receiptNumber: '',
    receipt: ''
  });

  useEffect(() => {
    loadData();
    loadResumenData(); // Cargar datos del mes actual para RESUMEN
  }, []);

  // Función auxiliar para obtener fechas del mes actual
  const getMonthDates = () => {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    
    const formatDateTime = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day} ${date === firstDay ? '00:00:00' : '23:59:59'}`;
    };
    
    return {
      fechaInicio: formatDateTime(firstDay),
      fechaFin: formatDateTime(lastDay)
    };
  };

  // Función para cargar datos del mes actual en RESUMEN (Requerimiento 1)
  const loadResumenData = async () => {
    setIsLoadingResumen(true);
    try {
      const { fechaInicio, fechaFin } = getMonthDates();
      const data = await expensesService.getByDateRange({ fechaInicio, fechaFin });
      
      // Adaptar al response esperado: { data: [], total: number }
      if (data && typeof data === 'object' && 'data' in data) {
        setResumenExpenses(data.data || []);
        setResumenTotal(data.total || 0);
      } else if (Array.isArray(data)) {
        setResumenExpenses(data);
        setResumenTotal(data.length);
      } else {
        setResumenExpenses([]);
        setResumenTotal(0);
      }
    } catch (error) {
      console.error('Error loading resumen data:', error);
      setResumenExpenses([]);
      setResumenTotal(0);
      toast.error('Error al cargar gastos del mes actual');
    } finally {
      setIsLoadingResumen(false);
    }
  };

  // Función para aplicar filtros de fecha en sección GASTOS (Requerimiento 2)
  const aplicarFiltrosFecha = async () => {
    if (!filtroFechaInicio || !filtroFechaFin) {
      toast.error('Por favor selecciona ambas fechas');
      return;
    }

    setIsLoadingGastos(true);
    try {
      const fechaInicio = `${filtroFechaInicio} 00:00:00`;
      const fechaFin = `${filtroFechaFin} 23:59:59`;
      
      const data = await expensesService.getByDateRange({ fechaInicio, fechaFin });
      
      // Adaptar al response esperado
      if (data && typeof data === 'object' && 'data' in data) {
        setGastosExpenses(data.data || []);
        setGastosTotal(data.total || 0);
      } else if (Array.isArray(data)) {
        setGastosExpenses(data);
        setGastosTotal(data.length);
      } else {
        setGastosExpenses([]);
        setGastosTotal(0);
      }
      
      toast.success('Filtros aplicados correctamente');
    } catch (error) {
      console.error('Error applying date filters:', error);
      setGastosExpenses([]);
      setGastosTotal(0);
      toast.error('Error al aplicar filtros de fecha');
    } finally {
      setIsLoadingGastos(false);
    }
  };

  const loadData = async () => {
    try {
      setIsLoading(true);
      
      // Ahora los servicios ya retornan arrays garantizados
      const [allExpenses, todayData, categoriesData] = await Promise.all([
        expensesService.getAll(),
        expensesService.getToday(),
        expensesService.getCategories()
      ]);
      
      setExpenses(allExpenses);
      setTodayExpenses(todayData);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Unexpected error loading expenses:', error);
      // Los servicios ya manejan los errores y retornan valores por defecto
      setExpenses([]);
      setTodayExpenses([]);
      setCategories(EXPENSE_CATEGORIES);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.description || !formData.amount || !formData.category || !formData.paymentMethod) {
      toast.error('Por favor completa todos los campos requeridos');
      return;
    }

    try {
      const expenseData = {
        date: new Date().toISOString().split('T')[0],
        description: formData.description,
        amount: formData.amount,
        category: formData.category,
        paymentMethod: formData.paymentMethod as 'EFECTIVO' | 'TARJETA' | 'YAPE' | 'PLIN',
        provider: formData.provider,
        receiptNumber: formData.receiptNumber,
        receipt: formData.receipt
      };

      if (editingExpense) {
        await expensesService.update(editingExpense.id, expenseData);
        toast.success('Gasto actualizado correctamente');
      } else {
        await expensesService.create(expenseData);
        toast.success('Gasto registrado correctamente');
      }
      
      setIsDialogOpen(false);
      resetForm();
      loadData();
    } catch (error) {
      console.error('Error saving expense:', error);
      toast.error('Error al guardar gasto');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar este gasto?')) return;
    
    try {
      await expensesService.delete(id);
      toast.success('Gasto eliminado correctamente');
      loadData();
    } catch (error) {
      console.error('Error deleting expense:', error);
      toast.error('Error al eliminar gasto');
    }
  };

  const openEditDialog = (expense: Expense) => {
    setEditingExpense(expense);
    setFormData({
      description: expense.description || '',
      amount: expense.amount || 0,
      category: expense.category || '',
      paymentMethod: expense.paymentMethod || '',
      provider: expense.provider || '',
      receiptNumber: expense.receiptNumber || '',
      receipt: expense.receipt || ''
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setEditingExpense(null);
    setFormData({
      description: '',
      amount: 0,
      category: '',
      paymentMethod: '',
      provider: '',
      receiptNumber: '',
      receipt: ''
    });
  };

  // Funciones auxiliares para formateo
  const formatCurrency = (amount: number) => `S/${amount.toFixed(2)}`;
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-PE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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

  // Paginación para RESUMEN
  const totalPages = Math.ceil(resumenTotal / itemsPerPage);
  const paginatedResumenExpenses = resumenExpenses.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Datos están garantizados como arrays por los servicios
  const filteredExpenses = expenses.filter(expense => {
    const matchesSearch = expense.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         expense.provider?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'todos' || expense.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const totalExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  const todayTotal = todayExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Gastos</h1>
          <p className="text-muted-foreground">Control y gestión de gastos del negocio</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Nuevo Gasto
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingExpense ? 'Editar Gasto' : 'Registrar Nuevo Gasto'}</DialogTitle>
              <DialogDescription>
                {editingExpense ? 'Actualiza la información del gasto' : 'Completa los datos del nuevo gasto'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="description">Descripción *</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Descripción del gasto"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amount">Monto S/ *</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={formData.amount || ''}
                    onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Categoría *</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      {EXPENSE_CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Método de Pago *</Label>
                  <Select value={formData.paymentMethod} onValueChange={(value) => setFormData({ ...formData, paymentMethod: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar método" />
                    </SelectTrigger>
                    <SelectContent>
                      {PAYMENT_METHODS.map((method) => (
                        <SelectItem key={method} value={method}>{method}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="provider">Proveedor</Label>
                  <Input
                    id="provider"
                    value={formData.provider}
                    onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                    placeholder="Nombre del proveedor"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="receiptNumber">N° Comprobante</Label>
                  <Input
                    id="receiptNumber"
                    value={formData.receiptNumber}
                    onChange={(e) => setFormData({ ...formData, receiptNumber: e.target.value })}
                    placeholder="F001-00001234"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="receipt">URL Comprobante</Label>
                <Input
                  id="receipt"
                  value={formData.receipt}
                  onChange={(e) => setFormData({ ...formData, receipt: e.target.value })}
                  placeholder="https://ejemplo.com/comprobante.pdf"
                />
              </div>
              <DialogFooter>
                <Button type="submit" className="w-full">
                  {editingExpense ? 'Actualizar' : 'Registrar'} Gasto
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="expenses">Gastos</TabsTrigger>
          <TabsTrigger value="analytics">Análisis</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Estadísticas principales */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Gastos</p>
                    <p className="text-2xl font-bold text-destructive">S/ {totalExpenses.toFixed(2)}</p>
                  </div>
                  <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center">
                    <DollarSign className="h-4 w-4 text-red-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Gastos Hoy</p>
                    <p className="text-2xl font-bold text-orange-600">S/ {todayTotal.toFixed(2)}</p>
                  </div>
                  <div className="h-8 w-8 bg-orange-100 rounded-full flex items-center justify-center">
                    <Calendar className="h-4 w-4 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Registros</p>
                    <p className="text-2xl font-bold text-primary">{expenses.length}</p>
                  </div>
                  <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <Receipt className="h-4 w-4 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Promedio Diario</p>
                    <p className="text-2xl font-bold text-blue-600">
                      S/ {expenses.length > 0 ? (totalExpenses / Math.max(expenses.length, 1)).toFixed(2) : '0.00'}
                    </p>
                  </div>
                  <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <TrendingUp className="h-4 w-4 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Gastos del Mes Actual - REQUERIMIENTO 1 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Gastos del Mes Actual
                <Badge variant="outline" className="ml-2">
                  Total: {resumenTotal}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingResumen ? (
                <div className="flex items-center justify-center h-32">
                  <div className="text-center">
                    <Receipt className="h-8 w-8 animate-spin mx-auto mb-2 text-primary" />
                    <p>Cargando gastos del mes...</p>
                  </div>
                </div>
              ) : paginatedResumenExpenses.length > 0 ? (
                <div className="space-y-4">
                  {/* Tabla de gastos */}
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2 font-semibold">Fecha</th>
                          <th className="text-left p-2 font-semibold">Descripción</th>
                          <th className="text-left p-2 font-semibold">Monto</th>
                          <th className="text-left p-2 font-semibold">Categoría</th>
                          <th className="text-left p-2 font-semibold">Método Pago</th>
                          <th className="text-left p-2 font-semibold">Cajero</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedResumenExpenses.map((expense) => (
                          <tr key={expense.id} className="border-b hover:bg-muted/50">
                            <td className="p-2 text-sm">
                              {formatDateTime(expense.fecha || expense.fechaCreacion)}
                            </td>
                            <td className="p-2 font-medium">
                              {expense.descripcion}
                            </td>
                            <td className="p-2 font-bold text-destructive">
                              {formatCurrency(parseFloat(expense.monto || 0))}
                            </td>
                            <td className="p-2">
                              <Badge variant="outline">{expense.categoria}</Badge>
                            </td>
                            <td className="p-2">
                              <Badge variant="secondary">{expense.metodoPago}</Badge>
                            </td>
                            <td className="p-2 text-sm text-muted-foreground">
                              {expense.cajero}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Paginación */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">
                        Mostrando {(currentPage - 1) * itemsPerPage + 1} a{' '}
                        {Math.min(currentPage * itemsPerPage, resumenTotal)} de {resumenTotal} gastos
                      </p>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                          disabled={currentPage === 1}
                        >
                          Anterior
                        </Button>
                        <span className="text-sm">
                          Página {currentPage} de {totalPages}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                          disabled={currentPage === totalPages}
                        >
                          Siguiente
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Receipt className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-lg font-semibold mb-2">No hay gastos este mes</p>
                  <p className="text-muted-foreground">Los gastos del mes actual aparecerán aquí</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="expenses" className="space-y-4">
          {/* Filtros - REQUERIMIENTO 2 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filtros de Fecha
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Fecha Inicio</Label>
                  <Input
                    type="date"
                    value={filtroFechaInicio}
                    onChange={(e) => setFiltroFechaInicio(e.target.value)}
                    placeholder="Selecciona fecha inicio"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Fecha Fin</Label>
                  <Input
                    type="date"
                    value={filtroFechaFin}
                    onChange={(e) => setFiltroFechaFin(e.target.value)}
                    placeholder="Selecciona fecha fin"
                  />
                </div>
                <div className="space-y-2">
                  <Label>&nbsp;</Label>
                  <Button 
                    onClick={aplicarFiltrosFecha}
                    disabled={isLoadingGastos || !filtroFechaInicio || !filtroFechaFin}
                    className="w-full"
                  >
                    {isLoadingGastos ? (
                      <>
                        <Receipt className="h-4 w-4 animate-spin mr-2" />
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
              
              {gastosTotal > 0 && (
                <div className="mt-4 p-3 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    Se encontraron <span className="font-semibold">{gastosTotal}</span> gastos 
                    entre {filtroFechaInicio} y {filtroFechaFin}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Lista de gastos filtrados - REQUERIMIENTO 2 */}
          <Card>
            <CardHeader>
              <CardTitle>Gastos Filtrados</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingGastos ? (
                <div className="flex items-center justify-center h-32">
                  <div className="text-center">
                    <Receipt className="h-8 w-8 animate-spin mx-auto mb-2 text-primary" />
                    <p>Cargando gastos filtrados...</p>
                  </div>
                </div>
              ) : gastosExpenses.length > 0 ? (
                <div className="space-y-4">
                  {/* Tabla de gastos filtrados */}
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2 font-semibold">Fecha</th>
                          <th className="text-left p-2 font-semibold">Descripción</th>
                          <th className="text-left p-2 font-semibold">Monto</th>
                          <th className="text-left p-2 font-semibold">Categoría</th>
                          <th className="text-left p-2 font-semibold">Método Pago</th>
                          <th className="text-left p-2 font-semibold">Cajero</th>
                        </tr>
                      </thead>
                      <tbody>
                        {gastosExpenses.map((expense) => (
                          <tr key={expense.id} className="border-b hover:bg-muted/50">
                            <td className="p-2 text-sm">
                              {formatDateTime(expense.fecha || expense.fechaCreacion)}
                            </td>
                            <td className="p-2 font-medium">
                              {expense.descripcion}
                            </td>
                            <td className="p-2 font-bold text-destructive">
                              {formatCurrency(parseFloat(expense.monto || 0))}
                            </td>
                            <td className="p-2">
                              <Badge variant="outline">{expense.categoria}</Badge>
                            </td>
                            <td className="p-2">
                              <Badge variant="secondary">{expense.metodoPago}</Badge>
                            </td>
                            <td className="p-2 text-sm text-muted-foreground">
                              {expense.cajero}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : gastosTotal === 0 && (filtroFechaInicio || filtroFechaFin) ? (
                <div className="text-center py-8">
                  <Receipt className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-lg font-semibold mb-2">No se encontraron gastos</p>
                  <p className="text-muted-foreground">
                    No hay gastos en el rango de fechas seleccionado
                  </p>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-lg font-semibold mb-2">Selecciona un rango de fechas</p>
                  <p className="text-muted-foreground">
                    Usa los filtros de fecha y presiona APLICAR para ver los gastos
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Análisis por Categoría</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {EXPENSE_CATEGORIES.map((category) => {
                  const categoryExpenses = expenses.filter(e => e.category === category);
                  const categoryTotal = categoryExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
                  const percentage = totalExpenses > 0 ? (categoryTotal / totalExpenses) * 100 : 0;
                  
                  return (
                    <div key={category} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{category}</span>
                        <span className="text-sm text-muted-foreground">
                          S/ {categoryTotal.toFixed(2)} ({percentage.toFixed(1)}%)
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full transition-all duration-300" 
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
