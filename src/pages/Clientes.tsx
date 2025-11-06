import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Users, Star, Plus, Pencil, Trash2, Search } from "lucide-react";
import { toast } from "sonner";
import { clientsAPI } from "@/services/api";
import type { Client } from "@/types";

export default function Clientes() {
  const [clientes, setClientes] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    dni: '',
    phone: '',
    email: '',
    address: '',
    birthday: '',
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
      if (editingClient) {
        await clientsAPI.update(editingClient.id, formData);
        toast.success('Cliente actualizado correctamente');
      } else {
        await clientsAPI.create(formData as any);
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
    setFormData({
      name: client.name,
      dni: client.dni,
      phone: client.phone,
      email: client.email || '',
      address: client.address || '',
      birthday: client.birthday || '',
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setEditingClient(null);
    setFormData({
      name: '',
      dni: '',
      phone: '',
      email: '',
      address: '',
      birthday: '',
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
                <Label htmlFor="name">Nombre completo *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono *</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+51987654321"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Dirección</Label>
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
        {filteredClientes.map((cliente) => (
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
    </div>
  );
}
