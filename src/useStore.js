// useStore.js
import { useState, useEffect } from "react"

const KEYS = {
  owned:        "lockin_owned",
  active:       "lockin_active_deco",
  petNames:     "lockin_pet_names",
  petHearts:    "lockin_pet_hearts",
  petFedAt:     "lockin_pet_fed_at",
  petZeroAt:    "lockin_pet_zero_at",
  animations:   "lockin_animations",
  foodQuantity: "lockin_food_qty",
}

const HEARTS_MAX      = 5
const DRAIN_INTERVAL  = 2 * 60 * 60 * 1000
const DEATH_THRESHOLD = 5 * 24 * 60 * 60 * 1000
const FOOD_HEARTS     = { food_fish: 2 }
const DEFAULT_OWNED   = ["theme_winter"]

const load = (key, fallback) => {
  try {
    const v = localStorage.getItem(key)
    return v ? JSON.parse(v) : fallback
  } catch {
    return fallback
  }
}

const ensureWinterOwned = () => {
  try {
    const raw   = localStorage.getItem(KEYS.owned)
    const owned = raw ? JSON.parse(raw) : DEFAULT_OWNED
    if (!Array.isArray(owned)) return DEFAULT_OWNED
    if (!owned.includes("theme_winter")) {
      const next = ["theme_winter", ...owned]
      localStorage.setItem(KEYS.owned, JSON.stringify(next))
      return next
    }
    return owned
  } catch {
    return DEFAULT_OWNED
  }
}

const save = (key, val) => localStorage.setItem(key, JSON.stringify(val))

export function useStore(spendCoins) {
  const [owned,        setOwned]        = useState(() => ensureWinterOwned())
  const [active,       setActive]       = useState(() => load(KEYS.active,       {}))
  const [petNames,     setPetNames]     = useState(() => load(KEYS.petNames,     {}))
  const [petHearts,    setPetHearts]    = useState(() => load(KEYS.petHearts,    {}))
  const [petFedAt,     setPetFedAt]     = useState(() => load(KEYS.petFedAt,     {}))
  const [petZeroAt,    setPetZeroAt]    = useState(() => load(KEYS.petZeroAt,    {}))
  const [animations,   setAnimations]   = useState(() => load(KEYS.animations,   {}))
  const [foodQuantity, setFoodQuantity] = useState(() => load(KEYS.foodQuantity, {}))

  // ── Heart drain + death check on mount and every 5 min ──
  useEffect(() => {
    const checkHearts = () => {
      const now  = Date.now()
      const pets = owned.filter(id => id.startsWith("pet_"))
      if (pets.length === 0) return

      setPetHearts(prev => {
        const next = { ...prev }
        pets.forEach(petId => {
          const lastFed   = petFedAt[petId] ?? now
          const hoursGone = (now - lastFed) / DRAIN_INTERVAL
          const drain     = Math.floor(hoursGone)
          const current   = prev[petId] ?? HEARTS_MAX
          next[petId]     = Math.max(0, current - drain)
        })
        save(KEYS.petHearts, next)
        return next
      })

      setPetZeroAt(prev => {
        const next = { ...prev }
        pets.forEach(petId => {
          const hearts = petHearts[petId] ?? HEARTS_MAX
          if (hearts <= 0) {
            if (!prev[petId]) {
              next[petId] = now
              save(KEYS.petZeroAt, next)
            } else if (now - prev[petId] >= DEATH_THRESHOLD) {
              spendCoins?.(800)
              setOwned(o => { const n = o.filter(id => id !== petId); save(KEYS.owned, n); return n })
              setActive(a => { const n = { ...a }; delete n[petId]; save(KEYS.active, n); return n })
              delete next[petId]
            }
          } else {
            if (prev[petId]) { delete next[petId]; save(KEYS.petZeroAt, next) }
          }
        })
        return next
      })
    }

    checkHearts()
    const interval = setInterval(checkHearts, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [owned, petFedAt])

  const buyItem = (itemId) => setOwned(prev => {
    if (itemId.startsWith("food_")) {
      setFoodQuantity(q => { const n = { ...q, [itemId]: (q[itemId] ?? 0) + 1 }; save(KEYS.foodQuantity, n); return n })
      if (prev.includes(itemId)) return prev
    }
    if (!itemId.startsWith("food_") && prev.includes(itemId)) return prev
    const next = [...prev, itemId]; save(KEYS.owned, next)
    if (itemId.startsWith("pet_")) {
      setPetHearts(h => { const n = { ...h, [itemId]: 0 }; save(KEYS.petHearts, n); return n })
    }
    return next
  })
  const isOwned = (itemId) => owned.includes(itemId)

  const placeItem     = (itemId, pos = { x: 200, y: 200 }) => setActive(prev => { const next = { ...prev, [itemId]: pos }; save(KEYS.active, next); return next })
  const removeItem    = (itemId) => setActive(prev => { const next = { ...prev }; delete next[itemId]; save(KEYS.active, next); return next })
  const updateItemPos = (itemId, pos) => setActive(prev => { const next = { ...prev, [itemId]: pos }; save(KEYS.active, next); return next })
  const isActive      = (itemId) => itemId in active

  const namePet    = (petId, name) => setPetNames(prev => { const next = { ...prev, [petId]: name }; save(KEYS.petNames, next); return next })
  const getPetName = (petId) => petNames[petId] || null

  const feedPet = (petId, foodId) => {
    if (!foodId) return
    const qty = foodQuantity[foodId] ?? 0
    if (qty <= 0) return
    const gain = FOOD_HEARTS[foodId] ?? 1
    setFoodQuantity(prev => { const next = { ...prev, [foodId]: Math.max(0, (prev[foodId] ?? 0) - 1) }; save(KEYS.foodQuantity, next); return next })
    setPetHearts(prev => { const next = { ...prev, [petId]: Math.min(HEARTS_MAX, (prev[petId] ?? 0) + gain) }; save(KEYS.petHearts, next); return next })
    setPetFedAt(prev => { const next = { ...prev, [petId]: Date.now() }; save(KEYS.petFedAt, next); return next })
    setPetZeroAt(prev => { if (!prev[petId]) return prev; const next = { ...prev }; delete next[petId]; save(KEYS.petZeroAt, next); return next })
  }

  const getFoodQuantity = (foodId) => foodQuantity[foodId] ?? 0
  const getPetHearts    = (petId)  => petHearts[petId] ?? HEARTS_MAX
  const isPetHungry     = (petId)  => (petHearts[petId] ?? HEARTS_MAX) < HEARTS_MAX

  const setAnimation = (itemId, animId) => setAnimations(prev => { const next = { ...prev, [itemId]: animId }; save(KEYS.animations, next); return next })
  const getAnimation = (itemId) => animations[itemId] ?? null

  return {
    owned, buyItem, isOwned,
    active, placeItem, removeItem, updateItemPos, isActive,
    petNames, namePet, getPetName,
    feedPet, getFoodQuantity, getPetHearts, isPetHungry,
    animations, setAnimation, getAnimation,
    foodQuantity,
  }
}