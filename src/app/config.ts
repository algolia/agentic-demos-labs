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
    appId: '89ST1NWLPD',
    apiKey: '0cf3ba61a818531808a2f0f024b6e4ca',
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
      /**
       * Agent Studio agent IDs — find these in the Algolia dashboard:
       * Generative AI > Agent Studio > Agents > [Your Agent] > Settings
       *
       * When shoppingAssistantAgentID is set, the app renders a floating chat
       * toggle button and an "AI mode" button in the search bar.
       * Leave empty to disable AI features.
       *
       * To create your agents, follow the guide in docs/agent-setup.md.
       */
      shoppingAssistantAgentID: '2aba4907-cecb-40ea-8a5a-3e872463a068',
      filterSuggestionsAgentID: '55649f0f-9588-440e-9fdc-02f4fe5de308',
      questionSuggestionsAgentID: 'cf2a684e-fe2d-4ba3-878a-e9d2c8e71c54',
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