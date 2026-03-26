'use client'

import { useAtom } from 'jotai'
import { useCallback } from 'react'

import {
  chatMessagesState,
  suggestionsState,
  collectedObjectIDsState,
  conversationIdState,
} from '@/features/aiAssistant/stores/aiAssistant'
import type {
  ChatMessage,
  DisplayResultsData,
  OrderContextData,
} from '@/features/aiAssistant/types'

const generateId = () => crypto.randomUUID()

export interface MessageStateAPI {
  messages: ChatMessage[]
  suggestions: string[]
  collectedObjectIDs: string[]
  setSuggestions: (suggestions: string[]) => void
  addUserMessage: (text: string, orderContext?: OrderContextData) => ChatMessage
  createAssistantPlaceholder: () => string
  updateAssistantText: (id: string, text: string) => void
  appendDisplayResults: (id: string, data: DisplayResultsData) => void
  appendNoResultsMessage: (id: string) => void
  reset: () => void
}

/**
 * Hook for managing chat message state.
 * Provides CRUD operations for messages, suggestions, and collected object IDs.
 */
export const useMessageState = (): MessageStateAPI => {
  const [messages, setMessages] = useAtom(chatMessagesState)
  const [suggestions, setSuggestionsAtom] = useAtom(suggestionsState)
  const [collectedObjectIDs, setCollectedObjectIDs] = useAtom(
    collectedObjectIDsState,
  )
  const [, setConversationId] = useAtom(conversationIdState)

  const setSuggestions = useCallback(
    (newSuggestions: string[]) => {
      setSuggestionsAtom(newSuggestions)
    },
    [setSuggestionsAtom],
  )

  const addUserMessage = useCallback(
    (text: string, orderContext?: OrderContextData): ChatMessage => {
      const parts: ChatMessage['parts'] = []

      // Add order context first if provided
      if (orderContext) {
        parts.push({ type: 'order_context', orderContext })
      }

      // Add the text message
      parts.push({ type: 'text', text })

      const message: ChatMessage = {
        id: generateId(),
        role: 'user',
        parts,
        createdAt: new Date(),
      }
      setMessages((prev) => [...prev, message])
      return message
    },
    [setMessages],
  )

  const createAssistantPlaceholder = useCallback((): string => {
    const id = generateId()
    setMessages((prev) => [
      ...prev,
      {
        id,
        role: 'assistant',
        parts: [{ type: 'text', text: '' }],
        createdAt: new Date(),
      },
    ])
    return id
  }, [setMessages])

  const updateAssistantText = useCallback(
    (id: string, text: string) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === id ? { ...msg, parts: [{ type: 'text', text }] } : msg,
        ),
      )
    },
    [setMessages],
  )

  const appendDisplayResults = useCallback(
    (id: string, data: DisplayResultsData) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === id
            ? {
                ...msg,
                parts: [
                  ...msg.parts.filter((p) => p.type === 'text' && p.text),
                  { type: 'display_results', displayData: data },
                ],
              }
            : msg,
        ),
      )
      // Update collected object IDs
      const allObjectIDs = data.groups.flatMap(
        (g) => g.products?.map((p) => p.objectID) || [],
      )
      setCollectedObjectIDs(allObjectIDs)
    },
    [setMessages, setCollectedObjectIDs],
  )

  const appendNoResultsMessage = useCallback(
    (id: string) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === id
            ? {
                ...msg,
                parts: [
                  ...msg.parts.filter((p) => p.type === 'text' && p.text),
                  {
                    type: 'text',
                    text: "Sorry, I couldn't find any matching products. Please try a different search.",
                  },
                ],
              }
            : msg,
        ),
      )
    },
    [setMessages],
  )

  const reset = useCallback(() => {
    setMessages([])
    setSuggestionsAtom([])
    setCollectedObjectIDs([])
    setConversationId(crypto.randomUUID())
  }, [setMessages, setSuggestionsAtom, setCollectedObjectIDs, setConversationId])

  return {
    messages,
    suggestions,
    collectedObjectIDs,
    setSuggestions,
    addUserMessage,
    createAssistantPlaceholder,
    updateAssistantText,
    appendDisplayResults,
    appendNoResultsMessage,
    reset,
  }
}
