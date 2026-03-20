'use client'

import { useAtomValue } from 'jotai'

import { activeConfigAtom } from '@/stores/activeConfig'

export const useActiveConfig = () => {
  const activeConfig = useAtomValue(activeConfigAtom)

  return {
    name: activeConfig?.name,
    slug: activeConfig?.slug,
    description: activeConfig?.description,
    assets: activeConfig?.assets,
    theme: activeConfig?.theme,
    navigation: activeConfig?.navigation,
    algolia: activeConfig?.algolia,
  }
}
