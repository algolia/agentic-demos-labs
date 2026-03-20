'use client'

import { ecommerceConfig } from '@/app/config'
import { SizeSelector } from '@/components/product/SizeSelector'
import { AccordionItem } from '@/components/ui/AccordionItem'
import { AddToCartButton } from '@/components/ui/button/AddToCartButton'
import { useCart } from '@/hooks/useCart'
import type { ProductHit } from '@/hooks/useProduct'

interface ProductActionsProps {
  product: ProductHit
}

export const ProductActions = ({ product }: ProductActionsProps) => {
  const { addItem } = useCart()

  const defaultDescription =
    'Premium quality product built for performance and durability. Features innovative design and materials for maximum comfort and style.'

  const imagePrefix = ecommerceConfig.algolia.hitTemplate.imageHrefPrefix ?? ''
  const sizes = product.sizes ?? product.available_sizes
  const description = product.description

  const handleAddToCart = () => {
    addItem({
      objectID: product.objectID,
      name: product.name,
      image: product.image ? `${imagePrefix}${product.image}` : null,
      price: product.price ?? null,
      brand: product.brand ?? null,
    })
  }

  return (
    <>
      <SizeSelector sizes={sizes} />

      <p className="text-foreground text-2xl font-bold">
        ${product.price?.toFixed(2) ?? '0.00'}
      </p>

      <AddToCartButton onAdd={handleAddToCart} />

      <div className="border-border mt-6 border-t">
        <AccordionItem title="Description" defaultOpen>
          <p>{description ?? defaultDescription}</p>
        </AccordionItem>
        <AccordionItem title="Shipping & Returns">
          <p>
            Free standard shipping on orders over $50. Express shipping
            available at checkout. 30-day free returns on all orders.
          </p>
        </AccordionItem>
      </div>
    </>
  )
}
