# Getting Started

This guide walks you through running the Spencer & Williams ecommerce demo and adapting it for your own website.

## Prerequisites

- Node.js >= 20
- An [Algolia](https://www.algolia.com/) account with:
  - An application ID and search API key
  - A products index with your catalog data
  - A query suggestions index (optional, for autocomplete suggestions)
- Access to [Algolia Agent Studio](https://www.algolia.com/products/ai-agents/) to create AI agents

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). You should see the storefront with a search bar that has an **AI mode** button (sparkle icon).

## Project Structure

```
├── src/
│   ├── app/
│   │   ├── config.ts                    # Algolia credentials + agent IDs
│   │   └── layout.tsx                   # Root layout (header, search bar, AI panel)
│   ├── components/
│   │   └── autocomplete/                # Search bar + AI button injection
│   │       ├── AutocompleteWidget.tsx
│   │       └── hooks/
│   │           └── useAIButtonInjection.ts
│   └── features/
│       └── aiAssistant/
│           ├── components/
│           │   ├── AIAssistantLayout.tsx # Wraps page content, manages panel visibility
│           │   ├── AIAssistantPanel.tsx  # The sliding chat panel
│           │   └── AIAssistantChat.tsx   # Chat messages, input, streaming
│           ├── hooks/
│           │   └── useAgentClient.ts     # Calls Agent Studio completions API
│           ├── tools/
│           │   ├── searchTool.ts         # Executes Algolia searches from agent requests
│           │   ├── displayResultsTool.ts # Renders product groups in the chat
│           │   └── registry.ts           # Tool handler registry
│           ├── stores/
│           │   └── aiAssistant.ts        # Jotai atoms (open/expanded/messages state)
│           └── types/
│               └── index.ts             # TypeScript interfaces
└── docs/
    ├── getting-started.md               # This file
    ├── agent-setup.md                   # How to create agents in Agent Studio
    ├── architecture.md                  # How the AI assistant works end-to-end
    └── guardrails.md                    # Content safety / guardrail agent
```

## Configuration

All Algolia and Agent Studio settings live in `src/app/config.ts`. To connect to your own account, update these fields:

```ts
algolia: {
  appId: 'YOUR_APP_ID',
  apiKey: 'YOUR_SEARCH_API_KEY',
  indices: {
    productsIndex: 'your_products_index',
    querySuggestionsIndex: 'your_query_suggestions_index',
    aiSuggestionsIndex: 'your_ai_suggestions_index',    // optional
  },
  facets: ['category', 'brand', 'price'],               // facets in your index
},
features: {
  agentStudio: {
    shoppingAssistantAgentID: 'your-agent-id',           // required
    filterSuggestionsAgentID: 'your-agent-id',           // optional
    questionSuggestionsAgentID: 'your-agent-id',         // optional
  },
},
```

The `shoppingAssistantAgentID` is the only agent required to get the AI chat working. See [Agent Setup](./agent-setup.md) for how to create it.

## Next Steps

1. [Set up your agents in Agent Studio](./agent-setup.md) — create the shopping assistant agent and configure its tools
2. [Understand the architecture](./architecture.md) — learn how the search bar, AI button, and chat panel are wired together
3. [Add guardrails](./guardrails.md) — classify user messages before they reach your agent
