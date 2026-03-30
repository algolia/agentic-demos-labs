'use client'

import { useQuery } from '@tanstack/react-query'
import { useAtomValue, useSetAtom } from 'jotai'
import Link from 'next/link'

import { AddToCartButton } from '@/components/ui/button/AddToCartButton'
import { isAIAssistantExpandedState } from '@/features/aiAssistant/stores/aiAssistant'
import type { DisplayProduct, ProductData } from '@/features/aiAssistant/types'
import { useCart } from '@/hooks/useCart'
import { activeConfigAtom } from '@/stores/activeConfig'
import { searchClientAtom } from '@/stores/searchClient'
import { buildImageUrl } from '@/utilities/getHitValues'

interface ProductCardProps {
  product: DisplayProduct
}

/**
 * Product card for AI chat responses.
 * Fetches product data from Algolia by objectID.
 */
export const ProductCard = ({ product }: ProductCardProps) => {
  const { addItem } = useCart()
  const setIsExpanded = useSetAtom(isAIAssistantExpandedState)
  const searchClient = useAtomValue(searchClientAtom)
  const config = useAtomValue(activeConfigAtom)

  const { data: productData } = useQuery<ProductData>({
    queryKey: ['product', product.objectID],
    queryFn: async () => {
      if (!searchClient || !config) throw new Error('Not ready')

      const { indices, hitTemplate } = config.algolia
      const result = await searchClient.search<Record<string, unknown>>([
        {
          indexName: indices.productsIndex,
          params: {
            filters: `objectID:${product.objectID}`,
            hitsPerPage: 1,
          },
        },
      ])

      const hit = 'hits' in result.results[0] ? result.results[0].hits[0] : null
      if (!hit) throw new Error('Product not found')

      const imageValue = hit[hitTemplate.imageAttribute] as string | undefined
      const image = buildImageUrl(imageValue, {
        prefix: hitTemplate.imageHrefPrefix,
        suffix: hitTemplate.imageHrefSuffix,
      })

      const priceValue = hitTemplate.priceAttribute
        ? hit[hitTemplate.priceAttribute]
        : null
      const price = priceValue != null ? Number(priceValue) : null

      const brandValue = hitTemplate.brandAttribute
        ? hit[hitTemplate.brandAttribute]
        : null

      return {
        objectID: hit.objectID as string,
        name: hit[hitTemplate.nameAttribute] ? String(hit[hitTemplate.nameAttribute]) : '',
        image,
        price: price && !isNaN(price) ? price : null,
        brand: brandValue ? String(brandValue) : null,
      }
    },
    staleTime: Infinity,
    enabled: !!searchClient && !!config,
  })

  if (!productData) {
    return (
      <div className="border-border w-40 shrink-0 animate-pulse overflow-hidden rounded-lg border">
        <div className="bg-card h-40 w-full" />
        <div className="bg-muted space-y-1.5 p-3">
          <div className="bg-background/50 h-2.5 w-12 rounded" />
          <div className="bg-background/50 h-3 w-full rounded" />
          <div className="bg-background/50 h-3.5 w-14 rounded" />
        </div>
      </div>
    )
  }

  return (
    <Link
      href={`/product/${product.objectID}`}
      onClick={() => setIsExpanded(false)}
      className="border-border group block w-40 shrink-0 overflow-hidden rounded-lg border transition-shadow duration-200 hover:shadow-lg">
      {/* Image with badge - Hit card style with white bg */}
      <div className="bg-card relative h-40 w-full p-4">
        {product.why && (
          <span className="bg-primary/90 text-primary-foreground absolute top-1.5 left-1.5 z-10 max-w-[90%] truncate rounded px-1.5 py-0.5 text-[9px] font-medium uppercase">
            {product.why}
          </span>
        )}
        {productData.image ? (
          <img
            src={productData.image}
            alt={productData.name}
            className="h-full w-full object-contain transition-transform duration-200 group-hover:scale-105"
          />
        ) : (
          <div className="text-muted-foreground flex h-full items-center justify-center text-xs tracking-widest uppercase">
            No image
          </div>
        )}
      </div>

      {/* Product info */}
      <div className="bg-muted relative space-y-0.5 p-3">
        {productData.brand ? (
          <p className="text-muted-foreground truncate text-[10px] font-medium tracking-wide uppercase">
            {productData.brand}
          </p>
        ) : (
          <div className="h-3.5" aria-hidden="true" />
        )}
        <p className="text-foreground line-clamp-1 text-sm font-semibold">
          {productData.name}
        </p>
        {productData.price !== null && (
          <p className="text-foreground text-sm font-bold">
            €{productData.price.toFixed(2)}
          </p>
        )}
        <div className="absolute right-2 bottom-2">
          <AddToCartButton
            compact
            onAdd={() => addItem(productData)}
            className="h-6 w-6 [&_svg]:h-3 [&_svg]:w-3"
          />
        </div>
      </div>
    </Link>
  )
}
