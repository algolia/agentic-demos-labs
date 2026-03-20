'use client'

import { AnimatePresence, motion } from 'motion/react'

import { ProductCard } from '@/features/aiAssistant/components/messages/ProductCard'
import { ProductGroup } from '@/features/aiAssistant/components/messages/ProductGroup'
import type {
  DisplayGroup,
  PartialDisplayGroup,
} from '@/features/aiAssistant/types'
import { EASE_SMOOTH } from '@/lib/animations'

interface StreamingGroupProps {
  group: PartialDisplayGroup
}

/**
 * Streaming (partial) group with products appearing one by one.
 * Uses horizontal carousel layout matching ProductGroup.
 */
const StreamingGroup = ({ group }: StreamingGroupProps) => (
  <div className="space-y-3">
    {/* Group header */}
    <div>
      <h4 className="text-sm font-semibold">{group.title || '...'}</h4>
      {group.why && (
        <p className="text-muted-foreground text-xs">{group.why}</p>
      )}
    </div>

    {/* Horizontal scroll container */}
    <div className="-mx-4 px-4">
      <div className="scrollbar-hide flex gap-3 overflow-x-auto pb-2">
        <AnimatePresence initial={false}>
          {group.products.map((product) => (
            <motion.div
              key={product.objectID}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2, ease: EASE_SMOOTH }}
              className="shrink-0">
              <ProductCard product={product} />
            </motion.div>
          ))}
        </AnimatePresence>
        {/* Loading skeleton for next product - matches ProductCard style */}
        <div className="border-border w-40 shrink-0 animate-pulse overflow-hidden rounded-lg border">
          <div className="bg-card h-40 w-full" />
          <div className="bg-muted space-y-1.5 p-3">
            <div className="bg-background/50 h-2.5 w-12 rounded" />
            <div className="bg-background/50 h-3 w-full rounded" />
            <div className="bg-background/50 h-3.5 w-14 rounded" />
          </div>
        </div>
      </div>
    </div>
  </div>
)

interface StreamingDisplayResultsProps {
  intro: string
  groups: DisplayGroup[]
  streamingGroup: PartialDisplayGroup | null
}

/**
 * Progressive streaming display with partial groups.
 * Shows completed groups and currently streaming group with loading indicators.
 */
export const StreamingDisplayResults = ({
  intro,
  groups,
  streamingGroup,
}: StreamingDisplayResultsProps) => (
  <div className="space-y-3">
    {/* Intro as its own bubble */}
    {intro && (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, ease: EASE_SMOOTH }}
        className="bg-muted text-foreground rounded-lg px-4 py-2">
        <p className="text-sm font-medium">{intro}</p>
      </motion.div>
    )}

    {/* Completed groups */}
    {groups.map((group, groupIndex) => (
      <div
        key={groupIndex}
        className="bg-muted text-foreground rounded-lg px-4 py-3">
        <ProductGroup group={group} />
      </div>
    ))}

    {/* Currently streaming group with partial products */}
    {streamingGroup && (
      <div className="bg-muted text-foreground rounded-lg px-4 py-3">
        <StreamingGroup group={streamingGroup} />
      </div>
    )}

    {/* Loading indicator for next group (only if no streaming group) */}
    {!streamingGroup && (
      <div className="px-4 py-2">
        <div className="h-3 w-3 animate-pulse rounded-full bg-gray-400" />
      </div>
    )}
  </div>
)
