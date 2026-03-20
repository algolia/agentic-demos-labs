import { useCallback, useLayoutEffect, useRef } from 'react'

interface UseAnchorScrollOptions {
  /** Array of messages with id and role */
  messages: Array<{ id: string; role: string }>
  /** Whether the chat is currently loading/streaming */
  isLoading: boolean
  /** Any streaming display state (used to trigger recalculation) */
  streamingDisplay: unknown
}

interface UseAnchorScrollReturn {
  /** Ref to attach to the scrollable container */
  containerRef: React.RefObject<HTMLDivElement | null>
  /** Ref to attach to the spacer div */
  spacerRef: React.RefObject<HTMLDivElement | null>
}

/**
 *
 * When a user sends a message:
 * 1. The user message scrolls to the top of the viewport (with offset)
 * 2. A spacer fills the remaining space below
 * 3. As the response streams, it fills the space progressively
 * 4. Once the response overflows, scroll follows the bottom
 *
 * Usage:
 * - Attach `containerRef` to the scrollable messages wrapper
 * - Attach `spacerRef` to a div at the end of the messages container
 * - Add `data-message-id={message.id}` to each message wrapper
 */
export const useAnchorScroll = ({
  messages,
  isLoading,
  streamingDisplay,
}: UseAnchorScrollOptions): UseAnchorScrollReturn => {
  const containerRef = useRef<HTMLDivElement>(null)
  const spacerRef = useRef<HTMLDivElement>(null)
  const anchorIdRef = useRef<string | null>(null)
  const wasLoadingRef = useRef(false)

  // Offset from top so anchor message isn't flush with container edge
  const SCROLL_OFFSET = 40
  // Container has p-4 (16px) padding that affects available scroll area
  const CONTAINER_PADDING = 16

  const recalcSpacer = useCallback((): number | null => {
    const wrapper = containerRef.current
    const spacer = spacerRef.current
    const anchorId = anchorIdRef.current
    if (!wrapper || !spacer || !anchorId) return null

    const anchor = wrapper.querySelector(
      `[data-message-id="${anchorId}"]`,
    ) as HTMLElement
    if (!anchor) return null

    const lastContent = spacer.previousElementSibling as HTMLElement
    if (!lastContent) return null

    const contentEnd = lastContent.offsetTop + lastContent.offsetHeight
    const contentFromAnchor = contentEnd - anchor.offsetTop
    // Subtract scroll offset and container padding to get correct spacer size
    const needed = Math.max(
      0,
      Math.round(
        wrapper.clientHeight -
          contentFromAnchor -
          SCROLL_OFFSET -
          CONTAINER_PADDING,
      ),
    )

    spacer.style.height = `${needed}px`
    return needed
  }, [])

  useLayoutEffect(() => {
    const wrapper = containerRef.current
    if (!wrapper) return

    // Manage anchor lifecycle based on loading state transitions
    if (isLoading && !wasLoadingRef.current) {
      // Loading just started - set anchor to last user message
      const lastUserMsg = [...messages].reverse().find((m) => m.role === 'user')
      if (lastUserMsg) {
        anchorIdRef.current = lastUserMsg.id
      }
    } else if (!isLoading && wasLoadingRef.current) {
      // Loading just ended - clear anchor
      anchorIdRef.current = null
    }
    wasLoadingRef.current = isLoading

    const anchorId = anchorIdRef.current

    // If no anchor, scroll to bottom (default behavior)
    if (!anchorId) {
      wrapper.scrollTop = wrapper.scrollHeight
      return
    }

    const anchor = wrapper.querySelector(
      `[data-message-id="${anchorId}"]`,
    ) as HTMLElement
    if (!anchor) return

    const spacerVal = recalcSpacer()

    if (spacerVal !== null && spacerVal <= 0) {
      // Response overflows viewport → scroll follows bottom
      wrapper.scrollTop = wrapper.scrollHeight - wrapper.clientHeight
    } else {
      // Response fits → keep anchor at top with smooth animation
      const targetScroll = Math.max(0, anchor.offsetTop - SCROLL_OFFSET)
      wrapper.scrollTo({
        top: targetScroll,
        behavior: 'smooth',
      })
    }
  }, [messages, streamingDisplay, isLoading, recalcSpacer])

  return { containerRef, spacerRef }
}
