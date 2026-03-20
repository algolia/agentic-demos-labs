'use client'

import { useState } from 'react'

import { cn } from '@/lib/utils'

interface ProductImageGalleryProps {
  images: string[]
  productName: string
}

export const ProductImageGallery = ({
  images,
  productName,
}: ProductImageGalleryProps) => {
  const [activeIndex, setActiveIndex] = useState(0)
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set())

  // Ensure we have at least one image, use placeholder if none
  const displayImages =
    images.length > 0 ? images : ['/images/placeholder-product.png']

  const handleImageLoad = (index: number) => {
    setLoadedImages((prev) => new Set(prev).add(index))
  }

  const isMainImageLoaded = loadedImages.has(activeIndex)

  return (
    <div className="flex flex-col gap-4">
      {/* Main Image */}
      <div className="border-border bg-muted rounded-card relative aspect-square overflow-hidden border">
        {!isMainImageLoaded && (
          <div className="bg-muted absolute inset-0 animate-pulse" />
        )}
        <img
          src={displayImages[activeIndex]}
          alt={productName}
          onLoad={() => handleImageLoad(activeIndex)}
          className={cn(
            'h-full w-full object-contain p-8 transition-opacity duration-300',
            isMainImageLoaded ? 'opacity-100' : 'opacity-0',
          )}
        />
      </div>

      {/* Thumbnails */}
      {displayImages.length > 1 && (
        <div className="flex gap-3">
          {displayImages.slice(0, 12).map((image, index) => (
            <button
              key={index}
              onClick={() => setActiveIndex(index)}
              className={cn(
                'bg-muted/50 rounded-image relative aspect-square w-1/4 cursor-pointer overflow-hidden border-2 transition-all duration-200',
                activeIndex === index
                  ? 'border-accent'
                  : 'border-border hover:border-foreground/30',
              )}>
              {!loadedImages.has(index) && (
                <div className="bg-muted absolute inset-0 animate-pulse" />
              )}
              <img
                src={image}
                alt={`${productName} view ${index + 1}`}
                onLoad={() => handleImageLoad(index)}
                className={cn(
                  'h-full w-full object-contain p-2 transition-opacity duration-300',
                  loadedImages.has(index) ? 'opacity-100' : 'opacity-0',
                )}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
