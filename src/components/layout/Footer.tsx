import Link from 'next/link'
import { CreditCard } from 'lucide-react'

export function Footer() {
  return (
    <footer className="border-t border-border bg-background-soft">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-5">
          <div className="col-span-2 md:col-span-2">
            <Link href="/" className="text-xl font-bold tracking-[0.02em] text-foreground">
              Verdant
            </Link>
            <p className="mt-4 max-w-xs text-sm text-foreground-muted leading-relaxed">
              Your one-stop shop for thoughtfully curated products — from electronics and books to home essentials.
            </p>
          </div>

          <div>
            <h3 className="text-[13px] font-semibold tracking-wider uppercase text-foreground-secondary">Shop</h3>
            <ul className="mt-4 space-y-3">
              <li>
                <Link href="/products" className="text-[14px] text-foreground-muted hover:text-foreground transition-colors">
                  All Products
                </Link>
              </li>
              <li>
                <Link href="/products?category=Electronics" className="text-[14px] text-foreground-muted hover:text-foreground transition-colors">
                  Electronics
                </Link>
              </li>
              <li>
                <Link href="/products?category=Clothing" className="text-[14px] text-foreground-muted hover:text-foreground transition-colors">
                  Clothing
                </Link>
              </li>
              <li>
                <Link href="/products?category=Books" className="text-[14px] text-foreground-muted hover:text-foreground transition-colors">
                  Books
                </Link>
              </li>
              <li>
                <Link href="/products?category=Home+%26+Kitchen" className="text-[14px] text-foreground-muted hover:text-foreground transition-colors">
                  Home &amp; Kitchen
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-[13px] font-semibold tracking-wider uppercase text-foreground-secondary">Account</h3>
            <ul className="mt-4 space-y-3">
              <li>
                <Link href="/orders" className="text-[14px] text-foreground-muted hover:text-foreground transition-colors">
                  My Orders
                </Link>
              </li>
              <li>
                <Link href="/wishlist" className="text-[14px] text-foreground-muted hover:text-foreground transition-colors">
                  Wishlist
                </Link>
              </li>
              <li>
                <Link href="/cart" className="text-[14px] text-foreground-muted hover:text-foreground transition-colors">
                  Cart
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-[13px] font-semibold tracking-wider uppercase text-foreground-secondary">Support</h3>
            <ul className="mt-4 space-y-3">
              <li>
                <span className="text-[14px] text-foreground-muted">
                  help@verdant.com
                </span>
              </li>
              <li>
                <span className="text-[14px] text-foreground-muted tabular-nums">
                  1-800-VERDANT
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between border-t border-border pt-8 sm:flex-row gap-4">
          <p className="text-[13px] text-foreground-muted">
            &copy; {new Date().getFullYear()} Verdant. All rights reserved.
          </p>
          <div className="flex items-center gap-3 text-foreground-muted">
            <CreditCard className="h-5 w-5" />
            <div className="text-[11px] font-semibold uppercase tracking-wider">Secured by Stripe</div>
          </div>
        </div>
      </div>
    </footer>
  )
}
