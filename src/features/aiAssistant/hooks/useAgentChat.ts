'use client'

import { useAtomValue } from 'jotai'
import { useState, useCallback } from 'react'

import { useAgentClient } from '@/features/aiAssistant/hooks/useAgentClient'
import { useMessageState } from '@/features/aiAssistant/hooks/useMessageState'
import { useProductsSearch } from '@/features/aiAssistant/hooks/useProductsSearch'
import { useToolExecutor } from '@/features/aiAssistant/hooks/useToolExecutor'
import { productContextState } from '@/features/aiAssistant/stores/aiAssistant'
import type {
  ChatMessage,
  ChatStatus,
  OrderContextData,
  StreamingDisplayState,
} from '@/features/aiAssistant/types'
import { activeConfigAtom } from '@/stores/activeConfig'

interface UseAgentChatReturn {
  messages: ChatMessage[]
  status: ChatStatus
  error: string | null
  sendMessage: (text: string, orderContext?: OrderContextData) => Promise<void>
  resetChat: () => void
  clearError: () => void
  collectedObjectIDs: string[]
  streamingDisplay: StreamingDisplayState | null
  suggestions: string[]
}

/**
 * Main hook for the AI assistant chat.
 * Orchestrates message state, API calls, and tool execution.
 */
export const useAgentChat = (): UseAgentChatReturn => {
  const [status, setStatus] = useState<ChatStatus>('idle')
  const [error, setError] = useState<string | null>(null)

  // Config and API
  const config = useAtomValue(activeConfigAtom)
  const productContext = useAtomValue(productContextState)
  const { sendCompletion, isReady } = useAgentClient()
  const search = useProductsSearch()

  // Message state management
  const messageState = useMessageState()

  // Tool execution
  const { executeToolCalls, streamingDisplay } = useToolExecutor({
    messageState,
    sendCompletion,
    search,
  })

  // Send a message
  const sendMessage = useCallback(
    async (text: string, orderContext?: OrderContextData) => {
      if (!config || !text.trim() || !isReady) return

      const abortController = new AbortController()
      messageState.setSuggestions([])
      setError(null)

      // Add user message & create assistant placeholder
      const userMessage = messageState.addUserMessage(text, orderContext)
      const assistantMessageId = messageState.createAssistantPlaceholder()
      setStatus('streaming')

      try {
        // Build API messages from current state, including tool result context
        const apiMessages = [...messageState.messages, userMessage].map(
          (msg) => {
            const parts: Array<{ text?: string }> = []

            for (const p of msg.parts) {
              if (p.type === 'text' && p.text) {
                parts.push({ text: p.text })
              } else if (p.type === 'order_context' && p.orderContext) {
                // Include order context for post-purchase AI queries
                const productNames = p.orderContext.items
                  .map((item) => item.name)
                  .join(', ')
                parts.push({
                  text: `[Order context: Order ${p.orderContext.orderId} containing: ${productNames}]`,
                })
              } else if (p.type === 'display_results' && p.displayData) {
                // Include displayed products as context for the agent
                const productSummary = p.displayData.groups
                  .map((g) => {
                    const products = g.products
                      ?.map((prod) => prod.objectID)
                      .join(', ')
                    return `${g.title}: ${products}`
                  })
                  .join('; ')
                if (productSummary) {
                  parts.push({
                    text: `[Previously shown products: ${productSummary}]`,
                  })
                }
              }
            }

            return { role: msg.role, parts }
          },
        )

        // Inject product context if viewing a PDP (prepend to first user message)
        if (productContext && apiMessages.length > 0) {
          const contextMessage = {
            role: 'user' as const,
            parts: [
              {
                text: `[Context: The user is currently viewing this product page. Here is the full product data: ${JSON.stringify(productContext)}]`,
              },
            ],
          }
          apiMessages.unshift(contextMessage)
        }

        // Stream response
        let currentText = ''
        const result = await sendCompletion(apiMessages, {
          signal: abortController.signal,
          onTextDelta: (delta) => {
            currentText += delta
            messageState.updateAssistantText(assistantMessageId, currentText)
          },
        })

        // Handle suggestions
        if (result.suggestions.length > 0) {
          messageState.setSuggestions(result.suggestions)
        }

        // Handle tool calls
        if (result.toolCalls.length > 0) {
          setStatus('awaiting_tool')
          const toolResult = await executeToolCalls(
            result.toolCalls,
            assistantMessageId,
            apiMessages,
            abortController.signal,
          )
          if (toolResult.suggestions.length > 0) {
            messageState.setSuggestions(toolResult.suggestions)
          }
        }

        setStatus('idle')
      } catch (err) {
        if ((err as Error).name === 'AbortError') return
        console.error('[sendMessage] Error:', err)
        setError(
          (err as Error).message || 'Something went wrong. Please try again.',
        )
        setStatus('error')
      }
    },
    [
      config,
      messageState,
      isReady,
      sendCompletion,
      executeToolCalls,
      productContext,
    ],
  )

  // Reset chat
  const resetChat = useCallback(() => {
    messageState.reset()
    setStatus('idle')
    setError(null)
  }, [messageState])

  // Clear error state
  const clearError = useCallback(() => {
    setError(null)
    setStatus('idle')
  }, [])

  return {
    messages: messageState.messages,
    status,
    error,
    sendMessage,
    resetChat,
    clearError,
    collectedObjectIDs: messageState.collectedObjectIDs,
    streamingDisplay,
    suggestions: messageState.suggestions,
  }
}
