'use client'

import { useState } from 'react'
import { ShoppingCart, Heart, Check } from 'lucide-react'
import { useCartContext } from '@/context/CartContext'

interface AddToCartButtonProps {
  productId: string
  isOutOfStock: boolean
}

export function AddToCartButton({ productId, isOutOfStock }: AddToCartButtonProps) {
  const [added, setAdded] = useState(false)
  const { addToCart } = useCartContext()

  const handleAddToCart = async () => {
    if (isOutOfStock || added) return
    const success = await addToCart(productId)
    if (success) {
      setAdded(true)
      setTimeout(() => setAdded(false), 2000)
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <button
        onClick={handleAddToCart}
        disabled={isOutOfStock || added}
        className={`flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
          added
            ? 'bg-green-600 text-white'
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
      </button>

      <button className="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-card px-6 py-3.5 text-sm font-medium text-card-foreground transition-colors hover:bg-muted">
        <Heart className="h-5 w-5" />
        Add to Wishlist
      </button>
    </div>
  )
}
