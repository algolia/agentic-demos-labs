export interface VerticalConfig {
  slug: string
  name: string
  description: string
  assets: {
    favicon: string
    logo: string
    banner: string
  }
  theme: string
  navigation: {
    categories: {
      label: string
      href: string
    }[]
  }
  algolia: {
    appId: string
    apiKey: string
    indices: {
      productsIndex: string
      querySuggestionsIndex: string
      aiSuggestionsIndex: string
    }
    facets: string[]
    sortOptions: { label: string; value: string }[]
    hitTemplate: {
      nameAttribute: string
      imageAttribute: string
      imageHrefPrefix?: string
      imageHrefSuffix?: string
      priceAttribute?: string
      brandAttribute?: string
    }
  }
  features: {
    agentStudio: {
      filterSuggestionsAgentID?: string
      shoppingAssistantAgentID?: string
      questionSuggestionsAgentID?: string
    }
  }
  carouselCategories?: {
    category: string
    label: string
  }[]
  merchandising?: {
    categoryAttribute: string
    nestedSeparator: string
  }
}

export interface Vertical {
  config: VerticalConfig
}
