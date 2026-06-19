'use client'

import Link from 'next/link'
import Image from 'next/image'
import { memo, useState } from 'react'
import { motion } from 'framer-motion'
import { ShoppingCart, Check, Heart } from 'lucide-react'
import { StockBadge } from './StockBadge'
import { ReviewBadge } from './ReviewBadge'
import { FlyToCart } from '@/components/ui/FlyToCart'
import { formatPrice } from '@/lib/utils'
import { useWishlistContext } from '@/context/WishlistContext'
import type { Product } from '@/types'

interface ProductCardProps {
  product: Product
  priority?: boolean
  ratingStats?: { averageRating: number; totalReviews: number }
}

export const ProductCard = memo(function ProductCard({ product, priority, ratingStats }: ProductCardProps) {
  const [imageError, setImageError] = useState(false)
  const [added, setAdded] = useState(false)
  const stockCount = product.stock_count
  const isOutOfStock = stockCount <= 0
  const { wishlistItems, addToWishlist, removeFromWishlist } = useWishlistContext()
  
  const isInWishlist = wishlistItems.some((item) => item.product_id === product.id)

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (isInWishlist) {
      removeFromWishlist(product.id)
    } else {
      addToWishlist(product.id)
    }
  }

  const handleAddComplete = () => {
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-20px" }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="group relative flex flex-col overflow-hidden rounded-[20px] bg-card text-card-foreground shadow-sm ring-1 ring-border transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:ring-primary/20"
    >
      <div className="relative aspect-square overflow-hidden bg-muted">
        <Link href={`/products/${product.id}`} className="absolute inset-0 z-0">
          {product.image_url && !imageError ? (
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              priority={priority}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              onError={() => setImageError(true)}
            />
          ) : (
             <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                <svg className="h-16 w-16 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
             </div>
          )}
        </Link>
        {/* Top left badges */}
        <div className="absolute left-3 top-3 z-10 flex flex-col gap-2">
          <StockBadge stockCount={stockCount} />
        </div>
        {/* Top right wishlist */}
        <div className="absolute right-3 top-3 z-10">
          <button 
            onClick={handleWishlistToggle}
            aria-label={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
            className={`flex h-8 w-8 items-center justify-center rounded-full backdrop-blur-md transition-all sm:opacity-100 ${
              isInWishlist 
                ? 'bg-background text-destructive shadow-sm' 
                : 'bg-background/50 text-foreground-muted hover:bg-background hover:text-destructive opacity-0 group-hover:opacity-100'
            }`}
          >
            <Heart className={`h-4 w-4 ${isInWishlist ? 'fill-current' : ''}`} />
          </button>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="mb-3 flex items-center justify-between">
          <div className="inline-flex items-center rounded-full bg-secondary px-2.5 py-0.5 text-[11px] font-medium text-foreground-secondary">
            {product.category?.name ?? 'Uncategorized'}
          </div>
          <p className="tabular-text font-bold text-foreground">
            {formatPrice(product.price)}
          </p>
        </div>
        
        <Link href={`/products/${product.id}`} className="z-10">
          <h3 className="line-clamp-2 text-[15px] font-medium leading-snug text-foreground transition-colors group-hover:text-primary">
            {product.name}
          </h3>
        </Link>
        
        <div className="mt-2 mb-4">
          <ReviewBadge
            productId={product.id}
            rating={ratingStats?.averageRating}
            reviewCount={ratingStats?.totalReviews}
          />
        </div>
        
        <div className="mt-auto pt-2">
          <FlyToCart
            product={{ id: product.id, name: product.name, image_url: product.image_url, price: product.price }}
            isOutOfStock={isOutOfStock || added}
            onAdd={handleAddComplete}
            className="w-full z-10 relative"
          >
            <button
              disabled={isOutOfStock || added}
              className={`flex w-full items-center justify-center gap-2 rounded-full px-4 py-2.5 text-[13px] font-medium transition-all duration-300 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 ${
                added
                  ? 'bg-success text-white shadow-md'
                  : 'bg-primary text-primary-foreground shadow-sm hover:shadow-md hover:bg-primary-hover'
              }`}
            >
              {added ? (
                <>
                  <Check className="h-4 w-4" />
                  Added!
                </>
              ) : (
                <>
                  <ShoppingCart className="h-4 w-4" />
                  {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
                </>
              )}
            </button>
          </FlyToCart>
        </div>
      </div>
    </motion.div>
  )
})
