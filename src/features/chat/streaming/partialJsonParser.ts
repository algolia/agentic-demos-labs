/**
 * partialJsonParser — Extracts structured data from a partial JSON string.
 *
 * As the Agent Studio SSE stream sends `tool-input-delta` events, we accumulate
 * the raw JSON string for the `displayResults` tool. This parser uses regex to
 * extract complete fields as they appear, without waiting for the full JSON.
 *
 * ## What it extracts
 *
 * - `intro` — The intro text (e.g., "Here are some gaming laptops:")
 * - `groups` — Array of groups, each with title, why, and product objectIDs
 * - `objectIDs` — All complete objectIDs found so far (used to trigger fetches)
 *
 * The parser is stateless — you call it with the accumulated string each time
 * and it returns whatever it can extract from the current state.
 */

export interface PartialProduct {
  objectID: string
  why: string
}

export interface PartialGroup {
  title: string
  why: string
  products: PartialProduct[]
}

export interface ParsedStreamState {
  intro: string
  groups: PartialGroup[]
  allObjectIDs: string[]
}

/**
 * Extract the intro text from partial JSON.
 * Looks for: "intro":"some text"
 */
const extractIntro = (raw: string): string => {
  const match = raw.match(/"intro"\s*:\s*"([^"]*)"/)
  return match?.[1] ?? ''
}

/**
 * Extract all complete groups from partial JSON.
 * A group is complete when we can find its closing `]}` after the products array.
 * We also extract partially complete groups (title + why but incomplete products).
 */
const extractGroups = (raw: string): PartialGroup[] => {
  const groups: PartialGroup[] = []

  // Find the groups array start
  const groupsStart = raw.indexOf('"groups":[')
  if (groupsStart === -1) return groups

  const groupsContent = raw.slice(groupsStart + '"groups":['.length)

  // Split by group boundaries — each group starts with {"title"
  // We use a regex to find complete and partial group objects
  const groupPattern = /\{"title"\s*:\s*"([^"]*)"\s*,\s*"why"\s*:\s*"([^"]*)"\s*,\s*"products"\s*:\s*\[([^\]]*)\]?\s*\}?/g
  let match

  while ((match = groupPattern.exec(groupsContent)) !== null) {
    const title = match[1]
    const why = match[2]
    const productsRaw = match[3]

    // Extract products from this group
    const products: PartialProduct[] = []
    const productPattern = /\{"objectID"\s*:\s*"([^"]*)"\s*,\s*"why"\s*:\s*"([^"]*)"\s*\}/g
    let prodMatch

    while ((prodMatch = productPattern.exec(productsRaw)) !== null) {
      products.push({ objectID: prodMatch[1], why: prodMatch[2] })
    }

    if (title) {
      groups.push({ title, why, products })
    }
  }

  return groups
}

/**
 * Extract all complete objectIDs from the partial JSON string.
 * An objectID is complete when we find: "objectID":"XXXXX"
 */
const extractObjectIDs = (raw: string): string[] => {
  const ids: string[] = []
  const pattern = /"objectID"\s*:\s*"([^"]+)"/g
  let match
  while ((match = pattern.exec(raw)) !== null) {
    ids.push(match[1])
  }
  return ids
}

/**
 * Parse the accumulated raw JSON string and return whatever structured data
 * can be extracted from its current state.
 */
export const parsePartialJson = (raw: string): ParsedStreamState => ({
  intro: extractIntro(raw),
  groups: extractGroups(raw),
  allObjectIDs: extractObjectIDs(raw),
})
