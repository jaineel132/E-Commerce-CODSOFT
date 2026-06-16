import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Recently Viewed',
  description: 'Products you recently browsed',
}

export default function RecentlyViewedLayout({ children }: { children: React.ReactNode }) {
  return children
}
