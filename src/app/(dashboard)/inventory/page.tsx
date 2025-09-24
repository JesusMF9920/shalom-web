'use client'

import { useState } from 'react'
import { useInventory, useUpdateInventory } from '@/hooks/use-inventory'
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
import { Search, Edit, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import type { Tables } from '@/types/database.types'

type InventoryItem = Tables<'inventory'> & {
  products: Tables<'products'> | null
  stores: Tables<'stores'> | null
}

export default function InventoryPage() {
  const { data: inventory, isLoading, error } = useInventory()
  const updateInventory = useUpdateInventory()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null)
  const [newQuantity, setNewQuantity] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const filteredInventory = inventory?.filter((item) => {
    const productName = item.products?.name?.toLowerCase() || ''
    const storeName = item.stores?.name?.toLowerCase() || ''
    const barcode = item.products?.barcode?.toLowerCase() || ''
    const search = searchTerm.toLowerCase()

    return productName.includes(search) ||
           storeName.includes(search) ||
           barcode.includes(search)
  })

  const handleUpdateQuantity = async () => {
    if (!selectedItem || !newQuantity) return

    try {
      await updateInventory.mutateAsync({
        id: selectedItem.id,
        current_quantity: parseInt(newQuantity),
      })

      toast.success('Cantidad actualizada correctamente')
      setIsDialogOpen(false)
      setSelectedItem(null)
      setNewQuantity('')
    } catch {
      toast.error('Error al actualizar la cantidad')
    }
  }

  const openUpdateDialog = (item: InventoryItem) => {
    setSelectedItem(item)
    setNewQuantity(item.current_quantity?.toString() || '0')
    setIsDialogOpen(true)
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestión de Inventarios</h1>
          <p className="text-muted-foreground">
            Administra el inventario de todas las tiendas
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
          <h1 className="text-3xl font-bold tracking-tight">Gestión de Inventarios</h1>
          <p className="text-muted-foreground">
            Error al cargar el inventario
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Gestión de Inventarios</h1>
        <p className="text-muted-foreground">
          Administra el inventario de todas las tiendas
        </p>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por producto, tienda o código..."
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
              <TableHead>Producto</TableHead>
              <TableHead>Código de Barras</TableHead>
              <TableHead>Tienda</TableHead>
              <TableHead>Cantidad Actual</TableHead>
              <TableHead>Cantidad Mínima</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Última Actualización</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredInventory?.map((item) => {
              const isLowStock = item.current_quantity !== null &&
                               item.min_quantity !== null &&
                               item.current_quantity <= item.min_quantity

              return (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">
                    {item.products?.name || 'Producto no encontrado'}
                  </TableCell>
                  <TableCell>{item.products?.barcode || '-'}</TableCell>
                  <TableCell>{item.stores?.name || 'Tienda no encontrada'}</TableCell>
                  <TableCell>{item.current_quantity || 0}</TableCell>
                  <TableCell>{item.min_quantity || 0}</TableCell>
                  <TableCell>
                    {isLowStock ? (
                      <Badge variant="destructive" className="flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        Stock Bajo
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Normal</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {item.last_updated
                      ? new Date(item.last_updated).toLocaleDateString('es-ES')
                      : '-'
                    }
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openUpdateDialog(item)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Actualizar Cantidad</DialogTitle>
            <DialogDescription>
              Actualizar la cantidad actual del producto: {selectedItem?.products?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="quantity" className="text-right">
                Cantidad
              </Label>
              <Input
                id="quantity"
                type="number"
                value={newQuantity}
                onChange={(e) => setNewQuantity(e.target.value)}
                className="col-span-3"
                min="0"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleUpdateQuantity}
              disabled={updateInventory.isPending}
            >
              {updateInventory.isPending ? 'Actualizando...' : 'Actualizar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}