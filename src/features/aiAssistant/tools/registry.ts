import {
  displayResultsToolHandler,
  DISPLAY_RESULTS_TOOL_NAME,
} from '@/features/aiAssistant/tools/displayResultsTool'
import type { ToolHandler } from '@/features/aiAssistant/types'

/**
 * Registry of all available tool handlers.
 * Add new tools here to make them available to the executor.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const toolHandlers: Record<string, ToolHandler<any>> = {
  [DISPLAY_RESULTS_TOOL_NAME]: displayResultsToolHandler,
}

/**
 * Get a tool handler by name.
 */
export const getToolHandler = (name: string): ToolHandler | undefined =>
  toolHandlers[name]

/**
 * Check if a tool name is valid (has a registered handler).
 */
export const isValidTool = (name: string): boolean => name in toolHandlers

/**
 * List of all registered tool names.
 */
export const availableTools = Object.keys(toolHandlers)
