'use client'

import { ArrowRight } from 'lucide-react'
import Link from 'next/link'

import { ProductCard } from '@/features/aiAssistant/components/messages/ProductCard'
import type { DisplayGroup } from '@/features/aiAssistant/types'

interface ProductGroupProps {
  group: DisplayGroup
  totalResults?: number
}

const MAX_VISIBLE_PRODUCTS = 4

/**
 * Group of products with title, description, and horizontal carousel.
 * Shows "View all" link when there are more products available.
 */
export const ProductGroup = ({ group, totalResults }: ProductGroupProps) => {
  const hasMoreProducts =
    totalResults && totalResults > MAX_VISIBLE_PRODUCTS
      ? totalResults
      : group.products.length > MAX_VISIBLE_PRODUCTS
        ? group.products.length
        : null

  return (
    <div className="space-y-3">
      {/* Group header */}
      <div className="flex items-baseline justify-between gap-4">
        <div>
          <h4 className="text-sm font-semibold">{group.title}</h4>
          {group.why && (
            <p className="text-muted-foreground text-xs">{group.why}</p>
          )}
        </div>
        {hasMoreProducts && (
          <Link
            href="/search"
            className="text-primary hover:text-primary/80 flex shrink-0 items-center gap-1 text-xs font-medium transition-colors">
            View all ({hasMoreProducts})
            <ArrowRight className="h-3 w-3" />
          </Link>
        )}
      </div>

      {/* Horizontal scroll container */}
      <div className="-mx-4 px-4">
        <div className="scrollbar-hide flex gap-3 overflow-x-auto pb-2">
          {group.products.slice(0, MAX_VISIBLE_PRODUCTS).map((product) => (
            <ProductCard key={product.objectID} product={product} />
          ))}
        </div>
      </div>
    </div>
  )
}
