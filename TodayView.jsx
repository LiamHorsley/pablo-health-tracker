import { useEffect, useState } from 'react'
import Stepper from './Stepper.jsx'
import { todayISO, addDays, formatDisplayDate } from './dates.js'
import {
  watchFoods,
  watchSettings,
  setCalorieTarget,
  watchFoodEntriesForDate,
  addFoodEntry,
  deleteFoodEntry,
  watchExerciseEntriesForDate,
  addExerciseEntry,
  deleteExerciseEntry,
  watchLatestWeightEntries,
  addWeightEntry,
  deleteWeightEntry,
} from './db.js'

const EXERCISE_TYPES = ['Walk', 'Run', 'Play', 'Training', 'Other']
const INTENSITIES = ['Low', 'Medium', 'High']

export default function TodayView({ uid, onGoToFoods }) {
  const [date, setDate] = useState(todayISO())

  const [foods, setFoods] = useState([])
  const [settings, setSettings] = useState({})
  const [foodEntries, setFoodEntries] = useState([])
  const [exerciseEntries, setExerciseEntries] = useState([])
  const [weightEntries, setWeightEntries] = useState([])

  useEffect(() => watchFoods(uid, setFoods), [uid])
  useEffect(() => watchSettings(uid, setSettings), [uid])
  useEffect(() => watchFoodEntriesForDate(uid, date, setFoodEntries), [uid, date])
  useEffect(() => watchExerciseEntriesForDate(uid, date, setExerciseEntries), [uid, date])
  useEffect(() => watchLatestWeightEntries(uid, setWeightEntries, 1), [uid])

  const totalCalories = foodEntries.reduce((sum, e) => sum + (e.calories || 0), 0)
  const isToday = date === todayISO()
  const latestWeight = weightEntries[0]

  return (
    <div className="view">
      <DateNav date={date} onChange={setDate} />

      <CalorieSummaryCard
        totalCalories={totalCalories}
        target={settings.calorieTarget}
        onSetTarget={(v) => setCalorieTarget(uid, v)}
      />

      <FoodLogCard
        date={date}
        foods={foods}
        entries={foodEntries}
        onAdd={(entry) => addFoodEntry(uid, { date, ...entry })}
        onDelete={(id) => deleteFoodEntry(uid, id)}
        onGoToFoods={onGoToFoods}
      />

      <ExerciseLogCard
        entries={exerciseEntries}
        onAdd={(entry) => addExerciseEntry(uid, { date, ...entry })}
        onDelete={(id) => deleteExerciseEntry(uid, id)}
      />

      <WeightCard
        isToday={isToday}
        date={date}
        latestWeight={latestWeight}
        onAdd={(weightKg) => addWeightEntry(uid, { date, weightKg })}
        onDeleteLatest={() => latestWeight && deleteWeightEntry(uid, latestWeight.id)}
      />
    </div>
  )
}

function DateNav({ date, onChange }) {
  const isToday = date === todayISO()
  return (
    <div className="date-nav">
      <button type="button" className="date-nav-btn" onClick={() => onChange(addDays(date, -1))} aria-label="Previous day">
        ‹
      </button>
      <div className="date-nav-label">{formatDisplayDate(date)}</div>
      <button
        type="button"
        className="date-nav-btn"
        onClick={() => onChange(addDays(date, 1))}
        disabled={isToday}
        aria-label="Next day"
      >
        ›
      </button>
    </div>
  )
}

function CalorieSummaryCard({ totalCalories, target, onSetTarget }) {
  const [editing, setEditing] = useState(false)
  const [draftTarget, setDraftTarget] = useState(target || 800)

  useEffect(() => {
    if (target != null) setDraftTarget(target)
  }, [target])

  const pct = target ? Math.min(100, Math.round((totalCalories / target) * 100)) : null
  const over = target != null && totalCalories > target

  return (
    <section className="card">
      <div className="calorie-summary">
        <div>
          <div className="calorie-total">{Math.round(totalCalories)} kcal</div>
          {target != null ? (
            <div className="calorie-target-line">
              target {target} kcal
              <button type="button" className="link-btn" onClick={() => setEditing(true)}>
                edit
              </button>
            </div>
          ) : (
            <button type="button" className="link-btn" onClick={() => setEditing(true)}>
              + set a daily target
            </button>
          )}
        </div>
      </div>

      {target != null && (
        <div className="progress-track">
          <div
            className={over ? 'progress-fill over' : 'progress-fill'}
            style={{ width: `${pct}%` }}
          />
        </div>
      )}

      {editing && (
        <div className="inline-edit-row">
          <Stepper value={draftTarget} onChange={setDraftTarget} step={10} min={0} suffix="kcal" ariaLabel="daily calorie target" />
          <button
            type="button"
            className="btn btn-primary btn-small"
            onClick={() => {
              onSetTarget(draftTarget)
              setEditing(false)
            }}
          >
            Save
          </button>
          <button type="button" className="btn btn-small" onClick={() => setEditing(false)}>
            Cancel
          </button>
        </div>
      )}
    </section>
  )
}

