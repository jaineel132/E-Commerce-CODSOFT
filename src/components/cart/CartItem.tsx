'use client'

import Image from 'next/image'
import Link from 'next/link'
import { memo, useState } from 'react'
import { Trash2, Minus, Plus } from 'lucide-react'
import { useCartContext } from '@/context/CartContext'
import { formatPrice } from '@/lib/utils'
import type { CartItemWithProduct } from '@/types'

interface CartItemProps {
  item: CartItemWithProduct
}

export const CartItem = memo(function CartItem({ item }: CartItemProps) {
  const { updateQuantity, removeFromCart } = useCartContext()
  const [imageError, setImageError] = useState(false)
  const [updating, setUpdating] = useState(false)

  const { product } = item
  const maxStock = product.stock_count

  const handleUpdateQuantity = async (newQuantity: number) => {
    if (newQuantity < 1 || newQuantity > maxStock || updating) return
    setUpdating(true)
    await updateQuantity(product.id, newQuantity)
    setUpdating(false)
  }

  const handleRemove = async () => {
    await removeFromCart(product.id)
  }

  return (
    <div className="animate-slide-in-right flex gap-4 rounded-xl border border-border bg-card p-4 text-card-foreground shadow-sm"
    >
      <Link href={`/products/${product.id}`} className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-muted">
        {product.image_url && !imageError ? (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            sizes="96px"
            className="object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
      </Link>

      <div className="flex flex-1 flex-col justify-between">
        <div>
          <Link
            href={`/products/${product.id}`}
            className="text-sm font-semibold text-card-foreground hover:text-primary transition-all duration-200"
          >
            {product.name}
          </Link>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {formatPrice(product.price)} each
          </p>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <button
              onClick={() => handleUpdateQuantity(item.quantity - 1)}
              disabled={item.quantity <= 1 || updating}
              className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-muted text-card-foreground transition-all duration-200 hover:bg-accent hover:text-accent-foreground active:scale-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Minus className="h-3 w-3" />
            </button>
            <span className="w-10 text-center text-sm font-medium">
              {updating ? '...' : item.quantity}
            </span>
            <button
              onClick={() => handleUpdateQuantity(item.quantity + 1)}
              disabled={item.quantity >= maxStock || updating}
              className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-muted text-card-foreground transition-all duration-200 hover:bg-accent hover:text-accent-foreground active:scale-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Plus className="h-3 w-3" />
            </button>
          </div>

          <div className="flex items-center gap-3">
            <p className="text-sm font-bold text-card-foreground">
              {formatPrice(product.price * item.quantity)}
            </p>
            <button
              onClick={handleRemove}
              className="text-muted-foreground transition-all duration-200 hover:text-destructive active:scale-90"
              aria-label="Remove item"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
})
