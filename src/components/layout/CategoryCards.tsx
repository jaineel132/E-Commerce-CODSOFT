'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Monitor, Shirt, BookOpen, Home, Loader2, Headphones, Watch, Laptop, Gamepad2, Speaker } from 'lucide-react'
import type { Category } from '@/types'

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  electronics: Monitor,
  clothing: Shirt,
  books: BookOpen,
  'home-kitchen': Home,
}

const styles = [
  { bg: 'bg-zinc-900', text: 'text-white', button: 'bg-primary text-primary-foreground hover:bg-primary-hover', icon: Headphones },
  { bg: 'bg-yellow-400', text: 'text-black', button: 'bg-white/90 text-black hover:bg-white', icon: Watch },
  { bg: 'bg-primary', text: 'text-primary-foreground', button: 'bg-white/90 text-primary hover:bg-white', icon: Laptop },
  { bg: 'bg-gray-200', text: 'text-black', button: 'bg-primary text-primary-foreground hover:bg-primary-hover', icon: Gamepad2 },
  { bg: 'bg-green-500', text: 'text-white', button: 'bg-white/90 text-green-600 hover:bg-white', icon: Monitor },
  { bg: 'bg-blue-500', text: 'text-white', button: 'bg-white/90 text-blue-600 hover:bg-white', icon: Speaker },
]

export function CategoryCards() {
  const [categories, setCategories] = useState<Category[]>([])

  useEffect(() => {
    fetch('/api/categories')
      .then((r) => r.json())
      .then((data) => setCategories(data.categories ?? []))
      .catch(() => {})
  }, [])

  return (
    <section className="bg-background py-16">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 auto-rows-[280px]">
          {categories.length === 0 ? (
            <div className="col-span-full flex items-center justify-center py-12 text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : (
            categories.map((category, i) => {
              const style = styles[i % styles.length]
              const Icon = iconMap[category.slug] || style.icon
              
              // Make the third card span 2 columns
              const isWide = i === 2
              // Make the fourth card span all 4 columns to fill the remaining space
              const isFull = i === 3
              
              return (
                <Link
                  key={category.id}
                  href={`/products?category=${encodeURIComponent(category.slug)}`}
                  className={`group relative flex flex-col justify-between overflow-hidden rounded-3xl p-8 transition-transform duration-300 hover:scale-[1.02] ${style.bg} ${isWide ? 'md:col-span-2' : ''} ${isFull ? 'md:col-span-2 lg:col-span-4' : ''}`}
                >
                  <div className={`relative z-10 h-full flex flex-col justify-center items-start ${style.text} ${isWide || isFull ? 'w-1/2' : 'w-2/3'}`}>
                    <p className="text-sm font-medium opacity-80 mb-1">Explore</p>
                    <h3 className="text-3xl font-black mb-6 uppercase leading-tight">
                      {category.name}
                    </h3>
                    <div className={`rounded-full px-6 py-2 text-sm font-bold transition-transform group-hover:scale-105 ${style.button}`}>
                      Browse
                    </div>
                  </div>
                  
                  {/* Large Icon in background / right side */}
                  <div className="absolute right-[-20px] bottom-[-20px] h-64 w-64 opacity-20 transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-12 flex items-center justify-center">
                     <Icon className={`h-48 w-48 ${style.text}`} />
                  </div>
                </Link>
              )
            })
          )}
        </div>
        
        {/* Trust Indicator Strip */}
        <div className="mt-16 py-8 border-t border-border">
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16 text-sm font-bold text-foreground">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary/10 text-primary">
                 <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 18H3c-.6 0-1-.4-1-1V7c0-.6.4-1 1-1h10c.6 0 1 .4 1 1v11"/><path d="M14 9h4l4 4v4c0 .6-.4 1-1 1h-2"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/></svg>
              </div>
              <div className="flex flex-col">
                <span>Free Shipping</span>
                <span className="text-xs font-normal text-muted-foreground">Free Shipping On All Order</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary/10 text-primary">
                 <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>
              </div>
              <div className="flex flex-col">
                <span>Money Guarantee</span>
                <span className="text-xs font-normal text-muted-foreground">30 Day Money Back</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary/10 text-primary">
                 <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/></svg>
              </div>
              <div className="flex flex-col">
                <span>Online Support 24/7</span>
                <span className="text-xs font-normal text-muted-foreground">Technical Support 24/7</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary/10 text-primary">
                 <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              </div>
              <div className="flex flex-col">
                <span>Secure Payment</span>
                <span className="text-xs font-normal text-muted-foreground">All Cards Accepted</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