function FoodLogCard({ date, foods, entries, onAdd, onDelete, onGoToFoods }) {
  const [foodId, setFoodId] = useState('')
  const [quantity, setQuantity] = useState(0)

  useEffect(() => {
    if (foods.length && !foodId) {
      setFoodId(foods[0].id)
      setQuantity(foods[0].referenceAmount)
    }
  }, [foods]) // eslint-disable-line react-hooks/exhaustive-deps

  const selectedFood = foods.find((f) => f.id === foodId)
  const previewCalories = selectedFood
    ? (quantity / selectedFood.referenceAmount) * selectedFood.calories
    : 0

  function handleFoodChange(id) {
    setFoodId(id)
    const f = foods.find((food) => food.id === id)
    if (f) setQuantity(f.referenceAmount)
  }

  function handleAdd() {
    if (!selectedFood || !quantity) return
    onAdd({
      foodId: selectedFood.id,
      foodName: selectedFood.name,
      quantity,
      unit: selectedFood.referenceUnit,
      calories: previewCalories,
    })
  }

  return (
    <section className="card">
      <h2 className="card-title">Food</h2>

      {entries.length === 0 && (
        <p className="empty-state">
          {foods.length === 0
            ? 'No foods logged yet — Pablo has no foods set up either. '
            : 'Nothing logged yet today. '}
          {foods.length === 0 && (
            <button type="button" className="link-btn" onClick={onGoToFoods}>
              Add his first food
            </button>
          )}
        </p>
      )}

      {entries.length > 0 && (
        <ul className="entry-list">
          {entries.map((e) => (
            <li key={e.id} className="entry-row">
              <span className="entry-main">
                {e.foodName} — {formatQty(e.quantity)} {e.unit}
              </span>
              <span className="entry-value">{Math.round(e.calories)} kcal</span>
              <button type="button" className="entry-delete" onClick={() => onDelete(e.id)} aria-label={`Remove ${e.foodName} entry`}>
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}

      {foods.length > 0 && (
        <div className="add-row">
          <select value={foodId} onChange={(e) => handleFoodChange(e.target.value)} className="food-select">
            {foods.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>
          {selectedFood && (
            <Stepper
              value={quantity}
              onChange={setQuantity}
              step={selectedFood.referenceUnit === 'g' ? 10 : 0.5}
              min={0}
              suffix={selectedFood.referenceUnit}
              ariaLabel="quantity"
            />
          )}
          <span className="preview-calories">≈ {Math.round(previewCalories)} kcal</span>
          <button type="button" className="btn btn-primary" onClick={handleAdd} aria-label="Add food entry">
            + Add
          </button>
        </div>
      )}
    </section>
  )
}

function ExerciseLogCard({ entries, onAdd, onDelete }) {
  const [type, setType] = useState(EXERCISE_TYPES[0])
  const [minutes, setMinutes] = useState(30)
  const [intensity, setIntensity] = useState(INTENSITIES[0])

  function handleAdd() {
    if (!minutes) return
    onAdd({ type, minutes, intensity })
  }

  return (
    <section className="card">
      <h2 className="card-title">Exercise</h2>

      {entries.length === 0 && <p className="empty-state">No exercise logged yet today.</p>}

      {entries.length > 0 && (
        <ul className="entry-list">
          {entries.map((e) => (
            <li key={e.id} className="entry-row">
              <span className="entry-main">
                {e.type} · {e.intensity} intensity
              </span>
              <span className="entry-value">{e.minutes} min</span>
              <button type="button" className="entry-delete" onClick={() => onDelete(e.id)} aria-label={`Remove ${e.type} entry`}>
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="add-row">
        <select value={type} onChange={(e) => setType(e.target.value)}>
          {EXERCISE_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <Stepper value={minutes} onChange={setMinutes} step={5} min={0} suffix="min" ariaLabel="minutes" />
        <select value={intensity} onChange={(e) => setIntensity(e.target.value)}>
          {INTENSITIES.map((i) => (
            <option key={i} value={i}>
              {i}
            </option>
          ))}
        </select>
        <button type="button" className="btn btn-primary" onClick={handleAdd} aria-label="Add exercise entry">
          + Add
        </button>
      </div>
    </section>
  )
}

function WeightCard({ date, latestWeight, onAdd, onDeleteLatest }) {
  const [weight, setWeight] = useState(latestWeight?.weightKg || 12)

  useEffect(() => {
    if (latestWeight) setWeight(latestWeight.weightKg)
  }, [latestWeight?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <section className="card">
      <h2 className="card-title">Weight</h2>

      {latestWeight ? (
        <p className="latest-weight">
          Last recorded: <strong>{latestWeight.weightKg} kg</strong> on {formatDisplayDate(latestWeight.date)}
          <button type="button" className="entry-delete inline" onClick={onDeleteLatest} aria-label="Remove latest weight entry">
            ✕
          </button>
        </p>
      ) : (
        <p className="empty-state">No weight recorded yet — log Pablo's first weigh-in below.</p>
      )}

      <div className="add-row">
        <Stepper value={weight} onChange={setWeight} step={0.1} min={0} suffix="kg" ariaLabel="weight" />
        <button type="button" className="btn btn-primary" onClick={() => onAdd(weight)}>
          + Log weight for {formatDisplayDate(date)}
        </button>
      </div>
    </section>
  )
}

function formatQty(n) {
  return Number.isInteger(n) ? n : Number(n.toFixed(1))
}
