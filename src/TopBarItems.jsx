// TopBarItems.jsx
import { useState } from "react"
import { THEMES } from "./StoreCatalogue"
import MusicPlayer from "./MusicPlayer"

export function ThemeMenu({ changeTheme, ownedThemes = [] }) {
  const [showThemes, setShowThemes] = useState(false)
  const available = THEMES.filter(t => ownedThemes.includes(t.id))

  return (
    <div
      className="icon"
      style={{ position: "relative" }}
      onMouseEnter={() => setShowThemes(true)}
      onMouseLeave={() => setShowThemes(false)}
    >
      <div className="drop-icons">
        <span className="material-symbols-outlined">palette</span>
      </div>
      {showThemes && (
        <>
          <div style={{ position: "absolute", top: "100%", left: 0, right: 0, height: "10px" }} />
          <div className="theme-menu regular-font" style={{ top: "calc(100% + 10px)" }}>
            {available.map(t => (
              <div
                key={t.id}
                onClick={() => {
                  changeTheme(t.themeAttr || "winter")
                  setShowThemes(false)
                }}
              >
                {t.name}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export function MusicButton({ musicState }) {
  const [showMusic, setShowMusic] = useState(false)

  return (
    <div style={{ position: "relative" }}>
      <button
        className="icon"
        onClick={() => setShowMusic(v => !v)}
        title="Music"
      >
        <span
          className="material-symbols-outlined"
          style={{ opacity: showMusic ? 1 : 0.6 }}
        >
          headphones
        </span>
      </button>

      {showMusic && (
        <div style={{
          position: "absolute",
          top: "calc(100% + 10px)",
          right: 0,
          zIndex: 700,
        }}>
          <MusicPlayer musicState={musicState} onClose={() => setShowMusic(false)} />
        </div>
      )}
    </div>
  )
}