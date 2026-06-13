import Link from 'next/link'

export function Footer() {
  return (
    <footer className="border-t bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              Store
            </Link>
            <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">
              Your one-stop shop for everything you need.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Shop</h3>
            <ul className="mt-4 space-y-3">
              <li>
                <Link href="/products" className="text-sm text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100">
                  All Products
                </Link>
              </li>
              <li>
                <Link href="/products?category=Electronics" className="text-sm text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100">
                  Electronics
                </Link>
              </li>
              <li>
                <Link href="/products?category=Clothing" className="text-sm text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100">
                  Clothing
                </Link>
              </li>
              <li>
                <Link href="/products?category=Books" className="text-sm text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100">
                  Books
                </Link>
              </li>
              <li>
                <Link href="/products?category=Home+%26+Kitchen" className="text-sm text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100">
                  Home &amp; Kitchen
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Account</h3>
            <ul className="mt-4 space-y-3">
              <li>
                <Link href="/orders" className="text-sm text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100">
                  My Orders
                </Link>
              </li>
              <li>
                <Link href="/wishlist" className="text-sm text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100">
                  Wishlist
                </Link>
              </li>
              <li>
                <Link href="/cart" className="text-sm text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100">
                  Cart
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Support</h3>
            <ul className="mt-4 space-y-3">
              <li>
                <span className="text-sm text-zinc-500 dark:text-zinc-400">
                  help@store.com
                </span>
              </li>
              <li>
                <span className="text-sm text-zinc-500 dark:text-zinc-400">
                  1-800-STORE
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t pt-8 dark:border-zinc-800">
          <p className="text-center text-xs text-zinc-400">
            &copy; {new Date().getFullYear()} Store. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
