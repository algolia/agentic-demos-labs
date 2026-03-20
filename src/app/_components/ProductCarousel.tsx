'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useRef } from 'react'
import { useHits } from 'react-instantsearch'

import { ecommerceConfig } from '@/app/config'
import { Hit } from '@/components/hit/Hit'

import type { BaseHit, Hit as AlgoliaHit } from 'instantsearch.js'

export const ProductCarousel = () => {
  const { items } = useHits<AlgoliaHit<BaseHit>>()
  const scrollRef = useRef<HTMLDivElement>(null)

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return
    const scrollAmount = 320
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    })
  }

  if (!items.length) return null

  return (
    <div className="relative">
      {/* Navigation Buttons */}
      <button
        onClick={() => scroll('left')}
        className="bg-background absolute top-1/2 -left-4 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full shadow-lg transition-all hover:scale-110 hover:shadow-xl"
        aria-label="Previous products">
        <ChevronLeft className="text-foreground h-5 w-5" />
      </button>
      <button
        onClick={() => scroll('right')}
        className="bg-background absolute top-1/2 -right-4 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full shadow-lg transition-all hover:scale-110 hover:shadow-xl"
        aria-label="Next products">
        <ChevronRight className="text-foreground h-5 w-5" />
      </button>

      {/* Right fade overlay */}
      <div className="pointer-events-none absolute top-0 right-0 bottom-4 z-5 w-24 bg-linear-to-l from-white to-transparent" />

      {/* Carousel */}
      <div
        ref={scrollRef}
        className="scrollbar-hide flex gap-6 overflow-x-auto scroll-smooth pb-4"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        {items.map((hit) => (
          <div key={hit.objectID} className="w-72 shrink-0">
            <Hit
              variant="card"
              hit={hit}
              template={ecommerceConfig.algolia.hitTemplate}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
