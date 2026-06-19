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
    <div className="animate-slide-in-right flex gap-6 py-6 border-b border-border last:border-0 group">
      <Link href={`/products/${product.id}`} className="relative h-32 w-32 shrink-0 overflow-hidden rounded-[16px] bg-muted ring-1 ring-inset ring-border/50">
        {product.image_url && !imageError ? (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            sizes="128px"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
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
        <div className="flex justify-between items-start">
          <div>
            <Link
              href={`/products/${product.id}`}
              className="text-[16px] font-medium text-foreground hover:text-primary transition-colors"
            >
              {product.name}
            </Link>
            <p className="mt-1 text-[14px] text-foreground-muted tabular-nums">
              {formatPrice(product.price)} each
            </p>
          </div>
          <button
            onClick={handleRemove}
            className="text-foreground-muted transition-colors hover:text-destructive p-2 -mr-2 rounded-full hover:bg-destructive/10"
            aria-label="Remove item"
          >
            <Trash2 className="h-5 w-5" />
          </button>
        </div>

        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-1 bg-secondary rounded-full p-1 ring-1 ring-inset ring-border/50">
            <button
              onClick={() => handleUpdateQuantity(item.quantity - 1)}
              disabled={item.quantity <= 1 || updating}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-background text-foreground transition-all hover:bg-card hover:shadow-sm active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="w-10 text-center text-[14px] font-medium tabular-nums">
              {updating ? '...' : item.quantity}
            </span>
            <button
              onClick={() => handleUpdateQuantity(item.quantity + 1)}
              disabled={item.quantity >= maxStock || updating}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-background text-foreground transition-all hover:bg-card hover:shadow-sm active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>

          <p className="text-[18px] font-semibold text-foreground tabular-nums">
            {formatPrice(product.price * item.quantity)}
          </p>
        </div>
      </div>
    </div>
  )
})
