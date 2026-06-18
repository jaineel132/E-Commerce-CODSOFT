import Link from 'next/link'
import type { LucideIcon } from 'lucide-react'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  actionLabel?: string
  actionHref?: string
  className?: string
}

export function EmptyState({ icon: Icon, title, description, actionLabel, actionHref, className }: EmptyStateProps) {
  return (
    <div className={`mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 ${className || ''}`}>
      <div className="flex flex-col items-center justify-center text-center">
        <div className="relative mb-8">
          <div className="absolute inset-0 rounded-full bg-primary/10 animate-ping opacity-20" />
          <div className="relative rounded-full bg-secondary p-8 ring-1 ring-inset ring-border/50 shadow-sm">
            <Icon className="h-12 w-12 text-primary" />
          </div>
        </div>
        <h1 className="mb-3 display-sm text-foreground">
          {title}
        </h1>
        <p className="mb-10 max-w-sm text-[15px] leading-relaxed text-foreground-muted">
          {description}
        </p>
        {actionLabel && actionHref && (
          <Link
            href={actionHref}
            className="rounded-full bg-primary px-8 py-3.5 text-[15px] font-medium text-primary-foreground transition-all duration-300 hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98] shadow-sm hover:shadow-primary/25"
          >
            {actionLabel}
          </Link>
        )}
      </div>
    </div>
  )
}
