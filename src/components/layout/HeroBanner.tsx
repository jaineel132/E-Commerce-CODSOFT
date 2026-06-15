'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

export function HeroBanner() {
  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden bg-primary text-primary-foreground"
    >
      <motion.div
        animate={{ x: [0, 30, -20, 0], y: [0, -20, 15, 0] }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -left-32 -top-32 h-[500px] w-[500px] rounded-full opacity-15"
        style={{ background: 'linear-gradient(135deg, var(--primary), var(--accent))' }}
      />

      <div className="relative mx-auto max-w-7xl px-4 py-32 sm:px-6 sm:py-40 lg:px-8">
        <div className="max-w-3xl">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="font-serif text-5xl font-bold tracking-tighter md:text-6xl lg:text-7xl"
          >
            Discover Something{' '}
            <span className="text-accent">Amazing</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-6 text-lg leading-8 text-primary-foreground/80"
          >
            Shop the latest trends across Electronics, Clothing, Books, and Home
            &amp; Kitchen. Quality products at unbeatable prices.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mt-10 flex items-center gap-x-6"
          >
            <Link
              href="/products"
              className="rounded-lg bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground shadow-sm transition-colors hover:bg-accent/90"
            >
              Shop Now
            </Link>
            <Link
              href="/products"
              className="text-sm font-semibold leading-6 text-primary-foreground/70 hover:text-primary-foreground"
            >
              Browse Catalog →
            </Link>
          </motion.div>
        </div>
      </div>
    </motion.section>
  )
}
