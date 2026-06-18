'use client'

import { useState } from 'react'
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
      <button
        onClick={handleAddToCart}
        disabled={isOutOfStock || added}
        className={`flex w-full items-center justify-center gap-2 rounded-full px-8 py-4 text-[15px] font-medium transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-50 ${
          added
            ? 'bg-success text-success-foreground'
            : 'bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98] shadow-sm hover:shadow-primary/25 hover:shadow-lg'
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
      </button>

      <button
        onClick={handleWishlistToggle}
        disabled={wishlistLoading}
        className={`flex w-full items-center justify-center gap-2 rounded-full bg-transparent px-8 py-4 text-[15px] font-medium transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-50 ${
          inWishlist
            ? 'text-red-500 hover:bg-red-500/10'
            : 'text-foreground hover:bg-secondary'
        }`}
      >
        <Heart className={`h-5 w-5 transition-transform ${inWishlist ? 'fill-current scale-110' : 'scale-100'}`} />
        {inWishlist ? 'Saved to Wishlist' : 'Add to Wishlist'}
      </button>
    </div>
  )
}
