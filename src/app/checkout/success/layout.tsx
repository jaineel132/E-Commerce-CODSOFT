import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Order Confirmed',
  description: 'Your order has been placed successfully',
}

export default function CheckoutSuccessLayout({ children }: { children: React.ReactNode }) {
  return children
}
