/** Deduplica conservando el primer orden de aparición. */
export function uniquePreserveOrder(codes: string[]): string[] {
  const seen = new Set<string>()
  const result: string[] = []
  for (const code of codes) {
    if (seen.has(code)) continue
    seen.add(code)
    result.push(code)
  }
  return result
}
