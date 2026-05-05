'use client'

import { ShoppingCart } from 'lucide-react'
import { motion } from 'motion/react'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'

import { ecommerceConfig } from '@/app/config'
import { useCart } from '@/hooks/useCart'
import { getHitValues } from '@/utilities/getHitValues'

import type { Tools } from 'react-instantsearch'

type ToolLayoutComponent = NonNullable<Tools[string]['layoutComponent']>
type DisplayResultsProps = Parameters<ToolLayoutComponent>[0]

type AlgoliaRecord = Record<string, unknown> & { objectID: string }

type PartialProduct = { objectID?: string; why?: string }
type PartialGroup = { title?: string; why?: string; products?: PartialProduct[] }
type DisplayResultsInput = {
  intro?: string
  groups?: PartialGroup[]
}

const fetchProductsByIds = async (
  objectIDs: string[],
): Promise<AlgoliaRecord[]> => {
  if (objectIDs.length === 0) return []
  const { appId, apiKey, indices } = ecommerceConfig.algolia
  const res = await fetch(
    `https://${appId}-dsn.algolia.net/1/indexes/*/objects`,
    {
      method: 'POST',
      headers: {
        'X-Algolia-Application-Id': appId,
        'X-Algolia-API-Key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        requests: objectIDs.map((id) => ({
          indexName: indices.productsIndex,
          objectID: id,
        })),
      }),
    },
  )
  if (!res.ok) {
    throw new Error(`Failed to fetch products: ${res.status}`)
  }
  const data = await res.json()
  return (Array.isArray(data.results) ? data.results : []).filter(Boolean)
}

const ProductCard = ({ product }: { product: AlgoliaRecord }) => {
  const { addItem } = useCart()
  const values = getHitValues(product, ecommerceConfig.algolia.hitTemplate)

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      className="group relative flex w-[160px] shrink-0 flex-col overflow-hidden rounded-card border border-border bg-card transition-shadow hover:shadow-md">
      <Link
        href={`/product/${product.objectID}`}
        aria-label={values.name}
        className="absolute inset-0 z-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring"
      />
      <div className="flex h-[140px] items-center justify-center bg-muted/30 p-3">
        {values.image ? (
          <img
            src={values.image}
            alt={values.name}
            className="h-full w-full object-contain"
          />
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
            onClick={() => addItem({ objectID: product.objectID, ...values })}
            className="relative z-10 ml-auto flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-primary text-primary-foreground transition-transform hover:scale-105"
            aria-label="Add to cart">
            <ShoppingCart className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
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

const GroupCard = ({
  group,
  products,
}: {
  group: PartialGroup
  products: Map<string, AlgoliaRecord>
}) => {
  const items = group.products ?? []
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="rounded-card border border-border bg-card p-4">
      {group.title && (
        <h3 className="text-sm font-bold text-foreground">{group.title}</h3>
      )}
      {group.why && (
        <p className="mb-3 text-xs text-muted-foreground">{group.why}</p>
      )}
      <div className="flex gap-3 overflow-x-auto pb-1">
        {items.map((dp, i) => {
          if (!dp?.objectID) {
            return <ProductSkeleton key={`pending-${i}`} />
          }
          const product = products.get(dp.objectID)
          if (!product) return <ProductSkeleton key={dp.objectID} />
          return <ProductCard key={dp.objectID} product={product} />
        })}
      </div>
    </motion.div>
  )
}

const collectObjectIDs = (input: DisplayResultsInput | undefined): string[] => {
  if (!input?.groups) return []
  const ids: string[] = []
  for (const group of input.groups) {
    for (const product of group?.products ?? []) {
      if (typeof product?.objectID === 'string' && product.objectID.length > 0) {
        ids.push(product.objectID)
      }
    }
  }
  return ids
}

export const DisplayResults = (props: DisplayResultsProps) => {
  const { message } = props

  const input = (
    'input' in message ? (message.input as DisplayResultsInput | undefined) : undefined
  ) ?? undefined
  const output =
    message.state === 'output-available'
      ? (message.output as DisplayResultsInput | undefined)
      : undefined
  const data = output ?? input

  const isStreaming = message.state === 'input-streaming'
  const intro = data?.intro ?? ''
  const groups = data?.groups ?? []

  const [products, setProducts] = useState<Map<string, AlgoliaRecord>>(
    () => new Map(),
  )
  const [retryNonce, setRetryNonce] = useState(0)
  const inFlightIds = useRef<Set<string>>(new Set())
  const retryAttempts = useRef(0)

  useEffect(() => {
    const ids = Array.from(new Set(collectObjectIDs(data)))
    const idsToFetch = ids.filter(
      (id) => !products.has(id) && !inFlightIds.current.has(id),
    )
    if (idsToFetch.length === 0) return

    for (const id of idsToFetch) inFlightIds.current.add(id)

    let cancelled = false
    fetchProductsByIds(idsToFetch)
      .then((records) => {
        if (cancelled) return
        retryAttempts.current = 0
        if (records.length === 0) return
        setProducts((prev) => {
          const next = new Map(prev)
          for (const record of records) {
            if (record?.objectID) next.set(record.objectID, record)
          }
          return next
        })
      })
      .catch(() => {
        if (cancelled) return
        // Schedule a bounded retry with exponential backoff so a transient
        // network/API failure doesn't permanently leave cards as skeletons.
        if (retryAttempts.current >= 3) return
        const delay = 1000 * 2 ** retryAttempts.current
        retryAttempts.current += 1
        setTimeout(() => {
          if (!cancelled) setRetryNonce((n) => n + 1)
        }, delay)
      })
      .finally(() => {
        for (const id of idsToFetch) inFlightIds.current.delete(id)
      })

    return () => {
      cancelled = true
    }
  }, [data, products, retryNonce])

  if (!intro && groups.length === 0) {
    return isStreaming ? (
      <div className="flex items-center gap-2.5 px-2 py-2">
        <motion.div
          className="h-3 w-3 rounded-full bg-muted-foreground/40"
          animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        />
        <span className="text-sm text-muted-foreground">
          Organizing results...
        </span>
      </div>
    ) : (
      <></>
    )
  }

  return (
    <div className="streaming-display flex flex-col gap-3 py-2">
      {intro && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="rounded-card border border-border bg-muted/30 p-3 text-sm text-foreground">
          {intro}
        </motion.div>
      )}

      {groups.map((group, i) => (
        <GroupCard key={`group-${i}`} group={group ?? {}} products={products} />
      ))}

      {isStreaming && (
        <div className="flex items-center gap-2.5 px-2 py-2">
          <motion.div
            className="h-3 w-3 rounded-full bg-muted-foreground/40"
            animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.7, 0.4] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          />
          <span className="text-sm text-muted-foreground">
            {groups.length === 0 ? 'Organizing results...' : 'Loading more...'}
          </span>
        </div>
      )}
    </div>
  )
}
