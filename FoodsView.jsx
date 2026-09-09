import { useEffect, useState } from 'react'
import Stepper from './Stepper.jsx'
import { watchFoods, addFood, updateFood, deleteFood } from './db.js'

export default function FoodsView({ uid }) {
  const [foods, setFoods] = useState([])

  useEffect(() => watchFoods(uid, setFoods), [uid])

  return (
    <div className="view">
      <section className="card">
        <h2 className="card-title">Pablo's foods</h2>

        {foods.length === 0 && (
          <p className="empty-state">Nothing here yet — add Pablo's first food below.</p>
        )}

        {foods.length > 0 && (
          <ul className="food-list">
            {foods.map((f) => (
              <FoodRow key={f.id} food={f} onUpdate={(changes) => updateFood(uid, f.id, changes)} onDelete={() => deleteFood(uid, f.id)} />
            ))}
          </ul>
        )}

        <AddFoodForm onAdd={(food) => addFood(uid, food)} />
      </section>
    </div>
  )
}

function FoodRow({ food, onUpdate, onDelete }) {
  const [name, setName] = useState(food.name)
  const [referenceAmount, setReferenceAmount] = useState(food.referenceAmount)
  const [referenceUnit, setReferenceUnit] = useState(food.referenceUnit)
  const [calories, setCalories] = useState(food.calories)

  useEffect(() => {
    setName(food.name)
    setReferenceAmount(food.referenceAmount)
    setReferenceUnit(food.referenceUnit)
    setCalories(food.calories)
  }, [food.id, food.name, food.referenceAmount, food.referenceUnit, food.calories])

  function saveIfChanged(field, value) {
    if (value !== food[field] && value !== '' && value != null) {
      onUpdate({ [field]: value })
    }
  }

  return (
    <li className="food-row">
      <div className="food-row-top">
        <input
          className="food-name-input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={() => saveIfChanged('name', name)}
          aria-label="Food name"
        />
        <button type="button" className="entry-delete" onClick={onDelete} aria-label={`Delete ${food.name}`}>
          ✕
        </button>
      </div>
      <div className="food-row-fields">
        <label className="mini-field">
          <span>Calories per</span>
          <input
            type="number"
            className="mini-input"
            value={referenceAmount}
            min={0}
            onChange={(e) => setReferenceAmount(parseFloat(e.target.value) || 0)}
            onBlur={() => saveIfChanged('referenceAmount', referenceAmount)}
          />
        </label>
        <label className="mini-field">
          <span>unit</span>
          <input
            className="mini-input mini-input-text"
            value={referenceUnit}
            onChange={(e) => setReferenceUnit(e.target.value)}
            onBlur={() => saveIfChanged('referenceUnit', referenceUnit)}
          />
        </label>
        <label className="mini-field">
          <span>=</span>
          <input
            type="number"
            className="mini-input"
            value={calories}
            min={0}
            onChange={(e) => setCalories(parseFloat(e.target.value) || 0)}
            onBlur={() => saveIfChanged('calories', calories)}
          />
        </label>
        <span>kcal</span>
      </div>
    </li>
  )
}

function AddFoodForm({ onAdd }) {
  const [name, setName] = useState('')
  const [referenceAmount, setReferenceAmount] = useState(100)
  const [referenceUnit, setReferenceUnit] = useState('g')
  const [calories, setCalories] = useState(0)

  function handleAdd() {
    if (!name.trim() || !calories) return
    onAdd({ name: name.trim(), referenceAmount, referenceUnit, calories })
    setName('')
    setCalories(0)
  }

  return (
    <div className="add-food-form">
      <label className="field-label" htmlFor="new-food-name">
        Food name
      </label>
      <input
        id="new-food-name"
        placeholder="e.g. Chicken breast"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <div className="food-row-fields">
        <label className="mini-field">
          <span>Calories per</span>
          <Stepper value={referenceAmount} onChange={setReferenceAmount} step={10} min={0} ariaLabel="reference amount" />
        </label>
        <label className="mini-field">
          <span>unit</span>
          <input
            className="mini-input mini-input-text"
            value={referenceUnit}
            onChange={(e) => setReferenceUnit(e.target.value)}
          />
        </label>
      </div>
      <label className="mini-field">
        <span>Calories for that amount</span>
        <Stepper value={calories} onChange={setCalories} step={5} min={0} suffix="kcal" ariaLabel="calories" />
      </label>

      <button type="button" className="btn btn-primary" onClick={handleAdd}>
        + Add food
      </button>
    </div>
  )
}
