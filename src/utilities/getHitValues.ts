import type { VerticalConfig } from '@/types/verticalConfig.types'
import { getByPath } from '@/utilities/getByPath'

type HitTemplate = VerticalConfig['algolia']['hitTemplate']

export interface HitValues {
  name: string
  brand: string | null
  image: string | null
  price: number | null
}

interface ImageUrlOptions {
  prefix?: string
  suffix?: string
}

export const buildImageUrl = (
  rawImage: string | null | undefined,
  options: ImageUrlOptions = {},
): string | null => {
  if (!rawImage) return null
  const prefix = options.prefix ?? ''
  const suffix = options.suffix ?? ''
  return `${prefix}${rawImage}${suffix}`
}

export const getHitValues = (
  item: Record<string, unknown>,
  template: HitTemplate,
): HitValues => {
  const name = String(getByPath(item, template.nameAttribute, ''))

  const brandValue = template.brandAttribute
    ? getByPath(item, template.brandAttribute, '')
    : null
  const brand = brandValue ? String(brandValue) : null

  const imagePath = getByPath(item, template.imageAttribute, '') as string
  const image = buildImageUrl(imagePath, {
    prefix: template.imageHrefPrefix,
    suffix: template.imageHrefSuffix,
  })

  const priceValue = template.priceAttribute
    ? getByPath(item, template.priceAttribute)
    : null
  const price = priceValue != null ? Number(priceValue) : null

  return { name, brand, image, price: price && !isNaN(price) ? price : null }
}
