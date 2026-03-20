'use client'

import { motion } from 'motion/react'

import { EASE_SMOOTH } from '@/lib/animations'

interface SuggestionButtonsProps {
  suggestions: string[]
  onSuggestionClick: (suggestion: string) => void
  disabled: boolean
}

export const SuggestionButtons = ({
  suggestions,
  onSuggestionClick,
  disabled,
}: SuggestionButtonsProps) => {
  if (suggestions.length === 0) return null

  return (
    <motion.div
      className="flex flex-wrap gap-2"
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: 0.05 } },
      }}>
      {suggestions.map((suggestion, index) => (
        <motion.button
          key={index}
          onClick={() => onSuggestionClick(suggestion)}
          disabled={disabled}
          variants={{
            hidden: { opacity: 0, scale: 0.9, y: 4 },
            visible: {
              opacity: 1,
              scale: 1,
              y: 0,
              transition: { duration: 0.2, ease: EASE_SMOOTH },
            },
          }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="border-border bg-background text-foreground hover:bg-muted hover:border-primary/50 rounded-full border px-3 py-1.5 text-xs transition-colors disabled:cursor-not-allowed disabled:opacity-50">
          {suggestion}
        </motion.button>
      ))}
    </motion.div>
  )
}
