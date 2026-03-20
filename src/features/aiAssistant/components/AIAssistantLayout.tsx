'use client'

import { useAtomValue } from 'jotai'

import { AIAssistantPanel } from '@/features/aiAssistant/components/AIAssistantPanel'
import { useIsAIAssistantRoute } from '@/features/aiAssistant/hooks/useIsAIAssistantRoute'
import {
  isAIAssistantOpenState,
  isAIAssistantExpandedState,
} from '@/features/aiAssistant/stores/aiAssistant'
import { cn } from '@/lib/utils'

interface AIAssistantLayoutProps {
  children: React.ReactNode
  basePath: string
}

export const AIAssistantLayout = ({
  children,
  basePath,
}: AIAssistantLayoutProps) => {
  const isOpen = useAtomValue(isAIAssistantOpenState)
  const isExpanded = useAtomValue(isAIAssistantExpandedState)
  const { isValidRoute, isHomepage } = useIsAIAssistantRoute(basePath)

  // Show panel on valid routes, or on homepage when fullscreen
  const canShowPanel = isValidRoute || (isHomepage && isExpanded)
  const showPanel = isOpen && canShowPanel

  return (
    <div
      className={cn(
        'min-h-[calc(100dvh-var(--header-height,73px))] transition-[padding] duration-300 ease-out',
        showPanel &&
          !isExpanded &&
          'lg:pr-[var(--assistant-panel-width,400px)]',
      )}>
      <div
        className={cn(
          showPanel &&
            !isExpanded &&
            'transition-opacity duration-300 ease-out',
          showPanel &&
            !isExpanded &&
            'pointer-events-none opacity-0 lg:pointer-events-auto lg:opacity-100',
          showPanel && isExpanded && 'pointer-events-none opacity-0',
        )}>
        {children}
      </div>

      {/* AI Assistant Panel - fixed position */}
      {canShowPanel && <AIAssistantPanel basePath={basePath} />}
    </div>
  )
}
