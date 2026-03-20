'use client'

import { usePathname } from 'next/navigation'

interface UseIsAIAssistantRouteResult {
  isHomepage: boolean
  isValidRoute: boolean
  searchPath: string
}

/**
 * Hook for determining if the current route is valid for displaying the AI Assistant.
 */
const normalizePath = (path: string): string =>
  path.endsWith('/') ? path.slice(0, -1) : path

export const useIsAIAssistantRoute = (
  basePath: string,
): UseIsAIAssistantRouteResult => {
  const pathname = usePathname()

  const searchPath = `${basePath}/search`
  const productPath = `${basePath}/product`
  const orderPath = `${basePath}/order`

  const isHomepage = normalizePath(pathname) === normalizePath(basePath)

  const isValidRoute =
    pathname.startsWith(searchPath) ||
    pathname.startsWith(productPath) ||
    pathname.startsWith(orderPath)

  return {
    isHomepage,
    isValidRoute,
    searchPath,
  }
}
