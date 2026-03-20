import { atom } from 'jotai'

import type {
  ChatMessage,
  OrderContextData,
} from '@/features/aiAssistant/types'

export const isAIAssistantOpenState = atom<boolean>(false)
export const isAIAssistantExpandedState = atom<boolean>(false)
export const initialAIMessageState = atom<string>('')
export const initialOrderContextState = atom<OrderContextData | null>(null)
export const collectedObjectIDsState = atom<string[]>([])
export const chatMessagesState = atom<ChatMessage[]>([])
export const suggestionsState = atom<string[]>([])

/**
 * Product context for PDP pages.
 * Contains the full Algolia record when viewing a product page.
 * Set to null when not on a PDP.
 */
export const productContextState = atom<Record<string, unknown> | null>(null)
