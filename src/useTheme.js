import { useState, useEffect, useRef } from "react"

export function useTheme() {
  const [theme, setTheme] = useState(
    document.body.getAttribute("data-theme") || "winter"
  )
  const snowKeyRef = useRef(0)  // increments each time winter is activated

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setTheme(document.body.getAttribute("data-theme") || "winter")
    })
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["data-theme"],
    })
    return () => observer.disconnect()
  }, [])

  const changeTheme = (newTheme) => {
    if (newTheme === "winter") {
      document.body.removeAttribute("data-theme")
      snowKeyRef.current += 1   // force Snowfall remount
    } else {
      document.body.setAttribute("data-theme", newTheme)
    }
  }

  return { theme, changeTheme, snowKey: snowKeyRef.current }
}