'use client'

import { useAtom } from 'jotai'
import { useCallback, useMemo } from 'react'

import { useActiveConfig } from '@/hooks/useActiveConfig'
import { getCartAtom, type CartItem } from '@/stores/cart'

type AddItemInput = Omit<CartItem, 'quantity'> & { quantity?: number }

export const useCart = () => {
  const { slug } = useActiveConfig()
  const vertical = slug ?? 'default'
  const [cart, setCart] = useAtom(getCartAtom(vertical))

  const addItem = useCallback(
    (item: AddItemInput) => {
      setCart((prev) => {
        const existingIndex = prev.items.findIndex(
          (i) => i.objectID === item.objectID,
        )

        if (existingIndex >= 0) {
          const updatedItems = [...prev.items]
          updatedItems[existingIndex] = {
            ...updatedItems[existingIndex],
            quantity:
              updatedItems[existingIndex].quantity + (item.quantity ?? 1),
          }
          return { items: updatedItems, updatedAt: Date.now() }
        }

        const newItem: CartItem = {
          objectID: item.objectID,
          name: item.name,
          image: item.image,
          price: item.price,
          brand: item.brand,
          quantity: item.quantity ?? 1,
        }
        return { items: [...prev.items, newItem], updatedAt: Date.now() }
      })
    },
    [setCart],
  )

  const removeItem = useCallback(
    (objectID: string) => {
      setCart((prev) => {
        return {
          items: prev.items.filter((i) => i.objectID !== objectID),
          updatedAt: Date.now(),
        }
      })
    },
    [setCart],
  )

  const updateQuantity = useCallback(
    (objectID: string, quantity: number) => {
      if (quantity <= 0) {
        removeItem(objectID)
        return
      }

      setCart((prev) => {
        return {
          items: prev.items.map((i) =>
            i.objectID === objectID ? { ...i, quantity } : i,
          ),
          updatedAt: Date.now(),
        }
      })
    },
    [setCart, removeItem],
  )

  const clearCart = useCallback(() => {
    setCart({ items: [], updatedAt: Date.now() })
  }, [setCart])

  const totalItems = useMemo(
    () => cart.items.reduce((sum, item) => sum + item.quantity, 0),
    [cart.items],
  )

  const totalPrice = useMemo(
    () =>
      cart.items.reduce(
        (sum, item) => sum + (item.price ?? 0) * item.quantity,
        0,
      ),
    [cart.items],
  )

  return {
    items: cart.items,
    totalItems,
    totalPrice,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
  }
}
