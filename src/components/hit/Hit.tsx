'use client'

import Link from 'next/link'
import { Highlight } from 'react-instantsearch'

import { HitBase, type HitTemplateConfig } from '@/components/hit/HitBase'
import { AddToCartButton } from '@/components/ui/button/AddToCartButton'
import { StarRating } from '@/components/ui/StarRating'
import { useCart } from '@/hooks/useCart'

import type { Hit as AlgoliaHit, BaseHit } from 'instantsearch.js'

type Variant = 'card' | 'minimal'

interface HitProps {
  variant: Variant
  hit: AlgoliaHit<BaseHit>
  template: HitTemplateConfig
}

interface HitImageProps {
  image: string | null
  name: string
  containerClassName: string
  imageClassName: string
  showNoImageText?: boolean
}

interface VariantClasses {
  article: string
  imageContainer: string
  image: string
  contentContainer: string
  brand: string
  name: string
  price: string
  category?: string
  rating?: string
  footer?: string
}

const VARIANT_CLASSES: Record<Variant, VariantClasses> = {
  card: {
    article:
      'group flex h-full w-full flex-col overflow-hidden rounded-card border border-border bg-muted transition-shadow duration-200 hover:shadow-lg',
    imageContainer: 'h-64 w-full bg-card p-6',
    image: 'h-full w-full object-contain',
    contentContainer: 'flex flex-1 flex-col p-4',
    brand: 'text-xs font-medium uppercase tracking-wide text-muted-foreground',
    name: 'mt-1 font-semibold text-foreground line-clamp-1',
    category: 'mt-0.5 text-sm text-muted-foreground line-clamp-1',
    rating: 'mt-2 flex items-center gap-1 text-sm',
    footer: 'mt-3',
    price: 'font-bold text-foreground',
  },
  minimal: {
    article: 'group',
    imageContainer: 'bg-muted relative aspect-[3/4] overflow-hidden',
    image:
      'h-full w-full object-cover transition-transform duration-500 group-hover:scale-105',
    contentContainer: 'mt-4 text-center',
    brand: 'text-muted-foreground text-xs tracking-widest uppercase',
    name: 'mt-1 font-serif text-sm',
    price: 'mt-2 text-sm',
  },
}

const HitImage = ({
  image,
  name,
  containerClassName,
  imageClassName,
  showNoImageText,
}: HitImageProps) => (
  <div className={containerClassName}>
    {image ? (
      <img src={image} alt={name} className={imageClassName} />
    ) : showNoImageText ? (
      <div className="text-muted-foreground flex h-full items-center justify-center text-xs tracking-widest uppercase">
        No image
      </div>
    ) : null}
  </div>
)

export const Hit = ({ variant, hit, template }: HitProps) => {
  const isCard = variant === 'card'
  const classes = VARIANT_CLASSES[variant]
  const { addItem } = useCart()

  return (
    <HitBase hit={hit} template={template}>
      {(values, hit) => (
        <Link href={values.productUrl} className="block h-full w-full">
          <article className={classes.article}>
            <HitImage
              image={values.image}
              name={values.name}
              containerClassName={classes.imageContainer}
              imageClassName={classes.image}
              showNoImageText
            />

            <div className={classes.contentContainer}>
              {/* Always render brand row to maintain consistent height */}
              <p className={classes.brand}>
                {values.brand ? (
                  <Highlight attribute="brand" hit={hit} />
                ) : (
                  <span className="invisible">Brand</span>
                )}
              </p>

              <h3 className={classes.name}>
                <Highlight attribute="name" hit={hit} />
              </h3>

              {hit.category && classes.category && (
                <p className={classes.category}>
                  <Highlight attribute="category" hit={hit} />
                </p>
              )}

              {isCard && classes.rating && (
                <div className={classes.rating}>
                  <StarRating compact />
                </div>
              )}

              {isCard && classes.footer ? (
                <div className={classes.footer}>
                  <div className="flex items-center justify-between">
                    {values.price !== null && (
                      <p className={classes.price}>
                        ${values.price.toFixed(2)}
                      </p>
                    )}
                    <AddToCartButton
                      onAdd={() => addItem(values)}
                      compact
                      className="ml-auto"
                    />
                  </div>
                </div>
              ) : (
                values.price !== null && (
                  <p className={classes.price}>${values.price}</p>
                )
              )}
            </div>
          </article>
        </Link>
      )}
    </HitBase>
  )
}
