'use client'

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

interface OrdersChartProps {
  data: { date: string; count: number }[]
}

export default function OrdersChart({ data }: OrdersChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-border/40" />
        <XAxis 
          dataKey="date" 
          tick={{ fontSize: 12, fill: 'currentColor' }} 
          className="text-foreground-muted"
          axisLine={false}
          tickLine={false}
          dy={10}
        />
        <YAxis 
          allowDecimals={false} 
          tick={{ fontSize: 12, fill: 'currentColor' }}
          className="text-foreground-muted"
          axisLine={false}
          tickLine={false}
        />
        <Tooltip 
          cursor={{ fill: 'var(--border)', opacity: 0.2 }}
          contentStyle={{ 
            backgroundColor: 'var(--card)', 
            borderRadius: '12px',
            border: '1px solid var(--border)',
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
            color: 'var(--foreground)'
          }}
          itemStyle={{ color: 'var(--indigo-500)', fontWeight: 600 }}
        />
        <Bar 
          dataKey="count" 
          fill="#6366f1" // indigo-500
          radius={[4, 4, 0, 0]} 
          maxBarSize={40}
        />
      </BarChart>
    </ResponsiveContainer>
  )
}