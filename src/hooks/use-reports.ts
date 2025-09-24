import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { startOfDay, endOfDay, subDays, format } from 'date-fns'

const supabase = createClient()

export function useSalesReport(days: number = 30) {
  return useQuery({
    queryKey: ['sales-report', days],
    queryFn: async () => {
      const endDate = endOfDay(new Date())
      const startDate = startOfDay(subDays(endDate, days))

      const { data: sales, error } = await supabase
        .from('sales')
        .select(`
          total_amount,
          created_at,
          stores (
            name
          )
        `)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .order('created_at')

      if (error) throw error

      // Group by date
      const salesByDate = sales?.reduce((acc, sale) => {
        const date = format(new Date(sale.created_at!), 'yyyy-MM-dd')
        if (!acc[date]) {
          acc[date] = 0
        }
        acc[date] += sale.total_amount
        return acc
      }, {} as Record<string, number>)

      return {
        salesByDate: Object.entries(salesByDate || {}).map(([date, amount]) => ({
          date,
          amount,
        })),
        totalSales: sales?.reduce((sum, sale) => sum + sale.total_amount, 0) || 0,
        totalTransactions: sales?.length || 0,
      }
    },
  })
}

export function useTopProducts(limit: number = 10) {
  return useQuery({
    queryKey: ['top-products', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sale_items')
        .select(`
          quantity,
          unit_price,
          subtotal,
          products (
            name
          )
        `)
        .order('subtotal', { ascending: false })
        .limit(limit * 10) // Get more to aggregate

      if (error) throw error

      // Aggregate by product
      const productSales = data?.reduce((acc, item) => {
        const productName = item.products?.name || 'Producto desconocido'
        if (!acc[productName]) {
          acc[productName] = {
            name: productName,
            totalSold: 0,
            totalRevenue: 0,
          }
        }
        acc[productName].totalSold += item.quantity
        acc[productName].totalRevenue += item.subtotal
        return acc
      }, {} as Record<string, { name: string; totalSold: number; totalRevenue: number }>)

      return Object.values(productSales || {})
        .sort((a, b) => b.totalRevenue - a.totalRevenue)
        .slice(0, limit)
    },
  })
}

export function useInventoryReport() {
  return useQuery({
    queryKey: ['inventory-report'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('inventory')
        .select(`
          current_quantity,
          min_quantity,
          products (
            name
          ),
          stores (
            name
          )
        `)

      if (error) throw error

      const lowStockItems = data?.filter(item =>
        item.current_quantity !== null &&
        item.min_quantity !== null &&
        item.current_quantity <= item.min_quantity
      ) || []

      const totalItems = data?.length || 0
      const lowStockCount = lowStockItems.length

      return {
        totalItems,
        lowStockCount,
        lowStockItems,
      }
    },
  })
}