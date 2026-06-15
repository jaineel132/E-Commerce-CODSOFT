'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { TrendingUp, ShoppingCart, Package, DollarSign } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

interface DashboardStats {
  totalRevenue: number
  totalOrders: number
  totalProducts: number
  ordersByDay: { date: string; count: number }[]
  topProducts: { name: string; total_sold: number; revenue: number }[]
}

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

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 animate-pulse rounded bg-muted" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-xl border bg-card" />
          ))}
        </div>
      </div>
    )
  }

  const statCards = [
    { label: 'Total Revenue', value: `$${stats?.totalRevenue.toFixed(2) || '0.00'}`, icon: DollarSign, color: 'text-green-600 dark:text-green-400' },
    { label: 'Total Orders', value: String(stats?.totalOrders || 0), icon: ShoppingCart, color: 'text-blue-600 dark:text-blue-400' },
    { label: 'Total Products', value: String(stats?.totalProducts || 0), icon: Package, color: 'text-purple-600 dark:text-purple-400' },
    { label: 'Avg Orders/Day', value: stats?.ordersByDay?.length ? (stats.totalOrders / stats.ordersByDay.length).toFixed(1) : '0', icon: TrendingUp, color: 'text-amber-600 dark:text-amber-400' },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Welcome back, {profile?.full_name || 'Admin'}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => {
          const Icon = card.icon
          return (
            <div key={card.label} className="rounded-xl border bg-card p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">{card.label}</p>
                <Icon className={`h-5 w-5 ${card.color}`} />
              </div>
              <p className="mt-2 text-2xl font-bold text-foreground">{card.value}</p>
            </div>
          )
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Orders Per Day
          </h2>
          {stats?.ordersByDay?.length ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.ordersByDay}>
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
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
              <div key={i} className="flex items-center justify-between text-sm">
                <span className="text-foreground">{product.name}</span>
                <span className="text-muted-foreground">
                  {product.total_sold} sold (${product.revenue.toFixed(2)})
                </span>
              </div>
            ))}
            {(!stats?.topProducts || stats.topProducts.length === 0) && (
              <p className="text-sm text-muted-foreground">No orders yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
