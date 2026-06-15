import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Total orders & revenue
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('total_amount, created_at, status')

    if (ordersError) {
      return Response.json({ error: ordersError.message }, { status: 500 })
    }

    const totalRevenue = orders?.reduce((sum, o) => sum + Number(o.total_amount), 0) || 0
    const totalOrders = orders?.length || 0

    // Orders by day (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const recentOrders = orders?.filter((o) => new Date(o.created_at) >= thirtyDaysAgo) || []

    const ordersByDayMap = new Map<string, number>()
    for (const order of recentOrders) {
      const day = new Date(order.created_at).toISOString().split('T')[0]
      ordersByDayMap.set(day, (ordersByDayMap.get(day) || 0) + 1)
    }

    const ordersByDay = Array.from(ordersByDayMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, count]) => ({ date, count }))

    // Total active products
    const { count: totalProducts, error: productsError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)

    if (productsError) {
      return Response.json({ error: productsError.message }, { status: 500 })
    }

    // Top products by total quantity sold
    const { data: orderItems, error: itemsError } = await supabase
      .from('order_items')
      .select('product_id, quantity, unit_price, product:products(name)')

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

    const topProducts = Array.from(productSales.entries())
      .map((entry) => entry[1])
      .sort((a, b) => b.total_sold - a.total_sold)

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
