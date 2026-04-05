import { useState, useEffect } from "react"

export function useTheme() {
  const [theme, setTheme] = useState(
    document.body.getAttribute("data-theme") || "winter"
  )

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
    } else {
      document.body.setAttribute("data-theme", newTheme)
    }
  }

  return { theme, changeTheme }
}