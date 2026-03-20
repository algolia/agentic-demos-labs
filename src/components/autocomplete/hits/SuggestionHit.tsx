'use client'

import { Search } from 'lucide-react'
import { Highlight } from 'react-instantsearch'

import type { Hit } from 'instantsearch.js'

interface SuggestionHitProps {
  item: Record<string, unknown>
  onSelect: () => void
}

export const SuggestionHit = ({ item, onSelect }: SuggestionHitProps) => (
  <div
    role="button"
    className="text-foreground hover:bg-muted rounded-button flex cursor-pointer items-center gap-3 px-3 py-2 text-sm transition-colors"
    onClick={onSelect}>
    <Search className="text-muted-foreground h-4 w-4" />
    <Highlight hit={item as Hit<{ query: string }>} attribute="query" />
  </div>
)
