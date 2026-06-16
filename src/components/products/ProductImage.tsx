'use client'

import { useState } from 'react'
import Image from 'next/image'

interface ProductImageProps {
  src: string
  alt: string
  priority?: boolean
  sizes?: string
  className?: string
}

export function ProductImage({ src, alt, priority, sizes, className }: ProductImageProps) {
  const [error, setError] = useState(false)

  if (error) {
    return (
      <div className="flex h-full w-full items-center justify-center text-muted-foreground">
        <svg className="h-24 w-24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
    )
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes || "(max-width: 1024px) 100vw, 50vw"}
      className={`object-cover ${className || ''}`}
      priority={priority}
      onError={() => setError(true)}
    />
  )
}
