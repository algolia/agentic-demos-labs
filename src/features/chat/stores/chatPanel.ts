/**
 * Chat panel state — Jotai atoms for controlling the AI Assistant sidebar.
 *
 * The Chat widget from react-instantsearch manages its own internal open/close
 * state. However, since we want the panel to be part of the page layout (pushing
 * content to the left when opened, rather than floating on top), we need a shared
 * state that both the layout and the Chat widget can react to.
 *
 * This atom is used by:
 * - `ChatAssistant` — to sync the widget's open state
 * - `layout.tsx` (via `ChatLayout`) — to add/remove the sidebar column
 * - `useAIButtonInjection` — to toggle the panel from the search bar
 */

import { atom } from 'jotai'

/** Whether the AI Assistant sidebar is currently open */
export const isChatOpenAtom = atom(false)
