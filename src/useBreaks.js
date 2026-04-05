// useBreaks.js
// ─────────────────────────────────────────────
// Fixes:
//   1. Break countdown now shows ALL credit (e.g. 20 min), not capped at 10
//   2. breakStartRef is set synchronously so endBreak calculates used time correctly
// ─────────────────────────────────────────────

import { useState, useRef, useEffect, useCallback } from "react"

export function useBreaks() {
  const [creditMin,     setCreditMin]     = useState(0)
  const [onBreak,       setOnBreak]       = useState(false)
  const [breakSecsLeft, setBreakSecsLeft] = useState(0)

  const breakTickRef  = useRef(null)
  const breakStartRef = useRef(null) // set SYNCHRONOUSLY in startBreak

  // Called when Clock In is confirmed — sets total break credit
  const initBreaks = useCallback((sessionHours) => {
    const totalBreaks = Math.floor(sessionHours)       // 1 break per whole hour
    const totalMin    = totalBreaks * 10               // 10 min credit per break
    setCreditMin(totalMin)
    setOnBreak(false)
    setBreakSecsLeft(0)
    breakStartRef.current = null
  }, [])

  const startBreak = useCallback(() => {
    setCreditMin(prev => {
      if (prev < 1) return prev

      // Bug fix 1: use ALL remaining credit as the countdown, not capped at 10
      const slotSecs = Math.floor(prev * 60)
      setBreakSecsLeft(slotSecs)
      setOnBreak(true)

      // Bug fix 2: set start time SYNCHRONOUSLY here, not inside updater
      // (updater runs async, so breakStartRef would be stale in endBreak)
      breakStartRef.current = Date.now()

      return prev // credit deducted when break ends
    })
  }, [])

  const endBreak = useCallback(() => {
    clearInterval(breakTickRef.current)

    // Calculate how many minutes were actually used
    const usedMs  = breakStartRef.current ? Date.now() - breakStartRef.current : 0
    const usedMin = usedMs / 1000 / 60

    setCreditMin(prev => Math.max(0, prev - usedMin))
    setOnBreak(false)
    setBreakSecsLeft(0)
    breakStartRef.current = null
  }, [])

  // Break countdown tick
  useEffect(() => {
    if (!onBreak) return
    breakTickRef.current = setInterval(() => {
      setBreakSecsLeft(prev => {
        if (prev <= 1) { endBreak(); return 0 }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(breakTickRef.current)
  }, [onBreak, endBreak])

  return {
    onBreak,
    breakSecsLeft,
    // Round UP for display so "0 min" only shows when truly empty
    breakCreditDisplay: Math.max(0, Math.ceil(creditMin)),
    canBreak: creditMin >= 1 && !onBreak,
    startBreak,
    endBreak,
    initBreaks,
  }
}