'use client'

import { ProductCard } from './ProductCard'
import type { Product } from '@/types'

interface SimilarProductsProps {
  products: Product[]
}

export function SimilarProducts({ products }: SimilarProductsProps) {
  if (products.length === 0) return null

  return (
    <section className="mt-16 border-t border-border pt-10">
      <h2 className="mb-6 font-serif text-xl font-bold text-foreground">
        You might also like
      </h2>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  )
}