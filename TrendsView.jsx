import { useEffect, useState } from 'react'
import WeightChart from './WeightChart.jsx'
import CalorieChart from './CalorieChart.jsx'
import { todayISO, daysAgoISO, addDays } from './dates.js'
import { watchSettings, watchWeightEntriesInRange, watchFoodEntriesInRange } from './db.js'

const RANGES = [
  { id: 7, label: '7d' },
  { id: 30, label: '30d' },
  { id: 90, label: '90d' },
]

export default function TrendsView({ uid }) {
  const [rangeDays, setRangeDays] = useState(7)
  const [settings, setSettings] = useState({})
  const [weightEntries, setWeightEntries] = useState([])
  const [foodEntries, setFoodEntries] = useState([])

  const rangeStart = daysAgoISO(rangeDays - 1)
  const rangeEnd = todayISO()

  useEffect(() => watchSettings(uid, setSettings), [uid])
  useEffect(
    () => watchWeightEntriesInRange(uid, rangeStart, rangeEnd, setWeightEntries),
    [uid, rangeStart, rangeEnd]
  )
  useEffect(
    () => watchFoodEntriesInRange(uid, rangeStart, rangeEnd, setFoodEntries),
    [uid, rangeStart, rangeEnd]
  )

  const dayBuckets = buildDayBuckets(rangeStart, rangeEnd, foodEntries)

  return (
    <div className="view">
      <div className="range-toggle">
        {RANGES.map((r) => (
          <button
            key={r.id}
            type="button"
            className={rangeDays === r.id ? 'range-btn active' : 'range-btn'}
            onClick={() => setRangeDays(r.id)}
          >
            {r.label}
          </button>
        ))}
      </div>

      <section className="card">
        <h2 className="card-title">Weight</h2>
        <WeightChart entries={weightEntries} rangeStart={rangeStart} rangeEnd={rangeEnd} />
      </section>

      <section className="card">
        <h2 className="card-title">Calories vs target</h2>
        <CalorieChart days={dayBuckets} target={settings.calorieTarget} />
      </section>
    </div>
  )
}

function buildDayBuckets(rangeStart, rangeEnd, foodEntries) {
  const totals = new Map()
  for (const e of foodEntries) {
    totals.set(e.date, (totals.get(e.date) || 0) + (e.calories || 0))
  }
  const days = []
  let cursor = rangeStart
  while (cursor <= rangeEnd) {
    days.push({ date: cursor, calories: totals.get(cursor) || 0 })
    cursor = addDays(cursor, 1)
  }
  return days
}
