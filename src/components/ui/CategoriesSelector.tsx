import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Check, ChevronsUpDown, Plus, Search, X } from 'lucide-react';
import { toast } from 'sonner';
import { httpClient } from '@/services/httpClient';
import { API_ENDPOINTS } from '@/config/api';
import type { CategoriaOption, CategoriasResponse } from '@/types';
import { cn } from '@/lib/utils';

interface CategoriesSelectorProps {
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  allowCreate?: boolean;
  endpoint?: string; // Endpoint personalizado para obtener categorías
  filterField?: string; // DEFECTO 2: Campo para filtrar categorías desde el endpoint
  disabled?: boolean;
  className?: string;
}

export default function CategoriesSelector({
  value,
  onValueChange,
  placeholder = "Seleccionar categoría...",
  allowCreate = true,
  endpoint,
  filterField, // DEFECTO 2: Campo para filtrar categorías
  disabled = false,
  className
}: CategoriesSelectorProps) {
  const [open, setOpen] = useState(false);
  const [categories, setCategories] = useState<CategoriaOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryDescription, setNewCategoryDescription] = useState('');

  // Función para cargar categorías
  const loadCategories = async () => {
    setIsLoading(true);
    try {
      // Usar endpoint personalizado o el de gastos por defecto
      const url = endpoint || API_ENDPOINTS.EXPENSES.CATEGORIES;
      const response = await httpClient.get<any>(url);
      
      let categoriesData: CategoriaOption[] = [];
      
      // DEFECTO 2: Si hay filterField, filtrar categorías desde el endpoint
      if (filterField && response) {
        // Extraer categorías únicas del campo especificado
        const items = Array.isArray(response) ? response : (response.data || response.entradas || []);
        const uniqueCategories = [...new Set(
          items
            .map((item: any) => item[filterField])
            .filter((cat: string) => cat && cat.trim() !== '')
        )];
        
        // Convertir a formato CategoriaOption
        categoriesData = uniqueCategories.map((cat: string) => ({
          nombre: cat,
          descripcion: `Categoría: ${cat}`,
          activo: true
        }));
      } else {
        // Manejar diferentes formatos de respuesta tradicionales
        if (Array.isArray(response)) {
          categoriesData = response;
        } else if (response.categorias) {
          categoriesData = response.categorias;
        } else {
          categoriesData = [];
        }
      }
      
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error loading categories:', error);
      toast.error('Error al cargar categorías');
      setCategories([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Cargar categorías al montar el componente
  useEffect(() => {
    loadCategories();
  }, [endpoint, filterField]); // DEFECTO 2: Recargar cuando cambie filterField

  // Función para crear nueva categoría
  const createCategory = async () => {
    if (!newCategoryName.trim()) {
      toast.error('El nombre de la categoría es requerido');
      return;
    }

    try {
      const newCategory: CategoriaOption = {
        nombre: newCategoryName.trim(),
        descripcion: newCategoryDescription.trim() || undefined,
        activo: true
      };

      // Intentar crear la categoría en el backend
      const url = endpoint || API_ENDPOINTS.EXPENSES.CATEGORIES;
      const createdCategory = await httpClient.post<CategoriaOption>(url, newCategory);
      
      // Agregar la nueva categoría a la lista local
      setCategories(prev => [...prev, createdCategory]);
      
      // Seleccionar la nueva categoría
      onValueChange(createdCategory.nombre);
      
      // Limpiar formulario y cerrar dialog
      setNewCategoryName('');
      setNewCategoryDescription('');
      setIsCreateDialogOpen(false);
      setOpen(false);
      
      toast.success('Categoría creada correctamente');
    } catch (error) {
      console.error('Error creating category:', error);
      toast.error('Error al crear categoría');
    }
  };

  // Filtrar categorías según término de búsqueda
  const filteredCategories = categories.filter(category =>
    category.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (category.descripcion && category.descripcion.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Obtener categoría seleccionada
  const selectedCategory = categories.find(cat => cat.nombre === value);

  return (
    <div className={className}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
            disabled={disabled}
          >
            {selectedCategory ? (
              <div className="flex items-center gap-2">
                <span>{selectedCategory.nombre}</span>
                {selectedCategory.descripcion && (
                  <Badge variant="secondary" className="text-xs">
                    {selectedCategory.descripcion}
                  </Badge>
                )}
              </div>
            ) : (
              placeholder
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <Command>
            <CommandInput 
              placeholder="Buscar categoría..." 
              value={searchTerm}
              onValueChange={setSearchTerm}
            />
            <CommandList>
              <CommandEmpty>
                <div className="text-center py-4">
                  <Search className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">No se encontraron categorías</p>
                  {allowCreate && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={() => setIsCreateDialogOpen(true)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Crear nueva categoría
                    </Button>
                  )}
                </div>
              </CommandEmpty>
              <CommandGroup>
                {isLoading ? (
                  <div className="flex items-center justify-center py-4">
                    <div className="text-sm text-muted-foreground">Cargando categorías...</div>
                  </div>
                ) : (
                  filteredCategories.map((category) => (
                    <CommandItem
                      key={category.id || category.nombre}
                      value={category.nombre}
                      onSelect={(currentValue) => {
                        onValueChange(currentValue === value ? "" : currentValue);
                        setOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          value === category.nombre ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <div className="flex-1">
                        <div className="font-medium">{category.nombre}</div>
                        {category.descripcion && (
                          <div className="text-xs text-muted-foreground">{category.descripcion}</div>
                        )}
                      </div>
                    </CommandItem>
                  ))
                )}
              </CommandGroup>
              {allowCreate && filteredCategories.length > 0 && (
                <CommandGroup>
                  <CommandItem
                    onSelect={() => setIsCreateDialogOpen(true)}
                    className="text-primary"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Crear nueva categoría
                  </CommandItem>
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Dialog para crear nueva categoría */}
      {allowCreate && (
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Crear Nueva Categoría</DialogTitle>
              <DialogDescription>
                Agrega una nueva categoría que podrás usar en el futuro.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="category-name">Nombre *</Label>
                <Input
                  id="category-name"
                  placeholder="Nombre de la categoría"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      createCategory();
                    }
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category-description">Descripción (opcional)</Label>
                <Input
                  id="category-description"
                  placeholder="Descripción de la categoría"
                  value={newCategoryDescription}
                  onChange={(e) => setNewCategoryDescription(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      createCategory();
                    }
                  }}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setNewCategoryName('');
                  setNewCategoryDescription('');
                  setIsCreateDialogOpen(false);
                }}
              >
                Cancelar
              </Button>
              <Button onClick={createCategory} disabled={!newCategoryName.trim()}>
                <Plus className="h-4 w-4 mr-2" />
                Crear Categoría
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Mostrar categoría seleccionada con opción de limpiar */}
      {value && (
        <div className="flex items-center gap-2 mt-2">
          <Badge variant="default" className="flex items-center gap-1">
            {value}
            <Button
              variant="ghost"
              size="sm"
              className="h-4 w-4 p-0 hover:bg-transparent"
              onClick={() => onValueChange('')}
            >
              <X className="h-3 w-3" />
            </Button>
          </Badge>
        </div>
      )}
    </div>
  );
}
