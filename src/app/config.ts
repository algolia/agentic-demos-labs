import type { VerticalConfig } from '@/types'

export const ecommerceConfig: VerticalConfig = {
  slug: '',
  name: 'Ecommerce',
  description:
    'A standard storefront experience with product listings, search, and shopping cart functionality.',
  assets: {
    favicon: '/images/ecommerce/S&W - Ecommerce - Monogram.svg',
    logo: '/images/ecommerce/S&W - Ecommerce - logo.svg',
    banner: '/images/ecommerce/Banner V1 - Ecommerce - HD - Hero.webp',
  },
  theme: 'ecommerce',
  navigation: {
    categories: [
      { label: 'Home', href: '/' },
      { label: 'Cart', href: '/cart' },
    ],
  },
  algolia: {
    appId: 'O5P8ZGQT18',
    apiKey: '2a2dbb804d63ef54c51b6f7f0f476e19',
    indices: {
      productsIndex: 'ecommerce_ns_prod',
      querySuggestionsIndex: 'ecommerce_ns_prod_query_suggestions',
      aiSuggestionsIndex: 'ai_suggestions',
    },
    facets: ['category', 'brand', 'price'],
    sortOptions: [
      { label: 'Relevance', value: 'ecommerce_ns_prod' },
      { label: 'Price: Low to High', value: 'ecommerce_ns_prod_price_asc' },
      { label: 'Price: High to Low', value: 'ecommerce_ns_prod_price_desc' },
    ],
    hitTemplate: {
      nameAttribute: 'name',
      imageAttribute: 'image',
      imageHrefPrefix:
        'https://fxqklbpngldowtbkqezm.supabase.co/storage/v1/object/public/product-images/',
      imageHrefSuffix: '',
      priceAttribute: 'price',
      brandAttribute: 'brand',
    },
  },
  features: {
    agentStudio: {
      filterSuggestionsAgentID: '28a3b041-70ea-4837-9e78-d51a0fae0607',
      shoppingAssistantAgentID: '2aea6c27-1121-4932-a93f-33fc2857a73d',
      questionSuggestionsAgentID: '13a8ed2c-f4bf-4c13-acd0-681fd07ead9a',
    },
  },
  carouselCategories: [
    { category: 'Electronics', label: 'Electronics' },
    {
      category: 'Clothing, Shoes & Jewelry',
      label: 'Clothing, Shoes & Jewelry',
    },
    { category: 'Home & Kitchen', label: 'Home & Kitchen' },
    { category: 'Sports & Outdoors', label: 'Sports' },
  ],
  merchandising: {
    categoryAttribute: 'categoryPageId',
    nestedSeparator: ' > ',
  },
}
