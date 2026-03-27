# Removed AI Chat Features Reference

This document describes all AI-powered features that were removed from the codebase to allow rebuilding the chat experience from scratch. Use this as a reference to reproduce these features and behaviors.

## Overview

The removed system was a complete AI shopping assistant built with Algolia Agent Studio. It included:

- A side panel chat UI with streaming responses
- Client-side tool execution (search + display results)
- Product context injection from PDP pages
- Post-purchase AI suggestions on order confirmation
- AI-powered autocomplete suggestions
- AI-powered filter suggestions on search pages
- Progressive streaming display of product carousels

---

## 1. AI Assistant Chat Panel

**Files:** `AIAssistantPanel.tsx`, `AIAssistantChat.tsx`, `AIAssistantLayout.tsx`

### Behavior
- A slide-in panel on the right side of the page, toggled via an "AI mode" button in the autocomplete bar
- Could be expanded to fullscreen mode or used as a compact sidebar
- On the homepage, it always opened in expanded/fullscreen mode
- Included a header with expand/minimize, clear conversation, and close buttons
- Body scroll was locked when the panel was fullscreen or on mobile
- The panel used `motion/react` (Framer Motion) for smooth open/close/resize animations with clip-path transitions

### Chat UI (`AIAssistantChat.tsx`)
- Text input at the bottom with send button
- Messages displayed in a scrollable area with auto-scroll anchoring
- Supported message types: text, product display results, order context
- Showed a thinking indicator (animated dots) while the agent was streaming
- Suggestion buttons appeared after agent responses for quick follow-ups
- Error banner with dismiss button for API errors
- Initial messages could be injected from external triggers (autocomplete, PDP questions)

### State Management
- Used Jotai atoms for global state:
  - `isAIAssistantOpenState` — panel open/closed
  - `isAIAssistantExpandedState` — expanded/compact mode
  - `initialAIMessageState` — pre-filled message from external triggers
  - `initialOrderContextState` — order data for post-purchase queries
  - `chatMessagesState` — conversation messages
  - `suggestionsState` — follow-up suggestion buttons
  - `collectedObjectIDsState` — product IDs from displayed results
  - `productContextState` — current PDP product data for context injection

---

## 2. Agent Communication (`useAgentClient`, `useAgentChat`)

### API Integration (`useAgentClient.ts`)
- Called the Agent Studio completions API directly from the browser:
  ```
  POST https://{appId}.algolia.net/agent-studio/1/agents/{agentId}/completions?stream=true&compatibilityMode=ai-sdk-5
  ```
- Headers: `x-algolia-application-id`, `x-algolia-api-key`, `Content-Type: application/json`
- Sent the full message history with each request (no conversation ID)
- Parsed server-sent event (SSE) streams for text deltas, tool calls, and suggestions

### Chat Orchestration (`useAgentChat.ts`)
- Main hook orchestrating the full chat flow:
  1. User sends a message
  2. Build API messages from chat history, converting internal types to API format
  3. Inject product context (PDP data) as a system-like user message if on a product page
  4. Stream the response, updating the assistant message text progressively
  5. If the agent returns tool calls, execute them via the tool executor
  6. Handle suggestions from the agent response
- Managed chat status: `idle`, `streaming`, `awaiting_tool`, `error`

### Message State (`useMessageState.ts`)
- CRUD operations for chat messages using Jotai atoms
- `addUserMessage(text, orderContext?)` — creates a user message with optional order context
- `createAssistantPlaceholder()` — creates an empty assistant message for streaming
- `updateAssistantText(id, text)` — updates streaming text on an assistant message
- `appendDisplayResults(id, data)` — appends product display data to a message
- `appendNoResultsMessage(id)` — appends a "no results found" text message
- `reset()` — clears all messages, suggestions, and collected IDs

---

## 3. Stream Parser (`agentStreamParser.ts`)

### SSE Event Types Handled
- `start` — captures `messageId`
- `text-delta` — progressive text streaming, calls `onTextDelta` callback
- `tool-input-start` — begins buffering tool call input
- `tool-input-delta` — appends to tool input buffer, calls `onToolInputDelta` callback
- `tool-input-available` — finalizes a tool call with `id`, `name`, and `args`
- `data-suggestions` — captures follow-up suggestion strings
- `[DONE]` — signals end of stream

### Return Value (`StreamResult`)
```typescript
{
  textContent: string       // accumulated text
  toolCalls: ToolCall[]     // all tool calls from the stream
  messageId: string | null  // agent message ID
  suggestions: string[]     // follow-up suggestions
}
```

---

## 4. Tool System

