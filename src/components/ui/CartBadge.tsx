'use client'

import { ShoppingCart } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'

import { useCart } from '@/hooks/useCart'
import { cn } from '@/lib/utils'

interface CartBadgeProps {
  href: string
  className?: string
}

export const CartBadge = ({ href, className }: CartBadgeProps) => {
  const { totalItems } = useCart()
  const [hasMounted, setHasMounted] = useState(false)

  useEffect(() => {
    setHasMounted(true)
  }, [])

  return (
    <Link
      href={href}
      className={cn(
        'text-muted-foreground hover:text-foreground relative p-2 transition-colors',
        className,
      )}
      aria-label={`Cart with ${totalItems} items`}>
      <ShoppingCart className="h-5 w-5" />
      {hasMounted && totalItems > 0 && (
        <span className="bg-primary text-primary-foreground absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-medium">
          {totalItems > 99 ? '99+' : totalItems}
        </span>
      )}
    </Link>
  )
}
