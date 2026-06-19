'use client'

import { useEffect, useState, useCallback } from 'react'
import { Package, MapPin } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'
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

const statusStyles: Record<string, { bg: string; dot: string }> = {
  pending: { bg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 ring-amber-500/20', dot: 'bg-amber-500' },
  processing: { bg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 ring-blue-500/20', dot: 'bg-blue-500' },
  shipped: { bg: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 ring-indigo-500/20', dot: 'bg-indigo-500' },
  delivered: { bg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 ring-emerald-500/20', dot: 'bg-emerald-500' },
  cancelled: { bg: 'bg-red-500/10 text-red-600 dark:text-red-400 ring-red-500/20', dot: 'bg-red-500' },
  refunded: { bg: 'bg-gray-500/10 text-gray-600 dark:text-gray-400 ring-gray-500/20', dot: 'bg-gray-500' },
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
      <div className="mb-10 pb-6 border-b border-border">
        <h1 className="display-md text-foreground">
          My Orders
        </h1>
        <p className="mt-2 text-[16px] text-foreground-muted">
          {total} order{total !== 1 ? 's' : ''} total
        </p>
      </div>

      <div className="space-y-4">
        {orders.map((order) => {
          const style = statusStyles[order.status] || statusStyles.pending
          return (
          <div
            key={order.id}
            className="rounded-3xl border border-border bg-card p-6 shadow-sm ring-1 ring-inset ring-border/50 transition-shadow hover:shadow-md"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <p className="text-[15px] font-semibold text-foreground font-mono">
                    #{order.id.slice(0, 8)}
                  </p>
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium capitalize ring-1 ring-inset ${style.bg}`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
                    {order.status}
                  </span>
                </div>
                <p className="mt-1.5 text-[13px] text-foreground-muted">
                  {new Date(order.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>

              <div className="text-right">
                <p className="text-[20px] font-semibold text-foreground tabular-nums">
                  {formatPrice(order.total_amount)}
                </p>
                <p className="text-[13px] text-foreground-muted">
                  {order.order_items.length} item{order.order_items.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>

            {/* Timeline indicator for shipped/delivered */}
            {(order.status === 'shipped' || order.status === 'delivered') && (
              <div className="mt-5 flex items-center gap-0 text-[12px]">
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  <span className="text-foreground-muted">Ordered</span>
                </div>
                <div className="mx-2 h-[1px] flex-1 bg-emerald-500" />
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  <span className="text-foreground-muted">Shipped</span>
                </div>
                <div className={`mx-2 h-[1px] flex-1 ${order.status === 'delivered' ? 'bg-emerald-500' : 'bg-border'}`} />
                <div className="flex items-center gap-1.5">
                  <span className={`h-2 w-2 rounded-full ${order.status === 'delivered' ? 'bg-emerald-500' : 'bg-border'}`} />
                  <span className="text-foreground-muted">Delivered</span>
                </div>
              </div>
            )}

            {order.shipping_address && (
              <div className="mt-5 border-t border-border pt-4">
                <div className="flex items-start gap-2">
                  <MapPin className="mt-0.5 h-4 w-4 text-foreground-muted shrink-0" />
                  <div className="text-[13px] text-foreground-muted">
                    <p className="font-medium text-foreground">{order.shipping_address.full_name}</p>
                    <p>{order.shipping_address.street}</p>
                    <p>{order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.zip_code}</p>
                  </div>
                </div>
              </div>
            )}

            {order.tracking_number && (
              <div className="mt-3 border-t border-border pt-3">
                <p className="text-[13px] text-foreground-muted">
                  <span className="font-medium text-foreground">Tracking:</span> {order.tracking_number}
                  {order.tracking_carrier && ` (${order.tracking_carrier})`}
                </p>
              </div>
            )}

            <div className="mt-5 border-t border-border pt-4">
              <p className="mb-3 text-[12px] font-medium uppercase tracking-wider text-foreground-muted">
                Items
              </p>
              <div className="space-y-2">
                {order.order_items.map((item) => (
                  <div key={item.id} className="flex justify-between text-[14px]">
                    <span className="text-foreground-muted">
                      {item.product.name} &times; {item.quantity}
                    </span>
                    <span className="font-medium text-foreground tabular-nums">
                      {formatPrice(item.unit_price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          )
        })}
      </div>

      <Pagination page={page} totalPages={totalPages} onPageChange={handlePageChange} />
    </div>
    </Skeleton>
  )
}
