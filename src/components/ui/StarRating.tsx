'use client'

import { Star } from 'lucide-react'

import { cn } from '@/lib/utils'

type Size = 'sm' | 'md'

interface StarRatingProps {
  rating?: number
  count?: number
  size?: Size
  showCount?: boolean
  compact?: boolean
  className?: string
}

const SIZE_CLASSES: Record<Size, { star: string; text: string }> = {
  sm: {
    star: 'h-3.5 w-3.5',
    text: 'text-sm',
  },
  md: {
    star: 'h-4 w-4',
    text: 'text-sm',
  },
}

export const StarRating = ({
  rating = 4.8,
  count = 342,
  size = 'sm',
  showCount = true,
  compact = false,
  className,
}: StarRatingProps) => {
  const sizeClasses = SIZE_CLASSES[size]

  return (
    <div className={cn('flex items-center gap-1', className)}>
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={cn(
              sizeClasses.star,
              star <= Math.round(rating)
                ? 'fill-yellow-400 text-yellow-400'
                : 'fill-border text-border',
            )}
          />
        ))}
      </div>
      {compact ? (
        <span className={cn(sizeClasses.text, 'text-muted-foreground')}>
          {rating.toFixed(1)} ({count})
        </span>
      ) : (
        <>
          <span className={cn(sizeClasses.text, 'text-foreground font-medium')}>
            {rating.toFixed(1)}
          </span>
          {showCount && (
            <span className={cn(sizeClasses.text, 'text-muted-foreground')}>
              ({count} reviews)
            </span>
          )}
        </>
      )}
    </div>
  )
}
