import type { VerticalConfig } from '@/types'

/**
 * Converts a category display name to a URL-friendly slug.
 * e.g. "Sports & Outdoors"         → "sports-outdoors"
 *      "Clothing, Shoes & Jewelry" → "clothing-shoes-jewelry"
 *      "Evening Wear"              → "evening-wear"
 */
export const getCategorySlug = (name: string): string =>
  name
    .toLowerCase()
    .replace(/[&,]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')

/**
 * Finds the category display name that matches the given URL slug.
 * Falls back to a humanized version of the slug if no match is found.
 */
const getCategoryFromSlug = (slug: string, categories: string[]): string =>
  categories.find((name) => getCategorySlug(name) === slug) ??
  slug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')

/**
 * Resolves a URL slug to a category name and returns the Algolia filter string.
 * Derives available categories and the filter attribute from the vertical config.
 */
export const getCategoryFilter = (
  slug: string,
  config: Pick<VerticalConfig, 'carouselCategories' | 'merchandising'>,
): { categoryName: string; categoryFilter: string } => {
  const categories = config.carouselCategories?.map((c) => c.category) ?? []
  const categoryName = getCategoryFromSlug(slug, categories)
  const categoryAttribute =
    config.merchandising?.categoryAttribute ?? 'categoryPageId'
  return {
    categoryName,
    categoryFilter: `${categoryAttribute}:"${categoryName}"`,
  }
}
