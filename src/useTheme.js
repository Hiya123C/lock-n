// useTheme.js
import { useState, useEffect } from "react"

export function useTheme() {
  const [theme,   setTheme]   = useState("winter")
  const [snowKey, setSnowKey] = useState(0)

  useEffect(() => {
    const saved = localStorage.getItem("lockin_theme") || "winter"
    if (saved === "winter" || saved === "winter-theme") {
      // Normalize any old stored value
      document.body.removeAttribute("data-theme")
      localStorage.setItem("lockin_theme", "winter")
      setTheme("winter")
    } else {
      document.body.setAttribute("data-theme", saved)
      setTheme(saved)
    }
  }, [])

  const changeTheme = (newTheme) => {
    if (!newTheme || newTheme === "winter" || newTheme === "winter-theme") {
      document.body.removeAttribute("data-theme")
      setTheme("winter")
      setSnowKey(k => k + 1)
      localStorage.setItem("lockin_theme", "winter")
    } else {
      document.body.setAttribute("data-theme", newTheme)
      setTheme(newTheme)
      localStorage.setItem("lockin_theme", newTheme)
    }
  }

  return { theme, changeTheme, snowKey }
}