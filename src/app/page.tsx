'use client'

import { CategoryGrid } from '@/app/_components/CategoryGrid'
import { FeaturedProducts } from '@/app/_components/FeaturedProducts'
import { HeroBanner } from '@/app/_components/HeroBanner'

const HomePage = () => (
  <div className="py-8">
    <HeroBanner />
    <div className="container mx-auto px-6">
      <FeaturedProducts />
      <CategoryGrid />
    </div>
  </div>
)

export default HomePage
