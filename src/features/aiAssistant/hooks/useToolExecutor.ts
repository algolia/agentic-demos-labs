'use client'

import { useState, useCallback } from 'react'

import type { SendCompletionOptions } from '@/features/aiAssistant/hooks/useAgentClient'
import type { MessageStateAPI } from '@/features/aiAssistant/hooks/useMessageState'
import type { StreamResult, OnToolInputDelta } from '@/features/aiAssistant/streaming/agentStreamParser'
import { extractDisplayResultsStream } from '@/features/aiAssistant/tools/parsing/displayResultsParser'
import { getToolHandler } from '@/features/aiAssistant/tools/registry'
import type {
  ToolCall,
  StreamingDisplayState,
  ToolExecutionContext,
} from '@/features/aiAssistant/types'

type ApiMessage = { role: string; [key: string]: unknown }

type SendCompletionFn = (
  messages: ApiMessage[],
  options?: SendCompletionOptions,
) => Promise<StreamResult>

interface UseToolExecutorOptions {
  messageState: MessageStateAPI
  sendCompletion: SendCompletionFn
}

/**
 * Hook for executing tool calls from the agent.
 * Routes tool calls to their handlers via the tool registry.
 */
export const useToolExecutor = ({
  messageState,
  sendCompletion,
}: UseToolExecutorOptions) => {
  const [streamingDisplay, setStreamingDisplay] =
    useState<StreamingDisplayState | null>(null)

  // Handle streaming tool input for progressive display
  const onToolInputDelta: OnToolInputDelta = useCallback(
    (toolCallId, toolName, _delta, fullBuffer) => {
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
    [],
  )

  // Execute tool calls and send results back by updating the last assistant message
  const executeToolCalls = useCallback(
    async (
      toolCalls: ToolCall[],
      assistantMessageId: string,
      textContent: string,
      agentMessageId: string | null,
      signal?: AbortSignal,
    ): Promise<{ suggestions: string[] }> => {
      // Map to collect tool results: toolCallId -> output
      const toolResults = new Map<string, unknown>()
      let finalSuggestions: string[] = []

      for (const toolCall of toolCalls) {
        const handler = getToolHandler(toolCall.name)

        if (!handler) {
          // Skip server-side tools — they're already handled by the agent
          continue
        }

        // Parse arguments
        const parsedArgs = handler.parseArgs(toolCall.args)
        if (parsedArgs === null) {
          toolResults.set(toolCall.id, true)
          continue
        }

        // Build execution context
        const context: ToolExecutionContext = {
          assistantMessageId,
          toolCallId: toolCall.id,
          toolCallArgs: toolCall.args,
          signal,
          appendDisplayResults: messageState.appendDisplayResults,
          appendNoResultsMessage: messageState.appendNoResultsMessage,
          setStreamingDisplay,
        }

        try {
          const result = await handler.execute(parsedArgs, context)
          toolResults.set(toolCall.id, true)

          if (result.suggestions && result.suggestions.length > 0) {
            finalSuggestions = result.suggestions
          }
        } catch (error) {
          console.error(`[executeToolCalls] Error in ${toolCall.name}:`, error)
          toolResults.set(toolCall.id, { error: String(error) })
        }
      }

      // Clear streaming display now that tools are executed
      setStreamingDisplay(null)

      // Only send results back if we handled any client-side tools
      if (toolResults.size === 0) {
        return { suggestions: finalSuggestions }
      }

      // Build the updated assistant message with client-side tool results
      const parts: unknown[] = []

      // Include original text if any
      if (textContent) {
        parts.push({ type: 'text', text: textContent })
      }

      // Only include client-side tool calls (ones we have handlers for) with their results
      for (const toolCall of toolCalls) {
        if (!getToolHandler(toolCall.name)) continue

        parts.push({
          type: `tool-${toolCall.name}`,
          toolCallId: toolCall.id,
          state: 'output-available',
          input: toolCall.args,
          output: toolResults.get(toolCall.id) ?? true,
        })
      }

      const updatedAssistantMessage: ApiMessage = {
        ...(agentMessageId ? { id: agentMessageId } : {}),
        role: 'assistant',
        parts,
      }

      // Send the updated message to the agent
      const agentResponse = await sendCompletion(
        [updatedAssistantMessage],
        { signal },
      )

      if (agentResponse.suggestions.length > 0) {
        finalSuggestions = agentResponse.suggestions
      }

      // Handle any text response from the agent
      if (agentResponse.textContent) {
        messageState.updateAssistantText(
          assistantMessageId,
          textContent
            ? textContent + '\n\n' + agentResponse.textContent
            : agentResponse.textContent,
        )
      }

      return { suggestions: finalSuggestions }
    },
    [messageState, sendCompletion],
  )

  return {
    executeToolCalls,
    streamingDisplay,
    onToolInputDelta,
  }
}
