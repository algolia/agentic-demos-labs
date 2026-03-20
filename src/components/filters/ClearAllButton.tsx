'use client'

import { useClearRefinements } from 'react-instantsearch'

import { cn } from '@/lib/utils'

export const ClearAllButton = () => {
  const { refine, canRefine } = useClearRefinements()
  return (
    <button
      type="button"
      onClick={refine}
      disabled={!canRefine}
      className={cn(
        'text-sm transition-colors',
        canRefine
          ? 'hover:text-accent text-muted-foreground cursor-pointer'
          : 'text-muted-foreground/50',
      )}>
      Clear all
    </button>
  )
}
