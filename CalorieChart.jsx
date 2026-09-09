import { formatShortDate } from './dates.js'

const WIDTH = 320
const HEIGHT = 160
const PAD_LEFT = 34
const PAD_RIGHT = 12
const PAD_TOP = 14
const PAD_BOTTOM = 24

// days: [{ date: 'YYYY-MM-DD', calories }], ascending, one entry per day
// (already includes zero-calorie days for the full range).
export default function CalorieChart({ days, target }) {
  const hasAnyData = days.some((d) => d.calories > 0)
  if (!hasAnyData) {
    return <p className="empty-state">No food logged in this range yet.</p>
  }

  const innerW = WIDTH - PAD_LEFT - PAD_RIGHT
  const innerH = HEIGHT - PAD_TOP - PAD_BOTTOM

  const maxVal = Math.max(target || 0, ...days.map((d) => d.calories)) * 1.1 || 1

  const barGap = 3
  const barWidth = Math.max(2, innerW / days.length - barGap)

  function y(value) {
    return PAD_TOP + innerH - (value / maxVal) * innerH
  }

  const gridLines = [0, maxVal / 2, maxVal]

  return (
    <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="chart-svg" role="img" aria-label="Daily calories vs target">
      {gridLines.map((v, i) => (
        <g key={i}>
          <line x1={PAD_LEFT} x2={WIDTH - PAD_RIGHT} y1={y(v)} y2={y(v)} className="chart-gridline" />
          <text x={0} y={y(v) + 3} className="chart-axis-label">
            {Math.round(v)}
          </text>
        </g>
      ))}

      {days.map((d, i) => {
        const barX = PAD_LEFT + i * (barWidth + barGap)
        const barY = y(d.calories)
        const barH = PAD_TOP + innerH - barY
        const over = target != null && d.calories > target
        return (
          <rect
            key={d.date}
            x={barX}
            y={barY}
            width={barWidth}
            height={Math.max(0, barH)}
            className={over ? 'chart-bar over' : 'chart-bar'}
          >
            <title>
              {d.date}: {Math.round(d.calories)} kcal
            </title>
          </rect>
        )
      })}

      {target != null && (
        <line
          x1={PAD_LEFT}
          x2={WIDTH - PAD_RIGHT}
          y1={y(target)}
          y2={y(target)}
          className="chart-target-line"
        />
      )}

      <text x={PAD_LEFT} y={HEIGHT - 6} className="chart-axis-label" textAnchor="start">
        {formatShortDate(days[0].date)}
      </text>
      <text x={WIDTH - PAD_RIGHT} y={HEIGHT - 6} className="chart-axis-label" textAnchor="end">
        {formatShortDate(days[days.length - 1].date)}
      </text>
    </svg>
  )
}
