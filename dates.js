// Date helpers. Dates are represented as local "YYYY-MM-DD" strings throughout
// the app — simple to store, sort, and compare in Firestore.

export function todayISO() {
  return toISO(new Date())
}

export function toISO(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function fromISO(iso) {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function addDays(iso, delta) {
  const date = fromISO(iso)
  date.setDate(date.getDate() + delta)
  return toISO(date)
}

export function formatDisplayDate(iso) {
  const date = fromISO(iso)
  const today = todayISO()
  const yesterday = addDays(today, -1)
  if (iso === today) return 'Today'
  if (iso === yesterday) return 'Yesterday'
  return date.toLocaleDateString(undefined, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  })
}

export function formatShortDate(iso) {
  const date = fromISO(iso)
  return date.toLocaleDateString(undefined, { day: 'numeric', month: 'short' })
}

export function daysAgoISO(n) {
  return addDays(todayISO(), -n)
}

// Monday-start week boundaries for a given date.
export function startOfWeek(iso) {
  const date = fromISO(iso)
  const day = date.getDay() // 0 = Sunday .. 6 = Saturday
  const diffToMonday = day === 0 ? -6 : 1 - day
  return addDays(iso, diffToMonday)
}

export function endOfWeek(iso) {
  return addDays(startOfWeek(iso), 6)
}
