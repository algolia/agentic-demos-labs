import { atomWithStorage } from 'jotai/utils'

import type { CartItem } from '@/stores/cart'

export interface Order {
  id: string
  items: CartItem[]
  subtotal: number
  shipping: number
  total: number
  createdAt: number
}

const getStorageKey = (vertical: string) => `spencer-williams-${vertical}-order`

const orderAtomCache = new Map<
  string,
  ReturnType<typeof atomWithStorage<Order | null>>
>()

export const getOrderAtom = (vertical: string) => {
  if (!orderAtomCache.has(vertical)) {
    orderAtomCache.set(
      vertical,
      atomWithStorage<Order | null>(getStorageKey(vertical), null),
    )
  }
  return orderAtomCache.get(vertical)!
}