### Tool Registry (`registry.ts`)
- Central registry mapping tool names to handlers
- Two tools were registered: `search` and `displayResults`
- `getToolHandler(name)` — looks up a handler by name

### Tool Executor (`useToolExecutor.ts`)
- Iterated over tool calls from the agent response
- Looked up handlers in the registry
- Built an execution context with shared dependencies
- Managed streaming display state for progressive product rendering
- After client-side search, sent results back to the agent as a follow-up user message
- Handled the agent's subsequent `displayResults` tool call

### Search Tool (`searchTool.ts`)
- **Client-side tool** — the agent generated search queries, the frontend executed them against Algolia
- Parsed both `suggestions` and `queries` formats from agent args
- Each query had: `query` (string), optional `filters`, optional `maxPrice`, `category`, `brand`
- Executed searches via `useProductsSearch` hook
- Sent product summaries (objectID, name, price) back to the agent
- The agent then called `displayResults` to organize the results

### Products Search (`useProductsSearch.ts`)
- Used the Algolia lite client (`algoliasearch/lite`) for search
- Executed multiple search queries in parallel via `searchClient.search()`
- Each query: `hitsPerPage: 10`, with optional filters
- Extracted product data (name, image, price, brand) from hits using the hit template config
- Cached product data in React Query (`['product', objectID]`) for ProductCard rendering
- Returned `objectIDs`, `hits`, and `productSummaries` (lightweight version for the agent)

### Display Results Tool (`displayResultsTool.ts`)
- **Client-side tool** — rendered product cards in the chat
- Validated that groups contained actual products (`hasValidProducts`)
- If valid: called `appendDisplayResults` to add product carousels to the message
- If empty: called `appendNoResultsMessage`

### Display Results Data Shape
```typescript
{
  retry?: string          // reason for no results
  intro: string           // brief intro text
  groups: [{
    title: string         // group label (e.g., "High Performance Laptops")
    why: string           // 4-5 word explanation
    products: [{
      objectID: string    // Algolia objectID
      why: string         // 4-5 word explanation of why chosen
    }]
  }]
}
```

---

## 5. Streaming Display (`StreamingDisplayResults`, `displayResultsParser.ts`)

### Progressive Rendering
- As the agent streamed the `displayResults` tool input, the parser extracted partial data
- Product groups appeared one by one as they were parsed from the streaming JSON
- Used regex-based partial JSON parsing to extract:
  - `intro` text
  - Complete groups (fully parsed JSON objects)
  - The currently streaming group (partial, with whatever products were parsed so far)
- Each group and product animated in with Framer Motion (`AnimatePresence`)

### Streaming Display State
```typescript
{
  intro: string
  groups: DisplayGroup[]                    // fully parsed groups
  streamingGroup: PartialDisplayGroup | null // currently streaming group
  isStreaming: boolean
  toolCallId: string | null
}
```

---

## 6. Product Cards & Groups

### ProductCard (`ProductCard.tsx`)
- Compact card (160px wide) displaying product image, brand, name, price
- Read product data from React Query cache (`['product', objectID]`)
- Showed a skeleton/pulse animation while data loaded
- Displayed a "why" badge on the image (e.g., "Great for gaming")
- Included an "Add to Cart" button
- Linked to the product detail page
- Clicking collapsed the expanded AI panel

### ProductGroup (`ProductGroup.tsx`)
- Horizontal scrollable carousel of ProductCards
- Showed group title and "why" explanation
- Limited to `MAX_VISIBLE_PRODUCTS` (6) per group
- Animated entrance with Framer Motion

---

## 7. Product Context Injection

### PDP Context (`useSetProductContext.ts`)
- On product detail pages, set the full Algolia record into `productContextState`
- Cleared the context when navigating away
- When set, the chat prepended a context message:
  ```
  [Context: The user is currently viewing this product page. Here is the full product data: {JSON}]
  ```

### Product AI Questions (`ProductAIQuestions.tsx`, `useProductQuestions.ts`)
- Displayed AI-generated question suggestions on product pages
- Used a separate Agent Studio agent (`questionSuggestionsAgentID`)
- Sent the product name to the agent, received 3 suggested questions
- Questions appeared as clickable buttons that opened the AI panel with the question pre-filled
- Used React Query for caching, with `staleTime: Infinity`

---

## 8. Post-Purchase AI (`PostPurchaseAI.tsx`)

- Displayed on the order confirmation page
- Showed the ordered items as a visual card
- Provided suggested questions about the order (e.g., "How do I set up my new laptop?")
- Clicking a suggestion opened the AI panel with the question and order context
- Order context included: `orderId`, item list with `objectID`, `name`, `image`, `price`

---

