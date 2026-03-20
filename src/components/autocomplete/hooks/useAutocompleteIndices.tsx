'use client'

import { AutocompleteSectionHeader } from '@/components/autocomplete/AutocompleteSectionHeader'
import {
  AISuggestionsHit,
  ProductHit,
  SuggestionHit,
} from '@/components/autocomplete/hits'
import { useActiveConfig } from '@/hooks/useActiveConfig'

interface UseAutocompleteIndicesParams {
  basePath: string
  hitsPerPage: number
  showProducts: boolean
  showSuggestions: boolean
  showAISuggestions: boolean
  showRecent: boolean
}

export const useAutocompleteIndices = ({
  basePath,
  hitsPerPage,
  showProducts,
  showSuggestions,
  showAISuggestions,
  showRecent,
}: UseAutocompleteIndicesParams) => {
  const { algolia } = useActiveConfig()

  const productsIndex =
    showProducts && algolia?.indices?.productsIndex && algolia?.hitTemplate
      ? [
          {
            indexName: algolia.indices.productsIndex,
            searchParameters: { hitsPerPage },
            headerComponent: () => (
              <AutocompleteSectionHeader>Products</AutocompleteSectionHeader>
            ),
            itemComponent: ({
              item,
              onSelect,
            }: {
              item: Record<string, unknown>
              onSelect: () => void
            }) => (
              <ProductHit
                item={item}
                template={algolia.hitTemplate}
                onSelect={onSelect}
              />
            ),
            getURL: (item: Record<string, unknown>) =>
              `${basePath}/product/${item.objectID}`,
          },
        ]
      : []

  const suggestionsConfig =
    showSuggestions && algolia?.indices?.querySuggestionsIndex
      ? {
          indexName: algolia.indices.querySuggestionsIndex,
          headerComponent: () => (
            <AutocompleteSectionHeader>Suggestions</AutocompleteSectionHeader>
          ),
          itemComponent: ({
            item,
            onSelect,
          }: {
            item: { query: string }
            onSelect: () => void
          }) => <SuggestionHit item={item} onSelect={onSelect} />,
          getURL: (item: { query: string }) =>
            `${basePath}/search?query=${encodeURIComponent(item.query)}`,
        }
      : undefined

  const aiSuggestionsConfig =
    showAISuggestions && algolia?.indices?.aiSuggestionsIndex
      ? {
          indexName: algolia.indices.aiSuggestionsIndex,
          headerComponent: () => (
            <AutocompleteSectionHeader>
              AI Suggestions
            </AutocompleteSectionHeader>
          ),
          itemComponent: ({
            item,
            onSelect,
          }: {
            item: Record<string, unknown>
            onSelect: () => void
          }) => (
            <AISuggestionsHit
              item={item}
              basePath={basePath}
              onSelect={onSelect}
            />
          ),
          getURL: () => `${basePath}/search`,
        }
      : undefined

  const recentConfig = showRecent
    ? {
        headerComponent: () => (
          <AutocompleteSectionHeader>Recent</AutocompleteSectionHeader>
        ),
      }
    : undefined

  const allIndices = [
    ...productsIndex,
    ...(aiSuggestionsConfig ? [aiSuggestionsConfig] : []),
  ]

  return {
    indices: allIndices,
    suggestionsConfig,
    recentConfig,
    productsIndexName: algolia?.indices?.productsIndex,
    aiSuggestionsIndexName: algolia?.indices?.aiSuggestionsIndex,
  }
}
