'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

import { toast } from 'sonner'

export default function CheckoutSuccessPage() {
  const [mounted, setMounted] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)

  useEffect(() => {
    setMounted(true)
    const params = new URLSearchParams(window.location.search)
    setSessionId(params.get('session_id'))
    toast.success('Order placed successfully!')
  }, [])

  const confettiPieces = mounted ? Array.from({ length: 40 }, (_, i) => {
    const colors = ['#2D5A4A', '#D97757', '#E89478', '#6FA98C', '#D9A05B', '#C0564A']
    return {
      id: i,
      color: colors[i % colors.length],
      left: (i * 2.5) % 100,
      delay: (i * 0.13) % 2,
      duration: 2 + (i % 4) * 0.5,
      size: 6 + (i % 6),
    }
  }) : []

  return (
    <>
      <style>{`
        @keyframes confetti-fall {
          0% { transform: translateY(-10vh) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
        .confetti-piece {
          position: fixed;
          top: 0;
          z-index: 50;
          pointer-events: none;
          animation: confetti-fall linear forwards;
        }
      `}</style>

      {confettiPieces.map((piece) => (
        <div
          key={piece.id}
          className="confetti-piece"
          style={{
            left: `${piece.left}%`,
            width: piece.size,
            height: piece.size,
            backgroundColor: piece.color,
            animationDelay: `${piece.delay}s`,
            animationDuration: `${piece.duration}s`,
          }}
        />
      ))}

      <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <div className="animate-fade-in-up mx-auto max-w-md text-center">
          <div className="mb-8 flex justify-center">
            <svg
              className="h-20 w-20 text-success checkmark-svg"
              viewBox="0 0 52 52"
            >
              <circle
                cx="26"
                cy="26"
                r="25"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="checkmark-circle"
              />
              <path
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M14.1 27.2l7.1 7.2 16.7-16.8"
                className="checkmark-path"
              />
            </svg>
          </div>

          <h1 className="mb-3 display-sm text-foreground">
            Order Confirmed!
          </h1>

          <p className="mb-4 text-[15px] text-foreground-muted leading-relaxed">
            Thank you for your purchase. Your order has been placed successfully.
          </p>

          {sessionId && (
            <p className="mb-10 text-[13px] font-mono text-foreground-muted bg-secondary py-1 px-3 rounded-full inline-block">
              ID: {sessionId.slice(0, 32)}...
            </p>
          )}

          <div className="rounded-[24px] border border-border bg-card p-8 shadow-sm ring-1 ring-inset ring-border/50">
            <p className="mb-8 text-[14px] text-foreground-muted leading-relaxed">
              You will receive an email confirmation shortly. Your order is being processed and you can track its status below.
            </p>

            <div className="flex flex-col gap-4">
              <Link
                href="/orders"
                className="flex w-full items-center justify-center rounded-full bg-primary py-3.5 text-[15px] font-medium text-primary-foreground transition-all duration-300 hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98] shadow-sm hover:shadow-primary/25"
              >
                View My Orders
              </Link>
              <Link
                href="/products"
                className="flex w-full items-center justify-center rounded-full bg-secondary py-3.5 text-[15px] font-medium text-foreground transition-all duration-300 hover:bg-muted hover:scale-[1.02] active:scale-[0.98]"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
