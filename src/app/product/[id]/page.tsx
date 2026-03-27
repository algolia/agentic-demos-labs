'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'

import { ecommerceConfig } from '@/app/config'
import {
  ProductActions,
  ProductBreadcrumb,
  ProductInfo,
} from '@/app/product/[id]/_components'
import { ProductImageGallery } from '@/components/product/ProductImageGallery'
import { useProduct, type ProductHit } from '@/hooks/useProduct'

const ProductContent = ({ product }: { product: ProductHit }) => {
  const imagePrefix = ecommerceConfig.algolia.hitTemplate.imageHrefPrefix
  const mainImage = product.image ? `${imagePrefix}${product.image}` : null
  const images = mainImage ? [mainImage, mainImage, mainImage, mainImage] : []

  return (
    <div className="container mx-auto px-6 py-8">
      <ProductBreadcrumb productName={product.name} />

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
        <ProductImageGallery images={images} productName={product.name} />

        <div className="space-y-5">
          <ProductInfo name={product.name} brand={product.brand} />
          <ProductActions product={product} />
        </div>
      </div>
    </div>
  )
}

const EcommerceProductPage = () => {
  const params = useParams()
  const productId = params.id as string

  const { data: product, isLoading, isError } = useProduct(productId)

  if (isLoading) {
    return (
      <div className="container mx-auto px-6 py-16 text-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  }

  if (isError || !product) {
    return (
      <div className="container mx-auto px-6 py-16 text-center">
        <p className="text-muted-foreground">Product not found</p>
        <Link
          href="/search"
          className="text-accent mt-4 inline-block hover:underline">
          Back to products
        </Link>
      </div>
    )
  }

  return <ProductContent product={product} />
}

export default EcommerceProductPage
