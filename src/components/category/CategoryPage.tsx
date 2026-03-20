'use client'

import { useParams } from 'next/navigation'
import { Configure, Index } from 'react-instantsearch'

import { useScrollToTop } from '@/hooks/useScrollToTop'
import type { VerticalConfig } from '@/types'
import { getCategoryFilter } from '@/utilities/getCategorySlug'

interface CategoryPageProps {
  config: Pick<
    VerticalConfig,
    'carouselCategories' | 'merchandising' | 'algolia'
  >
  indexId: string
  children: (title: string) => React.ReactNode
}

export const CategoryPage = ({
  config,
  indexId,
  children,
}: CategoryPageProps) => {
  const { slug } = useParams<{ slug: string }>()

  const { categoryName, categoryFilter } = getCategoryFilter(slug, config)

  useScrollToTop()

  return (
    <Index indexName={config.algolia.indices.productsIndex} indexId={indexId}>
      <Configure filters={categoryFilter} query="" />
      {children(categoryName)}
    </Index>
  )
}
