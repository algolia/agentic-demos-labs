# Chat Widget Feedback: Streaming Tool Results

**Author:** Leonardo Cudo — AI Platform Team
**Date:** March 2026
**Widget:** `<Chat>` from `react-instantsearch`
**Context:** Building a demo e-commerce app with Agent Studio, featuring real-time progressive rendering of product carousels from the `displayResults` client-side tool.

---

## Summary

We built a shopping assistant that streams product results progressively as the agent generates them. The final result works well, but achieving it required **~500 lines of workaround code** including monkey-patching `fetch`, intercepting raw SSE events, injecting DOM nodes, and coordinating custom events — all because the Chat widget doesn't expose streaming data to custom tool renderers.

This document explains the specific pain points we encountered and proposes concrete API improvements that would make progressive tool rendering straightforward for widget users.

---

## What We Wanted to Build

Our agent uses a two-step flow:

1. **`algolia_search_index`** — searches for products (handled automatically by the widget)
2. **`displayResults`** — organizes products into themed groups with titles, descriptions, and product cards

The `displayResults` tool input is streamed as `tool-input-delta` SSE events. Each product `objectID` appears one at a time in the partial JSON. We wanted to:

- Show each product card **as soon as its objectID is received** in the stream
- Fetch product data from Algolia **immediately** for each new objectID
- Display groups progressively (group title appears → products fill in one by one)
- Show the follow-up text **after** the product carousels (matching the SSE order)

---

## Pain Points Encountered

### 1. `layoutComponent` Receives No Data During Streaming

The `layoutComponent` prop is the intended way to render custom tool UI. However, during `input-streaming` state, `message.input` is always `undefined`:

```
[DisplayResults render] { state: 'input-streaming', inputType: 'undefined', groupCount: 0 }
[DisplayResults render] { state: 'input-streaming', inputType: 'undefined', groupCount: 0 }
[DisplayResults render] { state: 'input-streaming', inputType: 'undefined', groupCount: 0 }
[DisplayResults render] { state: 'input-available', inputType: 'object', groupCount: 3 }  // ← everything at once
```

The widget internally accumulates `tool-input-delta` events and builds the JSON, but it **does not pass the partial result** to the `layoutComponent`. The component only receives data when streaming is complete.

**Impact:** We cannot use the official `layoutComponent` API for progressive rendering. The entire feature requires bypassing the widget.

### 2. No Hook for Raw SSE Events

The widget parses SSE events internally but doesn't expose them. To access `tool-input-delta` events, we had to **monkey-patch `window.fetch`**:

```ts
// We had to do this:
const originalFetch = window.fetch.bind(window)
window.fetch = async (input, init) => {
  const response = await originalFetch(input, init)
  if (url.includes('/completions')) {
    const [widgetStream, ourStream] = response.body.tee()
    processSSEStream(ourStream) // Parse deltas ourselves
    return new Response(widgetStream, response)
  }
  return response
}
```

This is fragile (breaks if the widget changes its fetch pattern), hard to maintain, and shouldn't be necessary.

### 3. No Control Over Rendering Order Within a Message

The widget renders the assistant's response as a single `.ais-ChatMessage` containing:
- `.ais-ChatMessage-tool` (tool results)
- `<span>` (follow-up text from the agent)
- `.ais-ChatPromptSuggestions` (suggestion buttons)

The follow-up text comes from a **second completion** (after the tool result is sent back), but the widget renders it in DOM order that puts text **before** our custom tool UI. We had no API to control this ordering.

**Impact:** We had to inject our streaming display into a specific position inside the widget's DOM tree (`.ais-ChatMessage-message`) and rely on the natural DOM order to get the right visual sequence. This required deep knowledge of the widget's internal DOM structure, which could break with any widget update.

### 4. Dual Renderer Coordination

Since `layoutComponent` doesn't support streaming, we built a separate `StreamingDisplay` component that renders outside the widget's control. This created a **dual renderer problem**:

- `StreamingDisplay` shows products during streaming
- `layoutComponent` shows products after streaming ends
- Both render the same products → **flickering and duplication**

