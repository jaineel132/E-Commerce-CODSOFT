import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Cart',
  description: 'Review and manage your shopping cart',
}

export default function CartLayout({ children }: { children: React.ReactNode }) {
  return children
}
