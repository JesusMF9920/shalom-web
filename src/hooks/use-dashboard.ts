import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()

export function useDashboardMetrics() {
  return useQuery({
    queryKey: ['dashboard-metrics'],
    queryFn: async () => {
      // Get today's sales
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)

      const { data: todaySales, error: salesError } = await supabase
        .from('sales')
        .select('total_amount')
        .gte('created_at', today.toISOString())
        .lt('created_at', tomorrow.toISOString())

      if (salesError) throw salesError

      const totalSalesToday = todaySales?.reduce((sum, sale) => sum + sale.total_amount, 0) || 0

      // Get low stock products
      const { data: lowStock, error: stockError } = await supabase
        .from('inventory')
        .select(`
          current_quantity,
          min_quantity,
          products (
            name
          )
        `)
        .filter('current_quantity', 'lte', 'min_quantity')

      if (stockError) throw stockError

      // Get active stores
      const { data: activeStores, error: storesError } = await supabase
        .from('stores')
        .select('id')
        .eq('is_active', true)

      if (storesError) throw storesError

      // Get total products
      const { data: totalProducts, error: productsError } = await supabase
        .from('products')
        .select('id')
        .eq('is_active', true)

      if (productsError) throw productsError

      return {
        totalSalesToday,
        lowStockCount: lowStock?.length || 0,
        activeStoresCount: activeStores?.length || 0,
        totalProductsCount: totalProducts?.length || 0,
      }
    },
  })
}