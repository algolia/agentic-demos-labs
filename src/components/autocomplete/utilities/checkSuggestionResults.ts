interface AutocompleteIndex {
  indexName: string
  results?: { nbHits?: number }
}

interface IndicesConfig {
  querySuggestionsIndex?: string
  aiSuggestionsIndex?: string
}

export const checkSuggestionResults = (
  indices: AutocompleteIndex[],
  indicesConfig: IndicesConfig | undefined,
  options: { showSuggestions: boolean; showAISuggestions: boolean },
): boolean =>
  indices.some((index) => {
    const isRelevantIndex =
      (options.showSuggestions &&
        index.indexName === indicesConfig?.querySuggestionsIndex) ||
      (options.showAISuggestions &&
        index.indexName === indicesConfig?.aiSuggestionsIndex)

    if (!isRelevantIndex) return false
    return (index.results?.nbHits ?? 0) > 0
  })
