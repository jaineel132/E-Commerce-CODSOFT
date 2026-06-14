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
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-zinc-900 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
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

      <button className="flex w-full items-center justify-center gap-2 rounded-lg border border-zinc-300 bg-white px-6 py-3 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800">
        <Heart className="h-5 w-5" />
        Add to Wishlist
      </button>
    </div>
  )
}
