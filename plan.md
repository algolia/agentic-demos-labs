# Agentic Features — Current State & Update Plan

Branch: `latest-ui`

---

## Current Package Versions

| Package | Version |
|---------|---------|
| `algoliasearch` | `^5.48.0` |
| `react-instantsearch` | `^7.31.0` (includes Chat widget) |
| `react-instantsearch-nextjs` | `^1.1.0` |
| `instantsearch.css` | `^8.11.0` |
| `instantsearch.js` | `^4.89.0` |
| `next` | `^16.2.0` |
| `react` | `^19.2.1` |

---

## Agentic Features Inventory

### 1. AI Shopping Assistant Chat Panel
**Files:**
- [src/features/chat/ChatAssistant.tsx](src/features/chat/ChatAssistant.tsx) — `<Chat>` widget from `react-instantsearch`, embedded sidebar UX
- [src/features/chat/DisplayResults.tsx](src/features/chat/DisplayResults.tsx) — `displayResults` tool renderer with grouped product carousels
- [src/features/chat/ChatProductCard.tsx](src/features/chat/ChatProductCard.tsx) — compact product card as `itemComponent`
- [src/features/chat/ChatStepIndicator.tsx](src/features/chat/ChatStepIndicator.tsx) — custom loader ("Thinking...", etc.)
- [src/features/chat/stores/chatPanel.ts](src/features/chat/stores/chatPanel.ts) — `isChatOpenAtom` Jotai atom

**How it works:**
- `<Chat agentId={...}>` from `react-instantsearch` handles the entire streaming SSE conversation
- Sidebar is part of the document flow (not a floating overlay); pushes main content left when open
- `MutationObserver` watches `.ais-Chat-container--open` class and syncs to `isChatOpenAtom`
- Two tools registered: `displayResults` (with `streamInput: true`) and `search` (agent-side)

**Agent configuration:**
- Agent ID: `2aba4907-cecb-40ea-8a5a-3e872463a068` (in `config.ts`)
- API: `https://{appId}.algolia.net/agent-studio/1/agents/{agentId}/completions?stream=true&compatibilityMode=ai-sdk-5`

**Tool schemas (defined in Algolia Agent Studio dashboard):**
- `search` — breaks user query into 3-5 specific queries with optional `maxPrice`
- `displayResults` — organizes results into 1-3 themed groups with `intro`, `groups[]`, or `retry`

---

### 2. AI Mode Button in Autocomplete
**Files:**
- [src/components/autocomplete/AutocompleteWidget.tsx](src/components/autocomplete/AutocompleteWidget.tsx) — `EXPERIMENTAL_Autocomplete` from `react-instantsearch`
- [src/components/autocomplete/hooks/useAIButtonInjection.ts](src/components/autocomplete/hooks/useAIButtonInjection.ts) — DOM injection of "AI mode" button

**How it works:**
- Uses DOM manipulation to inject a `<button class="aa-AIButton">` with a Sparkles SVG into `.ais-AutocompleteForm`
- On click: finds `.ais-ChatToggleButton` and triggers a programmatic click to open the Chat widget
- Guard: only injects if `agentStudio.shoppingAssistantAgentID` is configured
- `resetKey` prop re-injects after autocomplete remounts

**Limitation:** Uses `EXPERIMENTAL_Autocomplete` — this API is not stable.

---

### 3. Autocomplete Search (Suggestions + Products)
**Files:**
- [src/components/autocomplete/hooks/useAutocompleteIndices.tsx](src/components/autocomplete/hooks/useAutocompleteIndices.tsx) — data sources (products, query suggestions, recent searches)
- [src/components/autocomplete/hits/ProductHit.tsx](src/components/autocomplete/hits/ProductHit.tsx)
- [src/components/autocomplete/hits/SuggestionHit.tsx](src/components/autocomplete/hits/SuggestionHit.tsx)

**Indices:**
- `ecommerce_ns_prod` — product hits
- `ecommerce_ns_prod_query_suggestions` — query suggestions
- `ai_suggestions` — reserved for AI-generated prompts (not yet wired)

