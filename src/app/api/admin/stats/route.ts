import { requireAdmin } from '@/lib/auth'

export async function GET() {
  try {
    const auth = await requireAdmin()
    if ('error' in auth) {
      return Response.json({ error: auth.error }, { status: auth.status })
    }

    const { supabase } = auth
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

    // Total revenue and order count from all time
    const { data: totals, error: totalsError } = await supabase
      .from('orders')
      .select('total_amount, created_at')

    if (totalsError) {
      return Response.json({ error: totalsError.message }, { status: 500 })
    }

    const totalRevenue = totals?.reduce((sum, o) => sum + Number(o.total_amount), 0) || 0
    const totalOrders = totals?.length || 0

    // Orders by day (last 30 days) — filter at DB level
    const { data: recentOrders, error: recentError } = await supabase
      .from('orders')
      .select('created_at')
      .gte('created_at', thirtyDaysAgo)
      .order('created_at', { ascending: true })

    if (recentError) {
      return Response.json({ error: recentError.message }, { status: 500 })
    }

    const ordersByDayMap = new Map<string, number>()
    for (const order of recentOrders || []) {
      const day = order.created_at.split('T')[0]
      ordersByDayMap.set(day, (ordersByDayMap.get(day) || 0) + 1)
    }

    const ordersByDay = Array.from(ordersByDayMap.entries()).map(([date, count]) => ({ date, count }))

    // Total active products
    const { count: totalProducts, error: productsError } = await supabase
      .from('products')
      .select('id', { count: 'exact', head: true })
      .eq('is_active', true)

    if (productsError) {
      return Response.json({ error: productsError.message }, { status: 500 })
    }

    // Top products — only from orders in last 90 days to limit data
    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()

    const { data: orderItems, error: itemsError } = await supabase
      .from('order_items')
      .select('product_id, quantity, unit_price, product:products(name), order:orders!inner(created_at)')
      .gte('order.created_at', ninetyDaysAgo)

    if (itemsError) {
      return Response.json({ error: itemsError.message }, { status: 500 })
    }

    const productSales = new Map<string, { name: string; total_sold: number; revenue: number }>()
    for (const item of orderItems || []) {
      const existing = productSales.get(item.product_id) || {
        name: (item.product as { name: string } | null)?.name || 'Unknown',
        total_sold: 0,
        revenue: 0,
      }
      existing.total_sold += item.quantity
      existing.revenue += Number(item.unit_price) * item.quantity
      productSales.set(item.product_id, existing)
    }

    const topProducts = Array.from(productSales.values()).sort((a, b) => b.total_sold - a.total_sold)

    return Response.json({
      totalRevenue,
      totalOrders,
      totalProducts: totalProducts || 0,
      ordersByDay,
      topProducts,
    }, { status: 200 })
  } catch {
    return Response.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}
