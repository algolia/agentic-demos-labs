'use client'

import type { VerticalConfig } from '@/types/verticalConfig.types'
import {
  getHitValues,
  type HitValues as BaseHitValues,
} from '@/utilities/getHitValues'

import type { Hit as AlgoliaHit } from 'instantsearch.js'

export type HitTemplateConfig = VerticalConfig['algolia']['hitTemplate']

export interface HitValues extends BaseHitValues {
  objectID: string
  productUrl: string
}

interface HitBaseProps<THit extends object> {
  hit: AlgoliaHit<THit>
  template: HitTemplateConfig
  children: (values: HitValues, hit: AlgoliaHit<THit>) => React.ReactNode
}

export const HitBase = <THit extends object>({
  hit,
  template,
  children,
}: HitBaseProps<THit>) => {
  const record = hit as unknown as Record<string, unknown>

  const baseValues = getHitValues(record, template)

  const values: HitValues = {
    ...baseValues,
    objectID: hit.objectID,
    productUrl: `/product/${hit.objectID}`,
  }

  return <>{children(values, hit)}</>
}
