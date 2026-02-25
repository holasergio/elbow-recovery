/**
 * Returns local date as YYYY-MM-DD string.
 * Unlike `toISOString().split('T')[0]` which gives UTC date,
 * this returns the date in the user's timezone.
 */
export function toLocalDateStr(date?: Date): string {
  const d = date ?? new Date()
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Returns local date string offset by N days from today.
 * Negative values = past, positive = future.
 */
export function toLocalDateStrOffset(daysOffset: number): string {
  const d = new Date()
  d.setDate(d.getDate() + daysOffset)
  return toLocalDateStr(d)
}
