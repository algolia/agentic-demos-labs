'use client'

import { useRef, useEffect, type RefObject } from 'react'

const DEFAULT_HEADER_HEIGHT = 73

const getHeaderHeight = (): number => {
  if (typeof window === 'undefined') return DEFAULT_HEADER_HEIGHT
  const value = getComputedStyle(document.documentElement).getPropertyValue(
    '--header-height',
  )
  return parseInt(value, 10) || DEFAULT_HEADER_HEIGHT
}

/**
 * Hook to calculate sticky offset and available height for the AI panel.
 * Applies styles directly to the DOM via ref to avoid React re-render lag.
 */
export const useStickyOffset = (
  isFullscreen: boolean,
): RefObject<HTMLDivElement | null> => {
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const panel = panelRef.current
    if (!panel || isFullscreen) return

    const headerHeight = getHeaderHeight()

    const calculateLayout = () => {
      const scrollY = window.scrollY
      const viewportHeight = window.innerHeight
      const newOffset = Math.max(0, headerHeight - scrollY)

      panel.style.top = `${newOffset}px`

      const footer = document.getElementById('site-footer')
      if (footer) {
        const footerRect = footer.getBoundingClientRect()
        if (footerRect.top < viewportHeight) {
          const availableSpace = Math.max(0, footerRect.top - newOffset)
          panel.style.height = `${availableSpace}px`
        } else {
          panel.style.height = `calc(100dvh - ${newOffset}px)`
        }
      } else {
        panel.style.height = `calc(100dvh - ${newOffset}px)`
      }
    }

    window.addEventListener('scroll', calculateLayout, { passive: true })
    window.addEventListener('resize', calculateLayout, { passive: true })
    calculateLayout()

    return () => {
      window.removeEventListener('scroll', calculateLayout)
      window.removeEventListener('resize', calculateLayout)
    }
  }, [isFullscreen])

  return panelRef
}
