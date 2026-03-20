'use client'

import { cn } from '@/lib/utils'

interface TextMessageProps {
  text: string
  role: 'user' | 'assistant'
}

/**
 * Plain text message bubble.
 * User messages are styled differently from assistant messages.
 */
export const TextMessage = ({ text, role }: TextMessageProps) => (
  <div
    className={cn(
      'max-w-[90%] rounded-lg px-4 py-2',
      role === 'user'
        ? 'bg-primary text-primary-foreground'
        : 'bg-muted text-foreground',
    )}>
    <span className="text-sm whitespace-pre-wrap">{text}</span>
  </div>
)
