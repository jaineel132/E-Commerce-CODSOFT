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
    <div className={`mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 ${className || ''}`}>
      <div className="flex flex-col items-center justify-center text-center">
        <div className="mb-6 rounded-full bg-muted p-6">
          <Icon className="h-12 w-12 text-muted-foreground" />
        </div>
        <h1 className="mb-2 font-serif text-2xl font-bold text-foreground">
          {title}
        </h1>
        <p className="mb-8 text-sm text-muted-foreground">
          {description}
        </p>
        {actionLabel && actionHref && (
          <Link
            href={actionHref}
            className="rounded-xl bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            {actionLabel}
          </Link>
        )}
      </div>
    </div>
  )
}
