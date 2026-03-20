'use client'

import { Minus, Plus, Trash2 } from 'lucide-react'

import type { CartItem } from '@/stores/cart'

interface CartItemCardProps {
  item: CartItem
  onUpdateQuantity: (objectID: string, quantity: number) => void
  onRemove: (objectID: string) => void
}

export const CartItemCard = ({
  item,
  onUpdateQuantity,
  onRemove,
}: CartItemCardProps) => (
  <div className="border-border bg-card rounded-card flex gap-4 border p-4">
    {/* Image */}
    <div className="bg-muted h-24 w-24 shrink-0 overflow-hidden rounded-lg">
      {item.image ? (
        <img
          src={item.image}
          alt={item.name}
          className="h-full w-full object-contain"
        />
      ) : (
        <div className="text-muted-foreground flex h-full items-center justify-center text-xs">
          No image
        </div>
      )}
    </div>

    {/* Details */}
    <div className="flex flex-1 flex-col">
      <div className="flex items-start justify-between">
        <div>
          {item.brand && (
            <p className="text-muted-foreground text-xs tracking-wide uppercase">
              {item.brand}
            </p>
          )}
          <h3 className="font-semibold">{item.name}</h3>
        </div>
        <button
          type="button"
          onClick={() => onRemove(item.objectID)}
          className="text-muted-foreground hover:text-destructive cursor-pointer p-1 transition-colors"
          aria-label="Remove item">
          <Trash2 className="h-5 w-5" />
        </button>
      </div>

      <div className="mt-auto flex items-center justify-between pt-2">
        {/* Quantity controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onUpdateQuantity(item.objectID, item.quantity - 1)}
            className="border-border bg-background hover:bg-muted flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border transition-colors"
            aria-label="Decrease quantity">
            <Minus className="h-4 w-4" />
          </button>
          <span className="w-8 text-center font-medium">{item.quantity}</span>
          <button
            type="button"
            onClick={() => onUpdateQuantity(item.objectID, item.quantity + 1)}
            className="border-border bg-background hover:bg-muted flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border transition-colors"
            aria-label="Increase quantity">
            <Plus className="h-4 w-4" />
          </button>
        </div>

        {/* Price */}
        <p className="font-semibold">
          ${((item.price ?? 0) * item.quantity).toFixed(2)}
        </p>
      </div>
    </div>
  </div>
)
