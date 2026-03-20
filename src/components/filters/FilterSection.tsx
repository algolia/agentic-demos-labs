'use client'

import { Plus } from 'lucide-react'
import { motion } from 'motion/react'
import { useState } from 'react'
import { RefinementList } from 'react-instantsearch'

import { EASE_SMOOTH } from '@/lib/animations'

interface FilterSectionProps {
  title: string
  attribute: string
  defaultOpen?: boolean
}

export const FilterSection = ({
  title,
  attribute,
  defaultOpen = true,
}: FilterSectionProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div className="border-border border-b py-4">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full cursor-pointer items-center justify-between text-left">
        <span className="text-foreground font-medium capitalize">{title}</span>
        <motion.div
          animate={{ rotate: isOpen ? 225 : 0 }}
          transition={{ duration: 0.3, ease: EASE_SMOOTH }}>
          <Plus className="text-muted-foreground h-4 w-4" />
        </motion.div>
      </button>
      {/* Keep RefinementList mounted to prevent InstantSearch re-renders */}
      <motion.div
        initial={false}
        animate={{
          height: isOpen ? 'auto' : 0,
          opacity: isOpen ? 1 : 0,
        }}
        transition={{ duration: 0.2, ease: EASE_SMOOTH }}
        className="overflow-hidden">
        <div className="pt-3">
          <RefinementList
            attribute={attribute}
            classNames={{
              list: 'space-y-3',
              item: 'group flex items-center justify-between',
              label:
                'cursor-pointer text-sm text-muted-foreground transition-colors hover:text-foreground group-has-checked:font-medium group-has-checked:text-foreground',
              checkbox: 'hidden',
              count: 'text-xs text-muted-foreground/70',
            }}
          />
        </div>
      </motion.div>
    </div>
  )
}
