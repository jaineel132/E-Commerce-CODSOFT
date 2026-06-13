import { cn } from '@/lib/utils'

interface StockBadgeProps {
  stockCount: number
  className?: string
}

export function StockBadge({ stockCount, className }: StockBadgeProps) {
  if (stockCount <= 0) {
    return (
      <span className={cn('inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800 dark:bg-red-900/30 dark:text-red-400', className)}>
        Out of Stock
      </span>
    )
  }

  if (stockCount <= 5) {
    return (
      <span className={cn('inline-flex items-center rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-medium text-orange-800 dark:bg-orange-900/30 dark:text-orange-400', className)}>
        Only {stockCount} left
      </span>
    )
  }

  return (
    <span className={cn('inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-400', className)}>
      In Stock
    </span>
  )
}
