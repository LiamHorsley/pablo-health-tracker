// Firestore data access. All data lives under users/{uid}/... so the
// security rules can lock everything to the signed-in user's own uid.
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  setDoc,
  getDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from './firebase.js'

// Sorts docs by their createdAt server timestamp, oldest first. A doc whose
// serverTimestamp() write hasn't been acknowledged yet reads back as null
// locally — treat that as "just now" so it sorts last, not first.
function sortByCreatedAt(docs) {
  const millis = (d) => (d.createdAt && typeof d.createdAt.toMillis === 'function' ? d.createdAt.toMillis() : Infinity)
  return [...docs].sort((a, b) => millis(a) - millis(b))
}

// ---------- Foods (reusable food list) ----------

export function foodsCollection(uid) {
  return collection(db, 'users', uid, 'foods')
}

export function watchFoods(uid, callback) {
  const q = query(foodsCollection(uid), orderBy('name'))
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
  })
}

export function addFood(uid, { name, referenceAmount, referenceUnit, calories }) {
  return addDoc(foodsCollection(uid), {
    name,
    referenceAmount,
    referenceUnit,
    calories,
    createdAt: serverTimestamp(),
  })
}

export function updateFood(uid, foodId, changes) {
  return updateDoc(doc(db, 'users', uid, 'foods', foodId), changes)
}

export function deleteFood(uid, foodId) {
  return deleteDoc(doc(db, 'users', uid, 'foods', foodId))
}

// ---------- Food log entries ----------

export function foodEntriesCollection(uid) {
  return collection(db, 'users', uid, 'foodEntries')
}

export function watchFoodEntriesForDate(uid, date, callback) {
  // Sorted client-side (not via Firestore orderBy) so this doesn't need a
  // composite index — the collection is tiny (a day's entries) so this is cheap.
  const q = query(foodEntriesCollection(uid), where('date', '==', date))
  return onSnapshot(q, (snap) => {
    callback(sortByCreatedAt(snap.docs.map((d) => ({ id: d.id, ...d.data() }))))
  })
}

export function watchFoodEntriesInRange(uid, startDate, endDate, callback) {
  const q = query(
    foodEntriesCollection(uid),
    where('date', '>=', startDate),
    where('date', '<=', endDate),
    orderBy('date')
  )
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
  })
}

export function addFoodEntry(uid, { date, foodId, foodName, quantity, unit, calories }) {
  return addDoc(foodEntriesCollection(uid), {
    date,
    foodId,
    foodName,
    quantity,
    unit,
    calories,
    createdAt: serverTimestamp(),
  })
}

export function deleteFoodEntry(uid, entryId) {
  return deleteDoc(doc(db, 'users', uid, 'foodEntries', entryId))
}

// ---------- Exercise log entries ----------

export function exerciseEntriesCollection(uid) {
  return collection(db, 'users', uid, 'exerciseEntries')
}

export function watchExerciseEntriesForDate(uid, date, callback) {
  const q = query(exerciseEntriesCollection(uid), where('date', '==', date))
  return onSnapshot(q, (snap) => {
    callback(sortByCreatedAt(snap.docs.map((d) => ({ id: d.id, ...d.data() }))))
  })
}

export function addExerciseEntry(uid, { date, type, minutes, intensity }) {
  return addDoc(exerciseEntriesCollection(uid), {
    date,
    type,
    minutes,
    intensity,
    createdAt: serverTimestamp(),
  })
}

export function deleteExerciseEntry(uid, entryId) {
  return deleteDoc(doc(db, 'users', uid, 'exerciseEntries', entryId))
}

// ---------- Weight entries ----------

export function weightEntriesCollection(uid) {
  return collection(db, 'users', uid, 'weightEntries')
}

export function watchWeightEntriesInRange(uid, startDate, endDate, callback) {
  const q = query(
    weightEntriesCollection(uid),
    where('date', '>=', startDate),
    where('date', '<=', endDate),
    orderBy('date')
  )
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
  })
}

export function watchLatestWeightEntries(uid, callback, max = 200) {
  // Simple approach: watch everything ordered by date; the app trims to
  // "latest" client-side. Pablo's log will never be large enough for this
  // to matter.
  const q = query(weightEntriesCollection(uid), orderBy('date', 'desc'))
  return onSnapshot(q, (snap) => {
    callback(snap.docs.slice(0, max).map((d) => ({ id: d.id, ...d.data() })))
  })
}

export function addWeightEntry(uid, { date, weightKg }) {
  return addDoc(weightEntriesCollection(uid), {
    date,
    weightKg,
    createdAt: serverTimestamp(),
  })
}

export function deleteWeightEntry(uid, entryId) {
  return deleteDoc(doc(db, 'users', uid, 'weightEntries', entryId))
}

// ---------- Settings (calorie target, goal weight) ----------

const SETTINGS_DOC = 'app'

export function watchSettings(uid, callback) {
  return onSnapshot(doc(db, 'users', uid, 'settings', SETTINGS_DOC), (snap) => {
    callback(snap.exists() ? snap.data() : {})
  })
}

export async function setCalorieTarget(uid, calorieTarget) {
  await setDoc(doc(db, 'users', uid, 'settings', SETTINGS_DOC), { calorieTarget }, { merge: true })
}

export async function setGoalWeight(uid, goalWeightKg) {
  await setDoc(doc(db, 'users', uid, 'settings', SETTINGS_DOC), { goalWeightKg }, { merge: true })
}

// ---------- Bulk food import (paste multiple at once) ----------

export async function addFoodsBulk(uid, foods) {
  await Promise.all(foods.map((food) => addFood(uid, food)))
}
