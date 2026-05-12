'use client'

import 'instantsearch.css/components/chat.css'

import { Chat } from 'react-instantsearch'

import { ecommerceConfig } from '@/app/config'
import { ChatProductCard } from '@/features/chat/ChatProductCard'

import type { IndexUiState } from 'instantsearch.js'

const getSearchPageURL = (uiState: IndexUiState): string => {
  const query = uiState.query || ''
  return `/search?query=${encodeURIComponent(query)}`
}

export const ChatAssistant = () => {
  const agentId = ecommerceConfig.features.agentStudio.shoppingAssistantAgentID

  if (!agentId) return null

  return (
    <aside className="chat-sidebar" aria-label="AI Assistant">
      <Chat
        agentId={agentId}
        itemComponent={ChatProductCard}
        getSearchPageURL={getSearchPageURL}
        toggleButtonComponent={() => <></>}
        translations={{
          header: {
            title: 'AI Assistant',
          },
          prompt: {
            textareaPlaceholder: 'Ask about products...',
          },
        }}
      />
    </aside>
  )
}
