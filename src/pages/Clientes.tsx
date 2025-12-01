import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Users, Star, Plus, Pencil, Trash2, Search } from "lucide-react";
import { toast } from "sonner";
import { useClients, useClientSearch, useCreateClient, useUpdateClient, useDeleteClient } from "@/hooks";
import type { Client } from "@/types";

export default function Clientes() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  // Usar los nuevos hooks
  const { data: clientes = [], isLoading, error, refetch } = useClients();
  const { data: searchedClients = [], mutate: searchClients } = useClientSearch(searchTerm);
  const createClientMutation = useCreateClient();
  const updateClientMutation = useUpdateClient();
  const deleteClientMutation = useDeleteClient();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dni: '',
    phone: '',
    email: '',
    address: '',
    birthday: '',
    points: 0,
  });

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      const data = await clientsAPI.getAll();
      setClientes(data);
    } catch (error) {
      toast.error('Error al cargar clientes');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Validar DNI duplicado al crear nuevo cliente
      if (!editingClient) {
        const existingClient = clientes.find(c => c.dni === formData.dni);
        if (existingClient) {
          toast.error('El DNI ya está registrado');
          return;
        }
      }
      
      // Combinar nombres y apellidos
      const fullName = `${formData.firstName} ${formData.lastName}`.trim();
      const clientData = {
        name: fullName,
        dni: formData.dni,
        phone: formData.phone,
        email: formData.email,
        address: formData.address,
        birthday: formData.birthday,
        points: formData.points,
      };
      
      if (editingClient) {
        await clientsAPI.update(editingClient.id, clientData);
        toast.success('Cliente actualizado correctamente');
      } else {
        await clientsAPI.create(clientData as any);
        toast.success('Cliente creado correctamente');
      }
      
      setIsDialogOpen(false);
      resetForm();
      loadClients();
    } catch (error) {
      toast.error('Error al guardar cliente');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar este cliente?')) return;
    
    try {
      await clientsAPI.delete(id);
      toast.success('Cliente eliminado correctamente');
      loadClients();
    } catch (error) {
      toast.error('Error al eliminar cliente');
    }
  };

  const openEditDialog = (client: Client) => {
    setEditingClient(client);
    
    // Separar nombre completo en nombres y apellidos
    const nameParts = (client.name || '').trim().split(' ');
    const lastName = nameParts.length > 1 ? nameParts.slice(-1).join(' ') : '';
    const firstName = nameParts.length > 1 ? nameParts.slice(0, -1).join(' ') : nameParts[0] || '';
    
    // Limpiar el teléfono del prefijo +51 si existe
    const cleanPhone = (client.phone || '').replace(/^\+?51/, '');
    
    setFormData({
      firstName: firstName,
      lastName: lastName,
      dni: client.dni,
      phone: cleanPhone,
      email: client.email || '',
      address: client.address || '',
      birthday: client.birthday || '',
      points: client.points || 0,
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setEditingClient(null);
    setFormData({
      firstName: '',
      lastName: '',
      dni: '',
      phone: '',
      email: '',
      address: '',
      birthday: '',
      points: 0,
    });
  };

  const filteredClientes = clientes.filter(cliente => {
    if (!cliente?.name || !cliente?.dni || !cliente?.phone) return false;
    
    const searchTermLower = searchTerm.toLowerCase();
    return (
      cliente.name.toLowerCase().includes(searchTermLower) ||
      cliente.dni.includes(searchTerm) ||
      cliente.phone.includes(searchTerm)
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
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  placeholder="Juan Carlos"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Apellidos *</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  placeholder="Pérez García"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dni">DNI *</Label>
                <Input
                  id="dni"
                  value={formData.dni}
                  onChange={(e) => setFormData({ ...formData, dni: e.target.value })}
                  maxLength={8}
                  placeholder="12345678"
                  required
                />
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
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '') })}
                    placeholder="987654321"
                    maxLength={9}
                    required
                  />
                </div>
              </div>
              {/* <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div> */}
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
                <Button type="submit" className="w-full">
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
                {cliente.name}
              </CardTitle>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Badge variant="secondary" className="gap-1">
                  <Star className="h-3 w-3" />
                  {cliente.points} pts
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
                  <p className="font-semibold">{cliente.phone}</p>
                </div>
                {cliente.email && (
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-semibold text-sm">{cliente.email}</p>
                  </div>
                )}
                {cliente.address && (
                  <div className="sm:col-span-2">
                    <p className="text-sm text-muted-foreground">Dirección</p>
                    <p className="font-semibold text-sm">{cliente.address}</p>
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
