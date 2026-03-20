import { liteClient } from 'algoliasearch/lite'
import { atom } from 'jotai'

export const searchClientAtom = atom<ReturnType<typeof liteClient> | null>(null)
