'use client'

import { ProductListingPage } from '@/app/_components/ProductListingPage'
import { ecommerceConfig } from '@/app/config'
import { CategoryPage } from '@/components/category/CategoryPage'

const EcommerceCategoryPage = () => (
  <CategoryPage config={ecommerceConfig} indexId="category_plp_ecommerce">
    {(title) => <ProductListingPage title={title} />}
  </CategoryPage>
)

export default EcommerceCategoryPage
