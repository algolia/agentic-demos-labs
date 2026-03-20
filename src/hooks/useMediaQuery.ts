import { useCallback, useSyncExternalStore } from 'react'

/**
 * Hook to detect if a CSS media query matches.
 * Uses useSyncExternalStore for proper SSR hydration.
 *
 * @example
 * const isMobile = useMediaQuery('(max-width: 1023px)')
 */
export const useMediaQuery = (query: string): boolean => {
  const subscribe = useCallback(
    (callback: () => void) => {
      const mediaQuery = window.matchMedia(query)
      mediaQuery.addEventListener('change', callback)
      return () => mediaQuery.removeEventListener('change', callback)
    },
    [query],
  )

  const getSnapshot = () => window.matchMedia(query).matches

  // Return false on server to avoid hydration mismatch
  const getServerSnapshot = () => false

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
