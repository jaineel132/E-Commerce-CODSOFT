'use client'

import { useEffect, useState, useCallback } from 'react'
import { Package, MapPin } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import { Skeleton } from 'boneyard-js/react'
import { EmptyState } from '@/components/ui/EmptyState'
import { Pagination } from '@/components/products/Pagination'
import type { Address, OrderItem } from '@/types'

interface OrderItemProduct {
  name: string
  image_url: string | null
}

interface OrderItemWithProduct extends OrderItem {
  product: OrderItemProduct
}

interface OrderWithAddress {
  id: string
  user_id: string
  stripe_session: string
  total_amount: number
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'
  shipping_address_id: string | null
  shipping_amount: number
  tax_amount: number
  tracking_number: string | null
  tracking_carrier: string | null
  shipped_at: string | null
  delivered_at: string | null
  cancelled_at: string | null
  notes: string | null
  created_at: string
  order_items: OrderItemWithProduct[]
  shipping_address: Address | null
}

const statusStyles: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  processing: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  shipped: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400',
  delivered: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  refunded: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderWithAddress[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(0)

  const fetchOrders = useCallback((p: number) => {
    setLoading(true)
    fetch(`/api/orders?page=${p}&limit=10`)
      .then((res) => res.json())
      .then((data) => {
        setOrders(data.orders || [])
        setTotal(data.total ?? 0)
        setTotalPages(data.totalPages ?? 0)
        setPage(data.page ?? p)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    fetchOrders(1)
  }, [fetchOrders])

  const handlePageChange = (newPage: number) => {
    fetchOrders(newPage)
  }

  if (!loading && orders.length === 0) {
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
          {total} order{total !== 1 ? 's' : ''} total
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

            {order.shipping_address && (
              <div className="mt-4 border-t border-border pt-4">
                <div className="flex items-start gap-2">
                  <MapPin className="mt-0.5 h-4 w-4 text-muted-foreground shrink-0" />
                  <div className="text-xs text-muted-foreground">
                    <p className="font-medium text-foreground">{order.shipping_address.full_name}</p>
                    <p>{order.shipping_address.street}</p>
                    <p>{order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.zip_code}</p>
                  </div>
                </div>
              </div>
            )}

            {order.tracking_number && (
              <div className="mt-2 border-t border-border pt-2">
                <p className="text-xs text-muted-foreground">
                  Tracking: {order.tracking_number}
                  {order.tracking_carrier && ` (${order.tracking_carrier})`}
                </p>
              </div>
            )}

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

      <Pagination page={page} totalPages={totalPages} onPageChange={handlePageChange} />
    </div>
    </Skeleton>
  )
}
