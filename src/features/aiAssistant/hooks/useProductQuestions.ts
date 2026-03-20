'use client'

import { useQuery } from '@tanstack/react-query'
import { useAtomValue } from 'jotai'

import { parseAgentStreamResponse } from '@/features/aiAssistant/streaming/agentStreamParser'
import { activeConfigAtom } from '@/stores/activeConfig'

interface UseProductQuestionsProps {
  productName: string
  productData?: Record<string, unknown>
}

const TOOL_NAME = 'suggest_questions'

export const useProductQuestions = ({
  productName,
  productData,
}: UseProductQuestionsProps) => {
  const config = useAtomValue(activeConfigAtom)
  const agentId = config?.features.agentStudio.questionSuggestionsAgentID
  const appId = config?.algolia.appId
  const apiKey = config?.algolia.apiKey

  const { data: questions = [], isPending } = useQuery({
    queryKey: ['productQuestions', productName],
    queryFn: async ({ signal }) => {
      if (!appId || !apiKey || !agentId) {
        throw new Error('Missing config')
      }

      const url = `https://${appId}.algolia.net/agent-studio/1/agents/${agentId}/completions?stream=true&compatibilityMode=ai-sdk-5`

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-algolia-application-id': appId,
          'x-algolia-api-key': apiKey,
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'user',
              parts: [
                {
                  text: `Generate questions for: ${JSON.stringify({ name: productName, brand: productData?.brand, category: productData?.category })}`,
                },
              ],
            },
          ],
        }),
        signal,
      })

      if (!response.ok || !response.body) {
        throw new Error(`Failed: ${response.status}`)
      }

      const result = await parseAgentStreamResponse(
        response.body.getReader(),
        () => {},
      )

      const questions = result.toolCalls
        .filter((t) => t.name === TOOL_NAME)
        .map((t) => t.args?.question as string)
        .filter(Boolean)
        .slice(0, 3)

      if (questions.length > 0) {
        return questions
      }

      throw new Error('No questions returned')
    },
    enabled: !!agentId && !!appId && !!apiKey,
    staleTime: 1000 * 60 * 30,
    retry: false,
  })

  return {
    questions,
    isLoading: isPending && !!agentId,
  }
}
