'use client'

import { useSetAtom } from 'jotai'
import { useRouter } from 'next/navigation'
import { useCallback } from 'react'

import { useActiveConfig } from '@/hooks/useActiveConfig'
import { useCart } from '@/hooks/useCart'
import { getOrderAtom, type Order } from '@/stores/order'

const generateOrderId = (): string => {
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 8).toUpperCase()
  return `SW-${timestamp}-${random}`
}

export const useCheckout = (basePath: string = '') => {
  const router = useRouter()
  const { slug } = useActiveConfig()
  const vertical = slug ?? 'default'
  const { items, totalPrice } = useCart()
  const setOrder = useSetAtom(getOrderAtom(vertical))

  const checkout = useCallback(() => {
    if (items.length === 0) return

    const orderId = generateOrderId()
    const shipping = 0 // Free shipping

    const order: Order = {
      id: orderId,
      items: [...items],
      subtotal: totalPrice,
      shipping,
      total: totalPrice + shipping,
      createdAt: Date.now(),
    }

    setOrder(order)
    router.push(`${basePath}/order/${orderId}`)
  }, [items, totalPrice, setOrder, router, basePath])

  return { checkout, canCheckout: items.length > 0 }
}
