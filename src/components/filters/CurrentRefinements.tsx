'use client'

import { X } from 'lucide-react'
import { useCurrentRefinements } from 'react-instantsearch'

export const CurrentRefinements = () => {
  const { items, refine } = useCurrentRefinements()

  if (!items.length) return null

  return (
    <div className="mb-4 flex flex-wrap gap-2">
      {items.map((item) => (
        <div
          key={item.attribute}
          className="border-accent/30 bg-accent/5 rounded-badge flex items-center gap-1 border px-3 py-1.5 text-sm">
          <span className="text-muted-foreground capitalize">
            {item.label}:
          </span>
          <span className="text-foreground capitalize-first">
            {item.refinements.map((r) => r.label).join(', ')}
          </span>
          <button
            type="button"
            onClick={() => item.refinements.forEach((r) => refine(r))}
            className="hover:text-accent ml-1 cursor-pointer transition-colors">
            <X className="text-accent h-3.5 w-3.5" />
          </button>
        </div>
      ))}
    </div>
  )
}
