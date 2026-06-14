'use client'

import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { useCartContext } from '@/context/CartContext'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { ShoppingCart, Heart, LogOut, Menu, X, Search } from 'lucide-react'
import { useState } from 'react'

export function Navbar() {
  const { user, loading } = useAuth()
  const { cartCount } = useCartContext()
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/products?q=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery('')
      setMobileSearchOpen(false)
    }
  }

  return (
    <nav className="sticky top-0 z-50 border-b bg-white dark:bg-zinc-950 dark:border-zinc-800">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="text-xl font-bold tracking-tight">
          Store
        </Link>

        <div className="hidden items-center gap-6 md:flex">
          <Link href="/products" className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100">
            Products
          </Link>

          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search with AI..."
              className="w-56 rounded-lg border bg-zinc-50 py-1.5 pl-9 pr-3 text-sm outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400 dark:border-zinc-700 dark:bg-zinc-800 dark:focus:border-zinc-500"
            />
          </form>

          {loading ? null : user ? (
            <>
              <Link href="/cart" className="relative text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100">
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-zinc-900 text-[10px] font-bold text-white dark:bg-zinc-100 dark:text-zinc-900">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </Link>
              <Link href="/wishlist" className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100">
                <Heart className="h-5 w-5" />
              </Link>
              <Link href="/orders" className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100">
                Orders
              </Link>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-1 text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
            >
              Sign In
            </Link>
          )}
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <button
            onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
            className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
            aria-label="Search"
          >
            <Search className="h-5 w-5" />
          </button>
          <button
            className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {mobileSearchOpen && (
        <div className="border-t px-4 py-3 md:hidden dark:border-zinc-800">
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search with AI..."
              className="w-full rounded-lg border bg-zinc-50 py-2 pl-10 pr-3 text-sm outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400 dark:border-zinc-700 dark:bg-zinc-800 dark:focus:border-zinc-500"
              autoFocus
            />
          </form>
        </div>
      )}

      {menuOpen && (
        <div className="border-t px-4 pb-4 md:hidden dark:border-zinc-800">
          <div className="mt-3 flex flex-col gap-3">
            <Link
              href="/products"
              className="text-sm font-medium text-zinc-600 dark:text-zinc-400"
              onClick={() => setMenuOpen(false)}
            >
              Products
            </Link>
            {loading ? null : user ? (
              <>
                <Link href="/cart" className="flex items-center gap-2 text-sm font-medium text-zinc-600 dark:text-zinc-400" onClick={() => setMenuOpen(false)}>
                  Cart
                  {cartCount > 0 && (
                    <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-zinc-900 text-[10px] font-bold text-white dark:bg-zinc-100 dark:text-zinc-900">
                      {cartCount > 99 ? '99+' : cartCount}
                    </span>
                  )}
                </Link>
                <Link href="/wishlist" className="text-sm font-medium text-zinc-600 dark:text-zinc-400" onClick={() => setMenuOpen(false)}>
                  Wishlist
                </Link>
                <Link href="/orders" className="text-sm font-medium text-zinc-600 dark:text-zinc-400" onClick={() => setMenuOpen(false)}>
                  Orders
                </Link>
                <button onClick={handleSignOut} className="text-left text-sm font-medium text-zinc-600 dark:text-zinc-400">
                  Sign Out
                </button>
              </>
            ) : (
              <Link href="/login" className="text-sm font-medium text-zinc-600 dark:text-zinc-400" onClick={() => setMenuOpen(false)}>
                Sign In
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
