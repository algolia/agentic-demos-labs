'use client'

import { Sparkles } from 'lucide-react'

import { useOpenAssistantPanel } from '@/features/aiAssistant'

interface AISuggestionsHitProps {
  item: Record<string, unknown>
  basePath: string
  onSelect: () => void
}

export const AISuggestionsHit = ({
  item,
  basePath,
  onSelect,
}: AISuggestionsHitProps) => {
  const { openWithMessage } = useOpenAssistantPanel({ basePath })

  const handleClick = () => {
    // Close the autocomplete dropdown
    onSelect()

    // Open AI assistant in full page with the query
    openWithMessage(String(item.query ?? ''), { expanded: true })
  }

  return (
    <div
      role="button"
      className="text-foreground hover:bg-muted flex cursor-pointer items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors"
      onClick={handleClick}>
      <Sparkles className="text-primary h-4 w-4" />
      <span>{String(item.query)}</span>
    </div>
  )
}
