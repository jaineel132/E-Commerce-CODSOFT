'use client'

import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { useCartContext } from '@/context/CartContext'
import { useWishlistContext } from '@/context/WishlistContext'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { ShoppingCart, Heart, LogOut, Menu, X, LayoutDashboard, Package, ShoppingCart as CartIcon, User, Search } from 'lucide-react'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export function Navbar() {
  const { user, profile, loading } = useAuth()
  const { cartCount } = useCartContext()
  const { wishlistItems } = useWishlistContext()
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const isAdmin = profile?.role === 'admin'

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const q = formData.get('q')
    if (q) {
      router.push(`/products?q=${encodeURIComponent(q.toString())}`)
      setMenuOpen(false)
    }
  }

  return (
    <nav className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'bg-background/80 backdrop-blur-md border-b border-border shadow-sm' : 'bg-transparent border-b border-transparent'}`}>
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-xl font-bold tracking-[-0.05em] text-foreground transition-all duration-200">
            Verdant
          </Link>
          
          {!isAdmin && (
            <div className="hidden md:block w-64 relative group">
              <form onSubmit={handleSearchSubmit}>
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary to-accent opacity-0 group-hover:opacity-10 transition-opacity duration-300 pointer-events-none"></div>
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  name="q"
                  placeholder="Search products..."
                  className="w-full bg-muted/50 border border-border rounded-full py-1.5 pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </form>
            </div>
          )}
        </div>

        <div className="hidden items-center gap-6 md:flex">
          {isAdmin ? (
            <>
              <Link href="/admin" className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-all duration-200">
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </Link>
              <Link href="/admin/products" className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-all duration-200">
                <Package className="h-4 w-4" />
                Products
              </Link>
              <Link href="/admin/orders" className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-all duration-200">
                <CartIcon className="h-4 w-4" />
                Orders
              </Link>
            </>
          ) : (
            <Link href="/products" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-all duration-200">
              Products
            </Link>
          )}

          <ThemeToggle />
          {loading ? null : user ? (
            <>
          {!isAdmin && (
                <>
                  <Link id="cart-icon-desktop" href="/cart" aria-label="Shopping cart" className="relative text-muted-foreground hover:text-foreground transition-all duration-200">
                    <ShoppingCart className="h-5 w-5" />
                    {cartCount > 0 && (
                      <AnimatePresence mode="wait">
                        <motion.span 
                          key={cartCount}
                          initial={{ scale: 0.5, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0.5, opacity: 0 }}
                          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                          className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground"
                        >
                          {cartCount > 99 ? '99+' : cartCount}
                        </motion.span>
                      </AnimatePresence>
                    )}
                  </Link>
                  <Link href="/wishlist" aria-label="Wishlist" className="relative text-muted-foreground hover:text-foreground transition-all duration-200">
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
                  <Link href="/profile" aria-label="Profile" className="text-muted-foreground hover:text-foreground transition-all duration-200">
                    <User className="h-5 w-5" />
                  </Link>
                </>
              )}
              <button
                onClick={handleSignOut}
                className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-all duration-200"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </>
          ) : (
              !isAdmin && (
              <Link
                href="/login"
                className="rounded-full bg-primary px-5 py-2 text-[13px] font-medium text-primary-foreground hover:bg-primary/90 transition-all duration-200 hover:shadow-md"
              >
                Sign In
              </Link>
            )
          )}
        </div>

        <div className="flex items-center gap-3 md:hidden">
                {!isAdmin && (
            <Link href="/cart" aria-label="Shopping cart" className="relative text-muted-foreground hover:text-foreground transition-all duration-200">
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <AnimatePresence mode="wait">
                  <motion.span 
                    key={cartCount}
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.5, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground"
                  >
                    {cartCount > 99 ? '99+' : cartCount}
                  </motion.span>
                </AnimatePresence>
              )}
            </Link>
          )}
          <ThemeToggle />
          <button
            className="text-muted-foreground hover:text-foreground transition-all duration-200"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {menuOpen && (
        <div className="absolute top-full left-0 right-0 border-b border-border bg-background/95 p-4 backdrop-blur-md md:hidden shadow-lg animate-fade-in-up">
          <div className="flex flex-col gap-6">
            {!isAdmin && (
              <form onSubmit={handleSearchSubmit} className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  name="q"
                  placeholder="Search products..."
                  className="w-full bg-muted border border-border rounded-full py-2 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </form>
            )}

            <div className="space-y-3">
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Navigation</div>
              {isAdmin ? (
                <>
                  <Link href="/admin" className="flex items-center gap-3 text-sm font-medium text-foreground hover:text-primary transition-colors p-2 rounded-md hover:bg-muted" onClick={() => setMenuOpen(false)}>
                    <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
                    Dashboard
                  </Link>
                  <Link href="/admin/products" className="flex items-center gap-3 text-sm font-medium text-foreground hover:text-primary transition-colors p-2 rounded-md hover:bg-muted" onClick={() => setMenuOpen(false)}>
                    <Package className="h-4 w-4 text-muted-foreground" />
                    Products
                  </Link>
                  <Link href="/admin/orders" className="flex items-center gap-3 text-sm font-medium text-foreground hover:text-primary transition-colors p-2 rounded-md hover:bg-muted" onClick={() => setMenuOpen(false)}>
                    <CartIcon className="h-4 w-4 text-muted-foreground" />
                    Orders
                  </Link>
                </>
              ) : (
                <Link
                  href="/products"
                  className="flex items-center gap-3 text-sm font-medium text-foreground hover:text-primary transition-colors p-2 rounded-md hover:bg-muted"
                  onClick={() => setMenuOpen(false)}
                >
                  <Package className="h-4 w-4 text-muted-foreground" />
                  All Products
                </Link>
              )}
            </div>

            {loading ? null : user ? (
              <div className="space-y-3 pt-3 border-t border-border">
                <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">My Account</div>
              {!isAdmin && (
                  <>
                    <Link href="/wishlist" className="flex items-center gap-3 text-sm font-medium text-foreground hover:text-primary transition-colors p-2 rounded-md hover:bg-muted" onClick={() => setMenuOpen(false)}>
                      <Heart className="h-4 w-4 text-muted-foreground" />
                      Wishlist ({wishlistItems.length})
                    </Link>
                    <Link href="/orders" className="flex items-center gap-3 text-sm font-medium text-foreground hover:text-primary transition-colors p-2 rounded-md hover:bg-muted" onClick={() => setMenuOpen(false)}>
                      <Package className="h-4 w-4 text-muted-foreground" />
                      Orders
                    </Link>
                    <Link href="/profile" className="flex items-center gap-3 text-sm font-medium text-foreground hover:text-primary transition-colors p-2 rounded-md hover:bg-muted" onClick={() => setMenuOpen(false)}>
                      <User className="h-4 w-4 text-muted-foreground" />
                      Profile
                    </Link>
                  </>
                )}
                <button onClick={handleSignOut} className="flex w-full items-center gap-3 text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors p-2 rounded-md">
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
              </div>
            ) : (
            !isAdmin && (
                <div className="pt-3 border-t border-border">
                  <Link href="/login" className="flex w-full items-center justify-center rounded-full bg-primary py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors" onClick={() => setMenuOpen(false)}>
                    Sign In
                  </Link>
                </div>
              )
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
