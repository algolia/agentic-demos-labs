'use client'

import { useAtomValue } from 'jotai'
import { Eye } from 'lucide-react'

import { AddToCartButton } from '@/components/ui/button/AddToCartButton'
import { productContextState } from '@/features/aiAssistant/stores/aiAssistant'
import { useActiveConfig } from '@/hooks/useActiveConfig'
import { useCart } from '@/hooks/useCart'
import { buildImageUrl } from '@/utilities/getHitValues'

/**
 * Displays the current product context in the AI assistant.
 * Compact card styled like OrderContextCard, shown in the message flow.
 */
export const ProductContextCard = () => {
  const productContext = useAtomValue(productContextState)
  const { algolia } = useActiveConfig()
  const { addItem } = useCart()

  if (!productContext) return null

  const objectID = productContext.objectID as string | undefined
  const name = (productContext.name as string) || 'Product'
  const brand = productContext.brand as string | undefined
  const price = productContext.price as number | undefined
  const rawImage = productContext.image as string | undefined
  const image =
    buildImageUrl(rawImage, {
      prefix: algolia?.hitTemplate?.imageHrefPrefix,
      suffix: algolia?.hitTemplate?.imageHrefSuffix,
    }) ?? undefined

  const handleAddToCart = () => {
    if (!objectID) return
    addItem({
      objectID,
      name,
      image: image ?? null,
      price: price ?? null,
      brand: brand ?? null,
    })
  }

  return (
    <div className="flex justify-end">
      <div className="bg-muted/50 border-border max-w-[90%] rounded-lg border p-3">
        <div className="mb-2 flex items-center justify-between">
          <div className="text-muted-foreground flex items-center gap-2 text-xs font-medium">
            <Eye className="h-3.5 w-3.5" />
            <span>Viewing this product:</span>
          </div>
          {objectID && (
            <AddToCartButton
              compact
              onAdd={handleAddToCart}
              className="h-6 w-6 [&_svg]:h-3 [&_svg]:w-3"
            />
          )}
        </div>

        <div className="bg-background border-border flex w-fit items-center gap-2 rounded-md border p-1.5">
          {image && (
            <div className="bg-muted h-10 w-10 shrink-0 overflow-hidden rounded">
              <img
                src={image}
                alt={name}
                className="h-full w-full object-contain"
              />
            </div>
          )}
          <div className="min-w-0">
            {brand && (
              <p className="text-muted-foreground truncate text-[10px] tracking-wide uppercase">
                {brand}
              </p>
            )}
            <p className="truncate text-xs leading-tight font-medium">{name}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
