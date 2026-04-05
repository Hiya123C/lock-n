import { useState } from "react"
import { useNavigate } from "react-router-dom"
import Snowfall from "react-snowfall"
import { useTheme } from "./useTheme"
// import { ThemeMenu, MusicButton } from "./TopBarItems" unused

import "./App.css"

function App({ isPlaying, toggleMusic }) {
  const [hoverLock, setHoverLock] = useState(false)
  const { theme, changeTheme } = useTheme()
  
  const navigate = useNavigate()

  return (
    <div className="app">
      {theme === "winter" && (
        <Snowfall
          color="#ffffff"
          snowflakeCount={120}
          style={{
            position: "fixed",
            width: "100vw",
            height: "100vh",
            zIndex: 0,
          }}
        />
      )}

      <div className="top-bar">
        <div className="icon left">
          <span
            className="material-symbols-outlined lock-icon"
            onMouseEnter={() => setHoverLock(true)}
            onMouseLeave={() => setHoverLock(false)}
          >
            {hoverLock ? "lock" : "lock_open"}
          </span>
        </div>

        <div className="right-icons">
          {/* nothing works, so show nothin!!! */}

          {/* <ThemeMenu changeTheme={changeTheme} /> */}
          {/* <MusicButton isPlaying={isPlaying} toggleMusic={toggleMusic} /> */}
        </div>
      </div>

      <h1 className="title bold-font">Hey there!</h1>
      <h1 className="title bold-font">Ready to focus?</h1>

      <button className="start-btn regular-font" onClick={() => navigate("/lockin")}>
        Lock In
      </button>
      
    </div>
  )
}

export default App