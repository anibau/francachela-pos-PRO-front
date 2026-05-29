import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Loader2, Plus, Edit, Trash2, TrendingUp, DollarSign, Calendar } from 'lucide-react';
import { useEntradas } from '@/hooks/useEntradas';
import type { CreateEntradaRequest } from '@/types';
import { format, startOfMonth, endOfMonth, subDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { CategorySelector } from '@/components/ui/CategoriesSelector';
import { toast } from 'sonner';

const CATEGORIAS_ENTRADAS = [
  'DONACION',
  'VENTA_ACTIVOS',
  'PRESTAMO',
  'INVERSION',
  'OTROS'
];

const FILTROS_FECHA = [
  { label: '7 días', value: '7d' },
  { label: '30 días', value: '30d' },
  { label: 'Mes actual', value: 'month' }
];

export function EntradasSection() {
  const {
    entradas,
    estadisticas,
    resumen,
    loading,
    pagination,
    fetchEntradas,
    fetchEntradasByRange,
    fetchEstadisticas,
    createEntrada,
    updateEntrada,
    deleteEntrada
  } = useEntradas();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingEntrada, setEditingEntrada] = useState<any>(null);
  const [filtroFecha, setFiltroFecha] = useState('month');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');

  // Formulario
  const [formData, setFormData] = useState<CreateEntradaRequest>({
    monto: 0,
    descripcion: '',
    categoria: '',
    fecha: format(new Date(), 'yyyy-MM-dd'),
    observaciones: ''
  });

  // TAREA 4: Función para validar fecha (no permitir fechas futuras)
  const validateDate = useCallback((dateString: string) => {
    const selectedDate = new Date(dateString);
    const today = new Date();
    today.setHours(23, 59, 59, 999); // Permitir hasta el final del día actual
    
    if (selectedDate > today) {
      toast.error('No se pueden seleccionar fechas futuras');
      return false;
    }
    return true;
  }, []);

  // Función para manejar cambio de fecha con validación
  const handleDateChange = useCallback((dateString: string) => {
    if (validateDate(dateString)) {
      setFormData(prev => ({ ...prev, fecha: dateString }));
    } else {
      // Revertir a la fecha actual si es inválida
      setFormData(prev => ({ ...prev, fecha: format(new Date(), 'yyyy-MM-dd') }));
    }
  }, [validateDate]);

  // Calcular fechas según filtro
  const calcularFechas = (filtro: string) => {
    const hoy = new Date();
    let inicio: Date;
    let fin: Date;

    switch (filtro) {
      case '7d':
        inicio = subDays(hoy, 7);
        fin = hoy;
        break;
      case '30d':
        inicio = subDays(hoy, 30);
        fin = hoy;
        break;
      case 'month':
      default:
        inicio = startOfMonth(hoy);
        fin = endOfMonth(hoy);
        break;
    }

    return {
      inicio: format(inicio, 'yyyy-MM-dd'),
      fin: format(fin, 'yyyy-MM-dd')
    };
  };

  // Aplicar filtro de fecha
  useEffect(() => {
    const { inicio, fin } = calcularFechas(filtroFecha);
    setFechaInicio(inicio);
    setFechaFin(fin);
    fetchEntradasByRange(inicio, fin);
    fetchEstadisticas(inicio, fin);
  }, [filtroFecha, fetchEntradasByRange, fetchEstadisticas]);

  // Manejar envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingEntrada) {
        await updateEntrada(editingEntrada.id, formData);
        setIsEditDialogOpen(false);
        setEditingEntrada(null);
      } else {
        await createEntrada(formData);
        setIsCreateDialogOpen(false);
      }
      
      // Resetear formulario
      setFormData({
        monto: 0,
        descripcion: '',
        categoria: '',
        fecha: format(new Date(), 'yyyy-MM-dd'),
        observaciones: ''
      });

      // Refrescar datos
      const { inicio, fin } = calcularFechas(filtroFecha);
      fetchEntradasByRange(inicio, fin);
      fetchEstadisticas(inicio, fin);
    } catch (error) {
      console.error('Error al guardar entrada:', error);
    }
  };

  // Abrir modal de edición
  const handleEdit = (entrada: any) => {
    setEditingEntrada(entrada);
    setFormData({
      monto: entrada.monto,
      descripcion: entrada.descripcion,
      categoria: entrada.categoria,
      fecha: entrada.fecha.split('T')[0], // Extraer solo la fecha
      observaciones: entrada.observaciones || ''
    });
    setIsEditDialogOpen(true);
  };

  // Función para resetear el formulario
  const resetForm = useCallback(() => {
    setFormData({
      monto: 0,
      descripcion: '',
      categoria: '',
      fecha: format(new Date(), 'yyyy-MM-dd'),
      observaciones: ''
    });
    setEditingEntrada(null);
  }, []);

  // Eliminar entrada
  const handleDelete = async (id: number) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta entrada?')) {
      try {
        await deleteEntrada(id);
        // Refrescar datos
        const { inicio, fin } = calcularFechas(filtroFecha);
        fetchEntradasByRange(inicio, fin);
        fetchEstadisticas(inicio, fin);
      } catch (error) {
        console.error('Error al eliminar entrada:', error);
      }
    }
  };

  // DEFECTO 1: Memoizar FormularioEntrada para evitar re-renders y pérdida de foco
  const FormularioEntrada = useCallback(({ isEdit = false }: { isEdit?: boolean }) => {
    // Handlers memoizados para evitar re-renders
    const handleMontoChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setFormData(prev => ({ 
        ...prev, 
        monto: value === '' ? 0 : parseFloat(value) || 0 
      }));
    }, []);

    const handleDescripcionChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData(prev => ({ ...prev, descripcion: e.target.value }));
    }, []);

    const handleObservacionesChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setFormData(prev => ({ ...prev, observaciones: e.target.value }));
    }, []);

    const handleCategoriaChange = useCallback((value: string) => {
      setFormData(prev => ({ ...prev, categoria: value }));
    }, []);

    const handleCancel = useCallback(() => {
      if (isEdit) {
        setIsEditDialogOpen(false);
        setEditingEntrada(null);
      } else {
        setIsCreateDialogOpen(false);
      }
      resetForm();
    }, [isEdit]);

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="monto">Monto (S/)</Label>
            <Input
              id="monto"
              type="number"
              step="0.01"
              min="0"
              value={formData.monto === 0 ? '' : formData.monto.toString()}
              onChange={handleMontoChange}
              placeholder="0.00"
              required
              autoComplete="off"
            />
          </div>
          <div>
            <Label htmlFor="fecha">Fecha</Label>
            <Input
              id="fecha"
              type="date"
              value={formData.fecha}
              onChange={(e) => handleDateChange(e.target.value)}
              max={format(new Date(), 'yyyy-MM-dd')} // TAREA 4: Máximo hasta hoy
              required
              autoComplete="off"
            />
          </div>
        </div>

        <div>
          <Label>Categoría</Label>
          {/* DEFECTO 2: Usar GET /entradas para filtrar categorías existentes */}
          <CategorySelector
            value={formData.categoria}
            onValueChange={handleCategoriaChange}
            placeholder="Seleccionar categoría de entrada..."
            allowCreate={true}
            endpoint="/entradas" // DEFECTO 2: Usar endpoint correcto
            filterField="categoria" // DEFECTO 2: Campo para filtrar categorías
          />
        </div>

        <div>
          <Label htmlFor="descripcion">Descripción</Label>
          <Input
            id="descripcion"
            value={formData.descripcion}
            onChange={handleDescripcionChange}
            placeholder="Descripción de la entrada"
            required
            autoComplete="off"
          />
        </div>

        <div>
          <Label htmlFor="observaciones">Observaciones</Label>
          <Textarea
            id="observaciones"
            value={formData.observaciones || ''}
            onChange={handleObservacionesChange}
            placeholder="Observaciones adicionales (opcional)"
            rows={3}
            autoComplete="off"
          />
        </div>

        <div className="flex justify-end space-x-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {isEdit ? 'Actualizando...' : 'Creando...'}
              </>
            ) : (
              isEdit ? 'Actualizar' : 'Crear'
            )} Entrada
          </Button>
        </div>
      </form>
    );
  }, [formData, loading, handleDateChange, handleSubmit, resetForm]);

  return (
    <div className="space-y-6">
      {/* Header con filtros */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Entradas</h2>
        <div className="flex items-center space-x-4">
          {/* Filtros de fecha */}
          <Select value={filtroFecha} onValueChange={setFiltroFecha}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FILTROS_FECHA.map(filtro => (
                <SelectItem key={filtro.value} value={filtro.value}>
                  {filtro.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Botón crear entrada */}
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nueva Entrada
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Crear Nueva Entrada</DialogTitle>
              </DialogHeader>
              <FormularioEntrada />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Estadísticas */}
      {estadisticas?.resumen && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Entradas</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{estadisticas.resumen.totalEntradas}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monto Total</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">S/ {estadisticas.resumen.totalMonto.toFixed(2)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Promedio</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">S/ {estadisticas.resumen.promedioMonto.toFixed(2)}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Lista de entradas */}
      <Card>
        <CardHeader>
          <CardTitle>Historial de Entradas</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : entradas.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No hay entradas registradas en el período seleccionado
            </div>
          ) : (
            <div className="space-y-4">
              {entradas.map((entrada) => (
                <div
                  key={entrada.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-medium">{entrada.descripcion}</h3>
                      <Badge variant="secondary">
                        {entrada.categoria.replace('_', ' ')}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(entrada.fecha), 'dd/MM/yyyy', { locale: es })}
                    </p>
                    {entrada.observaciones && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {entrada.observaciones}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="font-bold text-green-600">
                        +S/ {entrada.monto.toFixed(2)}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(entrada)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(entrada.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Paginación Dinámica */}
      {pagination.total > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Mostrando {((pagination.page - 1) * pagination.limit) + 1} a{' '}
                {Math.min(pagination.page * pagination.limit, pagination.total)} de{' '}
                {pagination.total} entradas
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchEntradas(pagination.page - 1, pagination.limit)}
                  disabled={pagination.page <= 1 || loading}
                >
                  Anterior
                </Button>
                <div className="text-sm">
                  Página {pagination.page} de {pagination.pages}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchEntradas(pagination.page + 1, pagination.limit)}
                  disabled={pagination.page >= pagination.pages || loading}
                >
                  Siguiente
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Modal de edición */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Entrada</DialogTitle>
          </DialogHeader>
          <FormularioEntrada isEdit />
        </DialogContent>
      </Dialog>
    </div>
  );
}
