'use client'

import { useState } from 'react'

import { cn } from '@/lib/utils'

interface SizeSelectorProps {
  sizes?: string[]
  unavailableSizes?: string[]
  defaultSize?: string
  onChange?: (size: string) => void
}

export const SizeSelector = ({
  sizes,
  unavailableSizes = [],
  defaultSize,
  onChange,
}: SizeSelectorProps) => {
  const [selectedSize, setSelectedSize] = useState<string | null>(
    defaultSize ?? null,
  )

  // Don't render if no sizes available
  if (!sizes || sizes.length === 0) return null

  const handleSizeSelect = (size: string) => {
    if (unavailableSizes.includes(size)) return
    setSelectedSize(size)
    onChange?.(size)
  }

  return (
    <div className="space-y-3">
      <label className="text-foreground text-sm font-medium">Select Size</label>
      <div className="flex flex-wrap gap-2">
        {sizes.map((size) => {
          const isUnavailable = unavailableSizes.includes(size)
          const isSelected = selectedSize === size

          return (
            <button
              key={size}
              onClick={() => handleSizeSelect(size)}
              disabled={isUnavailable}
              className={cn(
                'rounded-button flex h-11 min-w-11 items-center justify-center border-2 px-3 text-sm font-medium transition-all duration-200',
                isSelected
                  ? 'border-accent bg-background text-foreground'
                  : isUnavailable
                    ? 'border-border bg-muted text-muted-foreground/50 cursor-not-allowed'
                    : 'border-border bg-background text-foreground hover:border-foreground/30 cursor-pointer',
              )}>
              {size}
            </button>
          )
        })}
      </div>
    </div>
  )
}
