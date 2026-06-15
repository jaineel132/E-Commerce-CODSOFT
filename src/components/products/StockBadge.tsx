import { cn } from '@/lib/utils'

interface StockBadgeProps {
  stockCount: number
  className?: string
}

export function StockBadge({ stockCount, className }: StockBadgeProps) {
  if (stockCount <= 0) {
    return (
      <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-destructive/10 text-destructive dark:bg-destructive/20', className)}>
        Out of Stock
      </span>
    )
  }

  if (stockCount <= 5) {
    return (
      <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-accent/10 text-accent-foreground dark:bg-accent/20', className)}>
        Only {stockCount} left
      </span>
    )
  }

  return (
    <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-primary/10 text-primary dark:bg-primary/20', className)}>
      In Stock
    </span>
  )
}
