import { memo } from 'react'
import { cn } from '@/lib/utils'

interface StockBadgeProps {
  stockCount: number
  className?: string
}

export const StockBadge = memo(function StockBadge({ stockCount, className }: StockBadgeProps) {
  if (stockCount <= 0) {
    return (
      <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium bg-background/90 text-foreground backdrop-blur-sm ring-1 ring-inset ring-border/50 shadow-sm', className)}>
        <span className="h-1.5 w-1.5 rounded-full bg-destructive"></span>
        Out of Stock
      </span>
    )
  }

  if (stockCount <= 5) {
    return (
      <span
        className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium bg-background/90 text-foreground backdrop-blur-sm ring-1 ring-inset ring-border/50 shadow-sm', className)}
      >
        <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse"></span>
        Only {stockCount} left
      </span>
    )
  }

  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium bg-background/90 text-foreground backdrop-blur-sm ring-1 ring-inset ring-border/50 shadow-sm', className)}>
      <span className="h-1.5 w-1.5 rounded-full bg-success"></span>
      In Stock
    </span>
  )
})
