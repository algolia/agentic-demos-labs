'use client'

import { useState, useEffect, useRef } from 'react'

interface TypingEffectOptions {
  typingSpeed?: number
  deletingSpeed?: number
  pauseDuration?: number
}

export const useTypingEffect = (
  messages: string[],
  options: TypingEffectOptions = {},
): string => {
  const { typingSpeed = 30, deletingSpeed = 20, pauseDuration = 3000 } = options

  const [displayedText, setDisplayedText] = useState('')
  const [messageIndex, setMessageIndex] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isPaused, setIsPaused] = useState(false)

  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (messages.length === 0) return

    const currentMessage = messages[messageIndex]

    const tick = () => {
      if (isPaused) {
        // After pause, start deleting
        timeoutRef.current = setTimeout(() => {
          setIsPaused(false)
          setIsDeleting(true)
        }, pauseDuration)
        return
      }

      if (isDeleting) {
        // Delete characters
        if (displayedText.length > 0) {
          setDisplayedText((prev) => prev.slice(0, -1))
          timeoutRef.current = setTimeout(tick, deletingSpeed)
        } else {
          // Move to next message
          setIsDeleting(false)
          setMessageIndex((prev) => (prev + 1) % messages.length)
        }
      } else {
        // Type characters
        if (displayedText.length < currentMessage.length) {
          setDisplayedText((prev) => currentMessage.slice(0, prev.length + 1))
          timeoutRef.current = setTimeout(tick, typingSpeed)
        } else {
          // Finished typing, pause before deleting
          setIsPaused(true)
          timeoutRef.current = setTimeout(tick, 0)
        }
      }
    }

    timeoutRef.current = setTimeout(
      tick,
      isDeleting ? deletingSpeed : typingSpeed,
    )

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [
    displayedText,
    messageIndex,
    isDeleting,
    isPaused,
    messages,
    typingSpeed,
    deletingSpeed,
    pauseDuration,
  ])

  return displayedText
}
