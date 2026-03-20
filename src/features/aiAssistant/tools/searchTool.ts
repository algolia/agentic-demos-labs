import { hasValidProducts } from '@/features/aiAssistant/tools/displayResultsTool'
import type {
  SearchQuery,
  ToolHandler,
  ToolExecutionContext,
  ToolExecutionResult,
  DisplayResultsData,
} from '@/features/aiAssistant/types'

export const SEARCH_TOOL_NAME = 'search'

/**
 * Parse search tool arguments from agent response.
 * Handles both "suggestions" and "queries" formats.
 */
const parseSearchArgs = (
  args: Record<string, unknown>,
): SearchQuery[] | null => {
  const suggestions = (args.suggestions || args.queries) as SearchQuery[]

  if (!suggestions || !Array.isArray(suggestions)) {
    console.warn(
      '[searchTool] Invalid input - no suggestions or queries array:',
      args,
    )
    return null
  }

  return suggestions
}

/**
 * Execute search tool: runs Algolia search, sends results to agent,
 * and handles the displayResults response.
 */
const executeSearch = async (
  queries: SearchQuery[],
  context: ToolExecutionContext,
): Promise<ToolExecutionResult> => {
  // Initialize streaming display
  context.setStreamingDisplay({
    intro: '',
    groups: [],
    streamingGroup: null,
    isStreaming: true,
    toolCallId: null,
  })

  try {
    // Execute search
    const result = await context.executeSearch(queries)

    // Send results to agent for displayResults
    const followUpResult = await context.sendFollowUp(result.productSummaries)

    context.setStreamingDisplay(null)

    // Handle displayResults from agent response
    for (const toolCall of followUpResult.toolCalls) {
      if (toolCall.name === 'displayResults') {
        const data = toolCall.args as unknown as DisplayResultsData
        if (hasValidProducts(data)) {
          context.appendDisplayResults(context.assistantMessageId, data)
        } else {
          context.appendNoResultsMessage(context.assistantMessageId)
        }
      }
    }

    return {
      suggestions: followUpResult.suggestions,
    }
  } catch (error) {
    context.setStreamingDisplay(null)
    throw error
  }
}

export const searchToolHandler: ToolHandler<SearchQuery[]> = {
  name: SEARCH_TOOL_NAME,
  parseArgs: parseSearchArgs,
  execute: executeSearch,
}
