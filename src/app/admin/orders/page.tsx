'use client'

import { useEffect, useState } from 'react'
import { formatPrice } from '@/lib/utils'
import { Skeleton } from 'boneyard-js/react'

interface AdminOrder {
  id: string
  user_id: string
  stripe_session: string
  total_amount: number
  status: 'pending' | 'shipped' | 'delivered'
  created_at: string
  order_items: {
    id: string
    product_id: string
    quantity: number
    unit_price: number
    product: { name: string }
  }[]
}

const statusColors: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  shipped: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  delivered: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
}

const statusOptions = ['pending', 'shipped', 'delivered']

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('')

  useEffect(() => {
    const url = filter ? `/api/admin/orders?status=${filter}` : '/api/admin/orders'
    fetch(url)
      .then((res) => res.json())
      .then((data) => setOrders(data.orders || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [filter])

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    const res = await fetch(`/api/admin/orders/${orderId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    })
    if (res.ok) {
      const data = await res.json()
      setOrders((prev) => prev.map((o) => (o.id === orderId ? data.order : o)))
    }
  }

  return (
    <Skeleton name="admin-orders" loading={loading}>
      <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Orders</h1>
          <p className="mt-1 text-sm text-muted-foreground">{orders.length} orders total</p>
        </div>
        <div className="flex gap-2">
          {['', 'pending', 'shipped', 'delivered'].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                filter === s
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {s || 'All'}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Order</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Date</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Items</th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">Total</th>
              <th className="px-4 py-3 text-center font-medium text-muted-foreground">Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-b last:border-0 hover:bg-muted/30">
                <td className="px-4 py-3 font-medium text-foreground">
                  #{order.id.slice(0, 8)}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {new Date(order.created_at).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {order.order_items.map((item) => item.product?.name || 'Unknown').join(', ')}
                </td>
                <td className="px-4 py-3 text-right text-foreground">
                  {formatPrice(order.total_amount)}
                </td>
                <td className="px-4 py-3 text-center">
                  <select
                    value={order.status}
                    onChange={(e) => handleStatusChange(order.id, e.target.value)}
                    className={`rounded-lg border-0 px-2.5 py-1 text-xs font-medium capitalize ${statusColors[order.status] || ''}`}
                  >
                    {statusOptions.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-sm text-muted-foreground">
                  No orders found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
    </Skeleton>
  )
}
