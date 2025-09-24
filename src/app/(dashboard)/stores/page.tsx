'use client'

import { useState } from 'react'
import { useStores, useCreateStore, useUpdateStore, useDeleteStore } from '@/hooks/use-stores'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Search, Plus, Edit, Trash2, MapPin, Phone } from 'lucide-react'
import { toast } from 'sonner'
import type { Tables } from '@/types/database.types'

type Store = Tables<'stores'>

export default function StoresPage() {
  const { data: stores, isLoading, error } = useStores()
  const createStore = useCreateStore()
  const updateStore = useUpdateStore()
  const deleteStore = useDeleteStore()

  const [searchTerm, setSearchTerm] = useState('')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedStore, setSelectedStore] = useState<Store | null>(null)

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    manager_name: '',
  })

  const filteredStores = stores?.filter((store) => {
    const name = store.name?.toLowerCase() || ''
    const address = store.address?.toLowerCase() || ''
    const manager = store.manager_name?.toLowerCase() || ''
    const search = searchTerm.toLowerCase()

    return name.includes(search) ||
           address.includes(search) ||
           manager.includes(search)
  })

  const resetForm = () => {
    setFormData({
      name: '',
      address: '',
      phone: '',
      manager_name: '',
    })
  }

  const handleCreate = async () => {
    try {
      await createStore.mutateAsync({
        name: formData.name,
        address: formData.address || null,
        phone: formData.phone || null,
        manager_name: formData.manager_name || null,
        is_active: true,
      })

      toast.success('Tienda creada correctamente')
      setIsCreateDialogOpen(false)
      resetForm()
    } catch {
      toast.error('Error al crear la tienda')
    }
  }

  const handleEdit = async () => {
    if (!selectedStore) return

    try {
      await updateStore.mutateAsync({
        id: selectedStore.id,
        updates: {
          name: formData.name,
          address: formData.address || null,
          phone: formData.phone || null,
          manager_name: formData.manager_name || null,
        },
      })

      toast.success('Tienda actualizada correctamente')
      setIsEditDialogOpen(false)
      setSelectedStore(null)
      resetForm()
    } catch {
      toast.error('Error al actualizar la tienda')
    }
  }

  const handleDelete = async (store: Store) => {
    if (!confirm(`¿Estás seguro de que quieres eliminar "${store.name}"?`)) return

    try {
      await deleteStore.mutateAsync(store.id)
      toast.success('Tienda eliminada correctamente')
    } catch {
      toast.error('Error al eliminar la tienda')
    }
  }

  const openEditDialog = (store: Store) => {
    setSelectedStore(store)
    setFormData({
      name: store.name,
      address: store.address || '',
      phone: store.phone || '',
      manager_name: store.manager_name || '',
    })
    setIsEditDialogOpen(true)
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestión de Tiendas</h1>
          <p className="text-muted-foreground">
            Administra las tiendas de la cadena
          </p>
        </div>
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-gray-200 rounded"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestión de Tiendas</h1>
          <p className="text-muted-foreground">
            Error al cargar las tiendas
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestión de Tiendas</h1>
          <p className="text-muted-foreground">
            Administra las tiendas de la cadena
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nueva Tienda
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar tiendas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Dirección</TableHead>
              <TableHead>Teléfono</TableHead>
              <TableHead>Gerente</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredStores?.map((store) => (
              <TableRow key={store.id}>
                <TableCell className="font-medium">{store.name}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    {store.address || '-'}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    {store.phone || '-'}
                  </div>
                </TableCell>
                <TableCell>{store.manager_name || '-'}</TableCell>
                <TableCell>
                  <Badge variant={store.is_active ? 'secondary' : 'destructive'}>
                    {store.is_active ? 'Activa' : 'Inactiva'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEditDialog(store)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(store)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Create Store Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Crear Nueva Tienda</DialogTitle>
            <DialogDescription>
              Agregar una nueva tienda a la cadena
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nombre *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Nombre de la tienda"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="address">Dirección</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Dirección completa"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">Teléfono</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="Número de teléfono"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="manager_name">Gerente</Label>
              <Input
                id="manager_name"
                value={formData.manager_name}
                onChange={(e) => setFormData({ ...formData, manager_name: e.target.value })}
                placeholder="Nombre del gerente"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsCreateDialogOpen(false)
                resetForm()
              }}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleCreate}
              disabled={createStore.isPending || !formData.name}
            >
              {createStore.isPending ? 'Creando...' : 'Crear'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Store Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Tienda</DialogTitle>
            <DialogDescription>
              Modificar la información de la tienda
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Nombre *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Nombre de la tienda"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-address">Dirección</Label>
              <Input
                id="edit-address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Dirección completa"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-phone">Teléfono</Label>
              <Input
                id="edit-phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="Número de teléfono"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-manager_name">Gerente</Label>
              <Input
                id="edit-manager_name"
                value={formData.manager_name}
                onChange={(e) => setFormData({ ...formData, manager_name: e.target.value })}
                placeholder="Nombre del gerente"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsEditDialogOpen(false)
                setSelectedStore(null)
                resetForm()
              }}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleEdit}
              disabled={updateStore.isPending || !formData.name}
            >
              {updateStore.isPending ? 'Actualizando...' : 'Actualizar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}