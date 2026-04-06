// useCoins.js
// ─────────────────────────────────────────────
// Manages the student's coin balance.
// Persists to localStorage so coins survive page refreshes.
// Coin rules:
//   session < 1h  → 0 base (not applicable here, minimum is set by timer)
//   session 1h    → 100 coins (all goals), 30 (≥ half), 0 (none)
//   session 2h    → 250 coins (all goals), 70 (≥ half), 0 (none)
//   session ≥ 3h  → 400 coins (all goals), 100 (≥ half), 0 (none)
// ─────────────────────────────────────────────

import { useState } from "react"

const COIN_KEY = "lockin_coins"

export function calcCoinsEarned(sessionHours, totalTasks, completedTasks) {
  if (totalTasks === 0 || completedTasks === 0) return 0

  const allDone = completedTasks === totalTasks
  const halfDone = completedTasks >= Math.ceil(totalTasks / 2)

  let full, half
  if (sessionHours >= 3)      { full = 400; half = 100 }
  else if (sessionHours >= 2) { full = 250; half = 70  }
  else                        { full = 100; half = 30  }

  if (allDone)  return full
  if (halfDone) return half
  return 0
}

export function useCoins() {
  const [coins, setCoins] = useState(() => {
    const saved = localStorage.getItem(COIN_KEY)
    return saved ? parseInt(saved, 10) : 100000 //bugtesting: 100000
  })

  const addCoins = (amount) => {
    setCoins(prev => {
      const next = prev + amount
      localStorage.setItem(COIN_KEY, next)
      return next
    })
  }

  const spendCoins = (amount) => {
    setCoins(prev => {
      const next = Math.max(0, prev - amount)  // floor at 0, never block the deduction
      localStorage.setItem(COIN_KEY, next)
      return next
    })
  }

  const canAfford = (amount) => coins >= amount

  return { coins, addCoins, spendCoins, canAfford }
}