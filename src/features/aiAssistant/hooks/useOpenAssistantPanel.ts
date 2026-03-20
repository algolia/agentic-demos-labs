'use client'

import { useSetAtom } from 'jotai'
import { useRouter } from 'next/navigation'
import { useSearchBox } from 'react-instantsearch'

import {
  isAIAssistantOpenState,
  isAIAssistantExpandedState,
  initialAIMessageState,
  initialOrderContextState,
  chatMessagesState,
  suggestionsState,
  collectedObjectIDsState,
} from '@/features/aiAssistant/stores/aiAssistant'
import type { OrderContextData } from '@/features/aiAssistant/types'

interface UseOpenAssistantPanelOptions {
  basePath: string
}

interface OpenWithMessageOptions {
  clearHistory?: boolean
  expanded?: boolean
  navigate?: boolean
  orderContext?: OrderContextData
}

/**
 * Hook for managing the opening of the AI Assistant panel with a specific message.
 */
export const useOpenAssistantPanel = ({
  basePath,
}: UseOpenAssistantPanelOptions) => {
  const setIsAIAssistantOpen = useSetAtom(isAIAssistantOpenState)
  const setIsAIAssistantExpanded = useSetAtom(isAIAssistantExpandedState)
  const setInitialAIMessage = useSetAtom(initialAIMessageState)
  const setInitialOrderContext = useSetAtom(initialOrderContextState)
  const setMessages = useSetAtom(chatMessagesState)
  const setSuggestions = useSetAtom(suggestionsState)
  const setCollectedObjectIDs = useSetAtom(collectedObjectIDsState)
  const router = useRouter()
  const { refine } = useSearchBox()

  const openWithMessage = (
    message: string,
    options: OpenWithMessageOptions = {},
  ) => {
    const {
      clearHistory = true,
      expanded = true,
      navigate = true,
      orderContext,
    } = options

    // Clear the InstantSearch query so the SRP shows all products
    refine('')

    // Optionally clear previous AI chat state
    if (clearHistory) {
      setMessages([])
      setSuggestions([])
      setCollectedObjectIDs([])
    }

    // Set the initial message and optional order context for the AI chat
    setInitialAIMessage(message)
    setInitialOrderContext(orderContext ?? null)

    // Open the AI assistant panel
    setIsAIAssistantOpen(true)
    setIsAIAssistantExpanded(expanded)

    // Optionally navigate to the search page
    if (navigate) {
      router.push(`${basePath}/search`)
    }
  }

  return { openWithMessage }
}
