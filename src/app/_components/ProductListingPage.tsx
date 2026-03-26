'use client'

import { SlidersHorizontal } from 'lucide-react'
import { Hits, Pagination, useStats } from 'react-instantsearch'

import { ecommerceConfig } from '@/app/config'
import { ClearAllButton } from '@/components/filters/ClearAllButton'
import { CurrentRefinements } from '@/components/filters/CurrentRefinements'
import { FilterSection } from '@/components/filters/FilterSection'
import { PriceRangeFacet } from '@/components/filters/PriceRangeFacet'
import { Hit } from '@/components/hit/Hit'
import { FilterSuggestionsWidget } from '@/components/results/FilterSuggestionsWidget'

const SearchStats = () => {
  const { nbHits } = useStats()
  return <span className="text-muted-foreground text-sm">{nbHits.toLocaleString()} results</span>
}

interface ProductListingPageProps {
  title: string
}

export const ProductListingPage = ({ title }: ProductListingPageProps) => (
  <div className="container mx-auto px-6 py-8">
    {/* Page Header */}
    <div className="mb-6">
      <div className="flex items-baseline gap-3">
        <h1 className="text-foreground text-2xl font-bold">{title}</h1>
        <SearchStats />
      </div>
    </div>

    <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
      {/* Filters Sidebar */}
      <aside className="lg:col-span-1">
        <div className="sticky top-4">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4" />
              <span className="font-medium">Filters</span>
            </div>
            <ClearAllButton />
          </div>

          <CurrentRefinements />

          <div className="divide-border divide-y">
            {ecommerceConfig.algolia.facets.map((facet, index) =>
              facet === 'price' ? (
                <PriceRangeFacet key={facet} defaultOpen={index < 2} />
              ) : (
                <FilterSection
                  key={facet}
                  title={facet}
                  attribute={facet}
                  defaultOpen={index < 2}
                />
              ),
            )}
          </div>
        </div>
      </aside>

      {/* Product Grid */}
      <div className="lg:col-span-3">
        {/* AI Filter Suggestions */}
        <div className="mb-6">
          <FilterSuggestionsWidget
            variant="standard"
            agentId={
              ecommerceConfig.features.agentStudio.filterSuggestionsAgentID
            }
            attributes={ecommerceConfig.algolia.facets.filter(
              (f) => f !== 'price',
            )}
          />
        </div>

        <Hits
          hitComponent={({ hit }) => (
            <Hit
              variant="card"
              hit={hit}
              template={ecommerceConfig.algolia.hitTemplate}
            />
          )}
          classNames={{
            list: 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6',
            item: 'h-full w-full',
          }}
        />

        {/* Pagination */}
        <div className="mt-10">
          <Pagination
            classNames={{
              root: 'flex justify-center',
              list: 'flex items-center gap-1',
              item: '',
              link: 'flex h-10 w-10 items-center justify-center rounded-button border border-border text-sm font-medium transition-colors hover:bg-muted/50',
              selectedItem:
                '[&>a]:bg-foreground [&>a]:text-background [&>a]:border-foreground',
              disabledItem: '[&>a]:opacity-40 [&>a]:cursor-not-allowed',
            }}
          />
        </div>
      </div>
    </div>
  </div>
)
