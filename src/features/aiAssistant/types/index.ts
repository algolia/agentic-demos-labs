// Order context for post-purchase AI
export interface OrderContextData {
  orderId: string
  items: Array<{
    objectID: string
    name: string
    image: string | null
    price: number | null
  }>
}

// Message types for the chat
export interface MessagePart {
  type:
    | 'text'
    | 'tool_call'
    | 'tool_result'
    | 'display_results'
    | 'order_context'
  text?: string
  toolCallId?: string
  toolName?: string
  args?: Record<string, unknown>
  result?: unknown
  displayData?: DisplayResultsData
  orderContext?: OrderContextData
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  parts: MessagePart[]
  createdAt: Date
}

// Tool types
export interface ToolCall {
  id: string
  name: string
  args: Record<string, unknown>
}

export interface ProductSummary {
  objectID: string
  name: string
  price: number | null
}

/**
 * Context passed to tool handlers during execution.
 * Contains shared dependencies and state management functions.
 */
export interface ToolExecutionContext {
  assistantMessageId: string
  signal?: AbortSignal
  // Message state operations
  appendDisplayResults: (messageId: string, data: DisplayResultsData) => void
  appendNoResultsMessage: (messageId: string) => void
  // Search operations
  executeSearch: (queries: SearchQuery[]) => Promise<{
    productSummaries: ProductSummary[]
  }>
  // Streaming display
  setStreamingDisplay: (state: StreamingDisplayState | null) => void
  // Send follow-up to agent (for multi-step tools like search)
  sendFollowUp: (
    productSummaries: ProductSummary[],
  ) => Promise<{ toolCalls: ToolCall[]; suggestions: string[] }>
}

/**
 * Result from executing a tool.
 */
export interface ToolExecutionResult {
  suggestions?: string[]
}

/**
 * Generic tool handler interface.
 * Each tool implements this to define its parsing and execution logic.
 */
export interface ToolHandler<TArgs = unknown> {
  name: string
  parseArgs: (args: Record<string, unknown>) => TArgs | null
  execute: (
    args: TArgs,
    context: ToolExecutionContext,
  ) => Promise<ToolExecutionResult>
}

export interface ToolResult {
  toolCallId: string
  result: unknown
}

// Search tool specific types
export interface SearchQuery {
  query: string
  filters?: string
}

export interface SearchResult {
  objectID: string
  [key: string]: unknown
}

// DisplayResults tool types
export interface DisplayProduct {
  objectID: string
  why: string
}

export interface DisplayGroup {
  title: string
  why: string
  products: DisplayProduct[]
}

// Partial group for streaming (may have incomplete data)
export interface PartialDisplayGroup {
  title: string | null
  why: string | null
  products: DisplayProduct[]
}

export interface DisplayResultsData {
  intro: string
  groups: DisplayGroup[]
  retry?: string
}

// Streaming state for progressive display of groups
export interface StreamingDisplayState {
  intro: string
  groups: DisplayGroup[]
  streamingGroup: PartialDisplayGroup | null
  isStreaming: boolean
  toolCallId: string | null
}

// Product data for display (cached from Algolia)
export interface ProductData {
  objectID: string
  name: string
  image: string | null
  price: number | null
  brand: string | null
}

// Chat state
export type ChatStatus = 'idle' | 'streaming' | 'awaiting_tool' | 'error'
