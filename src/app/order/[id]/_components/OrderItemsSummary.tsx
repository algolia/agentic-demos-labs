import type { Order } from '@/stores/order'

interface OrderItemsSummaryProps {
  order: Order
}

export const OrderItemsSummary = ({ order }: OrderItemsSummaryProps) => (
  <div className="border-border bg-card rounded-card border p-6">
    <h2 className="mb-4 text-lg font-semibold">Order Summary</h2>

    {/* Items List */}
    <div className="divide-border divide-y">
      {order.items.map((item) => (
        <div
          key={item.objectID}
          className="flex gap-3 py-3 first:pt-0 last:pb-0">
          {/* Thumbnail */}
          <div className="bg-muted h-16 w-16 shrink-0 overflow-hidden rounded-lg">
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
          <div className="flex flex-1 flex-col justify-center">
            <p className="text-sm leading-tight font-medium">{item.name}</p>
            {item.brand && (
              <p className="text-muted-foreground text-xs">{item.brand}</p>
            )}
            <p className="text-muted-foreground text-xs">
              Qty: {item.quantity}
            </p>
          </div>

          {/* Price */}
          <div className="flex items-center">
            <p className="text-sm font-medium">
              ${((item.price ?? 0) * item.quantity).toFixed(2)}
            </p>
          </div>
        </div>
      ))}
    </div>

    {/* Totals */}
    <div className="border-border mt-4 space-y-2 border-t pt-4 text-sm">
      <div className="flex justify-between">
        <span className="text-muted-foreground">Subtotal</span>
        <span>${order.subtotal.toFixed(2)}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-muted-foreground">Shipping</span>
        <span>
          {order.shipping === 0 ? 'Free' : `$${order.shipping.toFixed(2)}`}
        </span>
      </div>
      <div className="flex justify-between text-base font-semibold">
        <span>Total</span>
        <span>${order.total.toFixed(2)}</span>
      </div>
    </div>
  </div>
)
