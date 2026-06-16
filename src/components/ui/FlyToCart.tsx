'use client'

import { useRef, useCallback } from 'react'
import { useCartContext } from '@/context/CartContext'

let cartIconRect: DOMRect | null = null

export function getCartIconRect(): DOMRect | null {
  const el = document.getElementById('cart-icon-desktop')
  if (el) {
    cartIconRect = el.getBoundingClientRect()
  }
  return cartIconRect
}

interface FlyToCartProps {
  children: React.ReactNode
  product: {
    id: string
    name: string
    image_url?: string | null
    price: number
  }
  isOutOfStock: boolean
  onAdd?: () => void
  className?: string
}

export function FlyToCart({ children, product, isOutOfStock, onAdd, className }: FlyToCartProps) {
  const ref = useRef<HTMLDivElement>(null)
  const { addToCart } = useCartContext()

  const handleFlyAndAdd = useCallback(async (e: React.MouseEvent) => {
    if (isOutOfStock) return

    e.preventDefault()
    e.stopPropagation()

    const el = ref.current
    const cartRect = getCartIconRect()
    if (!el || !cartRect) {
      const success = await addToCart(product.id)
      if (success) onAdd?.()
      return
    }

    const startRect = el.getBoundingClientRect()
    const startX = startRect.left + startRect.width / 2
    const startY = startRect.top + startRect.height / 2
    const endX = cartRect.left + cartRect.width / 2
    const endY = cartRect.top + cartRect.height / 2

    const flyEl = document.createElement('div')
    flyEl.className = 'pointer-events-none fixed z-[9999]'
    flyEl.style.cssText = `
      left: ${startX}px; top: ${startY}px;
      width: 60px; height: 60px;
      transform: translate(-50%, -50%);
    `
    flyEl.innerHTML = `
      <div style="width:100%;height:100%;border-radius:12px;overflow:hidden;box-shadow:0 8px 30px rgba(0,0,0,0.25);background:#f5f5f4;border:2px solid #fff;">
        ${product.image_url
          ? `<img src="${product.image_url}" style="width:100%;height:100%;object-fit:cover;" />`
          : `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:24px;">📦</div>`
        }
      </div>
    `
    document.body.appendChild(flyEl)

    await new Promise<void>((resolve) => {
      flyEl.animate([
        { left: `${startX}px`, top: `${startY}px`, opacity: 1, offset: 0 },
        { left: `${(startX + endX) / 2}px`, top: `${Math.min(startY, endY) - 60}px`, opacity: 1, offset: 0.5 },
        { left: `${endX}px`, top: `${endY}px`, opacity: 0.6, offset: 1 },
      ], {
        duration: 600,
        easing: 'cubic-bezier(0.2, 0.6, 0.2, 1)',
      }).onfinish = () => {
        flyEl.remove()
        resolve()
      }
    })

    const success = await addToCart(product.id)
    if (success) onAdd?.()
  }, [addToCart, product.id, product.image_url, isOutOfStock, onAdd])

  return (
    <div ref={ref} className={className} onClick={handleFlyAndAdd}>
      {children}
    </div>
  )
}
