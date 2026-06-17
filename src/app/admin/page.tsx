'use client'

import { memo, useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import dynamic from 'next/dynamic'
import { TrendingUp, ShoppingCart, Package, DollarSign, type LucideIcon } from 'lucide-react'
import { Skeleton } from 'boneyard-js/react'

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

const StatCard = memo(function StatCard({ label, value, icon: Icon, color }: { label: string; value: string; icon: LucideIcon; color: string }) {
  return (
    <div className="rounded-xl border bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <Icon className={`h-5 w-5 ${color}`} />
      </div>
      <p className="mt-2 text-2xl font-bold text-foreground">{value}</p>
    </div>
  )
})

const TopProductRow = memo(function TopProductRow({ name, totalSold, revenue }: { name: string; totalSold: number; revenue: number }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-foreground">{name}</span>
      <span className="text-muted-foreground">
        {totalSold} sold (${revenue.toFixed(2)})
      </span>
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

  const statCards = [
    { label: 'Total Revenue', value: `$${stats?.totalRevenue.toFixed(2) || '0.00'}`, icon: DollarSign, color: 'text-green-600 dark:text-green-400' },
    { label: 'Total Orders', value: String(stats?.totalOrders || 0), icon: ShoppingCart, color: 'text-blue-600 dark:text-blue-400' },
    { label: 'Total Products', value: String(stats?.totalProducts || 0), icon: Package, color: 'text-purple-600 dark:text-purple-400' },
    { label: 'Avg Orders/Day', value: stats?.ordersByDay?.length ? (stats.totalOrders / stats.ordersByDay.length).toFixed(1) : '0', icon: TrendingUp, color: 'text-amber-600 dark:text-amber-400' },
  ]

  return (
    <Skeleton name="admin-dashboard" loading={loading}>
      <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Welcome back, {profile?.full_name || 'Admin'}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => (
          <StatCard key={card.label} {...card} />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Orders Per Day
          </h2>
          {stats?.ordersByDay?.length ? (
            <OrdersChart data={stats.ordersByDay} />
          ) : (
            <p className="text-sm text-muted-foreground">No orders yet</p>
          )}
        </div>

        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Top Products
          </h2>
          <div className="space-y-3">
            {stats?.topProducts?.slice(0, 5).map((product, i) => (
              <TopProductRow key={i} name={product.name} totalSold={product.total_sold} revenue={product.revenue} />
            ))}
            {(!stats?.topProducts || stats.topProducts.length === 0) && (
              <p className="text-sm text-muted-foreground">No orders yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
    </Skeleton>
  )
}