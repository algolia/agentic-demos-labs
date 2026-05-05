'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useRef } from 'react'
import { EXPERIMENTAL_Autocomplete } from 'react-instantsearch'
import 'instantsearch.css/themes/satellite.css'

import {
  useAIButtonInjection,
  useAutocompleteIndices,
  useDetachedBackButton,
} from '@/components/autocomplete/hooks'

import type { ReactNode } from 'react'

interface AutocompletePanelProps {
  elements: Record<string, ReactNode | undefined>
  showRecent: boolean
  showSuggestions: boolean
  showProducts: boolean
  indexName?: string
}

const AutocompletePanel = ({
  elements,
  showRecent,
  showSuggestions,
  showProducts,
  indexName,
}: AutocompletePanelProps) => (
  <>
    {showRecent && elements.recent}
    {showSuggestions && elements.suggestions}
    {showProducts && indexName && elements[indexName]}
  </>
)

interface AutocompleteWidgetProps {
  basePath: string
  placeholder?: string
  showProducts?: boolean
  showSuggestions?: boolean
  showRecent?: boolean
  hitsPerPage?: number
}

export const AutocompleteWidget = ({
  basePath,
  placeholder = 'Search...',
  showProducts = true,
  showSuggestions = false,
  showRecent = false,
  hitsPerPage = 3,
}: AutocompleteWidgetProps) => {
  const router = useRouter()
  const pathname = usePathname()

  const isOnSearchPage = pathname.includes('/search')

  // Close the chat sidebar on route changes triggered from the search bar so
  // the destination page isn't loaded behind a still-open mobile overlay.
  const previousPathname = useRef(pathname)
  useEffect(() => {
    if (previousPathname.current === pathname) return
    previousPathname.current = pathname

    if (!document.querySelector('.ais-Chat-container--open')) return
    document.querySelector<HTMLButtonElement>('.ais-ChatToggleButton')?.click()
  }, [pathname])

  useDetachedBackButton()

  // Injects an "AI mode" button into the search bar that opens the Chat panel.
  // Only renders when a valid Agent Studio agent ID is configured in config.ts.
  // Pass `isOnSearchPage` so the button is re-injected when the underlying
  // autocomplete is remounted via its `key` on route transitions.
  useAIButtonInjection(isOnSearchPage)

  const {
    indices,
    suggestionsConfig,
    recentConfig,
    productsIndexName,
  } = useAutocompleteIndices({
    basePath,
    hitsPerPage,
    showProducts,
    showSuggestions,
    showRecent,
  })

  const handleSelect = (params: { item?: Record<string, unknown> }) => {
    if (!params.item) return

    const item = params.item

    // Recent search or suggestion
    if ('query' in item && item.query) {
      router.push(
        `${basePath}/search?query=${encodeURIComponent(String(item.query))}`,
      )
      return
    }

    // Product
    if (item.objectID) {
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
            indexName={productsIndexName}
          />
        </div>
      )}
    />
  )
}
