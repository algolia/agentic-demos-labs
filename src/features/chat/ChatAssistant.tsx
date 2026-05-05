'use client'

/**
 * ChatAssistant — The main AI shopping assistant sidebar.
 *
 * This component integrates Algolia Agent Studio into your app using the official
 * `<Chat>` widget from `react-instantsearch`. Unlike the default floating overlay
 * behavior, we embed the widget inside a sidebar that is **part of the page
 * layout** — when opened, it slides in from the right and pushes the main content
 * to the left, just like a native app panel.
 *
 * ## Architecture
 *
 * The Chat widget manages its own internal open/close state. We observe its DOM
 * (the `--open` class on the container) and sync that with a Jotai atom
 * (`isChatOpenAtom`) so the parent layout can react by adjusting the flex columns.
 *
 * ## How it works
 *
 * 1. The `<Chat>` widget reads your Algolia credentials from the parent
 *    `<InstantSearch>` provider — no need to pass them again.
 *
 * 2. When a user sends a message, the widget calls the Agent Studio completions
 *    API using server-sent events (SSE) for real-time streaming.
 *
 * 3. If your agent uses tools (e.g., `displayResults`), the widget executes them
 *    client-side and sends results back to the agent.
 *
 * 4. Product results are rendered using your custom `itemComponent`.
 *
 * @see https://www.algolia.com/doc/api-reference/widgets/chat/react
 */

// The Chat widget's base CSS — provides layout, animations, and default styling.
// We layer our theme overrides on top in globals.css.
import 'instantsearch.css/components/chat.css'

import { useSetAtom } from 'jotai'
import { useEffect, useRef } from 'react'
import { Chat } from 'react-instantsearch'

import { ecommerceConfig } from '@/app/config'
import { ChatProductCard } from '@/features/chat/ChatProductCard'
import { ChatStepIndicator } from '@/features/chat/ChatStepIndicator'
import { DisplayResults } from '@/features/chat/DisplayResults'
import { isChatOpenAtom } from '@/features/chat/stores/chatPanel'

import type { IndexUiState } from 'instantsearch.js'
import type { Tools } from 'react-instantsearch'

const getSearchPageURL = (uiState: IndexUiState): string => {
  const query = uiState.query || ''
  return `/search?query=${encodeURIComponent(query)}`
}

/**
 * Client-side tool implementations for Agent Studio.
 *
 * `streamInput: true` opts the tool's `layoutComponent` into the
 * `input-streaming` state, so `DisplayResults` re-renders as the model
 * streams partial input — no SSE interception or DOM injection needed.
 */
const tools: Tools = {
  displayResults: {
    streamInput: true,
    layoutComponent: DisplayResults,
    onToolCall: async ({ input, addToolResult }) => {
      addToolResult({ output: input })
    },
  },
}

/**
 * Hook that watches the Chat widget's DOM for open/close state changes and
 * syncs them to the Jotai atom. The widget adds `ais-Chat-container--open`
 * to its container element when open. We observe that with a MutationObserver.
 */
const useSyncChatOpenState = (containerRef: React.RefObject<HTMLElement | null>) => {
  const setIsOpen = useSetAtom(isChatOpenAtom)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const observer = new MutationObserver(() => {
      const chatContainer = container.querySelector('.ais-Chat-container')
      const isOpen =
        chatContainer?.classList.contains('ais-Chat-container--open') ?? false
      setIsOpen(isOpen)
    })

    observer.observe(container, {
      subtree: true,
      attributes: true,
      attributeFilter: ['class'],
    })

    return () => observer.disconnect()
  }, [containerRef, setIsOpen])
}

export const ChatAssistant = () => {
  const agentId = ecommerceConfig.features.agentStudio.shoppingAssistantAgentID
  const containerRef = useRef<HTMLDivElement>(null)

  useSyncChatOpenState(containerRef)

  /**
   * Graceful degradation: if no agent ID is configured, don't render the widget.
   */
  if (!agentId) return null

  return (
    /**
     * The sidebar container. It sits in the document flow (not fixed/absolute)
     * so it naturally pushes content when it has width. The CSS transition on
     * width creates the smooth slide-in effect.
     *
     * The `chat-sidebar` class in globals.css handles:
     * - Width transitions (0 → var(--assistant-panel-width))
     * - Sticky positioning (sticks below the header while scrolling)
     * - Overflow management
     */
    <aside
      ref={containerRef}
      className="chat-sidebar"
      aria-label="AI Assistant">
      <Chat
        agentId={agentId}
        itemComponent={ChatProductCard}
        getSearchPageURL={getSearchPageURL}
        tools={tools}
        /**
         * Custom loader component that shows contextual step indicators
         * ("Thinking...", "Searching products...", "Organizing results...")
         * instead of the default generic loading animation.
         */
        loaderComponent={ChatStepIndicator}
        translations={{
          header: {
            title: 'AI Assistant',
          },
          prompt: {
            textareaPlaceholder: 'Ask about products...',
          },
        }}
      />
    </aside>
  )
}
