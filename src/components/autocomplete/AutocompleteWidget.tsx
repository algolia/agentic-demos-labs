'use client'

import { useSetAtom } from 'jotai'
import { usePathname, useRouter } from 'next/navigation'
import { EXPERIMENTAL_Autocomplete } from 'react-instantsearch'
import 'instantsearch.css/themes/satellite.css'

import {
  useAIButtonInjection,
  useAutocompleteIndices,
  useDetachedBackButton,
} from '@/components/autocomplete/hooks'
import { isAIAssistantOpenState } from '@/features/aiAssistant'

import type { ReactNode } from 'react'

interface AutocompletePanelProps {
  elements: Record<string, ReactNode | undefined>
  showRecent: boolean
  showSuggestions: boolean
  showProducts: boolean
  showAISuggestions: boolean
  indexName?: string
  aiSuggestionsIndexName?: string
}

const AutocompletePanel = ({
  elements,
  showRecent,
  showSuggestions,
  showProducts,
  showAISuggestions,
  indexName,
  aiSuggestionsIndexName,
}: AutocompletePanelProps) => (
  <>
    {showRecent && elements.recent}
    {showSuggestions && elements.suggestions}
    {showProducts && indexName && elements[indexName]}
    {showAISuggestions &&
      aiSuggestionsIndexName &&
      elements[aiSuggestionsIndexName]}
  </>
)

interface AutocompleteWidgetProps {
  basePath: string
  placeholder?: string
  showProducts?: boolean
  showSuggestions?: boolean
  showRecent?: boolean
  showAISuggestions?: boolean
  showAIButton?: boolean
  hitsPerPage?: number
}

export const AutocompleteWidget = ({
  basePath,
  placeholder = 'Search...',
  showProducts = true,
  showSuggestions = false,
  showRecent = false,
  showAISuggestions = false,
  showAIButton = false,
  hitsPerPage = 3,
}: AutocompleteWidgetProps) => {
  const router = useRouter()
  const pathname = usePathname()
  const setIsAIAssistantOpen = useSetAtom(isAIAssistantOpenState)

  const isOnSearchPage = pathname.includes('/search')

  useAIButtonInjection({ enabled: showAIButton, basePath })
  useDetachedBackButton()

  const {
    indices,
    suggestionsConfig,
    recentConfig,
    productsIndexName,
    aiSuggestionsIndexName,
  } = useAutocompleteIndices({
    basePath,
    hitsPerPage,
    showProducts,
    showSuggestions,
    showAISuggestions,
    showRecent,
  })

  const handleSelect = (params: { item?: Record<string, unknown> }) => {
    if (!params.item) return

    const item = params.item

    // AI suggestions handle their own navigation
    if (item.__indexName === aiSuggestionsIndexName) return

    // Recent search or suggestion
    if ('query' in item && item.query) {
      setIsAIAssistantOpen(false)
      router.push(
        `${basePath}/search?query=${encodeURIComponent(String(item.query))}`,
      )
      return
    }

    // Product
    if (item.objectID) {
      setIsAIAssistantOpen(false)
      router.push(`${basePath}/product/${item.objectID}`)
    }
  }

  const handleSubmit = (event: React.FormEvent<HTMLDivElement>) => {
    const input = event.currentTarget.querySelector('input')
    const query = input?.value || ''
    const url = query
      ? `${basePath}/search?query=${encodeURIComponent(query)}`
      : `${basePath}/search`
    router.push(url)
  }

  const handleClick = () => {
    const input = document.querySelector<HTMLInputElement>(
      '.ais-AutocompleteForm input',
    )
    if (
      input &&
      document.activeElement === input &&
      input.getAttribute('aria-expanded') === 'false'
    ) {
      input.dispatchEvent(new FocusEvent('focus', { bubbles: false }))
    }
  }

  return (
    <EXPERIMENTAL_Autocomplete
      key={isOnSearchPage ? 'search' : 'non-search'}
      placeholder={placeholder}
      detachedMediaQuery="(max-width: 1024px)"
      onClick={handleClick}
      indices={indices}
      showSuggestions={suggestionsConfig}
      showRecent={recentConfig}
      searchParameters={{ hitsPerPage }}
      onSelect={handleSelect}
      onSubmit={handleSubmit}
      panelComponent={({ elements }) => (
        <div className="flex flex-col gap-2 px-1">
          <AutocompletePanel
            elements={elements}
            showRecent={showRecent}
            showSuggestions={showSuggestions}
            showProducts={showProducts}
            showAISuggestions={showAISuggestions}
            indexName={productsIndexName}
            aiSuggestionsIndexName={aiSuggestionsIndexName}
          />
        </div>
      )}
    />
  )
}
