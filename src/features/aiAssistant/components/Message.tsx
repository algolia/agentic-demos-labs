'use client'

import { motion } from 'motion/react'

import { DisplayResultsMessage } from '@/features/aiAssistant/components/messages/DisplayResultsMessage'
import { OrderContextCard } from '@/features/aiAssistant/components/messages/OrderContextCard'
import { TextMessage } from '@/features/aiAssistant/components/messages/TextMessage'
import type { ChatMessage } from '@/features/aiAssistant/types'
import { EASE_SMOOTH } from '@/lib/animations'
import { cn } from '@/lib/utils'

const messageVariants = {
  initial: (role: 'user' | 'assistant') => {
    return {
      opacity: 0,
      x: role === 'user' ? 12 : -12,
      y: 4,
    }
  },
  animate: {
    opacity: 1,
    x: 0,
    y: 0,
    transition: { duration: 0.25, ease: EASE_SMOOTH },
  },
}

interface MessageProps {
  message: ChatMessage
}

/**
 * Main message component with switch statement for tool types.
 * Renders different components based on message part types.
 *
 * To add a new tool:
 * 1. Add new type to MessagePart.type in types
 * 2. Create new component in messages/
 * 3. Add case to switch below
 */
export const Message = ({ message }: MessageProps) => {
  // Check if message has display_results
  const hasDisplayResults = message.parts.some(
    (p) => p.type === 'display_results',
  )
  // Check if message has any actual text content
  const hasTextContent = message.parts.some((p) => p.type === 'text' && p.text)

  // Skip empty assistant messages (placeholder while streaming)
  if (message.role === 'assistant' && !hasDisplayResults && !hasTextContent) {
    return null
  }

  // Assistant message with display_results - no animation since content was already streamed
  if (message.role === 'assistant' && hasDisplayResults) {
    return (
      <div className="flex justify-start">
        <div className="max-w-[90%]">
          {message.parts.map((part, index) => {
            switch (part.type) {
              case 'text':
                if (!part.text) return null
                return (
                  <div
                    key={index}
                    className="bg-muted text-foreground mb-3 rounded-lg px-4 py-2">
                    <span className="text-sm whitespace-pre-wrap">
                      {part.text}
                    </span>
                  </div>
                )

              case 'display_results':
                if (!part.displayData) return null
                return (
                  <DisplayResultsMessage key={index} data={part.displayData} />
                )

              // Future tools - just add a case:
              // case 'comparison':
              //   return <ComparisonMessage key={index} data={part.comparisonData} />

              default:
                return null
            }
          })}
        </div>
      </div>
    )
  }

  // Check for order context (shown above user message)
  const orderContextPart = message.parts.find((p) => p.type === 'order_context')
  const textPart = message.parts.find((p) => p.type === 'text' && p.text)

  // User message with order context - special layout
  if (message.role === 'user' && orderContextPart?.orderContext) {
    return (
      <motion.div
        className="flex flex-col items-end"
        variants={messageVariants}
        initial="initial"
        animate="animate"
        custom={message.role}>
        <div className="max-w-[90%]">
          <OrderContextCard data={orderContextPart.orderContext} />
          {textPart?.text && (
            <TextMessage text={textPart.text} role={message.role} />
          )}
        </div>
      </motion.div>
    )
  }

  // Regular message (user or simple assistant text)
  return (
    <motion.div
      className={cn(
        'flex',
        message.role === 'user' ? 'justify-end' : 'justify-start',
      )}
      variants={messageVariants}
      initial="initial"
      animate="animate"
      custom={message.role}>
      {message.parts.map((part, index) => {
        switch (part.type) {
          case 'text':
            if (!part.text) return null
            return (
              <TextMessage key={index} text={part.text} role={message.role} />
            )

          default:
            return null
        }
      })}
    </motion.div>
  )
}