## 9. AI Autocomplete Features

### AI Button Injection (`useAIButtonInjection.ts`)
- Injected an "AI mode" button into the autocomplete search bar
- Used DOM manipulation to insert the button after the submit button
- Clicking opened the AI panel (expanded on homepage, compact elsewhere)
- If there was text in the search input, it was sent as the initial AI message

### AI Suggestions in Autocomplete (`AISuggestionsHit.tsx`)
- Displayed AI-generated suggestions in the autocomplete dropdown
- Used the `aiSuggestionsIndex` Algolia index
- Clicking a suggestion opened the AI panel in expanded mode with that query

---

## 10. Filter Suggestions (`FilterSuggestionsWidget.tsx`)

- Displayed on the search/PLP page above the product grid
- Used a separate Agent Studio agent (`filterSuggestionsAgentID`)
- Sent the current search query to the agent
- Agent returned suggested facet filters as clickable pills
- Clicking a suggestion applied the facet refinement to InstantSearch
- Only showed when there was an active search query

---

## 11. UI Utilities

### Anchor Scroll (`useAnchorScroll.ts`)
- Kept the chat scrolled to the bottom as new messages streamed in
- Used a spacer element at the bottom with dynamic height
- ResizeObserver tracked container/content size changes
- Only auto-scrolled if the user was already near the bottom (not manually scrolled up)

### Body Scroll Lock (`useBodyScrollLock.ts`)
- Prevented background page scrolling when the AI panel was fullscreen
- Saved and restored the scroll position
- Applied `overflow: hidden` and `position: fixed` to the body

### Sticky Offset (`useStickyOffset.ts`)
- Calculated the panel's top offset based on the header height
- Used ResizeObserver to track header size changes
- Applied `top` and `height` CSS properties to the panel

### Typing Effect (`useTypingEffect.ts`)
- Animated text appearing character by character
- Used for initial greeting messages or suggestions
- Configurable speed, with faster rendering when text was longer

### Open Assistant Panel (`useOpenAssistantPanel.ts`)
- Utility hook for opening the AI panel with a pre-filled message
- Used by PDP questions, post-purchase AI, and autocomplete AI suggestions
- Set `initialAIMessageState`, then opened the panel

---

## 12. Type Definitions

```typescript
// Message types
interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  parts: MessagePart[]
  createdAt: Date
}

interface MessagePart {
  type: 'text' | 'tool_call' | 'tool_result' | 'display_results' | 'order_context'
  text?: string
  toolCallId?: string
  toolName?: string
  args?: Record<string, unknown>
  result?: unknown
  displayData?: DisplayResultsData
  orderContext?: OrderContextData
}

// Tool types
interface ToolCall { id: string; name: string; args: Record<string, unknown> }
interface ToolResult { toolCallId: string; result: unknown }

// Search types
interface SearchQuery { query: string; filters?: string }
interface ProductSummary { objectID: string; name: string; price: number | null }

// Display types
interface DisplayGroup { title: string; why: string; products: DisplayProduct[] }
interface DisplayProduct { objectID: string; why: string }
interface DisplayResultsData { intro: string; groups: DisplayGroup[]; retry?: string }

// Product data (cached)
interface ProductData { objectID: string; name: string; image: string | null; price: number | null; brand: string | null }

// Order context
interface OrderContextData { orderId: string; items: Array<{ objectID: string; name: string; image: string | null; price: number | null }> }

// Chat state
type ChatStatus = 'idle' | 'streaming' | 'awaiting_tool' | 'error'

// Streaming display
interface StreamingDisplayState { intro: string; groups: DisplayGroup[]; streamingGroup: PartialDisplayGroup | null; isStreaming: boolean; toolCallId: string | null }

// Tool execution context
interface ToolExecutionContext {
  assistantMessageId: string
  signal?: AbortSignal
  appendDisplayResults: (messageId: string, data: DisplayResultsData) => void
  appendNoResultsMessage: (messageId: string) => void
  executeSearch: (queries: SearchQuery[]) => Promise<{ productSummaries: ProductSummary[] }>
  setStreamingDisplay: (state: StreamingDisplayState | null) => void
  sendFollowUp: (productSummaries: ProductSummary[]) => Promise<{ toolCalls: ToolCall[]; suggestions: string[] }>
}
```

---

## 13. Dependencies Used

- `jotai` — global state management (atoms)
- `@tanstack/react-query` — product data caching
- `motion/react` (Framer Motion) — animations
- `algoliasearch/lite` — Algolia search client
- `lucide-react` — icons (Send, AlertCircle, X, Sparkles, Maximize2, etc.)
- `next/navigation` — routing
