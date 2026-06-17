'use client'

import Link from 'next/link'
import { Package, Heart, Clock, ChevronRight, Award } from 'lucide-react'

const quickLinks = [
  { href: '/orders', label: 'Orders', icon: Package, description: 'Track your purchases', color: 'from-blue-50 to-indigo-50', iconColor: 'text-blue-600', borderColor: 'border-blue-200' },
  { href: '/wishlist', label: 'Wishlist', icon: Heart, description: 'Saved for later', color: 'from-rose-50 to-pink-50', iconColor: 'text-rose-600', borderColor: 'border-rose-200' },
  { href: '/recently-viewed', label: 'Recently Viewed', icon: Clock, description: 'Continue browsing', color: 'from-amber-50 to-orange-50', iconColor: 'text-amber-600', borderColor: 'border-amber-200' },
]

export function QuickLinksSection() {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <h3 className="mb-4 flex items-center gap-2 px-2 font-serif text-sm font-semibold text-foreground">
        <Award className="h-4 w-4 text-primary" />
        Quick Links
      </h3>
      <div className="space-y-2">
        {quickLinks.map((link) => (
          <div
            key={link.href}
          >
            <Link
              href={link.href}
              className="group flex items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-medium text-muted-foreground transition-all duration-200 hover:bg-gradient-to-r hover:from-muted/50 hover:to-muted/30"
            >
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${link.color} ${link.iconColor} shadow-sm group-hover:shadow-md transition-shadow ${link.borderColor} border`}>
                <link.icon className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <span className="block font-medium text-foreground group-hover:text-primary transition-colors">{link.label}</span>
                <span className="block text-xs font-normal text-muted-foreground">{link.description}</span>
              </div>
              <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}