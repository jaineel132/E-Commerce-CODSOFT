'use client'

interface PaginationProps {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
}

export function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null

  const pages: (number | 'ellipsis')[] = []
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= page - 1 && i <= page + 1)) {
      pages.push(i)
    } else if (pages[pages.length - 1] !== 'ellipsis') {
      pages.push('ellipsis')
    }
  }

  return (
    <nav className="mt-12 flex items-center justify-center gap-2">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className="inline-flex h-10 items-center justify-center rounded-full px-4 text-[13px] font-medium
          text-foreground-muted ring-1 ring-inset ring-border transition-colors hover:bg-secondary hover:text-foreground
          disabled:pointer-events-none disabled:opacity-40 shadow-sm"
        aria-label="Previous page"
      >
        &larr; Prev
      </button>

      {pages.map((p, i) =>
        p === 'ellipsis' ? (
          <span key={`e-${i}`} className="inline-flex h-10 w-10 items-center justify-center text-foreground-muted">
            &hellip;
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`inline-flex h-10 w-10 items-center justify-center rounded-full text-[14px] font-medium transition-all shadow-sm ring-1 ring-inset
              ${p === page
                ? 'bg-primary text-primary-foreground ring-primary scale-110 shadow-primary/20'
                : 'bg-card text-foreground-muted ring-border hover:bg-secondary hover:text-foreground'
              }`}
          >
            {p}
          </button>
        )
      )}

      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        className="inline-flex h-10 items-center justify-center rounded-full px-4 text-[13px] font-medium
          text-foreground-muted ring-1 ring-inset ring-border transition-colors hover:bg-secondary hover:text-foreground
          disabled:pointer-events-none disabled:opacity-40 shadow-sm"
        aria-label="Next page"
      >
        Next &rarr;
      </button>
    </nav>
  )
}
