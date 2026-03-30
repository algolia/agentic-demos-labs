'use client'

/**
 * StreamingDisplay — Single component for real-time product streaming.
 *
 * Listens for CustomEvents dispatched by the SSE interceptor and renders
 * products progressively as they arrive. Injects itself directly into the
 * chat's message scroll area.
 *
 * This is the ONLY component that renders streaming products. There's no
 * handoff, no second renderer, no flickering.
 *
 * For chat history (page reload), this component has no data and renders
 * nothing — the DisplayResults layoutComponent handles that case.
 */

import { useEffect, useState, useCallback, useRef } from 'react'
import { motion } from 'motion/react'
import Link from 'next/link'
import { ShoppingCart } from 'lucide-react'

import { ecommerceConfig } from '@/app/config'
import { useCart } from '@/hooks/useCart'
import { getHitValues } from '@/utilities/getHitValues'
import type { PartialGroup } from '@/features/chat/streaming/partialJsonParser'

type AlgoliaRecord = Record<string, unknown> & { objectID: string }

// --- Product Card ---

const ProductCard = ({ product }: { product: AlgoliaRecord }) => {
  const { addItem } = useCart()
  const values = getHitValues(product, ecommerceConfig.algolia.hitTemplate)

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}>
      <Link
        href={`/product/${product.objectID}`}
        className="group flex w-[160px] shrink-0 flex-col overflow-hidden rounded-card border border-border bg-card transition-shadow hover:shadow-md">
        <div className="flex h-[140px] items-center justify-center bg-muted/30 p-3">
          {values.image ? (
            <img src={values.image} alt={values.name} className="h-full w-full object-contain" />
          ) : (
            <div className="text-xs text-muted-foreground">No image</div>
          )}
        </div>
        <div className="flex flex-1 flex-col gap-0.5 p-2.5">
          {values.brand && (
            <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
              {values.brand}
            </p>
          )}
          <h4 className="text-xs font-semibold leading-tight text-foreground line-clamp-2">
            {values.name}
          </h4>
          <div className="mt-auto flex items-center justify-between pt-1.5">
            {values.price !== null && (
              <span className="text-sm font-bold text-foreground">
                &euro;{values.price.toFixed(2)}
              </span>
            )}
            <button
              type="button"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); addItem({ objectID: product.objectID, ...values }) }}
              className="ml-auto flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground transition-transform hover:scale-105"
              aria-label="Add to cart">
              <ShoppingCart className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

const ProductSkeleton = () => (
  <div className="flex w-[160px] shrink-0 flex-col overflow-hidden rounded-card border border-border bg-card">
    <div className="flex h-[140px] items-center justify-center bg-muted/30 p-3">
      <div className="h-full w-full animate-pulse rounded bg-muted" />
    </div>
    <div className="flex flex-1 flex-col gap-1.5 p-2.5">
      <div className="h-2.5 w-16 animate-pulse rounded bg-muted" />
      <div className="h-3 w-full animate-pulse rounded bg-muted" />
      <div className="mt-auto flex items-center justify-between pt-1.5">
        <div className="h-4 w-12 animate-pulse rounded bg-muted" />
        <div className="h-7 w-7 animate-pulse rounded-full bg-muted" />
      </div>
    </div>
  </div>
)

// --- Group Card ---

const GroupCard = ({
  group,
  products,
}: {
  group: PartialGroup
  products: Map<string, AlgoliaRecord>
}) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.2 }}
    className="rounded-card border border-border bg-card p-4">
    {group.title && <h3 className="text-sm font-bold text-foreground">{group.title}</h3>}
    {group.why && <p className="mb-3 text-xs text-muted-foreground">{group.why}</p>}
    <div className="flex gap-3 overflow-x-auto pb-1">
      {group.products.map((dp) => {
        const product = products.get(dp.objectID)
        if (!product) return <ProductSkeleton key={dp.objectID} />
        return <ProductCard key={dp.objectID} product={product} />
      })}
    </div>
  </motion.div>
)

// --- Streaming State (local, event-driven) ---

interface StreamState {
  active: boolean
  intro: string
  groups: PartialGroup[]
  products: Map<string, AlgoliaRecord>
  followUpText: string
}

const INITIAL_STATE: StreamState = {
  active: false,
  intro: '',
  groups: [],
  products: new Map(),
  followUpText: '',
}

// --- Main Component ---

