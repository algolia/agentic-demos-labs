'use client'

import { useSetAtom } from 'jotai'
import { useEffect } from 'react'

import { productContextState } from '@/features/aiAssistant/stores/aiAssistant'

/**
 * Hook to set the product context for the AI assistant.
 * Call this on PDP pages to provide product data to the assistant.
 * The context is automatically cleared when the component unmounts.
 */
export const useSetProductContext = (
  product: Record<string, unknown> | null,
) => {
  const setProductContext = useSetAtom(productContextState)

  useEffect(() => {
    if (product) {
      setProductContext(product)
    }

    return () => {
      setProductContext(null)
    }
  }, [product, setProductContext])
}
