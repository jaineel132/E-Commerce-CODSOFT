'use client'

import { useEffect, useState } from 'react'
import { Package } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import { Skeleton } from 'boneyard-js/react'
import { EmptyState } from '@/components/ui/EmptyState'

interface OrderItemProduct {
  name: string
  image_url: string | null
}

interface OrderItem {
  id: string
  order_id: string
  product_id: string
  quantity: number
  unit_price: number
  product: OrderItemProduct
}

interface Order {
  id: string
  user_id: string
  stripe_session: string
  total_amount: number
  status: 'pending' | 'shipped' | 'delivered'
  created_at: string
  order_items: OrderItem[]
}

const statusStyles: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  shipped: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  delivered: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/orders')
      .then((res) => res.json())
      .then((data) => setOrders(data.orders || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (orders.length === 0) {
    return (
      <EmptyState
        icon={Package}
        title="No orders yet"
        description="When you place an order, it will appear here."
        actionLabel="Start Shopping"
        actionHref="/products"
      />
    )
  }

  return (
    <Skeleton name="orders-page" loading={loading}>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          My Orders
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {orders.length} order{orders.length !== 1 ? 's' : ''} total
        </p>
      </div>

      <div className="space-y-4">
        {orders.map((order) => (
          <div
            key={order.id}
            className="rounded-xl border bg-card p-6 shadow-sm border-border"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <p className="text-sm font-semibold text-card-foreground">
                    Order #{order.id.slice(0, 8)}
                  </p>
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${
                      statusStyles[order.status] || ''
                    }`}
                  >
                    {order.status}
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {new Date(order.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>

              <div className="text-right">
                <p className="text-lg font-bold text-foreground">
                  {formatPrice(order.total_amount)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {order.order_items.length} item{order.order_items.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>

            <div className="mt-4 border-t border-border pt-4">
              <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Items
              </p>
              <div className="space-y-2">
                {order.order_items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {item.product.name} &times; {item.quantity}
                    </span>
                    <span className="font-medium text-card-foreground">
                      {formatPrice(item.unit_price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
    </Skeleton>
  )
}
