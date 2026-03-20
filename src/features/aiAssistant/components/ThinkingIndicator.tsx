'use client'

import { useTypingEffect } from '@/features/aiAssistant/hooks/useTypingEffect'

const THINKING_MESSAGES = [
  'Thinking...',
  'Searching our catalog...',
  'Preparing your results...',
]

export const ThinkingIndicator = () => {
  const displayedText = useTypingEffect(THINKING_MESSAGES, {
    typingSpeed: 30,
    deletingSpeed: 20,
    pauseDuration: 3000,
  })

  return (
    <div className="flex items-center space-x-2">
      <div className="h-3 w-3 animate-pulse rounded-full bg-gray-400" />
      <span
        className="animate-shimmer bg-linear-to-r from-gray-500 via-gray-400 to-gray-500 text-xs font-medium text-gray-500"
        style={{
          backgroundSize: '400% 100%',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>
        {displayedText}
        <span className="animate-pulse">|</span>
      </span>
    </div>
  )
}
