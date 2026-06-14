import Link from 'next/link'
import { CheckCircle } from 'lucide-react'

export const metadata = {
  title: 'Order Confirmed | E-Commerce Store',
}

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const sessionId = typeof searchParams.session_id === 'string' ? searchParams.session_id : null

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-md text-center">
        <div className="mb-6 flex justify-center">
          <div className="rounded-full bg-green-100 p-4 dark:bg-green-900/30">
            <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-400" />
          </div>
        </div>

        <h1 className="mb-2 text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          Order Confirmed!
        </h1>

        <p className="mb-2 text-sm text-zinc-500 dark:text-zinc-400">
          Thank you for your purchase. Your order has been placed successfully.
        </p>

        {sessionId && (
          <p className="mb-8 text-xs text-zinc-400">
            Session ID: {sessionId.slice(0, 32)}...
          </p>
        )}

        <div className="rounded-lg border bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="mb-4 text-sm text-zinc-600 dark:text-zinc-400">
            You will receive an email confirmation shortly. Your order is being processed and you can track its status below.
          </p>

          <div className="flex flex-col gap-3">
            <Link
              href="/orders"
              className="flex w-full items-center justify-center rounded-lg bg-zinc-900 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
            >
              View My Orders
            </Link>
            <Link
              href="/products"
              className="flex w-full items-center justify-center rounded-lg border border-zinc-300 bg-white px-4 py-3 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
