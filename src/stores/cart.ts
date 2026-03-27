import { atomWithStorage } from 'jotai/utils'

export interface CartItem {
  objectID: string
  name: string
  image: string | null
  price: number | null
  brand: string | null
  quantity: number
}

export interface Cart {
  items: CartItem[]
  updatedAt: number
}

const initialCart: Cart = {
  items: [],
  updatedAt: 0,
}

const getStorageKey = (vertical: string) => `spencer-williams-${vertical}-cart`

const cartAtomCache = new Map<
  string,
  ReturnType<typeof atomWithStorage<Cart>>
>()

export const getCartAtom = (vertical: string) => {
  if (!cartAtomCache.has(vertical)) {
    cartAtomCache.set(
      vertical,
      atomWithStorage<Cart>(getStorageKey(vertical), initialCart),
    )
  }
  return cartAtomCache.get(vertical)!
}
