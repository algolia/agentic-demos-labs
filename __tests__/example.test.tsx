import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'

import {
  LandingHeader,
  LandingHero,
  VerticalCard,
} from '@/components/landing/Landing'
import type { Vertical } from '@/types'

describe('LandingHeader', () => {
  it('renders the site name', () => {
    render(<LandingHeader />)
    expect(screen.getByText('Spencer & Williams')).toBeInTheDocument()
  })
})

describe('LandingHero', () => {
  it('renders the main heading', () => {
    render(<LandingHero />)
    expect(
      screen.getByText('Choose Your Demo Experience'),
    ).toBeInTheDocument()
  })

  it('renders the description text', () => {
    render(<LandingHero />)
    expect(
      screen.getByText('Select a vertical to explore its unique design and features'),
    ).toBeInTheDocument()
  })
})

describe('VerticalCard', () => {
  const mockVertical: Vertical = {
    config: {
      slug: 'ecommerce',
      name: 'E-commerce',
      description: 'Shop the latest trends',
      assets: {
        favicon: '/ecommerce/favicon.ico',
        logo: '/ecommerce/logo.svg',
        banner: '/ecommerce/banner.jpg',
      },
      theme: 'ecommerce',
      navigation: {
        categories: [],
      },
      algolia: {
        appId: 'test-app-id',
        apiKey: 'test-api-key',
        indices: {
          productsIndex: 'test-products-index',
          querySuggestionsIndex: 'test-query-suggestions-index',
          aiSuggestionsIndex: 'test-ai-suggestions-index',
        },
        facets: [],
        sortOptions: [],
        hitTemplate: {
          nameAttribute: 'name',
          imageAttribute: 'image',
        },
      },
      features: {
        agentStudio: {
          filterSuggestionsAgentID: 'test-filter-suggestions-agent-id',
          shoppingAssistantAgentID: 'test-shopping-assistant-agent-id',
        },
      },
    },
  }

  it('renders the vertical name', () => {
    render(<VerticalCard {...mockVertical} />)
    expect(screen.getByText('E-commerce')).toBeInTheDocument()
  })

  it('renders the vertical description', () => {
    render(<VerticalCard {...mockVertical} />)
    expect(screen.getByText('Shop the latest trends')).toBeInTheDocument()
  })

  it('renders the explore link with correct href', () => {
    render(<VerticalCard {...mockVertical} />)
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/ecommerce')
  })

  it('renders the explore text', () => {
    render(<VerticalCard {...mockVertical} />)
    expect(screen.getByText('Explore E-commerce')).toBeInTheDocument()
  })
})
