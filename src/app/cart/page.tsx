'use client'

import Link from 'next/link'

import { CartItemCard } from '@/app/cart/_components/CartItemCard'
import { Button } from '@/components/ui/button/Button'
import { useCart } from '@/hooks/useCart'
import { useCheckout } from '@/hooks/useCheckout'

const CartPage = () => {
  const { items, totalItems, totalPrice, updateQuantity, removeItem } =
    useCart()
  const { checkout, canCheckout } = useCheckout('')

  const isEmpty = items.length === 0

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold">
        Shopping Cart {totalItems > 0 && `(${totalItems})`}
      </h1>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          {isEmpty ? (
            <div className="border-border bg-card rounded-card border p-8 text-center">
              <p className="text-muted-foreground">Your cart is empty.</p>
              <Link
                href="/search"
                className="text-primary mt-4 inline-block hover:underline">
                Continue Shopping
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <CartItemCard
                  key={item.objectID}
                  item={item}
                  onUpdateQuantity={updateQuantity}
                  onRemove={removeItem}
                />
              ))}
            </div>
          )}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="border-border bg-card rounded-card border p-6">
            <h2 className="mb-4 text-lg font-semibold">Order Summary</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>${totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span>{isEmpty ? 'Calculated at checkout' : 'Free'}</span>
              </div>
              <div className="border-border flex justify-between border-t pt-2 text-base font-semibold">
                <span>Total</span>
                <span>${totalPrice.toFixed(2)}</span>
              </div>
            </div>
            <Button
              onClick={checkout}
              disabled={!canCheckout}
              className="rounded-button mt-6 w-full py-3">
              Checkout
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CartPage
