import type {
  DisplayGroup,
  DisplayProduct,
  PartialDisplayGroup,
} from '@/features/aiAssistant/types'

interface ExtractedGroups {
  intro: string
  groups: DisplayGroup[]
  streamingGroup: PartialDisplayGroup | null
}

const parsePartialGroup = (partialStr: string): PartialDisplayGroup | null => {
  const result: PartialDisplayGroup = {
    title: null,
    why: null,
    products: [],
  }

  const titleMatch = partialStr.match(/"title"\s*:\s*"([^"]*)"/)
  if (titleMatch) {
    result.title = titleMatch[1]
  }

  const whyMatch = partialStr.match(/"why"\s*:\s*"([^"]*)"/)
  if (whyMatch) {
    result.why = whyMatch[1]
  }

  const productsStartMatch = partialStr.match(/"products"\s*:\s*\[/)
  if (productsStartMatch) {
    const productsStartIndex =
      productsStartMatch.index! + productsStartMatch[0].length
    const afterProductsStart = partialStr.slice(productsStartIndex)

    let depth = 0
    let currentProductStart = -1

    for (let i = 0; i < afterProductsStart.length; i++) {
      const char = afterProductsStart[i]

      if (char === '{') {
        if (depth === 0) currentProductStart = i
        depth++
      } else if (char === '}') {
        depth--
        if (depth === 0 && currentProductStart !== -1) {
          const productStr = afterProductsStart.slice(
            currentProductStart,
            i + 1,
          )
          try {
            const product = JSON.parse(productStr) as DisplayProduct
            if (product.objectID) result.products.push(product)
          } catch {
            // Skip invalid products
          }
          currentProductStart = -1
        }
      }
    }
  }

  return result.title ? result : null
}

const extractDisplayResultsStream = (jsonBuffer: string): ExtractedGroups => {
  const result: ExtractedGroups = {
    intro: '',
    groups: [],
    streamingGroup: null,
  }

  const introMatch = jsonBuffer.match(/"intro"\s*:\s*"([^"]*)"/)
  if (introMatch) {
    result.intro = introMatch[1]
  }

  const groupsStartMatch = jsonBuffer.match(/"groups"\s*:\s*\[/)
  if (!groupsStartMatch) return result

  const afterGroupsStart = jsonBuffer.slice(
    groupsStartMatch.index! + groupsStartMatch[0].length,
  )

  let depth = 0
  let currentGroupStart = -1
  const groupStrings: { str: string; complete: boolean }[] = []

  for (let i = 0; i < afterGroupsStart.length; i++) {
    const char = afterGroupsStart[i]

    if (char === '{') {
      if (depth === 0) currentGroupStart = i
      depth++
    } else if (char === '}') {
      depth--
      if (depth === 0 && currentGroupStart !== -1) {
        groupStrings.push({
          str: afterGroupsStart.slice(currentGroupStart, i + 1),
          complete: true,
        })
        currentGroupStart = -1
      }
    }
  }

  if (depth > 0 && currentGroupStart !== -1) {
    groupStrings.push({
      str: afterGroupsStart.slice(currentGroupStart),
      complete: false,
    })
  }

  for (const { str: groupStr, complete } of groupStrings) {
    if (complete) {
      try {
        const group = JSON.parse(groupStr) as DisplayGroup
        if (group.title && group.products) result.groups.push(group)
      } catch {
        // Skip invalid groups
      }
    } else {
      const partialGroup = parsePartialGroup(groupStr)
      if (partialGroup) result.streamingGroup = partialGroup
    }
  }

  return result
}

export { extractDisplayResultsStream, type ExtractedGroups }
