'use client'

import { Plus } from 'lucide-react'
import { useState } from 'react'
import { RefinementList } from 'react-instantsearch'

import { cn } from '@/lib/utils'

interface SizeFacetProps {
  title: string
  attribute: string
  defaultOpen?: boolean
}

export const SizeFacet = ({
  title,
  attribute,
  defaultOpen = true,
}: SizeFacetProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div className="border-border border-b py-4">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full cursor-pointer items-center justify-between text-left">
        <span className="text-foreground font-medium capitalize">{title}</span>
        <Plus
          className={cn(
            'text-muted-foreground h-4 w-4 transition-transform duration-500 ease-in-out',
            isOpen && 'rotate-225',
          )}
        />
      </button>
      <div
        className={cn(
          'grid transition-all duration-200',
          isOpen
            ? 'mt-3 grid-rows-[1fr] opacity-100'
            : 'grid-rows-[0fr] opacity-0',
        )}>
        <div className="overflow-hidden">
          <RefinementList
            attribute={attribute}
            classNames={{
              list: 'grid grid-cols-3 gap-2',
              item: 'group',
              label: cn(
                'flex cursor-pointer items-center justify-center rounded-button border border-border px-3 py-2.5 text-sm transition-all',
                'hover:border-foreground/30',
                'group-has-checked:border-accent group-has-checked:bg-accent/5 group-has-checked:text-foreground',
              ),
              checkbox: 'hidden',
              count: 'hidden',
            }}
          />
        </div>
      </div>
    </div>
  )
}
