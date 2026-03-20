export const getByPath = <T = unknown>(
  obj: Record<string, unknown> | null | undefined,
  path: string,
  defaultValue?: T,
): T => {
  if (!obj || !path) return defaultValue as T

  // Convert bracket notation to dot notation: items[0].name -> items.0.name
  const normalizedPath = path.replace(/\[(\d+)\]/g, '.$1')

  const result = normalizedPath
    .split('.')
    .filter(Boolean) // Handle edge cases like leading dots
    .reduce<unknown>(
      (acc, key) =>
        acc && typeof acc === 'object'
          ? (acc as Record<string, unknown>)[key]
          : undefined,
      obj,
    )

  return (result !== undefined ? result : defaultValue) as T
}
