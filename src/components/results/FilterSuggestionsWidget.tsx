'use client'

import { Sparkles } from 'lucide-react'
import { FilterSuggestions } from 'react-instantsearch'

import { cn } from '@/lib/utils'

type Variant = 'standard' | 'editorial'

type ItemProps = {
  suggestion: { label: string; count: number; attribute: string; value: string }
  refine: () => void
}

const FilterSuggestionItem = ({ suggestion, refine }: ItemProps) => (
  <button
    onClick={refine}
    type="button"
    className="border-border bg-muted/50 hover:border-accent hover:bg-accent/5 rounded-badge flex cursor-pointer items-center gap-1 border px-2.5 py-1 text-xs transition-colors">
    <span className="text-foreground capitalize-first">
      {suggestion.label}: {suggestion.value}
    </span>
    <span className="text-muted-foreground/60 text-[10px]">
      ({suggestion.count.toLocaleString()})
    </span>
  </button>
)

const FilterSuggestionItemEditorial = ({ suggestion, refine }: ItemProps) => (
  <button
    onClick={refine}
    type="button"
    className="border-border hover:border-foreground/40 group rounded-button flex cursor-pointer gap-2 border px-3 py-1.5 text-xs tracking-wide uppercase transition-all duration-200">
    <span className="text-foreground/80 group-hover:text-foreground transition-colors">
      {suggestion.label}: {suggestion.value}
    </span>
    <span className="text-foreground/40 group-hover:text-foreground/60 text-[10px] transition-colors">
      ({suggestion.count.toLocaleString()})
    </span>
  </button>
)

const ITEMS: Record<Variant, (props: ItemProps) => JSX.Element> = {
  standard: FilterSuggestionItem,
  editorial: FilterSuggestionItemEditorial,
}

const FilterSuggestionHeader = ({
  uppercase = false,
}: {
  uppercase?: boolean
}) => (
  <div
    className={cn(
      'text-muted-foreground flex shrink-0 items-center gap-2 text-sm',
      uppercase && 'tracking-wide uppercase',
    )}>
    <Sparkles className="text-accent h-4 w-4" />
    <span>Filter suggestions</span>
  </div>
)

const createHeader =
  (uppercase = false) =>
  () => <FilterSuggestionHeader uppercase={uppercase} />

const LAYOUT: Record<
  Variant,
  { root: string; list: string; skeleton: string; skeletonItem: string }
> = {
  standard: {
    root: 'flex items-start justify-start gap-4! rounded-card! bg-muted/50! p-4!',
    list: 'flex flex-wrap gap-2',
    skeleton: 'flex gap-2',
    skeletonItem: 'h-8! w-32! animate-pulse rounded-badge! bg-muted!',
  },
  editorial: {
    root: 'flex-row! flex items-center gap-4! border-y border-border/30 py-4',
    list: 'flex gap-2',
    skeleton: 'flex flex-nowrap! gap-2',
    skeletonItem: 'h-7! w-40! animate-pulse rounded-button! bg-muted/50!',
  },
}

interface Props {
  variant?: Variant
  agentId?: string
  attributes?: string[]
  maxSuggestions?: number
}

export const FilterSuggestionsWidget = ({
  variant = 'standard',
  agentId,
  attributes,
  maxSuggestions = 5,
}: Props) => (
  <FilterSuggestions
    agentId={agentId}
    attributes={attributes}
    maxSuggestions={maxSuggestions}
    itemComponent={ITEMS[variant]}
    headerComponent={createHeader(variant === 'editorial')}
    classNames={LAYOUT[variant]}
    emptyComponent={() => null}
  />
)
