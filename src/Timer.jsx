// Timer.jsx

import { useState, useEffect, useRef } from "react"
import { calcCoinsEarned }  from "./useCoins"
import { useBreaks }        from "./useBreaks"
import { useFaceDetection } from "./useFaceDetection"
import SessionGoalModal     from "./SessionGoalModal"
import AbsenceWarning       from "./AbsenceWarning"
import BreakButton          from "./BreakButton"
import "./BreakButton.css"

const ENCOURAGEMENTS = [
  "STAY LOCKED IN!!",
  "you're doing great, keep it up",
  "stay locked in, you've got this",
  "every minute counts!",
  "--flow state activated--",
  "the grind is quiet but the results aren't 🔥",
  "breathe... focus!!!",
  "don't give up",
  "jia you!",
  "push through, just a bit longer",
]

function fmt(n) { return n.toString().padStart(2, "0") }

export default function Timer({ taskState, addCoins, spendCoins, onCameraReady, onStatusChange, urgentSuggestions = [] }) {
  const { tasks, addTask, clearAll, completedCount, totalCount } = taskState

  const [hours,       setHours]       = useState(0)
  const [minutes,     setMinutes]     = useState(25)
  const [showModal,   setShowModal]   = useState(false)
  const [totalSecs,   setTotalSecs]   = useState(0)
  const [secsLeft,    setSecsLeft]    = useState(0)
  const [running,     setRunning]     = useState(false)
  const [finished,    setFinished]    = useState(false)
  const [coinsEarned, setCoinsEarned] = useState(0)
  const [quoteIdx,    setQuoteIdx]    = useState(0)
  const [showConfirm, setShowConfirm] = useState(false)
  const [confetti,    setConfetti]    = useState([])
  const [absenceMode,      setAbsenceMode]      = useState("none")
  const [showTaskReminder, setShowTaskReminder] = useState(false)

  const tickRef  = useRef(null)
  const quoteRef = useRef(null)
  const tenMin   = useRef(0)

  const totalCountRef     = useRef(totalCount)
  const completedCountRef = useRef(completedCount)
  const totalSecsRef      = useRef(totalSecs)
  useEffect(() => { totalCountRef.current     = totalCount    }, [totalCount])
  useEffect(() => { completedCountRef.current = completedCount }, [completedCount])
  useEffect(() => { totalSecsRef.current      = totalSecs     }, [totalSecs])

  // ── Breaks ────────────────────────────────────────────
  // useBreaks() takes no args — initBreaks(sessionHours) called at Clock In
  const breaks = useBreaks()

  // ── Face detection ────────────────────────────────────
  // onStatusChange fires whenever detection status changes →
  // bubbled up via onCameraReady so LockInView can pass it to CameraWindow
  const faceDetection = useFaceDetection({
    enabled: running && !breaks.onBreak,
    onWarning: () => setAbsenceMode("warning"),
    onPenalty: () => { spendCoins(300); setAbsenceMode("penalty") },  // 300 coin penalty
    // Every status change (present/absent/loading) flows to LockInView → CameraWindow
    onStatusChange: (s) => onStatusChange?.(s),
  })

  // Pass start/stop refs to LockInView once on mount
  useEffect(() => {
    onCameraReady?.(faceDetection.startCamera, faceDetection.stopCamera, faceDetection.status)
  }, [faceDetection.startCamera, faceDetection.stopCamera, faceDetection.status])

  // ── Clock In → open goal modal ────────────────────────
  const handleClockInClick = () => {
    if (hours === 0 && minutes === 0) return
    setShowModal(true)
  }

  // ── Modal confirmed ───────────────────────────────────
  const handleModalConfirm = (newGoals) => {
    newGoals.forEach(g => addTask(g))
    setShowModal(false)
    const secs = hours * 3600 + minutes * 60
    setTotalSecs(secs)
    setSecsLeft(secs)
    setFinished(false)
    setRunning(true)
    tenMin.current = 0
    // FIX: initBreaks called HERE with actual session hours
    breaks.initBreaks(hours + minutes / 60)
  }

  // ── Countdown (paused on break) ───────────────────────
  useEffect(() => {
    if (!running || breaks.onBreak) {
      clearInterval(tickRef.current)
      return
    }
    tickRef.current = setInterval(() => {
      setSecsLeft(prev => {
        if (prev <= 1) {
          clearInterval(tickRef.current)
          clearInterval(quoteRef.current)
          setRunning(false)
          setFinished(true)
          const earned = calcCoinsEarned(
            totalSecsRef.current / 3600,
            totalCountRef.current,
            completedCountRef.current
          )
          setCoinsEarned(earned)
          if (earned > 0) addCoins(earned)
          spawnConfetti()
          return 0
        }
        // Flash task reminder at the 5-minute mark
        if (prev === 301) setShowTaskReminder(true)
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(tickRef.current)
  }, [running, breaks.onBreak])

  // ── Quote every 10 min ────────────────────────────────
  useEffect(() => {
    if (!running) return
    quoteRef.current = setInterval(() => {
      tenMin.current += 1
      setQuoteIdx(tenMin.current % ENCOURAGEMENTS.length)
    }, 10 * 60 * 1000)
    return () => clearInterval(quoteRef.current)
  }, [running])

  const confirmClockOut = () => {
    clearInterval(tickRef.current)
    clearInterval(quoteRef.current)
    faceDetection.stopCamera()
    setRunning(false)
    setShowConfirm(false)
    setSecsLeft(0)
    setAbsenceMode("none")
  }

  const handleAcceptPenalty = () => { confirmClockOut(); setAbsenceMode("none") }
  const handleDismissWarning = () => setAbsenceMode("none")

  const handleGoAgain = () => {
    setFinished(false)
    setCoinsEarned(0)
    clearAll()
    setAbsenceMode("none")
  }

  const spawnConfetti = () => {
    const pieces = Array.from({ length: 60 }, (_, i) => ({
      id: i, x: Math.random() * 100,
      color: ["#ffd6e0","#c9f0ff","#d4f5d4","#fff3cd","#e8d5ff"][i % 5],
      delay: Math.random() * 1.5, duration: 2 + Math.random() * 2,
      size: 6 + Math.random() * 8,
    }))
    setConfetti(pieces)
    setTimeout(() => setConfetti([]), 5000)
  }

  const dispH = fmt(Math.floor(secsLeft / 3600))
  const dispM = fmt(Math.floor((secsLeft % 3600) / 60))
  const dispS = fmt(secsLeft % 60)
  const progress  = totalSecs > 0 ? (totalSecs - secsLeft) / totalSecs : 0
  const remainH   = Math.floor(secsLeft / 3600)
  const remainM   = Math.floor((secsLeft % 3600) / 60)
  const remainTxt = remainH > 0 ? `${remainH}h ${remainM}m` : `${remainM}m`

  return (
    <div className="timer-wrapper">
      {confetti.map(p => (
        <div key={p.id} className="confetti-piece" style={{
          left: `${p.x}%`, backgroundColor: p.color,
          width: p.size, height: p.size,
          animationDelay: `${p.delay}s`, animationDuration: `${p.duration}s`,
        }} />
      ))}

      {running && !breaks.onBreak && (
        <div className="progress-bar-wrap">
          <div className="progress-bar-fill" style={{ width: `${progress * 100}%` }} />
        </div>
      )}

      {/* Setup */}
      {!running && !finished && (
        <div className="setup">
          <p className="setup-label">set your focus time</p>
          <div className="time-inputs">
            <div className="unit-input">
              <button onClick={() => setHours(h => Math.min(h + 1, 12))}>▲</button>
              <span className="digit-display">{fmt(hours)}</span>
              <button onClick={() => setHours(h => Math.max(h - 1, 0))}>▼</button>
              <span className="unit-label">hr</span>
            </div>
            <span className="colon">:</span>
            <div className="unit-input">
              <button onClick={() => setMinutes(m => Math.min(m + 5, 55))}>▲</button>
              <span className="digit-display">{fmt(minutes)}</span>
              <button onClick={() => setMinutes(m => Math.max(m - 5, 0))}>▼</button>
              <span className="unit-label">min</span>
            </div>
          </div>
          <button className="action-btn" onClick={handleClockInClick}>Clock In</button>
        </div>
      )}

      {/* Running */}
      {running && (
        <div className="running">
          {breaks.onBreak ? (
            // Bug fix 3: break countdown uses the same clock-face layout as main timer
            <>
              <p className="encouragement" style={{ marginBottom: 0 }}>☕ enjoy your break</p>
              <div className="clock-face">
                <span className="clock-digit">{String(Math.floor(breaks.breakSecsLeft / 60)).padStart(2,"0")}</span>
                <span className="clock-sep">:</span>
                <span className="clock-digit">{String(breaks.breakSecsLeft % 60).padStart(2,"0")}</span>
              </div>
              <button className="action-btn clockout-btn" onClick={breaks.endBreak}>
                end break early
              </button>
            </>
          ) : (
            <>
              <div className="clock-face">
                <span className="clock-digit">{dispH}</span>
                <span className="clock-sep">:</span>
                <span className="clock-digit">{dispM}</span>
                <span className="clock-sep">:</span>
                <span className="clock-digit">{dispS}</span>
              </div>
              <p className="encouragement">{ENCOURAGEMENTS[quoteIdx]}</p>
              <BreakButton {...breaks} />
              <button className="action-btn clockout-btn" onClick={() => setShowConfirm(true)}>
                Clock Out
              </button>
            </>
          )}
        </div>
      )}

      {/* Finished */}
      {finished && (
        <div className="finished">
          <p className="finish-emoji">🎉</p>
          <p className="finish-msg">session complete!</p>
          <p className="finish-sub">
            {coinsEarned > 0 ? `you earned ${coinsEarned} coins!` : "no goals completed — no coins this time."}
          </p>
          <p className="finish-tasks">{completedCount} of {totalCount} goals done</p>
          <button className="action-btn" onClick={handleGoAgain}>go again</button>
        </div>
      )}

      {showModal && (
        <SessionGoalModal
          initialGoals={tasks.map(t => t.text)}
          urgentSuggestions={urgentSuggestions}
          onConfirm={handleModalConfirm}
          onCancel={() => setShowModal(false)}
        />
      )}

      {/* ── 5-minute task reminder banner ── */}
      {showTaskReminder && running && (
        <div className="task-reminder-banner">
          <span>Remember to check off all completed tasks! Be honest :)</span>
          <button className="task-reminder-close" onClick={() => setShowTaskReminder(false)}>✕</button>
        </div>
      )}

      {showConfirm && (
        <div className="overlay">
          <div className="confirm-box">
            <p>are you sure? you have <strong>{remainTxt}</strong> left!</p>
            <div className="confirm-btns">
              <button className="action-btn" onClick={() => setShowConfirm(false)}>keep going</button>
              <button className="action-btn ghost-btn" onClick={confirmClockOut}>clock out</button>
            </div>
          </div>
        </div>
      )}

      {absenceMode !== "none" && (
        <AbsenceWarning
          mode={absenceMode}
          onDismiss={handleDismissWarning}
          onAcceptPenalty={handleAcceptPenalty}
        />
      )}
    </div>
  )
}