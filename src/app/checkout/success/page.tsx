'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
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

      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-md text-center"
        >
          <div className="mb-6 flex justify-center">
            <motion.svg
              className="h-16 w-16 text-primary"
              viewBox="0 0 52 52"
            >
              <motion.circle
                cx="26"
                cy="26"
                r="25"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              />
              <motion.path
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M14.1 27.2l7.1 7.2 16.7-16.8"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.4, delay: 0.6 }}
              />
            </motion.svg>
          </div>

          <h1 className="mb-2 font-serif text-2xl font-bold text-foreground">
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

          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
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
                className="flex w-full items-center justify-center rounded-lg border border-border bg-muted px-4 py-3 text-sm font-medium text-card-foreground transition-colors hover:bg-muted/80"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  )
}
