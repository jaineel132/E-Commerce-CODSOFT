'use client'

import { useEffect, useState, useCallback } from 'react'
import Image from 'next/image'
import { X, Package, Truck, CheckCircle, Clock, Ban, RotateCcw, ExternalLink } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import { Skeleton } from 'boneyard-js/react'
import { Pagination } from '@/components/products/Pagination'

type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'

interface AdminOrder {
  id: string
  user_id: string
  stripe_session: string
  total_amount: number
  status: OrderStatus
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
  order_items: {
    id: string
    product_id: string
    quantity: number
    unit_price: number
    product: { id: string; name: string; price: number; image_url: string | null } | null
  }[]
  user: { email: string; full_name: string } | null
  shipping_address: {
    id: string
    label: string
    full_name: string
    street: string
    city: string
    state: string
    zip_code: string
    country: string
    phone: string | null
  } | null
}

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; icon: React.ComponentType<{ className?: string }> }> = {
  pending:    { label: 'Pending',    color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400', icon: Clock },
  processing: { label: 'Processing', color: 'bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-400',       icon: Package },
  shipped:    { label: 'Shipped',    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',   icon: Truck },
  delivered:  { label: 'Delivered',  color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400', icon: CheckCircle },
  cancelled:  { label: 'Cancelled',  color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',        icon: Ban },
  refunded:   { label: 'Refunded',   color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400', icon: RotateCcw },
}

const ALL_STATUSES: (OrderStatus | '')[] = ['', 'pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded']

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<OrderStatus | ''>('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null)

  const fetchOrders = useCallback((p: number, f: OrderStatus | '') => {
    setLoading(true)
    const params = new URLSearchParams({ page: String(p), limit: '50' })
    if (f) params.set('status', f)
    fetch(`/api/admin/orders?${params}`)
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
    fetchOrders(1, filter)
  }, [fetchOrders, filter])

  const handlePageChange = (newPage: number) => {
    fetchOrders(newPage, filter)
  }

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    const res = await fetch(`/api/admin/orders/${orderId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    })
    if (res.ok) {
      const data = await res.json()
      setOrders((prev) => prev.map((o) => (o.id === orderId ? data.order : o)))
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(data.order)
      }
    }
  }

  const handleUpdateOrder = async (orderId: string, updates: Record<string, unknown>) => {
    const res = await fetch(`/api/admin/orders/${orderId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    })
    if (res.ok) {
      const data = await res.json()
      setOrders((prev) => prev.map((o) => (o.id === orderId ? data.order : o)))
      setSelectedOrder(data.order)
    }
  }

  return (
    <Skeleton name="admin-orders" loading={loading}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Orders</h1>
            <p className="mt-1 text-sm text-muted-foreground">{total} orders{filter ? ` (${filter})` : ''}</p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {ALL_STATUSES.map((s) => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
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
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Customer</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Items</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Total</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Tracking</th>
                <th className="px-4 py-3 text-center font-medium text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => {
                const StatusIcon = STATUS_CONFIG[order.status]?.icon || Clock
                return (
                  <tr
                    key={order.id}
                    className="border-b last:border-0 hover:bg-muted/30 cursor-pointer transition-colors"
                    onClick={() => setSelectedOrder(order)}
                  >
                    <td className="px-4 py-3 font-medium text-foreground">
                      #{order.id.slice(0, 8)}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground max-w-[160px] truncate">
                      {order.user?.full_name || order.user?.email || 'Unknown'}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground max-w-[200px] truncate">
                      {order.order_items.map((item) => item.product?.name || 'Unknown').join(', ')}
                    </td>
                    <td className="px-4 py-3 text-right text-foreground font-medium whitespace-nowrap">
                      {formatPrice(order.total_amount)}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground max-w-[120px] truncate">
                      {order.tracking_number || '—'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium capitalize ${STATUS_CONFIG[order.status]?.color || ''}`}>
                        <StatusIcon className="h-3 w-3" />
                        {STATUS_CONFIG[order.status]?.label || order.status}
                      </span>
                    </td>
                  </tr>
                )
              })}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-sm text-muted-foreground">
                    No orders found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Pagination page={page} totalPages={totalPages} onPageChange={handlePageChange} />

      {/* Order Detail Modal */}
      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onStatusChange={handleStatusChange}
          onUpdate={handleUpdateOrder}
        />
      )}
    </Skeleton>
  )
}

function OrderDetailModal({
  order,
  onClose,
  onStatusChange,
  onUpdate,
}: {
  order: AdminOrder
  onClose: () => void
  onStatusChange: (id: string, status: OrderStatus) => void
  onUpdate: (id: string, updates: Record<string, unknown>) => void
}) {
  const [trackingNumber, setTrackingNumber] = useState(order.tracking_number || '')
  const [trackingCarrier, setTrackingCarrier] = useState(order.tracking_carrier || '')
  const [notes, setNotes] = useState(order.notes || '')
  const [saving, setSaving] = useState(false)

  const handleSaveTracking = async () => {
    setSaving(true)
    await onUpdate(order.id, {
      tracking_number: trackingNumber || null,
      tracking_carrier: trackingCarrier || null,
      notes: notes || null,
    })
    setSaving(false)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 backdrop-blur-sm p-4 pt-12"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl rounded-xl border border-border bg-card p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-serif text-xl font-bold text-foreground">
            Order #{order.id.slice(0, 8)}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Status & Dates */}
          <div className="flex flex-wrap gap-3">
            {Object.entries(STATUS_CONFIG).map(([key, config]) => {
              const Icon = config.icon
              return (
                <button
                  key={key}
                  onClick={() => onStatusChange(order.id, key as OrderStatus)}
                  disabled={order.status === key}
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium capitalize transition-all
                    ${order.status === key
                      ? `${config.color} ring-2 ring-offset-1 ring-current`
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    } disabled:cursor-default`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {config.label}
                </button>
              )
            })}
          </div>

          {order.shipped_at && (
            <p className="text-xs text-muted-foreground">Shipped: {new Date(order.shipped_at).toLocaleString()}</p>
          )}
          {order.delivered_at && (
            <p className="text-xs text-muted-foreground">Delivered: {new Date(order.delivered_at).toLocaleString()}</p>
          )}
          {order.cancelled_at && (
            <p className="text-xs text-muted-foreground">Cancelled: {new Date(order.cancelled_at).toLocaleString()}</p>
          )}

          {/* Customer Info */}
          <div className="rounded-lg border border-border bg-muted/30 p-4">
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Customer</h3>
            <p className="text-sm text-foreground">{order.user?.full_name || '—'}</p>
            <p className="text-sm text-muted-foreground">{order.user?.email || '—'}</p>
          </div>

          {/* Shipping Address */}
          {order.shipping_address && (
            <div className="rounded-lg border border-border bg-muted/30 p-4">
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Shipping Address</h3>
              <p className="text-sm text-foreground">{order.shipping_address.full_name}</p>
              <p className="text-sm text-muted-foreground">{order.shipping_address.street}</p>
              <p className="text-sm text-muted-foreground">
                {order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.zip_code}
              </p>
              <p className="text-sm text-muted-foreground">{order.shipping_address.country}</p>
              {order.shipping_address.phone && (
                <p className="text-sm text-muted-foreground">{order.shipping_address.phone}</p>
              )}
            </div>
          )}

          {/* Order Items */}
          <div>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Items</h3>
            <div className="space-y-2">
              {order.order_items.map((item) => (
                <div key={item.id} className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 p-3">
                  {item.product?.image_url ? (
                    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md bg-muted">
                      <Image
                        src={item.product.image_url}
                        alt={item.product.name}
                        fill
                        sizes="48px"
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                      <Package className="h-5 w-5" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {item.product?.name || 'Unknown Product'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Qty: {item.quantity} × {formatPrice(item.unit_price)}
                    </p>
                  </div>
                  <p className="text-sm font-medium text-foreground whitespace-nowrap">
                    {formatPrice(item.quantity * Number(item.unit_price))}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-3 flex justify-end gap-4 border-t border-border pt-3 text-sm">
              {order.shipping_amount > 0 && (
                <div className="flex gap-2">
                  <span className="text-muted-foreground">Shipping:</span>
                  <span className="text-foreground">{formatPrice(order.shipping_amount)}</span>
                </div>
              )}
              {order.tax_amount > 0 && (
                <div className="flex gap-2">
                  <span className="text-muted-foreground">Tax:</span>
                  <span className="text-foreground">{formatPrice(order.tax_amount)}</span>
                </div>
              )}
              <div className="flex gap-2 font-bold">
                <span className="text-muted-foreground">Total:</span>
                <span className="text-foreground">{formatPrice(order.total_amount)}</span>
              </div>
            </div>
          </div>

          {/* Tracking & Notes */}
          <div className="rounded-lg border border-border bg-muted/30 p-4">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Tracking & Notes</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">Tracking Number</label>
                <input
                  type="text"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
                  placeholder="e.g. 1Z999AA10123456784"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">Carrier</label>
                <select
                  value={trackingCarrier}
                  onChange={(e) => setTrackingCarrier(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">Select carrier</option>
                  <option value="UPS">UPS</option>
                  <option value="FedEx">FedEx</option>
                  <option value="USPS">USPS</option>
                  <option value="DHL">DHL</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
            <div className="mt-3">
              <label className="mb-1 block text-xs text-muted-foreground">Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring resize-none"
                placeholder="Internal notes about this order..."
              />
            </div>
            <button
              onClick={handleSaveTracking}
              disabled={saving}
              className="mt-3 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Tracking & Notes'}
            </button>
          </div>

          {/* Stripe Link */}
          <div className="flex justify-end">
            <a
              href={`https://dashboard.stripe.com/payments/${order.stripe_session}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-primary hover:text-primary/80"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              View in Stripe
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
