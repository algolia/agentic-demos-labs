'use client'

import { useQuery } from '@tanstack/react-query'
import { useAtomValue } from 'jotai'
import { useMemo } from 'react'

import { searchClientAtom } from '@/stores/searchClient'
import type { VerticalConfig } from '@/types'
import { buildImageUrl } from '@/utilities/getHitValues'

/**
 * Hook to fetch the first product image for each category carousel entry.
 * Returns the carousel list and an imageUrl map keyed by category for quick lookup.
 */
export const useCategoryImages = (config: VerticalConfig) => {
  const searchClient = useAtomValue(searchClientAtom)

  const carouselCategories = config.carouselCategories ?? []
  const categories = carouselCategories.map((c) => c.category)

  const categoryAttribute =
    config.merchandising?.categoryAttribute ?? 'categoryPageId'
  const { indices, hitTemplate } = config.algolia

  const { data: categoryImages } = useQuery({
    queryKey: ['categoryImages', config.slug, categories],
    queryFn: async () => {
      if (!searchClient || categories.length === 0) {
        return []
      }

      const searchRequests = categories.map((category) => {
        return {
          indexName: indices.productsIndex,
          params: {
            filters: `${categoryAttribute}:"${category}"`,
            hitsPerPage: 1,
            attributesToRetrieve: [hitTemplate.imageAttribute, 'objectID'],
          },
        }
      })

      const response = await searchClient.search(searchRequests)

      return categories.map((category, index) => {
        const result = response.results[index]
        const hit = result && 'hits' in result ? result.hits[0] : null

        let imageUrl: string | null = null
        if (hit) {
          const rawImage = hit[hitTemplate.imageAttribute as keyof typeof hit]
          if (rawImage && typeof rawImage === 'string') {
            imageUrl = buildImageUrl(rawImage, {
              prefix: hitTemplate.imageHrefPrefix,
              suffix: hitTemplate.imageHrefSuffix,
            })
          }
        }

        return { category, imageUrl }
      })
    },
    enabled: !!searchClient && categories.length > 0,
    staleTime: 1000 * 60 * 10, // 10 minutes
  })

  const imageMap = useMemo(
    () =>
      new Map(
        categoryImages?.map((item) => [item.category, item.imageUrl]) ?? [],
      ),
    [categoryImages],
  )

  return { carouselCategories, imageMap }
}
