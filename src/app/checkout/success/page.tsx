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
          <div className="rounded-full bg-primary/10 p-4">
            <CheckCircle className="h-12 w-12 text-primary" />
          </div>
        </div>

        <h1 className="mb-2 text-2xl font-bold text-foreground">
          Order Confirmed!
        </h1>

        <p className="mb-2 text-sm text-muted-foreground">
          Thank you for your purchase. Your order has been placed successfully.
        </p>

        {sessionId && (
          <p className="mb-8 text-xs text-muted-foreground">
            Session ID: {sessionId.slice(0, 32)}...
          </p>
        )}

        <div className="rounded-xl border bg-card p-6 shadow-sm border-border">
          <p className="mb-4 text-sm text-muted-foreground">
            You will receive an email confirmation shortly. Your order is being processed and you can track its status below.
          </p>

          <div className="flex flex-col gap-3">
            <Link
              href="/orders"
              className="flex w-full items-center justify-center rounded-lg bg-primary px-4 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              View My Orders
            </Link>
            <Link
              href="/products"
              className="flex w-full items-center justify-center rounded-lg border border-border bg-card px-4 py-3 text-sm font-medium text-card-foreground transition-colors hover:bg-muted"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
