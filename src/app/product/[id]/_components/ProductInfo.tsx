'use client'

import { Heart } from 'lucide-react'
import { useState } from 'react'

import { StarRating } from '@/components/ui/StarRating'

interface ProductInfoProps {
  name: string
  brand?: string
  rating?: number
  reviewCount?: number
}

export const ProductInfo = ({
  name,
  brand,
  rating = 4.8,
  reviewCount = 342,
}: ProductInfoProps) => {
  const [isWishlisted, setIsWishlisted] = useState(false)

  return (
    <>
      {brand && (
        <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
          {brand}
        </p>
      )}

      <div className="flex items-start justify-between gap-4">
        <h1 className="text-foreground line-clamp-2 text-2xl font-bold">
          {name}
        </h1>
        <button
          onClick={() => setIsWishlisted(!isWishlisted)}
          className="hover:bg-muted shrink-0 rounded-full p-2 transition-colors"
          aria-label={
            isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'
          }>
          <Heart
            className={`h-5 w-5 ${
              isWishlisted
                ? 'fill-red-500 text-red-500'
                : 'text-muted-foreground'
            }`}
          />
        </button>
      </div>

      <StarRating rating={rating} count={reviewCount} size="md" />
    </>
  )
}
