'use client'

import { QueryClient, useQueryClient } from '@tanstack/react-query'
import { useAtomValue } from 'jotai'
import { useCallback } from 'react'

import type {
  SearchQuery,
  SearchResult,
  ProductData,
  ProductSummary,
} from '@/features/aiAssistant/types'
import { activeConfigAtom } from '@/stores/activeConfig'
import { searchClientAtom } from '@/stores/searchClient'
import type { VerticalConfig } from '@/types'
import { buildImageUrl } from '@/utilities/getHitValues'

import type { liteClient } from 'algoliasearch/lite'

type AlgoliaLiteClient = ReturnType<typeof liteClient>

export interface AlgoliaSearchResult {
  objectIDs: string[]
  hits: SearchResult[]
  productSummaries: ProductSummary[]
}

/**
 * Extract product data from a hit using the hit template configuration.
 */
const extractProductData = (
  hit: Record<string, unknown>,
  hitTemplate: {
    nameAttribute: string
    imageAttribute: string
    imageHrefPrefix?: string
    imageHrefSuffix?: string
    priceAttribute?: string
    brandAttribute?: string
  },
): ProductData => {
  const objectID = hit.objectID as string
  const nameValue = hit[hitTemplate.nameAttribute]
  const name = nameValue ? String(nameValue) : ''

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
  const brand = brandValue ? String(brandValue) : null

  return {
    objectID,
    name,
    image,
    price: price && !isNaN(price) ? price : null,
    brand,
  }
}

/**
 * Core search logic.
 */
async function runSearch(
  queries: SearchQuery[],
  searchClient: AlgoliaLiteClient | null,
  config: VerticalConfig | null,
  queryClient: QueryClient,
): Promise<AlgoliaSearchResult> {
  if (!searchClient || !config || !queries || queries.length === 0) {
    return { objectIDs: [], hits: [], productSummaries: [] }
  }

  const { indices, hitTemplate } = config.algolia

  const searchRequests = queries.map((q) => {
    return {
      indexName: indices.productsIndex,
      query: q.query,
      params: {
        hitsPerPage: 10,
        filters: q.filters,
      },
    }
  })

  const response = await searchClient.search<SearchResult>(searchRequests)

  const hitsMap = new Map<string, SearchResult>()
  response.results.forEach((result) => {
    if ('hits' in result) {
      result.hits.forEach((hit) => {
        if (hit.objectID && !hitsMap.has(hit.objectID)) {
          hitsMap.set(hit.objectID, hit)
        }
      })
    }
  })

  const objectIDs = Array.from(hitsMap.keys())
  const hits = Array.from(hitsMap.values())

  hits.forEach((hit) => {
    const productData = extractProductData(hit, hitTemplate)
    queryClient.setQueryData(['product', hit.objectID], productData)
  })

  const productSummaries = hits.map((hit) => {
    const nameValue = hit[hitTemplate.nameAttribute]
    const priceValue = hitTemplate.priceAttribute
      ? hit[hitTemplate.priceAttribute]
      : null

    return {
      objectID: hit.objectID,
      name: nameValue ? String(nameValue) : '',
      price: priceValue != null ? Number(priceValue) : null,
    }
  })

  return { objectIDs, hits, productSummaries }
}

/**
 * Hook that returns a search function. Call it inside callbacks or effects.
 */
export const useProductsSearch = () => {
  const searchClient = useAtomValue(searchClientAtom)
  const config = useAtomValue(activeConfigAtom)
  const queryClient = useQueryClient()

  return useCallback(
    (queries: SearchQuery[]) =>
      runSearch(queries, searchClient, config, queryClient),
    [searchClient, config, queryClient],
  )
}
