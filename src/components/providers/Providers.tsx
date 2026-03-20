'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useSetAtom, Provider } from 'jotai'
import { useEffect } from 'react'

import { AlgoliaProvider } from '@/components/providers/AlgoliaProvider'
import { InstantSearchProvider } from '@/components/providers/InstantSearchProvider'
import { ThemeProvider } from '@/components/providers/ThemeProvider'
import { activeConfigAtom } from '@/stores/activeConfig'
import type { VerticalConfig } from '@/types'

interface ProvidersProps {
  config: VerticalConfig
  children: React.ReactNode
}

const queryClient = new QueryClient()

const InnerProviders = ({ config, children }: ProvidersProps) => {
  const setActiveConfig = useSetAtom(activeConfigAtom)

  useEffect(() => {
    setActiveConfig(config)
    return () => setActiveConfig(null)
  }, [config, setActiveConfig])

  return (
    <div data-vertical={config.slug} className="flex min-h-screen flex-col">
      <ThemeProvider theme={config.theme}>
        <AlgoliaProvider
          appId={config.algolia.appId}
          apiKey={config.algolia.apiKey}>
          <InstantSearchProvider
            indexName={config.algolia.indices.productsIndex}>
            {children}
          </InstantSearchProvider>
        </AlgoliaProvider>
      </ThemeProvider>
    </div>
  )
}

export const Providers = ({ config, children }: ProvidersProps) => (
  <Provider>
    <QueryClientProvider client={queryClient}>
      <InnerProviders config={config}>{children}</InnerProviders>
    </QueryClientProvider>
  </Provider>
)
