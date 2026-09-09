// A number input paired with +/- buttons, per the app's UX rule: editable
// numeric fields always get steppers alongside direct typing.
export default function Stepper({
  value,
  onChange,
  step = 1,
  min = 0,
  max = Infinity,
  suffix,
  ariaLabel,
}) {
  function clamp(n) {
    if (Number.isNaN(n)) return min
    return Math.min(max, Math.max(min, n))
  }

  function bump(delta) {
    const next = clamp(round(value + delta))
    onChange(next)
  }

  function round(n) {
    // Avoid floating point artifacts like 0.30000000000000004
    const decimals = String(step).includes('.') ? String(step).split('.')[1].length : 0
    return Number(n.toFixed(decimals))
  }

  return (
    <div className="stepper">
      <button
        type="button"
        className="stepper-btn"
        onClick={() => bump(-step)}
        aria-label={`Decrease ${ariaLabel || 'value'}`}
      >
        −
      </button>
      <input
        type="number"
        className="stepper-input"
        value={value}
        step={step}
        min={min}
        max={max === Infinity ? undefined : max}
        aria-label={ariaLabel}
        onChange={(e) => {
          const n = parseFloat(e.target.value)
          onChange(clamp(Number.isNaN(n) ? min : n))
        }}
      />
      {suffix && <span className="stepper-suffix">{suffix}</span>}
      <button
        type="button"
        className="stepper-btn"
        onClick={() => bump(step)}
        aria-label={`Increase ${ariaLabel || 'value'}`}
      >
        +
      </button>
    </div>
  )
}
