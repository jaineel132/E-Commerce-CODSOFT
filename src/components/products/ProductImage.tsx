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
  const [isZoomed, setIsZoomed] = useState(false)

  if (error) {
    return (
      <div className={`flex h-full w-full items-center justify-center bg-card text-foreground-muted ring-1 ring-inset ring-border/50 ${className || ''}`}>
        <svg className="h-24 w-24 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
    )
  }

  return (
    <div 
      className={`relative w-full h-full overflow-hidden ${className || ''}`}
      onMouseEnter={() => setIsZoomed(true)}
      onMouseLeave={() => setIsZoomed(false)}
    >
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes || "(max-width: 1024px) 100vw, 50vw"}
        className={`object-cover transition-transform duration-700 ease-out ${isZoomed ? 'scale-110' : 'scale-100'}`}
        priority={priority}
        onError={() => setError(true)}
      />
    </div>
  )
}
