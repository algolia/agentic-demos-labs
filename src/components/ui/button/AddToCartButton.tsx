'use client'

import { Check, ShoppingCart } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useState } from 'react'

import { Button } from '@/components/ui/button/Button'
import {
  CLIP_PATH_HIDDEN_BOTTOM,
  CLIP_PATH_VISIBLE,
  EASE_DEFAULT,
  EASE_SMOOTH,
} from '@/lib/animations'
import { cn } from '@/lib/utils'

interface AddToCartButtonProps {
  onAdd: () => void
  className?: string
  compact?: boolean
}

const ADDED_DURATION = 1500

export const AddToCartButton = ({
  onAdd,
  className,
  compact,
}: AddToCartButtonProps) => {
  const [isAdded, setIsAdded] = useState(false)

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (isAdded) return
    onAdd()
    setIsAdded(true)
    setTimeout(() => setIsAdded(false), ADDED_DURATION)
  }

  if (compact) {
    return (
      <Button
        onClick={handleClick}
        size="icon"
        className={cn(
          'h-8 w-8 rounded-full',
          isAdded && 'bg-success text-success-foreground',
          className,
        )}>
        {isAdded ? (
          <Check className="h-4 w-4" />
        ) : (
          <ShoppingCart className="h-4 w-4" />
        )}
      </Button>
    )
  }

  return (
    <motion.div
      animate={isAdded ? { scale: [1, 1.03, 1] } : {}}
      transition={{ duration: 0.2, ease: EASE_DEFAULT }}
      className={cn('relative', className)}>
      {/* Base background */}
      <div className="bg-accent rounded-button absolute inset-0" />
      {/* Success background overlay with clip-path reveal */}
      <motion.div
        initial={false}
        animate={{
          clipPath: isAdded ? CLIP_PATH_VISIBLE : CLIP_PATH_HIDDEN_BOTTOM,
        }}
        transition={{ duration: 0.25, ease: EASE_SMOOTH }}
        className="bg-success rounded-button absolute inset-0"
      />
      <Button
        onClick={handleClick}
        className={cn(
          'rounded-button relative w-full gap-2 bg-transparent py-6 hover:bg-transparent',
          isAdded && 'text-success-foreground',
        )}>
        <AnimatePresence mode="wait" initial={false}>
          {isAdded ? (
            <motion.span
              key="check"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.1 }}
              className="flex items-center gap-2">
              <Check className="h-5 w-5" />
              Added!
            </motion.span>
          ) : (
            <motion.span
              key="cart"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.1 }}
              className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Add to Cart
            </motion.span>
          )}
        </AnimatePresence>
      </Button>
    </motion.div>
  )
}