We tried many approaches to coordinate the handoff:
- Jotai atoms (store mismatch between widget's Provider and our interceptor)
- React portals (timing issues, couldn't find the right DOM target)
- MutationObservers (race conditions)
- CSS `:has()` selectors (wrong specificity, hid wrong elements)

The final solution: eliminate the `layoutComponent` entirely and have `StreamingDisplay` be the only renderer. But this means we lose chat history rendering on page reload.

### 5. `onToolCall` Blocks `layoutComponent` Streaming

When `onToolCall` is present on a tool, the widget auto-resolves the tool at `tool-input-available`. The `layoutComponent` then only receives `output-available` state — it never sees `input-streaming` at all. Removing `onToolCall` causes the conversation to hang because the tool is never acknowledged.

**Catch-22:** We need `onToolCall` to acknowledge the tool, but having it prevents the `layoutComponent` from seeing streaming states.

---

## Proposed API Improvements

### 1. Pass Partial Input to `layoutComponent` During Streaming

The widget already accumulates `tool-input-delta` events internally. Pass the partial parsed result to the `layoutComponent`:

```tsx
// Current behavior:
message.state === 'input-streaming' && message.input === undefined

// Proposed behavior:
message.state === 'input-streaming' && message.input === {
  intro: "Here are some laptops...",
  groups: [
    { title: "Budget picks", products: [{ objectID: "B09D21T7R8" }] }
    // ↑ grows as more deltas arrive
  ]
}
```

**Impact:** This single change would eliminate the need for SSE interception, custom events, DOM injection, and the dual renderer. The `layoutComponent` would handle everything.

### 2. Add `onSSEEvent` Callback

Expose raw SSE events to the developer:

```tsx
<Chat
  onSSEEvent={(event) => {
    // event.type: 'tool-input-delta' | 'text-delta' | 'tool-input-available' | ...
    // event.toolName: 'displayResults'
    // event.data: { inputTextDelta: '{"objectID":"B09...' }
  }}
/>
```

**Impact:** Developers can build any custom streaming behavior without monkey-patching `fetch`. Much cleaner and less fragile.

### 3. Add `onToolInputDelta` to Tool Config

A per-tool callback for streaming deltas:

```tsx
tools={{
  displayResults: {
    onToolInputDelta: ({ accumulatedInput, delta, toolCallId }) => {
      // Parse partial JSON, pre-fetch products, update external state
    },
    onToolCall: async ({ input, addToolResult }) => {
      addToolResult({ output: input })
    },
    layoutComponent: DisplayResults,
  }
}}
```

**Impact:** Enables pre-fetching and progressive state building without intercepting the network layer.

### 4. Allow `layoutComponent` to Coexist with `onToolCall` During Streaming

Currently, `onToolCall` auto-resolves the tool and the `layoutComponent` only sees `output-available`. Instead:

- During `input-streaming`: render `layoutComponent` with partial data
- At `input-available`: call `onToolCall` for acknowledgment
- After `onToolCall` resolves: update `layoutComponent` to `output-available`

This removes the catch-22 and lets both features work together.

### 5. Provide a `messageLayout` Prop or Render Function

Let developers control the visual order of tool results, text, and suggestions within a message:

```tsx
<Chat
  messageLayout={({ tools, text, suggestions }) => (
    <>
      {tools}
      {text}
      {suggestions}
    </>
  )}
/>
```

Or a simpler enum:

```tsx
<Chat messageLayout="tools-first" />  // default: "text-first"
```

**Impact:** Eliminates the need to inject DOM nodes at specific positions inside the widget's internal structure.

---

## Summary of Workarounds We Built

| Workaround | Lines | Why Needed |
|------------|-------|------------|
| SSE interceptor (monkey-patches `fetch`) | ~120 | No access to streaming events |
| Partial JSON parser (regex-based) | ~80 | Widget doesn't parse partial tool input |
| `StreamingDisplay` component | ~250 | `layoutComponent` has no streaming data |
| Custom DOM events system | ~30 | Communication between interceptor and React |
| DOM injection into widget internals | ~40 | No render slot for streaming UI |
| CSS overrides for ordering | ~20 | No control over message layout |
| **Total** | **~540** | |

With proposed improvement #1 alone (partial input in `layoutComponent`), this would reduce to **~50 lines** — just the `layoutComponent` reading `message.input` and rendering progressively.

---

## Conclusion

The Chat widget is excellent for standard chat flows. But progressive rendering of custom tool results — a key use case for e-commerce shopping assistants — requires bypassing the widget entirely. The five proposals above are ordered by impact; even implementing just #1 would dramatically simplify the developer experience for this use case.

We're happy to discuss these proposals further or contribute to the implementation. The demo app with all workarounds is available for reference.
