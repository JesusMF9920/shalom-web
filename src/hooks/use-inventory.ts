import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { Tables } from '@/types/database.types'

const supabase = createClient()

type InventoryItem = Tables<'inventory'> & {
  products: Tables<'products'> | null
  stores: Tables<'stores'> | null
}

export function useInventory() {
  return useQuery({
    queryKey: ['inventory'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('inventory')
        .select(`
          *,
          products (
            id,
            name,
            barcode
          ),
          stores (
            id,
            name
          )
        `)
        .order('last_updated', { ascending: false })

      if (error) throw error
      return data as InventoryItem[]
    },
  })
}

export function useUpdateInventory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      current_quantity,
    }: {
      id: string
      current_quantity: number
    }) => {
      const { data, error } = await supabase
        .from('inventory')
        .update({
          current_quantity,
          last_updated: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] })
    },
  })
}