'use client'

import { useAtom } from 'jotai'
import { Send, AlertCircle, X } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'

import { Message } from '@/features/aiAssistant/components/Message'
import { StreamingDisplayResults } from '@/features/aiAssistant/components/messages/StreamingDisplayResults'
import { ProductContextCard } from '@/features/aiAssistant/components/ProductContextCard'
import { SuggestionButtons } from '@/features/aiAssistant/components/SuggestionButtons'
import { ThinkingIndicator } from '@/features/aiAssistant/components/ThinkingIndicator'
import { useAgentChat } from '@/features/aiAssistant/hooks/useAgentChat'
import { useAnchorScroll } from '@/features/aiAssistant/hooks/useAnchorScroll'
import {
  initialAIMessageState,
  initialOrderContextState,
} from '@/features/aiAssistant/stores/aiAssistant'
import { cn } from '@/lib/utils'

interface AIAssistantChatProps {
  isExpanded: boolean
}

export const AIAssistantChat = ({ isExpanded }: AIAssistantChatProps) => {
  const [input, setInput] = useState('')
  const [initialMessage, setInitialMessage] = useAtom(initialAIMessageState)
  const [initialOrderContext, setInitialOrderContext] = useAtom(
    initialOrderContextState,
  )
  const processedMessageRef = useRef<string | null>(null)

  const {
    messages,
    status,
    error,
    sendMessage,
    clearError,
    streamingDisplay,
    suggestions,
  } = useAgentChat()

  const isLoading = status === 'streaming' || status === 'awaiting_tool'
  const isError = status === 'error'

  const { containerRef, spacerRef } = useAnchorScroll({
    messages,
    isLoading,
    streamingDisplay,
  })

  // Send initial message from autocomplete AI suggestions (only once).
  // The ref guards against re-processing the same message if the effect re-fires
  // due to sendMessage getting a new reference before initialMessage clears.
  useEffect(() => {
    if (
      initialMessage &&
      initialMessage !== processedMessageRef.current &&
      status === 'idle'
    ) {
      processedMessageRef.current = initialMessage
      const orderContext = initialOrderContext ?? undefined
      setInitialMessage('')
      setInitialOrderContext(null)
      sendMessage(initialMessage, orderContext)
    }
  }, [
    initialMessage,
    initialOrderContext,
    status,
    sendMessage,
    setInitialMessage,
    setInitialOrderContext,
  ])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const message = input
    setInput('')
    await sendMessage(message)
  }

  return (
    <div className="flex h-full flex-col">
      {/* Messages area */}
      <div
        ref={containerRef}
        className={cn(
          'min-h-0 flex-1 space-y-4 overflow-y-auto p-4',
          isExpanded && 'container mx-auto',
        )}>
        {/* Product context card - only shown in fullscreen mode, aligned right like user messages */}
        {isExpanded && <ProductContextCard />}

        {messages.length === 0 && !streamingDisplay && (
          <div className="flex h-full items-center justify-center">
            <p className="text-muted-foreground text-sm">
              Ask me anything about our products!
            </p>
          </div>
        )}

        {/* Render messages using Message component */}
        {messages.map((message) => (
          <div key={message.id} data-message-id={message.id}>
            <Message message={message} />
          </div>
        ))}

        {/* Streaming display - shows groups progressively as separate bubbles */}
        {streamingDisplay && streamingDisplay.isStreaming && (
          <div className="flex justify-start">
            <div className="max-w-[90%]">
              <StreamingDisplayResults
                intro={streamingDisplay.intro}
                groups={streamingDisplay.groups}
                streamingGroup={streamingDisplay.streamingGroup}
              />
            </div>
          </div>
        )}

        {/* Thinking indicator - only show when not streaming groups */}
        {isLoading && !streamingDisplay && (
          <div className="flex justify-start">
            <div className="text-foreground max-w-[80%] px-4 py-2">
              <ThinkingIndicator />
            </div>
          </div>
        )}

        {/* Suggestion buttons - shown after the response */}
        {suggestions.length > 0 && !isLoading && !isError && (
          <SuggestionButtons
            suggestions={suggestions}
            onSuggestionClick={sendMessage}
            disabled={isLoading}
          />
        )}

        {/* Error banner */}
        {isError && error && (
          <div className="bg-destructive/10 border-destructive/20 text-destructive flex items-start gap-3 rounded-lg border p-3">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <div className="flex-1 text-sm">
              <p className="font-medium">Something went wrong</p>
              <p className="text-destructive/80 mt-1">{error}</p>
            </div>
            <button
              type="button"
              onClick={clearError}
              className="hover:bg-destructive/10 shrink-0 cursor-pointer rounded p-1 transition-colors"
              aria-label="Dismiss error">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Spacer for anchor-based scrolling */}
        <div ref={spacerRef} className="mt-0! shrink-0" />
      </div>

      {/* Input area */}
      <div className="border-border shrink-0 border-t">
        <form
          onSubmit={handleSubmit}
          className={cn('flex gap-2 p-4', isExpanded && 'container mx-auto')}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about products..."
            disabled={isLoading}
            className="border-border bg-background text-foreground placeholder:text-muted-foreground focus:ring-primary/20 flex-1 rounded-lg border px-4 py-2 text-sm focus:ring-2 focus:outline-none disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer rounded-lg px-4 py-2 transition-colors disabled:cursor-not-allowed disabled:opacity-50">
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  )
}
