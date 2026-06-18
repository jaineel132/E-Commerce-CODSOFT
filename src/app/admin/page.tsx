'use client'

import { memo, useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import dynamic from 'next/dynamic'
import { TrendingUp, ShoppingCart, Package, DollarSign, type LucideIcon } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

const OrdersChart = dynamic(
  () => import('@/components/admin/OrdersChart'),
  { ssr: false }
)

interface DashboardStats {
  totalRevenue: number
  totalOrders: number
  totalProducts: number
  ordersByDay: { date: string; count: number }[]
  topProducts: { name: string; total_sold: number; revenue: number }[]
}

type ColorBase = 'indigo' | 'emerald' | 'purple' | 'amber'

const StatCard = memo(function StatCard({ label, value, icon: Icon, colorBase }: { label: string; value: string; icon: LucideIcon; colorBase: ColorBase }) {
  const colors = {
    indigo: { text: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-500/10', border: 'bg-indigo-500' },
    emerald: { text: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/10', border: 'bg-emerald-500' },
    purple: { text: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-500/10', border: 'bg-purple-500' },
    amber: { text: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-500/10', border: 'bg-amber-500' },
  }
  const c = colors[colorBase]
  return (
    <div className="relative overflow-hidden rounded-[20px] border border-border/50 bg-surface-1 p-6 shadow-sm ring-1 ring-inset ring-border/10 transition-all hover:shadow-md">
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${c.border}`} />
      <div className="flex items-center justify-between">
        <p className="text-[13px] font-medium text-foreground-muted">{label}</p>
        <div className={`flex h-8 w-8 items-center justify-center rounded-full ${c.bg}`}>
          <Icon className={`h-4 w-4 ${c.text}`} />
        </div>
      </div>
      <p className="mt-4 font-serif text-3xl font-bold text-foreground tabular-nums tracking-tight">{value}</p>
    </div>
  )
})

export default function AdminDashboard() {
  const { profile } = useAuth()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/stats')
      .then((res) => res.json())
      .then((data) => setStats(data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const statCards: { label: string; value: string; icon: LucideIcon; colorBase: ColorBase }[] = [
    { label: 'Total Revenue', value: `$${stats?.totalRevenue.toFixed(2) || '0.00'}`, icon: DollarSign, colorBase: 'indigo' },
    { label: 'Total Orders', value: String(stats?.totalOrders || 0), icon: ShoppingCart, colorBase: 'emerald' },
    { label: 'Total Products', value: String(stats?.totalProducts || 0), icon: Package, colorBase: 'purple' },
    { label: 'Avg Orders/Day', value: stats?.ordersByDay?.length ? (stats.totalOrders / stats.ordersByDay.length).toFixed(1) : '0', icon: TrendingUp, colorBase: 'amber' },
  ]

  return (
    <Skeleton name="admin-dashboard" loading={loading}>
      <div className="space-y-8 animate-fade-in">
        <div>
          <h1 className="text-display-sm text-foreground">Dashboard</h1>
          <p className="mt-1 text-sm text-foreground-muted">
            Welcome back, {profile?.full_name || 'Admin'}
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map((card) => (
            <StatCard key={card.label} {...card} />
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-[24px] border border-border/50 bg-surface-1 p-6 shadow-sm ring-1 ring-inset ring-border/10">
            <h2 className="mb-6 text-[11px] font-semibold uppercase tracking-[0.15em] text-foreground-muted">
              Orders Per Day
            </h2>
            {stats?.ordersByDay?.length ? (
              <OrdersChart data={stats.ordersByDay} />
            ) : (
              <div className="flex h-[300px] items-center justify-center rounded-xl border border-dashed border-border/50">
                <p className="text-sm text-foreground-muted">No orders yet</p>
              </div>
            )}
          </div>

          <div className="rounded-[24px] border border-border/50 bg-surface-1 p-6 shadow-sm ring-1 ring-inset ring-border/10">
            <h2 className="mb-6 text-[11px] font-semibold uppercase tracking-[0.15em] text-foreground-muted">
              Top Products
            </h2>
            {stats?.topProducts && stats.topProducts.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-border/50">
                      <th className="pb-3 text-xs font-medium text-foreground-muted">Product</th>
                      <th className="pb-3 text-right text-xs font-medium text-foreground-muted">Sold</th>
                      <th className="pb-3 text-right text-xs font-medium text-foreground-muted">Revenue</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {stats.topProducts.slice(0, 5).map((product, i) => (
                      <tr key={i} className="group transition-colors hover:bg-secondary/50">
                        <td className="py-3 pr-4 font-medium text-foreground">
                          {product.name}
                        </td>
                        <td className="py-3 pr-4 text-right tabular-nums text-foreground-muted">
                          {product.total_sold}
                        </td>
                        <td className="py-3 text-right font-medium tabular-nums text-foreground">
                          ${product.revenue.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex h-[300px] items-center justify-center rounded-xl border border-dashed border-border/50">
                <p className="text-sm text-foreground-muted">No sales yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Skeleton>
  )
}