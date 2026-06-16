'use client'

import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { useCartContext } from '@/context/CartContext'
import { useWishlistContext } from '@/context/WishlistContext'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { ShoppingCart, Heart, LogOut, Menu, X, Search } from 'lucide-react'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export function Navbar() {
  const { user, loading } = useAuth()
  const { cartCount } = useCartContext()
  const { wishlistItems } = useWishlistContext()
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
    <nav className="sticky top-0 z-50 border-b border-border bg-background/70 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="font-serif text-xl font-semibold tracking-tighter text-foreground transition-all duration-200">
          Store
        </Link>

        <div className="hidden items-center gap-6 md:flex">
          <Link href="/products" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-all duration-200">
            Products
          </Link>

          <form onSubmit={handleSearch} className="relative">
            <div className="ai-search-glow rounded-lg p-[1px]">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search with AI..."
                  className="w-64 rounded-lg border-0 bg-background py-1.5 pl-9 pr-3 text-sm text-foreground outline-none transition-all duration-300 focus:w-80"
                />
              </div>
            </div>
          </form>

          <ThemeToggle />
          {loading ? null : user ? (
            <>
              <Link href="/cart" className="relative text-muted-foreground hover:text-foreground transition-all duration-200">
                <ShoppingCart className="h-5 w-5" />
                <AnimatePresence mode="wait">
                  {cartCount > 0 && (
                    <motion.span
                      key={cartCount}
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.5, opacity: 0 }}
                      className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground"
                    >
                      {cartCount > 99 ? '99+' : cartCount}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
              <Link href="/wishlist" className="relative text-muted-foreground hover:text-foreground transition-all duration-200">
                <Heart className="h-5 w-5" />
                {wishlistItems.length > 0 && (
                  <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                    {wishlistItems.length > 99 ? '99+' : wishlistItems.length}
                  </span>
                )}
              </Link>
              <Link href="/orders" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-all duration-200">
                Orders
              </Link>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-all duration-200"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-all duration-200"
            >
              Sign In
            </Link>
          )}
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <button
            onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
            className="text-muted-foreground hover:text-foreground transition-all duration-200"
            aria-label="Search"
          >
            <Search className="h-5 w-5" />
          </button>
          <button
            className="text-muted-foreground hover:text-foreground transition-all duration-200"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {mobileSearchOpen && (
        <div className="border-t border-border px-4 py-3 md:hidden">
          <form onSubmit={handleSearch} className="relative">
            <div className="ai-search-glow rounded-lg p-[1px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search with AI..."
                  className="w-full rounded-lg border-0 bg-background py-2 pl-10 pr-3 text-sm text-foreground outline-none transition-all duration-300"
                  autoFocus
                />
              </div>
            </div>
          </form>
        </div>
      )}

      {menuOpen && (
        <div className="border-t border-border bg-background/95 px-4 pb-4 backdrop-blur-md md:hidden">
          <div className="mt-3 flex flex-col gap-3">
            <Link
              href="/products"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-all duration-200"
              onClick={() => setMenuOpen(false)}
            >
              Products
            </Link>
            <ThemeToggle />
            {loading ? null : user ? (
              <>
                <Link href="/cart" className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-all duration-200" onClick={() => setMenuOpen(false)}>
                  Cart
                  <AnimatePresence mode="wait">
                    {cartCount > 0 && (
                      <motion.span
                        key={cartCount}
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.5, opacity: 0 }}
                        className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground"
                      >
                        {cartCount > 99 ? '99+' : cartCount}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Link>
                <Link href="/wishlist" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-all duration-200" onClick={() => setMenuOpen(false)}>
                  Wishlist
                </Link>
                <Link href="/orders" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-all duration-200" onClick={() => setMenuOpen(false)}>
                  Orders
                </Link>
                <button onClick={handleSignOut} className="text-left text-sm font-medium text-muted-foreground hover:text-foreground transition-all duration-200">
                  Sign Out
                </button>
              </>
            ) : (
              <Link href="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-all duration-200" onClick={() => setMenuOpen(false)}>
                Sign In
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
