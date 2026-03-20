'use client'

import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { Configure, Index } from 'react-instantsearch'

import { ProductCarousel } from '@/app/_components/ProductCarousel'
import { ecommerceConfig as config } from '@/app/config'

export const FeaturedProducts = () => (
  <section className="mb-16">
    <Index
      indexName={config.algolia.indices.productsIndex}
      indexId="carousel_homepage">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-foreground text-2xl font-bold">
            Featured Products
          </h2>
          <p className="text-muted-foreground mt-1">
            Handpicked favorites just for you
          </p>
        </div>
        <Link
          href="/search"
          className="text-accent group flex items-center gap-1.5 text-sm font-medium">
          <span className="transition-transform group-hover:-translate-x-0.5">
            View all
          </span>
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
      {/* Configure widget for Algolia rules/filters */}
      <Configure
        hitsPerPage={8}
        ruleContexts={['homepage_featured_ecommerce']}
        query=""
      />

      <ProductCarousel />
    </Index>
  </section>
)
