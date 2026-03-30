'use client'

/**
 * ChatProductCard — Compact product card rendered inside the Chat widget's carousels.
 *
 * When the Agent Studio agent calls the built-in `search` tool, the Chat widget
 * automatically fetches products from your Algolia index and displays them in
 * horizontal carousels. This component controls how each individual product looks
 * inside those carousels.
 *
 * You pass it to the Chat widget via the `itemComponent` prop:
 *
 *   <Chat agentId="..." itemComponent={ChatProductCard} />
 *
 * The widget provides each product as a standard Algolia hit record. We use the
 * same `getHitValues` utility that the main product grid uses, so product data
 * extraction (name, image, price, brand) stays consistent across the app.
 */

import Link from 'next/link'
import { ShoppingCart } from 'lucide-react'

import { ecommerceConfig } from '@/app/config'
import { useCart } from '@/hooks/useCart'
import { getHitValues } from '@/utilities/getHitValues'

/**
 * Props provided by the Chat widget for each product in a carousel.
 * The `item` is a standard Algolia record with at least an `objectID`.
 */
interface ChatProductCardProps {
  item: Record<string, unknown> & { objectID: string }
}

export const ChatProductCard = ({ item }: ChatProductCardProps) => {
  const { addItem } = useCart()

  /**
   * `getHitValues` extracts the product fields (name, image, price, brand) from
   * the raw Algolia record using the attribute mappings defined in your config.
   * This keeps the field mapping centralized — if your index schema changes, you
   * only update config.ts.
   */
  const values = getHitValues(item, ecommerceConfig.algolia.hitTemplate)

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    addItem({
      objectID: item.objectID,
      ...values,
    })
  }

  return (
    <Link
      href={`/product/${item.objectID}`}
      className="group flex w-[160px] shrink-0 flex-col overflow-hidden rounded-card border border-border bg-card transition-shadow hover:shadow-md">
      {/* Product image */}
      <div className="flex h-[140px] items-center justify-center bg-muted/30 p-3">
        {values.image ? (
          <img
            src={values.image}
            alt={values.name}
            className="h-full w-full object-contain"
          />
        ) : (
          <div className="text-xs text-muted-foreground">No image</div>
        )}
      </div>

      {/* Product details */}
      <div className="flex flex-1 flex-col gap-0.5 p-2.5">
        {values.brand && (
          <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            {values.brand}
          </p>
        )}
        <h4 className="text-xs font-semibold leading-tight text-foreground line-clamp-2">
          {values.name}
        </h4>
        <div className="mt-auto flex items-center justify-between pt-1.5">
          {values.price !== null && (
            <span className="text-sm font-bold text-foreground">
              &euro;{values.price.toFixed(2)}
            </span>
          )}
          <button
            type="button"
            onClick={handleAddToCart}
            className="ml-auto flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground transition-transform hover:scale-105"
            aria-label="Add to cart">
            <ShoppingCart className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </Link>
  )
}
