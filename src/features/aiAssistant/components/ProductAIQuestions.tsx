'use client'

import { Sparkles } from 'lucide-react'

import { useOpenAssistantPanel } from '@/features/aiAssistant/hooks/useOpenAssistantPanel'
import { useProductQuestions } from '@/features/aiAssistant/hooks/useProductQuestions'

interface ProductAIQuestionsProps {
  productName: string
  basePath: string
  productData?: Record<string, unknown>
}

export const ProductAIQuestions = ({
  productName,
  basePath,
  productData,
}: ProductAIQuestionsProps) => {
  const { openWithMessage } = useOpenAssistantPanel({ basePath })
  const { questions, isLoading } = useProductQuestions({
    productName,
    productData,
  })

  // Don't render if no questions and not loading
  if (!isLoading && questions.length === 0) return null

  const skeletonCount = isLoading ? Math.max(0, 3 - questions.length) : 0

  return (
    <div className="border-border mt-4 border-t pt-6">
      <div className="mb-4 flex items-center gap-2">
        <Sparkles className="text-accent h-4 w-4" />
        <span className="text-sm font-medium">AI Suggestions</span>
      </div>
      <div className="flex flex-col gap-2">
        {questions.map((question, index) => (
          <button
            key={index}
            onClick={() =>
              openWithMessage(question, {
                clearHistory: false,
                expanded: false,
                navigate: false,
              })
            }
            className="border-border hover:border-primary hover:bg-primary/5 text-muted-foreground hover:text-foreground cursor-pointer rounded-lg border px-4 py-3 text-left text-sm transition-colors">
            {question}
          </button>
        ))}
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <div
            key={`skeleton-${i}`}
            className="border-border bg-muted/30 h-12 animate-pulse rounded-lg border"
          />
        ))}
      </div>

      <button
        type="button"
        onClick={() =>
          openWithMessage('', {
            clearHistory: false,
            expanded: false,
            navigate: false,
          })
        }
        className="border-accent/50 hover:border-accent hover:bg-accent/5 rounded-button mt-4 flex w-full cursor-pointer items-center justify-center gap-2 border bg-transparent px-4 py-3 text-sm font-medium transition-colors">
        <Sparkles className="text-accent h-4 w-4" />
        Ask anything about this product
      </button>
    </div>
  )
}
