'use client'

import Image from 'next/image'
import Link from 'next/link'

import { ecommerceConfig } from '@/app/config'
import { useCategoryImages } from '@/hooks/useCategoryImages'
import { getCategorySlug } from '@/utilities/getCategorySlug'

export const CategoryGrid = () => {
  const { carouselCategories, imageMap } = useCategoryImages(ecommerceConfig)

  return (
    <section className="mb-16">
      <h2 className="text-foreground mb-8 text-2xl font-bold">
        Shop by Category
      </h2>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {carouselCategories.map(({ category, label }) => {
          const slug = getCategorySlug(category)
          const imageUrl = imageMap.get(category)

          return (
            <Link
              key={slug}
              href={`/category/${slug}`}
              className="group rounded-card relative flex aspect-square items-center justify-center overflow-hidden transition-all hover:shadow-lg">
              <div className="bg-card absolute inset-0 transition-transform duration-500 ease-out group-hover:scale-105">
                {imageUrl && (
                  <Image
                    src={imageUrl}
                    alt={label}
                    fill
                    className="h-full w-full object-contain p-6"
                  />
                )}
              </div>
              <div className="absolute inset-0 bg-linear-to-t from-black/40 to-black/10 group-hover:from-black/50" />
              <span className="relative text-lg font-semibold text-white">
                {label}
              </span>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
