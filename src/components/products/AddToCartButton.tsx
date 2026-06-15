'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ShoppingCart, Heart, Check } from 'lucide-react'
import { useCartContext } from '@/context/CartContext'
import { useWishlistContext } from '@/context/WishlistContext'

interface AddToCartButtonProps {
  productId: string
  isOutOfStock: boolean
}

export function AddToCartButton({ productId, isOutOfStock }: AddToCartButtonProps) {
  const [added, setAdded] = useState(false)
  const [wishlistLoading, setWishlistLoading] = useState(false)
  const { addToCart } = useCartContext()
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlistContext()

  const inWishlist = isInWishlist(productId)

  const handleAddToCart = async () => {
    if (isOutOfStock || added) return
    const success = await addToCart(productId)
    if (success) {
      setAdded(true)
      setTimeout(() => setAdded(false), 2000)
    }
  }

  const handleWishlistToggle = async () => {
    setWishlistLoading(true)
    if (inWishlist) {
      await removeFromWishlist(productId)
    } else {
      await addToWishlist(productId)
    }
    setWishlistLoading(false)
  }

  return (
    <div className="flex flex-col gap-3">
      <motion.button
        onClick={handleAddToCart}
        disabled={isOutOfStock || added}
        whileTap={{ scale: 0.97 }}
        className={`flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
          added
            ? 'bg-primary text-primary-foreground'
            : 'bg-primary text-primary-foreground hover:bg-primary/90'
        }`}
      >
        {added ? (
          <>
            <Check className="h-5 w-5" />
            Added to Cart!
          </>
        ) : (
          <>
            <ShoppingCart className="h-5 w-5" />
            {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
          </>
        )}
      </motion.button>

      <motion.button
        onClick={handleWishlistToggle}
        disabled={wishlistLoading}
        whileTap={{ scale: 0.97 }}
        className={`flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-card px-6 py-3.5 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
          inWishlist
            ? 'text-red-500 hover:bg-red-50 dark:hover:bg-red-950'
            : 'text-card-foreground hover:bg-muted'
        }`}
      >
        <Heart className={`h-5 w-5 ${inWishlist ? 'fill-current' : ''}`} />
        {inWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
      </motion.button>
    </div>
  )
}
