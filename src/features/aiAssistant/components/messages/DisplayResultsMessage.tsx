'use client'

import { ProductGroup } from '@/features/aiAssistant/components/messages/ProductGroup'
import type { DisplayResultsData } from '@/features/aiAssistant/types'

interface DisplayResultsMessageProps {
  data: DisplayResultsData
}

/**
 * Renders displayResults tool output with intro and product groups.
 * Each group is displayed as a separate bubble.
 * Note: No entrance animation here since content is already shown during streaming.
 */
export const DisplayResultsMessage = ({ data }: DisplayResultsMessageProps) => (
  <div className="space-y-3">
    {/* Intro as its own bubble */}
    {data.intro && (
      <div className="bg-muted text-foreground rounded-lg px-4 py-2">
        <p className="text-sm font-medium">{data.intro}</p>
      </div>
    )}

    {/* Each group as a separate bubble */}
    {data.groups?.map((group, groupIndex) => (
      <div
        key={groupIndex}
        className="bg-muted text-foreground rounded-lg px-4 py-3">
        <ProductGroup group={group} />
      </div>
    ))}
  </div>
)
