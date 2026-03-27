'use client'

import { useAtomValue } from 'jotai'
import Link from 'next/link'
import { useEffect } from 'react'

import { DeliveryTracker } from '@/app/order/[id]/_components/DeliveryTracker'
import { OrderItemsSummary } from '@/app/order/[id]/_components/OrderItemsSummary'
import { SuccessCheckmark } from '@/app/order/[id]/_components/SuccessCheckmark'
import { useActiveConfig } from '@/hooks/useActiveConfig'
import { useCart } from '@/hooks/useCart'
import { getOrderAtom } from '@/stores/order'

const OrderConfirmationPage = () => {
  const { slug } = useActiveConfig()
  const vertical = slug ?? 'default'
  const order = useAtomValue(getOrderAtom(vertical))
  const { clearCart } = useCart()

  useEffect(() => {
    clearCart()
  }, [clearCart])

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="mb-4 text-2xl font-bold">Order Not Found</h1>
        <p className="text-muted-foreground mb-6">
          We couldn&apos;t find this order. It may have expired.
        </p>
        <Link href="/search" className="text-primary hover:underline">
          Continue Shopping
        </Link>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Success Header */}
      <div className="mb-10 text-center">
        <SuccessCheckmark />
        <h1 className="mt-4 text-3xl font-bold">Order Confirmed</h1>
        <p className="text-muted-foreground mt-2">
          Thank you for your order! Your order number is{' '}
          <span className="text-foreground font-medium">{order.id}</span>
        </p>
      </div>

      <div className="space-y-6">
        <DeliveryTracker />
        <OrderItemsSummary order={order} />
      </div>
    </div>
  )
}

export default OrderConfirmationPage
