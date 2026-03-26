# Architecture

This document explains how the AI assistant is wired together, from the search bar button to the streaming chat panel. Use this as a reference when integrating the AI experience into your own website.

## High-Level Flow

```
┌─────────────────────────────────────────────────────────┐
│  Search Bar (AutocompleteWidget)                        │
│  ┌───────────────────────────────────┬────────────┐     │
│  │ What are you looking for today?   │ ✦ AI mode  │     │
│  └───────────────────────────────────┴─────┬──────┘     │
│                                            │            │
│  Autocomplete dropdown may also show       │            │
│  AI suggestion hits from ai_suggestions    │            │
│  index (optional)                          │            │
└────────────────────────────────────────────┼────────────┘
                                             │
                              User clicks AI button
                              or AI suggestion hit
                                             │
                                             ▼
┌─────────────────────────────────────────────────────────┐
│  AI Assistant Panel (AIAssistantPanel)                   │
│  ┌─────────────────────────────────────────────────┐    │
│  │  Chat Messages                                  │    │
│  │  ┌─────────────────────────────────────────┐    │    │
│  │  │ User: "Find me a winter jacket"         │    │    │
│  │  │ Assistant: [streaming text + products]   │    │    │
│  │  └─────────────────────────────────────────┘    │    │
│  │                                                 │    │
│  │  Suggestion buttons: [Follow-up 1] [Follow-up 2]│    │
│  │  ┌─────────────────────────────────────────┐    │    │
│  │  │ Type your message...           [Send]   │    │    │
│  │  └─────────────────────────────────────────┘    │    │
│  └─────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
```

## Key Components

### 1. Search Bar with AI Button

**Files:**
- `src/components/autocomplete/AutocompleteWidget.tsx` — renders the search bar using `EXPERIMENTAL_Autocomplete` from `react-instantsearch`
- `src/components/autocomplete/hooks/useAIButtonInjection.ts` — injects the "AI mode" button into the search form

**How it works:**

The `AutocompleteWidget` accepts a `showAIButton` prop. When enabled, the `useAIButtonInjection` hook uses a `MutationObserver` to inject a button element into the autocomplete form. When clicked, the button:

1. Reads the current query from the search input
2. Blurs the input (to close the autocomplete dropdown)
3. Sets `initialAIMessageState` (a Jotai atom) with the query text
4. Sets `isAIAssistantOpenState` to `true`
5. On the homepage, also sets `isAIAssistantExpandedState` to `true` (fullscreen mode)

### 2. AI Assistant Layout

**File:** `src/features/aiAssistant/components/AIAssistantLayout.tsx`

This component wraps your page content. It reads the `isAIAssistantOpenState` and `isAIAssistantExpandedState` atoms to:

- Add right padding to the page when the panel is open (desktop only, so content isn't hidden behind the panel)
- Fade out / disable the page content when the panel is in expanded (fullscreen) mode
- Render `AIAssistantPanel` when the assistant should be visible

**Integration point:** Wrap your main content area with `<AIAssistantLayout>`.

```tsx
// In your layout.tsx
<main>
  <AIAssistantLayout basePath="">{children}</AIAssistantLayout>
</main>
```

### 3. Chat Panel and Messages

**Files:**
- `src/features/aiAssistant/components/AIAssistantPanel.tsx` — fixed-position panel with header controls (minimize, maximize, close)
- `src/features/aiAssistant/components/AIAssistantChat.tsx` — message list, input form, suggestion buttons, streaming indicator

### 4. Agent Client

**File:** `src/features/aiAssistant/hooks/useAgentClient.ts`

The `useAgentClient` hook returns a `sendCompletion` function that:

1. Sends the full message history to the Agent Studio API
2. Streams the response using server-sent events
3. Calls `onTextDelta` for each text chunk (for live typing effect)
4. Calls `onToolInputDelta` when the agent invokes a tool

The API endpoint is:
```
https://{appId}.algolia.net/agent-studio/1/agents/{agentId}/completions?stream=true&compatibilityMode=ai-sdk-5
```

### 5. Tool Execution

**Files:**
- `src/features/aiAssistant/tools/registry.ts` — maps tool names to handlers
- `src/features/aiAssistant/tools/searchTool.ts` — handles `search` tool calls
- `src/features/aiAssistant/tools/displayResultsTool.ts` — handles `displayResults` tool calls

**Flow for a typical user question:**

```
User: "Find me a winter jacket under $200"
  │
  ▼
Agent Studio API (streaming)
  │
  ├─ Text delta: "Let me search for some options..."
  │
  ├─ Tool call: search({ suggestions: [
  │     { query: "winter jacket", maxPrice: 200 },
  │     { query: "puffer jacket" },
  │     { query: "insulated coat" }
  │   ]})
  │     │
  │     ▼
  │   Frontend executes Algolia search for each query
  │   Sends product summaries back to agent as follow-up
  │     │
  │     ▼
  │   Agent responds with: displayResults({
  │     intro: "Here are some great winter jacket options:",
  │     groups: [
  │       { title: "Puffer Jackets", products: [...] },
  │       { title: "Insulated Coats", products: [...] }
  │     ]
  │   })
  │     │
  │     ▼
  │   Frontend renders product cards in the chat
  │
  └─ Suggestions: ["Show me more colors", "Any waterproof options?"]
       │
       ▼
     Rendered as clickable suggestion buttons below the response
```

## State Management

All AI assistant state is managed with [Jotai](https://jotai.org/) atoms in `src/features/aiAssistant/stores/aiAssistant.ts`:

| Atom | Type | Purpose |
|------|------|---------|
| `isAIAssistantOpenState` | `boolean` | Whether the panel is visible |
| `isAIAssistantExpandedState` | `boolean` | Whether the panel is in fullscreen mode |
| `initialAIMessageState` | `string` | Query to auto-send when the panel opens |
| `chatMessagesState` | `ChatMessage[]` | Full conversation history |
| `suggestionsState` | `string[]` | Follow-up suggestion buttons |
| `productContextState` | `Record \| null` | Current product data (for PDP pages) |
| `collectedObjectIDsState` | `string[]` | Product IDs shown in the conversation |

## Integrating Into Your Own Website

### Minimum required steps

1. **Set up Algolia** — you need an application with a products index.
2. **Create a shopping assistant agent** in Agent Studio with `search` and `displayResults` tools (see [Agent Setup](./agent-setup.md)).
3. **Update `config.ts`** with your Algolia credentials and agent ID.
4. **Add the layout components:**
   - `<Providers config={config}>` — wraps the app with Algolia InstantSearch and Jotai
   - `<AutocompleteWidget showAIButton />` — search bar with AI button
   - `<AIAssistantLayout>` — wraps page content and renders the chat panel

### If you're not using Next.js / React

The AI assistant features in `src/features/aiAssistant/` use the Agent Studio API via standard `fetch` calls. You can adapt the logic in `useAgentClient.ts` for any framework — the API itself has no React dependency.
