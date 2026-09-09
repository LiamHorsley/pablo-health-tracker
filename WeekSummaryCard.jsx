import { useEffect, useState } from 'react'
import { todayISO, startOfWeek, endOfWeek, addDays } from './dates.js'
import { watchFoodEntriesInRange } from './db.js'

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export default function WeekSummaryCard({ uid, target }) {
  const today = todayISO()
  const weekStart = startOfWeek(today)
  const weekEnd = endOfWeek(today)
  const [entries, setEntries] = useState([])

  useEffect(() => watchFoodEntriesInRange(uid, weekStart, weekEnd, setEntries), [uid, weekStart, weekEnd])

  const totals = new Map()
  for (const e of entries) {
    totals.set(e.date, (totals.get(e.date) || 0) + (e.calories || 0))
  }

  const days = []
  let cursor = weekStart
  for (let i = 0; i < 7; i++) {
    days.push({
      date: cursor,
      label: DAY_LABELS[i],
      calories: totals.get(cursor) || 0,
      isFuture: cursor > today,
      isToday: cursor === today,
    })
    cursor = addDays(cursor, 1)
  }

  const elapsedDays = days.filter((d) => !d.isFuture)
  const totalSoFar = elapsedDays.reduce((sum, d) => sum + d.calories, 0)
  const average = elapsedDays.length > 0 ? totalSoFar / elapsedDays.length : 0

  return (
    <section className="card">
      <h2 className="card-title">This week</h2>
      <ul className="week-list">
        {days.map((d) => (
          <li key={d.date} className={d.isToday ? 'week-row today' : 'week-row'}>
            <span className="week-day-label">
              {d.label}
              {d.isToday ? ' (today)' : ''}
            </span>
            {d.isFuture ? (
              <span className="week-day-value muted">—</span>
            ) : (
              <span className={target != null && d.calories > target ? 'week-day-value over' : 'week-day-value'}>
                {Math.round(d.calories)} kcal
              </span>
            )}
          </li>
        ))}
      </ul>
      {elapsedDays.length > 0 && (
        <p className="week-average">
          Average so far this week: <strong>{Math.round(average)} kcal/day</strong>
          {target != null && ` (target ${target})`}
        </p>
      )}
    </section>
  )
}
