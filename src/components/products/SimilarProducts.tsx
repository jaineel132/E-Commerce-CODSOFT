import { ProductCard } from './ProductCard'
import type { Product } from '@/types'

interface SimilarProductsProps {
  products: Product[]
}

export function SimilarProducts({ products }: SimilarProductsProps) {
  if (products.length === 0) return null

  return (
    <section className="mt-20 border-t border-border pt-16">
      <div className="mb-8 flex items-center justify-between">
        <h2 className="display-sm text-foreground">
          You might also like
        </h2>
      </div>
      
      <div className="flex overflow-x-auto pb-6 -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 snap-x snap-mandatory hide-scrollbar">
        {products.map((product) => (
          <div key={product.id} className="min-w-[280px] sm:min-w-0 snap-start">
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </section>
  )
}