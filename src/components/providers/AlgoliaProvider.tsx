'use client'

import { liteClient as algoliasearch } from 'algoliasearch/lite'
import { useSetAtom } from 'jotai'
import { useEffect } from 'react'

import { searchClientAtom } from '@/stores/searchClient'

interface AlgoliaProviderProps {
  appId: string
  apiKey: string
  children: React.ReactNode
}

export const AlgoliaProvider = ({
  appId,
  apiKey,
  children,
}: AlgoliaProviderProps) => {
  const setSearchClient = useSetAtom(searchClientAtom)

  useEffect(() => {
    if (appId && apiKey) {
      const client = algoliasearch(appId, apiKey)
      setSearchClient(client)
    }

    return () => {
      setSearchClient(null)
    }
  }, [appId, apiKey, setSearchClient])

  return <>{children}</>
}
