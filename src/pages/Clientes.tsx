import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Users, Star, Plus, Pencil, Trash2, Search, AlertCircle, Check } from "lucide-react";
import { toast } from "sonner";
import { useClients, useCreateClient, useUpdateClient, useDeleteClient } from "@/hooks";
import { clientsService } from '@/services/clientsService';
import type { Client } from "@/types";

// Validaciones en tiempo real
interface ValidationErrors {
  firstName?: string;
  lastName?: string;
  dni?: string;
  phone?: string;
}

export default function Clientes() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [dniValidating, setDniValidating] = useState(false);
  const [dniAvailable, setDniAvailable] = useState<boolean | null>(null);
  const ITEMS_PER_PAGE = 10;

  // Usar los nuevos hooks
  const { data: clientes = [], isLoading, error, refetch } = useClients();
  const createClientMutation = useCreateClient();
  const updateClientMutation = useUpdateClient();
  const deleteClientMutation = useDeleteClient();
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dni: '',
    phone: '',
    address: '',
    birthday: '',
    points: 0,
  });

  // Validación en tiempo real del DNI
  const validateDni = useCallback(async (dni: string, excludeId?: number) => {
    if (!dni || dni.length !== 8) {
      setDniAvailable(null);
      return;
    }
    
    setDniValidating(true);
    try {
      const isAvailable = await clientsService.validateDni(dni, excludeId);
      setDniAvailable(isAvailable);
      if (!isAvailable) {
        setValidationErrors(prev => ({ ...prev, dni: 'Este DNI ya está registrado' }));
      } else {
        setValidationErrors(prev => {
          const { dni: _, ...rest } = prev;
          return rest;
        });
      }
    } catch (error) {
      console.error('Error validating DNI:', error);
    } finally {
      setDniValidating(false);
    }
  }, []);

  // Debounce para validación de DNI
  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.dni.length === 8) {
        validateDni(formData.dni, editingClient?.id);
      }
    }, 500);
    
    return () => clearTimeout(timer);
  }, [formData.dni, editingClient?.id, validateDni]);

  // Validaciones en tiempo real
  const validateField = (field: string, value: string) => {
    const errors: ValidationErrors = { ...validationErrors };
    
    switch (field) {
      case 'firstName':
        if (!value.trim()) {
          errors.firstName = 'El nombre es requerido';
        } else if (value.length < 2) {
          errors.firstName = 'El nombre debe tener al menos 2 caracteres';
        } else {
          delete errors.firstName;
        }
        break;
      case 'lastName':
        if (!value.trim()) {
          errors.lastName = 'El apellido es requerido';
        } else if (value.length < 2) {
          errors.lastName = 'El apellido debe tener al menos 2 caracteres';
        } else {
          delete errors.lastName;
        }
        break;
      case 'dni':
        if (!value) {
          errors.dni = 'El DNI es requerido';
        } else if (!/^\d{8}$/.test(value)) {
          errors.dni = 'El DNI debe tener 8 dígitos';
        } else {
          delete errors.dni;
        }
        break;
      case 'phone':
        if (!value) {
          errors.phone = 'El teléfono es requerido';
        } else if (!/^\d{9}$/.test(value)) {
          errors.phone = 'El teléfono debe tener 9 dígitos';
        } else {
          delete errors.phone;
        }
        break;
    }
    
    setValidationErrors(errors);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    validateField(field, value);
  };

  const isFormValid = () => {
    return (
      formData.firstName.trim().length >= 2 &&
      formData.lastName.trim().length >= 2 &&
      /^\d{8}$/.test(formData.dni) &&
      /^\d{9}$/.test(formData.phone) &&
      Object.keys(validationErrors).length === 0 &&
      (dniAvailable === true || editingClient !== null)
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isFormValid()) {
      toast.error('Por favor corrige los errores en el formulario');
      return;
    }
    
    try {
      const clientData = {
        nombres: formData.firstName,
        apellidos: formData.lastName,
        dni: formData.dni,
        telefono: `+51${formData.phone}`,
        direccion: formData.address,
        fechaNacimiento: formData.birthday,
        //puntosAcumulados: formData.points,
      };
      
      if (editingClient) {
        await updateClientMutation.mutateAsync({ 
          id: editingClient.id, 
          data: clientData 
        });
        toast.success('Cliente actualizado correctamente');
      } else {
        await createClientMutation.mutateAsync(clientData as Omit<Client, 'id'>);
        toast.success('Cliente creado correctamente');
      }
      
      setIsDialogOpen(false);
      resetForm();
      refetch();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al guardar cliente';
      toast.error(errorMessage);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar este cliente?')) return;
    
    try {
      await deleteClientMutation.mutateAsync(id);
      toast.success('Cliente eliminado correctamente');
      refetch();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al eliminar cliente';
      toast.error(errorMessage);
    }
  };

  const openEditDialog = (client: Client) => {
    setEditingClient(client);
    setDniAvailable(true); // El DNI actual es válido
    setValidationErrors({});
    
    setFormData({
      firstName: client.nombres,
      lastName: client.apellidos,
      dni: client.dni,
      phone: (client.telefono || '').replace(/^\+?51/, ''),
      address: client.direccion || '',
      birthday: client.fechaNacimiento || '',
      points: client.puntosAcumulados || 0,
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setEditingClient(null);
    setValidationErrors({});
    setDniAvailable(null);
    setFormData({
      firstName: '',
      lastName: '',
      dni: '',
      phone: '',
      address: '',
      birthday: '',
      points: 0,
    });
  };

  // Filtrar clientes localmente (sin usar el endpoint de búsqueda)
  const filteredClientes = (clientes || []).filter(cliente => {
    if (!cliente?.nombres || !cliente?.dni) return false;
    
    const searchTermLower = searchTerm.toLowerCase();
    return (
      cliente.nombres.toLowerCase().includes(searchTermLower) ||
      cliente.apellidos.toLowerCase().includes(searchTermLower) ||
      cliente.dni.includes(searchTerm) ||
      (cliente.telefono || '').includes(searchTerm)
    );
  });

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">Cargando clientes...</div>;
  }

  return (
    <div className="space-y-6 animate-fade-in p-4 lg:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold mb-2">Gestión de Clientes</h1>
          <p className="text-muted-foreground">Administra tus clientes y sus puntos de fidelidad</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Cliente
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingClient ? 'Editar Cliente' : 'Nuevo Cliente'}</DialogTitle>
              <DialogDescription>
                {editingClient ? 'Actualiza la información del cliente' : 'Completa los datos del nuevo cliente'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Nombres *</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  placeholder="Juan Carlos"
                  className={validationErrors.firstName ? 'border-destructive' : ''}
                  required
                />
                {validationErrors.firstName && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {validationErrors.firstName}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Apellidos *</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  placeholder="Pérez García"
                  className={validationErrors.lastName ? 'border-destructive' : ''}
                  required
                />
                {validationErrors.lastName && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {validationErrors.lastName}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="dni">DNI *</Label>
                <div className="relative">
                  <Input
                    id="dni"
                    value={formData.dni}
                    onChange={(e) => handleInputChange('dni', e.target.value.replace(/\D/g, ''))}
                    maxLength={8}
                    placeholder="12345678"
                    className={validationErrors.dni ? 'border-destructive pr-10' : 'pr-10'}
                    required
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {dniValidating && (
                      <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    )}
                    {!dniValidating && dniAvailable === true && formData.dni.length === 8 && (
                      <Check className="h-4 w-4 text-green-500" />
                    )}
                    {!dniValidating && dniAvailable === false && (
                      <AlertCircle className="h-4 w-4 text-destructive" />
                    )}
                  </div>
                </div>
                {validationErrors.dni && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {validationErrors.dni}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono *</Label>
                <div className="flex gap-2">
                  <div className="flex items-center px-3 border rounded-md bg-muted text-muted-foreground">
                    +51
                  </div>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value.replace(/\D/g, ''))}
                    placeholder="987654321"
                    maxLength={9}
                    className={validationErrors.phone ? 'border-destructive' : ''}
                    required
                  />
                </div>
                {validationErrors.phone && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {validationErrors.phone}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Dirección Delivery</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="birthday">Fecha de Nacimiento</Label>
                <Input
                  id="birthday"
                  type="date"
                  value={formData.birthday}
                  onChange={(e) => setFormData({ ...formData, birthday: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="points">Puntos Acumulados (Opcional)</Label>
                <Input
                  id="points"
                  type="number"
                  min="0"
                  value={formData.points === 0 ? '' : formData.points}
                  onChange={(e) => setFormData({ ...formData, points: e.target.value === '' ? 0 : parseInt(e.target.value) })}
                  placeholder="0"
                />
              </div>
              <DialogFooter>
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={!isFormValid() || dniValidating}
                >
                  {editingClient ? 'Actualizar' : 'Crear Cliente'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nombre, DNI o teléfono..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="grid gap-4">
        {filteredClientes
          .slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)
          .map((cliente) => (
          <Card key={cliente.id} className="hover:shadow-lg transition-all">
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0">
              <CardTitle className="flex items-center gap-3 text-lg">
                <Users className="h-5 w-5 text-primary" />
                {cliente.nombres} {cliente.apellidos}
              </CardTitle>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Badge variant="secondary" className="gap-1">
                  <Star className="h-3 w-3" />
                  {cliente.puntosAcumulados} pts
                </Badge>
                <Button size="icon" variant="ghost" onClick={() => openEditDialog(cliente)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="ghost" onClick={() => handleDelete(cliente.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">DNI</p>
                  <p className="font-semibold">{cliente.dni}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Teléfono</p>
                  <p className="font-semibold">{cliente.telefono}</p>
                </div>
               
                {cliente.direccion && (
                  <div className="sm:col-span-2">
                    <p className="text-sm text-muted-foreground">Dirección</p>
                    <p className="font-semibold text-sm">{cliente.direccion}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredClientes.length > ITEMS_PER_PAGE && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
              />
            </PaginationItem>
            {Array.from({ length: Math.ceil(filteredClientes.length / ITEMS_PER_PAGE) }, (_, i) => i + 1)
              .filter(page => {
                const totalPages = Math.ceil(filteredClientes.length / ITEMS_PER_PAGE);
                return page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1;
              })
              .map((page, idx, arr) => {
                if (idx > 0 && page - arr[idx - 1] > 1) {
                  return (
                    <React.Fragment key={`ellipsis-${page}`}>
                      <PaginationItem>
                        <span className="px-4">...</span>
                      </PaginationItem>
                      <PaginationItem>
                        <PaginationLink
                          onClick={() => setCurrentPage(page)}
                          isActive={currentPage === page}
                          className="cursor-pointer"
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    </React.Fragment>
                  );
                }
                return (
                  <PaginationItem key={page}>
                    <PaginationLink
                      onClick={() => setCurrentPage(page)}
                      isActive={currentPage === page}
                      className="cursor-pointer"
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}
            <PaginationItem>
              <PaginationNext 
                onClick={() => setCurrentPage(p => Math.min(Math.ceil(filteredClientes.length / ITEMS_PER_PAGE), p + 1))}
                className={currentPage >= Math.ceil(filteredClientes.length / ITEMS_PER_PAGE) ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}
