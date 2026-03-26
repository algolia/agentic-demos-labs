'use client'

import { useAtomValue } from 'jotai'
import { useState, useCallback, useRef } from 'react'

import { useAgentClient } from '@/features/aiAssistant/hooks/useAgentClient'
import { useMessageState } from '@/features/aiAssistant/hooks/useMessageState'
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
  const isProcessingRef = useRef(false)

  // Config and API
  const config = useAtomValue(activeConfigAtom)
  const productContext = useAtomValue(productContextState)
  const { sendCompletion, isReady } = useAgentClient()

  // Message state management
  const messageState = useMessageState()

  // Tool execution
  const { executeToolCalls, streamingDisplay } = useToolExecutor({
    messageState,
    sendCompletion,
  })

  // Send a message
  const sendMessage = useCallback(
    async (text: string, orderContext?: OrderContextData) => {
      if (!config || !text.trim() || !isReady) return
      if (isProcessingRef.current) return
      isProcessingRef.current = true

      const abortController = new AbortController()
      messageState.setSuggestions([])
      setError(null)

      // Add user message & create assistant placeholder
      const userMessage = messageState.addUserMessage(text, orderContext)
      const assistantMessageId = messageState.createAssistantPlaceholder()
      setStatus('streaming')

      try {
        // Build API message for only the new user message
        const apiMessages: Array<{ role: string; parts: Array<{ text?: string }> }> = []

        // Inject product context if viewing a PDP
        if (productContext) {
          apiMessages.push({
            role: 'user',
            parts: [
              {
                text: `[Context: The user is currently viewing this product page. Here is the full product data: ${JSON.stringify(productContext)}]`,
              },
            ],
          })
        }

        // Build parts for the new user message
        const parts: Array<{ text?: string }> = []
        for (const p of userMessage.parts) {
          if (p.type === 'text' && p.text) {
            parts.push({ text: p.text })
          } else if (p.type === 'order_context' && p.orderContext) {
            const productNames = p.orderContext.items
              .map((item) => item.name)
              .join(', ')
            parts.push({
              text: `[Order context: Order ${p.orderContext.orderId} containing: ${productNames}]`,
            })
          }
        }
        apiMessages.push({ role: 'user', parts })

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
            result.textContent,
            result.messageId,
            abortController.signal,
          )
          if (toolResult.suggestions.length > 0) {
            messageState.setSuggestions(toolResult.suggestions)
          }
        }

        setStatus('idle')
        isProcessingRef.current = false
      } catch (err) {
        isProcessingRef.current = false
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
