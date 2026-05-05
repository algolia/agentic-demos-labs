'use client'

/**
 * ChatStepIndicator — Custom loader shown while the agent is processing.
 *
 * Replaces the default Chat widget loader via `messagesLoaderComponent`.
 * Shows an animated pulsing dot with "Thinking..." text, matching the
 * design language of the chat panel.
 *
 * The Chat widget automatically shows/hides this component:
 * - Shown when waiting for the agent's response
 * - Hidden once the agent starts streaming text or tool calls
 */

import { motion } from 'motion/react'

export const ChatStepIndicator = () => (
  <article className="ais-ChatMessage ais-ChatMessage--left">
    <div className="flex items-center gap-2.5 px-2 py-3">
      {/* Animated pulsing dot */}
      <motion.div
        className="h-3 w-3 rounded-full bg-muted-foreground/40"
        animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
      />
      <span className="text-sm text-muted-foreground">Thinking...</span>
    </div>
  </article>
)
