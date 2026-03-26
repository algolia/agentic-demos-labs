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

type ApiMessage = { role: string; [key: string]: unknown }

type SendCompletionFn = (
  messages: ApiMessage[],
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

  // Send a tool result back to the agent (AI SDK v5 format)
  const sendToolResult = useCallback(
    async (
      toolCallId: string,
      toolName: string,
      toolInput: Record<string, unknown>,
      output: unknown,
      options?: SendCompletionOptions & { signal?: AbortSignal },
    ): Promise<StreamResult> => {
      const resultMessage: ApiMessage = {
        role: 'assistant',
        parts: [
          {
            type: `tool-${toolName}`,
            tool_call_id: toolCallId,
            state: 'output-available',
            input: toolInput,
            output,
          },
        ],
      }

      return sendCompletion([resultMessage], options)
    },
    [sendCompletion],
  )

  // Send search results back to agent, handling the displayResults follow-up
  const createSendFollowUp = useCallback(
    (toolCallId: string, toolName: string, toolInput: Record<string, unknown>, signal?: AbortSignal) =>
      async (
        productSummaries: ProductSummary[],
      ): Promise<{ toolCalls: ToolCall[]; suggestions: string[] }> => {
        const result = await sendToolResult(
          toolCallId,
          toolName,
          toolInput,
          productSummaries,
          {
            signal,
            onToolInputDelta: (tcId, tcName, _delta, fullBuffer) => {
              if (tcName === 'displayResults') {
                const extracted = extractDisplayResultsStream(fullBuffer)
                setStreamingDisplay({
                  intro: extracted.intro,
                  groups: extracted.groups,
                  streamingGroup: extracted.streamingGroup,
                  isStreaming: true,
                  toolCallId: tcId,
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
    [sendToolResult],
  )

  // Execute tool calls using the registry
  const executeToolCalls = useCallback(
    async (
      toolCalls: ToolCall[],
      assistantMessageId: string,
      _previousApiMessages: ApiMessage[],
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
          sendFollowUp: createSendFollowUp(toolCall.id, toolCall.name, toolCall.args, signal),
          sendToolResult: async (tcId, tcName, tcInput, output) => {
            const res = await sendToolResult(tcId, tcName, tcInput, output, { signal })
            return { textContent: res.textContent, toolCalls: res.toolCalls, suggestions: res.suggestions }
          },
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
    [messageState, search, createSendFollowUp, sendToolResult],
  )

  return {
    executeToolCalls,
    streamingDisplay,
  }
}
