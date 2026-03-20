import type { ToolCall } from '@/features/aiAssistant/types'

export interface StreamResult {
  textContent: string
  toolCalls: ToolCall[]
  messageId: string | null
  suggestions: string[]
}

export type OnTextDelta = (text: string) => void

export type OnToolInputDelta = (
  toolCallId: string,
  toolName: string,
  delta: string,
  fullBuffer: string,
) => void

interface ToolInputBuffer {
  toolName: string
  buffer: string
}

export const parseAgentStreamResponse = async (
  reader: ReadableStreamDefaultReader<Uint8Array>,
  onTextDelta: OnTextDelta,
  onToolInputDelta?: OnToolInputDelta,
): Promise<StreamResult> => {
  const decoder = new TextDecoder()
  let buffer = ''
  const toolCalls: ToolCall[] = []
  let textContent = ''
  let messageId: string | null = null
  let streamSuggestions: string[] = []

  const toolInputBuffers = new Map<string, ToolInputBuffer>()

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) {
        break
      }

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6).trim()

          if (data === '[DONE]') {
            return {
              textContent,
              toolCalls,
              messageId,
              suggestions: streamSuggestions,
            }
          }

          try {
            const parsed = JSON.parse(data)

            if (parsed.type === 'start' && parsed.messageId) {
              messageId = parsed.messageId
            }

            if (parsed.type === 'text-delta' && parsed.delta) {
              textContent += parsed.delta
              onTextDelta(parsed.delta)
            }

            if (parsed.type === 'tool-input-start') {
              toolInputBuffers.set(parsed.toolCallId, {
                toolName: parsed.toolName,
                buffer: '',
              })
            }

            if (parsed.type === 'tool-input-delta' && parsed.inputTextDelta) {
              const toolData = toolInputBuffers.get(parsed.toolCallId)
              if (toolData) {
                toolData.buffer += parsed.inputTextDelta
                onToolInputDelta?.(
                  parsed.toolCallId,
                  toolData.toolName,
                  parsed.inputTextDelta,
                  toolData.buffer,
                )
              }
            }

            if (parsed.type === 'tool-input-available') {
              const toolCall: ToolCall = {
                id: parsed.toolCallId,
                name: parsed.toolName,
                args: parsed.input || {},
              }
              toolCalls.push(toolCall)
            }

            if (
              parsed.type === 'data-suggestions' &&
              parsed.data?.suggestions
            ) {
              streamSuggestions = parsed.data.suggestions as string[]
            }
          } catch {
            // Skip non-JSON lines
          }
        }
      }
    }
  } finally {
    reader.releaseLock()
  }

  return { textContent, toolCalls, messageId, suggestions: streamSuggestions }
}
