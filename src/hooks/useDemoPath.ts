'use client'

import { usePathname } from 'next/navigation'

export const useDemoPath = () => {
  const pathname = usePathname()
  return pathname.split('/')[1]
}
