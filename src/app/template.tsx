'use client'

import { ViewTransition } from 'react'

const EcommerceTemplate = ({ children }: { children: React.ReactNode }) => (
  <ViewTransition enter="ecom-page-enter" exit="ecom-page-exit">
    {children}
  </ViewTransition>
)

export default EcommerceTemplate
