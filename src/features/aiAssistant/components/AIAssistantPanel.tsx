'use client'

import { Maximize2, Minimize2, Sparkles, Trash2, X } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'

import { Tooltip } from '@/components/ui/Tooltip'
import { AIAssistantChat } from '@/features/aiAssistant/components/AIAssistantChat'
import { useAgentChat } from '@/features/aiAssistant/hooks/useAgentChat'
import { useAIAssistantPanel } from '@/features/aiAssistant/hooks/useAIAssistantPanel'
import { useBodyScrollLock } from '@/features/aiAssistant/hooks/useBodyScrollLock'
import { useIsAIAssistantRoute } from '@/features/aiAssistant/hooks/useIsAIAssistantRoute'
import { useStickyOffset } from '@/features/aiAssistant/hooks/useStickyOffset'
import {
  DURATION_FAST,
  DURATION_NORMAL,
  EASE_DEFAULT,
  EASE_SMOOTH,
} from '@/lib/animations'
import { cn } from '@/lib/utils'

const CONTENT_FADE_DELAY_RATIO = 0.7

interface AIAssistantPanelProps {
  basePath: string
}

export const AIAssistantPanel = ({ basePath }: AIAssistantPanelProps) => {
  const {
    isOpen,
    isExpanded,
    isMobile,
    handleClose,
    handleToggleExpand,
    width,
    clipPath,
  } = useAIAssistantPanel()
  const { isHomepage } = useIsAIAssistantRoute(basePath)
  const isFullscreenOnly = isHomepage && isExpanded
  const { messages, resetChat } = useAgentChat()
  const isFullscreen = isExpanded || isMobile
  const panelRef = useStickyOffset(isFullscreen)

  // Lock body scroll when assistant is fullscreen or on mobile
  useBodyScrollLock(isOpen && (isExpanded || isMobile))

  return (
    <motion.div
      ref={panelRef}
      initial={false}
      animate={{ width, clipPath }}
      transition={{
        width: { duration: DURATION_NORMAL, ease: EASE_DEFAULT },
        clipPath: { duration: DURATION_NORMAL * 1.1, ease: EASE_SMOOTH },
      }}
      style={{
        top: isFullscreen ? 0 : undefined,
        height: isFullscreen ? '100dvh' : undefined,
      }}
      className={cn(
        'border-border fixed right-0 z-50 flex shrink-0 flex-col overflow-hidden bg-white',
        isMobile && 'inset-x-0',
        (isMobile || isExpanded) && 'z-10001',
        isOpen && !isMobile && !isExpanded && 'border-l',
      )}>
      {isOpen && (
        <>
          <div className="border-border bg-background shrink-0 border-b">
            <div
              className={cn(
                'flex items-center justify-between px-4 py-3',
                isExpanded && 'container mx-auto',
              )}>
              <motion.h2 className="text-foreground flex items-center font-semibold whitespace-nowrap">
                <AnimatePresence mode="wait">
                  {isExpanded && (
                    <motion.span
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{
                        duration: DURATION_FAST,
                        ease: EASE_DEFAULT,
                      }}>
                      <Sparkles className="text-primary mr-2 h-4 w-4" />
                    </motion.span>
                  )}
                </AnimatePresence>
                AI Assistant
              </motion.h2>
              <div className="flex items-center gap-1">
                {!isFullscreenOnly && (
                  <Tooltip
                    content={isExpanded ? 'Minimize panel' : 'Expand panel'}>
                    <button
                      onClick={handleToggleExpand}
                      className="hover:bg-muted hidden cursor-pointer rounded-md p-2 transition-colors lg:block"
                      aria-label={
                        isExpanded ? 'Minimize panel' : 'Expand panel'
                      }>
                      {isExpanded ? (
                        <Minimize2 className="text-muted-foreground h-4 w-4" />
                      ) : (
                        <Maximize2 className="text-muted-foreground h-4 w-4" />
                      )}
                    </button>
                  </Tooltip>
                )}
                {messages.length > 0 && (
                  <Tooltip content="Clear conversation">
                    <button
                      onClick={resetChat}
                      className="hover:bg-muted cursor-pointer rounded-md p-2 transition-colors"
                      aria-label="Clear conversation">
                      <Trash2 className="text-muted-foreground h-4 w-4" />
                    </button>
                  </Tooltip>
                )}
                <Tooltip content="Close panel">
                  <button
                    onClick={handleClose}
                    className="hover:bg-muted cursor-pointer rounded-md p-2 transition-colors"
                    aria-label="Close panel">
                    <X className="text-muted-foreground h-4 w-4" />
                  </button>
                </Tooltip>
              </div>
            </div>
          </div>

          <motion.div
            className="h-full min-h-0 flex-1 overflow-hidden bg-white"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{
              duration: DURATION_NORMAL + 0.05,
              delay: DURATION_NORMAL * CONTENT_FADE_DELAY_RATIO,
              ease: EASE_DEFAULT,
            }}>
            <AIAssistantChat isFullscreen={isFullscreen} />
          </motion.div>
        </>
      )}
    </motion.div>
  )
}