---

### 4. InstantSearch (Faceted Search + Hits)
**Files:**
- [src/app/_components/ProductListingPage.tsx](src/app/_components/ProductListingPage.tsx)
- [src/components/filters/FilterSection.tsx](src/components/filters/FilterSection.tsx)
- [src/components/filters/PriceRangeFacet.tsx](src/components/filters/PriceRangeFacet.tsx)
- [src/components/filters/SizeFacet.tsx](src/components/filters/SizeFacet.tsx)
- [src/components/providers/InstantSearchProvider.tsx](src/components/providers/InstantSearchProvider.tsx)

**Widgets used:** `InstantSearch`, `Configure`, `SearchBox`, `Hits`, `RefinementList`, `Pagination`, `SortBy`, `CurrentRefinements`, `ClearRefinements`, `NumericMenu`

---

### 5. Product Carousels & Merchandising
**Files:**
- [src/app/_components/FeaturedProducts.tsx](src/app/_components/FeaturedProducts.tsx) — uses `ruleContexts: ['homepage_featured_ecommerce']`
- [src/app/_components/ProductCarousel.tsx](src/app/_components/ProductCarousel.tsx) — horizontal scroll using `Index` + `Configure` widget

---

### 6. Optional Agents (Configured but Not Yet Wired)
Defined in `VerticalConfig.features.agentStudio` type:
- `questionSuggestionsAgentID` — follow-up prompt suggestions in chat & autocomplete
- `filterSuggestionsAgentID` — AI-suggested facet filters for search queries

Neither is wired in any component today.

---

### 7. Config & Types
- [src/app/config.ts](src/app/config.ts) — Algolia credentials, index names, agent IDs, facets, sort options, hitTemplate
- [src/types/verticalConfig.types.ts](src/types/verticalConfig.types.ts) — `VerticalConfig` interface

---

### 8. Docs (Some Outdated)
- [docs/agent-setup.md](docs/agent-setup.md) — Agent Studio tool schemas & setup steps ✅
- [docs/architecture.md](docs/architecture.md) — ⚠️ Describes the old `src/features/aiAssistant/` implementation (now replaced by the Chat widget approach)
- [docs/chat-widget-streaming-feedback.md](docs/chat-widget-streaming-feedback.md)
- [docs/guardrails.md](docs/guardrails.md)
- [docs/getting-started.md](docs/getting-started.md)

---

## Styling
- [src/app/globals.css](src/app/globals.css) — 150+ lines of Chat widget overrides, `.chat-sidebar` transitions, `.aa-AIButton` styles, product card animations

---

## Update Tasks

| # | Area | Change | Status |
|---|------|--------|--------|
| 1 | Guardrails | Removed `docs/guardrails.md` — now managed in Algolia dashboard | ✅ Done |
| 2 | AI mode button | Replaced DOM injection (`useAIButtonInjection`) with `aiMode` prop on `EXPERIMENTAL_Autocomplete` | ✅ Done |
| 3 | Chat — custom tools | Removed `DisplayResults.tsx`, `ChatStepIndicator.tsx`, custom `tools` config, `loaderComponent` — using OOB widget | ✅ Done |
| 4 | Chat — toggle button | Replaced CSS hide hack with `toggleButtonComponent={() => <></>}` prop | ✅ Done |
| 5 | Chat — state sync | Removed `isChatOpenAtom` store and `useSyncChatOpenState` hook (CSS `:has()` handles sidebar width) | ✅ Done |
| 6 | Agent ID | Updated to `89eec0e7-4adc-4f99-bfe9-fb78b5161e0c` | ✅ Done |
| 7 | CSS cleanup | Removed `.aa-AIButton`, toggle-button hiding, carousel hiding, streaming-display, pulse-dot blocks | ✅ Done |
| 8 | Type fix | Renamed `showSuggestions` → `showQuerySuggestions` on `EXPERIMENTAL_Autocomplete` (prop renamed in latest RIS) | ✅ Done |
