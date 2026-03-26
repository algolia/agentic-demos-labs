# Agent Setup

This guide explains how to create the AI agents in Algolia Agent Studio that power the shopping assistant.

## Overview

The demo uses up to three agents. Only the **shopping assistant** is required for the core AI chat experience.

| Agent | Purpose | Required? |
|-------|---------|-----------|
| Shopping Assistant | Main conversational agent that searches products and displays results | Yes |
| Question Suggestions | Generates suggested prompts shown in the autocomplete dropdown and chat panel | No |
| Filter Suggestions | Suggests facet filters based on the user's query | No |

## 1. Create the Shopping Assistant Agent

This is the main agent that powers the AI chat panel. When a user asks a question, this agent decides what to search for, calls the `search` tool, and then calls `displayResults` to present products in organized groups.

### Steps

1. Go to the Algolia dashboard and navigate to **Generative AI > Agent Studio > Agents**.
2. Click **Create agent** and select **Start from scratch**.
3. Name it (e.g., `Shopping Assistant - Ecommerce`).
4. Click **Change provider** and select the provider you configured in **Settings > Providers**.
5. Pick a capable model (e.g., GPT-4o, Claude Sonnet). This agent needs reasoning ability to form good search queries and curate results.
6. Paste the instructions below into the **Instructions** field.
7. Add the two tools described below (`search` and `displayResults`).
8. Test in the playground, then click **Publish**.
9. Copy the **Agent ID** from the agent's settings page and paste it into `config.ts` as `shoppingAssistantAgentID`.

### Instructions (example)

```
You help users find products. Use your Search tool when asked anything.

When you write text, don't use lists with either bullets or numbers; ask one question at a time if you need to capture information.
```

Customize this for your brand voice, product catalog, and any specific behaviors you want (e.g., always recommend accessories, ask about budget).

### Tool: `search`

This tool lets the agent generate multiple search queries to find relevant products. The frontend executes these queries against your Algolia index and sends the results back to the agent.

**Tool description:** Break general shopping goal into specific, relevant searches.

**Schema:**

```json
{
  "type": "object",
  "required": ["suggestions"],
  "properties": {
    "suggestions": {
      "type": "array",
      "description": "List 3-5 search queries. Keep each to 1-3 words max. Mix specific queries with broader ones, and ones with synonyms. ALWAYS include at least ONE very broad 'category' query.",
      "items": {
        "type": "object",
        "properties": {
          "query": {
            "type": "string",
            "description": "Suggested search query. Be specific and intentional for some queries (e.g., 'puffer jackets' instead of 'winter jackets'), but also include broader queries without filters to maximize recall."
          },
          "maxPrice": {
            "type": "number",
            "description": "Maximum price filter. Optional. Use only if the user specified a budget."
          }
        },
        "required": ["query"],
        "additionalProperties": false
      }
    }
  }
}
```

Adapt the schema to match your index's filterable attributes. For example, if your index has a `gender` or `color` attribute, add those as optional fields.

### Tool: `displayResults`

After the `search` tool returns Algolia results, the agent calls `displayResults` to organize products into themed groups for display in the chat UI.

**Tool description:** Use this tool after a `search` to present results to the user.

**Schema:**

```json
{
  "type": "object",
  "required": [],
  "properties": {
    "retry": {
      "type": "string",
      "description": "4-5 word explanation of why no results were relevant. If set, do NOT include 'intro' or 'groups'."
    },
    "intro": {
      "type": "string",
      "description": "A very brief intro about this selection. Only include when results are good (no 'retry')."
    },
    "groups": {
      "type": "array",
      "description": "1-3 groups of products organized by themes. Each objectID can appear ONLY ONCE across ALL groups.",
      "items": {
        "type": "object",
        "properties": {
          "title": {
            "type": "string",
            "description": "Short label for this group."
          },
          "why": {
            "type": "string",
            "description": "4-5 word explanation of why this group was created."
          },
          "products": {
            "type": "array",
            "description": "Up to 3 products from the search results.",
            "items": {
              "type": "object",
              "properties": {
                "objectID": {
                  "type": "string",
                  "description": "Product objectID from the search results."
                },
                "why": {
                  "type": "string",
                  "description": "4-5 word explanation of why this product was chosen."
                }
              },
              "required": ["objectID", "why"]
            }
          }
        },
        "required": ["title", "why", "products"]
      }
    }
  }
}
```

## 2. Create the Question Suggestions Agent (optional)

This agent generates prompt suggestions (e.g., "Find me a winter jacket") shown as AI suggestions in the autocomplete dropdown and as follow-up buttons in the chat panel.

### Steps

1. Create a new agent in Agent Studio.
2. Use a fast, cheap model (e.g., GPT-4o-mini, Haiku).
3. No tools needed.
4. Paste the agent ID into `config.ts` as `questionSuggestionsAgentID`.

### Instructions (example)

```
You are a Prompt Suggestion workflow. You generate prompt suggestions for a shopping assistant.
Write exactly 3 groups of 3 prompt suggestions written from the user's perspective.

Constraints:
- Each suggestion must be 5 words or less.
- Be specific. Avoid generic categories.
- Ensure variety across different product types and occasions.
```

## 3. Create the Filter Suggestions Agent (optional)

This agent suggests relevant facet filters based on the user's search query.

### Steps

1. Create a new agent in Agent Studio.
2. Use a fast model. No tools needed.
3. Paste the agent ID into `config.ts` as `filterSuggestionsAgentID`.

## How the Agent API Works

The frontend calls the Agent Studio API directly from the browser:

```
POST https://{appId}.algolia.net/agent-studio/1/agents/{agentId}/completions?stream=true&compatibilityMode=ai-sdk-5
```

**Headers:**
```
X-Algolia-Application-Id: {appId}
X-Algolia-API-Key: {apiKey}
Content-Type: application/json
```

**Body:**
```json
{
  "messages": [
    {
      "role": "user",
      "parts": [{ "type": "text", "text": "Find me a winter jacket" }]
    }
  ]
}
```

The response is a server-sent event stream. The frontend parses tool calls from the stream, executes `search` locally against Algolia, sends the results back as a follow-up message, and then renders the `displayResults` output as product cards.

See `src/features/aiAssistant/hooks/useAgentClient.ts` for the implementation.
