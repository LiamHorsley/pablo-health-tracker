import { fromISO, formatShortDate } from './dates.js'

const WIDTH = 320
const HEIGHT = 160
const PAD_LEFT = 34
const PAD_RIGHT = 12
const PAD_TOP = 14
const PAD_BOTTOM = 24

// entries: [{ date: 'YYYY-MM-DD', weightKg }], ascending by date.
// rangeStart/rangeEnd: ISO date strings bounding the x-axis.
export default function WeightChart({ entries, rangeStart, rangeEnd }) {
  if (entries.length === 0) {
    return <p className="empty-state">No weight logged in this range yet.</p>
  }

  const startMs = fromISO(rangeStart).getTime()
  const endMs = fromISO(rangeEnd).getTime()
  const span = Math.max(1, endMs - startMs)

  const values = entries.map((e) => e.weightKg)
  let min = Math.min(...values)
  let max = Math.max(...values)
  if (min === max) {
    min -= 1
    max += 1
  }
  const pad = (max - min) * 0.15
  min -= pad
  max += pad

  const innerW = WIDTH - PAD_LEFT - PAD_RIGHT
  const innerH = HEIGHT - PAD_TOP - PAD_BOTTOM

  function x(dateStr) {
    const t = fromISO(dateStr).getTime()
    return PAD_LEFT + ((t - startMs) / span) * innerW
  }
  function y(value) {
    return PAD_TOP + innerH - ((value - min) / (max - min)) * innerH
  }

  const points = entries.map((e) => ({ x: x(e.date), y: y(e.weightKg), entry: e }))
  const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ')

  const gridLines = [min, (min + max) / 2, max]
  const first = entries[0]
  const last = entries[entries.length - 1]

  return (
    <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="chart-svg" role="img" aria-label="Weight over time">
      {gridLines.map((v, i) => (
        <g key={i}>
          <line x1={PAD_LEFT} x2={WIDTH - PAD_RIGHT} y1={y(v)} y2={y(v)} className="chart-gridline" />
          <text x={0} y={y(v) + 3} className="chart-axis-label">
            {v.toFixed(1)}
          </text>
        </g>
      ))}

      <path d={path} className="chart-line" fill="none" />

      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={3} className="chart-dot" />
      ))}

      <text x={PAD_LEFT} y={HEIGHT - 6} className="chart-axis-label" textAnchor="start">
        {formatShortDate(first.date)}
      </text>
      <text x={WIDTH - PAD_RIGHT} y={HEIGHT - 6} className="chart-axis-label" textAnchor="end">
        {formatShortDate(last.date)}
      </text>
    </svg>
  )
}
