'use client'

import { useEffect, useState, useCallback } from 'react'
import Image from 'next/image'
import { X, Package, Truck, CheckCircle, Clock, Ban, RotateCcw, ExternalLink, ChevronDown } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'
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
  pending:    { label: 'Pending',    color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 ring-amber-500/20', icon: Clock },
  processing: { label: 'Processing', color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 ring-blue-500/20', icon: Package },
  shipped:    { label: 'Shipped',    color: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 ring-indigo-500/20', icon: Truck },
  delivered:  { label: 'Delivered',  color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 ring-emerald-500/20', icon: CheckCircle },
  cancelled:  { label: 'Cancelled',  color: 'bg-red-500/10 text-red-600 dark:text-red-400 ring-red-500/20', icon: Ban },
  refunded:   { label: 'Refunded',   color: 'bg-gray-500/10 text-gray-600 dark:text-gray-400 ring-gray-500/20', icon: RotateCcw },
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
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-display-sm text-foreground">Orders</h1>
            <p className="mt-1 text-sm text-foreground-muted">{total} orders{filter ? ` (${filter})` : ''}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {ALL_STATUSES.map((s) => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`rounded-full px-3.5 py-1.5 text-xs font-medium capitalize transition-all ${
                  filter === s
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'bg-secondary/50 text-foreground-muted hover:bg-secondary hover:text-foreground ring-1 ring-inset ring-border/50'
                }`}
              >
                {s || 'All'}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto rounded-[24px] border border-border/50 bg-card shadow-sm ring-1 ring-inset ring-border/10">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/50 bg-secondary/20">
                <th className="px-5 py-4 text-left text-[11px] font-semibold uppercase tracking-wider text-foreground-muted">Order</th>
                <th className="px-5 py-4 text-left text-[11px] font-semibold uppercase tracking-wider text-foreground-muted">Date</th>
                <th className="px-5 py-4 text-left text-[11px] font-semibold uppercase tracking-wider text-foreground-muted">Customer</th>
                <th className="px-5 py-4 text-left text-[11px] font-semibold uppercase tracking-wider text-foreground-muted">Items</th>
                <th className="px-5 py-4 text-right text-[11px] font-semibold uppercase tracking-wider text-foreground-muted">Total</th>
                <th className="px-5 py-4 text-center text-[11px] font-semibold uppercase tracking-wider text-foreground-muted">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {orders.map((order) => {
                const StatusIcon = STATUS_CONFIG[order.status]?.icon || Clock
                return (
                  <tr
                    key={order.id}
                    className="group transition-colors hover:bg-secondary/30 cursor-pointer"
                    onClick={() => setSelectedOrder(order)}
                  >
                    <td className="px-5 py-3 font-medium text-foreground">
                      #{order.id.slice(0, 8)}
                    </td>
                    <td className="px-5 py-3 text-foreground-muted whitespace-nowrap">
                      {new Date(order.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-5 py-3 text-foreground-muted max-w-[160px] truncate">
                      {order.user?.full_name || order.user?.email || 'Unknown'}
                    </td>
                    <td className="px-5 py-3 text-foreground-muted max-w-[200px] truncate">
                      {order.order_items.map((item) => item.product?.name || 'Unknown').join(', ')}
                    </td>
                    <td className="px-5 py-3 text-right text-foreground font-medium whitespace-nowrap tabular-nums">
                      {formatPrice(order.total_amount)}
                    </td>
                    <td className="px-5 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                      <div className="relative inline-flex items-center justify-center">
                        <select 
                          className="absolute inset-0 z-10 w-full h-full opacity-0 cursor-pointer"
                          value={order.status}
                          onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
                        >
                          {ALL_STATUSES.filter(Boolean).map((s) => (
                            <option key={s} value={s}>{STATUS_CONFIG[s as OrderStatus].label}</option>
                          ))}
                        </select>
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium capitalize ring-1 ring-inset ${STATUS_CONFIG[order.status]?.color || ''}`}>
                          <StatusIcon className="h-3 w-3" />
                          {STATUS_CONFIG[order.status]?.label || order.status}
                          <ChevronDown className="h-3 w-3 opacity-50 ml-0.5" />
                        </span>
                      </div>
                    </td>
                  </tr>
                )
              })}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-sm text-foreground-muted">
                    No orders found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
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
      </div>
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
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-background/80 backdrop-blur-sm p-4 pt-12 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl rounded-[24px] border border-border/50 bg-card p-6 shadow-2xl ring-1 ring-inset ring-border/10 animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-serif text-2xl font-bold text-foreground">
            Order #{order.id.slice(0, 8)}
          </h2>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-foreground-muted hover:bg-secondary hover:text-foreground transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-8">
          {/* Status & Dates */}
          <div className="flex flex-wrap gap-2">
            {Object.entries(STATUS_CONFIG).map(([key, config]) => {
              const Icon = config.icon
              return (
                <button
                  key={key}
                  onClick={() => onStatusChange(order.id, key as OrderStatus)}
                  disabled={order.status === key}
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium capitalize transition-all
                    ${order.status === key
                      ? `${config.color} ring-2 ring-offset-2 ring-offset-background`
                      : 'bg-secondary/50 text-foreground-muted hover:bg-secondary ring-1 ring-inset ring-border/50'
                    } disabled:cursor-default`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {config.label}
                </button>
              )
            })}
          </div>

          <div className="flex gap-4 text-[13px] text-foreground-muted">
            {order.shipped_at && (
              <p>Shipped: {new Date(order.shipped_at).toLocaleDateString()}</p>
            )}
            {order.delivered_at && (
              <p>Delivered: {new Date(order.delivered_at).toLocaleDateString()}</p>
            )}
            {order.cancelled_at && (
              <p>Cancelled: {new Date(order.cancelled_at).toLocaleDateString()}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Customer Info */}
            <div className="rounded-2xl border border-border/50 bg-secondary/20 p-5 ring-1 ring-inset ring-border/10">
              <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-foreground-muted">Customer</h3>
              <p className="text-sm font-medium text-foreground">{order.user?.full_name || '—'}</p>
              <p className="text-sm text-foreground-muted mt-1">{order.user?.email || '—'}</p>
            </div>

            {/* Shipping Address */}
            {order.shipping_address && (
              <div className="rounded-2xl border border-border/50 bg-secondary/20 p-5 ring-1 ring-inset ring-border/10">
                <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-foreground-muted">Shipping Address</h3>
                <p className="text-sm font-medium text-foreground">{order.shipping_address.full_name}</p>
                <p className="text-sm text-foreground-muted mt-1">{order.shipping_address.street}</p>
                <p className="text-sm text-foreground-muted">
                  {order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.zip_code}
                </p>
                <p className="text-sm text-foreground-muted">{order.shipping_address.country}</p>
                {order.shipping_address.phone && (
                  <p className="text-sm text-foreground-muted mt-1">{order.shipping_address.phone}</p>
                )}
              </div>
            )}
          </div>

          {/* Order Items */}
          <div>
            <h3 className="mb-4 text-[11px] font-semibold uppercase tracking-wider text-foreground-muted">Items</h3>
            <div className="space-y-3">
              {order.order_items.map((item) => (
                <div key={item.id} className="flex items-center gap-4 rounded-2xl border border-border/50 bg-secondary/20 p-4 ring-1 ring-inset ring-border/10">
                  {item.product?.image_url ? (
                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-muted ring-1 ring-inset ring-border/20">
                      <Image
                        src={item.product.image_url}
                        alt={item.product.name}
                        fill
                        sizes="56px"
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-muted text-foreground-muted ring-1 ring-inset ring-border/20">
                      <Package className="h-6 w-6" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {item.product?.name || 'Unknown Product'}
                    </p>
                    <p className="text-xs text-foreground-muted mt-1">
                      Qty: {item.quantity} × {formatPrice(item.unit_price)}
                    </p>
                  </div>
                  <p className="text-sm font-medium text-foreground whitespace-nowrap tabular-nums">
                    {formatPrice(item.quantity * Number(item.unit_price))}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-6 flex flex-col items-end gap-2 text-sm">
              {order.shipping_amount > 0 && (
                <div className="flex w-48 justify-between">
                  <span className="text-foreground-muted">Shipping</span>
                  <span className="text-foreground tabular-nums">{formatPrice(order.shipping_amount)}</span>
                </div>
              )}
              {order.tax_amount > 0 && (
                <div className="flex w-48 justify-between">
                  <span className="text-foreground-muted">Tax</span>
                  <span className="text-foreground tabular-nums">{formatPrice(order.tax_amount)}</span>
                </div>
              )}
              <div className="flex w-48 justify-between border-t border-border/50 pt-2 font-medium">
                <span className="text-foreground">Total</span>
                <span className="text-foreground tabular-nums">{formatPrice(order.total_amount)}</span>
              </div>
            </div>
          </div>

          {/* Tracking & Notes */}
          <div className="rounded-2xl border border-border/50 bg-secondary/20 p-5 ring-1 ring-inset ring-border/10">
            <h3 className="mb-4 text-[11px] font-semibold uppercase tracking-wider text-foreground-muted">Tracking & Notes</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-foreground-muted">Tracking Number</label>
                <input
                  type="text"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  className="w-full rounded-xl border-0 bg-background px-4 py-2.5 text-sm text-foreground ring-1 ring-inset ring-border/50 focus:ring-2 focus:ring-inset focus:ring-primary outline-none transition-all"
                  placeholder="e.g. 1Z999AA10123456784"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-foreground-muted">Carrier</label>
                <select
                  value={trackingCarrier}
                  onChange={(e) => setTrackingCarrier(e.target.value)}
                  className="w-full rounded-xl border-0 bg-background px-4 py-2.5 text-sm text-foreground ring-1 ring-inset ring-border/50 focus:ring-2 focus:ring-inset focus:ring-primary outline-none transition-all appearance-none"
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
            <div className="mt-4">
              <label className="mb-1.5 block text-xs font-medium text-foreground-muted">Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                className="w-full rounded-xl border-0 bg-background px-4 py-2.5 text-sm text-foreground ring-1 ring-inset ring-border/50 focus:ring-2 focus:ring-inset focus:ring-primary outline-none transition-all resize-none"
                placeholder="Internal notes about this order..."
              />
            </div>
            <button
              onClick={handleSaveTracking}
              disabled={saving}
              className="mt-4 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-all hover:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100"
            >
              {saving ? 'Saving...' : 'Save Tracking & Notes'}
            </button>
          </div>

          {/* Stripe Link */}
          <div className="flex justify-end pb-4">
            <a
              href={`https://dashboard.stripe.com/payments/${order.stripe_session}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              <ExternalLink className="h-4 w-4" />
              View in Stripe
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
