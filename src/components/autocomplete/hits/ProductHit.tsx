'use client'

import { ArrowRight } from 'lucide-react'
import { Highlight } from 'react-instantsearch'

import type { VerticalConfig } from '@/types/verticalConfig.types'
import { getHitValues } from '@/utilities/getHitValues'

import type { Hit } from 'instantsearch.js'

type HitTemplate = VerticalConfig['algolia']['hitTemplate']

interface ProductHitProps {
  item: Record<string, unknown>
  template: HitTemplate
  onSelect: () => void
}

export const ProductHit = ({ item, template, onSelect }: ProductHitProps) => {
  const { brand, image, price } = getHitValues(item, template)
  const category = item.category as string | undefined

  return (
    <div
      role="button"
      className="hover:bg-muted group rounded-button flex cursor-pointer items-center gap-4 px-3 py-2.5 transition-all duration-200"
      onClick={onSelect}>
      {image ? (
        <img
          src={image}
          alt=""
          className="bg-muted rounded-image h-12 w-12 shrink-0 object-contain"
        />
      ) : null}
      <div className="min-w-0 flex-1">
        <div className="text-foreground line-clamp-1 text-sm font-medium">
          <Highlight
            hit={item as Hit<Record<string, unknown>>}
            attribute={template.nameAttribute}
          />
        </div>
        <div className="text-muted-foreground mt-0.5 flex items-center gap-1.5 text-xs">
          {brand && <span>{brand}</span>}
          {brand && category && <span>•</span>}
          {category && <span>{category}</span>}
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        {price ? (
          <div className="text-foreground text-sm font-semibold">
            {price.toFixed(0)} €
          </div>
        ) : null}
        <ArrowRight className="text-muted-foreground h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
      </div>
    </div>
  )
}
