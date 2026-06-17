'use client'

import { memo } from 'react'
import { ThemeProvider } from 'next-themes'
import { Toaster } from 'sonner'
import { AuthProvider } from '@/context/AuthContext'
import { CartProvider } from '@/context/CartContext'
import { WishlistProvider } from '@/context/WishlistContext'
import type { User } from '@supabase/supabase-js'

interface ProvidersProps {
  children: React.ReactNode
  user: User | null
}

export const Providers = memo(function Providers({ children, user }: ProvidersProps) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <AuthProvider initialUser={user}>
        <CartProvider>
          <WishlistProvider>
            {children}
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
      <Toaster richColors position="top-right" />
    </ThemeProvider>
  )
})