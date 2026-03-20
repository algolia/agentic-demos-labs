'use client'

import { useQuery } from '@tanstack/react-query'
import { useAtomValue } from 'jotai'

import { useActiveConfig } from '@/hooks/useActiveConfig'
import { searchClientAtom } from '@/stores/searchClient'

export interface ProductHit {
  objectID: string
  name: string
  brand?: string
  description?: string
  price?: number
  image?: string
  primary_image?: string
  images?: string[]
  category?: string
  color?: string
  size?: string
  sizes?: string[]
  available_sizes?: string[]
}

interface UseProductOptions {
  staleTime?: number
}

export const useProduct = (
  productId: string,
  options: UseProductOptions = {},
) => {
  const { staleTime = 1000 * 60 * 5 } = options
  const searchClient = useAtomValue(searchClientAtom)
  const { algolia, slug } = useActiveConfig()

  return useQuery({
    queryKey: ['product', slug, productId],
    queryFn: async () => {
      if (!searchClient || !algolia) {
        throw new Error('Search client or config not available')
      }

      const results = await searchClient.search<ProductHit>([
        {
          indexName: algolia.indices.productsIndex,
          params: {
            filters: `objectID:${productId}`,
            hitsPerPage: 1,
          },
        },
      ])

      const firstResult = results.results[0]
      const hit =
        firstResult && 'hits' in firstResult ? firstResult.hits[0] : null

      return hit ?? null
    },
    enabled: !!searchClient && !!algolia && !!productId,
    staleTime,
  })
}
