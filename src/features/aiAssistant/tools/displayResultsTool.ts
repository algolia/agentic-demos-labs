import type {
  DisplayResultsData,
  ToolHandler,
  ToolExecutionContext,
  ToolExecutionResult,
} from '@/features/aiAssistant/types'

export const DISPLAY_RESULTS_TOOL_NAME = 'displayResults'

/**
 * Check if displayResults data has valid products.
 */
export const hasValidProducts = (data: DisplayResultsData): boolean =>
  data.groups?.length > 0 && data.groups.some((g) => g.products?.length > 0)

/**
 * Parse displayResults arguments.
 */
const parseDisplayResultsArgs = (
  args: Record<string, unknown>,
): DisplayResultsData | null => {
  const data = args as unknown as DisplayResultsData

  if (!data || typeof data !== 'object') {
    console.warn('[displayResultsTool] Invalid input:', args)
    return null
  }

  return data
}

/**
 * Execute displayResults tool: validates products and updates message state.
 * The tool result is sent back to the agent by the executor.
 */
const executeDisplayResults = async (
  data: DisplayResultsData,
  context: ToolExecutionContext,
): Promise<ToolExecutionResult> => {
  if (hasValidProducts(data)) {
    context.appendDisplayResults(context.assistantMessageId, data)
  } else {
    context.appendNoResultsMessage(context.assistantMessageId)
  }

  return {}
}

export const displayResultsToolHandler: ToolHandler<DisplayResultsData> = {
  name: DISPLAY_RESULTS_TOOL_NAME,
  parseArgs: parseDisplayResultsArgs,
  execute: executeDisplayResults,
}
