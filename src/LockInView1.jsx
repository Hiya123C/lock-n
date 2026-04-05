import { useState, useRef } from "react"
import Snowfall from "react-snowfall"
import { useTheme }        from "./useTheme"
import { ThemeMenu, MusicButton } from "./TopBarItems"
import { useTasks }        from "./useTasks"
import { useCoins }        from "./useCoins"
import { useStore }        from "./useStore"
import ChecklistWindow     from "./ChecklistWindow"
import Store               from "./StoreWindow"
import DecoLayer           from "./DecoLayer"
import CameraWindow        from "./CameraWindow"
import Timer               from "./Timer"
import "./LockIn.css"
import "./Timer.css"

function LockInView({ isPlaying, toggleMusic }) {
  const { theme, changeTheme }                     = useTheme()
  const { coins, addCoins, spendCoins, canAfford } = useCoins()
  const taskState  = useTasks()
  const storeState = useStore()

  const [showChecklist, setShowChecklist] = useState(false)
  const [showStore,     setShowStore]     = useState(false)
  const [showCamera,    setShowCamera]    = useState(false)
  const [hoverLock,     setHoverLock]     = useState(false)
  const [showCapsule,   setShowCapsule]   = useState(false)

  const startCameraRef = useRef(null)
  const stopCameraRef  = useRef(null)
  const [detectionStatus, setDetectionStatus] = useState("idle")
  // Called by Timer whenever face detection status changes
  const handleStatusChange = (s) => setDetectionStatus(s)

  const handleCameraReady = (startFn, stopFn, status) => {
    startCameraRef.current = startFn
    stopCameraRef.current  = stopFn
    // Update detection status so CameraWindow badge reflects real state
    if (status !== undefined) setDetectionStatus(status)
  }
  const handleVideoReady = (videoEl) => {
    startCameraRef.current?.(videoEl)
  }
  const handleCameraClose = () => {
    stopCameraRef.current?.()
    setShowCamera(false)
  }

  const ownedThemes = storeState.owned.filter(id => id.startsWith("theme_"))

  return (
    <div className="focus-page">
      {theme === "winter" && (
        <Snowfall
          color="#ffffff" snowflakeCount={120}
          style={{ position: "fixed", width: "100vw", height: "100vh", zIndex: 0 }}
        />
      )}

      <div className="top-bar">
        <div
          className="icon left capsule-host"
          onMouseEnter={() => { setHoverLock(true);  setShowCapsule(true)  }}
          onMouseLeave={() => { setHoverLock(false); setShowCapsule(false) }}
          // style={{
          //   //shift hover zone
          //   paddingBottom: showCapsule ? "230px" : "0",
          //   marginBottom:  showCapsule ? "-230px" : "0",
          // }}
          //not working
        >
          <div className="drop-icons">
            <span className="material-symbols-outlined lock-icon">
              {hoverLock ? "lock" : "lock_open"}
            </span>
          </div>

          {showCapsule && (
            <div className="capsule-menu">
              <span
                className="material-symbols-outlined capsule-icon" title="Checklist"
                style={{ opacity: showChecklist ? 1 : 0.6 }}
                onClick={() => setShowChecklist(v => !v)}
              >checklist</span>
              <span
                className="material-symbols-outlined capsule-icon" title="Store"
                style={{ opacity: showStore ? 1 : 0.6 }}
                onClick={() => setShowStore(v => !v)}
              >storefront</span>
              <span
                className="material-symbols-outlined capsule-icon" title="Self Cam"
                style={{ opacity: showCamera ? 1 : 0.6 }}
                onClick={() => showCamera ? handleCameraClose() : setShowCamera(true)}
              >videocam</span>
              <span
                className="material-symbols-outlined capsule-icon" title="More Apps"
                // style={{ opacity: showStore ? 1 : 0.6 }}
                // onClick={() => setShowStore(v => !v)}
              >apps</span>
            </div>
          )}
        </div>

        <div className="right-icons">
          <div className="coins">
            <span className="material-symbols-outlined coin-symbol">copyright</span>
            <span className="regular-font">{coins}</span>
          </div>
          <ThemeMenu changeTheme={changeTheme} ownedThemes={ownedThemes} />
          <MusicButton isPlaying={isPlaying} toggleMusic={toggleMusic} />
        </div>
      </div>

      <div className="body">
        <div className="main">
          <Timer
            taskState={taskState}
            addCoins={addCoins}
            spendCoins={spendCoins}
            onCameraReady={handleCameraReady}
            onStatusChange={handleStatusChange}
            showCamera={showCamera}
          />
        </div>
      </div>

      {showChecklist && (
        <ChecklistWindow {...taskState} onClose={() => setShowChecklist(false)} />
      )}
      {showStore && (
        <Store
          coins={coins} spendCoins={spendCoins} canAfford={canAfford}
          onClose={() => setShowStore(false)} storeState={storeState}
        />
      )}
      {showCamera && (
        <CameraWindow
          onClose={handleCameraClose}
          onVideoReady={handleVideoReady}
          detectionStatus={detectionStatus}
        />
      )}

      <DecoLayer storeState={storeState} />
    </div>
  )
}

export default LockInView