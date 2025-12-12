import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Receipt, Plus, Search, Calendar, User, Filter, DollarSign, TrendingUp, Trash2, Pencil } from 'lucide-react';
import { toast } from 'sonner';
import { 
  useExpenses, 
  useExpenseCategories, 
  useExpenseStatistics, 
  useExpensesToday,
  useCreateExpense,
  useUpdateExpense,
  useDeleteExpense
} from '@/hooks/useExpenses';
import type { Expense } from '@/types';

export default function Gastos() {
  // Estados para filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [cashierFilter, setCashierFilter] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  
  // Estados para formularios
  const [isExpenseDialogOpen, setIsExpenseDialogOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [expenseData, setExpenseData] = useState({
    descripcion: '',
    monto: 0,
    categoria: '',
    metodoPago: 'EFECTIVO',
    proveedor: '',
    numeroComprobante: '',
    comprobante: '',
  });

  // Hooks de datos
  const { data: expenses = [], isLoading } = useExpenses({ search: searchTerm });
  const { data: categories = [] } = useExpenseCategories();
  const { data: todayExpenses = [] } = useExpensesToday();
  const { data: statistics } = useExpenseStatistics();
  
  // Hooks de mutaciones
  const createExpense = useCreateExpense();
  const updateExpense = useUpdateExpense();
  const deleteExpense = useDeleteExpense();

  // Filtrar gastos
  const filteredExpenses = expenses.filter(expense => {
    const matchesCategory = categoryFilter === 'all' || expense.category === categoryFilter;
    const matchesCashier = cashierFilter === 'all' || expense.cashier === cashierFilter;
    
    let matchesDateRange = true;
    if (dateFrom && dateTo) {
      const expenseDate = new Date(expense.date);
      const fromDate = new Date(dateFrom);
      const toDate = new Date(dateTo);
      matchesDateRange = expenseDate >= fromDate && expenseDate <= toDate;
    }
    
    return matchesCategory && matchesCashier && matchesDateRange;
  });

  // Obtener cajeros únicos para el filtro
  const uniqueCashiers = [...new Set(expenses.map(e => e.cashier))];

  // Calcular totales
  const totalExpenses = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
  const todayTotal = todayExpenses.reduce((sum, e) => sum + e.amount, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!expenseData.descripcion || expenseData.monto <= 0 || !expenseData.categoria) {
      toast.error('Por favor completa todos los campos requeridos');
      return;
    }

    try {
      const payload = {
        descripcion: expenseData.descripcion,
        monto: expenseData.monto,
        categoria: expenseData.categoria,
        metodoPago: expenseData.metodoPago,
        proveedor: expenseData.proveedor,
        numeroComprobante: expenseData.numeroComprobante,
        comprobante: expenseData.comprobante,
      };

      if (editingExpense) {
        await updateExpense.mutateAsync({ id: editingExpense.id, data: payload });
        toast.success('Gasto actualizado correctamente');
      } else {
        await createExpense.mutateAsync(payload);
        toast.success('Gasto registrado correctamente');
      }
      
      setIsExpenseDialogOpen(false);
      resetForm();
    } catch (error) {
      toast.error('Error al guardar gasto');
      console.error('Error saving expense:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar este gasto?')) return;
    
    try {
      await deleteExpense.mutateAsync(id);
      toast.success('Gasto eliminado correctamente');
    } catch (error) {
      toast.error('Error al eliminar gasto');
      console.error('Error deleting expense:', error);
    }
  };

  const openEditDialog = (expense: Expense) => {
    setEditingExpense(expense);
    setExpenseData({
      descripcion: expense.description,
      monto: expense.amount,
      categoria: expense.category,
      metodoPago: expense.paymentMethod,
      proveedor: expense.supplier || '',
      numeroComprobante: expense.receiptNumber || '',
      comprobante: expense.receiptUrl || '',
    });
    setIsExpenseDialogOpen(true);
  };

  const resetForm = () => {
    setEditingExpense(null);
    setExpenseData({
      descripcion: '',
      monto: 0,
      categoria: '',
      metodoPago: 'EFECTIVO',
      proveedor: '',
      numeroComprobante: '',
      comprobante: '',
    });
  };

  const getPaymentMethodBadge = (method: string) => {
    const variants: Record<string, any> = {
      'EFECTIVO': 'default',
      'YAPE': 'secondary',
      'PLIN': 'secondary',
      'TARJETA': 'outline',
      'TRANSFERENCIA': 'outline',
    };
    return variants[method] || 'default';
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'OPERATIVO': 'text-blue-600',
      'MARKETING': 'text-purple-600',
      'MANTENIMIENTO': 'text-orange-600',
      'SERVICIOS': 'text-green-600',
      'OTROS': 'text-gray-600',
    };
    return colors[category] || 'text-gray-600';
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold mb-2">Gastos</h1>
        <p className="text-muted-foreground">Control y gestión de gastos del negocio</p>
      </div>

      <Tabs defaultValue="expenses" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="expenses">Gastos</TabsTrigger>
          <TabsTrigger value="categories">Categorías</TabsTrigger>
          <TabsTrigger value="statistics">Estadísticas</TabsTrigger>
        </TabsList>

        {/* Tab de Gastos */}
        <TabsContent value="expenses" className="space-y-4">
          {/* Resumen rápido */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-red-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">Total Gastos</p>
                    <p className="text-2xl font-bold text-red-600">S/ {totalExpenses.toFixed(2)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Hoy</p>
                    <p className="text-2xl font-bold">S/ {todayTotal.toFixed(2)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Receipt className="h-4 w-4 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Total Registros</p>
                    <p className="text-2xl font-bold">{filteredExpenses.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filtros y acciones */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Lista de Gastos</span>
                <Dialog open={isExpenseDialogOpen} onOpenChange={setIsExpenseDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={resetForm}>
                      <Plus className="h-4 w-4 mr-2" />
                      Nuevo Gasto
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>{editingExpense ? 'Editar Gasto' : 'Registrar Gasto'}</DialogTitle>
                      <DialogDescription>
                        {editingExpense ? 'Actualiza la información del gasto' : 'Registra un nuevo gasto del negocio'}
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <Label>Descripción *</Label>
                        <Input
                          value={expenseData.descripcion}
                          onChange={(e) => setExpenseData({ ...expenseData, descripcion: e.target.value })}
                          placeholder="Descripción del gasto"
                          required
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Monto S/ *</Label>
                          <Input
                            type="number"
                            step="0.01"
                            min="0.01"
                            value={expenseData.monto}
                            onChange={(e) => setExpenseData({ ...expenseData, monto: parseFloat(e.target.value) || 0 })}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Categoría *</Label>
                          <Select value={expenseData.categoria} onValueChange={(value) => setExpenseData({ ...expenseData, categoria: value })}>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar" />
                            </SelectTrigger>
                            <SelectContent>
                              {categories.map((category) => (
                                <SelectItem key={category} value={category}>
                                  {category}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Método de Pago</Label>
                        <Select value={expenseData.metodoPago} onValueChange={(value) => setExpenseData({ ...expenseData, metodoPago: value })}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="EFECTIVO">Efectivo</SelectItem>
                            <SelectItem value="YAPE">Yape</SelectItem>
                            <SelectItem value="PLIN">Plin</SelectItem>
                            <SelectItem value="TARJETA">Tarjeta</SelectItem>
                            <SelectItem value="TRANSFERENCIA">Transferencia</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Proveedor</Label>
                        <Input
                          value={expenseData.proveedor}
                          onChange={(e) => setExpenseData({ ...expenseData, proveedor: e.target.value })}
                          placeholder="Nombre del proveedor"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Número de Comprobante</Label>
                        <Input
                          value={expenseData.numeroComprobante}
                          onChange={(e) => setExpenseData({ ...expenseData, numeroComprobante: e.target.value })}
                          placeholder="F001-00001234"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>URL del Comprobante</Label>
                        <Input
                          value={expenseData.comprobante}
                          onChange={(e) => setExpenseData({ ...expenseData, comprobante: e.target.value })}
                          placeholder="https://ejemplo.com/comprobante.pdf"
                        />
                      </div>
                      <DialogFooter>
                        <Button type="submit" disabled={createExpense.isPending || updateExpense.isPending}>
                          {editingExpense ? 'Actualizar' : 'Registrar'} Gasto
                        </Button>
                      </DialogFooter>
                    </form>
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
                      placeholder="Descripción, proveedor..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Categoría</Label>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
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

              {/* Tabla de gastos */}
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Descripción</TableHead>
                      <TableHead>Monto</TableHead>
                      <TableHead>Categoría</TableHead>
                      <TableHead>Método Pago</TableHead>
                      <TableHead>Proveedor</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">
                          Cargando gastos...
                        </TableCell>
                      </TableRow>
                    ) : filteredExpenses.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          No se encontraron gastos
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredExpenses.map((expense) => (
                        <TableRow key={expense.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{expense.description}</p>
                              {expense.receiptNumber && (
                                <p className="text-xs text-muted-foreground">
                                  Comprobante: {expense.receiptNumber}
                                </p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="font-semibold text-red-600">
                              S/ {expense.amount.toFixed(2)}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={getCategoryColor(expense.category)}>
                              {expense.category}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={getPaymentMethodBadge(expense.paymentMethod)}>
                              {expense.paymentMethod}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {expense.supplier || '-'}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3 text-muted-foreground" />
                              {new Date(expense.date).toLocaleString('es-PE')}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => openEditDialog(expense)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => handleDelete(expense.id)}
                                disabled={deleteExpense.isPending}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
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

        {/* Tab de Categorías */}
        <TabsContent value="categories" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Categorías de Gastos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {categories.map((category) => {
                  const categoryExpenses = expenses.filter(e => e.category === category);
                  const categoryTotal = categoryExpenses.reduce((sum, e) => sum + e.amount, 0);
                  
                  return (
                    <Card key={category}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold">{category}</h3>
                            <p className="text-sm text-muted-foreground">
                              {categoryExpenses.length} gastos
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-red-600">
                              S/ {categoryTotal.toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
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
                      <p className="text-2xl font-bold text-red-600">S/ {statistics.totalGastos?.toFixed(2) || '0.00'}</p>
                      <p className="text-sm text-muted-foreground">Total Gastos</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold">{statistics.totalRegistros || 0}</p>
                      <p className="text-sm text-muted-foreground">Total Registros</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-orange-600">S/ {statistics.promedioMensual?.toFixed(2) || '0.00'}</p>
                      <p className="text-sm text-muted-foreground">Promedio Mensual</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">{statistics.categoriaMasUsada || '-'}</p>
                      <p className="text-sm text-muted-foreground">Categoría Principal</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

