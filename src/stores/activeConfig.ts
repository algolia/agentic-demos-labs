import { atom } from 'jotai'

import type { VerticalConfig } from '@/types'

export const activeConfigAtom = atom<VerticalConfig | null>(null)
