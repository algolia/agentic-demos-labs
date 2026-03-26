'use client'

import { Plus } from 'lucide-react'
import { useState } from 'react'

import { usePriceRangeSlider } from '@/hooks/usePriceRangeSlider'
import { cn } from '@/lib/utils'

interface PriceRangeFacetProps {
  title?: string
  attribute?: string
  defaultOpen?: boolean
}

export const PriceRangeFacet = ({
  title = 'Price',
  attribute = 'price',
  defaultOpen = true,
}: PriceRangeFacetProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpen)
  const {
    rangeMin,
    rangeMax,
    currentMin,
    currentMax,
    minPercent,
    maxPercent,
    canRefine,
    handleMinChange,
    handleMaxChange,
    handleCommit,
  } = usePriceRangeSlider({ attribute })

  if (!canRefine) return null

  return (
    <div className="border-border border-b py-4">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full cursor-pointer items-center justify-between text-left">
        <span className="text-foreground font-medium capitalize">{title}</span>
        <Plus
          className={cn(
            'text-muted-foreground h-4 w-4 transition-transform duration-500',
            isOpen && 'rotate-225',
          )}
        />
      </button>
      <div
        className={cn(
          'grid transition-all duration-200',
          isOpen
            ? 'mt-3 grid-rows-[1fr] opacity-100'
            : 'grid-rows-[0fr] opacity-0',
        )}>
        <div className="overflow-visible">
          {/* Price labels */}
          <div className="mb-4 flex items-center justify-between text-sm">
            <span className="text-foreground">{currentMin.toLocaleString(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })}</span>
            <span className="text-foreground">{currentMax.toLocaleString(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })}</span>
          </div>

          {/* Dual range slider - h-5 to contain 16px thumbs */}
          <div className="relative flex h-5 items-center">
            {/* Background track */}
            <div className="bg-muted absolute inset-x-0 h-1.5 rounded-full" />

            {/* Filled track */}
            <div
              className="bg-accent/60 absolute h-1.5 rounded-full"
              style={{
                left: `${minPercent}%`,
                width: `${maxPercent - minPercent}%`,
              }}
            />

            {/* Min slider */}
            <input
              type="range"
              min={rangeMin}
              max={rangeMax}
              value={currentMin}
              onChange={handleMinChange}
              onMouseUp={handleCommit}
              onTouchEnd={handleCommit}
              className="[&::-webkit-slider-thumb]:bg-accent pointer-events-none absolute inset-0 h-full w-full cursor-pointer appearance-none bg-transparent [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-md"
            />

            {/* Max slider */}
            <input
              type="range"
              min={rangeMin}
              max={rangeMax}
              value={currentMax}
              onChange={handleMaxChange}
              onMouseUp={handleCommit}
              onTouchEnd={handleCommit}
              className="[&::-webkit-slider-thumb]:bg-accent pointer-events-none absolute inset-0 h-full w-full cursor-pointer appearance-none bg-transparent [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-md"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
