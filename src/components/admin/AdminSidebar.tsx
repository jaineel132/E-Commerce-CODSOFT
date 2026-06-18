'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Package, ShoppingCart, Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState } from 'react'

const links = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingCart },
]

function SidebarContent({ pathname }: { pathname: string }) {
  return (
    <>
      <div className="px-4 pt-6 pb-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-foreground-muted">
          Admin Panel
        </p>
      </div>

      <div className="px-2 space-y-0.5">
        <p className="px-3 py-2 text-[11px] font-medium uppercase tracking-wider text-foreground-muted/60">
          Overview
        </p>
        {links.slice(0, 1).map((link) => {
          const Icon = link.icon
          const isActive = pathname === link.href

          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'group relative flex items-center gap-3 rounded-[10px] px-3 py-2.5 text-[13px] font-medium transition-all',
                isActive
                  ? 'bg-indigo-500/10 text-indigo-400'
                  : 'text-foreground-muted hover:bg-secondary hover:text-foreground',
              )}
            >
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[3px] rounded-full bg-indigo-400" />
              )}
              <Icon className="h-4 w-4" />
              {link.label}
            </Link>
          )
        })}

        <p className="px-3 pt-4 pb-2 text-[11px] font-medium uppercase tracking-wider text-foreground-muted/60">
          Manage
        </p>
        {links.slice(1).map((link) => {
          const Icon = link.icon
          const isActive = pathname.startsWith(link.href)

          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'group relative flex items-center gap-3 rounded-[10px] px-3 py-2.5 text-[13px] font-medium transition-all',
                isActive
                  ? 'bg-indigo-500/10 text-indigo-400'
                  : 'text-foreground-muted hover:bg-secondary hover:text-foreground',
              )}
            >
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[3px] rounded-full bg-indigo-400" />
              )}
              <Icon className="h-4 w-4" />
              {link.label}
            </Link>
          )
        })}
      </div>
    </>
  )
}

export function AdminSidebar() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      {/* Mobile trigger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg md:hidden"
        aria-label="Open admin menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden" onClick={() => setMobileOpen(false)}>
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <aside
            className="absolute left-0 top-0 h-full w-64 border-r border-border bg-card shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-end p-3">
              <button
                onClick={() => setMobileOpen(false)}
                className="rounded-full p-2 text-foreground-muted hover:bg-secondary"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <SidebarContent pathname={pathname} />
          </aside>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden w-60 flex-shrink-0 border-r border-border bg-card md:block">
        <nav className="sticky top-16">
          <SidebarContent pathname={pathname} />
        </nav>
      </aside>
    </>
  )
}
