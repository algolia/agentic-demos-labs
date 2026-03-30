/**
 * SSE Interceptor — Intercepts Agent Studio SSE streams and dispatches DOM events.
 *
 * Monkey-patches `fetch` to intercept completions requests. Parses `tool-input-delta`
 * events for the `displayResults` tool, extracts objectIDs from the partial JSON,
 * fetches product data from Algolia, and dispatches CustomEvents that the
 * StreamingDisplay component listens for.
 *
 * ## Events Dispatched
 *
 * - `streaming:start` — displayResults tool streaming has begun
 * - `streaming:intro` — intro text extracted, detail: { intro: string }
 * - `streaming:group` — a new group title/why extracted, detail: { group }
 * - `streaming:product-data` — product fetched from Algolia, detail: { objectID, product }
 * - `streaming:end` — streaming complete
 */

import { ecommerceConfig } from '@/app/config'
import { parsePartialJson } from '@/features/chat/streaming/partialJsonParser'

type AlgoliaRecord = Record<string, unknown> & { objectID: string }

const fetchProductsByIds = async (objectIDs: string[]): Promise<AlgoliaRecord[]> => {
  if (objectIDs.length === 0) return []
  const { appId, apiKey, indices } = ecommerceConfig.algolia
  try {
    const res = await fetch(`https://${appId}-dsn.algolia.net/1/indexes/*/objects`, {
      method: 'POST',
      headers: {
        'X-Algolia-Application-Id': appId,
        'X-Algolia-API-Key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        requests: objectIDs.map((id) => ({ indexName: indices.productsIndex, objectID: id })),
      }),
    })
    const data = await res.json()
    return (Array.isArray(data.results) ? data.results : []).filter(Boolean)
  } catch { return [] }
}

/** Dispatch a custom event on the window */
const emit = (name: string, detail?: unknown) => {
  window.dispatchEvent(new CustomEvent(name, { detail }))
}

const processSSEStream = async (stream: ReadableStream<Uint8Array>) => {
  const reader = stream.getReader()
  const decoder = new TextDecoder()

  let currentToolName: string | null = null
  let accumulatedInput = ''
  const fetchedIds = new Set<string>()
  let lastIntro = ''
  let lastGroupsJson = ''

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      const chunk = decoder.decode(value, { stream: true })
      const lines = chunk.split('\n')

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue
        const dataStr = line.slice(6).trim()
        if (dataStr === '[DONE]') continue

        try {
          const event = JSON.parse(dataStr)

          if (event.type === 'tool-input-start' && event.toolName === 'displayResults') {
            currentToolName = 'displayResults'
            accumulatedInput = ''
            lastIntro = ''
            lastGroupsJson = ''
            emit('streaming:start')
          }

          if (event.type === 'tool-input-delta' && currentToolName === 'displayResults') {
            accumulatedInput += event.inputTextDelta ?? ''

            const parsed = parsePartialJson(accumulatedInput)

            // Emit intro when it first appears or changes
            if (parsed.intro && parsed.intro !== lastIntro) {
              lastIntro = parsed.intro
              emit('streaming:intro', { intro: parsed.intro })
            }

            // Emit ALL groups on every parse — the component replaces its state.
            // This way groups update as products are added to them.
            const groupsJson = JSON.stringify(parsed.groups)
            if (groupsJson !== lastGroupsJson && parsed.groups.length > 0) {
              lastGroupsJson = groupsJson
              emit('streaming:groups-update', { groups: parsed.groups })
            }

            // Fetch new objectIDs
            const newIds = parsed.allObjectIDs.filter((id) => !fetchedIds.has(id))
            if (newIds.length > 0) {
              for (const id of newIds) fetchedIds.add(id)

              fetchProductsByIds(newIds).then((results) => {
                for (const product of results) {
                  if (product?.objectID) {
                    emit('streaming:product-data', {
                      objectID: product.objectID,
                      product,
                    })
                  }
                }
              })
            }
          }

          if (event.type === 'tool-input-available' && event.toolName === 'displayResults') {
            currentToolName = null
            // Final parse to ensure complete groups are emitted
            const finalParsed = parsePartialJson(accumulatedInput)
            emit('streaming:groups-update', { groups: finalParsed.groups })
            emit('streaming:end')
          }

          // Capture follow-up text from completion 2 and emit it
          // so StreamingDisplay can render it AFTER the product groups
          if (event.type === 'text-delta' && event.delta) {
            emit('streaming:text-delta', { delta: event.delta })
          }

          // When text ends, log the DOM structure so we can debug ordering
          if (event.type === 'text-end') {
            setTimeout(() => {
              const content = document.querySelector('.ais-ChatMessages-content')
              if (content) {
                const children = Array.from(content.children).map((c, i) => {
                  const el = c as HTMLElement
                  return `[${i}] ${el.className.split(' ').slice(0, 3).join(' ')} | text: "${el.textContent?.substring(0, 50)}..."`
                })
                console.log('[DOM at text-end]', children)
              }
            }, 500)
          }

          if (event.type === 'finish') {
            emit('streaming:end')
          }
        } catch {
          // Ignore JSON parse errors for partial lines
        }
      }
    }
  } catch {
    emit('streaming:end')
  }
}

export const installSSEInterceptor = (): (() => void) => {
  const originalFetch = window.fetch.bind(window)

  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url
    const response = await originalFetch(input, init)

    if (url.includes('/completions') && response.body) {
      try {
        const [widgetStream, ourStream] = response.body.tee()
        processSSEStream(ourStream)
        return new Response(widgetStream, {
          status: response.status,
          statusText: response.statusText,
          headers: response.headers,
        })
      } catch {
        return response
      }
    }

    return response
  }

  return () => { window.fetch = originalFetch }
}
