'use client'

import { useState, useCallback } from 'react'

import type { SendCompletionOptions } from '@/features/aiAssistant/hooks/useAgentClient'
import type { MessageStateAPI } from '@/features/aiAssistant/hooks/useMessageState'
import type { AlgoliaSearchResult } from '@/features/aiAssistant/hooks/useProductsSearch'
import type { StreamResult } from '@/features/aiAssistant/streaming/agentStreamParser'
import { extractDisplayResultsStream } from '@/features/aiAssistant/tools/parsing/displayResultsParser'
import { getToolHandler } from '@/features/aiAssistant/tools/registry'
import type {
  ToolCall,
  StreamingDisplayState,
  ToolExecutionContext,
  SearchQuery,
  ProductSummary,
} from '@/features/aiAssistant/types'

type ApiMessage = { role: string; parts: Array<{ text?: string }> }

type SendCompletionFn = (
  messages: Array<{ role: string; parts: Array<{ text?: string }> }>,
  options?: SendCompletionOptions,
) => Promise<StreamResult>

type AlgoliaSearchFn = (queries: SearchQuery[]) => Promise<AlgoliaSearchResult>

interface UseToolExecutorOptions {
  messageState: MessageStateAPI
  sendCompletion: SendCompletionFn
  search: AlgoliaSearchFn
}

/**
 * Hook for executing tool calls from the agent.
 * Routes tool calls to their handlers via the tool registry.
 */
export const useToolExecutor = ({
  messageState,
  sendCompletion,
  search,
}: UseToolExecutorOptions) => {
  const [streamingDisplay, setStreamingDisplay] =
    useState<StreamingDisplayState | null>(null)

  // Create a function to send search results back to agent
  const createSendFollowUp = useCallback(
    (_previousMessages: ApiMessage[], signal?: AbortSignal) =>
      async (
        productSummaries: ProductSummary[],
      ): Promise<{ toolCalls: ToolCall[]; suggestions: string[] }> => {
        const resultMessage = {
          role: 'user',
          parts: [
            {
              text: `Here are the search results I found: ${JSON.stringify(productSummaries)}. Now please call the displayResults tool to show them to the user.`,
            },
          ],
        }

        const result = await sendCompletion(
          [resultMessage],
          {
            signal,
            onToolInputDelta: (toolCallId, toolName, _delta, fullBuffer) => {
              if (toolName === 'displayResults') {
                const extracted = extractDisplayResultsStream(fullBuffer)
                setStreamingDisplay({
                  intro: extracted.intro,
                  groups: extracted.groups,
                  streamingGroup: extracted.streamingGroup,
                  isStreaming: true,
                  toolCallId,
                })
              }
            },
          },
        )

        return {
          toolCalls: result.toolCalls,
          suggestions: result.suggestions,
        }
      },
    [sendCompletion],
  )

  // Execute tool calls using the registry
  const executeToolCalls = useCallback(
    async (
      toolCalls: ToolCall[],
      assistantMessageId: string,
      previousApiMessages: ApiMessage[],
      signal?: AbortSignal,
    ): Promise<{ suggestions: string[] }> => {
      let finalSuggestions: string[] = []

      for (const toolCall of toolCalls) {
        const handler = getToolHandler(toolCall.name)

        if (!handler) {
          console.warn(`[executeToolCalls] Unknown tool: ${toolCall.name}`)
          continue
        }

        // Parse arguments
        const parsedArgs = handler.parseArgs(toolCall.args)
        if (parsedArgs === null) {
          continue
        }

        // Build execution context
        const context: ToolExecutionContext = {
          assistantMessageId,
          signal,
          appendDisplayResults: messageState.appendDisplayResults,
          appendNoResultsMessage: messageState.appendNoResultsMessage,
          executeSearch: search,
          setStreamingDisplay,
          sendFollowUp: createSendFollowUp(previousApiMessages, signal),
        }

        try {
          const result = await handler.execute(parsedArgs, context)

          if (result.suggestions && result.suggestions.length > 0) {
            finalSuggestions = result.suggestions
          }
        } catch (error) {
          console.error(`[executeToolCalls] Error in ${toolCall.name}:`, error)
          throw error
        }
      }

      return { suggestions: finalSuggestions }
    },
    [messageState, search, createSendFollowUp],
  )

  return {
    executeToolCalls,
    streamingDisplay,
  }
}
