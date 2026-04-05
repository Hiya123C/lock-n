// LockInView.jsx

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
import PriorityMatrix      from "./PriorityMatrix"
import { usePriorityTasks } from "./usePriorityTasks"
import "./PriorityMatrix.css" 
import "./LockIn.css"
import "./Timer.css"

function LockInView({ musicState }) {
  const { theme, changeTheme } = useTheme()
  const { coins, addCoins, spendCoins, canAfford } = useCoins()

  const priorityStateRef = useRef(null)
  const taskState = useTasks(
    (text) => priorityStateRef.current?.completeByText(text, true),
    (text) => priorityStateRef.current?.completeByText(text, false),
  )
  const storeState = useStore(spendCoins)  // spendCoins needed for pet death penalty

  const priorityState = usePriorityTasks(
    (text, done) => taskState.syncFromPriority(text, done),
    (text)       => taskState.deleteByText(text),
  )

  priorityStateRef.current = priorityState

  const [showChecklist,  setShowChecklist]  = useState(false)
  const [showPriority,   setShowPriority]   = useState(false)
  const [showStore,     setShowStore]     = useState(false)
  const [showCamera,    setShowCamera]    = useState(false)
  const [hoverLock,     setHoverLock]     = useState(false)
  const [showCapsule,   setShowCapsule]   = useState(false)

  const startCameraRef = useRef(null)
  const stopCameraRef  = useRef(null)
  const [detectionStatus, setDetectionStatus] = useState("idle")


  const handleStatusChange = (s) => setDetectionStatus(s)
  const handleCameraReady = (startFn, stopFn, status) => {
    startCameraRef.current = startFn
    stopCameraRef.current  = stopFn
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
        >
          <div className="drop-icons">
            <span className="material-symbols-outlined lock-icon">
              {hoverLock ? "lock" : "lock_open"}
            </span>
          </div>

          {showCapsule && (
            <div className="capsule-menu">
              <span
                className="material-symbols-outlined capsule-icon"
                title="Priority Matrix"
                style={{ opacity: showPriority ? 1 : 0.6 }}
                onClick={() => setShowPriority(v => !v)}
              >grid_view</span>
              {/* Session checklist window */}
              <span
                className="material-symbols-outlined capsule-icon"
                title="Session Checklist"
                style={{ opacity: showChecklist ? 1 : 0.6 }}
                onClick={() => setShowChecklist(v => !v)}
              >checklist</span>
              <span
                className="material-symbols-outlined capsule-icon" title="Store"
                style={{ opacity: showStore ? 1 : 0.6 }}
                onClick={() => setShowStore(v => !v)}
              >storefront</span>
              <span
                className="material-symbols-outlined capsule-icon"
                title="Self Cam"
                style={{ opacity: showCamera ? 1 : 0.6 }}
                onClick={() => showCamera ? handleCameraClose() : setShowCamera(true)}
              >videocam</span>
              {/* <span
                className="material-symbols-outlined capsule-icon"
                title="More Apps"
                // style={{ opacity: showCamera ? 1 : 0.6 }}
                // onClick={() => showCamera ? handleCameraClose() : setShowCamera(true)}
              >apps</span> */}
            </div>
          )}
        </div>

        <div className="right-icons">
          <div className="coins">
            <span className="material-symbols-outlined coin-symbol">copyright</span>
            <span className="regular-font">{coins}</span>
          </div>
          <ThemeMenu changeTheme={changeTheme} ownedThemes={ownedThemes} />
          <MusicButton musicState={musicState} />
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
            urgentSuggestions={priorityState.urgentSuggestions}
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

      {showPriority && (
        <PriorityMatrix
          priorityState={priorityState}
          onClose={() => setShowPriority(false)}
          pushTask={(text) => taskState.addTask(text, true)}
        />
      )}

      <DecoLayer storeState={storeState} />
    </div>
  )
}

export default LockInView