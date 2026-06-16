import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Orders',
  description: 'View your order history',
}

export default function OrdersLayout({ children }: { children: React.ReactNode }) {
  return children
}