export const StreamingDisplay = () => {
  const [state, setState] = useState<StreamState>(INITIAL_STATE)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [injected, setInjected] = useState(false)

  // Listen for streaming events from the SSE interceptor
  useEffect(() => {
    const onStart = () => {
      console.log('[StreamingDisplay] start')
      // Remove old injected node if exists (new conversation)
      if (containerRef.current?.parentNode) {
        containerRef.current.remove()
      }

      // Inject inside .ais-ChatMessage-message — the container that holds
      // both the tool div and the text span. CSS flexbox + order handles
      // the visual ordering (tool → streaming display → text).
      const injectNow = () => {
        if (!containerRef.current) return false

        // Find the last assistant message's .ais-ChatMessage-message div
        const msgDivs = document.querySelectorAll('.ais-ChatMessage--left .ais-ChatMessage-message')
        const lastMsgDiv = msgDivs[msgDivs.length - 1]

        if (lastMsgDiv) {
          lastMsgDiv.appendChild(containerRef.current)
          setInjected(true)
          return true
        }

        // Fallback: try the scroll content
        const scrollContent = document.querySelector('.ais-ChatMessages-content')
        if (scrollContent) {
          scrollContent.appendChild(containerRef.current)
          setInjected(true)
          return true
        }
        return false
      }

      if (!injectNow()) {
        // Retry — the message DOM might not exist yet
        setTimeout(injectNow, 50)
        setTimeout(injectNow, 150)
        setTimeout(injectNow, 300)
      }

      setState({ active: true, intro: '', groups: [], products: new Map(), followUpText: '' })
    }

    const onIntro = (e: Event) => {
      const { intro } = (e as CustomEvent).detail
      console.log('[StreamingDisplay] intro:', intro)
      setState((s) => ({ ...s, intro }))
    }

    const onGroupsUpdate = (e: Event) => {
      const { groups } = (e as CustomEvent).detail
      console.log('[StreamingDisplay] groups-update:', groups.length, 'total products:', groups.reduce((s: number, g: any) => s + (g.products?.length ?? 0), 0))
      setState((s) => ({ ...s, groups }))
    }

    const onProductData = (e: Event) => {
      const { objectID, product } = (e as CustomEvent).detail
      console.log('[StreamingDisplay] product-data:', objectID, !!product)
      setState((s) => {
        const next = new Map(s.products)
        next.set(objectID, product)
        return { ...s, products: next }
      })
    }

    const onEnd = () => {
      console.log('[StreamingDisplay] end, products in state:', )
      setState((s) => { console.log('  products count:', s.products.size); return { ...s, active: false } })
    }

    // Watch for chat clear — the widget adds a clearing CSS class
    const onClear = () => {
      console.log('[StreamingDisplay] chat cleared')
      setState(INITIAL_STATE)
      setInjected(false)
      // Remove the injected DOM node if it exists
      containerRef.current?.remove()
    }

    // Observe the clear button click
    const clearBtn = document.querySelector('.ais-ChatHeader-clear')
    clearBtn?.addEventListener('click', onClear)

    // Capture follow-up text from completion 2
    const onTextDelta = (e: Event) => {
      const { delta } = (e as CustomEvent).detail
      setState((s) => ({ ...s, followUpText: s.followUpText + delta }))
    }

    window.addEventListener('streaming:start', onStart)
    window.addEventListener('streaming:intro', onIntro)
    window.addEventListener('streaming:groups-update', onGroupsUpdate)
    window.addEventListener('streaming:product-data', onProductData)
    window.addEventListener('streaming:end', onEnd)
    window.addEventListener('streaming:text-delta', onTextDelta)

    return () => {
      clearBtn?.removeEventListener('click', onClear)
      window.removeEventListener('streaming:start', onStart)
      window.removeEventListener('streaming:intro', onIntro)
      window.removeEventListener('streaming:groups-update', onGroupsUpdate)
      window.removeEventListener('streaming:product-data', onProductData)
      window.removeEventListener('streaming:end', onEnd)
      window.removeEventListener('streaming:text-delta', onTextDelta)
    }
  }, [])

  // Inject our container div into the chat's message scroll area
  useEffect(() => {
    if (!state.active && !injected) return
    if (injected) return

    const inject = () => {
      const scrollContent = document.querySelector('.ais-ChatMessages-content')
      if (!scrollContent || !containerRef.current) return false
      scrollContent.appendChild(containerRef.current)
      setInjected(true)

      // Auto-scroll the chat to bottom
      const scrollEl = scrollContent.closest('.ais-ChatMessages-scroll')
      if (scrollEl) scrollEl.scrollTop = scrollEl.scrollHeight

      return true
    }

    if (!inject()) {
      const t1 = setTimeout(inject, 100)
      const t2 = setTimeout(inject, 300)
      const t3 = setTimeout(inject, 600)
      return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
    }
  }, [state.active, injected])

  // Auto-scroll when new content appears
  useEffect(() => {
    if (!injected) return
    const scrollEl = containerRef.current?.closest('.ais-ChatMessages-scroll')
    if (scrollEl) {
      requestAnimationFrame(() => { scrollEl.scrollTop = scrollEl.scrollHeight })
    }
  }, [state.intro, state.groups.length, state.products.size, injected])

  // Don't render anything if no streaming has occurred
  if (!state.active && state.groups.length === 0) {
    return <div ref={containerRef} style={{ display: 'none' }} />
  }

  return (
    <div
      ref={containerRef}
      className="streaming-display flex flex-col gap-3 py-2"
      style={{ display: state.groups.length === 0 && !state.intro ? 'none' : undefined }}>
      {/* Intro text */}
      {state.intro && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="rounded-card border border-border bg-muted/30 p-3 text-sm text-foreground">
          {state.intro}
        </motion.div>
      )}

      {/* Product groups */}
      {state.groups.map((group, i) => (
        <GroupCard
          key={group.title ?? `group-${i}`}
          group={group}
          products={state.products}
        />
      ))}

      {/* Streaming indicator */}
      {state.active && (
        <div className="flex items-center gap-2.5 px-2 py-2">
          <motion.div
            className="h-3 w-3 rounded-full bg-muted-foreground/40"
            animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.7, 0.4] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          />
          <span className="text-sm text-muted-foreground">
            {state.groups.length === 0 ? 'Organizing results...' : 'Loading more...'}
          </span>
        </div>
      )}

      {/* Follow-up text is rendered by the widget itself as a <span> sibling
          after our streaming-display div. The DOM order is correct:
          tool → streaming-display → text span. No need to render it ourselves. */}
    </div>
  )
}
