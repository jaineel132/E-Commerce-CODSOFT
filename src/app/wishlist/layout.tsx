import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Wishlist',
  description: 'View your saved favourite products',
}

export default function WishlistLayout({ children }: { children: React.ReactNode }) {
  return children
}
