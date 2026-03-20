import { useCallback, useRef, useState } from 'react'
import { useRange } from 'react-instantsearch'

interface UsePriceRangeSliderOptions {
  attribute?: string
}

export const usePriceRangeSlider = ({
  attribute = 'price',
}: UsePriceRangeSliderOptions = {}) => {
  const { start, range, canRefine, refine } = useRange({ attribute })

  const rangeMin = range.min ?? 0
  const rangeMax = range.max ?? 1000
  const [algoliaMin, algoliaMax] = start

  // Track if user is actively dragging
  const isDragging = useRef(false)
  const [dragMin, setDragMin] = useState<number | null>(null)
  const [dragMax, setDragMax] = useState<number | null>(null)

  // Resolve Algolia values (handle -Infinity/Infinity/undefined)
  const resolvedMin =
    typeof algoliaMin === 'number' && algoliaMin !== -Infinity
      ? algoliaMin
      : rangeMin
  const resolvedMax =
    typeof algoliaMax === 'number' && algoliaMax !== Infinity
      ? algoliaMax
      : rangeMax

  // Use drag values while dragging, otherwise use resolved Algolia values
  const currentMin = dragMin ?? resolvedMin
  const currentMax = dragMax ?? resolvedMax

  const handleMinChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      isDragging.current = true
      const value = Math.min(Number(e.target.value), currentMax - 1)
      setDragMin(value)
    },
    [currentMax],
  )

  const handleMaxChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      isDragging.current = true
      const value = Math.max(Number(e.target.value), currentMin + 1)
      setDragMax(value)
    },
    [currentMin],
  )

  const handleCommit = useCallback(() => {
    if (isDragging.current) {
      refine([currentMin, currentMax])
      isDragging.current = false
      setDragMin(null)
      setDragMax(null)
    }
  }, [currentMin, currentMax, refine])

  // Calculate positions for the filled track
  const minPercent = ((currentMin - rangeMin) / (rangeMax - rangeMin)) * 100
  const maxPercent = ((currentMax - rangeMin) / (rangeMax - rangeMin)) * 100

  return {
    rangeMin,
    rangeMax,
    currentMin,
    currentMax,
    minPercent,
    maxPercent,
    canRefine,
    handleMinChange,
    handleMaxChange,
    handleCommit,
  }
}
