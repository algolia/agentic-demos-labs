'use client'

import { Plus } from 'lucide-react'
import { motion } from 'motion/react'
import { useState } from 'react'

import { EASE_SMOOTH } from '@/lib/animations'
import { cn } from '@/lib/utils'

interface AccordionItemProps {
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
  className?: string
}

export const AccordionItem = ({
  title,
  children,
  defaultOpen = false,
  className,
}: AccordionItemProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div className={cn('border-border border-b', className)}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full cursor-pointer items-center justify-between py-4 text-left">
        <span className="text-foreground font-medium">{title}</span>
        <motion.div
          animate={{ rotate: isOpen ? 225 : 0 }}
          transition={{ duration: 0.3, ease: EASE_SMOOTH }}>
          <Plus className="text-muted-foreground h-4 w-4" />
        </motion.div>
      </button>
      <motion.div
        initial={false}
        animate={{
          height: isOpen ? 'auto' : 0,
          opacity: isOpen ? 1 : 0,
        }}
        transition={{ duration: 0.2, ease: EASE_SMOOTH }}
        className="overflow-hidden">
        <div className="text-muted-foreground pb-4 text-sm">{children}</div>
      </motion.div>
    </div>
  )
}
