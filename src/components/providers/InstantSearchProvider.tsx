'use client'

import { useAtomValue } from 'jotai'
import { useSearchBox } from 'react-instantsearch'
import { InstantSearchNext as InstantSearch } from 'react-instantsearch-nextjs'

import { searchClientAtom } from '@/stores/searchClient'

const VirtualSearchBox = () => {
  useSearchBox()
  return null
}

interface InstantSearchProviderProps {
  indexName: string
  routing?: boolean
  children: React.ReactNode
}

export const InstantSearchProvider = ({
  indexName,
  routing = true,
  children,
}: InstantSearchProviderProps) => {
  const searchClient = useAtomValue(searchClientAtom)

  if (!searchClient) {
    return null
  }

  const routingConfig = routing
    ? {
        stateMapping: {
          stateToRoute(uiState: Record<string, Record<string, unknown>>) {
            const indexUiState = uiState[indexName] || {}
            return {
              query: indexUiState.query || undefined,
            }
          },
          routeToState(routeState: Record<string, unknown>) {
            return {
              [indexName]: {
                query: routeState.query as string | undefined,
              },
            }
          },
        },
      }
    : false

  return (
    <InstantSearch
      searchClient={searchClient}
      indexName={indexName}
      routing={routingConfig}
      future={{
        preserveSharedStateOnUnmount: true,
      }}>
      <VirtualSearchBox />
      {children}
    </InstantSearch>
  )
}
