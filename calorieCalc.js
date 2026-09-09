// Standard vet-nutrition estimate for a dog's daily calorie needs.
//
// RER (Resting Energy Requirement) = 70 * (weight in kg) ^ 0.75
// Daily target = RER * a multiplier for how active Pablo is / what the goal is.
// These multipliers follow common veterinary nutrition guidance (WSAVA-style).

export const GOALS = [
  { id: 'loss', label: 'Weight loss', multiplier: 1.0 },
  { id: 'lowActive', label: 'Maintain — senior / less active', multiplier: 1.4 },
  { id: 'typical', label: 'Maintain — typical adult', multiplier: 1.6 },
  { id: 'gain', label: 'Weight gain / very active', multiplier: 1.8 },
]

export function restingEnergy(weightKg) {
  return 70 * Math.pow(weightKg, 0.75)
}

export function suggestedTarget(weightKg, goalId) {
  const goal = GOALS.find((g) => g.id === goalId) || GOALS[2]
  return Math.round(restingEnergy(weightKg) * goal.multiplier)
}
